(function attachMiOutputPage(global) {
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function createMiOutputPage({
    sopMacroSteps,
    stationMaterialLists,
    escapeHtml,
    formatStepId,
    stationStateLabel,
    getActiveStations,
    getTargetCt,
    getMacroStepById,
    getAiStepById,
    renderOutputStage,
    showToast,
  }) {
    function getStationMaterialList(stationId) {
      return stationMaterialLists.find((list) => list.station === stationId);
    }

    function getStationStepRows(station) {
      return station.steps.flatMap((stepId) => {
        const macro = getMacroStepById(stepId);
        const aiStep = getAiStepById(stepId);
        const partName = aiStep?.material || macro?.station || "TBD";
        const microRows = macro?.microSteps || [];
        if (!microRows.length) {
          return [
            {
              step: formatStepId(stepId),
              description: aiStep?.detail || station.note,
              partName,
              partNumber: `ASM-${formatStepId(stepId)}-000`,
            },
          ];
        }
        return microRows.map((microStep, index) => ({
          step: `${formatStepId(stepId)}.${String(index + 1).padStart(2, "0")}`,
          description: microStep[0],
          partName: microStep[8] || partName,
          partNumber: `ASM-${formatStepId(stepId)}-${String(index + 1).padStart(3, "0")}`,
        }));
      });
    }

    function getQualityRiskRows(station) {
      if (!Array.isArray(station.miQualityRisks)) station.miQualityRisks = ["", "", ""];
      while (station.miQualityRisks.length < 3) station.miQualityRisks.push("");
      return station.miQualityRisks.slice(0, 3);
    }

    function renderCanvas() {
      const targetCt = getTargetCt();
      const stations = getActiveStations();
      const allBomItems = stationMaterialLists.flatMap((station) => station.items);
      const reviewItems = allBomItems.filter((item) => item[5] !== "Matched");
      const totalHc = stations.reduce((sum, station) => sum + Number(station.hc), 0);

      return `
    <div class="mi-package-view">
      <section class="mi-package-header">
        <div>
          <span class="mi-kicker">Manufacturing Instruction · AI Draft</span>
          <h3>MI Package Preview</h3>
          <p>Rebuilt from generated steps, station layout, Station BOM List, and human input constraints. This page learns the MI information hierarchy without copying Excel.</p>
        </div>
        <div class="mi-release-summary">
          <b>Target CT ${targetCt}s</b>
          <span>${stations.length} stations · ${sopMacroSteps.length} macro steps · ${totalHc.toFixed(1)} HC</span>
          <em>${reviewItems.length} BOM / tooling item(s) need confirmation</em>
        </div>
      </section>

      <section class="mi-document-fields">
        <div><span>Product</span><strong>XPS-14 Thermal Module Assembly</strong></div>
        <div><span>Revision</span><strong>Rev B03 · Draft</strong></div>
        <div><span>Source Alignment</span><strong>Steps + Station Draft + BOM List</strong></div>
        <div><span>Release Gate</span><strong>ME/QE review before export</strong></div>
      </section>

      <section class="mi-station-output-list">
        ${stations
          .map((station) => {
            const stationStepRows = getStationStepRows(station);
            const qualityRiskRows = getQualityRiskRows(station);
            const status = stationStateLabel(station.state);
            const stateClass = station.state === "over" ? "warn" : "";

            return `
              <article class="mi-station-output-card ${stateClass}">
                <header>
                  <div>
                    <b>${station.id}</b>
                    <h4>${station.note}</h4>
                    <p>${station.issue}</p>
                  </div>
                  <div class="mi-station-meta">
                    <strong>${station.time}s</strong>
                    <span>${status} · Target CT ${targetCt}s · ${station.hc} HC</span>
                    <div class="mi-station-meta-actions">
                      <label class="mi-ctq-inline">
                        <span>CTQ</span>
                        <textarea rows="2" data-mi-ctq-station="${station.id}" placeholder="Fill station CTQ">${escapeHtml(station.miCtq || "")}</textarea>
                      </label>
                      <label class="mi-image-upload">
                        <input type="file" accept="image/*" data-mi-image-station="${station.id}" />
                        <span>Upload Image</span>
                      </label>
                    </div>
                    ${station.miImageName ? `<small class="mi-image-name">${escapeHtml(station.miImageName)}</small>` : ""}
                  </div>
                </header>
                ${
                  station.miImageUrl
                    ? `<div class="mi-station-image-preview"><img src="${station.miImageUrl}" alt="${station.id} uploaded station reference" /></div>`
                    : ""
                }

                <div class="mi-station-grid mi-station-final-output">
                  <section>
                    <h5>Step List</h5>
                    <div class="mi-step-list-table">
                      <div class="mi-step-list-head"><span>Step</span><span>Step Description</span><span>Part Name</span><span>Part Number</span></div>
                      ${
                        stationStepRows.length
                          ? stationStepRows
                              .map(
                                (row) => `
                                  <div class="mi-step-list-row">
                                    <b>${escapeHtml(row.step)}</b>
                                    <span>${escapeHtml(row.description)}</span>
                                    <small>${escapeHtml(row.partName)}</small>
                                    <em>${escapeHtml(row.partNumber)}</em>
                                  </div>
                                `,
                              )
                              .join("")
                          : `<div class="mi-step-list-empty">No detailed steps assigned.</div>`
                      }
                    </div>
                  </section>

                  <section>
                    <h5>Quality Risk</h5>
                    <div class="mi-quality-risk-table">
                      <div class="mi-quality-risk-head"><span>#</span><span>Risk Description</span></div>
                      ${qualityRiskRows
                        .map(
                          (risk, index) => `
                            <div class="mi-quality-risk-row">
                              <b>${index + 1}</b>
                              <textarea rows="2" data-mi-risk-station="${station.id}" data-mi-risk-index="${index}" placeholder="Fill quality risk">${escapeHtml(risk)}</textarea>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>
                  </section>
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
    </div>
  `;
    }

    function updateCtq(field) {
      const station = getActiveStations().find((item) => item.id === field.dataset.miCtqStation);
      if (!station) return;
      station.miCtq = field.value;
    }

    function updateQualityRisk(field) {
      const station = getActiveStations().find((item) => item.id === field.dataset.miRiskStation);
      const index = Number(field.dataset.miRiskIndex);
      if (!station || !Number.isFinite(index)) return;
      getQualityRiskRows(station);
      station.miQualityRisks[index] = field.value;
    }

    function bind(refs) {
      refs.twinCanvas?.querySelectorAll("[data-mi-image-station]").forEach((input) => {
        input.addEventListener("change", () => {
          const station = getActiveStations().find((item) => item.id === input.dataset.miImageStation);
          const file = input.files?.[0];
          if (!station || !file) return;
          station.miImageName = file.name;
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              station.miImageUrl = String(reader.result || "");
              renderOutputStage();
            });
            reader.readAsDataURL(file);
          } else {
            station.miImageUrl = "";
            renderOutputStage();
          }
        });
      });
      refs.twinCanvas?.querySelectorAll("[data-mi-risk-station]").forEach((field) => {
        field.addEventListener("input", () => updateQualityRisk(field));
        field.addEventListener("change", () => updateQualityRisk(field));
      });
      refs.twinCanvas?.querySelectorAll("[data-mi-ctq-station]").forEach((field) => {
        field.addEventListener("input", () => updateCtq(field));
        field.addEventListener("change", () => updateCtq(field));
      });
    }

    function csvEscape(value) {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }

    function getExportRows() {
      const rows = [["Station", "Station Time (secs)", "HC", "Status", "Assigned Steps", "Issue", "CTQ", "Quality Risk 1", "Quality Risk 2", "Quality Risk 3", "Uploaded Image"]];
      getActiveStations().forEach((station) => {
        const risks = getQualityRiskRows(station);
        rows.push([
          station.id,
          station.time,
          station.hc,
          stationStateLabel(station.state),
          station.steps.join(" / "),
          station.issue,
          station.miCtq || "",
          risks[0],
          risks[1],
          risks[2],
          station.miImageName || "",
        ]);
      });
      return rows;
    }

    function exportExcel() {
      const csv = getExportRows().map((row) => row.map(csvEscape).join(",")).join("\n");
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mi_package_output.csv";
      link.click();
      URL.revokeObjectURL(url);
      showToast("MI Package Output exported for Excel");
    }

    function renderPanel(refs) {
      setText(refs.aiStepTitle, "Excel Export");
      setText(refs.confidence, "MI");
      setText(refs.aiReason, "Export the current MI Package Output station summary for Excel review. This export is only available on this page.");
      if (refs.missingList) {
        refs.missingList.innerHTML = `
      <li>${getActiveStations().length} station row(s)</li>
      <li>Includes station time, HC, assigned steps, issue, and uploaded image file name</li>
      <li>Downloaded as CSV and can be opened in Excel</li>
    `;
      }
      setText(refs.evidenceTitle, "Export Action");
      if (refs.evidenceList) {
        refs.evidenceList.className = "mi-export-panel";
        refs.evidenceList.innerHTML = `<button class="mi-export-excel" type="button" data-action="export-mi-excel">Export Excel</button>`;
        refs.evidenceList.querySelector("[data-action='export-mi-excel']")?.addEventListener("click", exportExcel);
      }
    }

    return {
      getStationMaterialList,
      getStationStepRows,
      getQualityRiskRows,
      renderCanvas,
      bind,
      updateCtq,
      updateQualityRisk,
      csvEscape,
      getExportRows,
      exportExcel,
      renderPanel,
    };
  }

  global.MciMiOutputPage = {
    createMiOutputPage,
  };
})(globalThis);
