const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function node() {
  return {
    textContent: "",
    className: "",
    innerHTML: "",
  };
}

const sandbox = {
  document: {
    querySelector() {
      return node();
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return node();
    },
    body: node(),
    documentElement: {
      style: {
        setProperty() {},
      },
    },
  },
  window: {
    addEventListener() {},
  },
  console,
  setTimeout() {},
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "src", "components", "ai-panel.js"), "utf8"), sandbox, { filename: "ai-panel.js" });

const refs = {
  aiStepTitle: node(),
  confidence: node(),
  aiReason: node(),
  missingTitle: node(),
  missingList: node(),
  evidenceTitle: node(),
  evidenceList: node(),
};

sandbox.MciAiPanel.renderPanel(refs, {
  title: "AI Input Diagnosis",
  confidence: "3/5",
  reason: "Review uploaded files.",
  missingItems: ["Upload Assembly Video", "Confirm MTM Database"],
  evidenceTitle: "Next AI Outputs",
  evidenceClass: "timing-exposure-list",
  evidenceLeadHtml: "<button>Run</button>",
  evidenceItems: [{ badge: "02", title: "SOP Draft", detail: "Generate new SOP", tone: "warn" }],
});

assert.equal(refs.aiStepTitle.textContent, "AI Input Diagnosis");
assert.equal(refs.confidence.textContent, "3/5");
assert.match(refs.missingList.innerHTML, /Upload Assembly Video/);
assert.equal(refs.evidenceList.className, "timing-exposure-list");
assert.match(refs.evidenceList.innerHTML, /<button>Run<\/button>/);
assert.match(refs.evidenceList.innerHTML, /timing-exposure-row warn/);
assert.match(refs.evidenceList.innerHTML, /SOP Draft/);
