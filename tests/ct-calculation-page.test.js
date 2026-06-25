const assert = require("node:assert/strict");
const vm = require("node:vm");
const { loadAppScripts } = require("./load-app-scripts");

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
  `${loadAppScripts()}
globalThis.__ctTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__ctTest;
api.renderStage("time");

assert.equal(api.refs.title.textContent, "CT Calculation");
assert.match(api.refs.twinCanvas.innerHTML, /Calculator/);
assert.match(api.refs.twinCanvas.innerHTML, /Input Target CT/);
assert.match(api.refs.twinCanvas.innerHTML, /Generated Target CT/);
assert.equal(api.refs.evidenceTitle.textContent, "Simple Formula");
assert.match(api.refs.evidenceList.innerHTML, /Total Process Time \/ CT/);
assert.match(api.refs.rows.innerHTML, /micro-xlsx-row/);
assert.match(api.refs.rows.innerHTML, /automation-chip/);
