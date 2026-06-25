const fs = require("node:fs");
const path = require("node:path");

function loadAppScripts() {
  return [
    "src/api/input-files-api.js",
    "src/state/input-upload-state.js",
    "src/components/ai-panel.js",
    "src/components/workflow-table.js",
    "src/pages/input-page.js",
    "src/pages/process-step-page.js",
    "src/pages/process-time-page.js",
    "src/pages/ct-calculation-page.js",
    "src/pages/station-page.js",
    "src/pages/layout-page.js",
    "src/pages/mi-output-page.js",
    "app.js",
  ]
    .map((file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8"))
    .join("\n");
}

module.exports = {
  loadAppScripts,
};
