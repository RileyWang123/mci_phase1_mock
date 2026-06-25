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
globalThis.__processTimeTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__processTimeTest;
api.renderStage("steps");

assert.equal(api.refs.title.textContent, "Process Time");
assert.match(api.refs.twinCanvas.innerHTML, /SOP Actions/);
assert.match(api.refs.twinCanvas.innerHTML, /0 actions/);
assert.match(api.refs.twinCanvas.innerHTML, /No process time rows yet/);
assert.match(api.refs.evidenceTitle.textContent, /Step Change Summary/);
assert.match(api.refs.evidenceList.innerHTML, /Added/);
assert.match(api.refs.evidenceList.innerHTML, /Deleted/);
assert.match(api.refs.evidenceList.innerHTML, /Moved/);
assert.match(api.refs.rows.innerHTML, /No parsed SOP workflows yet/);
