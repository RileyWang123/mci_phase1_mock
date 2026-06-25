"""Station balancing prompt — the IE「排站四大邏輯」skill turned into a structured request.

The model only ASSIGNS steps to stations; the service computes ST / bottleneck / LBR
deterministically from those assignments (never trust the model's arithmetic).
"""


def build_station_balancing_prompt(target_ct: float, total_hc: float, steps: list) -> str:
    step_lines = "\n".join(
        f"  - {s['stepNo']} | CT={s['actualPt']}s | {s.get('automation', 'M')} | "
        f"{s.get('workflow', '')} | {s.get('description', '')}"
        for s in steps
    )

    return f"""\
你是一位精通工業工程（IE）與精益生產（Lean Production）的產線規劃專家。
根據下方「微觀工序清單」與每個工序的 Cycle Time (CT)，進行智能工站劃分（Line Balancing）。

目標節拍時間（Takt Time, TT）= {target_ct} 秒（由使用者在 CT 計算頁設定）。
參考總人力（Total HC）= {total_hc}（僅供參考，最終工站數以平衡結果為準）。

請嚴格遵循「排站四大邏輯」：

1. 節拍時間硬性約束：
   - 每個工站（Station）內所有工序 CT 累加總和（Station Cycle Time, ST）**絕對不能超過 {target_ct} 秒**。
   - 核心目標：讓每個工站的 ST 儘可能接近 {target_ct} 秒，但絕不超標。

2. 工序優先順序（Precedence）物理約束：
   - 必須嚴格按照清單給定的物理裝配先後順序分配，後面的工序不可被排到比前面工序更靠前的工站。

3. 物理與設備限制（Co-location）：
   - 物理不可分割的連續動作（例如：放入治具 → 自動鎖螺絲 → 取出組件）必須留在同一個工站，不可拆開。
   - 自動（A）工序通常需獨立或與其前後的裝載/卸載動作同站；盡量減少非加值（NVA）搬運的跨站次數。

4. 產出 2 套「都合理」的方案（plans）—— 這是最重要的要求：
   - 兩套方案都必須是**高品質的平衡結果**：都要遵守 CT 上限、都要盡量讓 LBR（產線平衡率）高。
   - **嚴禁**故意產出一套明顯不平衡、LBR 很低的方案來充數（例如把幾乎所有工序塞進一站）。沒有人會選平衡率很差的方案。
   - 兩套的差別應該是**真實的 IE 工程取捨**，而不是好壞之分。常見的兩種取捨：
     * Plan A（省人力）：用「最少工站數」達成平衡 —— 工站數 = ceil(總CT / 目標CT)，各站負載盡量貼近目標 CT，HC 最少。
     * Plan B（快節拍）：多開 1 個工站來降低瓶頸時間 —— 每站更輕、瓶頸 CT 更低、產線更快，但 HC 較多。
   - 若工序數很少、客觀上只有一種合理排法，兩套可以非常接近，但**都必須是好的平衡**。兩套的 LBR 不應該相差懸殊。
   - 在每套的 strategy 欄用一句話說明它的取捨（例如「省人力：2 站達成 96% 平衡」「快節拍：3 站把瓶頸降到 9 秒」）。

【只輸出 JSON，不要任何額外文字】
{{
  "plans": [
    {{
      "name": "Plan A",
      "strategy": "一句話說明這套方案的取捨（中文）",
      "stations": [
        {{
          "stationNo": 1,
          "name": "工站名稱（中文，可用主要動作概括）",
          "stepNos": ["01.01", "01.02"],
          "automation": "M 或 A"
        }}
      ]
    }},
    {{
      "name": "Plan B",
      "strategy": "...",
      "stations": [ ... ]
    }}
  ]
}}

規則：
- stepNos 只能使用下方清單中出現過的工序編號，且每個工序在一套方案中只能出現一次、必須全部分配完。
- 不要自行更改工序內容或 CT。
- 不要輸出 ST / LBR 等數字，後端會自行計算。

微觀工序清單（已按物理順序排列）：
{step_lines}
"""
