(function attachProcessStepPage(global) {
  function createProcessStepPage({
    steps,
    escapeHtml,
    formatStepId,
    aiPanel,
    getSopStepTone,
    getSopReviewState,
    getSelectedStepId,
    setSelectedStepId,
    getDraggedSopStepId,
    setDraggedSopStepId,
    renderRows,
    renderCurrentPanel,
    renderParse,
    onGenerateSopStep,
    moveSopStep,
    deleteSopStep,
    updateSopStepFromField,
  }) {
    let sopAddPanelOpen = false;
    const sopStepDraft = {
      process: "",
      detail: "",
      station: "TBD area",
      ct: "0s",
      status: "Needs Review",
      risk: "Low",
      mtm: "TBD",
      tooling: "TBD",
      material: "TBD",
    };

    function resetSopStepDraft() {
      sopStepDraft.process = "";
      sopStepDraft.detail = "";
      sopStepDraft.station = "TBD area";
      sopStepDraft.ct = "0s";
      sopStepDraft.status = "Needs Review";
      sopStepDraft.risk = "Low";
      sopStepDraft.mtm = "TBD";
      sopStepDraft.tooling = "TBD";
      sopStepDraft.material = "TBD";
    }

    function updateSopStepDraft(field) {
      const key = field.dataset.draftField || field.dataset.field;
      if (key) sopStepDraft[key] = field.value;
    }

    function syncSopStepDraftFromForm(refs) {
      refs.evidenceList?.querySelectorAll("[data-draft-field]").forEach((field) => updateSopStepDraft(field));
    }

    function render() {
      return `
  <div class="sop-flow-board">
    <div class="sop-step-track">
      ${
        steps.length
          ? steps
              .map((step) => {
                return `
              <article class="sop-step-card ${getSopStepTone(step)} ${step.id === getSelectedStepId() ? "active" : ""}" data-step-id="${step.id}">
                <div class="sop-step-card-head" draggable="true" data-step-id="${step.id}">
                  <button class="sop-drag-handle" type="button" title="Drag to reorder">DRAG</button>
                  <small>Step ${formatStepId(step.id)}</small>
                  <button class="sop-delete-step" type="button" data-action="delete-sop-step" data-step-id="${step.id}" title="Delete step">Delete</button>
            </div>
                <div class="sop-step-source"><b>Part area</b><span>${escapeHtml(step.station)}</span></div>
                <label class="sop-field-label">Process Workflow</label>
                <input class="sop-step-input sop-step-title" data-step-id="${step.id}" data-field="process" value="${escapeHtml(step.process)}" />
                <label class="sop-field-label">Workflow Description</label>
                <textarea class="sop-step-input" data-step-id="${step.id}" data-field="detail" rows="3">${escapeHtml(step.detail)}</textarea>
                <div class="sop-step-meta-edit">
                  <label>Part Area<input class="sop-step-input" data-step-id="${step.id}" data-field="station" value="${escapeHtml(step.station)}" /></label>
                  <label>Review<select class="sop-step-input" data-step-id="${step.id}" data-field="status">
                    ${["Extracted", "Needs Review", "Confirmed"].map((status) => `<option value="${status}" ${getSopReviewState(step) === status ? "selected" : ""}>${status}</option>`).join("")}
                  </select></label>
                </div>
              </article>
            `;
              })
              .join("")
          : `<div class="sop-empty-state">No parsed SOP workflows yet. Go back to Page 01 and run Parse Uploaded Inputs.</div>`
      }
    </div>
  </div>
`;
    }

    function renderAddPanel() {
      return `
    <div class="sop-add-panel ${sopAddPanelOpen ? "open" : ""}">
      <button class="sop-panel-toggle" type="button" data-action="toggle-sop-add">${sopAddPanelOpen ? "Close Add Step" : "+ Add SOP Step"}</button>
      ${
        sopAddPanelOpen
          ? `
            <div class="sop-add-form">
              <label>Process<input data-draft-field="process" value="${escapeHtml(sopStepDraft.process)}" placeholder="Example: Apply thermal pad" /></label>
              <label>Detail<textarea data-draft-field="detail" rows="3" placeholder="Describe method, sequence, and evidence needed">${escapeHtml(sopStepDraft.detail)}</textarea></label>
              <div class="sop-add-form-grid">
                <label>Part Area<input data-draft-field="station" value="${escapeHtml(sopStepDraft.station)}" /></label>
                <label>Review<select data-draft-field="status">
                  ${["Extracted", "Needs Review", "Confirmed"].map((status) => `<option value="${status}" ${sopStepDraft.status === status ? "selected" : ""}>${status}</option>`).join("")}
                </select></label>
              </div>
              <button class="sop-generate-step" type="button" data-action="generate-sop-step">Generate Step</button>
            </div>
          `
          : ""
      }
    </div>
  `;
    }

    function renderPanel(refs) {
      const step = steps.find((item) => item.id === getSelectedStepId()) || steps[0];
      const reviewCount = steps.filter((item) => getSopStepTone(item) === "review").length;

      if (refs.pressureTitle) refs.pressureTitle.textContent = "Parsed Artifacts";
      if (refs.stationRadar) {
        refs.stationRadar.innerHTML = `
      <div class="parsed-artifact-summary">
        <div class="parsed-artifact-item"><strong>${steps.length}</strong><span>Predicted SOP steps</span><small>Editable AI-generated assembly actions</small></div>
        <div class="parsed-artifact-item"><strong>35</strong><span>Frame anchors</span><small>Assembly video operation moments and placeholders</small></div>
        <div class="parsed-artifact-item"><strong>6</strong><span>Tooling notes</span><small>Fixture and tool references from operation videos</small></div>
        <div class="parsed-artifact-item"><strong>${reviewCount}</strong><span>Human gaps</span><small>Steps still needing confirmation</small></div>
      </div>
    `;
      }

      if (!step) {
        aiPanel.renderPanel(refs, {
          title: "SOP Flow · Waiting for parsing",
          confidence: "0",
          reason: "No uploaded video parsing result has been applied yet. Parse uploaded inputs on Page 01 before reviewing SOP workflows.",
          missingTitle: "",
          missingHtml: "",
          evidenceTitle: "Editable SOP Flow",
          evidenceClass: "timing-exposure-list sop-panel-list",
          evidenceLeadHtml: renderAddPanel(),
          evidenceItems: [
            { badge: "01", title: "Parse Uploaded Inputs", detail: "run video parsing first, then continue to this page", tone: "warn" },
          ],
        });
        return;
      }

      aiPanel.renderPanel(refs, {
        title: `SOP Flow · Step ${formatStepId(step.id)}`,
        confidence: step.confidence || "Manual",
        reason: step.reason || "This SOP step is being manually adjusted before detailed step generation.",
        missingTitle: "",
        missingHtml: "",
        evidenceTitle: "Editable SOP Flow",
        evidenceClass: "timing-exposure-list sop-panel-list",
        evidenceLeadHtml: renderAddPanel(),
        evidenceItems: [
          { badge: "Edit", title: "Correct AI extraction", detail: "fix action text, method detail, station, CT, or status", tone: "warn" },
          { badge: "Drag", title: "Repair SOP order", detail: "drop onto another card to match the video flow", tone: "ctq" },
        ],
      });
    }

    function bindPanel(refs) {
      refs.evidenceList?.querySelector("[data-action='toggle-sop-add']")?.addEventListener("click", () => {
        if (sopAddPanelOpen) {
          sopAddPanelOpen = false;
          resetSopStepDraft();
        } else {
          sopAddPanelOpen = true;
        }
        renderPanel(refs);
        bindPanel(refs);
      });

      refs.evidenceList?.querySelector("[data-action='generate-sop-step']")?.addEventListener("click", (event) => {
        event?.target?.blur();
        syncSopStepDraftFromForm(refs);
        onGenerateSopStep({ ...sopStepDraft });
        sopAddPanelOpen = false;
        resetSopStepDraft();
      });

      refs.evidenceList?.querySelectorAll("[data-draft-field]").forEach((field) => {
        field.addEventListener("input", () => updateSopStepDraft(field));
        field.addEventListener("change", () => updateSopStepDraft(field));
      });
    }

    function bind(root) {
      const track = root?.querySelector(".sop-step-track");
      let isTrackPanning = false;
      let trackStartX = 0;
      let trackStartScrollLeft = 0;

      track?.addEventListener("pointerdown", (event) => {
        if (event.target.closest("input, textarea, select, button, .sop-step-card-head")) return;
        isTrackPanning = true;
        trackStartX = event.clientX;
        trackStartScrollLeft = track.scrollLeft;
        track.classList.add("panning");
        track.setPointerCapture?.(event.pointerId);
      });

      track?.addEventListener("pointermove", (event) => {
        if (!isTrackPanning) return;
        event.preventDefault();
        track.scrollLeft = trackStartScrollLeft - (event.clientX - trackStartX);
      });

      const stopTrackPan = (event) => {
        if (!isTrackPanning) return;
        isTrackPanning = false;
        track.classList.remove("panning");
        track.releasePointerCapture?.(event.pointerId);
      };

      track?.addEventListener("pointerup", stopTrackPan);
      track?.addEventListener("pointercancel", stopTrackPan);

      root?.querySelectorAll(".sop-step-card").forEach((card) => {
        card.addEventListener("click", (event) => {
          if (event.target.closest("[data-action='delete-sop-step']")) return;
          setSelectedStepId(card.dataset.stepId);
          root?.querySelectorAll(".sop-step-card").forEach((node) => node.classList.toggle("active", node.dataset.stepId === getSelectedStepId()));
          renderRows();
          renderCurrentPanel();
        });

        card.addEventListener("dragover", (event) => {
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
          if (card.dataset.stepId !== getDraggedSopStepId()) card.classList.add("drop-target");
        });

        card.addEventListener("dragleave", () => {
          card.classList.remove("drop-target");
        });

        card.addEventListener("drop", (event) => {
          event.preventDefault();
          const sourceId = event.dataTransfer?.getData("text/plain") || getDraggedSopStepId();
          card.classList.remove("drop-target");
          moveSopStep(sourceId, card.dataset.stepId);
        });
      });

      root?.querySelectorAll("[data-action='delete-sop-step']").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteSopStep(button.dataset.stepId);
        });
      });

      root?.querySelectorAll(".sop-step-card-head").forEach((head) => {
        head.addEventListener("dragstart", (event) => {
          if (!event.target.closest(".sop-drag-handle")) {
            event.preventDefault();
            return;
          }
          setDraggedSopStepId(head.dataset.stepId);
          event.dataTransfer?.setData("text/plain", getDraggedSopStepId());
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          head.closest(".sop-step-card")?.classList.add("dragging");
        });

        head.addEventListener("dragend", () => {
          setDraggedSopStepId("");
          head.closest(".sop-step-card")?.classList.remove("dragging");
          root?.querySelectorAll(".sop-step-card.drop-target").forEach((node) => node.classList.remove("drop-target"));
        });
      });

      root?.querySelectorAll(".sop-step-input").forEach((field) => {
        field.addEventListener("focus", () => {
          setSelectedStepId(field.dataset.stepId);
          root?.querySelectorAll(".sop-step-card").forEach((node) => node.classList.toggle("active", node.dataset.stepId === getSelectedStepId()));
          renderCurrentPanel();
        });
        field.addEventListener("input", () => updateSopStepFromField(field));
        field.addEventListener("change", () => {
          updateSopStepFromField(field);
          if (field.dataset.field === "status") renderParse();
        });
      });
    }

    return {
      render,
      renderPanel,
      bindPanel,
      bind,
    };
  }

  global.MciProcessStepPage = {
    createProcessStepPage,
  };
})(globalThis);
