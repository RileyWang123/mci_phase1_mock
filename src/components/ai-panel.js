(function attachAiPanel(global) {
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMissingItems(items = []) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function renderTimingEvidenceItems(items = []) {
    return items
      .map(
        (item) => `
      <div class="timing-exposure-row ${item.tone || ""}"><b>${escapeHtml(item.badge)}</b><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.detail)}</small></div>
    `,
      )
      .join("");
  }

  function renderTraceEvidenceItems(items = []) {
    return items
      .map((item) => `<div class="evidence"><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.detail || "Matched by AI trace log")}</span></div>`)
      .join("");
  }

  function renderEvidenceItems(config) {
    const leadHtml = config.evidenceLeadHtml || "";
    if (!config.evidenceItems) return leadHtml + (config.evidenceHtml || "");
    const evidenceHtml = config.evidenceVariant === "trace" ? renderTraceEvidenceItems(config.evidenceItems) : renderTimingEvidenceItems(config.evidenceItems);
    return leadHtml + evidenceHtml;
  }

  function renderPanel(refs, config) {
    setText(refs.aiStepTitle, config.title);
    setText(refs.confidence, config.confidence);
    setText(refs.aiReason, config.reason);
    setText(refs.missingTitle, config.missingTitle ?? "Missing Information");

    if (refs.missingList) {
      refs.missingList.className = config.missingClass || "";
      refs.missingList.innerHTML = config.missingItems ? renderMissingItems(config.missingItems) : config.missingHtml || "";
    }

    setText(refs.evidenceTitle, config.evidenceTitle);
    if (refs.evidenceList) {
      refs.evidenceList.className = config.evidenceClass || "";
      refs.evidenceList.innerHTML = renderEvidenceItems(config);
    }
  }

  global.MciAiPanel = {
    renderPanel,
  };
})(globalThis);
