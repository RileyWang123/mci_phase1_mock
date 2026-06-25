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

const source = loadAppScripts();
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
globalThis.__inputTest = {
  renderStage,
  refs
};`,
  sandbox,
  { filename: "app.js" },
);

const api = sandbox.__inputTest;
api.renderStage("inputs");

const canvasHtml = api.refs.twinCanvas.innerHTML;
const editorHtml = api.refs.editorContext.innerHTML;
const tableHeaderHtml = elements.get("thead tr").innerHTML;
const rowsHtml = api.refs.rows.innerHTML;
const aiTitle = api.refs.aiStepTitle.textContent;
const sideTitle = api.refs.sideTitle.textContent;
const pressureTitle = api.refs.pressureTitle.textContent;
const artifactTitle = api.refs.artifactTitle.textContent;

assert.match(canvasHtml, /Input Intake Board/);
assert.match(canvasHtml, /Historical MI Input/);
assert.match(canvasHtml, /Assembly Video/);
assert.match(canvasHtml, /Upload Historical MI/);
assert.match(canvasHtml, /Upload Assembly Video/);
assert.match(canvasHtml, /Upload MTM \/ History/);
assert.match(canvasHtml, /type="file"/);
assert.match(canvasHtml, /Parse Uploaded Inputs/);
assert.match(canvasHtml, /data-action="parse-uploaded-inputs" disabled/);
assert.doesNotMatch(canvasHtml, /Ready for SOP Parsing/);
assert.doesNotMatch(canvasHtml, /coverage/i);
assert.doesNotMatch(canvasHtml, /Exploded laptop assembly CAD preview/);

assert.match(editorHtml, /Uploaded Files Queue/);
assert.doesNotMatch(editorHtml, /Generated Step List/);

for (const header of ["Source", "Type", "Parsed Content", "Quality", "Blocking Issue", "Next Use"]) {
  assert.match(tableHeaderHtml, new RegExp(header));
}

assert.match(rowsHtml, /Historical MI/);
assert.match(rowsHtml, /Assembly Video/);
assert.match(rowsHtml, /Generate new SOP draft/);
assert.doesNotMatch(rowsHtml, /Install thermal module/);
assert.doesNotMatch(rowsHtml, /Station size still needs manual confirmation/);
assert.doesNotMatch(rowsHtml, /7 generated micro steps need method check/);
assert.doesNotMatch(rowsHtml, /Keep ST02 CTQ photo mandatory/);

assert.equal(aiTitle, "AI Input Diagnosis");
assert.equal(api.refs.evidenceTitle.textContent, "Next AI Outputs");
assert.match(api.refs.evidenceList.innerHTML, /SOP Draft/);
assert.match(api.refs.evidenceList.innerHTML, /Station Draft/);
assert.notEqual(sideTitle, "Input Readiness");
assert.notEqual(pressureTitle, "Input Coverage");
