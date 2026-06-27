let _editorialUrl = "";
function getActiveManuscript() {
  return state.manuscripts.find((manuscript) => manuscript.id === state.activeId) || state.manuscripts.find((m) => !m.parentId) || null;
}

function isManuscriptDocument(manuscript = getActiveManuscript()) {
  if (!manuscript) return false;
  return (manuscript.type || "manuscrito") === "manuscrito";
}

function updateActiveManuscript(nextManuscript) {
  state.manuscripts = state.manuscripts.map((manuscript) =>
    manuscript.id === nextManuscript.id ? nextManuscript : manuscript
  );
}

function getViewFromRoute() {
  const route = window.location.hash.replace(/^#\/?/, "");
  return VIEW_ROUTES.has(route) ? route : "editor";
}

function updateRouteForView(viewName, mode = "push") {
  const nextHash = `#${viewName}`;

  if (window.location.hash === nextHash) {
    return;
  }

  if (mode === "replace") {
    window.history.replaceState(null, "", nextHash);
    return;
  }

  window.history.pushState(null, "", nextHash);
}

const ANALYTICS_VIEW_TITLES = {
  editor: "Manuscrito",
  biblioteca: "Biblioteca",
  autoria: "Prova de autoria",
  arquivo: "Arquivo",
  academia: "Ateliê",
  cronograma: "Cronograma",
};

let _pendingAnalyticsView = null;
let _lastAnalyticsPath = "";

function getAnalyticsPath(viewName = getViewFromRoute()) {
  const route = VIEW_ROUTES.has(viewName) ? viewName : getViewFromRoute();
  return `${window.location.pathname}${window.location.search}#${route}`;
}

function trackAnalyticsView(viewName = getViewFromRoute()) {
  _pendingAnalyticsView = viewName;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (!window.goatcounter || typeof window.goatcounter.count !== "function") return;

  const path = getAnalyticsPath(viewName);
  if (path === _lastAnalyticsPath) return;

  _lastAnalyticsPath = path;
  _pendingAnalyticsView = null;
  try {
    window.goatcounter.count({
      path,
      title: `Escrevaral — ${ANALYTICS_VIEW_TITLES[viewName] || "Editor"}`,
    });
  } catch {
    // Analytics nunca deve interromper a escrita.
  }
}

window.addEventListener("escrevaral:analytics-ready", () => {
  trackAnalyticsView(_pendingAnalyticsView || getViewFromRoute());
});

function setView(viewName, options = {}) {
  if (!VIEW_ROUTES.has(viewName)) {
    return;
  }

  shell.dataset.view = viewName;
  exitFocusMode();
  nav.classList.remove("is-open");
  closeBandeja();
  if (welcomeOverlay && !welcomeOverlay.hidden) closeWelcome();
  // Suprimir hint da Academia ao navegar para Arquivo — não interromper o momento de satisfação
  if (viewName === "arquivo") { hideAcademiaHint(); clearTimeout(hintIdleTimer); }

  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.viewPanel === viewName);
  });

  document.querySelectorAll("[data-view-target]").forEach((control) => {
    const isActive = control.dataset.viewTarget === viewName;
    control.classList.toggle("is-active", isActive);
    control.setAttribute("aria-current", isActive ? "page" : "false");
  });

  updateDockIndicator();

  if (viewName === "cronograma") renderCronograma();

  if (viewName === "arquivo" && !state.activeId) {
    const first = state.manuscripts.find((m) => !m.parentId);
    if (first) { state.activeId = first.id; renderMetadataForm(); }
  }

  if (viewName === "academia") {
    const resumeLink = document.querySelector("[data-academy-resume]");
    if (resumeLink) {
      const hasActive = getActiveManuscript() !== null;
      resumeLink.hidden = !hasActive;
    }
    const enemHint = document.querySelector("[data-academy-enem-hint]");
    if (enemHint) {
      const ms = getActiveManuscript();
      enemHint.hidden = !(ms && ms.oficio === "estudo-vestibular");
    }
    if (window.VeredaAcademiaController) {
      if (typeof renderDecolonialObserver === "function") renderDecolonialObserver();
      if (typeof renderRightsLab === "function") renderRightsLab();
    }
  }

  if (options.updateRoute) {
    updateRouteForView(viewName, options.routeMode);
  }

  trackAnalyticsView(viewName);
}

// ── NAVEGAÇÃO MÓVEL: bandeja e indicador ─────────────────────────────────

function openBandeja() {
  const bandeja = document.getElementById("mobile-bandeja");
  const btn = document.querySelector("[data-action='toggle-bandeja']");
  if (!bandeja) return;
  const printBtn = bandeja.querySelector("[data-bandeja-print]");
  if (printBtn) printBtn.disabled = !getActiveManuscript();
  if (typeof hideSaveHint === "function") hideSaveHint();
  bandeja.removeAttribute("hidden");
  requestAnimationFrame(() => bandeja.classList.add("is-open"));
  if (btn) btn.setAttribute("aria-expanded", "true");
  const sheet = bandeja.querySelector(".bandeja-sheet");
  if (sheet) requestAnimationFrame(() => sheet.focus());
}

function closeBandeja() {
  const bandeja = document.getElementById("mobile-bandeja");
  const btn = document.querySelector("[data-action='toggle-bandeja']");
  if (!bandeja || bandeja.hidden) return;
  bandeja.classList.remove("is-open");
  if (btn) {
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  setTimeout(() => { if (!bandeja.classList.contains("is-open")) bandeja.hidden = true; }, 320);
}

function toggleBandeja() {
  const bandeja = document.getElementById("mobile-bandeja");
  if (!bandeja) return;
  if (bandeja.hidden) openBandeja(); else closeBandeja();
}

function updateDockIndicator() {
  const dock = document.getElementById("mobile-dock");
  if (!dock || window.innerWidth >= 820) return;
  const indicator = dock.querySelector(".dock-indicator");
  const activeItem = dock.querySelector(".dock-item.is-active:not(.dock-mais-btn)");
  if (!indicator) return;
  if (!activeItem) { indicator.style.opacity = "0"; return; }
  indicator.style.opacity = "1";
  const dockRect = dock.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  if (window.innerWidth >= 600) {
    indicator.style.top    = (itemRect.top  - dockRect.top)  + "px";
    indicator.style.height = itemRect.height + "px";
    indicator.style.left   = "";
    indicator.style.width  = "";
  } else {
    indicator.style.left   = (itemRect.left - dockRect.left) + "px";
    indicator.style.width  = itemRect.width + "px";
    indicator.style.top    = "";
    indicator.style.height = "";
  }
}

function applyPanelLayout() {
  shell.classList.toggle("is-left-collapsed", Boolean(state.layout.leftCollapsed));
  shell.classList.toggle("is-right-collapsed", Boolean(state.layout.rightCollapsed));

  document.querySelectorAll('[data-action="toggle-left-panel"]').forEach((control) => {
    const collapsed = Boolean(state.layout.leftCollapsed);
    control.setAttribute("aria-expanded", String(!collapsed));
    control.title = collapsed ? "Abrir hierarquia" : "Ocultar hierarquia";
  });

  document.querySelectorAll('[data-action="toggle-right-panel"]').forEach((control) => {
    const collapsed = Boolean(state.layout.rightCollapsed);
    control.setAttribute("aria-expanded", String(!collapsed));
    control.title = collapsed ? "Abrir análise linguística" : "Ocultar análise linguística";
  });
}

function togglePanel(side) {
  if (side === "left") {
    state.layout.leftCollapsed = !state.layout.leftCollapsed;
  }

  if (side === "right") {
    state.layout.rightCollapsed = !state.layout.rightCollapsed;
  }

  applyPanelLayout();
  persistState("Pronto");
}

const DARK_MODE_KEY = "vereda:dark-mode";

function applyColorTheme() {
  // Mantém compatibilidade com código legado que chama applyColorTheme
  applyDarkMode(localStorage.getItem(DARK_MODE_KEY) === "on");
}

function applyDarkMode(isDark) {
  document.documentElement.dataset.theme = isDark ? "scriptorium" : "";
  const btn = document.querySelector("[data-action='toggle-dark-mode']");
  if (btn) {
    btn.setAttribute("aria-pressed", String(isDark));
    btn.title = isDark ? "Mudar para Alvorada" : "Mudar para Vereda";
    btn.setAttribute("aria-label", isDark ? "Mudar para Alvorada" : "Mudar para Vereda");
  }
}

function closeThemeMenu() { /* noop — menu de temas removido */ }

function hideDecorativeMaterialIcons(root = document) {
  root.querySelectorAll?.(".material-symbols-outlined:not([aria-hidden])").forEach((icon) => {
    icon.setAttribute("aria-hidden", "true");
  });
}

const materialIconObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.classList?.contains("material-symbols-outlined")) {
        node.setAttribute("aria-hidden", "true");
      }
      hideDecorativeMaterialIcons(node);
    });
  });
});

// Sinal progressivo: há teclado físico conectado?
// Detectado via keydown real enquanto o visualViewport não está encolhido —
// se a tela já está reduzida, o teclado virtual provavelmente está aberto.
let _physicalKeyboard = false;
let _vvhBase = window.visualViewport?.height ?? window.innerHeight;
document.addEventListener("keydown", (e) => {
  if (!e.isTrusted) return;
  const currentHeight = window.visualViewport?.height ?? window.innerHeight;
  if (currentHeight / _vvhBase < 0.85) return; // viewport encolhido: teclado virtual ativo
  if (e.key.length === 1 || ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","Backspace","Delete","Home","End","Enter"].includes(e.key)) {
    _physicalKeyboard = true;
  }
}, { capture: true, passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    const ratio = window.visualViewport.height / _vvhBase;
    if (ratio < 0.85) _physicalKeyboard = false;
    else _vvhBase = window.visualViewport.height; // altura estável: atualiza base
  }, { passive: true });
}

// Foca o editor sem retry agressivo — para momentos em que escrever é a intenção explícita.
function focusEditor() {
  if (typeof focusEditorTarget === "function") {
    focusEditorTarget();
    return;
  }

  writingArea?.focus();
}

// Foca o editor só em dispositivos não-touch ou quando teclado físico detectado —
// para navegação (abrir manuscrito do arquivo), onde a pessoa pode querer ler antes de escrever.
function focusEditorOnNavigate() {
  if (_physicalKeyboard || !window.matchMedia("(pointer: coarse)").matches) {
    focusEditor();
  }
}

function enterFocusMode() {
  setView("editor", { updateRoute: true });
  shell.classList.add("is-focus");
  applyFocusSettings();
  focusEditor();
  document.querySelector('[data-action="toggle-focus"]')?.setAttribute("aria-pressed", "true");
}

function exitFocusMode() {
  shell.classList.remove("is-focus");
  document.querySelector('[data-action="toggle-focus"]')?.setAttribute("aria-pressed", "false");
}

function toggleRuler() {
  state.focus.ruler = !state.focus.ruler;
  applyFocusSettings();
  persistState("Preferências de foco salvas");
}

function updateFocusSetting(name, value) {
  state.focus[name] = Number(value);
  applyFocusSettings();
  persistState("Preferências de foco salvas");
}

function applyFocusSettings() {
  shell.style.setProperty("--focus-width", `${state.focus.width}px`);
  shell.style.setProperty("--reading-size", `${state.focus.fontSize}px`);
  shell.classList.toggle("has-ruler", state.focus.ruler);
  if (rulerToggle) {
    rulerToggle.classList.toggle("is-active", state.focus.ruler);
    rulerToggle.setAttribute("aria-pressed", String(state.focus.ruler));
  }

  focusSettingControls.forEach((control) => {
    control.value = state.focus[control.dataset.focusSetting];
  });
}

function applyTemplateLayout() {
  if (!editorSplit) return;
  editorSplit.dataset.templateSide = state.template.side;
  const safeWidth = Math.min(520, Math.max(260, state.template.width || 300));
  editorSplit.style.setProperty("--template-panel-width", `${safeWidth}px`);
  editorSplit.classList.toggle("is-template-collapsed", !state.template.open);

  templatePanelToggles.forEach((toggle) => {
    const isHeaderToggle = toggle.closest(".template-reference-header");
    const label = state.template.open ? "Ocultar guia" : "Mostrar guia";
    const hasText = countWords(getActiveManuscript()?.text || writingArea?.innerText || "") > 0;
    const hint = hasText ? label : "Abra o guia para ver a estrutura do texto e os critérios da forma escolhida.";
    toggle.setAttribute("aria-expanded", String(state.template.open));
    toggle.setAttribute("aria-label", label);
    toggle.title = hint;

    const icon = toggle.querySelector(".material-symbols-outlined");
    if (icon) {
      icon.textContent = isHeaderToggle && state.template.open ? "left_panel_close" : "view_sidebar";
    }
    // Atualiza texto visível no botão da barra do editor
    const textNode = [...toggle.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (textNode) textNode.textContent = state.template.open ? " Ocultar guia" : " Mostrar guia";
  });
}

function updateConnectionStatus() {
  if (!offlineStatus) return;
  const online = navigator.onLine;
  const label = online ? "Pronto sem internet" : "Sem rede — escrita continua";
  const icon  = online ? "cloud_done" : "cloud_off";
  const tip   = online
    ? "O Escrevaral funciona sem conexão — suas notas ficam salvas aqui no navegador."
    : "Sem conexão — o Escrevaral continua funcionando e suas notas estão a salvo.";
  offlineStatus.innerHTML = `<span class="material-symbols-outlined">${icon}</span>${label}`;
  offlineStatus.dataset.vrdaTooltip = tip;
  offlineStatus.setAttribute("aria-label", label);
}

function syncGuideToManuscript(id) {
  const manuscript = state.manuscripts.find((m) => m.id === id);
  if (!manuscript) return;
  if (manuscript.templateId) {
    state.template.selectedId = manuscript.templateId;
    state.template.open = false;  // Guia fecha — botão visível com nome, sem despejar conteúdo
  }
}

function setActiveManuscript(id) {
  deactivateGrammarColor();
  state.activeId = id;
  syncGuideToManuscript(id);
  applyTemplateLayout();  // Aplica open:false imediatamente após syncGuide
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  renderProofView();
  renderVersionList();
  persistState("Texto aberto");
  setView("editor");
}

function selectArchiveManuscript(id) {
  state.activeId = id;
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  renderProofView();
  renderVersionList();
  persistState("Nota selecionada");
}

// Declarado antes de renderActiveManuscript que já o lê na linha ~1022
let _currentEditorView = "flow";

function getPageRenderOpts() {
  const ms = getActiveManuscript();
  return {
    startPage:  ms?.pageStartNumber  || 1,
    headerText: ms?.pageHeaderText   || "",
  };
}

function exportPrecisionAnalysis() {
  const ms = getActiveManuscript();
  if (!ms || !window.VeredaPrecision) { saveStatus.textContent = "Nenhum texto aberto."; return; }
  const text = ms.text || (ms.html || "").replace(/<[^>]+>/g, " ");
  if (!text.trim()) { saveStatus.textContent = "Texto vazio."; return; }
  const template = window.VeredaTemplates?.getTemplate(state.template?.selectedId) || {};
  const a = VeredaPrecision.analyze(template, text);
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const lines = [
    "ADERÊNCIA AO GUIA — Escrevaral",
    sep,
    `Texto: ${ms.title || "sem título"}  ·  ${a.words} palavras  ·  ${date}`,
    template.label ? `Guia: ${template.label}` : "Guia: análise genérica",
    `Aderência: ${a.score}% — ${a.status}`,
    "",
  ];
  const passed = a.checks.filter(c => c.passed);
  const failed = a.checks.filter(c => !c.passed);
  if (passed.length) {
    lines.push("PONTOS COBERTOS", "─".repeat(36));
    passed.forEach(c => { lines.push(`✓ ${c.label}`); if (c.hint) lines.push(`  ${c.hint}`); });
    lines.push("");
  }
  if (failed.length) {
    lines.push("PONTOS A TRABALHAR", "─".repeat(36));
    failed.forEach(c => { lines.push(`○ ${c.label}`); if (c.hint) lines.push(`  ${c.hint}`); });
    lines.push("");
  }
  lines.push(sep, "Análise local — nada enviado para fora do navegador.");
  downloadFile(lines.join("\n"), `${slugify(ms.title || "texto")}-aderencia.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = `Análise de aderência exportada (${a.score}%)`;
}

function _getExportScope() {
  const sel = document.getElementById("export-scope-sel");
  const scope = sel ? sel.value : "all";
  const ms = getActiveManuscript();
  return { scope, activeId: ms ? ms.id : null };
}

function exportAcervoCompleto() {
  const opts = _getExportScope();
  const pkg  = VeredaExport.buildOutputPackage(state.manuscripts, opts);
  if (pkg.warnings.length) { saveStatus.textContent = pkg.warnings[0]; return; }
  const docs = pkg.items;
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep  = "═".repeat(60);
  const titulo = opts.scope === "all" ? "ACERVO COMPLETO" : opts.scope === "current" ? "TEXTO SELECIONADO" : "TEXTO E NOTAS LIGADAS";
  const lines = [`${titulo} — Escrevaral`, `Gerado em ${date} · ${docs.length} item${docs.length !== 1 ? "s" : ""}`, sep, ""];
  docs.forEach((ms, i) => {
    const wc = countWords(ms.text || "");
    lines.push(`${i + 1}. ${ms.title || "sem título"}  ·  ${wc.toLocaleString("pt-BR")} palavras  ·  ${ms.status || "Em escrita"}`);
    lines.push("─".repeat(50));
    lines.push(ms.text.trim());
    lines.push("", sep, "");
  });
  const totalWords = pkg.stats.words;
  lines.push(`Total: ${totalWords.toLocaleString("pt-BR")} palavras em ${docs.length} item${docs.length !== 1 ? "s" : ""}.`);
  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadFile(lines.join("\n"), `escrevaral-${opts.scope === "all" ? "acervo" : "export"}-${dateSlug}.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = `Exportado — ${docs.length} item${docs.length !== 1 ? "s" : ""}, ${totalWords.toLocaleString("pt-BR")} palavras`;
}

function exportObsidianVault() {
  const opts = _getExportScope();
  const docs = state.manuscripts;
  if (!docs.length) { saveStatus.textContent = "Nenhum manuscrito com texto para exportar."; return; }
  try {
    const result = VeredaExport.exportObsidianVault(docs, opts);
    downloadFile(result.content, result.filename, result.mimeType, result.binary);
    const pkg = VeredaExport.buildOutputPackage(docs, opts);
    const total = pkg.stats.manuscripts + pkg.stats.notes;
    saveStatus.textContent = `Exportado para Obsidian — ${total} item${total !== 1 ? "s" : ""}`;
  } catch (e) {
    saveStatus.textContent = e.message;
  }
}

function scheduleUndoPush() {
  clearTimeout(_undoTimer);
  _undoTimer = setTimeout(() => {
    VeredaDocument.pushUndo(writingArea.innerHTML);
  }, 800);
}

function updateCurrentMetadata() {
  const manuscript = getActiveManuscript();
  const activeMetadataField = document.activeElement?.dataset?.metadataField;
  const formData = new FormData(metadataForm);
  const nextManuscript = VeredaArchive.updateMetadata(manuscript, {
    kind: formData.get("kind"),
    status: formData.get("status"),
    chapter: formData.get("chapter"),
    progress: formData.get("progress"),
    tags: formData.get("tags"),
    description: formData.get("description"),
  });

  updateActiveManuscript(nextManuscript);
  renderManuscriptNavigation();
  renderProjectGrid();
  if (activeMetadataField !== "tags" && activeMetadataField !== "description" && activeMetadataField !== "kind" && activeMetadataField !== "chapter") {
    renderMetadataForm();
  } else {
    progressReadout.textContent = `${nextManuscript.progress || 0}%`;
  }
  if (activeMetadataField === "kind") updateWritingPlaceholder();
  maybeCreateAutoVersion(nextManuscript);
  queueSave();
}

function queueSave() {
  saveStatus.textContent = "Salvando...";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => persistState(), 450);
}

let createNoteContext = "manuscript";

function updateCreateNoteHeading() {
  const eyebrow = document.querySelector("[data-create-note-eyebrow]");
  const title = document.querySelector("[data-create-note-title]");
  const isGuide = createNoteContext === "guide";
  if (eyebrow) eyebrow.textContent = isGuide ? "Guia de escrita" : "Novo texto";
  if (title) title.textContent = isGuide ? "Escolher um guia" : "Começar";
}

function openCreateNote(options = {}) {
  createNoteContext = options.context || "manuscript";
  createNoteCategory = null;
  updateCreateNoteHeading();
  renderCreateNoteStep(1);
  createNoteOverlay.hidden = false;
}

async function renderCreateNoteStep(step) {
  // Garantir templates carregados antes de exibir opções de guia
  if (window.VeredaTemplates && !VeredaTemplates.isLoaded()) {
    await VeredaTemplates.ready();
  }
  const step1 = document.querySelector("[data-create-step='1']");
  const step2 = document.querySelector("[data-create-step='2']");
  const panel  = document.querySelector(".create-note-panel[aria-labelledby='create-note-title']");
  if (!step1 || !step2) return;

  if (step === 1) {
    step1.hidden = false;
    step2.hidden = true;
    if (panel) panel.removeAttribute("data-craft");
    step1.innerHTML = renderCreateCategoryGrid();
  } else {
    step1.hidden = true;
    step2.hidden = false;
    if (panel && createNoteCategory) panel.dataset.craft = createNoteCategory;
    step2.innerHTML = renderCreateTemplateList(createNoteCategory);
  }
}

function renderCreateCategoryGrid() {
  const cards = createCategories.map(cat => `
    <button class="create-cat-card" data-create-category="${cat.id}" data-craft="${cat.id}" type="button">
      <span class="material-symbols-outlined">${cat.icon}</span>
      <strong>${escapeHtml(cat.label)}</strong>
      <small>${escapeHtml(cat.sub)}</small>
    </button>
  `).join("");

  return `
    <div class="create-cat-grid">
      <button class="create-cat-card create-cat-card--blank" data-action="create-quick-note" type="button">
        <span class="material-symbols-outlined">edit_note</span>
        <strong>Folha em branco</strong>
        <small>Abra um texto em branco para escrever ou colar um rascunho.</small>
      </button>
      ${cards}
    </div>
  `;
}

function renderCreateTemplateList(categoryId) {
  const cat = createCategories.find(c => c.id === categoryId);
  if (!cat) return "";

  let rows = "";

  if (categoryId === "projeto") {
    const groups = [
      {
        label: "Projeto",
        ids: ["projeto", "pesquisa", "glossário", "submissão", "revisão"],
      },
      {
        label: "Narrativa",
        ids: ["personagem", "cena", "mundo", "lugar", "instituição", "objeto", "cronologia", "capítulo", "tema"],
      },
      {
        label: "Roteiro",
        ids: ["escaleta", "cena-roteiro", "ato", "personagem-roteiro"],
      },
      {
        label: "Jornalismo e poesia",
        ids: ["pauta", "fonte", "entrevista", "fato", "poema", "série-poética", "argumento", "crônica"],
      },
    ];

    rows = groups.map(group => {
      const types = documentTypes.filter(t => group.ids.includes(t.id));
      if (!types.length) return "";
      return `
        <div class="create-tpl-group-label">${escapeHtml(group.label)}</div>
        ${types.map(type => `
          <button class="create-tpl-row" data-create-doc-type="${type.id}" type="button">
            <span class="material-symbols-outlined">${type.icon}</span>
            <div>
              <strong>${escapeHtml(type.label)}</strong>
              ${type.description ? `<small>${escapeHtml(type.description)}</small>` : ""}
            </div>
            <span class="material-symbols-outlined create-tpl-arrow">chevron_right</span>
          </button>
        `).join("")}
      `;
    }).join("");
  } else {
    const templates = cat.oficios.flatMap(oficio =>
      (window.VeredaTemplates ? VeredaTemplates.listTemplates({ oficio }) : [])
    );
    rows = templates.map(tpl => {
      const isRecommended = categoryId === "vestibular" && tpl.id === "redacao-enem";
      return `
      <button class="create-tpl-row${isRecommended ? " create-tpl-row--recommended" : ""}" data-create-from-template="${tpl.id}" type="button">
        <span class="material-symbols-outlined">${tpl.icon}</span>
        <div>
          <strong>${escapeHtml(tpl.label)}</strong>
          <small>${escapeHtml(tpl.description || "")}</small>
          ${isRecommended ? `<span class="tpl-recommended-badge">início recomendado</span>` : ""}
        </div>
        <span class="material-symbols-outlined create-tpl-arrow">chevron_right</span>
      </button>
    `;
    }).join("");
  }

  const freeLink = categoryId !== "projeto" ? `
    <button class="create-tpl-free" data-action="create-quick-note" type="button">
      <span class="material-symbols-outlined">bolt</span>
      Nota livre em ${escapeHtml(cat.label.toLowerCase())}
    </button>
  ` : "";

  return `
    <button class="create-tpl-back" data-action="create-step-back" type="button">
      <span class="material-symbols-outlined">arrow_back</span>
      voltar
    </button>
    <p class="create-tpl-heading">${escapeHtml(cat.label)}</p>
    <div class="create-tpl-list">${rows}</div>
    ${freeLink}
  `;
}

function closeCreateNote() {
  createNoteOverlay.hidden = true;
  createNoteParentId = null;
  createNoteContext = "manuscript";
  updateCreateNoteHeading();
}

function openAddCompanionNote(bibliType) {
  createNoteParentId = state.activeId;
  createNoteCategory = "projeto";

  // Botão rápido da Bíblia: cria a nota diretamente sem passar pelo modal
  if (bibliType) {
    const type = documentTypes.find(t => t.id === bibliType);
    if (type && createNoteParentId) {
      const manuscript = VeredaArchive.createManuscript({
        id: `manuscrito-${Date.now()}`,
        title: "",
        type: "manuscrito",
        folder: undefined,
        kind: type.kind,
        chapter: type.chapter,
        description: createProjectNoteDescription(type),
        text: createProjectNoteText(type),
        parentId: createNoteParentId,
      });
      addManuscript(manuscript, `Ficha de ${type.label} criada`);
      setTimeout(() => titleInput?.focus(), 400);
      return;
    }
  }

  renderCreateNoteStep(2);
  createNoteOverlay.hidden = false;
}

// ── TERMOS DE USO ────────────────────────────────────
const termsOverlay = document.getElementById("terms-overlay");
const _TERMS_ACCEPTED = !!localStorage.getItem(TERMS_KEY);

function switchAtelier(tab) {
  const view = document.querySelector(".academy-view");
  if (!view) return;
  view.dataset.atelierActive = tab;
  document.querySelectorAll('[data-action^="switch-atelier-"]').forEach(btn => {
    const isActive = btn.dataset.action === `switch-atelier-${tab}`;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function checkTerms() {
  if (!_TERMS_ACCEPTED && termsOverlay) {
    const hasWork = state.manuscripts && state.manuscripts.length > 0;
    const stateNew  = termsOverlay.querySelector('[data-ob-state="new"]');
    const stateCont = termsOverlay.querySelector('[data-ob-state="continue"]');
    if (stateNew)  stateNew.hidden  = hasWork;
    if (stateCont) stateCont.hidden = !hasWork;

    const dock = document.getElementById("mobile-dock");
    const bandeja = document.getElementById("mobile-bandeja");
    if (dock)    dock.inert    = true;
    if (bandeja) bandeja.inert = true;
    setTimeout(() => {
      termsOverlay.hidden = false;
      const firstBtn = termsOverlay.querySelector('[data-ob-state]:not([hidden]) button') ||
                       termsOverlay.querySelector('button');
      firstBtn?.focus();
    }, 200);
  }
}

function acceptTerms(goTo) {
  localStorage.setItem(TERMS_KEY, new Date().toISOString());
  localStorage.setItem(FIRST_VISIT_KEY, "1");
  if (termsOverlay) termsOverlay.hidden = true;
  const dock = document.getElementById("mobile-dock");
  const bandeja = document.getElementById("mobile-bandeja");
  if (dock)    dock.inert    = false;
  if (bandeja) bandeja.inert = false;
  if (goTo === "blank") {
    // Folha em branco direto — sem modal, sem template anterior
    state.template.selectedId = null;
    createBlankManuscript();
    setView("editor", { updateRoute: true });
  } else if (goTo === "guide") {
    // Abre o bento de categorias (passo 1) sem pré-selecionar nenhuma
    openCreateNote({ context: "guide" });
  } else if (goTo === "continue") {
    // Vai direto para o editor com o manuscrito mais recente
    if (state.manuscripts.length > 0) {
      const ms = [...state.manuscripts].sort((a, b) =>
        new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      setActiveManuscript(ms.id);
    }
    setView("editor", { updateRoute: true });
  }
}

// ── ONBOARDING DE PRIMEIRA ENTRADA (legado — mantido por compat.) ─────────
function checkFirstVisit() {
  // Unificado em checkTerms — welcomeOverlay não é mais exibido separadamente
}

function closeWelcome() {
  if (welcomeOverlay) welcomeOverlay.hidden = true;
  localStorage.setItem(FIRST_VISIT_KEY, "1");
}

function handleWelcomeWrite() {
  closeWelcome();
  openCreateNote();
}

function handleWelcomeRimalab() {
  closeWelcome();
  setView("academia", { updateRoute: true });
  requestAnimationFrame(() => {
    const tab = document.getElementById("at-rimalab");
    if (tab) tab.checked = true;
  });
}

function handleWelcomeVoice() {
  closeWelcome();
  setView("academia", { updateRoute: true });
  requestAnimationFrame(() => {
    const tab = document.getElementById("at-voice");
    if (tab) tab.checked = true;
  });
}

function handleWelcomeAutoria() {
  closeWelcome();
  setView("autoria", { updateRoute: true });
}

function handleWelcomeBlank() {
  closeWelcome();
  createNoteType = "manuscrito";
  createNoteCategory = null;
  createQuickNote();
  // Ativa estado de primeira escrita silenciosa
  enterFirstWriting();
}

function renderCreateNoteTypes() {
  if (!createNoteTypes) {
    return;
  }

  createNoteTypes.innerHTML = documentTypes
    .map((type) => {
      const isActive = type.id === createNoteType ? " is-active" : "";
      return `
        <button class="create-note-type${isActive}" type="button" data-create-note-type="${type.id}" aria-pressed="${type.id === createNoteType}">
          <span class="material-symbols-outlined">${type.icon}</span>
          ${escapeHtml(type.label)}
        </button>
      `;
    })
    .join("");
}

function selectCreateNoteType(typeId) {
  if (!documentTypes.some((type) => type.id === typeId)) {
    return;
  }

  createNoteType = typeId;
  renderCreateNoteTypes();
}

function getCreateNoteType() {
  return documentTypes.find((type) => type.id === createNoteType) || documentTypes[0];
}

function addManuscript(manuscript, status) {
  deactivateGrammarColor(); // garante que conteúdo colorido não vaze para a nova nota
  state.manuscripts.unshift(manuscript);

  // Marca folha-em-branco — primeira nota raiz do acervo
  const isFirstRoot = !manuscript.parentId &&
    state.manuscripts.filter(m => !m.parentId).length === 1;
  if (isFirstRoot && typeof VeredaBadges !== "undefined") {
    void VeredaBadges.earnBadge(manuscript, "folha-em-branco").then(updated => {
      const idx = state.manuscripts.findIndex(m => m.id === updated.id);
      if (idx !== -1) {
        state.manuscripts[idx] = updated;
        persistState("Primeira nota — marca conquistada");
        renderProjectGrid();
      }
    });
  }

  state.activeId = manuscript.id;
  if (!manuscript.templateId) {
    state.template.selectedId = null;
    state.template.open = false;
  }
  // Ao criar nota, recolhe sidebar e painel direito — deixa só o editor
  state.layout.leftCollapsed  = true;
  state.layout.rightCollapsed = true;
  state.template.open = false;
  applyProgressLevel();
  applyPanelLayout();
  applyTemplateLayout();
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  closeCreateNote();
  persistState(status);
  setView("editor");
  requestAnimationFrame(() => focusEditorOnNavigate());
  checkProgress();
}

function createQuickNote() {
  const type = getCreateNoteType();
  const nextNumber = state.manuscripts.length + 1;
  const folder = createNoteParentId ? undefined : (CATEGORY_FOLDER[createNoteCategory] || "Notas");
  const manuscript = VeredaArchive.createManuscript({
    id: `nota-${Date.now()}`,
    title: type.id === "manuscrito" ? "" : `${type.label} ${nextNumber}`,
    text: "",
    type: type.id,
    kind: type.kind,
    chapter: type.chapter,
    description: type.id === "manuscrito" ? "Ideia solta, cena breve ou anotação." : createProjectNoteDescription(type),
    ...(folder ? { folder } : {}),
    ...(createNoteParentId ? { parentId: createNoteParentId } : {}),
  });

  addManuscript(manuscript, `${type.label} criado`);
}

function createBlankManuscript() {
  const type = getCreateNoteType();
  const nextNumber = state.manuscripts.length + 1;
  const folder = CATEGORY_FOLDER[createNoteCategory] || "Ficção";
  const manuscript = VeredaArchive.createManuscript({
    id: `${type.id}-${Date.now()}`,
    title: type.id === "manuscrito" ? "" : `${type.label} ${nextNumber}`,
    text: createProjectNoteText(type),
    type: type.id,
    kind: type.kind,
    chapter: type.chapter,
    description: type.id === "manuscrito" ? "Documento livre para escrita longa." : createProjectNoteDescription(type),
    folder,
  });

  addManuscript(manuscript, `${type.label} criado`);
}

function nextDraftNumber() {
  return state.manuscripts.filter((m) => !m.parentId).length + 1;
}

function createNoteFromTemplate(templateId) {
  createManuscriptFromTemplate(templateId);
}

function createNoteFromDocType(typeId) {
  const type = documentTypes.find(t => t.id === typeId);
  if (!type) return;
  const folder = CATEGORY_FOLDER[createNoteCategory] || "Notas";
  const manuscript = VeredaArchive.createManuscript({
    id: `${typeId}-${Date.now()}`,
    title: `${type.label} ${nextDraftNumber()}`,
    text: createProjectNoteText(type),
    type: typeId,
    kind: type.kind,
    chapter: type.chapter,
    description: createProjectNoteDescription(type),
    folder,
  });
  addManuscript(manuscript, `${type.label} criado`);
}

function createBlankManuscript() {
  const manuscript = VeredaArchive.createManuscript({
    id: `manuscrito-${Date.now()}`,
    title: `Texto ${nextDraftNumber()}`,
    text: "",
    type: "manuscrito",
    folder: "Ficção",
  });
  addManuscript(manuscript, "Texto em branco criado");
}

async function createManuscriptFromTemplate(templateId) {
  if (!templateId) { createBlankManuscript(); return; }

  // Garantir que templates-data.json carregou antes de criar
  if (!VeredaTemplates.isLoaded()) {
    persistState("Carregando guias…");
    await VeredaTemplates.ready();
  }
  if (VeredaTemplates.hasLoadError()) {
    persistState("Guias não carregados — criando rascunho livre");
    createBlankManuscript();
    return;
  }

  const template = VeredaTemplates.getTemplate(templateId);
  if (!template) {
    persistState("Guia não encontrado — criando rascunho livre");
    createBlankManuscript();
    return;
  }

  const templateManuscript = VeredaTemplates.createManuscript(templateId, {
    id: `manuscrito-${Date.now()}`,
  });
  const folder = CATEGORY_FOLDER[template.oficio] || CATEGORY_FOLDER[createNoteCategory] || "Ficção";
  const manuscript = VeredaArchive.createManuscript({
    ...templateManuscript,
    title: "",
    type: "manuscrito",
    folder,
  });

  state.template.selectedId = templateId;
  addManuscript(manuscript, "Guia aplicado");
  // Foca no título para que ela nomeie o projeto imediatamente — ato de posse
  setTimeout(() => titleInput?.focus(), 400);
  // Vestibular: guia abre junto após criação — folha paginada do ENEM sem orientação desorientar
  if (template.oficio === "estudo-vestibular") {
    state.template.open = true;
    applyTemplateLayout();
  }
}

function createProjectNoteText(type) {
  const fichas = {
    personagem: `NOME
(nome completo · apelido · como os outros o chamam)


APARÊNCIA
(o detalhe que fica — não a lista inteira)


DESEJO
(o que quer conscientemente · o objetivo declarado)


NECESSIDADE
(o que precisa mas ainda não sabe · o que a história vai dar)


CONTRADIÇÃO
(o que a torna humana, não previsível · o defeito que é também uma força)


VOZ
(palavras que usa muito · palavras que evita · como interrompe · como mente)


ARCO
onde começa:
onde termina:
o que muda:
o que não muda:


RELAÇÕES
— com [personagem]:
— com [personagem]:


DETALHES PARA NÃO ESQUECER
(cor dos olhos, cheiro, maneirismo, objeto que carrega)`,

    mundo: `REGRAS FUNDAMENTAIS
(o que é diferente deste mundo em relação ao nosso)


MAGIA / TECNOLOGIA / SISTEMA
como funciona:
quais os limites:
qual o custo ou consequência:


HISTÓRIA
(o que aconteceu antes da história começar · o trauma coletivo)


TENSÃO ESTRUTURAL
(o conflito que existe antes da protagonista aparecer)


LUGARES IMPORTANTES
—
—


INSTITUIÇÕES E FACÇÕES
— [nome]: função, poder, quem representa
— [nome]: função, poder, quem representa


TERMOS E VOCABULÁRIO PRÓPRIO
— [termo]:`,

    lugar: `NOME


LOCALIZAÇÃO
(onde fica no mundo · como se chega)


ATMOSFERA
(o que se sente ao entrar · temperatura emocional do espaço)


DETALHES SENSORIAIS
visão:
som:
cheiro:
toque:


HISTÓRIA DO LUGAR
(o que aconteceu aqui antes)


QUEM ESTÁ AQUI
(moradores, frequentadores, fantasmas)


SIGNIFICADO NA HISTÓRIA
(por que este lugar importa para a protagonista)`,

    cronologia: `ANTES DA HISTÓRIA COMEÇAR
— [período]:
— [período]:
— [evento que mudou tudo]:


A HISTÓRIA
— cena/cap 1:
— [primeiro ponto de virada]:
— [meio]:
— [segundo ponto de virada]:
— [clímax]:
— [resolução]:


PARALELOS E FLASHBACKS
— [memória de X]: aparece em:
— [evento passado]: revelado quando:


DATAS E DURAÇÕES
início da história:
duração total:
datas importantes:`,

    objeto: `NOME


DESCRIÇÃO FÍSICA
(o detalhe que fica na memória do leitor)


HISTÓRIA DO OBJETO
(de onde veio · quem teve antes)


SIGNIFICADO SIMBÓLICO
(o que representa além do que é)


QUEM TEM / QUEM QUER / QUEM TEME
—


COMO APARECE NA HISTÓRIA
— primeira vez:
— ponto de virada:
— cena final:`,

    tema: `INTENÇÃO
(o que este texto quer dizer — em uma frase)


TENSÃO TEMÁTICA
(as duas forças opostas que o texto explora)


IMAGEM CENTRAL
(a cena, o objeto ou o momento que cristaliza o tema)


PERGUNTA QUE O TEXTO FAZ
(não precisa responder — precisa fazer a pergunta certa)


CONTRA-ARGUMENTO
(o que o texto reconhece como verdade no lado oposto)`,

    glossário: `TERMOS DO PROJETO

— [termo]:
  definição:
  contexto de uso:
  primeira aparição:

— [termo]:
  definição:
  contexto de uso:
  primeira aparição:`,

    instituição: `NOME


FUNÇÃO
(o que faz · para quem existe)


PODER
(de onde vem · como se mantém · o que teme perder)


QUEM REPRESENTA
(interesses de qual grupo · inimigos declarados · aliados secretos)


ESTRUTURA INTERNA
(hierarquia · regras · ritos de entrada e saída)


PAPEL NA HISTÓRIA
(como afeta a protagonista · o que quer dela)`,

    projeto: `SINOPSE
(2-3 frases que explicam o livro para um editor)


PÚBLICO
(quem lê · que outros livros essa pessoa também lê)


PROMESSA DE LEITURA
(o que o leitor vai sentir · o que vai levar)


ESTÁGIO ATUAL
(rascunho / revisão / finalização)


PRAZO
(data de entrega real ou desejada)


NOTAS DE DESENVOLVIMENTO
`,
  };

  return fichas[type.id] || "";
}

function createProjectNoteDescription(type) {
  const descriptions = {
    projeto: "Visão geral da obra: sinopse, público, estágio, prazo e promessa de leitura.",
    pesquisa: "Fontes, hipóteses, referências e perguntas abertas do projeto.",
    submissão: "Envios editoriais, chamadas, prazos, formatos exigidos e respostas.",
    revisão: "Notas de processo editorial, problemas recorrentes, decisões e situação.",
    personagem: "Ficha de personagem, desejo, contradição, voz e arco.",
    cena: "Rascunho ou planejamento de uma cena específica.",
    mundo: "Sistema amplo: regras, sociedade, tensão estrutural, lugares e instituições.",
    lugar: "Espaço específico do projeto: casa, cidade, nave, redação ou praça.",
    instituição: "Grupo de poder, governo, facção, corporação, culto ou resistência.",
    objeto: "Item com peso simbólico ou narrativo no projeto.",
    cronologia: "Linha do tempo de acontecimentos internos e externos da história.",
    capítulo: "Estrutura intermediária entre cenas e manuscrito.",
    tema: "Intenção autoral, tensão temática e imagem central do projeto.",
    glossário: "Termos, nomes, conceitos e vocabulário próprio do projeto.",
    escaleta: "Sequência de cenas com função dramática.",
    "cena-roteiro": "Cena de roteiro com cabeçalho de cena, ação e personagens.",
    ato: "Divisão estrutural do roteiro, com função dramática e virada.",
    "personagem-roteiro": "Versão audiovisual de personagem, com função, voz e apresentação.",
    pauta: "Proposta jornalística com gancho, angulação, prazo e fontes.",
    fonte: "Pessoa real ouvida na apuração.",
    entrevista: "Perguntas, respostas brutas e trechos selecionados.",
    fato: "Dado verificável, fonte primária e situação na apuração.",
    poema: "Composição poética e suas decisões formais.",
    "série-poética": "Conjunto de poemas com fio temático ou formal.",
    argumento: "Tese, evidências e contra-argumento para ensaio.",
    crônica: "Gancho cotidiano, tom e conexão com o universal.",
  };

  return descriptions[type.id] || "Nota de projeto vinculada ao acervo.";
}

function createFromReferenceTemplate() {
  createManuscriptFromTemplate(state.template.selectedId);
}

function captureSelectedWord(allowCollapsedSelection = false) {
  const selection = window.getSelection();

  const inEditor = writingArea.contains(selection.anchorNode)
    || !!selection.anchorNode?.parentElement?.closest(".page-body");
  if (!selection || selection.rangeCount === 0 || !inEditor) {
    return;
  }

  if (selection.isCollapsed && !allowCollapsedSelection) {
    return;
  }

  const selectedText = selection.toString().trim();

  // Frase: seleção com espaços e pelo menos 2 palavras
  const palavras = selectedText.split(/\s+/).filter(p => /[\p{L}]/u.test(p));
  if (palavras.length >= 2) {
    state.lexical.selectedPhrase = selectedText;
    state.lexical.selectedWord   = null;
    state.lexical.selectedRange  = null;
    state.lexical.selectedContext = null;
    renderLexicalView();
    return;
  }

  // Palavra única
  const word = selectedText || findWordNearSelection(selection);
  const cleanWord = cleanSelectedWord(word);
  if (!cleanWord) return;

  state.lexical.selectedWord  = cleanWord;
  state.lexical.selectedPhrase = null;

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0).cloneRange();
    state.lexical.selectedRange = range;
    const node = range.startContainer;
    const para = node.nodeType === 3 ? node.parentNode : node;
    const paraEl = para?.closest?.("p,div,h1,h2,h3,li") || para;
    state.lexical.selectedContext = paraEl?.textContent?.trim() || null;
  }

  renderLexicalView();
  persistState(`${cleanWord} — biblioteca`);
}

function findWordNearSelection(selection) {
  const node = selection.anchorNode;
  const text = node?.textContent || "";
  let start = selection.anchorOffset;
  let end = selection.anchorOffset;

  while (start > 0 && /[\p{L}]/u.test(text[start - 1])) {
    start -= 1;
  }

  while (end < text.length && /[\p{L}]/u.test(text[end])) {
    end += 1;
  }

  return text.slice(start, end);
}

function cleanSelectedWord(value) {
  return value
    .split(/\s+/)[0]
    ?.replace(/[^\p{L}-]/gu, "")
    .trim();
}

// ── Sinônimos curados por classe para palavras polissêmicas ─────────────────
const _SINS_CLASSE = {
  "bem": {
    "Advérbio":    ["corretamente", "adequadamente", "devidamente", "perfeitamente", "acertadamente"],
    "Substantivo": ["virtude", "bondade", "benefício", "vantagem", "proveito"],
    "Interjeição": [],
  },
  "mal": {
    "Advérbio":    ["erradamente", "deficientemente", "inadequadamente", "incorretamente", "precariamente"],
    "Substantivo": ["maldade", "iniquidade", "dano", "prejuízo", "vileza", "agravo"],
  },
  "como": {
    "Verbo flexionado": ["ingiro", "devoro", "alimento-me"],
    "Conjunção":        ["tal qual", "assim como", "da mesma forma que", "à semelhança de"],
    "Advérbio":         ["de que modo", "de que maneira", "por qual meio"],
  },
  "canto": {
    "Substantivo masculino": ["cançao", "cântico", "cantiga", "melodia"],
    "Verbo flexionado":      ["entoar", "salmodiar", "trinar"],
  },
  "porto": {
    "Substantivo": ["ancoradouro", "cais", "atracadouro", "abrigo", "enseada"],
    "Verbo flexionado": [],
  },
  "livre": {
    "Adjetivo":     ["desimpedido", "solto", "independente", "autônomo", "desembaraçado"],
    "Verbo (subjuntivo)": ["liberte", "desvincule", "solte"],
  },
  "certa": {
    "Adjetivo":          ["determinada", "específica", "particular", "dada"],
    "Pronome indefinido": ["alguma", "uma", "qualquer"],
  },
  "dado": {
    "Verbo (particípio)": ["entregue", "concedido", "ofertado", "proporcionado"],
    "Substantivo":        ["cubo", "peça", "marcador"],
  },

  "mesmo": {
    "Advérbio": ["ainda assim", "contudo", "não obstante", "apesar disso", "todavia"],
    "Adjetivo": ["idêntico", "igual", "equivalente", "semelhante", "análogo"],
    "Pronome":  ["próprio", "em pessoa", "ele próprio", "pessoalmente"],
  },
  "so": {
    "Advérbio": ["apenas", "somente", "unicamente", "exclusivamente", "tão somente"],
    "Adjetivo": ["solitário", "sozinho", "isolado", "desamparado", "abandonado"],
  },
  "ainda": {
    "Advérbio": ["até agora", "até este momento", "por ora", "até então", "até o presente"],
    "Conjunção": ["embora", "conquanto", "mesmo que", "apesar de que", "posto que"],
  },
  "caso": {
    "Substantivo": ["situação", "ocorrência", "episódio", "acontecimento", "circunstância"],
    "Conjunção":   ["se", "desde que", "em caso de", "na hipótese de", "supondo que"],
  },
  "visto": {
    "Verbo (particípio)": ["observado", "avistado", "percebido", "notado", "contemplado"],
    "Substantivo":        ["autorização", "permissão", "aval", "aprovação", "chancela"],
  },
  "posto": {
    "Verbo (particípio)": ["colocado", "disposto", "depositado", "alocado", "instalado"],
    "Substantivo":        ["local", "estação", "cargo", "posição", "ponto"],
    "Conjunção":          ["embora", "ainda que", "apesar de que", "conquanto"],
  },
  "tanto": {
    "Pronome indefinido": ["tamanho", "tal quantidade", "semelhante volume", "tão grande porção"],
    "Advérbio":           ["assim", "tanto assim", "de tal modo", "em tal medida", "a esse ponto"],
  },
  "ora": {
    "Conjunção":   ["quer", "seja", "ou então", "alternadamente"],
    "Interjeição": ["ora bolas", "ora essa", "ora veja", "puxa"],
    "Advérbio":    ["agora", "neste momento", "por ora", "de momento"],
  },
  "morto": {
    "Verbo (particípio)": ["falecido", "extinto", "perecido", "expirado"],
    "Substantivo":        ["cadáver", "defunto", "finado", "corpo", "falecido"],
    "Adjetivo":           ["sem vida", "exânime", "inerte", "inanimado", "paralisado"],
  },
};

function getSinonimosPorClasse(word, className) {
  const entry = _SINS_CLASSE[word];
  if (entry) {
    const key = Object.keys(entry).find(k => className === k || className.startsWith(k));
    if (key !== undefined) return entry[key] || [];
  }
  // Fallback: sinônimos gerais — prioriza window.SINONIMOS (synonym-data.js, 1000+ entradas)
  // sobre letter-bucket (syntax-controller.js que sobrescreve window.getSynonyms)
  const _ns = w => w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const geral = (window.SINONIMOS && (window.SINONIMOS[word] || window.SINONIMOS[_ns(word)]))
                || getSynonyms(word);
  if (!geral.length || !window.VeredaLexical) return geral;
  const familiaOrigem = className.split(" ")[0];
  return geral.filter(s => {
    const cls = VeredaLexical.analyze(s, "")?.className || "";
    return cls.startsWith(familiaOrigem) || familiaOrigem.startsWith(cls.split(" ")[0]);
  });
}

async function renderFraseCard(frase, titulo) {
  lexicalTitle.textContent = titulo || "Frase";
  lexicalContext.innerHTML = "";
  lexicalCard.innerHTML = `<p class="lexical-phrase-loading">Analisando frase…</p>`;

  if (!window.syntaxEngine) {
    lexicalCard.innerHTML = `<p class="lexical-disclaimer">Análise de frases não disponível.</p>`;
    return;
  }
  if (!syntaxEngine._isReady()) {
    await syntaxEngine.init().catch(() => null);
  }
  if (!syntaxEngine._isReady()) {
    lexicalCard.innerHTML = `<p class="lexical-disclaimer">Análise de frases não carregada.</p>`;
    return;
  }

  let res;
  try { res = syntaxEngine.analisarPeriodo(frase); } catch(e) { res = null; }
  if (!res) {
    lexicalCard.innerHTML = `<p class="lexical-disclaimer">Não foi possível analisar esta frase.</p>`;
    return;
  }

  const { resumo } = res;
  const verbosHtml = resumo.verbos?.length
    ? resumo.verbos.map(v => {
        const info = [v.tempo, v.pessoa].filter(Boolean).join(", ");
        return `<span class="lexical-alt">${escapeHtml(v.forma)}${info ? ` <em>(${escapeHtml(info)})</em>` : ""}</span>`;
      }).join("")
    : "<em>nenhum verbo identificado</em>";

  const conjHtml = resumo.conjuncoes?.length
    ? resumo.conjuncoes.map(c =>
        `<span class="lexical-alt">${escapeHtml(c.palavra)}${c.relacao ? ` <em>(${escapeHtml(c.relacao)})</em>` : ""}</span>`
      ).join("")
    : "";

  const alertasHtml = resumo.alertas?.length
    ? `<div class="lexical-frase-alerta">${resumo.alertas.map(a => `<span>⚠ ${escapeHtml(String(a))}</span>`).join("")}</div>`
    : "";

  // Dica ao escritor por tipo de período
  const _DICAS_PERIODO = {
    "Período simples":               "Frases simples têm impacto: são diretas, firmes, sem ambiguidade. Reserve-as para revelações, clímax e afirmações centrais.",
    "Período composto por coordenação": "A coordenação cria ritmo binário ou enumerativo. Eficaz em paralelos e sequências; em excesso, nivela tudo ao mesmo peso.",
    "Período composto por subordinação": "Períodos longos acumulam informação — o leitor pode se perder. Teste quebrar em dois; o período subordinado deve pesar menos que a principal.",
    "Período composto misto":        "Período com coordenação e subordinação: versátil, mas exige atenção ao encadeamento. Verifique se o leitor consegue identificar o núcleo da frase.",
  };
  const dicaFrase = _DICAS_PERIODO[resumo.tipo] || "";

  // Termos sintáticos heurísticos da frase
  const _tokens = frase.match(/[\p{L}-]+/gu) || [];
  const _termos = _tokens.slice(0, 12).map(tk => {
    const an = window.VeredaLexical?.analyze(tk, frase);
    if (!an) return null;
    const fn = an.funcaoSintatica || an.functionName || "";
    return fn ? `<span class="lexical-alt">${escapeHtml(tk)} <em>(${escapeHtml(fn)})</em></span>` : null;
  }).filter(Boolean);

  lexicalCard.innerHTML = `
    <span class="material-symbols-outlined">edit_note</span>
    <p class="lexical-frase-texto">"${escapeHtml(frase.slice(0, 120))}${frase.length > 120 ? "…" : ""}"</p>
    <p class="tag">${escapeHtml(resumo.tipo)}</p>
    ${dicaFrase ? `<p class="lexical-note">${escapeHtml(dicaFrase)}</p>` : ""}
    <dl>
      <div><dt>Orações</dt><dd>${resumo.nOracoes}</dd></div>
      <div class="lexical-frase-verbos"><dt>Verbos</dt><dd class="lexical-alt-list">${verbosHtml}</dd></div>
      ${conjHtml ? `<div class="lexical-frase-conj"><dt>Conjunções</dt><dd class="lexical-alt-list">${conjHtml}</dd></div>` : ""}
      ${_termos.length ? `<div class="lexical-frase-termos"><dt>Termos</dt><dd class="lexical-alt-list">${_termos.join("")}</dd></div>` : ""}
      ${resumo.vozePassiva ? `<div><dt>Voz</dt><dd>Passiva</dd></div>` : ""}
    </dl>
    ${alertasHtml}
  `;
}

async function renderLexicalView() {
  const manuscript = getActiveManuscript();
  if (!manuscript) return;

  if (!state.lexical.selectedWord && !state.lexical.selectedPhrase) {
    if (lexicalTitle) lexicalTitle.textContent = manuscript.title;
    if (lexicalContext) lexicalContext.innerHTML = "";
    if (lexicalCard) lexicalCard.innerHTML = "";
    return;
  }

  if (VeredaLexical.hasLoadError()) {
    lexicalCard.innerHTML = `<p class="lexical-disclaimer">Vocabulário não carregado. Verifique a conexão e recarregue a página.</p>`;
    return;
  }

  // Frase selecionada → análise sintática do período
  if (state.lexical.selectedPhrase) {
    await renderFraseCard(state.lexical.selectedPhrase, manuscript.title);
    return;
  }

  await VeredaLexical.ensureLoaded();
  const contextText = state.lexical.selectedContext || manuscript.text;
  const analysis = VeredaLexical.analyze(state.lexical.selectedWord, contextText);

  if (!analysis) {
    lexicalTitle.textContent = manuscript.title;
    lexicalContext.innerHTML = "";
    lexicalCard.innerHTML = "";
    return;
  }

  lexicalTitle.textContent = manuscript.title;
  lexicalContext.innerHTML = VeredaLexical.createHighlightedContext(manuscript.text, analysis.word, escapeHtml);

  const countLabel = analysis.count === 1
    ? "1 vez neste texto"
    : analysis.count > 1
    ? `${analysis.count} vezes neste texto`
    : "nenhuma vez encontrada";

  // Sinônimos filtrados pela classe detectada
  let sinonimosHtml = "";
  try {
    await loadSynonyms(analysis.word);
    const sins = getSinonimosPorClasse(analysis.word, analysis.className);
    if (sins.length) {
      sinonimosHtml = `
        <div class="lexical-synonyms">
          <dt>Trocas possíveis <span class="lexical-syn-note" title="Clique para substituir. Revise concordância e registro após a troca. Ctrl+Z desfaz.">revise após trocar</span></dt>
          <dd class="lexical-syn-list">${sins.map(s =>
            `<button class="lexical-syn-btn" data-replace-word="${escapeHtml(s)}" title="Substituir por '${escapeHtml(s)}' — revise concordância e registro. Desfaça com Ctrl+Z.">${escapeHtml(s)}</button>`
          ).join("")}</dd>
        </div>`;
    }
  } catch(e) { /* sinônimos opcionais — não bloquear */ }

  const altHtml = analysis.alternatives?.length
    ? `<div class="lexical-alternatives">
        <dt>Outras leituras</dt>
        <dd class="lexical-alt-list">${analysis.alternatives.map(a =>
          `<span class="lexical-alt">${escapeHtml(a)}</span>`
        ).join("")}</dd>
      </div>`
    : "";

  const funcaoHtml = analysis.funcaoSintatica
    ? `<span class="lexical-funcao-tag">${escapeHtml(analysis.funcaoSintatica)}</span>`
    : "";
  const defHtml = analysis.definicao
    ? `<p class="lexical-definicao">${escapeHtml(analysis.definicao)}</p>`
    : "";

  lexicalCard.innerHTML = `
    <span class="material-symbols-outlined">dictionary</span>
    <h2>${escapeHtml(analysis.displayWord)}</h2>
    <div class="lexical-tags-row">
      <p class="tag">${escapeHtml(analysis.className)}</p>
      ${funcaoHtml}
    </div>
    ${defHtml}
    <p class="lexical-note">${escapeHtml(analysis.note)}</p>
    <dl>
      <div><dt>Campo</dt><dd>${escapeHtml(analysis.field)}</dd></div>
      <div><dt>Ocorrências</dt><dd>${countLabel}</dd></div>
      ${sinonimosHtml}
      ${altHtml}
    </dl>
  `;

  // Substituir palavra ao clicar num sinônimo — busca a palavra no texto do editor
  lexicalCard.querySelectorAll("[data-replace-word]").forEach(btn => {
    btn.addEventListener("click", () => {
      const replacement = btn.dataset.replaceWord;
      const original    = analysis.word;
      if (!replacement || !original) return;

      // Preservar capitalização original
      const adapt = (orig, repl) => {
        if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(orig))
          return repl.charAt(0).toUpperCase() + repl.slice(1);
        return repl;
      };

      writingArea.focus();
      VeredaDocument.pushUndo(writingArea.innerHTML); // permite Ctrl+Z
      const sel = window.getSelection();
      let replaced = false;

      // Prioridade: usar o range salvo quando a palavra foi selecionada
      const savedRange = state.lexical?.selectedRange;
      if (savedRange && writingArea.contains(savedRange.commonAncestorContainer)) {
        const origText = savedRange.toString();
        if (origText.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"") === original) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
          document.execCommand("insertText", false, adapt(origText, replacement));
          replaced = true;
          state.lexical.selectedRange = null;
        }
      }

      // Fallback: primeira ocorrência no texto
      if (!replaced) {
        const walker = document.createTreeWalker(writingArea, NodeFilter.SHOW_TEXT);
        const normOrig = original.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
        while (walker.nextNode() && !replaced) {
          const node = walker.currentNode;
          const normNode = node.textContent.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
          const idx = normNode.indexOf(normOrig);
          if (idx !== -1) {
            const origText = node.textContent.slice(idx, idx + normOrig.length);
            const range    = document.createRange();
            range.setStart(node, idx);
            range.setEnd(node, idx + normOrig.length);
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand("insertText", false, adapt(origText, replacement));
            replaced = true;
          }
        }
      }

      if (replaced) {
        updateCurrentManuscript();
        persistState(`Ajuste fino: ${analysis.displayWord} → ${replacement}`);
      }
    });
  });
}

if (lexicalSearch) {
  lexicalSearch.addEventListener("input", () => {
    const q = lexicalSearch.value.trim().toLowerCase().replace(/[^a-záéíóúâêôãõçàü\-]/g, "");
    if (q.length >= 2) {
      state.lexical.selectedWord = q;
      renderLexicalView();
    } else if (!q) {
      state.lexical.selectedWord = null;
      renderLexicalView();
    }
  });
  lexicalSearch.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { lexicalSearch.value = ""; state.lexical.selectedWord = null; renderLexicalView(); }
  });
}

function renderTemplateStudio() {
  if (VeredaTemplates.hasLoadError()) {
    if (templateScreen) templateScreen.innerHTML = `<p class="template-empty">Guias não carregados. Verifique a conexão e recarregue a página.</p>`;
    return;
  }
  if (!VeredaTemplates.isLoaded()) {
    if (templateScreen) templateScreen.innerHTML = `<p class="template-empty">Carregando guias…</p>`;
    VeredaTemplates.ready().then(renderTemplateStudio);
    return;
  }
  let activeTemplate = VeredaTemplates.getTemplate(templateState.activeId);
  // Fallback: templateState.activeId can become stale — pick first available
  if (!activeTemplate) {
    const firstTemplates = VeredaTemplates.listTemplates();
    activeTemplate = firstTemplates[0] ? VeredaTemplates.getTemplate(firstTemplates[0].id) : null;
    if (activeTemplate) templateState.activeId = activeTemplate.id;
  }
  if (!activeTemplate) {
    if (templateScreen) templateScreen.innerHTML = `<p class="template-empty">Nenhum guia disponível.</p>`;
    return;
  }
  templateState.craftId = templateState.craftId || activeTemplate?.oficio || "ficcao";
  const crafts = VeredaTemplates.listOficios();
  const query = normalizeSearch(templateState.query);
  const sourceTemplates = query ? VeredaTemplates.listTemplates() : VeredaTemplates.listTemplates({ oficio: templateState.craftId });
  const templates = query
    ? sourceTemplates.filter((template) => normalizeSearch(`${template.label} ${template.title} ${template.description} ${template.oficio} ${template.id}`).includes(query))
    : sourceTemplates;

  // Search: auto-select first result when active template isn't in results
  if (query && templates.length > 0 && !templates.find(t => t.id === activeTemplate.id)) {
    const firstResult = VeredaTemplates.getTemplate(templates[0].id);
    if (firstResult) {
      templateState.activeId = firstResult.id;
      templateState.craftId = firstResult.oficio;
      activeTemplate = firstResult;
    }
  }

  const activeStep = VeredaTemplates.getStep(templateState.activeId, templateState.step);
  if (!activeStep) return;

  templateSearch.value = templateState.query;

  craftTabs.innerHTML = crafts
    .map((craft) => {
      const isActive = craft.id === templateState.craftId ? " is-active" : "";

      return `
        <button class="craft-tab${isActive}" data-craft-select="${craft.id}">
          <span class="material-symbols-outlined">${craft.icon}</span>
          ${escapeHtml(craft.label)}
          <b>${craft.count}</b>
        </button>
      `;
    })
    .join("");

  if (templates.length) {
    const countLine = query
      ? `<p class="template-search-count">${templates.length} guia${templates.length !== 1 ? "s" : ""} encontrado${templates.length !== 1 ? "s" : ""}</p>`
      : "";
    templateTabs.innerHTML = countLine + templates
      .map((template) => {
        const isActive = template.id === activeTemplate.id ? " is-active" : "";
        const stepLabel = template.stepCount > 1 ? `<small class="template-tab-steps">${template.stepCount} etapas</small>` : "";
        return `
          <button class="template-tab${isActive}" data-template-select="${template.id}" title="${escapeHtml(template.description || "")}">
            <span class="material-symbols-outlined">${template.icon}</span>
            ${escapeHtml(template.label)}
            ${stepLabel}
          </button>
        `;
      })
      .join("");
  } else {
    templateTabs.innerHTML = `<p class="template-empty">Nenhum guia encontrado para "${escapeHtml(templateState.query)}".</p>`;
  }

  templateStepLabel.textContent = `tela ${activeStep.index + 1} de ${activeStep.total}`;
  templateScreen.innerHTML = createTemplateStepMarkup(activeTemplate, activeStep);
}

function createTemplateStepMarkup(template, step) {
  const dots = Array.from({ length: step.total }, (_, index) => `<i${index === step.index ? ' class="is-active"' : ""}></i>`).join("");
  const items = Array.isArray(step.items) && step.items.length ? createTemplateItemsMarkup(step.items) : "";
  const tip = step.tip ? `<p class="template-tip">${escapeHtml(step.tip)}</p>` : "";
  const secondary = step.secondary ? `<button class="template-secondary" data-template-next>${escapeHtml(step.secondary)}</button>` : "";
  const isLastStep = step.index === step.total - 1;
  const primaryAction = isLastStep ? `data-template-use="${template.id}"` : "data-template-next";

  return `
    <div class="template-dots">${dots}</div>
    <div class="template-icon">
      <span class="material-symbols-outlined">${template.icon}</span>
    </div>
    <p class="template-eyebrow">${escapeHtml(step.eyebrow)}</p>
    <h3>${escapeHtml(step.title)}</h3>
    <p>${escapeHtml(step.body)}</p>
    ${tip}
    ${items}
    <button class="template-primary" ${primaryAction}>${escapeHtml(step.primary)}</button>
    ${secondary}
  `;
}

function createTemplateItemsMarkup(items) {
  return `
    <div class="template-checklist">
      ${items
        .map(([title, subtitle, status]) => {
          const icon = status === "done" ? "check" : status === "info" ? "info" : status === "warn" ? "priority_high" : "";

          return `
            <div class="template-check-item" data-status="${escapeHtml(status)}">
              <span class="template-check-icon">${icon ? `<span class="material-symbols-outlined">${icon}</span>` : ""}</span>
              <div>
                <strong>${escapeHtml(title)}</strong>
                <small>${escapeHtml(subtitle)}</small>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function selectTemplate(templateId) {
  const template = VeredaTemplates.getTemplate(templateId);
  templateState = {
    activeId: templateId,
    step: 0,
    craftId: template.oficio || templateState.craftId,
    query: templateState.query,
  };
  renderTemplateStudio();
}

function selectCraft(craftId) {
  const templates = VeredaTemplates.listTemplates({ oficio: craftId });
  const nextTemplate = templates[0];

  templateState = {
    activeId: nextTemplate?.id || templateState.activeId,
    step: 0,
    craftId,
    query: "",
  };
  renderTemplateStudio();
  const studioEl = document.querySelector(".template-studio");
  if (studioEl) studioEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setTemplateSearch(query) {
  templateState.query = query;
  renderTemplateStudio();
}

function changeTemplateStep(direction) {
  const template = VeredaTemplates.getTemplate(templateState.activeId);
  if (!template) return;
  templateState.step = Math.min(Math.max(templateState.step + direction, 0), template.steps.length - 1);
  renderTemplateStudio();
}

function getDimLabel(dimId) {
  const map = { economia:"Economia", clareza:"Clareza", ritmo:"Ritmo", voz:"Voz", estrutura:"Estrutura", pov:"POV", lexico:"Léxico", norma:"Norma" };
  return map[dimId] || dimId;
}

function updateAcademyParallax() {
  const parallaxItems = document.querySelectorAll("[data-parallax-speed]");
  const viewportMiddle = contentStage.clientHeight / 2;

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallaxSpeed) || 0;
    const rect = item.getBoundingClientRect();
    const parentRect = contentStage.getBoundingClientRect();
    const relativeMiddle = rect.top - parentRect.top + rect.height / 2;
    const offset = (relativeMiddle - viewportMiddle) * speed;

    item.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

function analyzeInspector(text) {
  const raw = text.trim();
  if (!raw) return null;

  const allTokens = raw.toLowerCase().replace(/[^a-záàâãéêíóôõúçy\s]/gi, " ").split(/\s+/).filter(Boolean);

  // Word frequency — skip stopwords, min 3 chars
  const freq = {};
  allTokens.forEach(w => {
    if (w.length >= 3 && !STOPWORDS.has(w) && !PRONOUNS_PT.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Grammatical distribution (heuristic)
  let nouns = 0, verbs = 0, adjs = 0, pronouns = 0;
  allTokens.forEach(w => {
    if (PRONOUNS_PT.has(w)) { pronouns++; return; }
    if (/^.+(ar|er|ir|ou|eu|ava|ia|ará|erá|isse|esse|asse|endo|ando|indo)$/.test(w)) { verbs++; return; }
    if (/^.+(oso|osa|al|vel|nte|ado|ada|ido|ida|ivo|iva|ico|ica)$/.test(w)) { adjs++; return; }
    if (w.length >= 3) nouns++;
  });
  const total = Math.max(1, nouns + verbs + adjs + pronouns);
  const dist = [
    { label: "Substantivo", pct: Math.round((nouns / total) * 100),     color: "var(--primary)" },
    { label: "Verbo",       pct: Math.round((verbs / total) * 100),     color: "var(--ochre)" },
    { label: "Adjetivo",    pct: Math.round((adjs / total) * 100),      color: "var(--sienna)" },
    { label: "Pronome",     pct: Math.round((pronouns / total) * 100),  color: "var(--sage)" },
  ].filter(d => d.pct > 0);

  // Flesch-BR
  const sentences = Math.max(1, raw.split(/[.!?]+/).filter(s => s.trim()).length);
  const syllables = allTokens.reduce((acc, w) => acc + estimarSilabas(w), 0);
  const wordCount = allTokens.length;
  const flesch = Math.max(0, Math.min(100, Math.round(
    248.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / Math.max(1, wordCount))
  )));
  // P1 — leitura local, não diagnóstico (SoT §3 Princípio 6 + §4 Glossário)
  const fleschMeta =
    flesch >= 80 ? { label: "Acessível",           sub: "Leitura fluida" } :
    flesch >= 60 ? { label: "Moderado",            sub: "Público geral" } :
    flesch >= 40 ? { label: "Denso",               sub: "Pode ser intencional" } :
    flesch >= 20 ? { label: "Muito denso",         sub: "Leitura exigente" } :
                   { label: "Extremamente denso",  sub: "Acadêmico ou especializado" };

  const lexicalDensity = total > 0 ? Math.round(((nouns + verbs + adjs) / total) * 100) : 0;

  return { topWords, dist, flesch, fleschMeta, lexicalDensity };
}

function updateWritingStats() {
  renderInspector();
}

function getChecklistFor(manuscriptId, templateId) {
  return checklistState[manuscriptId]?.[templateId] || {};
}

function setChecklistCriterion(manuscriptId, templateId, criterion, checked) {
  checklistState = {
    ...checklistState,
    [manuscriptId]: {
      ...(checklistState[manuscriptId] || {}),
      [templateId]: {
        ...(checklistState[manuscriptId]?.[templateId] || {}),
        [criterion]: checked,
      },
    },
  };

  persistChecklistState();
  renderProjectGrid();
}

function selectReferenceTemplate(templateId) {
  state.template.selectedId = templateId;
  renderTemplateReference();
  renderSpecializedEditor(getActiveManuscript());
  persistState("Guia selecionado");
}

function openAcademyEnemGuide() {
  state.template.selectedId = "redacao-enem";
  state.template.open = true;
  renderTemplateReference();
  renderSpecializedEditor(getActiveManuscript());
  applyTemplateLayout();
  setView("editor", { updateRoute: true });
  requestAnimationFrame(focusEditor);
  persistState("Guia ENEM aberto");
}

function toggleTemplateSide() {
  state.template.side = state.template.side === "left" ? "right" : "left";
  state.template.open = true;
  applyTemplateLayout();
  persistState("Lado do guia ajustado");
}

function toggleTemplatePanel() {
  state.template.open = !state.template.open;
  applyTemplateLayout();
  persistState(state.template.open ? "Guia aberto" : "Guia oculto");
}

function updateTemplateWidth(clientX) {
  const bounds = editorSplit.getBoundingClientRect();
  const rawWidth =
    state.template.side === "left" ? clientX - bounds.left : bounds.right - clientX;
  state.template.width = Math.min(520, Math.max(260, Math.round(rawWidth)));
  applyTemplateLayout();
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function createExcerpt(text) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return cleanText.length > 118 ? `${cleanText.slice(0, 118)}...` : cleanText;
}

function formatUpdatedAt(value) {
  const updatedAt = new Date(value);
  const diffMs = Date.now() - updatedAt.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "agora";
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 48) {
    return `há ${diffHours}h`;
  }

  return updatedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getUpdatedTime(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "manuscrito";
}

function createDateTimeStamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => String(value).padStart(2, "0"))
    .join("-");

  return `${date}-${time}`;
}

function formatTimeWithSeconds(value) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── DISPATCH MAP: data-action → handler ──────────────────────────────────
// Adicionar nova action = uma linha neste objeto.
const ACTION_HANDLERS = {
  "toggle-fullscreen":       () => {
    const icon = document.querySelector("[data-fullscreen-icon]");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      if (icon) icon.textContent = "fullscreen_exit";
    } else {
      document.exitFullscreen?.().catch(() => {});
      if (icon) icon.textContent = "fullscreen";
    }
  },
  "toggle-focus":            () => shell.classList.contains("is-focus") ? exitFocusMode() : enterFocusMode(),
  "exit-focus":              () => exitFocusMode(),
  "toggle-ruler":            () => toggleRuler(),
  "toggle-template-side":    () => toggleTemplateSide(),
  "toggle-template-panel":   () => toggleTemplatePanel(),
  "toggle-left-panel":       () => togglePanel("left"),
  "toggle-right-panel":      () => togglePanel("right"),
  "toggle-dark-mode":        () => { const isDark = localStorage.getItem(DARK_MODE_KEY) !== "on"; localStorage.setItem(DARK_MODE_KEY, isDark ? "on" : "off"); applyDarkMode(isDark); },
  "toggle-global-search":    () => toggleGlobalSearch(),
  "toggle-grammar-color":    () => toggleGrammarColor(),
  "toggle-nav":              () => nav.classList.toggle("is-open"),
  "toggle-bandeja":          () => toggleBandeja(),
  "close-bandeja":           () => closeBandeja(),
  "open-backup-from-bandeja": () => {
    closeBandeja();
    setView("arquivo", { updateRoute: true });
    setTimeout(() => {
      const zone = document.querySelector(".archive-protect-zone");
      if (!zone) return;
      zone.scrollIntoView({ behavior: "smooth", block: "start" });
      const det = zone.querySelector("details.archive-security-details");
      if (det && !det.open) det.open = true;
    }, 200);
  },
  "toggle-audio-player":     () => toggleAudioPanel(),
  "toggle-share-panel":      () => toggleSharePanel(),
  "toggle-pomodoro":         () => togglePomodoro(),
  "toggle-rimalab-encyclopedia": () => toggleRimaLabEncyclopedia(),
  "scroll-rights":           () => rightsLab?.scrollIntoView({ behavior: "smooth", block: "start" }),
  "switch-atelier-revisar":   () => switchAtelier("revisar"),
  "switch-atelier-guias":     () => switchAtelier("guias"),
  "switch-atelier-publicar":  () => switchAtelier("publicar"),
  "go-autoria":              () => setView("autoria", { updateRoute: true }),
  "toggle-typewriter-sound": () => _toggleTypewriterSound(),
  
  "voice-use-active":        () => useActiveManuscriptForVoice(),
  "voice-analyze":           () => renderVoiceMirror(),
  "export-voice-mirror":     () => exportVoiceMirrorText(),
  "rimalab-use-active":      () => useActiveManuscriptForRimaLab(),
  "export-rimalab":          () => exportRimaLabText(),
  "copy-rimalab":            () => copyRimaLabAnalysis(),
  "copy-voice-result":       () => copyVoiceResult(),
  "export-decolonial":       () => exportDecolonialDetected(),
  "export-analise":          () => exportAnaliseGeral(),
  "check-sw-update":         () => checkForSWUpdate(),
  "export-precision":        () => exportPrecisionAnalysis(),
  "export-acervo":           () => exportAcervoCompleto(),
  "export-obsidian-vault":   () => exportObsidianVault(),
  "copy-manuscript-text":    () => {
    const ms = getActiveManuscript();
    const text = ms?.text || writingArea?.innerText || "";
    if (!text.trim()) { saveStatus.textContent = "Nada para copiar — escreva primeiro."; return; }
    navigator.clipboard?.writeText(text.trim()).then(() => {
      saveStatus.textContent = `Texto copiado (${countWords(text)} palavras)`;
    }).catch(() => {
      saveStatus.textContent = "Cópia não disponível neste navegador";
    });
  },
  "clear-rimalab":           () => clearRimaLabText(),
  "open-create-note":        () => openCreateNote(),
  "close-create-note":       () => closeCreateNote(),
  "create-quick-note":       () => createQuickNote(),
  "create-blank-manuscript": () => createBlankManuscript(),
  "create-from-reference-template": () => createFromReferenceTemplate(),
  "create-step-back":        () => createNoteParentId ? closeCreateNote() : renderCreateNoteStep(1),
  "add-companion-note":      (_, t) => openAddCompanionNote(t?.dataset?.bibliaType),
  "toggle-fichas":           (_, t) => {
    const msId = t?.dataset?.fichasMs;
    if (!msId) return;
    if (!state.ui) state.ui = {};
    if (!state.ui.fichasCollapsed) state.ui.fichasCollapsed = {};
    state.ui.fichasCollapsed[msId] = !state.ui.fichasCollapsed[msId];
    persistState("Fichas recolhidas");
    renderManuscriptNavigation();
  },
  "accept-terms-blank":      () => acceptTerms("blank"),
  "accept-terms-guide":      () => acceptTerms("guide"),
  "accept-terms-continue":   () => acceptTerms("continue"),
  "toggle-ob-disclosure":    () => {
    const body    = document.getElementById("ob-disc-body");
    const toggle  = document.querySelector("[data-action='toggle-ob-disclosure']");
    const chevron = document.querySelector(".ob-chevron");
    if (!body) return;
    const open = !body.hidden;
    body.hidden = open;
    toggle?.setAttribute("aria-expanded", String(!open));
    if (chevron) chevron.style.transform = open ? "" : "rotate(180deg)";
  },
  "welcome-write":           () => handleWelcomeWrite(),
  "welcome-rimalab":         () => handleWelcomeRimalab(),
  "welcome-voice":           () => handleWelcomeVoice(),
  "welcome-autoria":         () => handleWelcomeAutoria(),
  "welcome-blank":           () => handleWelcomeBlank(),
  "switch-view-editor":      () => setView("editor", { updateRoute: true }),
  "academy-open-enem-guide": () => openAcademyEnemGuide(),
  "open-active-manuscript":  () => { setView("editor", { updateRoute: true }); focusEditor(); },
  "hint-goto-academia":      () => { hideAcademiaHint(); hintDismissed = true; setView("academia", { updateRoute: true }); },
  "hint-dismiss":            () => { hideAcademiaHint(); hintDismissed = true; },
  "install-app":             () => installApp(),
  "enem-print":              () => window.print(),
  "toggle-desk-background":  () => {
    const on = shell.classList.toggle("has-desk-background");
    localStorage.setItem("vereda:desk-background", on ? "on" : "off");
    const btn = document.querySelector("[data-action='toggle-desk-background']");
    if (btn) btn.setAttribute("aria-pressed", String(on));
  },
  "toggle-page-view":        () => {
    const isPages = _currentEditorView === "pages";
    setEditorViewMode(isPages ? "flow" : "pages");
    const btn = document.querySelector("[data-action='toggle-page-view']");
    if (btn) btn.setAttribute("aria-pressed", String(!isPages));
  },
  "export-proof":            () => exportProof(),
  "send-proof-to-editor":    () => sendProofToEditor(),
  "sign-proof-author":       () => signProofAuthor(),
  "reset-proof-author":      () => resetProofAuthor(),
  "stamp-blockchain":        () => stampWithOpenTimestamps(),
  "validate-proof-file":     () => document.querySelector("[data-proof-validate-input]")?.click(),
  "toggle-proof-sessions":   () => toggleProofSessionHistory(),
  "toggle-proof-filter":     () => toggleProofSessionFilter(),
  "new-proof-session":       () => startNewProofSession(),
  "export-backup":           () => exportBackup(),
  "import-backup":           () => requestBackupImport(),
  "choose-filesystem-backup":  () => chooseFilesystemBackup(),
  "save-filesystem-backup":    () => saveFilesystemBackup(true),
  "stop-filesystem-backup":    () => stopFilesystemBackup(),
  "forget-filesystem-backup":  () => forgetFilesystemBackup(),
  "import-from-filesystem":    () => importFromFilesystem(),
  "delete-active-manuscript":() => { if (state.activeId) deleteManuscript(state.activeId); },
  "master-reset":            () => showMasterResetModal(),
  "confirm-master-reset":    () => executeMasterReset(),
  "cancel-master-reset":     () => hideMasterResetModal(),
  "create-version":          () => createManualVersion(),
  "edit-word-goal":          () => promptWordGoal(),
  "reset-pomodoro":          () => resetPomodoro(),
  "open-reader-mode":        () => openReaderMode(),
  "close-reader-mode":       () => closeReaderMode(),
  "reader-play-pause":       () => readerPlayPause(),
  "reader-cycle-speed":      () => readerCycleSpeed(),
  "reader-cycle-font":       () => readerCycleFont(),
  "reader-toggle-ruler":     () => { readerRuler = !readerRuler; updateReaderRuler(); },
  "export-manuscript":       (_, t) => exportCurrentManuscript(t.dataset.exportFormat),
  "export-rtf": () => {
    const opts = _getExportScope();
    const pkg  = VeredaExport.buildOutputPackage(state.manuscripts, opts);
    if (pkg.warnings.length) { saveStatus.textContent = pkg.warnings[0]; return; }
    const docs = pkg.items;
    if (docs.length === 1) {
      const ms = docs[0];
      const html = opts.scope === "current" && writingArea ? writingArea.innerHTML : (ms.html || "");
      VeredaDocument.downloadRtf(html, ms.pagePreset || "draft", ms.title || "Manuscrito", ms.author || "");
      saveStatus.textContent = `RTF exportado — ${ms.title || "Manuscrito"}`;
    } else {
      const combinedHtml = docs.map(ms => `<h1>${escapeHtml(ms.title || "Sem título")}</h1>${ms.html || ""}`).join("<p></p>");
      VeredaDocument.downloadRtf(combinedHtml, "draft", `Acervo Escrevaral — ${docs.length} textos`, "");
      saveStatus.textContent = `RTF exportado — ${docs.length} texto${docs.length !== 1 ? "s" : ""}`;
    }
  },
  "print-pages": () => {
    const ms = getActiveManuscript();
    if (!ms) return;
    const preset = ms.pagePreset || pagePresetSel?.value || "draft";
    VeredaPrint.printManuscript(
      { title: ms.title, author: ms.author, html: writingArea ? writingArea.innerHTML : (ms.html || "") },
      { preset }
    );
  },
  "toggle-editorial-group": (_, t) => {
    const group = t.closest("[data-editorial-group]");
    if (!group) return;
    const open = group.classList.toggle("is-open");
    formatBar?.classList.toggle("is-editorial-open", open);
    t.setAttribute("aria-expanded", String(open));
  },
  "crono-add-task":  (e, t) => cronoHandleAction("add-task",  e, t),
  "crono-add-note":  (e, t) => cronoHandleAction("add-note",  e, t),
  "crono-toggle":    (e, t) => cronoHandleAction("toggle",    e, t),
  "crono-delete":    (e, t) => cronoHandleAction("delete",    e, t),
  "sp-add-scene": (e) => {
    e.preventDefault();
    const el = document.createElement("div");
    el.innerHTML = `<div class="sp-block" data-sp-block="scene"><div class="sp-slug-row"><span class="sp-slug-tag">Cena</span><input class="sp-slug-input" data-sp-slug placeholder="INT./EXT. LOCAL — DIA/NOITE" /></div><textarea class="sp-action-area" data-sp-action placeholder="Ação — o que a câmera vê."></textarea><button class="sp-add-dialogue" data-action="sp-add-dialogue" type="button"><span class="material-symbols-outlined">add</span> Diálogo</button></div>`;
    const addBtn = specializedEditor.querySelector(".sp-add-scene");
    if (addBtn) specializedEditor.querySelector(".screenplay-editor").insertBefore(el.firstElementChild, addBtn);
  },
  "sp-add-dialogue": (e, t) => {
    e.preventDefault();
    const el = document.createElement("div");
    el.innerHTML = `<div class="sp-block sp-dialogue-block" data-sp-block="dialogue"><input class="sp-char-input" data-sp-char placeholder="PERSONAGEM" /><textarea class="sp-lines-area" data-sp-lines placeholder="Fala do personagem."></textarea></div>`;
    t.closest("[data-sp-block='scene']")?.insertAdjacentElement("afterend", el.firstElementChild);
  },
  "teatro-add-fala": (e) => {
    e.preventDefault();
    const editor = specializedEditor.querySelector(".teatro-editor");
    const el = document.createElement("div");
    el.innerHTML = `<div class="teatro-block teatro-fala-block" data-teatro-block="fala"><input class="teatro-char-input" data-teatro-char placeholder="PERSONAGEM" /><input class="teatro-rub-input" data-teatro-rub placeholder="(rubrica opcional)" /><textarea class="teatro-dial-area" data-teatro-dial placeholder="Fala."></textarea><button class="teatro-remove-btn" data-action="teatro-remove-block" title="Remover fala"><span class="material-symbols-outlined">close</span></button></div>`;
    editor.insertBefore(el.firstElementChild, specializedEditor.querySelector(".teatro-add-row"));
    editor.querySelector(".teatro-fala-block:last-of-type .teatro-char-input")?.focus();
  },
  "teatro-add-rubrica": (e) => {
    e.preventDefault();
    const el = document.createElement("div");
    el.innerHTML = `<div class="teatro-block teatro-rubrica-block" data-teatro-block="rubrica"><input class="teatro-rubrica-input" data-teatro-rubrica placeholder="(rubrica de cena)" /></div>`;
    specializedEditor.querySelector(".teatro-editor").insertBefore(el.firstElementChild, specializedEditor.querySelector(".teatro-add-row"));
  },
  "teatro-add-local": (e) => {
    e.preventDefault();
    const el = document.createElement("div");
    el.innerHTML = `<div class="teatro-block teatro-local-block" data-teatro-block="local"><input class="teatro-local-input" data-teatro-local placeholder="[Local. O que o espaço carrega.]" /></div>`;
    specializedEditor.querySelector(".teatro-editor").insertBefore(el.firstElementChild, specializedEditor.querySelector(".teatro-add-row"));
  },
  "teatro-remove-block": (e, t) => { e.preventDefault(); t.closest("[data-teatro-block]")?.remove(); },
};

document.addEventListener("click", (event) => {
  const manuscriptDeleteTarget = event.target.closest("[data-manuscript-delete]");
  const folderToggleTarget = event.target.closest("[data-folder-toggle]");
  const manuscriptTarget  = event.target.closest("[data-manuscript-id]");
  const viewTarget        = event.target.closest("[data-view-target]");
  const actionTarget      = event.target.closest("[data-action]");
  const archivePinTarget  = event.target.closest("[data-archive-pin]");
  const archiveQuickTarget= event.target.closest("[data-archive-quick]");

  // theme-picker removido
  if (!topbarSearch.contains(event.target)) closeGlobalSearch();
  if (cronoShortcutOpen && !event.target.closest(".cronograma-month-picker")) toggleCronoDateShortcut(false);
  if (nav.classList.contains("is-open") && !nav.contains(event.target)) nav.classList.remove("is-open");

  // Fechar bandeja ao clicar em item dentro dela (view-target já fecha via setView; aqui cobre actions)
  if ((actionTarget || viewTarget) && event.target.closest(".bandeja-nav")) {
    setTimeout(closeBandeja, 80);
  }

  if (manuscriptDeleteTarget) { event.preventDefault(); event.stopPropagation(); deleteManuscript(manuscriptDeleteTarget.dataset.manuscriptDelete); return; }
  if (folderToggleTarget) { event.preventDefault(); toggleFolder(folderToggleTarget.dataset.folderToggle); return; }
  if (manuscriptTarget)  { event.preventDefault(); setActiveManuscript(manuscriptTarget.dataset.manuscriptId); return; }
  if (archivePinTarget)  { event.preventDefault(); event.stopPropagation(); togglePinnedManuscript(archivePinTarget.dataset.archivePin); return; }
  if (archiveQuickTarget) {
    event.preventDefault(); event.stopPropagation();
    const { archiveQuick: action, archiveDocument: id, archiveFormat: fmt } = archiveQuickTarget.dataset;
    if (action === "open")      openArchiveManuscript(id);
    if (action === "export")    exportArchiveManuscript(id, fmt);
    if (action === "duplicate") duplicateManuscript(id);
    return;
  }

  const archiveTarget      = event.target.closest("[data-archive-select]");
  const versionTarget      = event.target.closest("[data-version-restore]");
  const versionExportTarget= event.target.closest("[data-version-export]");
  const templateSelectTarget = event.target.closest("[data-template-select]");
  const templateUseTarget  = event.target.closest("[data-template-use]");
  const templateNextTarget = event.target.closest("[data-template-next]");
  const templatePrevTarget = event.target.closest("[data-template-prev]");
  const craftSelectTarget  = event.target.closest("[data-craft-select]");
  const refTemplateTarget  = event.target.closest("[data-reference-template]");
  const archiveFilterTarget= event.target.closest("[data-archive-filter]");
  const decolonialCatTarget= event.target.closest("[data-decolonial-category]");
  const createNoteTypeTarget    = event.target.closest("[data-create-note-type]");
  const createCategoryTarget    = event.target.closest("[data-create-category]");
  const createFromTemplateTarget= event.target.closest("[data-create-from-template]");
  const createDocTypeTarget     = event.target.closest("[data-create-doc-type]");
  const searchResultTarget      = event.target.closest("[data-global-search-result]");

  if (archiveTarget)       { event.preventDefault(); selectArchiveManuscript(archiveTarget.dataset.archiveSelect); return; }
  if (versionTarget)       { event.preventDefault(); restoreVersion(versionTarget.dataset.versionRestore); return; }
  if (versionExportTarget) { event.preventDefault(); exportVersion(versionExportTarget.dataset.versionExport); return; }
  if (templateSelectTarget){ event.preventDefault(); selectTemplate(templateSelectTarget.dataset.templateSelect); return; }
  if (templateUseTarget)   { event.preventDefault(); createManuscriptFromTemplate(templateUseTarget.dataset.templateUse); return; }
  if (templateNextTarget)  { event.preventDefault(); changeTemplateStep(1); return; }
  if (templatePrevTarget)  { event.preventDefault(); changeTemplateStep(-1); return; }
  if (craftSelectTarget)   { event.preventDefault(); selectCraft(craftSelectTarget.dataset.craftSelect); return; }
  if (refTemplateTarget)   { event.preventDefault(); openReferenceTemplate(refTemplateTarget.dataset.referenceTemplate); return; }
  if (archiveFilterTarget) { event.preventDefault(); setArchiveFilter(archiveFilterTarget.dataset.archiveFilter); return; }
  const archiveStatusTarget = event.target.closest("[data-archive-status-filter]");
  if (archiveStatusTarget) { event.preventDefault(); setArchiveStatusFilter(archiveStatusTarget.dataset.archiveStatusFilter); return; }
  if (decolonialCatTarget) { event.preventDefault(); decolonialState.category = decolonialCatTarget.dataset.decolonialCategory; renderDecolonialTool(); return; }
  if (createNoteTypeTarget){ event.preventDefault(); setCreateNoteType(createNoteTypeTarget.dataset.createNoteType); return; }
  if (createCategoryTarget){ event.preventDefault(); createNoteCategory = createCategoryTarget.dataset.createCategory; renderCreateNoteStep(2); return; }
  if (createFromTemplateTarget){ event.preventDefault(); createNoteFromTemplate(createFromTemplateTarget.dataset.createFromTemplate); return; }
  if (createDocTypeTarget) { event.preventDefault(); createNoteFromDocType(createDocTypeTarget.dataset.createDocType); return; }
  if (searchResultTarget)  { event.preventDefault(); openGlobalSearchResult(searchResultTarget.dataset.globalSearchResult); return; }

  // ── FORMAT BAR: data-fmt e data-editor-view ──────────────────────────────
  const fmtBtnEarly = event.target.closest("[data-fmt]");
  if (fmtBtnEarly) {
    const inEditor = writingArea.contains(document.activeElement) || document.activeElement === writingArea || !!document.activeElement?.closest(".page-body");
    if (!inEditor) focusEditorTarget();
    handleFormatCommand(fmtBtnEarly.dataset.fmt);
    return;
  }
  const viewBtnEarly = event.target.closest("[data-editor-view]");
  if (viewBtnEarly) { setEditorViewMode(viewBtnEarly.dataset.editorView); return; }

  if (viewTarget) {
    event.preventDefault();
    setView(viewTarget.dataset.viewTarget, { updateRoute: true });
    const academiaTool   = viewTarget.dataset.academiaTool;
    const academiaScroll = viewTarget.dataset.academiaScroll;
    if (academiaTool) { const tab = document.getElementById(`at-${academiaTool}`); if (tab) tab.click(); }
    if (academiaScroll) { requestAnimationFrame(() => { const t = document.querySelector(`.${academiaScroll}, [data-${academiaScroll}]`); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }); }
    return;
  }

  // ── Cronograma: atributos próprios ────────────────────────────────────────
  if (event.target.closest("[data-crono-month-toggle]")) { event.preventDefault(); toggleCronoDateShortcut(); return; }
  if (event.target.closest("[data-crono-prev]"))         { moveCronogramaByMonths(-1); return; }
  if (event.target.closest("[data-crono-next]"))         { moveCronogramaByMonths(1);  return; }
  const cronoShortcutMonthTarget = event.target.closest("[data-crono-shortcut-month]");
  if (cronoShortcutMonthTarget) { event.preventDefault(); moveCronogramaByMonths(parseInt(cronoShortcutMonthTarget.dataset.cronoShortcutMonth, 10)); return; }

  if (!actionTarget) return;

  // ── Dispatch map ──────────────────────────────────────────────────────────
  const handler = ACTION_HANDLERS[actionTarget.dataset.action];
  if (handler) handler(event, actionTarget);
});

document.addEventListener("keydown", (event) => {
  const archivePinTarget = event.target.closest("[data-archive-pin]");
  const archiveCardTarget = event.target.closest(".project-card[data-archive-select]");

  if (archivePinTarget && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    togglePinnedManuscript(archivePinTarget.dataset.archivePin);
    return;
  }

  if (archiveCardTarget && (event.key === "Enter" || event.key === " ")) {
    if (event.target.closest("button, [data-archive-pin]")) {
      return;
    }

    event.preventDefault();
    selectArchiveManuscript(archiveCardTarget.dataset.archiveSelect);
    return;
  }

  // Navegar entre páginas em modo Páginas: Ctrl+PageDown / Ctrl+PageUp
  if (_currentEditorView === "pages" && (event.ctrlKey || event.metaKey)) {
    if (event.key === "PageDown") { event.preventDefault(); navigatePage(1); return; }
    if (event.key === "PageUp")  { event.preventDefault(); navigatePage(-1); return; }
  }

  if (event.key === "Escape") {
    const bandeja = document.getElementById("mobile-bandeja");
    const bandejaOpen = bandeja ? !bandeja.hidden : false;
    const hasPriorityOverlay =
      nav.classList.contains("is-open") ||
      bandejaOpen ||
      shell.classList.contains("is-focus") ||
      themeMenu?.classList.contains("is-visible") ||
      !createNoteOverlay.hidden ||
      (welcomeOverlay && !welcomeOverlay.hidden);
    if (_currentEditorView === "pages" && !hasPriorityOverlay) {
      event.preventDefault();
      setEditorViewMode("flow");
      return;
    }
    if (nav.classList.contains("is-open")) nav.classList.remove("is-open");
    closeBandeja();
  }

  if (event.key === "Escape" && shell.classList.contains("is-focus")) {
    exitFocusMode();
  }

  if (event.key === "Escape" && themeMenu?.classList.contains("is-visible")) {
    closeThemeMenu();
  }

  if (event.key === "Escape" && !createNoteOverlay.hidden) {
    closeCreateNote();
  }

  if (event.key === "Escape" && welcomeOverlay && !welcomeOverlay.hidden) {
    closeWelcome();
  }

  // Ctrl+S — guardar agora (evita "Salvar como..." do navegador)
  if ((event.ctrlKey || event.metaKey) && event.key === "s" && !event.shiftKey) {
    event.preventDefault();
    persistState();
  }

  // Ctrl+P — imprimir manuscrito ativo (evita "Imprimir página" do navegador)
  if ((event.ctrlKey || event.metaKey) && event.key === "p" && !event.shiftKey) {
    const ms = getActiveManuscript();
    if (ms && (ms.text || "").trim() && window.VeredaPrint?.printManuscript) {
      event.preventDefault();
      window.VeredaPrint.printManuscript(ms, { view: "page" });
    }
  }
});

createNoteOverlay.addEventListener("click", (event) => {
  if (event.target === createNoteOverlay) {
    closeCreateNote();
  }
});

document.addEventListener("pointermove", (event) => {
  if (shell.classList.contains("is-focus") && state.focus.ruler) {
    shell.style.setProperty("--ruler-y", `${event.clientY}px`);
  }
});

const guideScrim = document.querySelector("[data-guide-scrim]");
if (guideScrim) {
  guideScrim.addEventListener("click", () => { if (state.template.open) toggleTemplatePanel(); });
}

templateResizer.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  templateResizer.setPointerCapture(event.pointerId);
  editorSplit.classList.add("is-resizing");
});

templateResizer.addEventListener("pointermove", (event) => {
  if (!editorSplit.classList.contains("is-resizing")) {
    return;
  }

  updateTemplateWidth(event.clientX);
});

templateResizer.addEventListener("pointerup", (event) => {
  if (!editorSplit.classList.contains("is-resizing")) {
    return;
  }

  templateResizer.releasePointerCapture(event.pointerId);
  editorSplit.classList.remove("is-resizing");
  persistState("Largura do guia ajustada");
});

focusSettingControls.forEach((control) => {
  control.addEventListener("input", () => {
    updateFocusSetting(control.dataset.focusSetting, control.value);
  });
});

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("hashchange", () => setView(getViewFromRoute()));
window.addEventListener("resize", updateDockIndicator);
document.addEventListener("fullscreenchange", () => {
  const icon = document.querySelector("[data-fullscreen-icon]");
  if (icon) icon.textContent = document.fullscreenElement ? "fullscreen_exit" : "fullscreen";
});
contentStage.addEventListener("scroll", () => requestAnimationFrame(updateAcademyParallax));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
  saveStatus.textContent = "Escrevaral instalado";
});

titleInput.addEventListener("input", updateCurrentManuscript);
writingArea.addEventListener("input", updateCurrentManuscript);

if (specializedEditor) {
  specializedEditor.addEventListener("input", (e) => {
    const template = VeredaTemplates.getTemplate(state.template.selectedId);
    const mode = template?.editorMode;
    if (mode === "soneto") {
      // update syllable count for changed verse
      const versoInput = e.target.closest("[data-verso]");
      if (versoInput) {
        const row = versoInput.closest(".soneto-row");
        const sylEl = row?.querySelector(".soneto-syl");
        if (sylEl) {
          const n = versoInput.value.trim() ? estimarSilabas(versoInput.value) : null;
          sylEl.textContent = n !== null ? n : "·";
          sylEl.className = "soneto-syl" + (n === null ? "" : n === 10 ? " syl-ok" : n > 10 ? " syl-over" : "");
        }
      }
      writingArea.innerText = serializeSoneto();
    } else if (mode === "screenplay") {
      writingArea.innerText = serializeScreenplay();
    } else if (mode === "teatro") {
      writingArea.innerText = serializeTeatro();
    } else if (!mode && window.FICHA_KINDS?.has(getActiveManuscript()?.kind)) {
      writingArea.innerText = serializeFicha();
    } else if (!mode && getActiveManuscript()?.type === "personagem") {
      writingArea.innerText = serializePersonagem();
    } else if (mode === "enem") {
      const enemArea = specializedEditor.querySelector("[data-enem-area]");
      if (enemArea) {
        writingArea.innerText = enemArea.innerText || "";
        updateENEMCounter();
      }
    } else if (mode === "slam") {
      const slamArea = specializedEditor.querySelector("[data-slam-area]");
      if (slamArea) {
        const text = slamArea.innerText || "";
        writingArea.innerText = text;
        // update live slam header
        const header = specializedEditor.querySelector("[data-slam-header]");
        if (header) {
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const min = words > 0 ? (words / SLAM_WPM).toFixed(1) : "0";
          const pct = Math.min(100, Math.round((words / SLAM_LIMIT_WORDS) * 100));
          const over = words > SLAM_LIMIT_WORDS;
          const est = header.querySelector(".slam-est");
          const wc  = header.querySelector(".slam-words");
          const bar = header.querySelector(".slam-bar i");
          if (est) { est.textContent = `~${min} min`; est.classList.toggle("slam-over", over); }
          if (wc)  wc.textContent = `${words} palavras`;
          if (bar) { bar.style.setProperty("--p", `${pct}%`); bar.classList.toggle("over", over); }
        }
      }
    }
    updateCurrentManuscript();
  });
}
writingArea.addEventListener("keydown", recordWritingProof);

// ── DETECÇÃO DE PASTE — transparência na prova de autoria ────────────────────
// Marca texto copiado internamente para distinguir de paste externo.
writingArea.addEventListener("copy", () => {
  const sel = window.getSelection()?.toString() || "";
  if (sel.length > 2) {
    sessionStorage.setItem("vrda-internal-copy", sel.slice(0, 200) + sel.length);
  }
});

writingArea.addEventListener("paste", (e) => {
  const clipboard = e.clipboardData || window.clipboardData;
  const pasted = clipboard?.getData("text") || "";
  const pastedHtml = clipboard?.getData("text/html") || "";
  if (!pasted.length) return;

  const internalMark = sessionStorage.getItem("vrda-internal-copy");
  const isInternal = internalMark && (
    pasted.startsWith(internalMark.slice(0, 50)) ||
    internalMark === pasted.slice(0, 200) + pasted.length
  );

  // Registra no proof data do manuscrito ativo
  const ms = getActiveManuscript();
  if (ms && state.proofs?.[ms.id]) {
    const pastes = state.proofs[ms.id].pastes || [];
    pastes.push({ at: new Date().toISOString(), chars: pasted.length, source: isInternal ? "internal" : "external" });
    state.proofs[ms.id].pastes = pastes;
    persistState();
  }

  if (!isInternal) {
    _showPasteNotice({
      richText: Boolean(pastedHtml && /<[^>]+>/.test(pastedHtml)),
    });
  }
});

const _PASTE_SNOOZE_KEY = "vrda-paste-notice-snooze";
const _PASTE_SNOOZE_MS  = 7 * 24 * 60 * 60 * 1000;

function _showPasteNotice({ richText = false } = {}) {
  const snoozed = parseInt(localStorage.getItem(_PASTE_SNOOZE_KEY) || "0", 10);
  if (Date.now() - snoozed < _PASTE_SNOOZE_MS) return;

  let toast = document.getElementById("paste-notice-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "paste-notice-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:18px;color:var(--primary);flex-shrink:0">content_paste</span>
      <div style="flex:1;min-width:0">
        <strong id="paste-notice-title" style="display:block;font-size:13px;color:var(--ink);margin-bottom:2px"></strong>
        <span id="paste-notice-body" style="font-size:12px;color:var(--muted)"></span>
      </div>
      <button id="paste-notice-snooze" style="font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;white-space:nowrap;padding:0 0 0 8px">Não mostrar<br>por 7 dias</button>
      <button id="paste-notice-close" style="background:none;border:none;cursor:pointer;color:var(--muted);flex-shrink:0" aria-label="Fechar">
        <span class="material-symbols-outlined" style="font-size:16px">close</span>
      </button>`;
    Object.assign(toast.style, {
      position:"fixed", bottom:"48px", left:"50%",
      transform:"translateX(-50%)", zIndex:"300",
      display:"flex", alignItems:"center", gap:"10px",
      background:"var(--card)", border:"1px solid var(--line)",
      borderRadius:"10px", boxShadow:"0 8px 32px rgba(26,26,26,0.13)",
      padding:"12px 14px", maxWidth:"420px", width:"90vw",
      fontFamily:"inherit",
    });
    document.body.appendChild(toast);

    document.getElementById("paste-notice-snooze").addEventListener("click", () => {
      localStorage.setItem(_PASTE_SNOOZE_KEY, String(Date.now()));
      toast.remove();
    });
    document.getElementById("paste-notice-close").addEventListener("click", () => toast.remove());
  }

  const title = toast.querySelector("#paste-notice-title");
  const body = toast.querySelector("#paste-notice-body");
  if (title && body) {
    title.textContent = richText ? "Texto colado como texto limpo" : "Texto colado registrado";
    body.textContent = richText
      ? "A formatação de Word ou Docs foi removida. O trecho também entra como colagem externa na prova de autoria."
      : "O trecho entra como colagem externa na prova de autoria.";
  }

  // Auto-dismiss após 8s
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.remove(), 8000);
}

function resetHintTimer() {
  hideAcademiaHint();
  clearTimeout(hintIdleTimer);
  clearTimeout(hintAutoHideTimer);
  if (!hintDismissed) {
    hintIdleTimer = setTimeout(showAcademiaHint, HINT_IDLE_MS);
  }
}

writingArea.addEventListener("input", resetHintTimer);
writingArea.addEventListener("keydown", resetHintTimer);

// ── PAGED EDITOR: sincronizar edições de volta ao writing-area ───────────
if (pagedEditor) {
  pagedEditor.addEventListener("input", () => {
    const rejoined = VeredaPagination.joinPages(pagedEditor);
    writingArea.innerHTML = rejoined;
    updateCurrentManuscript();
    schedulePagination({ immediate: isPagedEditorOverflowing() });
  });
  pagedEditor.addEventListener("focusin", () => {
    document.addEventListener("selectionchange", updateFormatBarState, { once: false });
    const total = pagedEditor.querySelectorAll(".manuscript-page").length;
    updatePageCount(total);
  });
}

// ── CURSOR: salva e restaura posição após re-paginação ────────────────────
// Usa a API Range para serializar/deserializar posição por offset de texto.

function getPageBodyFromNode(node) {
  if (!node) return null;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return el?.closest?.(".page-body") || null;
}

function getTextOffset(root, node, offset) {
  if (!root || !node) return 0;
  const range = document.createRange();
  range.selectNodeContents(root);
  try {
    range.setEnd(node, offset);
    return range.toString().length;
  } catch {
    return root.innerText.length;
  }
}

function setCursorAtTextOffset(root, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (offset <= node.textContent.length) {
      const range = document.createRange();
      range.setStart(node, offset);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      root.closest(".manuscript-page")?.scrollIntoView({ block: "nearest" });
      return true;
    }
    offset -= node.textContent.length;
  }

  root.focus();
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  root.closest(".manuscript-page")?.scrollIntoView({ block: "nearest" });
  return true;
}

function saveCursorPosition() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const pageBody = getPageBodyFromNode(range.startContainer);
  if (!pageBody) return null;

  const bodies = Array.from(pagedEditor.querySelectorAll(".page-body"));
  const pageIndex = pageBody.closest(".manuscript-page")?.dataset.page;
  const textOffset = getTextOffset(pageBody, range.startContainer, range.startOffset);
  const globalTextOffset = bodies.reduce((total, body) => {
    if (body === pageBody) return total;
    if (bodies.indexOf(body) > bodies.indexOf(pageBody)) return total;
    return total + body.innerText.length;
  }, 0) + textOffset;

  return { textOffset, globalTextOffset, pageIndex };
}

function restoreCursorPosition(saved) {
  if (!saved) return;
  const bodies = Array.from(pagedEditor.querySelectorAll(".page-body"));
  if (Number.isFinite(saved.globalTextOffset)) {
    let offset = saved.globalTextOffset;
    for (const body of bodies) {
      const len = body.innerText.length;
      if (offset <= len) {
        setCursorAtTextOffset(body, offset);
        return;
      }
      offset -= len;
    }
    if (bodies.length) {
      setCursorAtTextOffset(bodies[bodies.length - 1], bodies[bodies.length - 1].innerText.length);
      return;
    }
  }

  const pages = pagedEditor.querySelectorAll(".manuscript-page");
  let targetPage = null;
  pages.forEach(p => { if (p.dataset.page === saved.pageIndex) targetPage = p; });
  if (!targetPage) targetPage = pages[pages.length - 1];
  if (!targetPage) return;

  const body = targetPage.querySelector(".page-body");
  if (!body) return;
  setCursorAtTextOffset(body, saved.textOffset || 0);
}

// ── RE-PAGINAÇÃO AUTOMÁTICA (debounce 1200ms) ─────────────────────────────
let _paginationTimer = null;
const PAGINATION_CARET_ATTR = "data-pagination-caret";

function isPagedEditorOverflowing() {
  return Array.from(pagedEditor?.querySelectorAll(".page-body") || [])
    .some(body => body.scrollHeight > body.clientHeight + 2);
}

function insertPaginationCaretMarker() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!getPageBodyFromNode(range.startContainer)) return null;

  const marker = document.createElement("span");
  const markerId = `caret-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  marker.setAttribute(PAGINATION_CARET_ATTR, markerId);
  marker.setAttribute("aria-hidden", "true");
  marker.style.cssText = "display:inline-block;width:0;overflow:hidden;";

  range.collapse(false);
  range.insertNode(marker);
  range.setStartAfter(marker);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);

  return markerId;
}

function restorePaginationCaretMarker(markerId) {
  if (!markerId) return false;
  const marker = pagedEditor.querySelector(`[${PAGINATION_CARET_ATTR}="${markerId}"]`);
  if (!marker) return false;

  const range = document.createRange();
  range.setStartAfter(marker);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const page = marker.closest(".manuscript-page");
  marker.remove();
  page?.scrollIntoView({ block: "nearest" });
  return true;
}

function removePaginationCaretMarkers(root) {
  root?.querySelectorAll?.(`[${PAGINATION_CARET_ATTR}]`).forEach(marker => marker.remove());
}

function runPaginationNow() {
  if (_currentEditorView !== "pages") return;
  clearTimeout(_paginationTimer);
  const markerId = insertPaginationCaretMarker();
  const sourceHtml = markerId ? VeredaPagination.joinPages(pagedEditor) : writingArea.innerHTML;
  if (markerId) writingArea.innerHTML = sourceHtml;
  const cursor = markerId ? null : saveCursorPosition();
  const ms = getActiveManuscript();
  const preset = ms?.pagePreset || "draft";
  const _pc = VeredaPagination.render(pagedEditor, sourceHtml, preset, "auto", getPageRenderOpts()); updatePageCount(_pc);
  if (!restorePaginationCaretMarker(markerId)) restoreCursorPosition(cursor);
  removePaginationCaretMarkers(pagedEditor);
  removePaginationCaretMarkers(writingArea);
  if (markerId) writingArea.innerHTML = VeredaPagination.joinPages(pagedEditor);
}

function schedulePagination(options = {}) {
  if (_currentEditorView !== "pages") return;
  clearTimeout(_paginationTimer);
  if (options.immediate) {
    runPaginationNow();
    return;
  }
  _paginationTimer = setTimeout(runPaginationNow, 1200);
}

// ── FORMAT BAR: select de tipo de bloco ──────────────────────────────────
if (fmtBlockSel) {
  fmtBlockSel.addEventListener("change", () => {
    // Fix 5: em modo Páginas foca o page-body ativo, não o writingArea oculto
    focusEditorTarget();
    document.execCommand("formatBlock", false, fmtBlockSel.value);
    updateCurrentManuscript();
  });
}

// ── PRESET EDITORIAL ─────────────────────────────────────────────────────
if (pagePresetSel) {
  pagePresetSel.addEventListener("change", () => {
    const preset = pagePresetSel.value;
    // Fix 4: persiste no manuscrito via updateActiveManuscript (dispara save)
    const ms = getActiveManuscript();
    if (ms) updateActiveManuscript({ ...ms, pagePreset: preset });
    // Re-renderiza as páginas com o novo preset (inclui .is-a5 e data-break)
    if (pagedEditor?.classList.contains("is-active")) {
      const pc = VeredaPagination.render(
        pagedEditor, writingArea.innerHTML, preset, "auto", getPageRenderOpts()
      );
      updatePageCount(pc);
    }
  });
}

// ── CONTROLES DE PÁGINA: número inicial e cabeçalho ─────────────────────
const pageStartNumberInput  = document.querySelector("[data-page-start-number]");
const pageHeaderTextInput   = document.querySelector("[data-page-header-text]");

function _rerenderPagesIfActive() {
  if (!pagedEditor?.classList.contains("is-active")) return;
  const ms = getActiveManuscript();
  const preset = ms?.pagePreset || pagePresetSel?.value || "draft";
  const pc = VeredaPagination.render(pagedEditor, writingArea.innerHTML, preset, "auto", getPageRenderOpts());
  updatePageCount(pc);
}

if (pageStartNumberInput) {
  pageStartNumberInput.addEventListener("change", () => {
    const ms = getActiveManuscript();
    const val = Math.max(1, parseInt(pageStartNumberInput.value, 10) || 1);
    pageStartNumberInput.value = val;
    if (ms) updateActiveManuscript({ ...ms, pageStartNumber: val });
    _rerenderPagesIfActive();
  });
}

if (pageHeaderTextInput) {
  pageHeaderTextInput.addEventListener("input", () => {
    const ms = getActiveManuscript();
    if (ms) updateActiveManuscript({ ...ms, pageHeaderText: pageHeaderTextInput.value.trim() });
    clearTimeout(pageHeaderTextInput._t);
    pageHeaderTextInput._t = setTimeout(_rerenderPagesIfActive, 600);
  });
}

// ── FORMAT BAR: atualizar estado ao mudar seleção ────────────────────────
document.addEventListener("selectionchange", () => {
  if (document.activeElement === writingArea || writingArea.contains(document.activeElement)) {
    updateFormatBarState();
  }
});

// ── TOAST DE SAVE AUTOMÁTICO (primeira digitação) ──
const SAVE_HINT_KEY = "vrda-save-hint-seen";
const saveHintToast = document.getElementById("save-hint-toast");
const saveHintDismiss = document.getElementById("save-hint-dismiss");

function showSaveHint() {
  if (!saveHintToast || saveHintShown || localStorage.getItem(SAVE_HINT_KEY)) return;
  saveHintShown = true;
  localStorage.setItem(SAVE_HINT_KEY, "1");
  saveHintToast.style.opacity = "1";
  saveHintToast.style.transform = "translateX(-50%) translateY(0)";
  saveHintToast.style.pointerEvents = "auto";
  setTimeout(hideSaveHint, 7000);
}

function hideSaveHint() {
  if (!saveHintToast) return;
  saveHintToast.style.opacity = "0";
  saveHintToast.style.transform = "translateX(-50%) translateY(8px)";
  saveHintToast.style.pointerEvents = "none";
}

writingArea.addEventListener("input", showSaveHint, { once: true });
if (saveHintDismiss) saveHintDismiss.addEventListener("click", hideSaveHint);

// ── LEVAR A MESA ─────────────────────────────────────
const LEVAR_MESA_KEY    = "vrda-levar-mesa-seen";
const levarMesaToast    = document.getElementById("levar-mesa-toast");
const levarMesaDismiss  = document.getElementById("levar-mesa-dismiss");
const levarMesaAnchor   = document.getElementById("levar-mesa-anchor");

function revelarAnchorLevarMesa() {
  if (levarMesaAnchor) levarMesaAnchor.style.display = "flex";
}

function esconderLevarMesaToast() {
  if (!levarMesaToast) return;
  levarMesaToast.style.opacity = "0";
  levarMesaToast.style.transform = "translateX(-50%) translateY(8px)";
  levarMesaToast.style.pointerEvents = "none";
  revelarAnchorLevarMesa();
}

function mostrarLevarMesaToast() {
  if (!levarMesaToast || localStorage.getItem(LEVAR_MESA_KEY)) {
    revelarAnchorLevarMesa();
    return;
  }
  localStorage.setItem(LEVAR_MESA_KEY, "1");
  levarMesaToast.style.opacity = "1";
  levarMesaToast.style.transform = "translateX(-50%) translateY(0)";
  levarMesaToast.style.pointerEvents = "auto";
  setTimeout(esconderLevarMesaToast, 12000);
}

if (levarMesaDismiss) levarMesaDismiss.addEventListener("click", esconderLevarMesaToast);

if (localStorage.getItem(LEVAR_MESA_KEY)) {
  revelarAnchorLevarMesa();
} else {
  setTimeout(mostrarLevarMesaToast, 3 * 60 * 1000);
}

// ── TRAZER DO CELULAR ─────────────────────────────────
const trazerModal      = document.getElementById("trazer-modal");
const trazerFechar     = document.getElementById("trazer-fechar");
const trazerVideo      = document.getElementById("trazer-video");
const trazerBarra      = document.getElementById("trazer-barra");
const trazerStatus     = document.getElementById("trazer-status");
const trazerGrade      = document.getElementById("trazer-grade");
const trazerSucesso    = document.getElementById("trazer-sucesso");
const trazerRecarregar = document.getElementById("trazer-recarregar");

const TRAZER_QR_VERSION = "v1";
let trazerStream    = null;
let trazerAtivo     = false;
let trazerDetector  = null;
let trazerCanvas    = null;
let trazerCtx       = null;
let trazerOcupado   = false;
let trazerSession   = null;
let trazerBlocos    = [];

const TRAZER_CRC_TABLE = (() => {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t.push(c >>> 0);
  }
  return t;
})();

function trazerCrc32(str) {
  let c = 0 ^ -1;
  for (let i = 0; i < str.length; i++) c = (c >>> 8) ^ TRAZER_CRC_TABLE[(c ^ str.charCodeAt(i)) & 0xff];
  return ((c ^ -1) >>> 0).toString(16).padStart(8, "0");
}

function trazerParseFrame(raw) {
  const p = raw.split("|");
  if (p.length < 6) return null;
  const [version, id, idxRaw, totalRaw, checksum, data] = p;
  if (version !== TRAZER_QR_VERSION) return null;
  const index = parseInt(idxRaw, 10);
  const total = parseInt(totalRaw, 10);
  if (!isFinite(index) || !isFinite(total) || !id || !data) return null;
  if (trazerCrc32(data) !== checksum) return null;
  return { id, index, total, data };
}

function trazerMontarGrade(total) {
  trazerGrade.innerHTML = "";
  trazerBlocos = [];
  const cols = Math.ceil(Math.sqrt(total));
  trazerGrade.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  for (let i = 0; i < total; i++) {
    const b = document.createElement("div");
    b.style.cssText = "background:rgba(45,42,38,.08);border-radius:3px;padding-bottom:100%;transition:background .25s;";
    trazerGrade.appendChild(b);
    trazerBlocos.push(b);
  }
}

function trazerImportar(payload) {
  if (payload && payload.app === "escrevaral" && payload.keys) {
    Object.entries(payload.keys).forEach(([k, v]) => localStorage.setItem(k, v));
    return;
  }
  localStorage.setItem("escrevaral_incoming_v1", JSON.stringify(payload));
}

function trazerFinalizar() {
  trazerAtivo = false;
  if (trazerStream) trazerStream.getTracks().forEach(t => t.stop());
  trazerVideo.srcObject = null;

  const partes = [];
  for (let i = 1; i <= trazerSession.total; i++) partes.push(trazerSession.received.get(i) || "");
  const base64 = partes.join("");

  try {
    const LZ = window.LZString;
    if (!LZ) throw new Error("LZString indisponível");
    const json    = LZ.decompressFromBase64(base64);
    const payload = JSON.parse(json);
    trazerImportar(payload);
    trazerVideo.parentElement.style.display = "none";
    trazerSucesso.style.display = "block";
    trazerStatus.textContent = "mesa recebida com sucesso";
  } catch (_) {
    trazerStatus.textContent = "erro ao ler os dados — tente novamente";
  }
}

function trazerProcessarFrame(frame) {
  if (!frame) return;
  if (!trazerSession || trazerSession.id !== frame.id) {
    trazerSession = { id: frame.id, total: frame.total, received: new Map() };
    trazerMontarGrade(frame.total);
  }
  if (trazerSession.total !== frame.total) return;
  if (trazerSession.received.has(frame.index)) return;

  trazerSession.received.set(frame.index, frame.data);
  if (trazerBlocos[frame.index - 1]) trazerBlocos[frame.index - 1].style.background = "rgba(31,79,255,.55)";

  const count = trazerSession.received.size;
  const pct   = Math.round((count / trazerSession.total) * 100);
  trazerBarra.style.width = `${pct}%`;
  trazerStatus.textContent = `recebendo… ${count} / ${trazerSession.total}`;

  if (count === trazerSession.total) trazerFinalizar();
}

async function trazerLoopScan() {
  if (!trazerAtivo || trazerOcupado) return;
  if (!trazerVideo || trazerVideo.readyState < 2) { requestAnimationFrame(trazerLoopScan); return; }

  trazerOcupado = true;
  try {
    if (trazerDetector) {
      const codes = await trazerDetector.detect(trazerVideo);
      if (codes && codes.length) trazerProcessarFrame(trazerParseFrame(codes[0].rawValue || ""));
    } else if (trazerCtx && trazerCanvas && window.jsQR) {
      trazerCanvas.width  = trazerVideo.videoWidth  || 640;
      trazerCanvas.height = trazerVideo.videoHeight || 480;
      trazerCtx.drawImage(trazerVideo, 0, 0, trazerCanvas.width, trazerCanvas.height);
      const img = trazerCtx.getImageData(0, 0, trazerCanvas.width, trazerCanvas.height);
      const r   = window.jsQR(img.data, trazerCanvas.width, trazerCanvas.height, { inversionAttempts: "dontInvert" });
      if (r && r.data) trazerProcessarFrame(trazerParseFrame(r.data));
    }
  } catch (_) {}

  trazerOcupado = false;
  requestAnimationFrame(trazerLoopScan);
}

async function abrirTrazerModal() {
  if (!trazerModal) return;
  trazerModal.style.display = "flex";
  trazerSucesso.style.display = "none";
  trazerVideo.parentElement.style.display = "";
  trazerGrade.innerHTML = "";
  trazerBarra.style.width = "0%";
  trazerStatus.textContent = "abrindo câmera…";
  trazerSession = null;
  trazerBlocos  = [];
  trazerAtivo   = false;

  // carrega libs dinamicamente se necessário
  function loadScript(src) {
    return new Promise(res => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    });
  }
  if (!window.LZString) await loadScript("/pegar/lz-string.min.js");
  if (!window.jsQR && !("BarcodeDetector" in window)) await loadScript("/pegar/jsqr.min.js");

  try {
    trazerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false,
    });
    trazerVideo.srcObject = trazerStream;
    await trazerVideo.play();

    if ("BarcodeDetector" in window) {
      trazerDetector = new BarcodeDetector({ formats: ["qr_code"] });
    } else if (window.jsQR) {
      trazerCanvas = document.createElement("canvas");
      trazerCtx    = trazerCanvas.getContext("2d", { willReadFrequently: true });
    } else {
      trazerStatus.textContent = "leitor de QR não disponível neste navegador";
      return;
    }

    trazerAtivo = true;
    trazerStatus.textContent = "aponte o celular para a webcam…";
    trazerLoopScan();
    revelarAnchorLevarMesa();
  } catch (_) {
    trazerStatus.textContent = "câmera bloqueada — verifique as permissões do navegador";
  }
}

function fecharTrazerModal() {
  trazerAtivo = false;
  if (trazerStream) { trazerStream.getTracks().forEach(t => t.stop()); trazerStream = null; }
  trazerVideo.srcObject = null;
  if (trazerModal) trazerModal.style.display = "none";
}

if (levarMesaAnchor) levarMesaAnchor.addEventListener("click", abrirTrazerModal);
if (trazerFechar)    trazerFechar.addEventListener("click", fecharTrazerModal);
if (trazerRecarregar) trazerRecarregar.addEventListener("click", () => location.reload());

trazerModal && trazerModal.addEventListener("click", e => {
  if (e.target === trazerModal) fecharTrazerModal();
});

// ── META DE PALAVRAS ─────────────────────────────────

function shootConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:none;";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const COLORS = ["#150a03","#accec1","#c0845a","#ffdbd0","#7c5cbf","#3a8fd1","#f59e0b","#e05c7a","#44c67a"];
  const SHAPES = ["rect","circle","strip"];
  const TOTAL  = 220;
  const DURATION = 160; // frames até sumir

  // Origens: explosão central + dois canhões nas bordas inferiores
  const origins = [
    { x: canvas.width * 0.5,  y: canvas.height * 0.55, spread: Math.PI * 2, speed: [6, 22] },
    { x: canvas.width * 0.15, y: canvas.height,         spread: Math.PI,     speed: [10, 26] },
    { x: canvas.width * 0.85, y: canvas.height,         spread: Math.PI,     speed: [10, 26] },
  ];

  const particles = Array.from({ length: TOTAL }, (_, i) => {
    const o = origins[i % origins.length];
    const angleBase = o.spread === Math.PI * 2 ? 0 : -Math.PI;
    const angle  = angleBase + Math.random() * o.spread;
    const speed  = o.speed[0] + Math.random() * (o.speed[1] - o.speed[0]);
    const size   = Math.random() * 8 + 4;
    return {
      x:     o.x + (Math.random() - 0.5) * 20,
      y:     o.y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed * -1, // -1 → vai pra cima
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.25,
      w:     size,
      h:     size * (0.4 + Math.random() * 0.6),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      life:  DURATION,
    };
  });

  const GRAVITY = 0.55;
  const DRAG    = 0.988;
  let frame = 0;

  const tick = () => {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = 0;
    particles.forEach(p => {
      if (p.life <= 0) return;
      p.life--;
      p.vy += GRAVITY;
      p.vx *= DRAG;
      p.vy *= DRAG;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotV;

      const alpha = Math.min(1, p.life / (DURATION * 0.25));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "strip") {
        ctx.fillRect(-p.w / 2, -p.h / 4, p.w, p.h / 2);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      if (p.y < canvas.height + 40) alive++;
    });

    if (alive > 0 && frame < DURATION + 80) requestAnimationFrame(tick);
    else canvas.remove();
  };

  requestAnimationFrame(tick);
}

function initAudioPlayer() {
  const panel  = document.getElementById("audio-player-panel");
  const tracks = document.getElementById("audio-tracks");
  const volEl  = document.getElementById("audio-volume");
  if (!tracks) return;

  tracks.innerHTML = AUDIO_TRACKS.map(t => `
    <button class="audio-track" data-track="${t.id}">
      <span class="material-symbols-outlined">${t.icon}</span>
      <span>${t.name}</span>
      <span class="audio-track-playing material-symbols-outlined" hidden>equalizer</span>
    </button>`).join("");

  tracks.querySelectorAll(".audio-track").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.track;
      const t  = AUDIO_TRACKS.find(x => x.id === id);
      if (activeTrackId === id) {
        audioEl.pause(); activeTrackId = null;
      } else {
        audioEl.src = t.url; audioEl.play().catch(()=>{});
        activeTrackId = id;
      }
      tracks.querySelectorAll(".audio-track").forEach(b => {
        const isActive = b.dataset.track === activeTrackId;
        b.classList.toggle("is-active", isActive);
        b.querySelector(".audio-track-playing").hidden = !isActive;
      });
    });
  });

  if (volEl) volEl.addEventListener("input", () => { audioEl.volume = parseFloat(volEl.value); });
}

// ── PAINEL DE COMPARTILHAR ────────────────────────────────────────────────────
const _SHARE_TEXTS = {
  x: "Estou escrevendo no @escrevaral — oficina literária brasileira, gratuita e offline. Escreva, prove sua autoria e publique. escrevaral.com",
  bluesky: "Estou escrevendo no Escrevaral — oficina literária para mentes brasileiras. Gratuito, offline, sem IA. ✍️\n\nescrevaral.com",
  mastodon: "Estou escrevendo no Escrevaral — oficina literária brasileira, gratuita e offline. Escreva, prove sua autoria, publique. Sem IA, sem nuvem.\n\nhttps://escrevaral.com",
};

function toggleSharePanel() {
  const panel = document.getElementById("share-panel");
  if (!panel) return;
  const isOpen = !panel.hidden;
  if (isOpen) { panel.hidden = true; return; }

  panel.hidden = false;

  function _outside(e) {
    if (!panel.contains(e.target) && !e.target.closest(".topbar-share-btn")) {
      panel.hidden = true;
      document.removeEventListener("mousedown", _outside, true);
    }
  }
  setTimeout(() => document.addEventListener("mousedown", _outside, true), 50);
}

document.getElementById("share-panel")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-share]");
  if (!btn) return;
  const platform = btn.dataset.share;
  const small = btn.querySelector("small");

  if (platform === "x") {
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(_SHARE_TEXTS.x);
    window.open(url, "_blank", "noopener,width=580,height=400");
  } else if (platform === "bluesky") {
    const url = "https://bsky.app/intent/compose?text=" + encodeURIComponent(_SHARE_TEXTS.bluesky);
    window.open(url, "_blank", "noopener,width=600,height=500");
  } else if (platform === "mastodon") {
    navigator.clipboard.writeText(_SHARE_TEXTS.mastodon).then(() => {
      if (small) { small.textContent = "Copiado! Cole na sua instância"; btn.classList.add("share-copied"); }
      setTimeout(() => { if (small) { small.textContent = "Copiar texto para colar"; btn.classList.remove("share-copied"); }}, 3000);
    });
  } else if (platform === "copy") {
    navigator.clipboard.writeText("https://escrevaral.com").then(() => {
      if (small) { small.textContent = "Link copiado!"; btn.classList.add("share-copied"); }
      setTimeout(() => { if (small) { small.textContent = "escrevaral.com"; btn.classList.remove("share-copied"); }}, 3000);
    });
  }
});

function toggleAudioPanel() {
  const panel = document.getElementById("audio-player-panel");
  if (!panel) return;
  const isOpen = !panel.hidden;
  if (isOpen) {
    panel.hidden = true;
    document.querySelector('.topbar [data-action="toggle-audio-player"]')?.setAttribute("aria-pressed", "false");
    return;
  }
  // Posiciona sob o botão que disparou
  const btn = document.querySelector('.topbar-audio-btn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const panelW = 240;
    let left = rect.left;
    if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
    if (left < 8) left = 8;
    panel.style.left = left + "px";
    panel.style.top  = (rect.bottom + 4) + "px";
  }
  panel.hidden = false;
  document.querySelector('.topbar [data-action="toggle-audio-player"]')?.setAttribute("aria-pressed", "true");

  // Fecha ao clicar fora
  function _outsideClick(e) {
    if (!panel.contains(e.target) && !e.target.closest('.topbar-audio-btn')) {
      panel.hidden = true;
      document.querySelector('.topbar [data-action="toggle-audio-player"]')?.setAttribute("aria-pressed", "false");
      document.removeEventListener("mousedown", _outsideClick, true);
    }
  }
  setTimeout(() => document.addEventListener("mousedown", _outsideClick, true), 50);
}

function _toggleTypewriterSound() {
  if (!window.VeredaTypewriter) return;
  VeredaTypewriter.toggle().then(() => {
    const btn = document.getElementById("typewriter-toggle");
    if (btn) btn.setAttribute("aria-pressed", String(VeredaTypewriter.isEnabled()));
  });
}

function _handleTypewriterKeydown(e) {
  if (!window.VeredaTypewriter?.isEnabled()) return;
  if (e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
  if (e.key === "Backspace" || e.key === "Delete") VeredaTypewriter.playKey("back");
  else if (e.key === "Enter") VeredaTypewriter.playKey("enter");
  else if (e.key.length === 1) VeredaTypewriter.playKey("type");
}

// Toca apenas nos editores de manuscrito: fluxo e modo Página.
writingArea?.addEventListener("keydown", _handleTypewriterKeydown, { passive: true });
pagedEditor?.addEventListener("keydown", (e) => {
  if (!e.target?.closest(".page-body")) return;
  _handleTypewriterKeydown(e);
}, { passive: true });

// ── FICHA DE PERSONAGEM ───────────────────────────────
const PERSONAGEM_FIELDS = [
  { section:"Identidade",        fields:[
    {key:"name",       label:"Nome completo",        ph:"Como assina o próprio nome",           wide:true},
    {key:"nickname",   label:"Apelido / Como é chamado", ph:"O que os outros dizem pelas costas"},
    {key:"age",        label:"Idade",                ph:"34",                                   narrow:true},
    {key:"origin",     label:"Origem",               ph:"Cidade, bairro, contexto social"},
  ]},
  { section:"Aparência & Presença", fields:[
    {key:"physical",   label:"Traços físicos marcantes", ph:"O que você nota nos primeiros 5 segundos", area:true},
    {key:"voice",      label:"Voz & Fala",            ph:"Ritmo, pausas, vocabulário, sotaque"},
    {key:"movement",   label:"Corpo & Movimento",     ph:"Como ocupa o espaço, postura, gestos"},
  ]},
  { section:"Psicologia",        fields:[
    {key:"desire",     label:"Desejo central",        ph:"O que quer mais que qualquer coisa no mundo"},
    {key:"fear",       label:"Maior medo",            ph:"O que o paralisa — o que jamais admite"},
    {key:"contradiction", label:"Contradição",        ph:"O que o torna humano e imperfeito"},
    {key:"secret",     label:"Segredo",               ph:"O que só o leitor sabe",               area:true},
  ]},
  { section:"História & Formação", fields:[
    {key:"backstory",  label:"Backstory em 3 linhas", ph:"Tudo que importou antes da história começar", area:true},
    {key:"trauma",     label:"Trauma ou momento definidor", ph:"A cena que ele não conta para ninguém"},
  ]},
  { section:"Arco & Relações",   fields:[
    {key:"arc_start",  label:"Como começa",           ph:"Estado emocional e crença no início"},
    {key:"arc_end",    label:"Como termina",          ph:"Transformação, queda ou ilusão mantida"},
    {key:"relations",  label:"Relações principais",   ph:"Com protagonista, antagonista, aliados", area:true},
  ]},
];

// ── FICHAS — schemas por tipo ──────────────────────────────────────────────
// Cada campo: { key, label, ph (placeholder), area (boolean = textarea) }
const FICHA_SCHEMAS = {
  "Personagem": [
    { key:"nome",        label:"Nome",              ph:"Nome completo · apelido · como os outros chamam" },
    { key:"aparencia",   label:"Aparência",          ph:"O detalhe que fica na memória do leitor" },
    { key:"desejo",      label:"Desejo",             ph:"O que quer conscientemente · o objetivo declarado" },
    { key:"necessidade", label:"Necessidade",        ph:"O que precisa mas ainda não sabe", area:true },
    { key:"contradicao", label:"Contradição",        ph:"O que a torna humana · o defeito que é também uma força" },
    { key:"voz",         label:"Voz",                ph:"Palavras que usa · que evita · como interrompe · como mente" },
    { key:"arco",        label:"Arco",               ph:"Onde começa → onde termina → o que muda", area:true },
    { key:"relacoes",    label:"Relações",            ph:"— com [personagem]:\n— com [personagem]:", area:true },
    { key:"detalhes",    label:"Detalhes",            ph:"Cor dos olhos, cheiro, maneirismo, objeto que carrega" },
  ],
  "Mundo": [
    { key:"regras",      label:"Regras fundamentais", ph:"O que é diferente deste mundo em relação ao nosso", area:true },
    { key:"sistema",     label:"Magia / Sistema",     ph:"Como funciona · quais os limites · qual o custo", area:true },
    { key:"historia",    label:"História",            ph:"O trauma coletivo · o que aconteceu antes da história", area:true },
    { key:"tensao",      label:"Tensão estrutural",   ph:"O conflito que existe antes da protagonista aparecer" },
    { key:"lugares",     label:"Lugares importantes", ph:"—\n—", area:true },
    { key:"vocabulario", label:"Vocabulário próprio", ph:"— [termo]:", area:true },
  ],
  "Lugar": [
    { key:"nome",        label:"Nome",               ph:"Nome do lugar" },
    { key:"localizacao", label:"Localização",        ph:"Onde fica no mundo · como se chega" },
    { key:"atmosfera",   label:"Atmosfera",          ph:"O que se sente ao entrar · temperatura emocional", area:true },
    { key:"sensoriais",  label:"Detalhes sensoriais",ph:"visão:\nsom:\ncheiro:\ntoque:", area:true },
    { key:"historia",    label:"História do lugar",  ph:"O que aconteceu aqui antes", area:true },
    { key:"significado", label:"Significado",        ph:"Por que este lugar importa para a protagonista" },
  ],
  "Cronologia": [
    { key:"antes",       label:"Antes da história",  ph:"— [período]:\n— [evento que mudou tudo]:", area:true },
    { key:"historia",    label:"A história",         ph:"— cena 1:\n— ponto de virada:\n— clímax:\n— resolução:", area:true },
    { key:"paralelos",   label:"Paralelos e flashbacks", ph:"— [memória de X]: aparece em:", area:true },
    { key:"datas",       label:"Datas importantes",  ph:"início · duração total ·" },
  ],
  "Objeto": [
    { key:"nome",        label:"Nome",               ph:"Nome do objeto" },
    { key:"descricao",   label:"Descrição física",   ph:"O detalhe que fica na memória do leitor" },
    { key:"historia",    label:"História do objeto",  ph:"De onde veio · quem teve antes", area:true },
    { key:"simbolico",   label:"Significado simbólico", ph:"O que representa além do que é" },
    { key:"posse",       label:"Quem tem / quer / teme", ph:"—" },
    { key:"aparicoes",   label:"Como aparece",        ph:"— primeira vez:\n— ponto de virada:\n— cena final:", area:true },
  ],
  "Tema": [
    { key:"intencao",    label:"Intenção",            ph:"O que este texto quer dizer — em uma frase" },
    { key:"tensao",      label:"Tensão temática",     ph:"As duas forças opostas que o texto explora" },
    { key:"imagem",      label:"Imagem central",      ph:"A cena, o objeto ou o momento que cristaliza o tema" },
    { key:"pergunta",    label:"Pergunta do texto",   ph:"Não precisa responder — precisa fazer a pergunta certa" },
    { key:"contra",      label:"Contra-argumento",    ph:"O que o texto reconhece como verdade no lado oposto", area:true },
  ],
  "Glossário": [
    { key:"termos",      label:"Termos do projeto",   ph:"— [termo]: definição · contexto · primeira aparição\n\n— [termo]: definição · contexto · primeira aparição", area:true },
  ],
  "Instituição": [
    { key:"nome",        label:"Nome",               ph:"Nome da instituição" },
    { key:"funcao",      label:"Função",             ph:"O que faz · para quem existe" },
    { key:"poder",       label:"Poder",              ph:"De onde vem · como se mantém · o que teme perder", area:true },
    { key:"estrutura",   label:"Estrutura interna",  ph:"Hierarquia · regras · ritos", area:true },
    { key:"papel",       label:"Papel na história",  ph:"Como afeta a protagonista · o que quer dela" },
  ],
  "Projeto": [
    { key:"sinopse",     label:"Sinopse",            ph:"2-3 frases que explicam o livro para um editor", area:true },
    { key:"publico",     label:"Público",            ph:"Quem lê · que outros livros essa pessoa também lê" },
    { key:"promessa",    label:"Promessa de leitura", ph:"O que o leitor vai sentir · o que vai levar" },
    { key:"estagio",     label:"Estágio atual",      ph:"Rascunho · revisão · finalização" },
    { key:"prazo",       label:"Prazo",              ph:"Data de entrega real ou desejada" },
    { key:"notas",       label:"Notas de desenvolvimento", ph:"", area:true },
  ],
};

const FICHA_KINDS = new Set(Object.keys(FICHA_SCHEMAS));
window.FICHA_KINDS = FICHA_KINDS; // expõe para editor-controller.js e outros módulos

function parseFichaData(text, kind) {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}
  // Migrar de formato texto plano (CAPS = rótulo, linhas abaixo = valor)
  const schema = FICHA_SCHEMAS[kind] || [];
  const data = {};
  const lines = text.split(/\n/);
  let currentKey = null;
  let buf = [];
  for (const raw of lines) {
    const line = raw.trim();
    const isHeading = line && line === line.toUpperCase() && /[A-ZÁÉÍÓÚ]/.test(line) && line.length <= 60;
    if (isHeading) {
      if (currentKey && buf.length) {
        data[currentKey] = buf.filter(l => !(l.startsWith("(") && l.endsWith(")"))).join("\n").trim();
      }
      const match = schema.find(f => f.label.toUpperCase().replace(/[^A-ZÁÉÍÓÚ\s]/g,"") === line.replace(/[^A-ZÁÉÍÓÚ\s]/g,"") || line.includes(f.key.toUpperCase()));
      currentKey = match?.key || null;
      buf = [];
    } else if (currentKey) {
      buf.push(line);
    }
  }
  if (currentKey && buf.length) {
    data[currentKey] = buf.filter(l => !(l.startsWith("(") && l.endsWith(")"))).join("\n").trim();
  }
  return data;
}

function serializeFicha() {
  const data = {};
  if (!specializedEditor) return "{}";
  specializedEditor.querySelectorAll("[data-ficha-key]").forEach(el => {
    data[el.dataset.fichaKey] = "value" in el ? el.value : el.innerText;
  });
  return JSON.stringify(data);
}

function parsePersonagemData(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return {};
}

function serializePersonagem() {
  const data = {};
  if (!specializedEditor) return "{}";
  specializedEditor.querySelectorAll("[data-persona-field]").forEach(el => {
    data[el.dataset.personaField] = el.value || "";
  });
  return JSON.stringify(data);
}

function openEditorialPage(url, title) {
  _editorialUrl = url;
  editorialFrame.src = url;
  editorialBarTitle.textContent = title;
  editorialOverlay.hidden = false;
  editorialOverlay.removeAttribute("aria-hidden");
  editorialBack.focus();
}

function closeEditorialPage() {
  editorialOverlay.hidden = true;
  editorialOverlay.setAttribute("aria-hidden", "true");
  editorialFrame.src = "";
  _editorialUrl = "";
}

editorialBack.addEventListener("click", closeEditorialPage);
editorialExternal.addEventListener("click", () => {
  if (_editorialUrl) window.open(_editorialUrl, "_blank", "noopener,noreferrer");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !editorialOverlay.hidden) closeEditorialPage();
});

// Intercepta cliques nos cards editoriais
document.querySelectorAll("[data-editorial-page]").forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const url   = card.getAttribute("href");
    const title = card.querySelector("strong")?.textContent || "Leitura editorial";
    openEditorialPage(url, title);
  });
});
// ── BOOTSTRAP ────────────────────────────────────────────────────────────────
// Guard: valida que todos os controllers foram registrados antes de inicializar
function _verifyControllers() {
  // Críticos: falha no boot se ausentes
  const critical = ["VeredaEditorController","VeredaProofController","VeredaAcademiaController"];
  // Opcionais: warn apenas
  const optional = ["VeredaBackupController"];

  const missingCritical = critical.filter(n => !window[n]?.init);
  const missingOptional = optional.filter(n => !window[n]?.init);

  if (missingCritical.length) {
    console.error("[Vereda] Controllers críticos ausentes:", missingCritical);
    document.body.innerHTML = `
      <div style="font:15px/1.6 sans-serif;padding:2rem;max-width:480px;margin:4rem auto;color:#333;border:1px solid #ddd;border-radius:8px">
        <strong style="color:#c00">Escrevaral não carregou corretamente.</strong>
        <p>Tente <a href="." style="color:#150a03">recarregar a página</a>. Se o problema persistir, limpe o cache do navegador (Ctrl+Shift+R).</p>
        <p style="font-size:12px;color:#999">Módulos ausentes: ${missingCritical.join(", ")}</p>
      </div>`;
    throw new Error(`Boot abortado — controllers ausentes: ${missingCritical.join(", ")}`);
  }
  if (missingOptional.length) {
    console.warn("[Vereda] Controllers opcionais ausentes:", missingOptional);
  }
}

function renderSidebarQuote() {
  const el = document.querySelector("[data-sidebar-quote]");
  const textEl   = document.querySelector("[data-sq-text]");
  const authorEl = document.querySelector("[data-sq-author]");
  if (!el || !textEl || !authorEl) return;
  const quotes = window.EscrevaralQuotes;
  if (!quotes?.length) return;
  // Frase diferente da exibida no editor (offset +1)
  const idx = (Math.floor(Date.now() / 86400000) + 1) % quotes.length;
  const q = quotes[idx];
  textEl.textContent   = `"${q.q}"`;
  authorEl.textContent = `— ${q.a}`;
}

function _bootstrap() {
  _verifyControllers();
  hideDecorativeMaterialIcons();
  materialIconObserver.observe(document.body, { childList: true, subtree: true });
  applyProgressLevel();
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  renderProofView();
  renderVersionList();
  renderBackupWarning();
  _checkReloadBackupNudge();
  renderTemplateStudio();
  loadRimaLabText();
  renderRimaLab();
  renderRimaLabEncyclopedia();
  renderDecolonialTool();
  renderRightsLab();
  updateAcademyParallax();
  applyTemplateLayout();
  if (window.innerWidth <= 820) state.layout.leftCollapsed = true;
  applyPanelLayout();
  applyColorTheme();
  applyFocusSettings();
  initAudioPlayer();
  updatePomodoroDisplay();
  setView(getViewFromRoute(), { updateRoute: true, routeMode: "replace" });
  registerOfflineApp();
  initializeFilesystemBackup();
  checkTerms();
  setTimeout(renderSidebarQuote, 500);
  checkFirstVisit();

  // Retroativo: se há notas sem folha-em-branco, conceder silenciosamente na primeira nota raiz
  if (state.manuscripts.length > 0 && typeof VeredaBadges !== "undefined") {
    const anyHasBadge = state.manuscripts.some(m => VeredaBadges.hasBadge(m, "folha-em-branco"));
    if (!anyHasBadge) {
      const firstRoot = state.manuscripts.find(m => !m.parentId);
      if (firstRoot) {
        void VeredaBadges.earnBadge(firstRoot, "folha-em-branco", "retroactive").then(updated => {
          const idx = state.manuscripts.findIndex(m => m.id === updated.id);
          if (idx !== -1) {
            state.manuscripts[idx] = updated;
            persistState("Marcas do ofício reconhecidas");
            renderProjectGrid();
          }
        });
      }
    }
  }

  persistState("Pronto");

  // Restaura modo de visualização do editor (página vs. fluxo)
  if (localStorage.getItem("vrda-editor-view") === "pages") setEditorViewMode("pages");

  // Restaura modo escuro (default: off)
  applyDarkMode(localStorage.getItem(DARK_MODE_KEY) === "on");

  // Restaura preferência de fundo de mesa (default: off)
  if (localStorage.getItem("vereda:desk-background") === "on") {
    shell.classList.add("has-desk-background");
    const btn = document.querySelector("[data-action='toggle-desk-background']");
    if (btn) btn.setAttribute("aria-pressed", "true");
  }

  // Restaura estado do som das teclas (default: off)
  const typewriterBtn = document.getElementById("typewriter-toggle");
  if (typewriterBtn && window.VeredaTypewriter?.isEnabled()) {
    typewriterBtn.setAttribute("aria-pressed", "true");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _bootstrap);
} else {
  _bootstrap();
}

// ── FORMAT-BAR SCROLL UX ─────────────────────────────────────────────────────
// Hover → fundo cinza aparece sinalizando área interativa.
// Scroll vertical (ou Shift+scroll) → convertido em scroll horizontal na barra.
// Gradientes nas bordas indicam conteúdo oculto à esquerda/direita.
// Hint: pulsa o fade direito 2× na primeira vez que o usuário entra na área.
(function initFormatBarScroll() {
  if (!formatBar || !formatBarWrap) return;

  // Seta indicadora de scroll horizontal
  const arrow = document.createElement("span");
  arrow.className = "fmt-scroll-arrow material-symbols-outlined";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "chevron_right";
  formatBarWrap.appendChild(arrow);

  let hintShown = false;

  function updateEdges() {
    const sl = formatBar.scrollLeft;
    const max = formatBar.scrollWidth - formatBar.clientWidth;
    formatBarWrap.classList.toggle("has-left",  sl > 2);
    formatBarWrap.classList.toggle("has-right", sl < max - 2);
  }

  // Wheel no WRAPPER inteiro — captura touchpad em qualquer ponto da área
  // Converte scroll vertical em horizontal; deixa horizontal nativo passar
  function _onWheel(e) {
    const hasOverflow = formatBar.scrollWidth > formatBar.clientWidth + 2;
    if (!hasOverflow) return;
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (isHorizontal) return; // deixa swipe horizontal nativo agir
    e.preventDefault();
    e.stopPropagation();
    formatBar.scrollLeft += e.deltaY;
  }

  // Registra no wrapper (captura touchpad mesmo sobre ícones filhos)
  formatBarWrap.addEventListener("wheel", _onWheel, { passive: false });
  formatBar.addEventListener("scroll", updateEdges, { passive: true });

  formatBarWrap.addEventListener("mouseenter", () => {
    formatBarWrap.classList.add("is-scroll-active");
    if (!hintShown && formatBar.scrollWidth > formatBar.clientWidth + 2) {
      hintShown = true;
      formatBarWrap.classList.add("show-hint");
      setTimeout(() => formatBarWrap.classList.remove("show-hint"), 2800);
    }
  });

  formatBarWrap.addEventListener("mouseleave", () => {
    formatBarWrap.classList.remove("is-scroll-active");
  });

  // Inicializa estado + dispara hint automático após 1.5s se há overflow
  requestAnimationFrame(() => {
    updateEdges();
    if (formatBar.scrollWidth > formatBar.clientWidth + 2) {
      setTimeout(() => {
        if (!hintShown) {
          hintShown = true;
          formatBarWrap.classList.add("show-hint");
          setTimeout(() => formatBarWrap.classList.remove("show-hint"), 2800);
        }
      }, 1500);
    }
  });
})();

(function () {
  const link = document.querySelector("[data-contact-email]");
  const note = document.querySelector("[data-offline-note]");
  if (!link || !note) return;
  let _noteTimer;
  link.addEventListener("click", function (e) {
    if (!navigator.onLine) {
      e.preventDefault();
      note.removeAttribute("hidden");
      clearTimeout(_noteTimer);
      _noteTimer = setTimeout(() => note.setAttribute("hidden", ""), 4000);
    }
  });
})();
