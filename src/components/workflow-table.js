(function attachWorkflowTable(global) {
  function createWorkflowTable({
    steps,
    escapeHtml,
    formatStepId,
    formatStepNumber,
    getMacroStep,
    getMicroPt,
    getActualPt,
    getMicroAutomation,
    hasMicroFlag,
    getSelectedStepId,
    setSelectedStepId,
    setSelectedMacroStepId,
    getDraggedSopStepId,
    setDraggedSopStepId,
    getDraggedMicroStep,
    setDraggedMicroStep,
    getCurrentStageKey,
    renderRows,
    renderParse,
    renderSteps,
    renderAI,
    scrollSelectedSopStepIntoView,
    moveSopStep,
    swapMicroSteps,
    updateWorkflowFromField,
    updateMicroStepDraftFromField,
    updateMicroStepFromField,
    deleteMicroStep,
    confirmMicroStep,
  }) {
    function renderRowsHtml({ showTiming }) {
      const selectedStepId = getSelectedStepId();
      if (!steps.length) {
        return `<tr><td class="micro-empty-row" colspan="${showTiming ? 8 : 6}">No parsed SOP workflows yet. Run Parse Uploaded Inputs on Page 01.</td></tr>`;
      }
      return steps
        .map((step, macroIndex) => {
          const macro = getMacroStep(step.id);
          const detailedSteps = macro?.microSteps?.length ? macro.microSteps : [["New step", "TBD", 3, "Edit", 3]];
          return detailedSteps
            .map((microStep, index) => {
              const groupClass = macroIndex % 2 === 0 ? "micro-group-green" : "micro-group-blue";
              const movedClass = hasMicroFlag(microStep, "moved") ? "micro-moved" : "";
              const pt = getMicroPt(microStep, index);
              const actualPt = getActualPt(microStep, index);
              const automation = getMicroAutomation(microStep);
              return `
            <tr class="workflow-breakdown-row ${groupClass} ${movedClass} ${step.id === selectedStepId ? "selected" : ""}" data-id="${step.id}" data-macro-id="${step.id}" data-micro-index="${index}">
              ${
                index === 0
                  ? `<td class="workflow-master-cell" rowspan="${detailedSteps.length}" data-step-id="${step.id}">
                    <div class="workflow-master-card">
                      <div class="workflow-master-head">
                        <button class="workflow-sop-drag-handle" type="button" draggable="true" data-step-id="${step.id}" title="Drag SOP workflow" aria-label="Drag SOP workflow">⋮⋮</button>
                        <span>Workflow ${formatStepNumber(step.id)}</span>
                      </div>
                      <input class="workflow-edit-field workflow-title-field" data-step-id="${step.id}" data-field="process" value="${escapeHtml(step.process)}" />
                    </div>
                  </td>`
                  : ""
              }
              <td class="workflow-step-cell"><button class="workflow-drag-handle" type="button" draggable="true" data-macro-id="${step.id}" data-micro-index="${index}" title="Drag to move step" aria-label="Drag to move step">⋮⋮</button><b>${formatStepId(step.id)}.${String(index + 1).padStart(2, "0")}</b></td>
              <td>
                <select class="micro-edit-field micro-automation-field" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="7">
                  <option value="M" ${automation === "M" ? "selected" : ""}>M</option>
                  <option value="A" ${automation === "A" ? "selected" : ""}>A</option>
                </select>
              </td>
              <td><textarea class="micro-edit-field micro-action-field workflow-step-description" rows="2" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="0">${escapeHtml(microStep[0])}</textarea></td>
              <td><input class="workflow-edit-field workflow-part-field" data-step-id="${step.id}" data-field="material" value="${escapeHtml(step.material || "TBD")}" /></td>
              ${
                showTiming
                  ? `<td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="2" value="${pt}" /></td>
              <td><input class="micro-edit-field micro-time-field" type="number" min="0" step="0.5" data-macro-id="${step.id}" data-micro-index="${index}" data-micro-field="4" value="${actualPt}" /></td>`
                  : ""
              }
              <td class="micro-actions-cell"><button class="micro-confirm-step" type="button" data-action="confirm-micro-step" data-macro-id="${step.id}" data-micro-index="${index}">Confirm</button><button class="micro-delete-step" type="button" data-action="delete-micro-step" data-macro-id="${step.id}" data-micro-index="${index}">Delete</button></td>
            </tr>
          `;
            })
            .join("");
        })
        .join("");
    }

    function bind(root) {
      root.querySelectorAll(".workflow-master-cell").forEach((cell) => {
        cell.addEventListener("dragover", (event) => {
          if (!getDraggedSopStepId()) return;
          event.preventDefault();
          event.stopPropagation();
          cell.classList.add("drop-target");
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        });
        cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
        cell.addEventListener("drop", (event) => {
          if (!getDraggedSopStepId()) return;
          event.preventDefault();
          event.stopPropagation();
          const sourceId = event.dataTransfer?.getData("text/plain") || getDraggedSopStepId();
          cell.classList.remove("drop-target");
          setDraggedSopStepId("");
          moveSopStep(sourceId, cell.dataset.stepId);
        });
      });

      root.querySelectorAll(".workflow-sop-drag-handle").forEach((handle) => {
        handle.addEventListener("click", (event) => event.stopPropagation());
        handle.addEventListener("dragstart", (event) => {
          event.stopPropagation();
          setDraggedSopStepId(handle.dataset.stepId);
          event.dataTransfer?.setData("text/plain", getDraggedSopStepId());
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          handle.closest(".workflow-master-cell")?.classList.add("dragging");
        });
        handle.addEventListener("dragend", () => {
          setDraggedSopStepId("");
          handle.closest(".workflow-master-cell")?.classList.remove("dragging");
          root.querySelectorAll(".workflow-master-cell.drop-target").forEach((node) => node.classList.remove("drop-target"));
        });
      });

      root.querySelectorAll(".workflow-breakdown-row").forEach((row) => {
        row.addEventListener("click", () => {
          setSelectedStepId(row.dataset.id);
          setSelectedMacroStepId(row.dataset.macroId);
          if (getCurrentStageKey() === "parse") {
            renderParse();
            scrollSelectedSopStepIntoView();
          } else {
            renderSteps();
          }
        });
        row.addEventListener("dragover", (event) => {
          event.preventDefault();
          row.classList.add("drop-target");
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        });
        row.addEventListener("dragleave", () => row.classList.remove("drop-target"));
        row.addEventListener("dragend", () => {
          row.classList.remove("dragging", "drop-target");
          setDraggedMicroStep(null);
        });
        row.addEventListener("drop", (event) => {
          event.preventDefault();
          row.classList.remove("drop-target");
          const draggedMicroStep = getDraggedMicroStep();
          if (!draggedMicroStep) return;
          swapMicroSteps(draggedMicroStep.macroId, draggedMicroStep.index, row.dataset.macroId, Number(row.dataset.microIndex));
          setDraggedMicroStep(null);
        });
      });

      root.querySelectorAll(".workflow-drag-handle").forEach((handle) => {
        handle.addEventListener("click", (event) => event.stopPropagation());
        handle.addEventListener("dragstart", (event) => {
          const row = handle.closest(".workflow-breakdown-row");
          setDraggedMicroStep({ macroId: handle.dataset.macroId, index: Number(handle.dataset.microIndex) });
          row?.classList.add("dragging");
          event.dataTransfer?.setData("text/plain", `${handle.dataset.macroId}:${handle.dataset.microIndex}`);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        });
        handle.addEventListener("dragend", () => {
          handle.closest(".workflow-breakdown-row")?.classList.remove("dragging", "drop-target");
          setDraggedMicroStep(null);
        });
      });

      root.querySelectorAll(".workflow-edit-field").forEach((field) => {
        field.addEventListener("click", (event) => event.stopPropagation());
        field.addEventListener("input", () => updateWorkflowFromField(field));
        field.addEventListener("change", () => {
          updateWorkflowFromField(field);
          renderSteps();
        });
      });

      root.querySelectorAll(".micro-edit-field").forEach((field) => {
        field.addEventListener("click", (event) => event.stopPropagation());
        field.addEventListener("input", () => updateMicroStepDraftFromField(field));
        field.addEventListener("change", () => updateMicroStepFromField(field));
      });

      root.querySelectorAll("[data-action='delete-micro-step']").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
        });
      });

      root.querySelectorAll("[data-action='confirm-micro-step']").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          confirmMicroStep(Number(button.dataset.microIndex), button.dataset.macroId);
        });
      });
    }

    function render(root, options) {
      if (!root) return;
      root.innerHTML = renderRowsHtml(options);
      bind(root);
      renderRows?.();
    }

    return {
      renderRowsHtml,
      bind,
      render,
    };
  }

  global.MciWorkflowTable = {
    createWorkflowTable,
  };
})(globalThis);
