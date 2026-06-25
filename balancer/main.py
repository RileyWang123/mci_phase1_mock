"""FastAPI service for AI line balancing (station splitting).

Endpoints:
  GET  /health
  POST /generate   { targetCt, totalHc, steps[] } -> { targetCt, totalHc, plans[] }

The LLM only assigns steps to stations; ST / bottleneck / LBR are computed here.
"""
import json
import os
import re

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from prompts import build_station_balancing_prompt

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_BASE_URL = os.environ.get(
    "GEMINI_BASE_URL",
    "https://google-gemini.prod.ai-gateway.quantumblack.com/00e1965c-2aac-49de-a6cf-9ace08781d0b",
)
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")

app = FastAPI(title="MCI Station Balancer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Step(BaseModel):
    stepNo: str
    actualPt: float = 0
    automation: str = "M"
    workflow: str = ""
    description: str = ""


class GenerateRequest(BaseModel):
    targetCt: float
    totalHc: float = 0
    steps: list[Step]


def _generate_content_urls(base_url: str, model: str) -> list[str]:
    base = base_url.rstrip("/")
    return [
        f"{base}/v1beta/models/{model}:generateContent",
        f"{base}/v1/models/{model}:generateContent",
        f"{base}/models/{model}:generateContent",
    ]


def _extract_json(text: str) -> dict:
    stripped = re.sub(r"^```(?:json)?\s*", "", text.strip())
    stripped = re.sub(r"\s*```$", "", stripped).strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        start = stripped.find("{")
        end = stripped.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("AI response did not contain JSON")
        return json.loads(stripped[start : end + 1])


async def _call_gemini(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is required")
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"},
    }
    headers = {"content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY}
    last_error = None
    async with httpx.AsyncClient(timeout=120) as client:
        for url in _generate_content_urls(GEMINI_BASE_URL, GEMINI_MODEL):
            resp = await client.post(f"{url}?key={GEMINI_API_KEY}", json=body, headers=headers)
            if resp.status_code != 200:
                last_error = f"Gemini failed {resp.status_code}: {resp.text[:500]}"
                continue
            payload = resp.json()
            parts = payload.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            text = "\n".join(p.get("text", "") for p in parts) or resp.text
            return _extract_json(text)
    raise HTTPException(status_code=502, detail=last_error or "Gemini station balancing failed")


def _enrich_plan(plan: dict, step_ct: dict, target_ct: float) -> dict:
    stations = []
    for i, st in enumerate(plan.get("stations", [])):
        step_nos = st.get("stepNos", []) or []
        station_time = sum(float(step_ct.get(no, 0)) for no in step_nos)
        stations.append(
            {
                "stationNo": st.get("stationNo", i + 1),
                "name": str(st.get("name", f"Station {i + 1}")),
                "automation": "A" if st.get("automation") == "A" else "M",
                "stepNos": step_nos,
                "st": round(station_time, 1),
                "overTarget": target_ct > 0 and station_time > target_ct,
            }
        )

    station_count = len(stations)
    bottleneck = max((s["st"] for s in stations), default=0)
    total_ct = sum(s["st"] for s in stations)
    lbr = (total_ct / (station_count * bottleneck) * 100) if station_count and bottleneck else 0

    return {
        "name": plan.get("name", "Plan"),
        "strategy": plan.get("strategy", ""),
        "stations": stations,
        "stationCount": station_count,
        "bottleneckSt": round(bottleneck, 1),
        "totalCt": round(total_ct, 1),
        "targetCt": target_ct,
        "lbr": round(lbr, 1),
        "lossRate": round(100 - lbr, 1),
        "overTargetCount": sum(1 for s in stations if s["overTarget"]),
    }


@app.get("/health")
async def health():
    return {"status": "ok", "model": GEMINI_MODEL}


@app.post("/generate")
async def generate(req: GenerateRequest):
    if not req.steps:
        raise HTTPException(status_code=400, detail="steps are required")
    if req.targetCt <= 0:
        raise HTTPException(status_code=400, detail="a positive targetCt is required")

    steps = [s.model_dump() for s in req.steps]
    prompt = build_station_balancing_prompt(req.targetCt, req.totalHc, steps)
    raw = await _call_gemini(prompt)

    step_ct = {s["stepNo"]: float(s["actualPt"]) for s in steps}
    plans = [_enrich_plan(p, step_ct, req.targetCt) for p in raw.get("plans", [])]
    if not plans:
        raise HTTPException(status_code=502, detail="AI returned no station plans")

    return {"targetCt": req.targetCt, "totalHc": req.totalHc, "plans": plans}
