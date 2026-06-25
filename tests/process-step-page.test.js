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
  scrollTo() {}
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
globalThis.__processStepTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__processStepTest;
api.renderStage("parse");

assert.equal(api.refs.title.textContent, "Process Step Review");
assert.match(api.refs.twinCanvas.innerHTML, /sop-flow-board/);
assert.match(api.refs.twinCanvas.innerHTML, /No parsed SOP workflows yet/);
assert.equal(api.refs.evidenceTitle.textContent, "Editable SOP Flow");
assert.match(api.refs.rows.innerHTML, /No parsed SOP workflows yet/);
assert.doesNotMatch(api.refs.rows.innerHTML, /Theoretical PT/);
