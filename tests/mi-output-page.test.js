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
globalThis.__miOutputTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__miOutputTest;
api.renderStage("output");

assert.equal(api.refs.title.textContent, "MI Package Output");
assert.match(api.refs.twinCanvas.innerHTML, /mi-package-view/);
assert.match(api.refs.twinCanvas.innerHTML, /MI Package Preview/);
assert.match(api.refs.twinCanvas.innerHTML, /Part Number/);
assert.match(api.refs.twinCanvas.innerHTML, /data-mi-ctq-station/);
assert.match(api.refs.twinCanvas.innerHTML, /data-mi-risk-station/);
assert.equal(api.refs.evidenceTitle.textContent, "Export Action");
assert.match(api.refs.evidenceList.innerHTML, /Export Excel/);
