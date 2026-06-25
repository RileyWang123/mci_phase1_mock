(function attachStationPage(global) {
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function createStationPage({
    stationPlanMeta,
    expandedStations,
    expandedStationWorkflows,
    escapeHtml,
    formatStepId,
    stationFieldLabels,
    stationTraceLog,
    getActiveStationPlanId,
    getSelectedStationId,
    getStationViewMode,
    setSelectedStationId,
    setStationViewMode,
    syncStationAutomationGrouping,
    getActiveStations,
    getStationPlanSummary,
    getStationDraft,
    getStationKpiRows,
    getLineKpiSummary,
    getTargetCt,
    getStationMicroSteps,
    getMacroStep,
    getStepById,
    getMicroAutomation,
    getMicroPt,
    getActualPt,
    stationSnapshot,
    applyStationSnapshot,
    updateStationTiming,
    selectStationPlan,
    renderStationStage,
    showToast,
  }) {
    function renderPlanCards() {
      const activeStationPlanId = getActiveStationPlanId();
      return `
    <div class="station-plan-grid">
      ${Object.keys(stationPlanMeta)
        .map((planId) => {
          const summary = getStationPlanSummary(planId);
          return `
            <button class="station-plan-card ${planId === activeStationPlanId ? "active" : ""}" type="button" data-action="select-station-plan" data-plan-id="${planId}">
              <span>${summary.name}</span>
              <strong>${summary.label}</strong>
              <small>${summary.description}</small>
              <em>${summary.lbe.toFixed(1)}% LBE · ${summary.stations.length} stations · ${summary.totalHc.toFixed(1)} HC</em>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
    }

    function renderWorkflowDetails(station) {
      const rows = station.steps.flatMap((stepId) => {
        const macro = getMacroStep(stepId);
        const aiStep = getStepById(stepId);
        return getStationMicroSteps(station, stepId).map(({ microStep, index }) => ({
          stepId,
          macro,
          aiStep,
          microStep,
          index,
        }));
      });

      return `
    <section class="station-workflow-details">
      <div class="station-workflow-expanded">
        <div class="station-workflow-head"><span>Step</span><span>Automation</span><span>Step Description</span><span>Part</span><span>Theoretical PT (secs)</span><span>Actual PT (secs)</span></div>
        ${
          rows.length
            ? rows
                .map(({ stepId, macro, aiStep, microStep, index }) => {
                  const part = aiStep?.material || macro?.station || "TBD";
                  return `
                    <div class="station-workflow-step">
                      <span><b>${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}</b></span>
                      <span><em class="automation-chip ${getMicroAutomation(microStep) === "A" ? "auto" : ""}">${getMicroAutomation(microStep)}</em></span>
                      <span>${escapeHtml(microStep[0])}</span>
                      <span>${escapeHtml(part)}</span>
                      <span>${getMicroPt(microStep, index)}</span>
                      <span>${getActualPt(microStep, index)}</span>
                    </div>
                  `;
                })
                .join("")
            : `<div class="station-workflow-empty">No detailed steps assigned yet.</div>`
        }
      </div>
    </section>
  `;
    }

    function renderCanvas() {
      syncStationAutomationGrouping();
      const stations = getActiveStations();
      const selectedStationId = getSelectedStationId();
      const activeSummary = getStationPlanSummary(getActiveStationPlanId());

      return `
    <div class="station-board">
      <section class="station-edit-workspace">
        ${renderPlanCards()}
        <div class="station-line-balance-summary">
          <span>Line Balance Efficiency</span>
          <strong>${activeSummary.lbe.toFixed(1)}%</strong>
        </div>
        <div class="station-table-toolbar">
          <button class="station-table-action primary" type="button" data-action="add-station">+ Add Station</button>
          <select class="station-delete-select" data-action="select-delete-station">
            <option value="">Select station to delete</option>
            ${stations.map((station) => `<option value="${station.id}" ${selectedStationId === station.id ? "selected" : ""} ${station.automation ? "disabled" : ""}>${station.id} · ${station.note}</option>`).join("")}
          </select>
          <button class="station-table-action danger" type="button" data-action="delete-station" ${selectedStationId ? "" : "disabled"}>Delete Station</button>
        </div>
        <div class="station-edit-head"><span>Station</span><span>Automation</span><span>Assigned steps</span><span>HC</span><span>Status / Trace</span></div>
        ${stations
          .map((station) => {
            const disabled = station.editing ? "" : "disabled";
            const selected = station.id === selectedStationId;
            const stateClass = selected ? station.state : "";
            const isStationOpen = Boolean(expandedStations[station.id]);
            return `
              <section class="station-edit-row ${stateClass} ${station.automation ? "automation" : ""} ${station.override ? "override" : ""} ${station.editing ? "editing" : ""} ${selected ? "active" : ""}" data-station-id="${station.id}">
                <div class="station-code-cell">
                  <button class="station-expand-toggle" type="button" data-station-id="${station.id}" aria-label="Toggle station details">${isStationOpen ? "−" : "+"}</button>
                <input class="station-field station-code-field" data-field="id" value="${station.id}" ${disabled} />
                </div>
                <div class="station-automation-cell"><span class="automation-chip ${station.automation ? "auto" : ""}">${station.automation ? "A" : "M"}</span></div>
                <textarea class="station-field" rows="2" data-field="steps" ${disabled}>${station.steps.join(", ")}</textarea>
                <input class="station-field station-hc-field" data-field="hc" value="${station.hc}" ${disabled} />
                <div class="station-edit-actions">
                  <div class="station-action-row">
                    <button class="station-action" data-action="edit" type="button">${station.editing ? "Editing" : "Edit"}</button>
                    <button class="station-action submit" data-action="submit" type="button">Confirm</button>
                  </div>
                </div>
              </section>
              ${isStationOpen ? renderWorkflowDetails(station) : ""}
            `;
          })
          .join("")}
      </section>
      <div class="station-edit-footer"><span>Station time is recalculated from locked step time after assignment changes.</span><b>Total HC ${activeSummary.totalHc.toFixed(1)}</b></div>
        </div>
  `;
    }

    function renderKpiCanvas() {
      const summary = getStationPlanSummary(getActiveStationPlanId());
      const targetCt = getTargetCt();
      const rows = getStationKpiRows();
      const maxCt = Math.max(targetCt, ...rows.map(({ ct }) => ct));
      const chartMax = Math.max(10, Math.ceil((maxCt * 1.15) / 10) * 10);
      const targetLineBottom = Math.min(100, (targetCt / chartMax) * 100);
      const yTicks = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];

      return `
    <div class="station-board station-kpi-board">
      <section class="station-edit-workspace">
        ${renderPlanCards()}
        <div class="station-line-balance-summary">
          <span>KPI Performance · ${summary.name}</span>
          <strong>${summary.lbe.toFixed(1)}%</strong>
        </div>
        <div class="station-ct-chart-card">
          <div class="station-ct-chart-head">
            <div>
              <b>Station CT Performance</b>
              <span>X-axis: station · Y-axis: CT (secs)</span>
            </div>
            <em>Target CT ${targetCt}s</em>
          </div>
          <div class="station-ct-chart">
            <div class="station-ct-y-axis">
              ${yTicks.map((tick) => `<span>${tick}s</span>`).join("")}
            </div>
            <div class="station-ct-plot" style="--target-line-bottom:${targetLineBottom}%;">
              <div class="station-ct-target-line"><span>Target CT ${targetCt}s</span></div>
              ${rows
                .map(({ station, ct, ctOverTarget }) => {
                  const height = Math.max(2, Math.min(100, (ct / chartMax) * 100));
                  return `
                    <article class="station-ct-bar ${ctOverTarget ? "over-target" : ""}" style="--bar-height:${height}%;">
                      <div class="station-ct-bar-track">
                        <i></i>
                      </div>
                      <strong>${ct.toFixed(0)}s</strong>
                      <span>${escapeHtml(station.id)}</span>
                    </article>
                  `;
                })
                .join("")}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
    }

    function renderViewActions(refs) {
      setText(refs.evidenceTitle, "Station View");
      if (!refs.evidenceList) return;
      refs.evidenceList.className = "station-view-actions";
      refs.evidenceList.innerHTML = `
    <button class="${getStationViewMode() === "plan" ? "active" : ""}" type="button" data-action="station-view-plan">Station Plan</button>
    <button class="${getStationViewMode() === "kpi" ? "active" : ""}" type="button" data-action="station-view-kpi">KPI Performance</button>
  `;
      refs.evidenceList.querySelector("[data-action='station-view-plan']")?.addEventListener("click", () => setStationViewMode("plan"));
      refs.evidenceList.querySelector("[data-action='station-view-kpi']")?.addEventListener("click", () => setStationViewMode("kpi"));
    }

    function renderPanel(refs) {
      syncStationAutomationGrouping();
      const station = getStationDraft();
      const stations = getActiveStations();
      const activeSummary = getStationPlanSummary(getActiveStationPlanId());
      if (getStationViewMode() === "kpi") {
        const lineKpi = getLineKpiSummary();
        setText(refs.aiStepTitle, `Line KPI · ${lineKpi.name}`);
        setText(refs.confidence, `${lineKpi.lbe.toFixed(1)}%`);
        setText(refs.aiReason, "Line-level KPI is evaluated on the whole station plan. The main chart keeps only station-level HC and CT target comparison.");
        setText(refs.missingTitle, "KPI");
        if (refs.missingList) {
          refs.missingList.className = "line-kpi-card-grid";
          refs.missingList.innerHTML = `
        <li><span>Line LBE</span><strong>${lineKpi.lbe.toFixed(1)}%</strong><small>overall balance</small></li>
        <li><span>Total HC</span><strong>${lineKpi.totalHc.toFixed(1)}</strong><small>planned resource</small></li>
        <li><span>Bottleneck CT</span><strong>${lineKpi.bottleneckCt.toFixed(0)}s</strong><small>slowest station</small></li>
        <li><span>Line UPPH</span><strong>${lineKpi.lineUpph.toFixed(1)}</strong><small>from bottleneck CT</small></li>
        <li class="${lineKpi.overTargetCount ? "warn" : ""}"><span>Over Target</span><strong>${lineKpi.overTargetCount}</strong><small>station count</small></li>
      `;
        }
        renderViewActions(refs);
        return;
      }
      if (!station) {
        const overCount = stations.filter((item) => item.state === "over").length;
        const overrideCount = stations.filter((item) => item.override).length;
        setText(refs.aiStepTitle, `Station Balance · ${activeSummary.name}`);
        setText(refs.confidence, `${activeSummary.lbe.toFixed(1)}%`);
        setText(refs.aiReason, `${activeSummary.label}: ${activeSummary.description}`);
        if (refs.missingList) {
          refs.missingList.innerHTML = `
        <li>${stations.length} stations in this plan</li>
        <li>${overCount} station over target CT</li>
        <li>${overrideCount} manual override submitted</li>
      `;
        }
        renderViewActions(refs);
        return;
      }

      const targetCt = 58;
      const load = Math.round((station.time / targetCt) * 100);
      const over = station.time > targetCt;
      const latestTrace = station.trace[0];
      setText(refs.aiStepTitle, `Station Balance · ${station.id}${station.override ? " · Human Override" : ""}`);
      setText(refs.confidence, station.override ? "Traced" : over ? "Hold" : "Ready");
      setText(
        refs.aiReason,
        station.override
          ? `${station.id} has a submitted human change. The system keeps the AI baseline, last submitted value, and current trace; downstream MI / Line Balance export must carry the override mark.`
          : over
            ? `${station.id} is currently ${station.time}s, above the locked target CT of ${targetCt}s. AI recommends keeping CTQ / locked steps unchanged first, then moving splittable actions to a lower-load station.`
            : `${station.id} is currently ${station.time}s, below the locked target CT of ${targetCt}s. The station draft can proceed to human confirmation.`,
      );
      if (refs.missingList) {
        refs.missingList.innerHTML = `
      <li>Target CT: ${targetCt}s, locked from the previous CT calculation step</li>
      <li>Assigned steps: ${station.steps.join(", ")}</li>
      <li>Station load: ${load}% · HC ${station.hc}</li>
      <li>${station.issue}</li>
      ${station.override ? `<li>Manual override submitted: ${latestTrace?.time || "trace recorded"}</li>` : ""}
    `;
      }
      renderViewActions(refs);
    }

    function renderRows(refs) {
      if (!refs.rows) return;
      syncStationAutomationGrouping();
      const targetCt = getTargetCt();
      const selectedStationId = getSelectedStationId();
      refs.rows.innerHTML = getActiveStations()
        .map((station) => {
          const load = Math.round((station.time / targetCt) * 100);
          const chipClass = station.override ? "risk-med" : station.state === "over" ? "risk-high" : "risk-low";
          const status = station.override
            ? "Human override"
            : station.state === "over"
              ? "Needs rebalance"
              : "Within CT";
          return `
        <tr data-station-id="${station.id}" class="${station.id === selectedStationId ? "selected" : ""} station-row-${station.state} ${station.override ? "override-row" : ""}">
          <td><b>${station.id}</b></td>
          <td class="process-cell"><strong>${station.note}</strong><small>${station.steps.map((stepId) => `${stepId} ${getStepById(stepId)?.process || ""}`).join(" · ")}</small></td>
          <td><strong class="time-cell">${station.time}s</strong></td>
          <td>${targetCt}s</td>
          <td>${load}%</td>
          <td>${station.hc}</td>
          <td class="process-cell"><small>${station.issue}</small></td>
          <td><span class="chip ${chipClass}">${status}</span></td>
        </tr>
      `;
        })
        .join("");

      refs.rows.querySelectorAll("tr").forEach((row) => {
        row.addEventListener("click", () => {
          setSelectedStationId(row.dataset.stationId);
          renderStationStage();
        });
      });
    }

    function selectStation(stationId, refs) {
      setSelectedStationId(stationId);
      refs.twinCanvas?.querySelectorAll("[data-station-id]").forEach((node) => {
        node.classList.toggle("active", node.dataset.stationId === getSelectedStationId());
      });
      renderPanel(refs);
    }

    function beginStationEdit(stationId) {
      const station = getStationDraft(stationId);
      if (!station) return;
      station.editing = true;
      setSelectedStationId(station.id);
      renderStationStage();
    }

    function addStationDraft() {
      const stations = getActiveStations();
      const maxStationNumber = stations.reduce((max, station) => {
        const match = station.id.match(/\d+/);
        return Math.max(max, match ? Number(match[0]) : 0);
      }, 0);
      const id = `ST${String(maxStationNumber + 1).padStart(2, "0")}`;
      const station = {
        id,
        time: 0,
        hc: "1.0",
        state: "light",
        steps: [],
        note: "New station work content",
        issue: "Manual station added",
        editing: true,
      };
      const baseline = stationSnapshot(station);
      station.aiBaseline = { ...baseline };
      station.lastSubmitted = { ...baseline };
      station.trace = [];
      stations.push(station);
      setSelectedStationId(id);
      renderStationStage();
      showToast(`${id} added`);
    }

    function deleteSelectedStation() {
      const selectedStationId = getSelectedStationId();
      if (!selectedStationId) return;
      const stations = getActiveStations();
      const index = stations.findIndex((station) => station.id === selectedStationId);
      if (index < 0) return;
      if (stations[index].automation) {
        showToast("AUTO station is generated from A steps and cannot be deleted");
        return;
      }
      const [removed] = stations.splice(index, 1);
      setSelectedStationId(stations[Math.max(0, index - 1)]?.id || stations[0]?.id || "");
      renderStationStage();
      showToast(`${removed.id} deleted`);
    }

    function cancelStationEdit(stationId) {
      const station = getStationDraft(stationId);
      if (!station) return;
      applyStationSnapshot(station, station.lastSubmitted);
      station.editing = false;
      setSelectedStationId(station.id);
      renderStationStage();
      showToast(`${station.id} changes canceled`);
    }

    function submitStationOverride(stationId) {
      const station = getStationDraft(stationId);
      if (!station) return;
      const previous = station.lastSubmitted;
      const current = stationSnapshot(station);
      const changes = Object.keys(current)
        .filter((key) => current[key] !== previous[key])
        .map((key) => ({
          field: key,
          label: stationFieldLabels[key] || key,
          from: previous[key],
          to: current[key],
        }));

      station.editing = false;

      if (!changes.length) {
        renderStationStage();
        showToast(`${station.id} has no submitted change`);
        return;
      }

      const entry = {
        stationId: current.id,
        time: new Date().toLocaleString(),
        changes,
      };

      station.override = true;
      station.trace.unshift(entry);
      stationTraceLog.unshift(entry);
      station.lastSubmitted = { ...current };
      setSelectedStationId(current.id);
      renderStationStage();
      showToast(`${current.id} override submitted and traced`);
    }

    function refreshStationDraftFromField(field, refs) {
      const row = field.closest(".station-edit-row");
      const station = getActiveStations().find((item) => item.id === row?.dataset.stationId);
      if (!station) return;
      const value = field.value.trim();
      const key = field.dataset.field;
      if (key === "steps") {
        station.steps = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        updateStationTiming(station);
      } else if (key === "id") {
        const previousId = station.id;
        station.id = value || previousId;
        row.dataset.stationId = station.id;
        setSelectedStationId(station.id);
      } else if (key === "hc") station.hc = value || "0";
      else if (key === "note" || key === "issue") station[key] = value;
      selectStation(station.id, refs);
    }

    function bindCanvas(refs) {
      refs.twinCanvas?.querySelectorAll("[data-action='select-station-plan']").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          selectStationPlan(button.dataset.planId);
        });
      });
      refs.twinCanvas?.querySelector("[data-action='add-station']")?.addEventListener("click", addStationDraft);
      refs.twinCanvas?.querySelector("[data-action='select-delete-station']")?.addEventListener("change", (event) => {
        setSelectedStationId(event.target.value);
        renderStationStage();
      });
      refs.twinCanvas?.querySelector("[data-action='delete-station']")?.addEventListener("click", deleteSelectedStation);
      refs.twinCanvas?.querySelectorAll(".station-expand-toggle").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const stationId = button.dataset.stationId;
          expandedStations[stationId] = !expandedStations[stationId];
          setSelectedStationId(stationId);
          renderStationStage();
        });
      });
      refs.twinCanvas?.querySelectorAll(".station-workflow-toggle").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const key = `${button.dataset.stationId}:${button.dataset.stepId}`;
          expandedStationWorkflows[key] = !expandedStationWorkflows[key];
          setSelectedStationId(button.dataset.stationId);
          renderStationStage();
        });
      });
      refs.twinCanvas?.querySelectorAll(".station-edit-row[data-station-id]").forEach((stationNode) => {
        stationNode.addEventListener("click", () => selectStation(stationNode.dataset.stationId, refs));
      });
      refs.twinCanvas?.querySelectorAll(".station-action").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const row = button.closest(".station-edit-row");
          const stationId = row?.dataset.stationId;
          if (!stationId) return;
          if (button.dataset.action === "edit") beginStationEdit(stationId);
          if (button.dataset.action === "submit") submitStationOverride(stationId);
        });
      });
      refs.twinCanvas?.querySelectorAll(".station-edit-row input, .station-edit-row textarea, .station-edit-row select").forEach((field) => {
        field.addEventListener("focus", () => {
          const row = field.closest(".station-edit-row");
          if (row) selectStation(row.dataset.stationId, refs);
        });
        field.addEventListener("input", () => refreshStationDraftFromField(field, refs));
        field.addEventListener("change", () => refreshStationDraftFromField(field, refs));
      });
    }

    return {
      renderCanvas,
      renderKpiCanvas,
      renderPanel,
      renderPlanCards,
      renderWorkflowDetails,
      renderViewActions,
      renderRows,
      bindCanvas,
      beginStationEdit,
      addStationDraft,
      deleteSelectedStation,
      cancelStationEdit,
      submitStationOverride,
      refreshStationDraftFromField,
      selectStation,
    };
  }

  global.MciStationPage = {
    createStationPage,
  };
})(globalThis);
