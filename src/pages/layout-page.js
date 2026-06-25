(function attachLayoutPage(global) {
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function createLayoutPage({
    escapeHtml,
    formatStepId,
    stationStateLabel,
    getActiveStations,
    getSelectedStationId,
    setSelectedStationId,
    syncStationAutomationGrouping,
    getLineKpiSummary,
    getTargetCt,
    getMacroStep,
    getStepById,
    renderMappingStage,
    renderMappingPanel,
  }) {
    function getStationLayoutMeta(station) {
      if (!station.layoutWidth) station.layoutWidth = station.automation ? 2.4 : 0.9;
      if (!station.layoutDepth) station.layoutDepth = station.automation ? 1.4 : 0.9;
      if (!station.operatorSide) station.operatorSide = station.automation ? "Service side" : "Inside U";
      return {
        width: Number(station.layoutWidth) || 0.9,
        depth: Number(station.layoutDepth) || 0.9,
        operatorSide: station.operatorSide,
      };
    }

    function getLayoutStations() {
      syncStationAutomationGrouping();
      return getActiveStations().map((station) => {
        const meta = getStationLayoutMeta(station);
        return {
          station,
          ...meta,
          area: meta.width * meta.depth,
        };
      });
    }

    function getLayoutStationGeometry({ station, width, depth }, index) {
      const squareSize = 86;
      const left = 104;
      const topY = 74;
      const positions = [
        { x: left, y: topY + squareSize * 2 },
        { x: left + squareSize, y: topY + squareSize * 2 },
        { x: left + squareSize * 2, y: topY + squareSize * 2 },
        { x: left + squareSize * 3, y: topY + squareSize },
        { x: left + squareSize * 2, y: topY },
        { x: left + squareSize, y: topY },
      ];
      const position = positions[index] || positions[positions.length - 1];
      const blockWidth = squareSize;
      const blockHeight = squareSize;
      return {
        x: position.x,
        y: position.y,
        blockWidth,
        blockHeight,
        centerX: position.x + blockWidth / 2,
        centerY: position.y + blockHeight / 2,
      };
    }

    function renderOperator({ station }, index, bottomCount) {
      if (station.automation) return "";
      const geometry = getLayoutStationGeometry({ station, width: station.layoutWidth || 0.9, depth: station.layoutDepth || 0.9 }, index, bottomCount);
      const operatorScale = 0.46;
      const bottomRow = index <= 2;
      const topRow = index >= 4;
      const x = bottomRow ? geometry.centerX : topRow ? geometry.centerX : geometry.x - 10;
      const y = bottomRow ? geometry.y - 7 : topRow ? geometry.y + geometry.blockHeight + 18 : geometry.centerY + 6;
      return `
    <g class="layout-operator-icon" transform="translate(${x} ${y}) scale(${operatorScale})">
      <circle cx="0" cy="-12" r="8"></circle>
      <path d="M -12 2 Q 0 -8 12 2"></path>
      <path d="M -10 10 Q 0 20 10 10"></path>
      <path d="M -15 5 L -5 12 M 15 5 L 5 12"></path>
    </g>
  `;
    }

    function renderStationBlock({ station, width, depth }, index, bottomCount) {
      const { x, y, blockWidth, blockHeight, centerX } = getLayoutStationGeometry({ station, width, depth }, index, bottomCount);
      const stateClass = station.automation ? "auto" : station.state === "over" ? "risk" : "manual";
      const selectedClass = station.id === getSelectedStationId() ? "active" : "";

      return `
    <g class="layout-svg-station ${stateClass} ${selectedClass}" data-station-id="${escapeHtml(station.id)}" role="button" tabindex="0" aria-label="Show ${escapeHtml(station.id)} layout station information">
      <rect x="${x}" y="${y}" width="${blockWidth}" height="${blockHeight}" rx="0"></rect>
      <text x="${centerX}" y="${y + blockHeight / 2 - 5}" text-anchor="middle" class="station-id">${escapeHtml(station.id)}</text>
      <text x="${centerX}" y="${y + blockHeight / 2 + 14}" text-anchor="middle" class="station-size">${station.automation ? "A" : "M"} · ${width.toFixed(1)}x${depth.toFixed(1)}m</text>
    </g>
  `;
    }

    function renderCanvas() {
      const layoutStations = getLayoutStations();
      const bottomCount = Math.max(1, Math.ceil((layoutStations.length - 1) / 2));
      const floorWidth = 560;
      const floorHeight = 450;

      return `
    <div class="layout-page-board">
      <section class="layout-sketch-card">
        <div class="layout-sketch-head">
          <div>
            <b>Drawing</b>
            <span>Station blocks are connected edge-to-edge in a U-shaped layout.</span>
          </div>
          <em>Blueprint sketch</em>
        </div>
        <div class="layout-u-scroll">
          <svg class="layout-blueprint" viewBox="0 0 ${floorWidth} ${floorHeight}" role="img" aria-label="U-shaped station layout drawing">
            <rect class="layout-outer-border" x="22" y="18" width="${floorWidth - 44}" height="${floorHeight - 36}"></rect>
            ${layoutStations.map((item, index) => renderStationBlock(item, index, bottomCount)).join("")}
            ${layoutStations.map((item, index) => renderOperator(item, index, bottomCount)).join("")}
          </svg>
        </div>
        <div class="layout-legend">
          <span><i class="manual"></i>Manual station</span>
          <span><i class="auto"></i>Automation station</span>
          <span><i class="warn"></i>Near / risk station</span>
        </div>
      </section>
    </div>
  `;
    }

    function renderRows(refs) {
      if (!refs.rows) return;
      refs.rows.innerHTML = getLayoutStations()
        .map(({ station, width, depth, operatorSide }) => {
          return `
        <tr class="layout-dimension-row ${station.id === getSelectedStationId() ? "selected" : ""}" data-station-id="${station.id}">
          <td><b>${escapeHtml(station.id)}</b></td>
          <td><span class="automation-chip ${station.automation ? "auto" : ""}">${station.automation ? "A" : "M"}</span></td>
          <td><input class="layout-dimension-field" type="number" min="0.5" step="0.1" data-layout-field="layoutWidth" data-station-id="${station.id}" value="${width}" /></td>
          <td><input class="layout-dimension-field" type="number" min="0.5" step="0.1" data-layout-field="layoutDepth" data-station-id="${station.id}" value="${depth}" /></td>
          <td>
            <select class="layout-dimension-field" data-layout-field="operatorSide" data-station-id="${station.id}">
              ${["Inside U", "Outside U", "Service side", "No operator"].map((option) => `<option value="${option}" ${operatorSide === option ? "selected" : ""}>${option}</option>`).join("")}
            </select>
          </td>
          <td class="process-cell"><small>${station.steps.join(", ") || "No assigned step"}</small></td>
          <td class="process-cell"><small>${escapeHtml(station.issue)}</small></td>
        </tr>
      `;
        })
        .join("");

      refs.rows.querySelectorAll(".layout-dimension-row").forEach((row) => {
        row.addEventListener("click", () => {
          setSelectedStationId(row.dataset.stationId);
          renderMappingPanel();
        });
      });

      refs.rows.querySelectorAll(".layout-dimension-field").forEach((field) => {
        field.addEventListener("click", (event) => event.stopPropagation());
        field.addEventListener("input", () => updateStationLayoutFromField(field, refs));
        field.addEventListener("change", () => {
          updateStationLayoutFromField(field, refs);
          renderMappingStage();
        });
      });
    }

    function renderPanel(refs) {
      const layoutStations = getLayoutStations();
      const totalArea = layoutStations.reduce((sum, item) => sum + item.area, 0);
      const selected = layoutStations.find(({ station }) => station.id === getSelectedStationId());
      const lineKpi = getLineKpiSummary();
      setText(refs.missingTitle, "KPI");
      setText(refs.aiStepTitle, selected ? `Layout · ${selected.station.id}` : "U-shaped Layout Draft");
      setText(refs.confidence, selected ? stationStateLabel(selected.station.state) : `${totalArea.toFixed(1)}m²`);
      setText(
        refs.aiReason,
        selected
          ? `${selected.station.id} is selected on the U-shaped layout. The station detail below is linked to the active line balance plan and editable layout dimensions.`
          : "The U-shaped layout groups station blocks by flow sequence. AUTO is generated from A steps, while manual stations keep M steps from station balancing.",
      );
      if (refs.missingList) {
        if (selected) {
          const targetCt = getTargetCt();
          const load = targetCt ? ((Number(selected.station.time) || 0) / targetCt) * 100 : 0;
          refs.missingList.className = "layout-station-info-grid";
          refs.missingList.innerHTML = `
        <li><span>Space</span><strong>${selected.area.toFixed(1)}m²</strong><small>station footprint</small></li>
        <li><span>HC</span><strong>${selected.station.hc}</strong><small>planned headcount</small></li>
        <li><span>CT</span><strong>${selected.station.time}s</strong><small>${load.toFixed(0)}% of ${targetCt}s target</small></li>
        <li class="${selected.station.state === "over" ? "warn" : ""}"><span>Status</span><strong>${stationStateLabel(selected.station.state)}</strong><small>${escapeHtml(selected.station.issue)}</small></li>
      `;
        } else {
          refs.missingList.className = "line-kpi-card-grid";
          refs.missingList.innerHTML = `
        <li><span>Line LBE</span><strong>${lineKpi.lbe.toFixed(1)}%</strong><small>from Page 5 station plan</small></li>
        <li><span>Total HC</span><strong>${lineKpi.totalHc.toFixed(1)}</strong><small>planned resource</small></li>
        <li><span>Bottleneck CT</span><strong>${lineKpi.bottleneckCt.toFixed(0)}s</strong><small>slowest station</small></li>
        <li><span>Space</span><strong>${totalArea.toFixed(1)}m²</strong><small>total station footprint</small></li>
      `;
        }
      }
      setText(refs.evidenceTitle, selected ? "Station Info from Page 5" : "Layout Source");
      if (!refs.evidenceList) return;
      if (selected) {
        refs.evidenceList.className = "layout-station-workflows";
        const targetCt = getTargetCt();
        const stationLoad = targetCt ? ((Number(selected.station.time) || 0) / targetCt) * 100 : 0;
        const workflowCards = selected.station.steps.length
          ? selected.station.steps
              .map((stepId) => {
                const macro = getMacroStep(stepId);
                const aiStep = getStepById(stepId);
                const microRows = macro?.microSteps || [];
                return `
                <div class="layout-workflow-item">
                  <header>
                    <b>${formatStepId(stepId)}</b>
                    <span>${escapeHtml(macro?.title || aiStep?.process || "Unmapped workflow")}</span>
                    <small>${microRows.length} detailed step(s)</small>
                  </header>
                  <div class="layout-workflow-steps">
                    ${
                      microRows.length
                        ? microRows
                            .map(
                              (microStep, index) => `
                                <div>
                                  <b>${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}</b>
                                  <span>${escapeHtml(microStep[7] || "M")}</span>
                                  <small>${escapeHtml(microStep[0])}</small>
                                  <em>${escapeHtml(microStep[8] || aiStep?.material || "TBD")}</em>
                                </div>
                              `,
                            )
                            .join("")
                        : `<div class="layout-workflow-empty">No detailed steps assigned.</div>`
                    }
                  </div>
                </div>
              `;
              })
              .join("")
          : `<div class="layout-workflow-empty">No SOP workflow assigned yet.</div>`;
        refs.evidenceList.innerHTML = `
        <div class="layout-station-summary-card">
          <div><span>Station</span><strong>${escapeHtml(selected.station.id)}</strong></div>
          <div><span>Automation</span><strong>${selected.station.automation ? "A" : "M"}</strong></div>
          <div><span>HC</span><strong>${escapeHtml(selected.station.hc)}</strong></div>
          <div><span>CT</span><strong>${selected.station.time}s</strong></div>
          <div><span>Load</span><strong>${stationLoad.toFixed(0)}%</strong></div>
          <div><span>Status</span><strong>${stationStateLabel(selected.station.state)}</strong></div>
          <p>${escapeHtml(selected.station.note || "No station note")}</p>
          <small>${escapeHtml(selected.station.issue || "No station issue")}</small>
        </div>
        ${workflowCards}
      `;
      } else {
        refs.evidenceList.className = "timing-exposure-list";
        refs.evidenceList.innerHTML = `
        <div class="timing-exposure-row"><b>Station</b><span>Station assignment</span><small>sequence, A/M, HC, assigned steps</small></div>
        <div class="timing-exposure-row"><b>Size</b><span>Manual dimensions</span><small>Width and Depth from the table below</small></div>
        <div class="timing-exposure-row warn"><b>Risk</b><span>Quality / space risk</span><small>carried from Station Layout review</small></div>
      `;
      }
    }

    function updateStationLayoutFromField(field, refs) {
      const station = getActiveStations().find((item) => item.id === field.dataset.stationId);
      if (!station) return;
      const key = field.dataset.layoutField;
      if (key === "layoutWidth" || key === "layoutDepth") {
        station[key] = Math.max(0.5, Number(field.value) || 0.5);
      } else if (key === "operatorSide") {
        station.operatorSide = field.value;
      }
      setSelectedStationId(station.id);
      if (refs.twinCanvas) refs.twinCanvas.innerHTML = renderCanvas();
      renderPanel(refs);
    }

    function selectLayoutStation(stationId) {
      setSelectedStationId(stationId);
      renderMappingStage();
    }

    function bindCanvas(refs) {
      refs.twinCanvas?.querySelectorAll(".layout-svg-station[data-station-id]").forEach((stationNode) => {
        stationNode.addEventListener("click", () => selectLayoutStation(stationNode.dataset.stationId));
        stationNode.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectLayoutStation(stationNode.dataset.stationId);
          }
        });
      });
      renderPanel(refs);
    }

    return {
      getStationLayoutMeta,
      getLayoutStations,
      renderCanvas,
      renderRows,
      renderPanel,
      bindCanvas,
      updateStationLayoutFromField,
      selectLayoutStation,
    };
  }

  global.MciLayoutPage = {
    createLayoutPage,
  };
})(globalThis);
