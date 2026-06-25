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
globalThis.__stationTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__stationTest;
api.renderStage("station");

assert.equal(api.refs.title.textContent, "Station Balancing Workspace");
assert.match(api.refs.twinCanvas.innerHTML, /station-board/);
assert.match(api.refs.twinCanvas.innerHTML, /Line Balance Efficiency/);
assert.match(api.refs.twinCanvas.innerHTML, /station-edit-row/);
assert.match(api.refs.evidenceTitle.textContent, /Station View/);
assert.match(api.refs.evidenceList.innerHTML, /KPI Performance/);
assert.match(api.refs.rows.innerHTML, /ST01/);
