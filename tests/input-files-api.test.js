const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const source = readFileSync(join(__dirname, "..", "src", "api", "input-files-api.js"), "utf8");
const calls = [];
const sandbox = {
  console,
  FormData,
  fetch: async (url, options = {}) => {
    calls.push({ url, options });
    return {
      ok: true,
      json: async () => ({ ok: true, url }),
    };
  },
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "input-files-api.js" });

(async () => {
  const api = sandbox.MciInputFilesApi.createInputFilesApi({ baseUrl: "http://api.test" });
  await api.startParse();
  await api.getLatestParseResult();
  await api.getParseJob("job-1");

  assert.equal(calls[0].url, "http://api.test/api/input-files/parse");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[1].url, "http://api.test/api/input-files/parse/latest");
  assert.equal(calls[2].url, "http://api.test/api/input-files/parse/job-1");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
