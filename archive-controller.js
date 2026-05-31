function renderManuscriptNavigation() {
  const roots = state.manuscripts.filter((m) => !m.parentId);

  // Group by folder
  const groups = new Map();
  roots.forEach((m) => {
    const f = getManuscriptFolder(m);
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f).push(m);
  });

  function manuscriptRowHtml(manuscript) {
    const isCurrent = manuscript.id === state.activeId ? " is-current" : "";
    const type = getArchiveType(manuscript);
    const isActive = manuscript.id === state.activeId;
    const companions = state.manuscripts.filter((m) => m.parentId === manuscript.id);

    const companionHtml = isActive ? companions.map((c) => {
      const ct = getArchiveType(c);
      const isCC = c.id === state.activeId ? " is-current" : "";
      return `<button class="tree-row companion-row${isCC}" data-manuscript-id="${c.id}">
        <span class="material-symbols-outlined">${ct.icon}</span>${escapeHtml(c.title)}</button>`;
    }).join("") + `<button class="tree-row companion-add-row" data-action="add-companion-note" title="Anotação, pesquisa ou referência associada a este manuscrito">
      <span class="material-symbols-outlined">add</span>Nota vinculada</button>` : "";

    return `
      <div class="nav-manuscript-wrap">
        <button class="tree-row manuscript-row${isCurrent}" data-manuscript-id="${manuscript.id}">
          <span class="material-symbols-outlined">${type.icon}</span>
          <span class="nav-ms-title">${escapeHtml(manuscript.title || "Sem título")}</span>
        </button>
        <button class="nav-ms-delete" data-manuscript-delete="${manuscript.id}" title="Apagar nota" aria-label="Apagar nota">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      ${companionHtml}
    `;
  }

  let html = "";
  groups.forEach((manuscripts, folderName) => {
    const isOpen = !collapsedFolders.has(folderName);
    const icon = isOpen ? "expand_more" : "chevron_right";
    html += `
      <button class="tree-row tree-folder-row" data-folder-toggle="${escapeHtml(folderName)}">
        <span class="material-symbols-outlined">${icon}</span>
        <span class="material-symbols-outlined">folder</span>
        ${escapeHtml(folderName)}
      </button>
      ${isOpen ? `<div class="folder-children">${manuscripts.map(manuscriptRowHtml).join("")}</div>` : ""}
    `;
  });

  manuscriptList.innerHTML = html || `<button class="tree-row tree-empty-row" data-action="open-create-note">
    <span class="material-symbols-outlined">add</span>Criar primeira nota
  </button>`;
}

let _deleteUndoTimer = null;
let _deletedSnapshot = null;
let _createNoteTimer = null;

function collectDescendants(id, all) {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    all.forEach(m => { if (m.parentId && ids.has(m.parentId) && !ids.has(m.id)) { ids.add(m.id); changed = true; } });
  }
  return ids;
}

function deleteManuscript(id) {
  const idsToDelete = collectDescendants(id, state.manuscripts);
  const toDelete = state.manuscripts.filter((m) => idsToDelete.has(m.id));
  if (!toDelete.length) return;

  // Save snapshot for undo
  _deletedSnapshot = { manuscripts: toDelete, activeId: state.activeId };

  // Remove immediately
  state.manuscripts = state.manuscripts.filter((m) => !idsToDelete.has(m.id));
  if (state.activeId === id) {
    // Não carrega a próxima nota automaticamente — deixa o usuário escolher
    state.activeId = null;
    state.template.selectedId = null;
    state.template.open = false;
    // Abre a sidebar para o usuário ver e escolher qual nota abrir
    state.layout.leftCollapsed = false;
    applyPanelLayout();
    applyTemplateLayout();
    renderActiveManuscript(); // mostra zero state / estado vazio
  }
  renderManuscriptNavigation();
  renderProjectGrid();
  applyProgressLevel();
  persistState("Nota apagada");

  // Show undo toast
  const toast = document.getElementById("delete-undo-toast");
  if (toast) {
    clearTimeout(_deleteUndoTimer);
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    toast.style.pointerEvents = "auto";
    _deleteUndoTimer = setTimeout(hideDeleteUndo, 5000);
  }

  // Se apagou a última nota, abre "Nova nota"
  if (state.manuscripts.filter((m) => !m.parentId).length === 0) {
    clearTimeout(_createNoteTimer);
    _createNoteTimer = setTimeout(openCreateNote, 300);
  }
}

function hideDeleteUndo() {
  const toast = document.getElementById("delete-undo-toast");
  if (!toast) return;
  toast.style.opacity = "0";
  toast.style.transform = "translateX(-50%) translateY(8px)";
  toast.style.pointerEvents = "none";

  if (_deletedSnapshot?.manuscripts) {
    _deletedSnapshot.manuscripts.forEach(m => {
      delete state.proofs[m.id];
      delete state.proofValidations[m.id];
      delete state.versions[m.id];
    });
    persistState("Nota apagada permanentemente");
  }

  _deletedSnapshot = null;
}

function showMasterResetModal() {
  const existing = document.getElementById("master-reset-modal");
  if (existing) { existing.hidden = false; return; }
  const modal = document.createElement("div");
  modal.id = "master-reset-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "master-reset-title");
  modal.innerHTML = `
    <div class="master-reset-backdrop" data-action="cancel-master-reset"></div>
    <div class="master-reset-panel">
      <h2 id="master-reset-title">Zerar o Escrevaral</h2>
      <p>Todos os seus textos, notas e configurações serão apagados permanentemente. Esta ação não pode ser desfeita.</p>
      <div class="master-reset-tip">
        <span class="material-symbols-outlined">shield_locked</span>
        <span>Exporte um backup <strong>.esc</strong> antes de continuar — ele preserva todo o seu acervo e pode ser reimportado depois.</span>
      </div>
      <div class="master-reset-actions">
        <button class="secondary-button" data-action="export-backup">
          <span class="material-symbols-outlined">file_save</span>
          Exportar cópia de segurança
        </button>
        <button class="secondary-button" data-action="cancel-master-reset">Cancelar</button>
        <button class="danger-button" data-action="confirm-master-reset">Apagar tudo mesmo assim</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function hideMasterResetModal() {
  const modal = document.getElementById("master-reset-modal");
  if (modal) modal.hidden = true;
}

function executeMasterReset() {
  localStorage.clear();
  localStorage.setItem("vrda-first-visit", "1"); // skip first-time onboarding on reload
  location.reload();
}

function undoDelete() {
  if (!_deletedSnapshot) return;
  clearTimeout(_deleteUndoTimer);
  clearTimeout(_createNoteTimer);
  _deletedSnapshot.manuscripts.forEach((m) => state.manuscripts.unshift(m));
  state.activeId = _deletedSnapshot.activeId;
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  applyProgressLevel();
  persistState("Exclusão desfeita");
  hideDeleteUndo();
}

function renderProjectGrid() {
  if (!isArchiveFilterAvailable(state.archive.filter)) {
    state.archive.filter = "all";
  }

  renderArchiveFilters();
  renderArchiveStatusBar();
  archiveSearch.value = state.archive.search;
  archiveSort.value = state.archive.sort;
  const searchQuery = normalizeSearch(state.archive.search);

  const filteredManuscripts = state.manuscripts.filter((manuscript) => {
    const matchesType = state.archive.filter === "all" || getArchiveType(manuscript).id === state.archive.filter;
    const matchesStatus = state.archive.statusFilter === "all" || manuscript.status === state.archive.statusFilter;
    const matchesSearch = !searchQuery || createSearchText(manuscript).includes(searchQuery);
    return matchesType && matchesStatus && matchesSearch;
  });
  const sortedManuscripts = sortArchiveManuscripts(filteredManuscripts);

  renderPinnedDocuments(filteredManuscripts);
  renderOngoingDocuments(filteredManuscripts);
  renderRecentDocuments(filteredManuscripts);

  if (!sortedManuscripts.length) {
    const message = searchQuery ? "Nenhuma nota encontrada" : "Nada aqui ainda";
    const description = searchQuery
      ? "Tente buscar por outro termo ou limpe a busca para ver o acervo."
      : "Crie uma nova nota ou mude o filtro para ver outras notas.";

    projectGrid.innerHTML = `
      <div class="archive-empty">
        <span class="material-symbols-outlined">inventory_2</span>
        <strong>${message}</strong>
        <p>${description}</p>
      </div>
    `;
    return;
  }

  projectGrid.innerHTML = sortedManuscripts
    .map((manuscript, index) => {
      const words = countWords(manuscript.text);
      const featured = index === 0 ? " featured" : "";
      const selected = manuscript.id === state.activeId ? " is-selected" : "";
      const type = getArchiveType(manuscript);
      const tags = createTagMarkup(manuscript.tags);
      const summary = VeredaArchive.docSummary(manuscript);
      const cardDescription = summary || manuscript.description || createExcerpt(manuscript.text);
      const pinned = manuscript.pinned ? " is-pinned" : "";
      const pinLabel = manuscript.pinned ? "Desafixar nota" : "Fixar nota";
      const checklistProgress = getChecklistProgress(manuscript);
      const progressLabel = checklistProgress
        ? `${checklistProgress.done}/${checklistProgress.total} critérios (guia)`
        : `${manuscript.progress}% manual`;
      const progressValue = checklistProgress
        ? Math.round((checklistProgress.done / Math.max(1, checklistProgress.total)) * 100)
        : manuscript.progress;
      const isOpenInEditor = manuscript.id === state.activeId;
      const editorBadge = isOpenInEditor
        ? `<span class="project-editor-badge"><span class="material-symbols-outlined">edit_note</span>Aberta no editor</span>`
        : "";
      const createdAtLine = formatCreatedAt(manuscript.createdAt);
      const badgeChips = typeof VeredaBadges !== "undefined"
        ? VeredaBadges.renderBadgeChips(manuscript)
        : "";

      return `
        <article class="project-card${featured}${selected}${pinned}" data-archive-select="${manuscript.id}" data-document-type="${type.id}" role="button" tabindex="0">
          <span class="project-pin material-symbols-outlined" data-archive-pin="${manuscript.id}" role="button" tabindex="0" aria-label="${pinLabel}" title="${pinLabel}">push_pin</span>
          <div class="project-card-top">
            <span class="project-type"><i class="material-symbols-outlined">${type.icon}</i>${escapeHtml(type.label)} · ${escapeHtml(manuscript.status)}</span>
            ${editorBadge}
          </div>
          <h2>${escapeHtml(manuscript.title || "Sem título")}</h2>
          ${manuscript.kind && manuscript.kind !== manuscript.title ? `<span class="project-kind">${escapeHtml(manuscript.kind)}</span>` : ""}
          <p>${escapeHtml(cardDescription)}</p>
          ${createdAtLine ? `<span class="project-created-at">${escapeHtml(createdAtLine)}</span>` : ""}
          ${tags}
          <div class="project-progress" aria-label="Progresso de ${escapeHtml(manuscript.title)}">
            <i style="--progress: ${progressValue}%"></i>
          </div>
          <div class="project-meta-row">
            ${manuscript.chapter ? `<span class="project-meta-badge">${escapeHtml(manuscript.chapter)}</span>` : ""}
            <span class="project-meta-badge">${progressLabel}</span>
            <span class="project-meta-badge">${words > 0 ? `${words} palavras` : "rascunho"}</span>
            <span class="project-meta-time">${formatUpdatedAt(manuscript.updatedAt)}</span>
          </div>
          ${badgeChips ? `<div class="badge-chips-row">${badgeChips}</div>` : ""}
          <div class="project-actions" aria-label="Ações de ${escapeHtml(manuscript.title)}">
            <button type="button" data-archive-quick="open" data-archive-document="${manuscript.id}" title="Abrir no editor" aria-label="Abrir ${escapeHtml(manuscript.title)} no editor">
              <span class="material-symbols-outlined">edit_note</span>
              Abrir
            </button>
            <button type="button" data-archive-quick="duplicate" data-archive-document="${manuscript.id}" title="Duplicar nota" aria-label="Duplicar ${escapeHtml(manuscript.title)}">
              <span class="material-symbols-outlined">content_copy</span>
            </button>
            <details class="project-export-menu">
              <summary title="Exportar nota">
                <span class="material-symbols-outlined">file_download</span>
              </summary>
              <div class="project-export-options">
                <button type="button" data-archive-quick="export" data-archive-format="txt" data-archive-document="${manuscript.id}">Exportar texto (.txt)</button>
                <button type="button" data-archive-quick="export" data-archive-format="md" data-archive-document="${manuscript.id}">Exportar Markdown (.md)</button>
                <button type="button" data-archive-quick="export" data-archive-format="docx" data-archive-document="${manuscript.id}">Exportar Word (.docx)</button>
              </div>
            </details>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPinnedDocuments(manuscripts) {
  const pinnedItems = sortArchiveManuscripts(manuscripts.filter((manuscript) => manuscript.pinned)).slice(0, 6);

  if (!pinnedItems.length) {
    pinnedDocuments.hidden = true;
    pinnedDocuments.innerHTML = "";
    return;
  }

  pinnedDocuments.hidden = false;
  pinnedDocuments.innerHTML = `
    <div class="archive-strip-heading">
      <div>
        <p class="eyebrow">Fixados</p>
        <h2>Na mesa agora</h2>
      </div>
      <span>${pinnedItems.length} ${pinnedItems.length === 1 ? "nota" : "notas"}</span>
    </div>
    <div class="archive-strip-list">
      ${pinnedItems.map((manuscript) => createCompactDocumentMarkup(manuscript, "pinned-document")).join("")}
    </div>
  `;
}

function renderOngoingDocuments(manuscripts) {
  const ongoingItems = sortArchiveManuscripts(
    manuscripts.filter((manuscript) => ["Em escrita", "Revisão"].includes(manuscript.status))
  ).slice(0, 6);

  // Ocultar se todos os docs em andamento já aparecem na seção de recentes
  const recentIds = new Set([...manuscripts]
    .sort((a, b) => getUpdatedTime(b.updatedAt) - getUpdatedTime(a.updatedAt))
    .slice(0, 4).map(m => m.id));
  const uniqueOngoing = ongoingItems.filter(m => !recentIds.has(m.id));

  if (!uniqueOngoing.length) {
    ongoingDocuments.hidden = true;
    ongoingDocuments.innerHTML = "";
    return;
  }

  ongoingDocuments.hidden = false;
  ongoingDocuments.innerHTML = `
    <div class="archive-strip-heading">
      <p class="eyebrow">Em andamento</p>
    </div>
    <div class="archive-strip-list">
      ${uniqueOngoing
        .map((manuscript) => createCompactDocumentMarkup(manuscript, "ongoing-document", `${manuscript.status} · ${manuscript.progress}%`))
        .join("")}
    </div>
  `;
}

function renderRecentDocuments(manuscripts) {
  const recentItems = [...manuscripts]
    .sort((a, b) => getUpdatedTime(b.updatedAt) - getUpdatedTime(a.updatedAt))
    .slice(0, 4);

  if (!recentItems.length) {
    recentDocuments.hidden = true;
    recentDocuments.innerHTML = "";
    return;
  }

  recentDocuments.hidden = false;
  recentDocuments.innerHTML = `
    <div class="archive-strip-heading">
      <p class="eyebrow">Continue de onde parou</p>
    </div>
    <div class="archive-strip-list">
      ${recentItems.map((manuscript) => createCompactDocumentMarkup(manuscript, "recent-document")).join("")}
    </div>
  `;
}

function createCompactDocumentMarkup(manuscript, className, metaLabel) {
  const type = getArchiveType(manuscript);
  const selected = manuscript.id === state.activeId ? " is-selected" : "";
  const pinned = manuscript.pinned ? " is-pinned" : "";
  const pinLabel = manuscript.pinned ? "Desafixar nota" : "Fixar nota";
  const summary = VeredaArchive.docSummary(manuscript);
  const meta = metaLabel || [type.label, summary || formatUpdatedAt(manuscript.updatedAt)].filter(Boolean).join(" · ");

  return `
    <button class="${className}${selected}${pinned}" type="button" data-archive-select="${manuscript.id}">
      <span class="material-symbols-outlined">${type.icon}</span>
      <strong>${escapeHtml(manuscript.title)}</strong>
      <small>${escapeHtml(meta)}</small>
      <i class="material-symbols-outlined" data-archive-pin="${manuscript.id}" role="button" tabindex="0" aria-label="${pinLabel}" title="${pinLabel}">push_pin</i>
    </button>
  `;
}

function sortArchiveManuscripts(manuscripts) {
  const sortMode = state.archive.sort || "updated";
  return [...manuscripts].sort((a, b) => {
    if (sortMode === "title") {
      return a.title.localeCompare(b.title, "pt-BR");
    }

    if (sortMode === "progress") {
      return Number(b.progress || 0) - Number(a.progress || 0) || a.title.localeCompare(b.title, "pt-BR");
    }

    if (sortMode === "type") {
      return getArchiveType(a).label.localeCompare(getArchiveType(b).label, "pt-BR") || a.title.localeCompare(b.title, "pt-BR");
    }

    if (sortMode === "words") {
      const wc = (m) => {
        const txt = m.text || (m.html || "").replace(/<[^>]+>/g, " ");
        return (txt.trim().split(/\s+/).filter(Boolean).length);
      };
      return wc(b) - wc(a) || a.title.localeCompare(b.title, "pt-BR");
    }

    return getUpdatedTime(b.updatedAt) - getUpdatedTime(a.updatedAt);
  });
}

function createTagMarkup(tags = []) {
  if (!tags.length) {
    return "";
  }

  return `
    <div class="tag-list">
      ${tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderArchiveFilters() {
  const counts = getArchiveTypeCounts();
  const filters = [
    ["all", "Todos", "inventory_2"],
    ...documentTypes.map((type) => [type.id, type.label, type.icon]),
  ];

  archiveFilterBar.innerHTML = filters
    .filter(([id]) => {
      const count = id === "all" ? state.manuscripts.length : counts[id] || 0;
      return count > 0 || state.archive.filter === id;
    })
    .map(([id, label, icon]) => {
      const isActive = state.archive.filter === id ? " is-active" : "";
      const count = id === "all" ? state.manuscripts.length : counts[id] || 0;

      return `
        <button class="archive-filter${isActive}" data-archive-filter="${id}">
          <span class="material-symbols-outlined">${icon}</span>
          ${label}
          <b>${count}</b>
        </button>
      `;
    })
    .join("");
}

const ARCHIVE_STATUSES = ["Em escrita", "Revisão", "Pausado", "Concluído"];

function renderArchiveStatusBar() {
  if (!archiveStatusBar) return;
  const counts = ARCHIVE_STATUSES.reduce((acc, s) => {
    acc[s] = state.manuscripts.filter((m) => m.status === s).length;
    return acc;
  }, {});
  const hasAny = ARCHIVE_STATUSES.some((s) => counts[s] > 0);
  const docs = state.manuscripts.filter((m) => (m.type || "manuscrito") === "manuscrito");
  const totalWords = docs.reduce((sum, m) => {
    const txt = m.text || (m.html || "").replace(/<[^>]+>/g, " ");
    return sum + (txt.trim().split(/\s+/).filter(Boolean).length);
  }, 0);
  const wordStat = totalWords > 0
    ? `<span class="archive-word-total">${totalWords.toLocaleString("pt-BR")} pal. no acervo</span>`
    : "";
  if (!hasAny) { archiveStatusBar.innerHTML = wordStat; return; }
  const activeStatus = state.archive.statusFilter || "all";
  const chips = ARCHIVE_STATUSES
    .filter((s) => counts[s] > 0 || activeStatus === s)
    .map((s) => {
      const isActive = activeStatus === s ? " is-active" : "";
      return `<button class="archive-filter${isActive}" data-archive-status-filter="${escapeHtml(s)}">${escapeHtml(s)} <b>${counts[s]}</b></button>`;
    });
  const allActive = activeStatus === "all" ? " is-active" : "";
  archiveStatusBar.innerHTML = `<button class="archive-filter${allActive}" data-archive-status-filter="all">Todas as situações</button>` + chips.join("") + wordStat;
}

function setArchiveStatusFilter(status) {
  state.archive.statusFilter = status;
  renderProjectGrid();
  persistState("Filtro de situação aplicado");
}

function getArchiveTypeCounts() {
  return state.manuscripts.reduce((counts, manuscript) => {
    const type = getArchiveType(manuscript);
    counts[type.id] = (counts[type.id] || 0) + 1;
    return counts;
  }, {});
}

function getArchiveType(manuscript) {
  const id = manuscript.type || "manuscrito";
  return documentTypes.find((type) => type.id === id) || documentTypes[0];
}

function getChecklistProgress(manuscript) {
  if (!manuscript.templateId) {
    return null;
  }

  const template = VeredaTemplates.getTemplate(manuscript.templateId);
  const analysis = VeredaPrecision.analyze(template, manuscript.text || "");
  const checklist = getChecklistFor(manuscript.id, manuscript.templateId);
  const total = analysis.checks.length;
  const done = analysis.checks.filter((check) => Boolean(checklist[check.label])).length;

  return { done, total };
}

function setArchiveFilter(filter) {
  if (!isArchiveFilterAvailable(filter)) {
    return;
  }

  state.archive.filter = filter;
  renderProjectGrid();
  persistState("Filtro do arquivo aplicado");
}

function isArchiveFilterAvailable(filter) {
  return filter === "all" || documentTypes.some((type) => type.id === filter);
}

function setArchiveSearch(value) {
  state.archive.search = value;
  renderProjectGrid();
  persistState("Busca do arquivo aplicada");
}

function setArchiveSort(value) {
  state.archive.sort = value;
  renderProjectGrid();
  persistState("Ordenação do arquivo aplicada");
}

function searchAll(query) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return state.manuscripts
    .map((manuscript) => {
      const title = manuscript.title || "";
      const text = manuscript.text || "";
      const haystack = normalizeSearch([title, text, manuscript.description, manuscript.kind, getArchiveType(manuscript).label].join(" "));

      if (!haystack.includes(normalizedQuery)) {
        return null;
      }

      return {
        id: manuscript.id,
        title,
        content: createSearchSnippet(text || manuscript.description || title, normalizedQuery),
        type: getArchiveType(manuscript).label,
        updatedAt: manuscript.updatedAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => getUpdatedTime(b.updatedAt) - getUpdatedTime(a.updatedAt))
    .slice(0, 8);
}

function createSearchSnippet(value, normalizedQuery) {
  const cleanValue = String(value || "").replace(/\s+/g, " ").trim();
  const normalizedValue = normalizeSearch(cleanValue);
  const matchIndex = normalizedValue.indexOf(normalizedQuery);
  const start = matchIndex > 40 ? Math.max(0, matchIndex - 60) : 0;
  const snippet = cleanValue.slice(start, start + 200);
  return `${start > 0 ? "... " : ""}${snippet}${cleanValue.length > start + 200 ? " ..." : ""}`;
}

function toggleGlobalSearch() {
  topbarSearch.classList.toggle("is-open");

  if (topbarSearch.classList.contains("is-open")) {
    globalSearchInput.removeAttribute("tabindex");
    globalSearchInput.focus();
    renderGlobalSearchResults(globalSearchInput.value);
  } else {
    closeGlobalSearch();
  }
}

function closeGlobalSearch() {
  topbarSearch.classList.remove("is-open");
  globalSearchResults.hidden = true;
  globalSearchInput.setAttribute("tabindex", "-1");
}

function renderGlobalSearchResults(query) {
  const results = searchAll(query);

  if (!topbarSearch.classList.contains("is-open") || !query.trim()) {
    globalSearchResults.hidden = true;
    globalSearchResults.innerHTML = "";
    return;
  }

  globalSearchResults.hidden = false;

  if (!results.length) {
    globalSearchResults.innerHTML = `<div class="global-search-empty">Nada encontrado no acervo.</div>`;
    return;
  }

  globalSearchResults.innerHTML = results
    .map(
      (result) => `
        <button type="button" data-global-search-result="${result.id}">
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(result.type)} · ${escapeHtml(formatUpdatedAt(result.updatedAt))}</span>
          <small>${escapeHtml(result.content)}</small>
        </button>
      `
    )
    .join("");
}

function openSearchResult(manuscriptId) {
  setActiveManuscript(manuscriptId);
  closeGlobalSearch();
  globalSearchInput.value = "";
}

function togglePinnedManuscript(id) {
  const manuscript = state.manuscripts.find((item) => item.id === id);

  if (!manuscript) {
    return;
  }

  const nextManuscript = VeredaArchive.updateMetadata(manuscript, {
    pinned: !manuscript.pinned,
  });

  updateActiveManuscript(nextManuscript);
  renderProjectGrid();
  renderMetadataForm();
  queueSave();
}

function openArchiveManuscript(id) {
  state.activeId = id;
  syncGuideToManuscript(id);
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  persistState("Manuscrito aberto");
  setView("editor");
  focusEditorOnNavigate();
}

function exportArchiveManuscript(id, format) {
  const manuscript = state.manuscripts.find((item) => item.id === id);

  if (!manuscript) {
    saveStatus.textContent = "Documento não encontrado";
    return;
  }

  try {
    const exportFile = VeredaExport.exportManuscript(manuscript, format);
    downloadFile(exportFile.content, exportFile.filename, exportFile.mimeType);
    saveStatus.textContent = `${manuscript.title} exportado em .${format}`;
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

function duplicateManuscript(id) {
  const manuscript = state.manuscripts.find((item) => item.id === id);

  if (!manuscript) {
    saveStatus.textContent = "Documento não encontrado";
    return;
  }

  const duplicate = VeredaArchive.createManuscript({
    id: `copia-${Date.now()}`,
    title: `Cópia de ${manuscript.title}`,
    text: manuscript.text,
    kind: manuscript.kind,
    status: manuscript.status,
    chapter: manuscript.chapter,
    progress: manuscript.progress,
    description: manuscript.description,
    tags: manuscript.tags,
    type: manuscript.type,
    meta: manuscript.meta,
    templateId: manuscript.templateId,
  });

  state.manuscripts.unshift(duplicate);
  state.activeId = duplicate.id;
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  persistState("Documento duplicado");
  setView("arquivo");
}

function createSearchText(manuscript) {
  const type = getArchiveType(manuscript);
  const metaText = Object.values(manuscript.meta || {})
    .flat()
    .filter(Boolean)
    .join(" ");

  return normalizeSearch(
    [manuscript.title, manuscript.kind, manuscript.status, manuscript.chapter, manuscript.description, manuscript.text, metaText, type.label, ...(manuscript.tags || [])]
      .filter(Boolean)
      .join(" ")
  );
}

function normalizeSearch(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCreatedAt(createdAt) {
  if (!createdAt) return null;
  try {
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return null;
    const diffMs = Date.now() - created.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 0) return null;

    const monthStr = created.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    if (diffDays < 1) return "Criado hoje";
    if (diffDays < 7) {
      return `Criado há ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
    }

    const years = Math.floor(diffDays / 365);
    const remainMonths = Math.floor((diffDays % 365) / 30);
    const totalMonths = Math.floor(diffDays / 30);

    let ageStr;
    if (years >= 1) {
      ageStr = `${years} ${years === 1 ? "ano" : "anos"}`;
      if (remainMonths > 0) {
        ageStr += ` e ${remainMonths} ${remainMonths === 1 ? "mês" : "meses"}`;
      }
    } else if (totalMonths >= 1) {
      ageStr = `${totalMonths} ${totalMonths === 1 ? "mês" : "meses"}`;
    } else {
      const weeks = Math.floor(diffDays / 7);
      ageStr = `${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    }

    return `Criado em ${monthStr} · existe há ${ageStr}`;
  } catch {
    return null;
  }
}

// ── Input listeners do Arquivo ────────────────────────────────────────────────
if (archiveSearch) archiveSearch.addEventListener("input", () => setArchiveSearch(archiveSearch.value));
if (archiveSort)   archiveSort.addEventListener("change", () => setArchiveSort(archiveSort.value));
if (globalSearchInput) {
  globalSearchInput.addEventListener("input", () => renderGlobalSearchResults(globalSearchInput.value));
  globalSearchInput.addEventListener("keydown", (event) => { if (event.key === "Escape") closeGlobalSearch(); });
}
