import assert from "node:assert/strict";
import { extractJsonFromText, normalizeParsedSopResult } from "../src/ai-parser.js";

const parsed = extractJsonFromText(`\`\`\`json
{
  "workflows": [
    {
      "id": "010",
      "process": "組理左天線",
      "detail": "視頻解析結果",
      "station": "A 殼",
      "material": "左天線",
      "microSteps": [
        {
          "description": "撕掉保護紙",
          "partName": "左天線",
          "automation": "M",
          "theoreticalPt": 6,
          "actualPt": 7
        }
      ]
    }
  ]
}
\`\`\``);

const normalized = normalizeParsedSopResult(parsed, {
  id: "file-1",
  source: "Assembly Video",
  original_name: "1.组理左天线.webm",
  mime_type: "video/webm",
  size_bytes: 1234,
});

assert.equal(normalized.sourceFile.originalName, "1.组理左天线.webm");
assert.equal(normalized.workflows.length, 1);
assert.equal(normalized.workflows[0].id, "010");
assert.equal(normalized.workflows[0].microSteps[0].description, "撕掉保護紙");
assert.equal(normalized.workflows[0].microSteps[0].actualPt, 7);
