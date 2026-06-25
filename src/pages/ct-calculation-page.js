(function attachCtCalculationPage(global) {
  const FALLBACK_PROCESS_TIME = 354;

  function createCtCalculationPage({
    ctCalculatorState,
    aiPanel,
    sopMacroSteps,
    escapeHtml,
    formatStepId,
    formatProcessStepLabel,
    getMicroPt,
    getActualPt,
    getMicroAutomation,
    getCtInputMode,
    setCtInputMode,
    getSearchQuery,
    getTwinCanvas,
    renderPanel,
  }) {
    // Real total process time = sum of every micro-step's actual PT across the parsed SOP.
    // Falls back to a constant only when nothing has been parsed yet.
    function getTotalProcessTime() {
      const total = sopMacroSteps.reduce(
        (sum, macro) =>
          sum + (macro.microSteps || []).reduce((s, microStep, index) => s + Number(getActualPt(microStep, index) || 0), 0),
        0,
      );
      return total > 0 ? Math.round(total) : FALLBACK_PROCESS_TIME;
    }

    function getVolumeTargetCt() {
      const dailyVolume = Math.max(1, Number(ctCalculatorState.dailyVolume) || 1);
      const shiftCount = Math.max(1, Number(ctCalculatorState.shiftCount) || 1);
      const shiftHours = Math.max(0.1, Number(ctCalculatorState.shiftHours) || 0.1);
      const oeeRatio = Math.max(0.01, Math.min(1, (Number(ctCalculatorState.oee) || 1) / 100));
      const availableSeconds = shiftCount * shiftHours * 3600 * oeeRatio;
      return availableSeconds / dailyVolume;
    }

    function renderCanvas() {
      const totalProcessTime = getTotalProcessTime();
      const targetCt = Number(ctCalculatorState.targetCt) || 1;
      const totalHc = Number(ctCalculatorState.totalHc) || 1;
      const calculatedHc = Math.ceil(totalProcessTime / targetCt);
      const calculatedCt = totalProcessTime / totalHc;
      const volumeTargetCt = getVolumeTargetCt();
      const ctInputMode = getCtInputMode();

      return `
    <div class="ct-board">
      <section class="ct-simple-calculator">
        <div class="ct-simple-head">
          <div>
            <b>Calculator</b>
            <span>Choose one of three methods to set the line balancing target (CT / HC).</span>
          </div>
          <em>Total process time ${totalProcessTime}s</em>
        </div>
        <div class="ct-method-stack">
          <section class="ct-method-section">
            <div class="ct-method-title"><b>Method 1</b><span>Input target CT → generate Total HC</span></div>
            <article class="ct-mode-card ${ctInputMode === "ct" ? "active" : ""}">
              <label><span>Input Target CT (secs)</span><input class="ct-calc-input" type="number" min="1" step="1" data-ct-field="targetCt" value="${ctCalculatorState.targetCt}" /></label>
              <div class="ct-result-box"><span>Generated Total HC</span><strong data-ct-result="hc">${calculatedHc.toFixed(1)}</strong><small data-ct-formula="hc">${totalProcessTime}s / ${targetCt}s</small></div>
            </article>
          </section>
          <section class="ct-method-section">
            <div class="ct-method-title"><b>Method 2</b><span>Input Total HC → generate CT</span></div>
            <article class="ct-mode-card ${ctInputMode === "hc" ? "active" : ""}">
              <label><span>Input Total HC</span><input class="ct-calc-input" type="number" min="1" step="1" data-ct-field="totalHc" value="${ctCalculatorState.totalHc}" /></label>
              <div class="ct-result-box"><span>Generated CT (secs)</span><strong data-ct-result="ct">${calculatedCt.toFixed(1)}</strong><small data-ct-formula="ct">${totalProcessTime}s / ${totalHc} HC</small></div>
            </article>
          </section>
          <section class="ct-method-section">
            <div class="ct-method-title"><b>Method 3</b><span>Use customer volume assumptions to generate target CT</span></div>
            <article class="ct-mode-card ct-volume-card ${ctInputMode === "volume" ? "active" : ""}">
              <div class="ct-volume-inputs">
                <label><span>Daily Volume</span><input class="ct-calc-input ct-volume-input" type="number" min="1" step="1" data-ct-field="dailyVolume" value="${ctCalculatorState.dailyVolume}" /></label>
                <label><span>Shift / Hours</span><div class="ct-shift-pair"><input class="ct-calc-input ct-volume-input" type="number" min="1" step="1" data-ct-field="shiftCount" value="${ctCalculatorState.shiftCount}" /><b>×</b><input class="ct-calc-input ct-volume-input" type="number" min="0.1" step="0.5" data-ct-field="shiftHours" value="${ctCalculatorState.shiftHours}" /></div></label>
                <label><span>OEE (%)</span><input class="ct-calc-input ct-volume-input" type="number" min="1" max="100" step="1" data-ct-field="oee" value="${ctCalculatorState.oee}" /></label>
              </div>
              <div class="ct-result-box"><span>Generated Target CT (secs)</span><strong data-ct-result="volumeCt">${volumeTargetCt.toFixed(1)}</strong><small data-ct-formula="volumeCt">${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h × 3600 × ${ctCalculatorState.oee}% / ${ctCalculatorState.dailyVolume}</small></div>
            </article>
          </section>
        </div>
        <div class="ct-simple-formula">
          <span>Formula</span>
          <b>Method 1 · Total HC = Total Process Time / CT</b>
          <b>Method 2 · CT = Total Process Time / Total HC</b>
          <b>Method 3 · CT = Available Production Time × OEE / Daily Volume</b>
        </div>
      </section>
    </div>
  `;
    }

    function renderRowsHtml() {
      const query = getSearchQuery().trim().toLowerCase();
      const rows = sopMacroSteps
        .flatMap((macro, macroIndex) => macro.microSteps.map((microStep, index) => ({ macro, macroIndex, microStep, index })))
        .filter(({ macro, microStep, index }) => {
          if (!query) return true;
          const stepNo = `step ${formatStepId(macro.id)}`;
          const processStep = formatProcessStepLabel(macro);
          const microNo = `${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}`;
          return [stepNo, processStep, microNo, macro.title, macro.station, microStep[0]].some((value) => String(value).toLowerCase().includes(query));
        });

      return rows
        .map(({ macro, macroIndex, microStep, index }) => {
          const pt = getMicroPt(microStep, index);
          const actualPt = getActualPt(microStep, index);
          const groupClass = macroIndex % 2 === 0 ? "micro-group-green" : "micro-group-blue";
          return `
        <tr class="micro-xlsx-row ${groupClass}">
          <td class="process-cell"><strong>${escapeHtml(formatProcessStepLabel(macro))}</strong></td>
          <td><b>${formatStepId(macro.id)}.${String(index + 1).padStart(2, "0")}</b></td>
          <td><span class="automation-chip ${getMicroAutomation(microStep) === "A" ? "auto" : ""}">${getMicroAutomation(microStep)}</span></td>
          <td class="process-cell"><strong>${escapeHtml(microStep[0])}</strong><small>${escapeHtml(macro.title)}</small></td>
          <td>${pt}</td>
          <td>${actualPt}</td>
        </tr>
      `;
        })
        .join("");
    }

    function renderRows(root) {
      if (root) root.innerHTML = renderRowsHtml();
    }

    function renderAiPanel(refs) {
      const totalProcessTime = getTotalProcessTime();
      const generatedHc = Math.ceil(totalProcessTime / (Number(ctCalculatorState.targetCt) || 1));
      const generatedCt = totalProcessTime / Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1));
      const volumeTargetCt = getVolumeTargetCt();
      const ctInputMode = getCtInputMode();

      aiPanel.renderPanel(refs, {
        title: "Calculation Logic",
        confidence: ctInputMode === "ct" ? `${generatedHc} HC` : ctInputMode === "volume" ? `${volumeTargetCt.toFixed(1)}s` : `${generatedCt.toFixed(1)}s`,
        reason: "Method 1: input CT → Total HC. Method 2: input Total HC → CT. Method 3: input daily volume / shift hours / OEE → target CT.",
        missingItems: [
          `Total process time: ${totalProcessTime}s (from parsed actual PT)`,
          `Method 1 · CT ${ctCalculatorState.targetCt}s → Total HC ${generatedHc}`,
          `Method 2 · HC ${Math.round(Number(ctCalculatorState.totalHc) || 1)} → CT ${generatedCt.toFixed(1)}s`,
          `Method 3 · volume ${ctCalculatorState.dailyVolume} / ${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h / OEE ${ctCalculatorState.oee}% → CT ${volumeTargetCt.toFixed(1)}s`,
        ],
        evidenceTitle: "Simple Formula",
        evidenceClass: "timing-exposure-list",
        evidenceItems: [
          { badge: "M1", title: "Total Process Time / CT", detail: "input target CT → Total HC" },
          { badge: "M2", title: "Total Process Time / HC", detail: "input Total HC → CT" },
          { badge: "M3", title: "Available Time × OEE / Volume", detail: "input volume assumptions → target CT" },
          { badge: "Next", title: "Station draft", detail: "Page 05 uses this CT / HC as the balancing target", tone: "ctq" },
        ],
      });
    }

    function syncCalculatorView(sourceField) {
      const totalProcessTime = getTotalProcessTime();
      const targetCt = Math.max(1, Number(ctCalculatorState.targetCt) || 1);
      const totalHc = Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1));
      const generatedHc = Math.ceil(totalProcessTime / targetCt);
      const generatedCt = totalProcessTime / totalHc;
      const volumeTargetCt = getVolumeTargetCt();
      const twinCanvas = getTwinCanvas();

      if (sourceField?.dataset.ctField === "targetCt") {
        ctCalculatorState.totalHc = generatedHc;
        const hcInput = twinCanvas?.querySelector("[data-ct-field='totalHc']");
        if (hcInput) hcInput.value = ctCalculatorState.totalHc;
      } else if (sourceField?.dataset.ctField === "totalHc") {
        ctCalculatorState.targetCt = Number(generatedCt.toFixed(1));
        const ctInput = twinCanvas?.querySelector("[data-ct-field='targetCt']");
        if (ctInput) ctInput.value = ctCalculatorState.targetCt;
      } else if (sourceField && ["dailyVolume", "shiftCount", "shiftHours", "oee"].includes(sourceField.dataset.ctField)) {
        ctCalculatorState.targetCt = Number(volumeTargetCt.toFixed(1));
        ctCalculatorState.totalHc = Math.ceil(totalProcessTime / Math.max(0.1, ctCalculatorState.targetCt));
        const ctInput = twinCanvas?.querySelector("[data-ct-field='targetCt']");
        const hcInput = twinCanvas?.querySelector("[data-ct-field='totalHc']");
        if (ctInput) ctInput.value = ctCalculatorState.targetCt;
        if (hcInput) hcInput.value = ctCalculatorState.totalHc;
      }

      const hcResult = twinCanvas?.querySelector("[data-ct-result='hc']");
      const ctResult = twinCanvas?.querySelector("[data-ct-result='ct']");
      const volumeCtResult = twinCanvas?.querySelector("[data-ct-result='volumeCt']");
      const hcFormula = twinCanvas?.querySelector("[data-ct-formula='hc']");
      const ctFormula = twinCanvas?.querySelector("[data-ct-formula='ct']");
      const volumeCtFormula = twinCanvas?.querySelector("[data-ct-formula='volumeCt']");
      twinCanvas?.querySelectorAll(".ct-mode-card").forEach((card) => card.classList.remove("active"));
      sourceField?.closest(".ct-mode-card")?.classList.add("active");
      if (hcResult) hcResult.textContent = String(Math.ceil(totalProcessTime / Math.max(1, Number(ctCalculatorState.targetCt) || 1)));
      if (ctResult) ctResult.textContent = (totalProcessTime / Math.max(1, Math.round(Number(ctCalculatorState.totalHc) || 1))).toFixed(1);
      if (volumeCtResult) volumeCtResult.textContent = getVolumeTargetCt().toFixed(1);
      if (hcFormula) hcFormula.textContent = `${totalProcessTime}s / ${Number(ctCalculatorState.targetCt).toFixed(1)}s`;
      if (ctFormula) ctFormula.textContent = `${totalProcessTime}s / ${Math.round(Number(ctCalculatorState.totalHc) || 1)} HC`;
      if (volumeCtFormula) volumeCtFormula.textContent = `${ctCalculatorState.shiftCount} × ${ctCalculatorState.shiftHours}h × 3600 × ${ctCalculatorState.oee}% / ${ctCalculatorState.dailyVolume}`;
    }

    function updateCalculator(field) {
      const key = field.dataset.ctField;
      const value = Number(field.value);
      if (key === "targetCt") {
        setCtInputMode("ct");
        ctCalculatorState.targetCt = Math.max(1, value || 1);
      } else if (key === "totalHc") {
        setCtInputMode("hc");
        ctCalculatorState.totalHc = Math.max(1, Math.round(value || 1));
      } else if (["dailyVolume", "shiftCount", "shiftHours", "oee"].includes(key)) {
        setCtInputMode("volume");
        const minValue = key === "shiftHours" ? 0.1 : 1;
        ctCalculatorState[key] = Math.max(minValue, value || minValue);
      }
      syncCalculatorView(field);
      renderPanel();
    }

    function bind(root) {
      root?.querySelectorAll(".ct-calc-input").forEach((field) => {
        field.addEventListener("input", () => updateCalculator(field));
        field.addEventListener("change", () => updateCalculator(field));
      });
    }

    return {
      getTotalProcessTime,
      getVolumeTargetCt,
      renderCanvas,
      renderRows,
      renderRowsHtml,
      renderPanel: renderAiPanel,
      syncCalculatorView,
      updateCalculator,
      bind,
    };
  }

  global.MciCtCalculationPage = {
    createCtCalculationPage,
  };
})(globalThis);
