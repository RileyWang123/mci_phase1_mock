(function attachInputFilesApi(global) {
  function createInputFilesApi({ baseUrl, balancerBaseUrl, fetchImpl } = {}) {
    const apiBaseUrl = baseUrl || "http://localhost:4000";
    // Station balancing runs in the separate Python (FastAPI) service.
    const stationBalancerUrl = balancerBaseUrl || "http://localhost:4001";
    const fetcher = fetchImpl || global.fetch;

    function ensureFetch() {
      if (typeof fetcher !== "function") {
        throw new Error("Fetch API is unavailable in this runtime.");
      }
    }

    async function getStatus() {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/status`);
      if (!response.ok) {
        throw new Error(`Upload status failed with ${response.status}`);
      }
      return response.json();
    }

    async function uploadFile({ source, file, sortOrder, uploadBatchId }) {
      ensureFetch();
      const formData = new FormData();
      formData.append("source", source);
      formData.append("file", file);
      if (sortOrder != null) formData.append("sort_order", String(sortOrder));
      if (uploadBatchId != null) formData.append("upload_batch_id", String(uploadBatchId));

      const response = await fetcher(`${apiBaseUrl}/api/input-files/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}`);
      }

      return response.json();
    }

    async function startParse() {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/parse`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Parse failed with ${response.status}`);
      }
      return response.json();
    }

    async function getLatestParseResult() {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/parse/latest`);
      if (!response.ok) {
        throw new Error(`Latest parse result failed with ${response.status}`);
      }
      return response.json();
    }

    async function getParseJob(jobId) {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/parse/${encodeURIComponent(jobId)}`);
      if (!response.ok) {
        throw new Error(`Parse job failed with ${response.status}`);
      }
      return response.json();
    }

    async function startParseBatch({ fileIds, uploadBatchId } = {}) {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/parse-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds, uploadBatchId }),
      });
      if (!response.ok) {
        throw new Error(`Batch parse failed with ${response.status}`);
      }
      return response.json();
    }

    async function recomputeStations({ targetCt, stepCt, stations }) {
      ensureFetch();
      const response = await fetcher(`${stationBalancerUrl}/recompute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCt, stepCt, stations }),
      });
      if (!response.ok) {
        throw new Error(`Station recompute failed with ${response.status}`);
      }
      return response.json();
    }

    async function getLatestBatch() {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/latest-batch`);
      if (!response.ok) {
        throw new Error(`Latest batch failed with ${response.status}`);
      }
      return response.json();
    }

    async function generateStations({ targetCt, totalHc, steps }) {
      ensureFetch();
      const response = await fetcher(`${stationBalancerUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCt, totalHc, steps }),
      });
      if (!response.ok) {
        throw new Error(`Station generation failed with ${response.status}`);
      }
      return response.json();
    }

    async function getBatchStatus(batchJobId) {
      ensureFetch();
      const response = await fetcher(`${apiBaseUrl}/api/input-files/parse-batch/${encodeURIComponent(batchJobId)}/status`);
      if (!response.ok) {
        throw new Error(`Batch status failed with ${response.status}`);
      }
      return response.json();
    }

    return {
      getStatus,
      uploadFile,
      startParse,
      getLatestParseResult,
      getParseJob,
      startParseBatch,
      getBatchStatus,
      getLatestBatch,
      generateStations,
      recomputeStations,
    };
  }

  global.MciInputFilesApi = {
    createInputFilesApi,
  };
})(globalThis);
