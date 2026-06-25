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
globalThis.__layoutTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__layoutTest;
api.renderStage("mapping");

assert.equal(api.refs.title.textContent, "Station Layout");
assert.match(api.refs.twinCanvas.innerHTML, /layout-page-board/);
assert.match(api.refs.twinCanvas.innerHTML, /layout-blueprint/);
assert.match(api.refs.twinCanvas.innerHTML, /layout-svg-station/);
assert.match(api.refs.evidenceTitle.textContent, /Station Info from Page 5|Layout Source/);
assert.match(api.refs.rows.innerHTML, /layout-dimension-row/);
assert.match(api.refs.rows.innerHTML, /layoutWidth/);
