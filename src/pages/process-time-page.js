(function attachProcessTimePage(global) {
  function createProcessTimePage({
    sopMacroSteps,
    aiPanel,
    escapeHtml,
    formatStepId,
    getMicroReviewState,
    getSelectedMacroStep,
    setSelectedMacroStepId,
    setSelectedStepId,
    getMicroChangeStats,
    renderProcessTime,
  }) {
    function render() {
      const selectedMacro = getSelectedMacroStep();

      return `
    <div class="timing-board">
      <section class="area-step-list sop-action-list">
        <div class="area-step-list-head">
          <b>SOP Actions</b>
          <span>${sopMacroSteps.length} actions</span>
      </div>
        <div class="area-step-grid">
        ${
          sopMacroSteps.length
            ? sopMacroSteps
                .map(
                  (step) => `
                <button class="area-step-card ${step.id === selectedMacro.id ? "active" : ""}" data-sop-id="${step.id}">
                  <span>Step ${formatStepId(step.id)}</span>
                  <b>${escapeHtml(step.title)}</b>
                  <i>${step.microSteps.length} micro · ${step.microSteps.filter((item) => getMicroReviewState(item[3]) === "Edit").length} edit · ${escapeHtml(step.station)}</i>
              </button>
            `,
                )
                .join("")
            : `<div class="sop-empty-state">No process time rows yet. Parse uploaded inputs first.</div>`
        }
      </div>
      </section>
    </div>
  `;
    }

    function renderPanel(refs) {
      const selectedMacro = getSelectedMacroStep();
      const microChangeStats = getMicroChangeStats();
      const totalChanges = microChangeStats.added + microChangeStats.deleted + microChangeStats.moved;

      if (!selectedMacro) {
        aiPanel.renderPanel(refs, {
          title: "Process Time · Waiting for parsing",
          confidence: "0",
          reason: "No parsed SOP steps are available yet. Parse uploaded inputs on Page 01 before reviewing process time.",
          missingItems: ["Run video parsing before process-time review"],
          evidenceTitle: "Step Change Summary",
          evidenceClass: "timing-exposure-list",
          evidenceItems: [
            { badge: "0", title: "Added", detail: "new step rows inserted" },
            { badge: "0", title: "Deleted", detail: "step rows removed", tone: "warn" },
            { badge: "0", title: "Moved", detail: "rows reordered within the table" },
          ],
        });
        return;
      }

      aiPanel.renderPanel(refs, {
        title: `Step ${formatStepId(selectedMacro.id)} · ${selectedMacro.title}`,
        confidence: `${totalChanges}`,
        reason: "Track manual changes made in the step XLSX table: added rows, deleted rows, and row order changes.",
        missingItems: [
          `${microChangeStats.added} step(s) added manually`,
          `${microChangeStats.deleted} step(s) deleted manually`,
          `${microChangeStats.moved} step(s) moved to a new position`,
        ],
        evidenceTitle: "Step Change Summary",
        evidenceClass: "timing-exposure-list",
        evidenceItems: [
          { badge: `${microChangeStats.added}`, title: "Added", detail: "new step rows inserted" },
          { badge: `${microChangeStats.deleted}`, title: "Deleted", detail: "step rows removed", tone: "warn" },
          { badge: `${microChangeStats.moved}`, title: "Moved", detail: "rows reordered within the table" },
        ],
      });
    }

    function bind(root) {
      root?.querySelectorAll(".area-step-card").forEach((card) => {
        card.addEventListener("click", () => {
          setSelectedMacroStepId(card.dataset.sopId);
          setSelectedStepId(card.dataset.sopId);
          renderProcessTime();
        });
      });
    }

    return {
      render,
      renderPanel,
      bind,
    };
  }

  global.MciProcessTimePage = {
    createProcessTimePage,
  };
})(globalThis);
