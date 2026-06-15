const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.textContent = "";
    this.dataset = {};
    this.classList = {
      add() {},
      remove() {},
      toggle() {},
    };
  }

  addEventListener() {}
  appendChild() {}
  remove() {}
  querySelector() {
    return new FakeElement();
  }
  querySelectorAll() {
    return [];
  }
}

const elements = new Map();
const document = {
  body: new FakeElement(),
  documentElement: {
    style: {
      setProperty() {},
    },
  },
  createElement() {
    return new FakeElement();
  },
  querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, new FakeElement());
    return elements.get(selector);
  },
  querySelectorAll() {
    return [];
  },
};

const appPath = path.join(__dirname, "..", "app.js");
const source = fs.readFileSync(appPath, "utf8");
const sandbox = {
  document,
  window: {
    addEventListener() {},
  },
  console,
  setTimeout() {},
};

vm.createContext(sandbox);
vm.runInContext(
  `${source}
globalThis.__miTest = {
  renderStage,
  refs,
  stationDraft,
  stationMaterialLists,
  sopMacroSteps
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__miTest;
api.renderStage("output");

const html = api.refs.twinCanvas.innerHTML;
const stations = api.stationDraft.map((station) => station.id);
const microStepLabels = api.sopMacroSteps.flatMap((step) => step.microSteps.map((microStep) => microStep[0])).slice(0, 8);

assert.match(html, /MI Package Preview|Manufacturing Instruction/i);
assert.doesNotMatch(html, /MI Draft · ST01 Thermal Module/);
assert.doesNotMatch(html, /AI Generated Warnings/);

for (const station of stations) {
  assert.match(html, new RegExp(station), `MI output missing station ${station}`);
}

for (const label of microStepLabels) {
  assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `MI output missing detailed step ${label}`);
}

assert.match(html, /Target CT\s*58s/);
assert.match(html, /ST02[\s\S]*48s[\s\S]*Ready/);
assert.match(html, /Step List/);
assert.match(html, /Quality Risk/);
assert.match(html, /Fill quality risk/);
