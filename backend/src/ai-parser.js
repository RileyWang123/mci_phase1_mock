import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildAssemblyVideoPrompt } from "./prompts/assembly-video-prompt.js";

const execFileAsync = promisify(execFile);

// Authoritative, deterministic video length via ffprobe. Returns seconds (rounded) or null.
export async function getVideoDurationSec(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const seconds = Number(String(stdout).trim());
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : null;
  } catch (_error) {
    return null;
  }
}

// Scale every microStep's PT so the whole video's steps sum exactly to the real file duration.
// AI supplies the relative split; the file length is the source of truth for the total.
export function scaleToRealDuration(result, realDuration) {
  if (!realDuration || realDuration <= 0) return result;
  const micros = (result.workflows || []).flatMap((w) => w.microSteps || []);
  if (!micros.length) return result;

  const weights = micros.map((m) => Math.max(0, Number(m.theoreticalPt) || 0));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  // If the AI gave no usable relative split, fall back to an even distribution.
  const evenShare = realDuration / micros.length;
  const raw = micros.map((_, i) => (weightSum > 0 ? (weights[i] / weightSum) * realDuration : evenShare));

  // Round to integers while preserving the exact total (largest-remainder method).
  const floored = raw.map((v) => Math.floor(v));
  let remainder = realDuration - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const finalPt = floored.slice();
  for (let k = 0; k < order.length && remainder > 0; k++) {
    finalPt[order[k].i] += 1;
    remainder -= 1;
  }

  micros.forEach((m, i) => {
    const pt = Math.max(1, finalPt[i]); // every observed action is at least 1s
    m.theoreticalPt = pt;
    m.actualPt = pt;
  });
  result.videoDurationSec = realDuration;
  return result;
}

const DEFAULT_MODEL = "gemini-2.0-flash";
const DEFAULT_INLINE_VIDEO_BYTES = 20 * 1024 * 1024;

function stripCodeFence(text) {
  return String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function extractJsonFromText(text) {
  const stripped = stripCodeFence(text);
  if (!stripped) throw new Error("AI response was empty");
  try {
    return JSON.parse(stripped);
  } catch (_error) {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("AI response did not contain JSON");
    return JSON.parse(stripped.slice(start, end + 1));
  }
}

// Parse a timestamp into seconds. Accepts "mm:ss", "hh:mm:ss", or a plain number.
export function parseTimeToSeconds(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value).trim();
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
  const parts = text.split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

function normalizeMicroStep(rawStep = {}, index = 0) {
  let description = rawStep.description || rawStep.stepDescription || rawStep.action || rawStep[0] || `Extracted action ${index + 1}`;
  const partName = rawStep.partName || rawStep.part || rawStep.material || rawStep[1] || "TBD";

  // VA/NVA tag: structured field from the AI, appended to the description for display.
  const rawType = String(rawStep.valueType || "").toUpperCase();
  const valueType = rawType === "VA" ? "VA" : rawType === "NVA" ? "NVA" : "";
  if (valueType && !/\b(VA|NVA)\s*$/i.test(String(description).trim())) {
    description = `${String(description).trim()} ${valueType}`;
  }

  const startSec = parseTimeToSeconds(rawStep.startTime ?? rawStep.start);
  const endSec = parseTimeToSeconds(rawStep.endTime ?? rawStep.end);
  // Real duration from the (non-sped-up) video timeline, when both timestamps are valid and ordered.
  const videoDuration = startSec != null && endSec != null && endSec > startSec ? endSec - startSec : null;

  // The measured duration from the (non-sped-up) video is the theoretical PT.
  // Fall back to the AI's theoreticalPt only when timestamps are missing/invalid.
  const theoreticalPt = videoDuration != null
    ? Math.round(videoDuration)
    : Number(rawStep.theoreticalPt ?? rawStep.pt ?? rawStep[2] ?? 6) || 6;
  const actualPt = Number(rawStep.actualPt ?? rawStep[4] ?? theoreticalPt) || theoreticalPt;

  return {
    description: String(description).trim(),
    partName: String(partName).trim(),
    automation: rawStep.automation === "A" ? "A" : "M",
    valueType,
    theoreticalPt,
    actualPt,
    evidence: rawStep.evidence || "",
  };
}

function normalizeWorkflow(rawWorkflow = {}, index = 0) {
  const id = String(rawWorkflow.id || rawWorkflow.stepId || (index + 1) * 10).padStart(3, "0");
  const microSteps = Array.isArray(rawWorkflow.microSteps) ? rawWorkflow.microSteps : [];
  return {
    id,
    process: String(rawWorkflow.process || rawWorkflow.title || `Video Workflow ${index + 1}`).trim(),
    detail: String(rawWorkflow.detail || rawWorkflow.description || "Generated from assembly video.").trim(),
    station: String(rawWorkflow.station || rawWorkflow.stationArea || "Video extracted station").trim(),
    material: String(rawWorkflow.material || rawWorkflow.partName || "TBD").trim(),
    confidence: rawWorkflow.confidence || "AI parsed",
    evidence: Array.isArray(rawWorkflow.evidence) ? rawWorkflow.evidence : [rawWorkflow.detail || "Video evidence"],
    microSteps: microSteps.length ? microSteps.map(normalizeMicroStep) : [normalizeMicroStep({}, 0)],
  };
}

export function normalizeParsedSopResult(rawResult = {}, sourceFile = {}) {
  const workflows = Array.isArray(rawResult.workflows) ? rawResult.workflows : [];
  if (!workflows.length) throw new Error("AI response JSON must include a non-empty workflows array");
  return {
    sourceFile: {
      id: sourceFile.id || rawResult.sourceFile?.id || "",
      source: sourceFile.source || rawResult.sourceFile?.source || "Assembly Video",
      originalName: sourceFile.original_name || sourceFile.originalName || rawResult.sourceFile?.originalName || "",
      mimeType: sourceFile.mime_type || sourceFile.mimeType || rawResult.sourceFile?.mimeType || "",
      sizeBytes: Number(sourceFile.size_bytes || sourceFile.sizeBytes || rawResult.sourceFile?.sizeBytes || 0),
    },
    parser: {
      provider: "gemini",
      model: rawResult.parser?.model || rawResult.model || DEFAULT_MODEL,
    },
    workflows: workflows.map(normalizeWorkflow),
  };
}

function getGenerateContentUrls(baseUrl, model) {
  const cleanBase = String(baseUrl || "").replace(/\/$/, "");
  return [
    `${cleanBase}/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    `${cleanBase}/v1/models/${encodeURIComponent(model)}:generateContent`,
    `${cleanBase}/models/${encodeURIComponent(model)}:generateContent`,
  ];
}

const VIDEO_SAMPLE_FPS = Number(process.env.GEMINI_VIDEO_FPS || 2);

function readVideoInlinePart(file, maxInlineBytes) {
  const size = Number(file.size_bytes || 0);
  if (!file.storage_path || !fs.existsSync(file.storage_path) || size > maxInlineBytes) return null;
  const data = fs.readFileSync(file.storage_path).toString("base64");
  return {
    inline_data: {
      mime_type: file.mime_type || "video/mp4",
      data,
    },
    // Higher frame sampling so short (1-2s) actions span several frames and can be timed,
    // instead of falling between the default 1fps samples. Tunable via GEMINI_VIDEO_FPS.
    video_metadata: {
      fps: VIDEO_SAMPLE_FPS,
    },
  };
}

async function callGemini({ apiKey, baseUrl, model, file, fetchImpl = fetch, maxInlineBytes = DEFAULT_INLINE_VIDEO_BYTES }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for video parsing");
  if (!baseUrl) throw new Error("GEMINI_BASE_URL is required for video parsing");
  if (typeof fetchImpl !== "function") throw new Error("Fetch API is unavailable in this runtime");

  const textPart = { text: buildAssemblyVideoPrompt(file) };
  const inlinePart = readVideoInlinePart(file, maxInlineBytes);
  const parts = inlinePart ? [textPart, inlinePart] : [textPart];
  const body = {
    // Senior IE engineer role: force objective, micro-level action decomposition with
    // strict action anchoring (split whenever hand motion / material / tool changes).
    systemInstruction: {
      parts: [{
        text: "你是一位精通電子製造業 SOP 的資深工業工程師。你只進行客觀、微觀的動作解構，絕對不允許概括步驟。請嚴格執行動作定錨：只要手部動作、物料或工具改變，必須切分步驟。",
      }],
    },
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  let lastError = null;
  for (const url of getGenerateContentUrls(baseUrl, model)) {
    const response = await fetchImpl(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
    const responseText = await response.text();
    if (!response.ok) {
      lastError = new Error(`Gemini parse failed with ${response.status}: ${responseText.slice(0, 500)}`);
      continue;
    }
    const payload = JSON.parse(responseText);
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || payload.text || responseText;
    return extractJsonFromText(text);
  }
  throw lastError || new Error("Gemini parse failed");
}

export async function parseAssemblyVideoFile({
  file,
  apiKey,
  baseUrl,
  model = DEFAULT_MODEL,
  fetchImpl,
  maxInlineBytes,
}) {
  const rawResult = await callGemini({
    apiKey,
    baseUrl,
    model,
    file,
    fetchImpl,
    maxInlineBytes,
  });
  const result = normalizeParsedSopResult({ ...rawResult, model }, file);
  // Lock total process time to the real file duration; AI only provides the relative split.
  const realDuration = await getVideoDurationSec(file.storage_path);
  return scaleToRealDuration(result, realDuration);
}

