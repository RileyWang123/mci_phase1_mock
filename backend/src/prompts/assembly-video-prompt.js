// Prompt template for decomposing an assembly video into structured SOP workflows.
// Kept separate from ai-parser.js so the prompt can be tuned without touching parse logic.
//
// Style: "IE 标准工序微观解构" — atomic verbs, no generalization, VA/NVA tagging.
// Timing notes:
// - No example numeric durations in the schema (concrete examples like "6" anchor the model).
// - startTime/endTime give the RELATIVE split; the backend rescales totals to the real
//   file duration (ffprobe), so absolute precision matters less than relative ordering.

export function buildAssemblyVideoPrompt(file) {
  return `
你是一位精通電子製造業 SOP 的資深工業工程師，正在逐幀觀看一段**原速、未加速**的裝配操作視頻。
視頻以真實時間播放，每個動作的起止時刻即其真實工時。

任務：先在腦中建立時間軸（逐秒觀察畫面，記錄每個可見動作的開始/結束時刻），再按下方規範輸出結構化 JSON。

【輸出風格與語法規範 — 必須嚴格遵守】

1. 語法公式：每個 description 必須符合結構
   「[精確的微觀動詞] + [具體的零件/物料/治具名稱] + [物理空間位置或目的]」
   示例：
   - 將已組裝 D 殼的電腦主機放入黃綠色防靜電定位治具托盤中
   - 撕除 TP 麥拉片背面的保護離型紙
   - 將 TP 麥拉片貼膜精準對齊 C 殼底部的觸控板背面區域並貼放下去

2. 動詞原子化（Atomic Verbs）：
   絕對禁止模糊、概括性詞彙（如「安裝」「組裝」「處理」「做好準備」「整理」）。
   必須使用具體單一的物理動詞，例如：拿取、撕除、對齊、放入、插上、推入、按壓、鎖入、拉回、丟棄。

3. 嚴格禁止偷懶（No Generalization）：
   若操作員重複同一動作（如鎖 4 顆螺絲），必須像錄影機一樣逐次拆解，精確寫出第 1 顆、第 2 顆的位置，
   絕對不允許概括為「隨後鎖完全部螺絲」。

4. 物理狀態判定（VA/NVA）：
   每個 microStep 都必須輸出 "valueType" 欄位，值只能是 "VA" 或 "NVA"，不可省略。
   - VA（Value-Added）：直接改變產品物理性質、實現永久固定或貼附（螺絲鎖入、膠帶貼上、機台壓合）。
   - NVA（Non-Value-Added）：輔助/準備/檢查/搬運性動作（拿取工具、撕保護紙、放入治具、推入機台、插測試線）。

【JSON 結構】
只輸出 JSON，不要 markdown。
{
  "workflows": [
    {
      "id": "010",
      "process": "簡短中文工序名",
      "detail": "中文說明，含畫面證據",
      "station": "中文工位/區域",
      "material": "中文零件/物料",
      "confidence": "AI parsed",
      "evidence": ["畫面觀察"],
      "microSteps": [
        {
          "description": "依上述語法公式編寫的中文步驟（不含 VA/NVA 字樣）",
          "valueType": "VA 或 NVA",
          "partName": "中文零件名",
          "automation": "M 或 A",
          "startTime": "動作開始時刻 MM:SS",
          "endTime": "動作結束時刻 MM:SS"
        }
      ]
    }
  ]
}

【時間標註規則】
- 根據實際畫面判斷每個動作的 startTime / endTime，不要套用「拿料約5秒」這類經驗值。
- 動作連續：後一動作 startTime 等於前一動作 endTime，除非明顯停頓。
- 時間隨動作長短自然變化：短動作（按按鈕、放料）可能 1 秒，長動作（設備循環、理線）可能十幾秒。
- 所有時間非遞減，不得超過視頻總長。

【其他】
- 所有內容用中文（輸入裝配內容是中文）。
- 按視頻中操作發生的先後順序生成 workflows 與 microSteps。
- 若視頻含多個明顯不同的操作階段，拆成多個 workflow。
- 除非畫面清楚顯示設備自動完成，否則 automation 用 "M"。

上傳文件信息：
- 文件名：${file.original_name}
- 類型：${file.mime_type || "unknown"}
- 大小（字節）：${file.size_bytes}
`.trim();
}
