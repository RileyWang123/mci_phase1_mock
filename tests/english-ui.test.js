const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const files = ["index.html"];
const chinesePattern = /[\u3400-\u9fff]/;

for (const file of files) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  assert.doesNotMatch(source, chinesePattern, `${file} still contains Chinese UI text`);
  assert.doesNotMatch(source, /Human Input Constraints/, `${file} still contains the removed Human Input Constraints section`);
  assert.doesNotMatch(source, /Automated loading is not allowed for ST02/, `${file} still contains removed constraint chips`);
}
