(function massNotesApp(global) {
  "use strict";

  const ACTIVE_DOCUMENT_KEY = "mass-notes-experiment-active-document";
  const THEME_KEY = "mass-notes-theme";
  const RECOVERY_KEY = "mass-notes-experiment-recovery-v1";
  const SAVE_DELAY = 450;
  const RECOVERY_DELAY = 700;

  const state = {
    documents: [],
    activeId: null,
    view: "all",
    search: "",
    saveTimer: null,
    recoveryTimer: null,
    saveLanes: new Map(),
    dirtyIds: new Set(),
    activePanel: "structure",
    drawerTrigger: null,
    drawerKind: null,
    engineTokens: new Map(),
    editEpoch: 0,
  };

  const el = {};

  function collectElements() {
    Object.assign(el, {
      body: document.body,
      app: document.getElementById("mn-app"),
      main: document.querySelector(".mn-main"),
      library: document.getElementById("mn-library"),
      inspector: document.getElementById("mn-inspector"),
      overlay: document.getElementById("mn-overlay"),
      documentList: document.getElementById("mn-document-list"),
      documentEmpty: document.getElementById("mn-document-empty"),
      search: document.getElementById("mn-search"),
      title: document.getElementById("mn-title"),
      documentPage: document.getElementById("mn-document"),
      editor: document.getElementById("mn-editor"),
      saveState: document.getElementById("mn-save-state"),
      wordCount: document.getElementById("mn-word-count"),
      characterCount: document.getElementById("mn-character-count"),
      engineStatus: document.getElementById("mn-engine-status"),
      outline: document.getElementById("mn-outline"),
      reviewResults: document.getElementById("mn-review-results"),
      voiceResults: document.getElementById("mn-voice-results"),
      rhymeResults: document.getElementById("mn-rhyme-results"),
      authorshipResults: document.getElementById("mn-authorship-results"),
      tags: document.getElementById("mn-tags"),
      favorite: document.getElementById("mn-favorite"),
      created: document.getElementById("mn-created"),
      updated: document.getElementById("mn-updated"),
      storageBanner: document.getElementById("mn-storage-banner"),
      storageMessage: document.getElementById("mn-storage-message"),
      toastRegion: document.getElementById("mn-toast-region"),
      blockFormat: document.getElementById("mn-block-format"),
    });

    const missing = Object.entries(el).filter(([, value]) => !value).map(([key]) => key);
    if (missing.length) throw new Error(`Elementos obrigatórios ausentes: ${missing.join(", ")}`);
  }

  async function init() {
    collectElements();
    bindEvents();
    setSaveState("Inicializando…");

    const openResult = await global.MassNotesStore.open();
    if (openResult.memoryMode) {
      el.storageBanner.hidden = false;
      el.storageMessage.textContent = openResult.reason
        ? `O navegador recusou o banco local: ${openResult.reason}. A sessão permanece em memória.`
        : "A sessão permanece em memória.";
    }

    await refreshDocuments();
    await recoverEmergencySnapshot();
    await refreshDocuments();
    chooseInitialDocument();
    renderAll();
    updateEngineAvailability();
    updateFocusControls(false);
    setSaveState(global.MassNotesStore.isMemoryMode() ? "Alterações temporárias" : "Salvo");
  }

  function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("selectionchange", updateToolbarState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    el.search.addEventListener("input", () => {
      state.search = el.search.value;
      renderLibrary();
    });
    el.title.addEventListener("input", handleDocumentInput);
    el.editor.addEventListener("input", handleDocumentInput);
    el.editor.addEventListener("keydown", handleEditorKeydown);
    el.editor.addEventListener("paste", handleEditorPaste);
    el.editor.addEventListener("drop", handleEditorDrop);
    el.tags.addEventListener("change", handlePropertiesChange);
    el.favorite.addEventListener("change", handlePropertiesChange);
    el.blockFormat.addEventListener("change", () => {
      runEditorCommand("formatBlock", el.blockFormat.value);
      el.blockFormat.value = "p";
    });
    document.querySelector(".mn-tabs")?.addEventListener("keydown", handleTabKeydown);
    el.overlay.addEventListener("click", closeDrawers);
    global.addEventListener("pagehide", handlePageExit);
    global.addEventListener("beforeunload", handlePageExit);
  }

  async function refreshDocuments() {
    state.documents = (await global.MassNotesStore.listDocuments())
      .filter((documentRecord) => !documentRecord.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function chooseInitialDocument() {
    let savedId = null;
    try { savedId = localStorage.getItem(ACTIVE_DOCUMENT_KEY); } catch (_) {}
    const preferred = state.documents.find((documentRecord) => documentRecord.id === state.activeId)
      || state.documents.find((documentRecord) => documentRecord.id === savedId)
      || state.documents[0];
    state.activeId = preferred?.id || null;
  }

  function activeDocument() {
    return state.documents.find((documentRecord) => documentRecord.id === state.activeId) || null;
  }

  function cloneRecord(value) {
    if (global.structuredClone) return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function renderAll() {
    renderLibrary();
    renderDocument();
    renderOutline();
    renderProperties();
    renderAuthorship();
  }

  function renderLibrary() {
    const query = normalizeSearch(state.search);
    const now = Date.now();
    const documents = state.documents.filter((documentRecord) => {
      if (state.view === "favorite" && !documentRecord.favorite) return false;
      if (state.view === "recent" && now - documentRecord.updatedAt > 1000 * 60 * 60 * 24 * 14) return false;
      if (!query) return true;
      const haystack = normalizeSearch([
        documentRecord.title,
        documentRecord.plainText,
        ...(documentRecord.tags || []),
      ].join(" "));
      return haystack.includes(query);
    });

    document.querySelectorAll("[data-count]").forEach((counter) => {
      const key = counter.dataset.count;
      const count = key === "favorite"
        ? state.documents.filter((item) => item.favorite).length
        : key === "recent"
          ? state.documents.filter((item) => now - item.updatedAt <= 1000 * 60 * 60 * 24 * 14).length
          : state.documents.length;
      counter.textContent = String(count);
    });

    el.documentList.replaceChildren(...documents.map(createDocumentListItem));
    el.documentEmpty.hidden = documents.length > 0;

    document.querySelectorAll("[data-view]").forEach((button) => {
      if (button.dataset.view === state.view) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function createDocumentListItem(documentRecord) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mn-doc-button";
    button.dataset.documentId = documentRecord.id;
    button.setAttribute("aria-current", documentRecord.id === state.activeId ? "true" : "false");

    const copy = document.createElement("span");
    copy.className = "mn-doc-copy";
    const title = document.createElement("span");
    title.className = "mn-doc-title";
    title.textContent = documentRecord.title || "Documento sem título";
    const meta = document.createElement("span");
    meta.className = "mn-doc-meta";
    meta.textContent = `${documentRecord.wordCount || 0} palavras · ${formatRelativeDate(documentRecord.updatedAt)}`;
    copy.append(title, meta);
    button.append(copy);

    if (documentRecord.favorite) {
      const star = document.createElement("span");
      star.className = "mn-doc-star";
      star.setAttribute("aria-label", "Favorito");
      star.textContent = "★";
      button.append(star);
    }
    item.append(button);
    return item;
  }

  function renderDocument() {
    const documentRecord = activeDocument();
    if (!documentRecord) {
      el.title.value = "";
      el.editor.innerHTML = "";
      el.documentPage.dataset.printTitle = "";
      updateEditorEmptyState();
      return;
    }
    el.title.value = documentRecord.title === "Documento sem título" ? "" : documentRecord.title || "";
    el.editor.innerHTML = sanitizeHtml(documentRecord.contentHtml || "<p><br></p>");
    el.documentPage.dataset.printTitle = documentRecord.title || "Documento sem título";
    ensureEditableParagraph();
    updateEditorEmptyState();
    renderCounts();
  }

  function renderCounts() {
    const documentRecord = activeDocument();
    const text = documentRecord?.plainText || "";
    const words = global.MassNotesStore.countWords(text);
    el.wordCount.textContent = `${words} ${words === 1 ? "palavra" : "palavras"}`;
    el.characterCount.textContent = `${text.length} ${text.length === 1 ? "caractere" : "caracteres"}`;
  }

  function renderOutline() {
    el.outline.replaceChildren();
    const headings = [...el.editor.querySelectorAll("h1,h2,h3")].filter((heading) => heading.textContent.trim());
    if (!headings.length) {
      appendEmpty(el.outline, "Use Título 1, 2 ou 3 para criar uma estrutura navegável.");
      return;
    }
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `mn-heading-${activeDocument()?.id || "doc"}-${index}`;
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mn-nav-button";
      button.dataset.headingId = heading.id;
      button.style.paddingLeft = `${9 + (Number(heading.tagName.slice(1)) - 1) * 13}px`;
      button.textContent = heading.textContent.trim();
      item.append(button);
      el.outline.append(item);
    });
  }

  function renderProperties() {
    const documentRecord = activeDocument();
    if (!documentRecord) return;
    el.tags.value = (documentRecord.tags || []).join(", ");
    el.favorite.checked = Boolean(documentRecord.favorite);
    el.created.textContent = formatDate(documentRecord.createdAt);
    el.updated.textContent = formatDate(documentRecord.updatedAt);
  }

  function renderAuthorship() {
    el.authorshipResults.replaceChildren();
    const documentRecord = activeDocument();
    const summary = global.MassNotesEngines.summarizeProof(documentRecord?.authorshipRecord);
    if (!summary) {
      appendEmpty(el.authorshipResults, "A engine de autoria ainda não está disponível.");
      return;
    }
    appendResult(el.authorshipResults, summary.status || "Em formação", [
      `${summary.organicEvents || 0} eventos orgânicos de ${summary.measuredEvents || 0} medidos`,
      summary.cadenceWpm ? `Cadência aproximada: ${summary.cadenceWpm} palavras por minuto` : "Cadência ainda insuficiente",
      `Integridade da sessão: ${summary.integrity || 0}%`,
    ].join(" · "), "low");
  }

  function handleClick(event) {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      Promise.resolve(runAction(actionButton.dataset.action, actionButton)).catch(handleActionError);
      return;
    }

    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      state.view = viewButton.dataset.view;
      renderLibrary();
      return;
    }

    const documentButton = event.target.closest("[data-document-id]");
    if (documentButton) {
      selectDocument(documentButton.dataset.documentId).catch(handleActionError);
      return;
    }

    const headingButton = event.target.closest("[data-heading-id]");
    if (headingButton) {
      document.getElementById(headingButton.dataset.headingId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const tab = event.target.closest("[role='tab'][data-panel]");
    if (tab) {
      activatePanel(tab.dataset.panel, true);
      return;
    }

    const commandButton = event.target.closest("[data-command]");
    if (commandButton) runEditorCommand(commandButton.dataset.command);
  }

  async function runAction(action, button) {
    switch (action) {
      case "new-document": await createDocument(); break;
      case "clear-search": el.search.value = ""; state.search = ""; renderLibrary(); el.search.focus(); break;
      case "open-library": openDrawer("library", button); break;
      case "close-library": closeDrawers(); break;
      case "open-inspector": openDrawer("inspector", button); break;
      case "close-inspector": closeDrawers(); break;
      case "toggle-theme": toggleTheme(); break;
      case "toggle-focus": toggleFocus(); break;
      case "create-link": createLink(); break;
      case "run-review": await executeEngine("review", button); break;
      case "run-voice": await executeEngine("voice", button); break;
      case "run-rhyme": await executeEngine("rhyme", button); break;
      case "export-txt": exportText(); break;
      default: break;
    }
  }

  function handleActionError(error) {
    console.error("[Mass Notes] Ação não concluída.", error);
    toast("A ação não pôde ser concluída.");
  }

  async function createDocument() {
    await flushSave(state.activeId);
    const saved = await global.MassNotesStore.saveDocument({
      title: "Documento sem título",
      contentHtml: "<p><br></p>",
      plainText: "",
      authorshipRecord: global.MassNotesEngines.createProofRecord(null),
    });
    await refreshDocuments();
    state.activeId = saved.id;
    rememberActiveDocument();
    clearEngineResults();
    renderAll();
    closeDrawers(false);
    el.title.focus();
    el.title.select();
    toast("Novo documento criado.");
  }

  async function selectDocument(id) {
    if (id === state.activeId) {
      closeDrawers();
      return;
    }
    await flushSave(state.activeId);
    state.activeId = id;
    rememberActiveDocument();
    clearEngineResults();
    renderAll();
    closeDrawers();
  }

  function handleDocumentInput() {
    const documentRecord = activeDocument();
    if (!documentRecord) return;
    captureEditorIntoRecord(documentRecord);
    state.editEpoch += 1;
    markDirty(documentRecord.id);
    setSaveState("Salvando…");
    renderCounts();
    renderOutline();
    renderLibrary();
    scheduleRecoverySnapshot();
    scheduleSave();
  }

  function captureEditorIntoRecord(documentRecord) {
    documentRecord.title = el.title.value.slice(0, 180).trim() || "Documento sem título";
    documentRecord.contentHtml = sanitizeHtml(el.editor.innerHTML);
    documentRecord.plainText = global.MassNotesStore.plainTextFromHtml(documentRecord.contentHtml);
    documentRecord.updatedAt = Date.now();
    documentRecord.wordCount = global.MassNotesStore.countWords(documentRecord.plainText);
    documentRecord.characterCount = documentRecord.plainText.length;
    el.documentPage.dataset.printTitle = documentRecord.title;
    updateEditorEmptyState();
  }

  function handleEditorKeydown(event) {
    const documentRecord = activeDocument();
    if (!documentRecord) return;
    documentRecord.authorshipRecord = global.MassNotesEngines.recordKey(documentRecord.authorshipRecord, event, Date.now());
    // Tab continua sendo navegação de teclado. Recuos pertencem aos comandos de lista.
  }

  function handleEditorPaste(event) {
    event.preventDefault();
    const clipboard = event.clipboardData;
    const rich = clipboard?.getData("text/html") || "";
    const plain = clipboard?.getData("text/plain") || "";
    const safe = rich ? sanitizeHtml(rich) : plainTextToHtml(plain);
    document.execCommand("insertHTML", false, safe);
    handleDocumentInput();
  }

  function handleEditorDrop(event) {
    event.preventDefault();
    const plain = event.dataTransfer?.getData("text/plain") || "";
    if (!plain) {
      toast("Solte apenas texto no editor.");
      return;
    }
    document.execCommand("insertHTML", false, plainTextToHtml(plain));
    handleDocumentInput();
  }

  function handlePropertiesChange() {
    const documentRecord = activeDocument();
    if (!documentRecord) return;
    documentRecord.tags = [...new Set(el.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, 30);
    documentRecord.favorite = el.favorite.checked;
    documentRecord.updatedAt = Date.now();
    markDirty(documentRecord.id);
    setSaveState("Salvando…");
    renderLibrary();
    scheduleRecoverySnapshot();
    scheduleSave();
  }

  function markDirty(id) {
    if (id) state.dirtyIds.add(id);
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => flushSave(state.activeId).catch(handleActionError), SAVE_DELAY);
  }

  async function flushSave(id = state.activeId) {
    clearTimeout(state.saveTimer);
    state.saveTimer = null;
    if (!id || !state.dirtyIds.has(id)) return state.documents.find((item) => item.id === id) || null;

    const previousLane = state.saveLanes.get(id) || Promise.resolve();
    const task = previousLane.catch(() => null).then(async () => {
      if (!state.dirtyIds.has(id)) return state.documents.find((item) => item.id === id) || null;
      const current = state.documents.find((item) => item.id === id);
      if (!current) return null;

      const candidate = cloneRecord(current);
      const capturedUpdatedAt = candidate.updatedAt;
      state.dirtyIds.delete(id);

      try {
        const saved = await global.MassNotesStore.saveDocument(candidate);
        const live = state.documents.find((item) => item.id === id);
        const index = state.documents.findIndex((item) => item.id === id);
        if (live && live.updatedAt > capturedUpdatedAt) {
          live.revision = Math.max(Number(live.revision) || 0, Number(saved.revision) || 0);
        } else if (index >= 0) {
          state.documents[index] = saved;
        } else {
          state.documents.unshift(saved);
        }
        if (id === state.activeId) {
          setSaveState(global.MassNotesStore.isMemoryMode() ? "Alterações temporárias" : "Salvo");
          renderProperties();
        }
        clearEmergencySnapshotIfCovered(id, capturedUpdatedAt);
        return saved;
      } catch (error) {
        state.dirtyIds.add(id);
        if (id === state.activeId) {
          setSaveState("Falha ao salvar");
          el.storageBanner.hidden = false;
          el.storageMessage.textContent = "Não foi possível gravar as alterações. Exporte o documento antes de fechar esta aba.";
        }
        throw error;
      }
    });

    state.saveLanes.set(id, task);
    try {
      await task;
    } finally {
      if (state.saveLanes.get(id) === task) state.saveLanes.delete(id);
    }

    if (state.dirtyIds.has(id)) return flushSave(id);
    return state.documents.find((item) => item.id === id) || null;
  }

  function setSaveState(value) {
    el.saveState.textContent = value;
  }

  function runEditorCommand(command, value = null) {
    el.editor.focus();
    try {
      document.execCommand(command, false, value);
      handleDocumentInput();
      updateToolbarState();
    } catch (error) {
      console.error(`[Mass Notes] Comando ${command} falhou.`, error);
      toast("A formatação não pôde ser aplicada.");
    }
  }

  function createLink() {
    const selection = global.getSelection();
    if (!selection || selection.isCollapsed || !el.editor.contains(selection.anchorNode)) {
      toast("Selecione um trecho do documento antes de criar o link.");
      return;
    }
    const value = global.prompt("Endereço do link (https://, http://, mailto: ou tel:)", "https://");
    if (!value) return;
    let url;
    try { url = new URL(value, location.href); } catch (_) { toast("Endereço inválido."); return; }
    if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) {
      toast("Esse tipo de endereço não é permitido.");
      return;
    }
    runEditorCommand("createLink", value);
    el.editor.querySelectorAll("a").forEach((link) => {
      link.rel = "noopener noreferrer";
      if (/^https?:/i.test(link.href)) link.target = "_blank";
    });
    handleDocumentInput();
  }

  function updateToolbarState() {
    const selection = global.getSelection();
    if (!selection || !el.editor.contains(selection.anchorNode)) return;
    document.querySelectorAll("[data-command='bold'],[data-command='italic'],[data-command='underline'],[data-command='strikeThrough']").forEach((button) => {
      try { button.setAttribute("aria-pressed", String(document.queryCommandState(button.dataset.command))); }
      catch (_) { button.setAttribute("aria-pressed", "false"); }
    });
  }

  async function executeEngine(type, button) {
    const currentBeforeSave = activeDocument();
    if (!currentBeforeSave) return;
    await flushSave(currentBeforeSave.id);
    const documentRecord = activeDocument();
    if (!documentRecord || documentRecord.id !== currentBeforeSave.id) return;

    const token = Symbol(type);
    const startedEpoch = state.editEpoch;
    state.engineTokens.set(type, token);
    setEngineState(type, "Analisando…");
    button.disabled = true;
    try {
      const result = type === "review"
        ? await global.MassNotesEngines.runReview(documentRecord)
        : type === "voice"
          ? await global.MassNotesEngines.runVoice(documentRecord)
          : await global.MassNotesEngines.runRhyme(documentRecord);

      if (state.engineTokens.get(type) !== token) return;
      const current = activeDocument();
      if (!current || result.documentId !== current.id || result.revision !== current.revision || state.editEpoch !== startedEpoch) {
        setEngineState(type, "Texto mudou");
        return;
      }
      renderEngineResult(type, result);
      setEngineState(type, result.ok ? "Concluído" : "Indisponível");
    } catch (error) {
      console.error(`[Mass Notes] Engine ${type} falhou fora do adaptador.`, error);
      setEngineState(type, "Falha");
      const target = engineContainer(type);
      if (target) {
        target.replaceChildren();
        appendEmpty(target, "A análise não pôde ser concluída.");
      }
    } finally {
      if (state.engineTokens.get(type) === token) state.engineTokens.delete(type);
      button.disabled = false;
    }
  }

  function engineContainer(type) {
    if (type === "review") return el.reviewResults;
    if (type === "voice") return el.voiceResults;
    if (type === "rhyme") return el.rhymeResults;
    return null;
  }

  function renderEngineResult(type, result) {
    if (type === "review") renderReview(result);
    else if (type === "voice") renderVoice(result);
    else renderRhyme(result);
  }

  function renderReview(result) {
    el.reviewResults.replaceChildren();
    if (!result.ok) return appendEmpty(el.reviewResults, result.error.message);
    const alerts = result.data.alerts || [];
    const terms = result.data.contextualTerms || [];
    if (!alerts.length && !terms.length) appendResult(el.reviewResults, "Nenhuma observação relevante", "As engines não encontraram alertas neste recorte.", "low");
    alerts.slice(0, 20).forEach((item) => appendResult(el.reviewResults, item.title, item.detail || "Observação detectada pela análise local.", item.severity));
    terms.slice(0, 20).forEach((item) => appendResult(
      el.reviewResults,
      `${item.term} · ${item.count} ${item.count === 1 ? "ocorrência" : "ocorrências"}`,
      `${item.category}. ${item.reason}${item.alternatives.length ? ` Alternativas possíveis: ${item.alternatives.join(", ")}.` : ""}`,
      "low"
    ));
    (result.warnings || []).forEach((warning) => appendResult(el.reviewResults, "Limite da análise", warning, "low"));
  }

  function renderVoice(result) {
    el.voiceResults.replaceChildren();
    if (!result.ok) return appendEmpty(el.voiceResults, result.error.message);
    const data = result.data;
    appendResult(el.voiceResults, data.gesture ? `Gesto predominante: ${String(data.gesture)}` : "Gesto ainda indefinido", "Leitura descritiva da superfície verbal do documento.", "low");
    if (data.fields?.length) appendResult(el.voiceResults, "Campos semânticos", data.fields.map((item) => item.label || item.name || String(item)).join(" · "), "low");
    if (data.repetitions?.length) appendResult(el.voiceResults, "Palavras que voltam", data.repetitions.map((item) => item.word ? `${item.word} (${item.count})` : String(item)).join(" · "), "medium");
    if (data.exercises?.length) data.exercises.forEach((exercise, index) => appendResult(el.voiceResults, `Exercício ${index + 1}`, String(exercise), "low"));
    if (data.reader) appendResult(el.voiceResults, "Leitura provável", typeof data.reader === "string" ? data.reader : JSON.stringify(data.reader), "low");
  }

  function renderRhyme(result) {
    el.rhymeResults.replaceChildren();
    if (!result.ok) return appendEmpty(el.rhymeResults, result.error.message);
    const data = result.data || {};
    if (data.isProse) {
      appendResult(el.rhymeResults, "O texto parece ser prosa", data.proseNote || "A engine procurou padrões sonoros internos.", "low");
      (data.rimasInternas || []).slice(0, 12).forEach((group) => appendResult(el.rhymeResults, `Som ${group.som || "recorrente"}`, (group.palavras || []).join(" · "), "low"));
      return;
    }
    appendResult(el.rhymeResults, `${data.totalVerses || 0} versos`, data.dominantName ? `Metro dominante: ${data.dominantName}` : "Métrica variável", "low");
    if (data.rhymeScheme) appendResult(el.rhymeResults, "Esquema de rimas", data.rhymeScheme, "low");
    (data.scans || []).slice(0, 20).forEach((scan, index) => appendResult(el.rhymeResults, `Verso ${index + 1} · ${scan.totalSyllables || "—"} sílabas`, data.verses?.[index] || "", "low"));
  }

  function appendResult(container, title, detail, severity = "medium") {
    const card = document.createElement("article");
    card.className = "mn-result";
    card.dataset.severity = severity;
    const strong = document.createElement("strong");
    strong.textContent = String(title || "Observação");
    const copy = document.createElement("span");
    copy.textContent = String(detail || "");
    card.append(strong, copy);
    container.append(card);
  }

  function appendEmpty(container, message) {
    const empty = document.createElement(container.tagName === "UL" ? "li" : "p");
    empty.className = "mn-empty";
    empty.textContent = message;
    container.append(empty);
  }

  function setEngineState(type, value) {
    const target = document.querySelector(`[data-engine-state='${type}']`);
    if (target) target.textContent = value;
  }

  function clearEngineResults() {
    state.engineTokens.clear();
    [el.reviewResults, el.voiceResults, el.rhymeResults].forEach((container) => container.replaceChildren());
    ["review", "voice", "rhyme"].forEach((type) => setEngineState(type, "Aguardando"));
  }

  function activatePanel(panel, focus = false) {
    state.activePanel = panel;
    document.querySelectorAll("[role='tab'][data-panel]").forEach((tab) => {
      const active = tab.dataset.panel === panel;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    document.querySelectorAll("[data-panel-content]").forEach((content) => {
      content.hidden = content.dataset.panelContent !== panel;
    });
    if (panel === "authorship") renderAuthorship();
  }

  function handleTabKeydown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...document.querySelectorAll("[role='tab'][data-panel]")];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    activatePanel(tabs[next].dataset.panel, true);
  }

  function handleGlobalKeydown(event) {
    if (event.key === "Tab" && state.drawerKind) {
      trapDrawerFocus(event);
      return;
    }
    if (event.key === "Escape") {
      if (state.drawerKind) {
        closeDrawers();
        return;
      }
      if (document.body.classList.contains("mn-focus")) toggleFocus(false);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      createDocument().catch(handleActionError);
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      flushSave(state.activeId).catch(handleActionError);
    }
  }

  function openDrawer(kind, trigger) {
    closeDrawers(false);
    state.drawerKind = kind;
    state.drawerTrigger = trigger || null;
    const panel = kind === "library" ? el.library : el.inspector;
    document.body.classList.add(kind === "library" ? "mn-library-open" : "mn-inspector-open");
    el.overlay.hidden = false;
    trigger?.setAttribute("aria-expanded", "true");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    setBackgroundInert(kind, true);
    getFocusable(panel)[0]?.focus();
  }

  function closeDrawers(restoreFocus = true) {
    const wasOpen = Boolean(state.drawerKind);
    document.body.classList.remove("mn-library-open", "mn-inspector-open");
    el.overlay.hidden = true;
    document.querySelectorAll("[data-action='open-library'],[data-action='open-inspector']").forEach((button) => button.setAttribute("aria-expanded", "false"));
    [el.library, el.inspector].forEach((panel) => {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
    });
    setBackgroundInert(null, false);
    const trigger = state.drawerTrigger;
    state.drawerKind = null;
    state.drawerTrigger = null;
    if (wasOpen && restoreFocus && trigger?.isConnected) trigger.focus();
  }

  function setBackgroundInert(kind, enabled) {
    const entries = [
      [el.main, true],
      [el.library, kind !== "library"],
      [el.inspector, kind !== "inspector"],
    ];
    entries.forEach(([node, shouldInert]) => {
      const inert = enabled && shouldInert;
      node.inert = inert;
      if (inert) node.setAttribute("inert", "");
      else node.removeAttribute("inert");
    });
  }

  function trapDrawerFocus(event) {
    const panel = state.drawerKind === "library" ? el.library : el.inspector;
    const focusable = getFocusable(panel);
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getFocusable(container) {
    return [...container.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")]
      .filter((node) => !node.hidden && node.getClientRects().length > 0);
  }

  function toggleFocus(force) {
    const enabled = typeof force === "boolean" ? force : !document.body.classList.contains("mn-focus");
    if (enabled) closeDrawers(false);
    document.body.classList.toggle("mn-focus", enabled);
    updateFocusControls(enabled);
    if (!enabled) el.editor.focus();
  }

  function updateFocusControls(enabled) {
    document.querySelectorAll("[data-action='toggle-focus']").forEach((button) => {
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("aria-label", enabled ? "Sair do modo foco" : "Ativar modo foco");
    });
  }

  function toggleTheme() {
    const dark = document.documentElement.dataset.massNotesTheme === "dark";
    if (dark) delete document.documentElement.dataset.massNotesTheme;
    else document.documentElement.dataset.massNotesTheme = "dark";
    try { localStorage.setItem(THEME_KEY, dark ? "light" : "dark"); } catch (_) {}
  }

  function exportText() {
    const documentRecord = activeDocument();
    if (!documentRecord) return;
    const result = global.MassNotesEngines.exportDocument(documentRecord, "txt");
    if (!result.ok) return toast(result.error.message);
    const output = result.data;
    const blob = new Blob([output.content], { type: output.mimeType || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = output.filename || "documento.txt";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Documento exportado.");
  }

  function updateEngineAvailability() {
    const availability = global.MassNotesEngines.availability();
    const available = Object.values(availability).filter(Boolean).length;
    const total = Object.keys(availability).length;
    el.engineStatus.textContent = `${available}/${total} capacidades locais carregadas`;
  }

  function toast(message) {
    el.toastRegion.replaceChildren();
    const toastElement = document.createElement("div");
    toastElement.className = "mn-toast";
    toastElement.textContent = message;
    el.toastRegion.append(toastElement);
    setTimeout(() => toastElement.remove(), 3400);
  }

  function scheduleRecoverySnapshot() {
    clearTimeout(state.recoveryTimer);
    state.recoveryTimer = setTimeout(saveEmergencySnapshot, RECOVERY_DELAY);
  }

  function saveEmergencySnapshot() {
    clearTimeout(state.recoveryTimer);
    state.recoveryTimer = null;
    const documentRecord = activeDocument();
    if (!documentRecord || (!state.dirtyIds.has(documentRecord.id) && !state.saveLanes.has(documentRecord.id))) return;
    try {
      localStorage.setItem(RECOVERY_KEY, JSON.stringify({
        capturedAt: Date.now(),
        document: cloneRecord(documentRecord),
      }));
    } catch (_) {}
  }

  async function recoverEmergencySnapshot() {
    let parsed = null;
    try {
      const raw = localStorage.getItem(RECOVERY_KEY);
      parsed = raw ? JSON.parse(raw) : null;
    } catch (_) {
      return;
    }
    const candidate = parsed?.document;
    if (!candidate?.id || !candidate.updatedAt) return;
    const persisted = state.documents.find((item) => item.id === candidate.id);
    if (persisted && Number(persisted.updatedAt) >= Number(candidate.updatedAt)) {
      clearEmergencySnapshot();
      return;
    }
    try {
      const saved = await global.MassNotesStore.saveDocument(candidate);
      state.activeId = saved.id;
      rememberActiveDocument();
      clearEmergencySnapshot();
      toast("Uma edição interrompida foi recuperada.");
    } catch (error) {
      console.error("[Mass Notes] Snapshot emergencial não pôde ser recuperado.", error);
      el.storageBanner.hidden = false;
      el.storageMessage.textContent = "Existe uma edição de recuperação que ainda não pôde ser gravada.";
    }
  }

  function clearEmergencySnapshotIfCovered(id, updatedAt) {
    try {
      const raw = localStorage.getItem(RECOVERY_KEY);
      if (!raw) return;
      const snapshot = JSON.parse(raw);
      if (snapshot?.document?.id === id && Number(snapshot.document.updatedAt) <= Number(updatedAt) && !state.dirtyIds.has(id)) {
        localStorage.removeItem(RECOVERY_KEY);
      }
    } catch (_) {}
  }

  function clearEmergencySnapshot() {
    try { localStorage.removeItem(RECOVERY_KEY); } catch (_) {}
  }

  function handlePageExit() {
    saveEmergencySnapshot();
    flushSave(state.activeId).catch(() => {});
  }

  function handleVisibilityChange() {
    if (document.visibilityState !== "hidden") return;
    saveEmergencySnapshot();
    flushSave(state.activeId).catch(() => {});
  }

  function sanitizeHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const allowedTags = new Set(["P", "BR", "H1", "H2", "H3", "STRONG", "B", "EM", "I", "U", "S", "BLOCKQUOTE", "UL", "OL", "LI", "A"]);
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
    const elements = [];
    while (walker.nextNode()) elements.push(walker.currentNode);
    elements.forEach((node) => {
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      [...node.attributes].forEach((attribute) => {
        if (node.tagName === "A" && ["href", "target", "rel"].includes(attribute.name)) return;
        if (attribute.name === "id" && /^mn-heading-/.test(attribute.value)) return;
        node.removeAttribute(attribute.name);
      });
      if (node.tagName === "A") {
        const href = node.getAttribute("href") || "";
        try {
          const url = new URL(href, location.href);
          if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) node.removeAttribute("href");
        } catch (_) { node.removeAttribute("href"); }
        node.setAttribute("rel", "noopener noreferrer");
        if (/^https?:/i.test(node.getAttribute("href") || "")) node.setAttribute("target", "_blank");
        else node.removeAttribute("target");
      }
    });
    return template.innerHTML || "<p><br></p>";
  }

  function plainTextToHtml(text) {
    const value = String(text || "").replace(/\r\n?/g, "\n");
    if (!value) return "";
    return value.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function ensureEditableParagraph() {
    if (!el.editor.innerHTML.trim()) el.editor.innerHTML = "<p><br></p>";
  }

  function updateEditorEmptyState() {
    const empty = !global.MassNotesStore.plainTextFromHtml(el.editor.innerHTML).trim();
    el.editor.dataset.empty = String(empty);
  }

  function rememberActiveDocument() {
    try { localStorage.setItem(ACTIVE_DOCUMENT_KEY, state.activeId || ""); } catch (_) {}
  }

  function normalizeSearch(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  }

  function formatDate(timestamp) {
    if (!timestamp) return "—";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
  }

  function formatRelativeDate(timestamp) {
    const delta = Date.now() - Number(timestamp || 0);
    if (delta < 60_000) return "agora";
    if (delta < 3_600_000) return `há ${Math.max(1, Math.round(delta / 60_000))} min`;
    if (delta < 86_400_000) return `há ${Math.max(1, Math.round(delta / 3_600_000))} h`;
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(timestamp));
  }

  global.MassNotesApp = { init, flushSave };
})(window);