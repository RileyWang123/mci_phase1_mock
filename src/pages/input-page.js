(function attachInputPage(global) {
  const uploadSlots = [
    {
      title: "Historical MI Input",
      detail: "Upload previous MI package for process structure, work instructions, images and CTQ references.",
      action: "Upload Historical MI",
      accept: ".ppt,.pptx,.pdf,.xlsx,.xls,.csv,.zip",
      status: "Loaded sample",
      source: "Historical MI",
    },
    {
      title: "Assembly Video",
      detail: "Select a folder of .webm videos. Files are parsed in filename order.",
      action: "Select Video Folder",
      accept: ".webm",
      status: "Loaded sample",
      source: "Assembly Video",
      folder: true,
    },
    {
      title: "MTM / History Input",
      detail: "Upload MTM timing, previous line balance or historical station arrangement.",
      action: "Upload MTM / History",
      accept: ".xlsx,.xls,.csv,.json",
      status: "Optional but useful",
      source: "MTM Database",
    },
  ];

  function createInputPage({
    inputSources,
    inputFilesApi,
    inputUploadState,
    aiPanel,
    escapeHtml,
    renderInputs,
    isActive,
    applyParsedResult,
    logger = console,
  }) {
    const parseState = {
      status: "idle",
      message: "Ready after Assembly Video upload",
    };
    const batchUploadState = {
      fileIds: [],
      totalCount: 0,
      uploadedCount: 0,
    };
    // The latest upload batch loaded from the DB, so the user can re-parse without re-uploading.
    const queueState = {
      batchId: null,
      uploadedAt: null,
      files: [],
      selectedIds: new Set(), // which files to re-parse; defaults to all
    };
    let batchPollTimer = null;

    function formatBytes(bytes) {
      const n = Number(bytes) || 0;
      if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
      if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
      return `${n} B`;
    }

    function formatUploadedAt(value) {
      if (!value) return "";
      try {
        return new Date(value).toLocaleString();
      } catch (_error) {
        return String(value);
      }
    }

    function findSource(sourceName) {
      return inputSources.find((item) => item.source === sourceName);
    }

    function getParseTone() {
      if (parseState.status === "parsing") return "review";
      if (parseState.status === "completed") return "done";
      if (parseState.status === "failed") return "missing";
      return "";
    }

    function render() {
      const hasAssemblyVideo = Boolean(inputUploadState.getFile("Assembly Video"));
      const parseDisabled = parseState.status === "parsing" || !hasAssemblyVideo;
      return `
    <div class="input-intake-board">
      <section class="input-intake-hero">
        <div>
          <span class="input-kicker">Input Intake Board</span>
          <h3>Upload inputs to generate the new SOP draft</h3>
          <p>This is the input entry point. Upload historical MI, assembly videos, and MTM / historical layout first; the next page shows the AI-generated SOP.</p>
        </div>
        <div class="input-start-card ${getParseTone()}">
          <strong>Start Parsing</strong>
          <span>${parseState.message}</span>
          <button type="button" data-action="parse-uploaded-inputs" ${parseDisabled ? "disabled" : ""}>${parseState.status === "parsing" ? `Parsing ${batchUploadState.uploadedCount > 1 ? `videos...` : "video..."}` : "Parse Uploaded Inputs"}</button>
        </div>
      </section>

      <section class="upload-slot-grid">
        ${uploadSlots
          .map((slot, index) => {
            const source = findSource(slot.source);
            return `
              <article class="upload-slot-card ${source?.tone || ""}">
                <div>
                  <b>${slot.title}</b>
                  <span>${slot.detail}</span>
                </div>
                <label class="upload-action">
                  <input type="file" accept="${slot.accept}" data-upload-slot="${index}" data-upload-source="${escapeHtml(slot.source)}" ${slot.folder ? 'webkitdirectory multiple' : ''} />
                  <span>${slot.action}</span>
                </label>
                <small>${slot.folder && batchUploadState.totalCount > 0 ? `${batchUploadState.uploadedCount}/${batchUploadState.totalCount} videos uploaded` : (inputUploadState.getFile(slot.source)?.original_name || slot.status)}${source?.issue ? ` · ${source.issue}` : ""}</small>
              </article>
            `;
          })
          .join("")}
      </section>

      ${renderQueue()}

      <section class="upload-note-strip">
        <span>Optional: Human Rule List and Mapping Table can be added later. Missing mapping will stay as review items downstream.</span>
      </section>
    </div>
  `;
    }

    function renderQueue() {
      if (!queueState.files.length) return "";
      const parsing = parseState.status === "parsing";
      const selectedCount = queueState.selectedIds.size;
      const allSelected = selectedCount === queueState.files.length;
      return `
      <section class="upload-queue-card">
        <header class="upload-queue-head">
          <div>
            <b>Uploaded Files Queue</b>
            <span>最後一次上傳 · ${queueState.files.length} 個影片${queueState.uploadedAt ? ` · ${escapeHtml(formatUploadedAt(queueState.uploadedAt))}` : ""}</span>
          </div>
          <button type="button" data-action="parse-queue-set" ${parsing || selectedCount === 0 ? "disabled" : ""}>${parsing ? "Parsing..." : `Parse Selected (${selectedCount})`}</button>
        </header>
        <label class="upload-queue-selectall">
          <input type="checkbox" data-queue-selectall ${allSelected ? "checked" : ""} ${parsing ? "disabled" : ""} />
          <span>全選 / 全不選</span>
        </label>
        <ol class="upload-queue-list">
          ${queueState.files
            .map(
              (file, index) => `
            <li>
              <input type="checkbox" class="upload-queue-check" data-queue-file="${escapeHtml(file.id)}" ${queueState.selectedIds.has(file.id) ? "checked" : ""} ${parsing ? "disabled" : ""} />
              <span class="upload-queue-index">${index + 1}</span>
              <span class="upload-queue-name">${escapeHtml(file.original_name || "")}</span>
              <span class="upload-queue-size">${formatBytes(file.size_bytes)}</span>
            </li>`,
            )
            .join("")}
        </ol>
      </section>
    `;
    }

    function renderPanel(refs) {
      const readyCount = inputSources.filter((source) => source.quality === "Ready").length;
      const reviewItems = inputSources.filter((source) => source.quality === "Review");
      const missingItems = inputSources.filter((source) => source.quality === "Missing");

      aiPanel.renderPanel(refs, {
        title: "AI Input Diagnosis",
        confidence: `${readyCount}/${inputSources.length}`,
        reason: "Upload the inputs first: historical MI provides the previous process and MI format, assembly videos extract actions and parts, and MTM / historical layout supports later CT and station balancing.",
        missingItems: [
          "Historical MI and assembly videos are the minimum inputs for Page 02 SOP draft",
          `${reviewItems.length} uploaded source(s) still need human review`,
          `${missingItems.length} optional source(s) missing; downstream pages keep review flags`,
        ],
        evidenceTitle: "Next AI Outputs",
        evidenceClass: "timing-exposure-list",
        evidenceItems: [
          { badge: "02", title: "SOP Draft", detail: "Generate new SOP from uploaded historical MI and assembly videos" },
          { badge: "03", title: "Steps", detail: "Break SOP workflows into detailed work steps" },
          { badge: "06", title: "Station Draft", detail: "Use MTM / history input to balance CT and HC", tone: "warn" },
          { badge: "08", title: "MI Package", detail: "Export aligned MI after station and BOM checks", tone: "ctq" },
        ],
      });
    }

    async function refreshUploadStatus() {
      try {
        const data = await inputFilesApi.getStatus();
        inputUploadState.applyBackendStatus(data);
        if (isActive()) renderInputs();
      } catch (_error) {
        // Backend is optional during static demo review.
      }
      await loadQueue();
    }

    async function uploadFile(input) {
      const files = Array.from(input.files || []);
      const sourceName = input.dataset.uploadSource;
      if (!files.length || !sourceName) return;

      const isFolder = input.hasAttribute("webkitdirectory");

      if (isFolder) {
        const sorted = files.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        // One batch id for this whole folder so the queue can group it as a single upload.
        const uploadBatchId = (global.crypto?.randomUUID && global.crypto.randomUUID()) || `batch-${sorted.length}-${sorted[0]?.name || "videos"}`;
        batchUploadState.fileIds = [];
        batchUploadState.totalCount = sorted.length;
        batchUploadState.uploadedCount = 0;

        const source = findSource(sourceName);
        if (source) { source.quality = "Review"; source.tone = "review"; source.issue = `Uploading 0/${sorted.length}`; }
        renderInputs();

        for (let i = 0; i < sorted.length; i++) {
          try {
            const data = await inputFilesApi.uploadFile({ source: sourceName, file: sorted[i], sortOrder: i, uploadBatchId });
            batchUploadState.fileIds.push(data.file.id);
            batchUploadState.uploadedCount = i + 1;
            if (source) source.issue = `Uploading ${i + 1}/${sorted.length}`;
            if (i === sorted.length - 1) {
              inputUploadState.setUploaded(sourceName, data.file);
              if (source) { source.quality = "Ready"; source.tone = "done"; source.issue = `${sorted.length} videos ready`; }
            }
          } catch (error) {
            if (source) { source.quality = "Review"; source.tone = "review"; source.issue = "Upload error; check backend"; }
            logger.warn(error);
          }
          renderInputs();
        }
        await loadQueue();
      } else {
        const file = files[0];
        const source = findSource(sourceName);
        if (source) { source.quality = "Review"; source.tone = "review"; source.issue = `Uploading ${file.name}`; }
        renderInputs();
        try {
          const data = await inputFilesApi.uploadFile({ source: sourceName, file });
          inputUploadState.setUploaded(sourceName, data.file);
        } catch (error) {
          if (source) { source.quality = "Review"; source.tone = "review"; source.issue = "Backend offline; file not persisted"; }
          logger.warn(error);
        }
        renderInputs();
      }
    }

    async function pollBatchStatus(batchJobId, totalCount) {
      return new Promise((resolve, reject) => {
        batchPollTimer = setInterval(async () => {
          try {
            const data = await inputFilesApi.getBatchStatus(batchJobId);
            parseState.message = `Parsing ${data.completedCount}/${data.totalCount} videos...`;
            renderInputs();
            if (data.status === "completed" || data.status === "failed") {
              clearInterval(batchPollTimer);
              batchPollTimer = null;
              resolve(data);
            }
          } catch (error) {
            clearInterval(batchPollTimer);
            batchPollTimer = null;
            reject(error);
          }
        }, 3000);
      });
    }

    async function loadQueue() {
      try {
        const data = await inputFilesApi.getLatestBatch();
        queueState.batchId = data.batchId;
        queueState.uploadedAt = data.uploadedAt;
        queueState.files = Array.isArray(data.files) ? data.files : [];
        queueState.selectedIds = new Set(queueState.files.map((f) => f.id)); // default: all selected
        if (isActive()) renderInputs();
      } catch (_error) {
        // Backend optional; queue stays empty in static demo.
      }
    }

    // Shared batch-parse runner. Pass fileIds (fresh upload) or uploadBatchId (queue set);
    // both let the backend parse DB files without re-uploading.
    async function runBatchParse({ fileIds, uploadBatchId, totalCount }) {
      if (parseState.status === "parsing") return false;
      parseState.status = "parsing";
      parseState.message = "Starting batch parse of uploaded videos...";
      renderInputs();
      try {
        const { batchJobId } = await inputFilesApi.startParseBatch({ fileIds, uploadBatchId });
        const batchResult = await pollBatchStatus(batchJobId, totalCount);

        const allWorkflows = [];
        let failedCount = 0;
        for (const f of batchResult.files) {
          if (f.status === "completed" && f.result?.workflows) {
            for (const wf of f.result.workflows) {
              allWorkflows.push({ ...wf, sourceVideoName: f.originalName });
            }
          } else if (f.status === "failed") {
            failedCount += 1;
          }
        }
        if (!allWorkflows.length) {
          throw new Error(`All ${batchResult.totalCount} video(s) failed to parse (e.g. expired API token).`);
        }

        const mergedResult = {
          workflows: allWorkflows,
          sourceFile: { originalName: `${batchResult.totalCount} videos` },
          parser: batchResult.files.find((f) => f.result?.parser)?.result?.parser,
        };
        parseState.status = "completed";
        parseState.message = `${allWorkflows.length} SOP workflow(s) parsed from ${batchResult.completedCount}/${batchResult.totalCount} videos${failedCount ? ` (${failedCount} failed)` : ""}`;
        applyParsedResult?.(mergedResult);
        renderInputs();
        return true;
      } catch (error) {
        parseState.status = "failed";
        parseState.message = error.message || "Batch video parsing failed";
        logger.warn(error);
        renderInputs();
        return false;
      }
    }

    async function parseUploadedInputs() {
      const hasAssemblyVideo = Boolean(inputUploadState.getFile("Assembly Video"));
      if (!hasAssemblyVideo || parseState.status === "parsing") return false;
      // Empty fileIds → backend parses every Assembly Video in the DB.
      return runBatchParse({ fileIds: batchUploadState.fileIds, totalCount: batchUploadState.totalCount });
    }

    async function parseQueueSet() {
      if (parseState.status === "parsing") return false;
      const fileIds = queueState.files.map((f) => f.id).filter((id) => queueState.selectedIds.has(id));
      if (!fileIds.length) return false;
      return runBatchParse({ fileIds, totalCount: fileIds.length });
    }

    function hasCompletedParse() {
      return parseState.status === "completed";
    }

    function applyDemoIntakeSnapshot() {
      parseState.status = "completed";
      parseState.message = "6 videos parsed · static demo snapshot";
      queueState.batchId = "demo-batch";
      queueState.uploadedAt = new Date().toISOString();
      queueState.files = [
        { id: "demo-v1", original_name: "01-left-antenna-top.webm", source: "Assembly Video", size_bytes: 1480000 },
        { id: "demo-v2", original_name: "02-left-antenna-routing.webm", source: "Assembly Video", size_bytes: 1320000 },
        { id: "demo-v3", original_name: "03-middle-board.webm", source: "Assembly Video", size_bytes: 1560000 },
        { id: "demo-v4", original_name: "04-middle-board-screw.webm", source: "Assembly Video", size_bytes: 1410000 },
        { id: "demo-v5", original_name: "05-camera-brk.webm", source: "Assembly Video", size_bytes: 1290000 },
        { id: "demo-v6", original_name: "06-camera-to-cover.webm", source: "Assembly Video", size_bytes: 1620000 },
      ];
      queueState.selectedIds = new Set(queueState.files.map((file) => file.id));
      inputUploadState.setUploaded("Historical MI", { original_name: "XPS-14-MI-RevB03.pptx" });
      inputUploadState.setUploaded("Assembly Video", { original_name: "6 assembly videos (demo)" });
      inputUploadState.setUploaded("MTM Database", { original_name: "mtm-standard-times.json" });
    }

    function bind(root) {
      root?.querySelectorAll("[data-upload-source]").forEach((input) => {
        input.addEventListener("change", () => uploadFile(input));
      });
      root?.querySelector?.("[data-action='parse-uploaded-inputs']")?.addEventListener("click", parseUploadedInputs);
      root?.querySelector?.("[data-action='parse-queue-set']")?.addEventListener("click", parseQueueSet);

      root?.querySelectorAll("[data-queue-file]").forEach((box) => {
        box.addEventListener("change", () => {
          const id = box.dataset.queueFile;
          if (box.checked) queueState.selectedIds.add(id);
          else queueState.selectedIds.delete(id);
          renderInputs();
        });
      });
      root?.querySelector?.("[data-queue-selectall]")?.addEventListener("change", (event) => {
        if (event.target.checked) queueState.selectedIds = new Set(queueState.files.map((f) => f.id));
        else queueState.selectedIds = new Set();
        renderInputs();
      });
    }

    return {
      render,
      renderPanel,
      bind,
      uploadFile,
      refreshUploadStatus,
      parseUploadedInputs,
      parseQueueSet,
      loadQueue,
      hasCompletedParse,
      applyDemoIntakeSnapshot,
    };
  }

  global.MciInputPage = {
    createInputPage,
  };
})(globalThis);
