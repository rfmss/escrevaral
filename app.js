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
  academia: "Academia",
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
  editorSplit.style.setProperty("--template-panel-width", `${state.template.width}px`);
  editorSplit.classList.toggle("is-template-collapsed", !state.template.open);

  templatePanelToggles.forEach((toggle) => {
    const isHeaderToggle = toggle.closest(".template-reference-header");
    const label = state.template.open ? "Ocultar guia" : "Mostrar guia";
    const hasText = countWords(getActiveManuscript()?.text || writingArea?.innerText || "") > 0;
    const hint = hasText ? label : "Abra o guia para ver a estrutura da forma. A conversa com o guia aparece após as primeiras linhas.";
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
  persistState("Manuscrito aberto");
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
  if (!ms || !window.VeredaPrecision) { saveStatus.textContent = "Nenhum manuscrito ativo."; return; }
  const text = ms.text || (ms.html || "").replace(/<[^>]+>/g, " ");
  if (!text.trim()) { saveStatus.textContent = "Manuscrito vazio."; return; }
  const template = window.VeredaTemplates?.getTemplate(state.template?.selectedId) || {};
  const a = VeredaPrecision.analyze(template, text);
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const lines = [
    "ADERÊNCIA AO GUIA — Escrevaral",
    sep,
    `Manuscrito: ${ms.title || "sem título"}  ·  ${a.words} palavras  ·  ${date}`,
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

function exportAcervoCompleto() {
  const docs = state.manuscripts.filter(m => (m.type || "manuscrito") === "manuscrito" && (m.text || "").trim());
  if (!docs.length) { saveStatus.textContent = "Nenhum manuscrito com texto para exportar."; return; }
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(60);
  const lines = [`ACERVO COMPLETO — Escrevaral`, `Gerado em ${date} · ${docs.length} manuscrito${docs.length !== 1 ? "s" : ""}`, sep, ""];
  docs.forEach((ms, i) => {
    const wc = countWords(ms.text || "");
    lines.push(`${i + 1}. ${ms.title || "sem título"}  ·  ${wc.toLocaleString("pt-BR")} palavras  ·  ${ms.status || "Em escrita"}`);
    lines.push("─".repeat(50));
    lines.push(ms.text.trim());
    lines.push("", sep, "");
  });
  const totalWords = docs.reduce((s, m) => s + countWords(m.text || ""), 0);
  lines.push(`Total: ${totalWords.toLocaleString("pt-BR")} palavras em ${docs.length} manuscrito${docs.length !== 1 ? "s" : ""}.`);
  const dateSlug = new Date().toISOString().slice(0, 10);
  downloadFile(lines.join("\n"), `escrevaral-acervo-${dateSlug}.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = `Acervo exportado — ${docs.length} manuscritos, ${totalWords.toLocaleString("pt-BR")} palavras`;
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

function openCreateNote() {
  createNoteCategory = null;
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
        <small>Comece sem guia, sem formato, só escrevendo.</small>
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
            <div><strong>${escapeHtml(type.label)}</strong></div>
            <span class="material-symbols-outlined create-tpl-arrow">chevron_right</span>
          </button>
        `).join("")}
      `;
    }).join("");
  } else {
    const templates = cat.oficios.flatMap(oficio =>
      (window.VeredaTemplates ? VeredaTemplates.listTemplates({ oficio }) : [])
    );
    rows = templates.map(tpl => `
      <button class="create-tpl-row" data-create-from-template="${tpl.id}" type="button">
        <span class="material-symbols-outlined">${tpl.icon}</span>
        <div>
          <strong>${escapeHtml(tpl.label)}</strong>
          <small>${escapeHtml(tpl.description || "")}</small>
        </div>
        <span class="material-symbols-outlined create-tpl-arrow">chevron_right</span>
      </button>
    `).join("");
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
}

function openAddCompanionNote() {
  createNoteParentId = state.activeId;
  createNoteCategory = "projeto";
  renderCreateNoteStep(2);
  createNoteOverlay.hidden = false;
}

// ── ONBOARDING DE PRIMEIRA ENTRADA ───────────────────
function checkFirstVisit() {
  if (_IS_FIRST_VISIT && welcomeOverlay) {
    setTimeout(() => {
      welcomeOverlay.hidden = false;
      welcomeOverlay.querySelector("button")?.focus();
    }, 350);
  }
}

function closeWelcome() {
  if (welcomeOverlay) {
    welcomeOverlay.hidden = true;
  }
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
  requestAnimationFrame(() => focusEditor());
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
    title: `Manuscrito ${nextDraftNumber()}`,
    text: "",
    type: "manuscrito",
    folder: "Ficção",
  });
  addManuscript(manuscript, "Rascunho livre criado");
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
    title: `${template.label} ${nextDraftNumber()}`,
    type: "manuscrito",
    folder,
  });

  state.template.selectedId = templateId;
  state.template.open = false;  // Guia fecha — botão visível com nome, escritor abre quando quiser
  addManuscript(manuscript, "Guia aplicado");
}

function createProjectNoteText(type) {
  // Nota nasce vazia — placeholder é visual (CSS), não conteúdo persistido
  return "";
}

function createProjectNoteDescription(type) {
  const descriptions = {
    projeto: "Visão geral da obra: sinopse, público, estágio, prazo e promessa de leitura.",
    pesquisa: "Fontes, hipóteses, referências e perguntas abertas do projeto.",
    submissão: "Envios editoriais, chamadas, prazos, formatos exigidos e respostas.",
    revisão: "Notas de processo editorial, problemas recorrentes, decisões e status.",
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
    "cena-roteiro": "Cena de roteiro com slug line, ação e personagens.",
    ato: "Divisão estrutural do roteiro, com função dramática e virada.",
    "personagem-roteiro": "Versão audiovisual de personagem, com função, voz e apresentação.",
    pauta: "Proposta jornalística com gancho, angulação, prazo e fontes.",
    fonte: "Pessoa real ouvida na apuração.",
    entrevista: "Perguntas, respostas brutas e trechos selecionados.",
    fato: "Dado verificável, fonte primária e status de apuração.",
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

  if (!selection || selection.rangeCount === 0 || !writingArea.contains(selection.anchorNode)) {
    return;
  }

  if (selection.isCollapsed && !allowCollapsedSelection) {
    return;
  }

  const selectedText = selection.toString().trim();
  const word = selectedText || findWordNearSelection(selection);
  const cleanWord = cleanSelectedWord(word);

  if (!cleanWord) {
    return;
  }

  state.lexical.selectedWord = cleanWord;

  // Guardar range da seleção para substituição precisa via sinônimos
  if (selection.rangeCount > 0) {
    state.lexical.selectedRange = selection.getRangeAt(0).cloneRange();
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

async function renderLexicalView() {
  const manuscript = getActiveManuscript();
  if (!manuscript) return;

  if (VeredaLexical.hasLoadError()) {
    lexicalCard.innerHTML = `<p class="lexical-disclaimer">Vocabulário não carregado. Verifique a conexão e recarregue a página.</p>`;
    return;
  }

  await VeredaLexical.ensureLoaded();
  const analysis = VeredaLexical.analyze(state.lexical.selectedWord, manuscript.text);

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

  // Buscar sinônimos — lazy load da letra correspondente
  let sinonimosHtml = "";
  try {
    await loadSynonyms(analysis.word);
    const sins = getSynonyms(analysis.word);
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

  lexicalCard.innerHTML = `
    <span class="material-symbols-outlined">dictionary</span>
    <h2>${escapeHtml(analysis.displayWord)}</h2>
    <p class="tag">${escapeHtml(analysis.className)}</p>
    <p>${escapeHtml(analysis.note)}</p>
    <dl>
      <div><dt>Função provável</dt><dd>${escapeHtml(analysis.functionName)}</dd></div>
      <div><dt>Campo</dt><dd>${escapeHtml(analysis.field)}</dd></div>
      <div><dt>Ocorrências</dt><dd>${countLabel}</dd></div>
      ${sinonimosHtml}
      <div><dt>Análise</dt><dd>Regras locais — sem IA, sem envio de dados</dd></div>
    </dl>
    <p class="lexical-disclaimer">Classificação aproximada. Palavras polissêmicas variam por contexto — use como pista de revisão.</p>
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
  "toggle-pomodoro":         () => togglePomodoro(),
  "toggle-rimalab-encyclopedia": () => toggleRimaLabEncyclopedia(),
  "scroll-rights":           () => rightsLab?.scrollIntoView({ behavior: "smooth", block: "start" }),
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
  "add-companion-note":      () => openAddCompanionNote(),
  "welcome-write":           () => handleWelcomeWrite(),
  "welcome-rimalab":         () => handleWelcomeRimalab(),
  "welcome-voice":           () => handleWelcomeVoice(),
  "welcome-autoria":         () => handleWelcomeAutoria(),
  "welcome-blank":           () => handleWelcomeBlank(),
  "switch-view-editor":      () => setView("editor", { updateRoute: true }),
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
    const ms = getActiveManuscript();
    VeredaDocument.downloadRtf(writingArea.innerHTML || ms?.html || "", ms?.pagePreset || "draft", ms?.title || "Manuscrito", ms?.author || "");
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
    if (group) t.setAttribute("aria-expanded", String(group.classList.toggle("is-open")));
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

function toggleAudioPanel() {
  const panel = document.getElementById("audio-player-panel");
  if (!panel) return;
  panel.hidden = !panel.hidden;
  document.querySelector('.topbar [data-action="toggle-audio-player"]')?.setAttribute("aria-pressed", String(!panel.hidden));
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

function _bootstrap() {
  _verifyControllers();
  applyProgressLevel();
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  renderProofView();
  renderVersionList();
  renderBackupWarning();
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
  checkFirstVisit();
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
