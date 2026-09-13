(function () {
  'use strict';
  var E = window.Escr, vault = E.createVault(E.knowledge), storage = null, archive = null;
  var doc = E.freshDocument(), dirty = false, timer = null, pendingAnalysis = null, snapshot = '', activeLens = '', composing = false, audio = null;
  var title = byId('titulo'), manuscript = byId('manuscrito'), saveStatus = byId('save-status'), analysisStatus = byId('analysis-status');
  var activePanel = '', panelTrigger = null, panelIds = ['oficina', 'acervo', 'mesa', 'utilidades', 'focus-pause'], panelToggles = ['examinar-toggle', 'acervo-toggle', 'mesa-toggle', 'start-pomodoro', 'pomodoro-task'];
  var projectScope = false, readingSize = 21;
  var restrictedPaste = false, internalClipboard = '', copiedSelection = null, analysisRange = null;
  var trashView = false, sessionReady = false, sessionTimer = null, deleteTarget = null, sessionKey = 'escrevaral.astra.session.v1';
  var immersion = false, machineEnabled = false, machinePreviousFocus = false, machineTimer = null, machineFeedTimer = null, machineCarriage = 0, machineLastLength = 0, machinePendingStrike = false;
  var focusEnabled = true, focusTimer = null, focusMeasure = null, typewriterTimer = null;
  var lensButtons = document.querySelectorAll('[data-lens]');
  var navDay = E.noteDateKey(doc), navMonth = navDay.slice(0, 7), searchTimer = null, timelineTotal = 0, timelineUnreadable = 0;
  var timelineEntries = [], timelineCount = 40, timelineRendering = false, months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function byId(id) { return document.getElementById(id); }
  function text(node, value) { node.textContent = value; }
  function listen(node, event, fn) { node.addEventListener(event, fn, false); }
  function paragraph(parent, value, className) { var p = document.createElement('p'); if (className) { p.className = className; } text(p, value); parent.appendChild(p); return p; }
  function button(parent, label, fn) { var b = document.createElement('button'); b.type = 'button'; text(b, label); listen(b, 'click', fn); parent.appendChild(b); return b; }
  function message(value) { text(saveStatus, value); text(byId('cabinet-status'), value); text(byId('panel-status'), value); if (activePanel === 'acervo') { text(byId('archive-status'), value); } }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function timeLabel(date) { return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()); }
  function noteDate(entry) { return entry.created || entry.updated; }
  function metadata(entry) { return { id: entry.id, noteId: entry.noteId || entry.id, title: entry.title, text: entry.text || '', project: entry.project || '', created: noteDate(entry), updated: entry.updated, createdApproximate: !entry.created || !!entry.createdApproximate }; }
  function monthLabel(key) { return months[Number(key.slice(5, 7)) - 1] + ' ' + key.slice(0, 4); }
  function dayLabel(key) { var d = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))); return d.getDate() + ' · ' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][d.getDay()]; }
  function openNote(entry) {
    if (entry.id === doc.id || !persist()) { return; }
    try {
      var next = archive && archive.get(entry.id);
      if (!next) { renderTimeline(true); message('Esta nota mudou. Abra a versão guardada no acervo.'); return; }
      loadDocument(next); collapseTimeline(); showPanel('oficina', 'examinar-toggle', false);
      try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
    } catch (e) { message('Não foi possível abrir esta nota. Sua escrita permanece aqui.'); }
  }
  function browseDate(month, day) {
    projectScope = false; navMonth = month; navDay = day; timelineCount = 40; byId('timeline-list').scrollTop = 0; renderTimeline(false);
  }
  function renderTimeline(refresh, previousId, reveal) {
    var list = byId('timeline-list'), date = new Date(noteDate(doc)), active = null, oldScroll = list.scrollTop, result;
    timelineRendering = true;
    text(byId('manuscript-date'), timeLabel(date) + ' · ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear());
    byId('manuscript-date').setAttribute('datetime', noteDate(doc));
    byId('manuscript-date').setAttribute('aria-label', doc.created && !doc.createdApproximate ? 'Data de criação da folha' : 'Data preservada da folha antiga; criação desconhecida');
    if (refresh && archive) {
      try { result = archive.list(); timelineEntries = result.documents.map(metadata); timelineUnreadable = result.unreadable; } catch (ignore) { timelineUnreadable = 1; }
    }
    timelineEntries = timelineEntries.filter(function (entry) { return entry.id !== doc.id && entry.id !== previousId; });
    var current = metadata(doc); current.title = title.value; current.text = manuscript.value; timelineEntries.push(current);
    var inProject = projectScope && !byId('note-search').value;
    var entries = inProject ? timelineEntries.filter(function (entry) { return (entry.project || '') === (doc.project || ''); }) : timelineEntries;
    var model = E.browseNotes(entries, { month: navMonth, day: navDay, query: byId('note-search').value });
    if (inProject) { model.notes = entries.slice().sort(function (a, b) { return a.created < b.created ? -1 : a.created > b.created ? 1 : 0; }); }
    text(byId('desk-project'), doc.project || 'Folhas avulsas');
    byId('scope-project').setAttribute('aria-pressed', projectScope ? 'true' : 'false');
    byId('scope-dates').setAttribute('aria-pressed', projectScope ? 'false' : 'true');
    var path = byId('date-path'); path.textContent = '';
    byId('clear-search').hidden = !byId('note-search').value;
    if (inProject) { paragraph(path, doc.project || 'Folhas avulsas', 'path-label'); }
    else if (model.query) { paragraph(path, 'Resultados em todas as notas', 'path-label'); }
    else {
      button(path, 'Meses', function () { browseDate('', ''); });
      if (navMonth) { button(path, monthLabel(navMonth), function () { browseDate(navMonth, ''); }); }
      if (navDay) { var day = paragraph(path, dayLabel(navDay), 'path-label'); day.setAttribute('aria-current', 'page'); }
    }
    list.textContent = '';
    var groups = !inProject && !model.query && !navDay ? (navMonth ? model.days : model.months) : null;
    timelineTotal = groups ? 0 : model.notes.length;
    if (groups) {
      groups.forEach(function (group) {
        var b = button(list, '', function () { if (navMonth) { browseDate(navMonth, group.key); } else { browseDate(group.key, ''); } });
        b.className = 'date-folder';
        noteLabel(b, navMonth ? dayLabel(group.key) : monthLabel(group.key), group.count + (group.count === 1 ? ' nota' : ' notas'));
      });
      text(byId('navigator-status'), groups.length ? (navMonth ? 'Escolha um dia' : 'Escolha um mês') : 'Nenhuma nota nesta data.');
    } else {
      if (reveal) { model.notes.forEach(function (entry, i) { if (entry.id === doc.id) { timelineCount = Math.max(timelineCount, model.notes.length - i); } }); }
      var visible = model.notes.slice(-timelineCount);
      if (visible.length < model.notes.length) { var older = button(list, 'Anteriores ↑', olderNotes); older.className = 'timeline-older'; }
      visible.forEach(function (entry) {
        var when = new Date(entry.created), b = button(list, '', function () { openNote(entry); });
        noteLabel(b, entry.title, timeLabel(when) + (model.query ? ' · ' + when.toLocaleDateString('pt-BR') : ''));
        if (entry.id === doc.id) { active = b; }
        b.className = 'timeline-entry'; b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false');
        b.setAttribute('aria-label', (entry.title || 'Sem título') + ', ' + when.toLocaleDateString('pt-BR') + ', ' + timeLabel(when) + (entry.createdApproximate ? '; data antiga preservada, criação desconhecida' : ''));
        b.setAttribute('title', entry.title || 'Sem título');
      });
      text(byId('navigator-status'), model.notes.length ? model.notes.length + (model.notes.length === 1 ? ' nota' : ' notas') : model.query ? 'Nenhuma nota encontrada.' : 'Nenhuma nota neste dia.');
    }
    if (timelineUnreadable) { text(byId('navigator-status'), byId('navigator-status').textContent + ' Algumas notas não puderam ser lidas.'); }
    list.scrollTop = reveal && active ? Math.max(0, active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2) : oldScroll;
    timelineRendering = false;
  }
  function olderNotes() {
    if (timelineRendering || timelineCount >= timelineTotal) { return; }
    var list = byId('timeline-list'), oldHeight = list.scrollHeight, oldScroll = list.scrollTop;
    timelineCount += 40; renderTimeline(false);
    list.scrollTop = oldScroll + list.scrollHeight - oldHeight;
  }
  function persist() {
    window.clearTimeout(timer);
    if (!dirty) { return true; }
    doc.title = title.value; doc.text = manuscript.value;
    if (!archive) { message('Sem gravação neste navegador. Baixe uma cópia em Ajustes.'); return false; }
    try {
      var previousId = doc.id, saved = archive.save(doc); doc = saved.document; dirty = false;
      message(saved.conflict ? 'Outra versão foi preservada no acervo.' : 'Guardado neste aparelho.');
      try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Só a preferência de abertura falhou. */ }
      if (!byId('acervo').hidden) { renderArchive(); }
      renderTimeline(false, previousId); refreshCounts(); saveSession();
      return true;
    } catch (e) { message('Não foi possível guardar. Seu texto está na folha; baixe uma cópia em Ajustes.'); return false; }
  }
  function invalidate() {
    if (pendingAnalysis === null && !activeLens && !byId('findings').childNodes.length) { return; }
    window.clearTimeout(pendingAnalysis); pendingAnalysis = null;
    byId('findings').textContent = ''; snapshot = ''; activeLens = '';
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = false; lensButtons[i].setAttribute('aria-pressed', 'false'); }
    text(analysisStatus, 'O manuscrito mudou. Escolha uma lente quando quiser examinar de novo.');
  }
  function changed() {
    growManuscript();
    dirty = true; invalidate(); text(byId('desk-count-status'), 'Texto alterado · contagem será atualizada ao guardar.'); window.clearTimeout(timer);
    if (!composing) { timer = window.setTimeout(persist, 1000); }
  }
  function noteLabel(parent, name, when) {
    var label = document.createElement('span'), stamp = document.createElement('small');
    label.className = 'note-name'; stamp.className = 'note-time';
    text(label, name || 'Sem título'); text(stamp, when); parent.appendChild(label); parent.appendChild(stamp);
  }
  function paragraphBounds(value, start, end) {
    start = Math.max(0, Math.min(value.length, start || 0)); end = Math.max(start, Math.min(value.length, end || start));
    var left = start ? value.lastIndexOf('\n', start - 1) + 1 : 0, right = value.indexOf('\n', end);
    return { start: left, end: right === -1 ? value.length : right };
  }
  function textPosition(offset) {
    var mirror = document.createElement('div'), marker = document.createElement('span'), style = window.getComputedStyle(manuscript);
    mirror.className = 'editor-measure'; mirror.style.width = manuscript.clientWidth + 'px';
    mirror.style.font = style.font; mirror.style.fontFamily = style.fontFamily; mirror.style.fontSize = style.fontSize;
    mirror.style.lineHeight = style.lineHeight; mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.paddingTop = style.paddingTop; mirror.style.paddingBottom = style.paddingBottom;
    var line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.7;
    marker.style.display = 'inline-block'; marker.style.width = '0'; marker.style.height = line + 'px'; marker.style.verticalAlign = 'top';
    text(mirror, manuscript.value.slice(0, offset)); text(marker, '\u200b');
    mirror.appendChild(marker); document.body.appendChild(mirror);
    var top = marker.offsetTop, left = marker.offsetLeft;
    document.body.removeChild(mirror); return { top: top, left: left, line: line };
  }
  function updateFocus() {
    if (!window.getComputedStyle || !manuscript.style) { return; }
    var before = byId('focus-before'), after = byId('focus-after');
    if (!focusEnabled || !manuscript.value) { before.hidden = true; after.hidden = true; return; }
    /* A composição tem texto/seleção provisórios. Conservar a geometria estável,
       sem apagar as máscaras; a rolagem ainda desloca essa mesma geometria. */
    if (!composing) {
      var bounds = paragraphBounds(manuscript.value, manuscript.selectionStart, manuscript.selectionEnd);
      if (!focusMeasure || focusMeasure.value !== manuscript.value || focusMeasure.width !== manuscript.clientWidth || focusMeasure.start !== bounds.start || focusMeasure.end !== bounds.end) {
        focusMeasure = { value: manuscript.value, width: manuscript.clientWidth, start: bounds.start, end: bounds.end, first: textPosition(bounds.start), last: textPosition(bounds.end) };
      }
    }
    if (!focusMeasure) { return; }
    var first = focusMeasure.first, last = focusMeasure.last, height = manuscript.clientHeight;
    var top = Math.max(0, Math.min(height, first.top - manuscript.scrollTop));
    var bottom = Math.max(0, Math.min(height, last.top + last.line - manuscript.scrollTop));
    before.style.height = top + 'px'; after.style.top = bottom + 'px';
    before.hidden = top === 0; after.hidden = bottom >= height;
  }
  function growManuscript() {
    if (!window.getComputedStyle) { return; }
    window.clearTimeout(focusTimer); focusTimer = window.setTimeout(updateFocus, 40);
  }
  function cancelTypewriter() { window.clearTimeout(typewriterTimer); typewriterTimer = null; }
  function typingLineTarget() { return manuscript.clientHeight * 0.42; }
  function typewriterInsets() {
    if (!window.getComputedStyle || !manuscript.style || !manuscript.clientHeight) { return; }
    var style = window.getComputedStyle(manuscript), line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.7;
    var target = typingLineTarget();
    manuscript.style.paddingTop = Math.max(0, target - line / 2) + 'px';
    manuscript.style.paddingBottom = Math.max(0, manuscript.clientHeight - target - line / 2) + 'px';
    focusMeasure = null;
  }
  function centerTypingLine() {
    typewriterTimer = null;
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript || manuscript.selectionStart !== manuscript.selectionEnd) { return; }
    var position = textPosition(manuscript.selectionStart);
    manuscript.scrollTop = Math.max(0, position.top + position.line / 2 - typingLineTarget());
    updateFocus();
    if (machineEnabled) { aimMachineStrike(position); }
  }
  function followTyping() {
    cancelTypewriter();
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript) { return; }
    typewriterTimer = window.setTimeout(centerTypingLine, 20);
  }
  function captureSelection() {
    if (composing || document.activeElement !== manuscript) { return; }
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) { return; }
    internalClipboard = manuscript.value.slice(start, end);
    copiedSelection = { documentId: doc.noteId || doc.id, text: manuscript.value, start: start, end: end };
    byId('selection-tools').hidden = false; text(byId('clipboard-status'), 'Copiado no Escrevaral');
  }
  function pasteInternal() {
    if (composing || !internalClipboard) { return; }
    var start = manuscript.selectionStart || 0, end = manuscript.selectionEnd || start;
    manuscript.value = manuscript.value.slice(0, start) + internalClipboard + manuscript.value.slice(end);
    manuscript.setSelectionRange(start + internalClipboard.length, start + internalClipboard.length); manuscript.focus(); changed(); queueSession();
  }
  function toggleStart(open) {
    if (open) { closePanels(false); }
    byId('start-menu').hidden = !open;
    byId('os-start').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { byId('start-projects').focus(); }
  }
  function saveSession() {
    if (!sessionReady || !storage) { return; }
    try {
      storage.setItem(sessionKey, JSON.stringify({ version: 1, view: cabinetOpen ? 'gabinete' : 'mesa', documentId: doc.noteId || doc.id,
        recordId: doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop || 0,
        project: cabinetProject, panel: activePanel, immersion: immersion, month: navMonth, day: navDay, projectScope: projectScope,
        search: byId('cabinet-search').value, noteSearch: byId('note-search').value,
        windowHidden: byId('cabinet-window').hidden, maximized: byId('cabinet-window').getAttribute('data-maximized') === 'true',
        left: byId('cabinet-window').style.left || '', top: byId('cabinet-window').style.top || '' }));
    } catch (e) { message('O estado da tela não foi guardado. Confira sua cópia do acervo.'); }
  }
  function checkpoint() { if (composing) { return false; } window.clearTimeout(sessionTimer); var ok = persist(); if (ok) { saveSession(); } return ok; }
  function queueSession() {
    if (!sessionReady || composing) { return; }
    window.clearTimeout(sessionTimer); sessionTimer = window.setTimeout(checkpoint, 350);
  }
  function restoreSession() {
    if (!storage) { return; }
    try {
      var state = JSON.parse(storage.getItem(sessionKey) || 'null'), saved;
      if (!state || state.version !== 1) { return; }
      saved = typeof state.recordId === 'string' ? archive.get(state.recordId) : null;
      if (saved && !saved.trashed && saved.kind !== 'reminder') { loadDocument(saved); }
      cabinetProject = typeof state.project === 'string' ? projectName(state.project) : null;
      byId('cabinet-search').value = typeof state.search === 'string' ? state.search.slice(0, 1000) : '';
      byId('note-search').value = typeof state.noteSearch === 'string' ? state.noteSearch.slice(0, 1000) : '';
      if (/^\d{4}-\d{2}$/.test(state.month)) { navMonth = state.month; }
      if (/^\d{4}-\d{2}-\d{2}$/.test(state.day)) { navDay = state.day; }
      projectScope = state.projectScope === true; renderCabinet(); renderTimeline(false);
      if (state.view === 'mesa' && state.documentId === (doc.noteId || doc.id)) {
        enterDesk(false);
        if (state.immersion === true) { immersion = true; document.body.setAttribute('data-immersion', 'true'); byId('immersion-toggle').setAttribute('aria-pressed', 'true'); byId('leave-focus').hidden = false; sizeWorkspace(); }
        var start = typeof state.start === 'number' && isFinite(state.start) ? Math.max(0, Math.min(doc.text.length, Math.floor(state.start))) : 0;
        var end = typeof state.end === 'number' && isFinite(state.end) ? Math.max(start, Math.min(doc.text.length, Math.floor(state.end))) : start;
        manuscript.setSelectionRange(start, end); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
      } else {
        desktopWindow(state.windowHidden ? 'minimize' : 'open', false);
        setDesktopMaximized(state.maximized !== false);
        if (state.maximized === false && window.innerWidth > 760) {
          if (/^\d+(\.\d+)?px$/.test(state.left)) { byId('cabinet-window').style.left = Math.min(parseFloat(state.left), Math.max(0, window.innerWidth - 640)) + 'px'; byId('cabinet-window').style.right = 'auto'; }
          if (/^\d+(\.\d+)?px$/.test(state.top)) { byId('cabinet-window').style.top = Math.min(parseFloat(state.top), Math.max(0, window.innerHeight - 280)) + 'px'; }
        }
      }
      if (['oficina', 'acervo', 'mesa'].indexOf(state.panel) !== -1) { if (state.panel === 'acervo') { renderArchive(); } showPanel(state.panel, panelToggles[panelIds.indexOf(state.panel)], true); }
      if (state.documentId === (doc.noteId || doc.id)) {
        var savedStart = typeof state.start === 'number' && isFinite(state.start) ? Math.max(0, Math.min(doc.text.length, Math.floor(state.start))) : 0;
        var savedEnd = typeof state.end === 'number' && isFinite(state.end) ? Math.max(savedStart, Math.min(doc.text.length, Math.floor(state.end))) : savedStart;
        manuscript.setSelectionRange(savedStart, savedEnd); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
        cabinetSelection = { noteId: doc.noteId || doc.id, start: savedStart, end: savedEnd, scroll: manuscript.scrollTop };
      }
      updatePath();
    } catch (e) { message('Não foi possível retomar a tela anterior. O acervo foi preservado.'); }
  }
  function renderReminders() {
    var list = byId('reminder-list'); list.textContent = '';
    if (!archive) { return; }
    try {
      archive.list(true).documents.filter(function (entry) { return entry.kind === 'reminder' && !entry.trashed; }).forEach(function (entry) {
        var card = document.createElement('div'), field = document.createElement('textarea'), saved = entry;
        card.className = 'desktop-reminder'; field.value = entry.text; field.setAttribute('aria-label', 'Lembrete rápido'); field.setAttribute('maxlength', '2000');
        field.rows = 4; card.appendChild(field);
        listen(field, 'input', function () {
          var next = JSON.parse(JSON.stringify(saved)); next.text = field.value; next.title = field.value.split(/\r?\n/)[0].slice(0, 60) || 'Lembrete';
          try { saved = archive.save(next).document; text(byId('reminder-status'), 'Lembrete guardado.'); }
          catch (e) { text(byId('reminder-status'), 'Não foi possível guardar. Copie este lembrete antes de sair.'); }
        });
        var discard = button(card, '', function () { trashEntry(saved); });
        discard.className = 'reminder-trash'; discard.setAttribute('aria-label', 'Mover lembrete para a lixeira'); discard.setAttribute('title', 'Mover para a lixeira');
        discard.innerHTML = '<svg class="reminder-trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>'; list.appendChild(card);
      });
    } catch (e) { text(byId('reminder-status'), 'Não foi possível ler os lembretes.'); }
  }
  function trashEntry(entry) {
    if (!archive || !persist()) { return; }
    var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
    try {
      archive.trash(isCurrent ? doc : entry);
      if (isCurrent) { var next = archive.list().documents[0] || E.freshDocument(); loadDocument(next); cabinetSelection = null; }
      renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); saveSession(); message('Movido para a lixeira. Você pode restaurar pelo menu Início.');
    } catch (e) { message('Não foi possível mover para a lixeira. A folha foi preservada.'); }
  }
  function cancelDelete() { deleteTarget = null; byId('delete-confirm').hidden = true; byId('trash-toggle').focus(); }
  function askDelete(entry) {
    deleteTarget = entry; byId('delete-confirm').hidden = false;
    text(byId('delete-message'), '“' + (entry.title || 'Sem título') + '” será apagada definitivamente do acervo deste aparelho. Não será possível restaurar esta cópia. Arquivos exportados e versões em outras abas não são apagados.');
    byId('delete-cancel').focus();
  }

  function updatePath() {
    var project = cabinetOpen ? cabinetProject : projectName(doc.project), currentId, names = { oficina: 'Examinar', acervo: 'Acervo', mesa: 'Ajustes' };
    byId('path-project').hidden = byId('path-project-separator').hidden = project === null;
    text(byId('path-project'), project || 'Folhas avulsas');
    byId('path-project').setAttribute('title', project || 'Folhas avulsas');
    byId('path-document').hidden = byId('path-document-separator').hidden = cabinetOpen;
    text(byId('path-document'), title.value || 'Sem título');
    byId('path-document').setAttribute('title', title.value || 'Sem título');
    byId('path-panel').hidden = byId('path-panel-separator').hidden = !activePanel;
    text(byId('path-panel'), activePanel === 'utilidades' ? byId('utility-heading').textContent : activePanel === 'focus-pause' ? 'Pausa' : names[activePanel] || '');
    currentId = activePanel ? 'path-panel' : !cabinetOpen ? 'path-document' : project !== null ? 'path-project' : 'path-projects';
    ['path-home', 'path-projects', 'path-project', 'path-document', 'path-panel'].forEach(function (id) {
      byId(id).removeAttribute('aria-current'); if (id === currentId) { byId(id).setAttribute('aria-current', 'location'); }
    });
  }
  function pathToProjects(all) {
    var selected = cabinetOpen ? cabinetProject : projectName(doc.project);
    if (!openCabinet(false)) { return; }
    cabinetProject = all ? null : selected; byId('cabinet-search').value = ''; renderCabinet();
  }
  function sizeWorkspace() {
    var area = byId('writing-space');
    if (area.style && window.innerHeight) {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      area.style.height = Math.max(0, height - 84) + 'px'; byId('gabinete').style.height = Math.max(0, height - 84) + 'px';
      byId('machine-shell').style.height = height + 'px';
      document.body.setAttribute('data-viewport', height < 360 ? 'small' : height < 480 ? 'compact' : 'full');
      var browser = byId('note-browser');
      if (browser.style) { browser.style.height = window.innerWidth <= 760 && height < 480 ? Math.max(84, height - 108) + 'px' : ''; }
    }
    typewriterInsets(); growManuscript(); followTyping(); renderTimeline(false, null, true);
  }
  function revealSelection(start, end) {
    returnToWriting(); manuscript.setSelectionRange(start, end);
    if (!window.getComputedStyle) { return; }
    manuscript.scrollTop = Math.max(0, textPosition(start).top - manuscript.clientHeight / 3); updateFocus();
  }
  function collapseTimeline() {
    byId('desk-documents').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'false');
  }
  function closePanels(restore) {
    var trigger = panelTrigger;
    if (trigger && trigger.setAttribute) { trigger.setAttribute('aria-expanded', 'false'); }
    panelIds.forEach(function (id, i) { byId(id).hidden = true; byId(panelToggles[i]).setAttribute('aria-expanded', 'false'); });
    activePanel = ''; panelTrigger = null; updatePath();
    byId('panel-backdrop').hidden = true; document.body.setAttribute('data-panel', 'closed');
    byId('delete-confirm').hidden = true; deleteTarget = null;
    byId('writing-space').removeAttribute('aria-hidden'); byId('gabinete').removeAttribute('aria-hidden');
    if (restore && trigger && trigger.focus) { if (/^start-/.test(trigger.id || '') && byId('start-menu').hidden) { byId('os-start').focus(); } else { trigger.focus(); } } queueSession();
  }
  function showPanel(id, toggle, open) {
    if (!open) { if (activePanel === id) { closePanels(true); } return; }
    closePanels(false); collapseTimeline();
    panelTrigger = byId(toggle); activePanel = id; text(byId('panel-status'), '');
    byId(id).hidden = false; byId(toggle).setAttribute('aria-expanded', 'true');
    byId('panel-backdrop').hidden = false; document.body.setAttribute('data-panel', 'open');
    byId(id).focus(); byId('writing-space').setAttribute('aria-hidden', 'true'); byId('gabinete').setAttribute('aria-hidden', 'true');
    if (id === 'mesa') { byId('note-project').value = projectName(doc.project); }
    updatePath(); queueSession();
  }
  function setImmersion(enabled) {
    var start = manuscript.selectionStart, end = manuscript.selectionEnd, scroll = manuscript.scrollTop;
    var oldInset = manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0;
    cancelTypewriter(); closePanels(false); collapseTimeline();
    document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false');
    immersion = enabled; document.body.setAttribute('data-immersion', enabled ? 'true' : 'false');
    byId('immersion-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    byId('leave-focus').hidden = !enabled;
    manuscript.focus(); sizeWorkspace();
    if (typeof start === 'number') { manuscript.setSelectionRange(start, end); }
    manuscript.scrollTop = Math.max(0, scroll + (manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0) - oldInset);
    growManuscript();
  }
  function stopMachineStrike() {
    window.clearTimeout(machineTimer); machineTimer = null; machinePendingStrike = false;
    byId('machine-hammer').setAttribute('data-strike', 'false');
  }
  function aimMachineStrike(position) {
    if (!manuscript.getBoundingClientRect || !byId('machine-shell').getBoundingClientRect) { return; }
    var rect = manuscript.getBoundingClientRect(), shell = byId('machine-shell').getBoundingClientRect();
    var x = rect.left + (position.left || 0) - (manuscript.scrollLeft || 0) - shell.left;
    var y = rect.top + position.top - manuscript.scrollTop + position.line / 2 - shell.top;
    var height = shell.bottom - shell.top, hammer = byId('machine-hammer');
    if (y < 0 || y > height - 12 || x < 0 || x > shell.right - shell.left) { stopMachineStrike(); return; }
    hammer.style.left = x + 'px'; hammer.style.top = y + 'px'; hammer.style.height = Math.max(0, height - 12 - y) + 'px';
    if (machinePendingStrike) { machinePendingStrike = false; machineStrike(true); }
  }
  function machineStrike(ready) {
    if (!machineEnabled || composing || document.hidden || machineTimer !== null) { return; }
    if (!ready && window.getComputedStyle && manuscript.getBoundingClientRect) { machinePendingStrike = true; return; }
    byId('machine-hammer').setAttribute('data-strike', 'true');
    machineTimer = window.setTimeout(stopMachineStrike, 90);
  }
  function paintMachineCarriage(feed) {
    var paperTransform = 'translate(' + (-machineCarriage) + 'px,' + (feed ? -3 : 0) + 'px)';
    var paper = byId('writing-paper'), platen = byId('machine-platen');
    paper.style.webkitTransform = paperTransform; paper.style.transform = paperTransform;
    platen.style.webkitTransform = 'translateX(' + (-machineCarriage) + 'px)'; platen.style.transform = platen.style.webkitTransform;
    platen.setAttribute('data-feed', feed ? 'true' : 'false');
  }
  function finishMachineFeed() {
    window.clearTimeout(machineFeedTimer); machineFeedTimer = null; paintMachineCarriage(false);
  }
  function machineInput(event) {
    if (!machineEnabled || composing || document.hidden) { return; }
    var delta = manuscript.value.length - machineLastLength, caret = manuscript.selectionStart || 0;
    var newline = (delta === 1 && manuscript.value.charAt(caret - 1) === '\n') ||
      (event && (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph'));
    machineLastLength = manuscript.value.length;
    if (newline) {
      machineCarriage = 0; window.clearTimeout(machineFeedTimer); paintMachineCarriage(true);
      machineFeedTimer = window.setTimeout(finishMachineFeed, 120);
    } else {
      machineCarriage = Math.max(0, Math.min(6, machineCarriage + (delta > 0 ? 0.75 : delta < 0 ? -0.75 : 0)));
      paintMachineCarriage(false);
    }
    machineStrike();
  }
  function setMachine(enabled) {
    if (enabled === machineEnabled) { return; }
    if (enabled) { machinePreviousFocus = immersion; }
    machineEnabled = enabled; stopMachineStrike(); machineCarriage = 0; machineLastLength = manuscript.value.length; finishMachineFeed();
    document.body.setAttribute('data-machine', enabled ? 'true' : 'false');
    byId('machine-shell').hidden = !enabled;
    byId('machine-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    text(byId('machine-toggle'), enabled ? 'Desativar' : 'Ativar');
    byId('leave-focus').setAttribute('aria-label', enabled ? 'Sair da máquina antiga' : 'Sair do modo foco');
    byId('leave-focus').setAttribute('title', enabled ? 'Sair da máquina antiga (Esc)' : 'Sair do foco (Esc)');
    if (!enabled) {
      byId('writing-paper').style.transform = ''; byId('writing-paper').style.webkitTransform = '';
      byId('machine-platen').style.transform = ''; byId('machine-platen').style.webkitTransform = '';
    }
    setImmersion(enabled || machinePreviousFocus);
  }
  function leaveImmersion() { if (machineEnabled) { setMachine(false); } else { setImmersion(false); } }
  function preparePrint() {
    text(byId('print-title'), title.value); byId('print-title').hidden = !title.value;
    text(byId('print-text'), manuscript.value);
  }
  function finishPrint() {
    text(byId('print-title'), ''); text(byId('print-text'), '');
  }
  function returnToWriting() { if (cabinetOpen) { enterDesk(); } closePanels(false); collapseTimeline(); manuscript.focus(); }
  function loadDocument(next) {
    analysisRange = null; copiedSelection = null; byId('selection-tools').hidden = true;
    doc = next; navDay = E.noteDateKey(doc); navMonth = navDay.slice(0, 7); timelineCount = 40; title.value = doc.title; manuscript.value = doc.text; dirty = false; manuscript.scrollTop = 0; manuscript.setSelectionRange(0, 0); growManuscript();
    invalidate(); text(analysisStatus, 'Nenhuma análise iniciada.');
    byId('reset-dismissed').hidden = !doc.dismissed.length;
    message(doc.revision ? 'Guardado neste aparelho.' : 'A folha é sua.'); updatePath();
    renderTimeline(true, null, true); refreshCounts();
  }
  function renderArchive() {
    var list = byId('document-list'); list.textContent = '';
    if (!archive) { text(byId('archive-status'), 'O acervo não está disponível. Sua folha continua aberta.'); return; }
    try {
      var result = archive.list(trashView);
      if (trashView) { result.documents = result.documents.filter(function (entry) { return !!entry.trashed; }); }
      text(byId('acervo-heading'), trashView ? 'Lixeira' : 'Acervo');
      text(byId('trash-toggle'), trashView ? 'Voltar ao acervo' : 'Lixeira'); byId('trash-toggle').setAttribute('aria-pressed', trashView ? 'true' : 'false');
      text(byId('archive-status'), result.unreadable ? 'Algumas folhas não puderam ser lidas. Os registros originais foram preservados.' : result.documents.length ? '' : 'Sua primeira folha começa aqui.');
      result.documents.forEach(function (entry) {
        var li = document.createElement('li');
        if (trashView) {
          paragraph(li, entry.title || (entry.kind === 'reminder' ? 'Lembrete' : 'Sem título'));
          button(li, 'Restaurar', function () { try { archive.trash(entry, false); renderArchive(); renderReminders(); renderCabinet(); message('Restaurado.'); } catch (e) { message('Não foi possível restaurar. A cópia permanece na lixeira.'); } });
          button(li, 'Excluir definitivamente', function () { askDelete(entry); }); list.appendChild(li); return;
        }
        var b = button(li, '', function () {
          var isCurrent = entry.id === doc.id;
          if (!persist()) { return; }
          loadDocument(isCurrent ? doc : entry); showPanel('acervo', 'acervo-toggle', false);
          try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
          enterDesk(); message('Folha aberta.');
        });
        noteLabel(b, entry.title, timeLabel(new Date(noteDate(entry))) + ' · ' + new Date(noteDate(entry)).toLocaleDateString('pt-BR'));
        b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false'); button(li, 'Mover para a lixeira', function () { trashEntry(entry); }); list.appendChild(li);
      });
    } catch (e) { text(byId('archive-status'), 'Não foi possível ler o acervo. Nenhum registro foi alterado.'); }
  }
  function findingKey(f) { return f.id + '|' + f.snippet; }
  function renderResult(result) {
    var list = byId('findings'), visible = 0; list.textContent = '';
    result.findings.forEach(function (f) {
      if (doc.dismissed.indexOf(findingKey(f)) !== -1) { return; }
      visible += 1;
      var li = document.createElement('li'); li.className = 'finding';
      paragraph(li, f.id + ' · ' + f.severity + ' · confiança ' + f.confidence, 'meta');
      var heading = document.createElement('h3'); text(heading, f.message); li.appendChild(heading);
      var quote = document.createElement('blockquote'); text(quote, snapshot.slice(Math.max(0, f.start - 40), Math.min(snapshot.length, f.end + 40))); li.appendChild(quote);
      var details = document.createElement('div'); details.className = 'evidence'; details.hidden = true;
      ['observation', 'interpretation', 'ambiguity', 'limit'].forEach(function (key, i) { paragraph(details, ['Observação: ', 'Interpretação: ', 'Ambiguidade: ', 'Limite: '][i] + f.evidence[key]); });
      paragraph(details, 'Referência: ' + f.evidence.source.title + '. A consulta desta lente usa somente a base guardada na mesa.');
      var detailButton = button(li, 'Ver evidência', function () { details.hidden = !details.hidden; detailButton.setAttribute('aria-expanded', details.hidden ? 'false' : 'true'); text(detailButton, details.hidden ? 'Ver evidência' : 'Fechar evidência'); });
      detailButton.setAttribute('aria-expanded', 'false');
      button(li, 'Ver na folha', function () { if (snapshot !== manuscript.value) { invalidate(); return; } revealSelection(f.start, f.end); });
      button(li, 'Manter minha escolha', function () {
        if (snapshot !== manuscript.value) { invalidate(); return; }
        doc.dismissed.push(findingKey(f)); dirty = true; persist(); renderResult(result);
        byId('reset-dismissed').focus();
      });
      li.appendChild(details); list.appendChild(li);
    });
    text(analysisStatus, (visible ? visible + (visible === 1 ? ' observação para você examinar.' : ' observações para você examinar.') : 'Nenhum apontamento novo nesta base limitada.') + (result.limited ? ' A leitura foi limitada aos primeiros 100 apontamentos encontrados.' : ''));
    if (result.status === 'insuficiente') { text(analysisStatus, result.assessment.reason); }
    text(byId('analysis-coverage'), (result.source && (result.source.start || result.source.end < snapshot.length) ? 'Trecho selecionado. ' : '') + result.coverage);
    byId('reset-dismissed').hidden = !doc.dismissed.length;
  }
  function examine(lens) {
    if (pendingAnalysis !== null || composing) { return; }
    snapshot = manuscript.value; activeLens = lens;
    var selected = analysisRange && analysisRange.documentId === (doc.noteId || doc.id) && analysisRange.text === snapshot ? analysisRange : null;
    var request = E.analysisContract.request(doc, snapshot, selected ? selected.start : 0, selected ? selected.end : snapshot.length);
    byId('findings').textContent = '';
    text(analysisStatus, 'Observando o manuscrito…');
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = true; lensButtons[i].setAttribute('aria-pressed', lensButtons[i].getAttribute('data-lens') === lens ? 'true' : 'false'); }
    pendingAnalysis = window.setTimeout(function () {
      pendingAnalysis = null;
      try { if (E.analysisContract.current(request, doc, manuscript.value)) { renderResult(E.analysisContract.analyze(vault, lens, request)); } else { invalidate(); } } catch (e) { text(analysisStatus, e.message); }
      for (var j = 0; j < lensButtons.length; j += 1) { lensButtons[j].disabled = false; }
    }, 20);
  }
  function download(contents, mime, name) {
    var urlAPI = window.URL || window.webkitURL;
    try {
      var blob = new Blob([contents], { type: mime + ';charset=utf-8' });
      if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, name); return; }
      var url = urlAPI.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name;
      if (!('download' in a)) {
        var opened = window.open(url, '_blank');
        message(opened ? 'Arquivo aberto. Use Compartilhar ou Salvar no navegador; se preciso, copie o texto.' : 'O navegador impediu a abertura. Selecione e copie o manuscrito para outro aplicativo.');
      } else { document.body.appendChild(a); a.click(); document.body.removeChild(a); message('Cópia preparada. Confira o arquivo salvo.'); }
      window.setTimeout(function () { urlAPI.revokeObjectURL(url); }, 120000);
    } catch (e) { message('Este navegador não criou o arquivo. Selecione e copie o manuscrito para outro aplicativo.'); }
  }
  function exportedDocuments() {
    var result = archive ? archive.list(true) : { documents: [], unreadable: 0 };
    if (result.unreadable) { throw new Error('Há folhas ilegíveis no acervo.'); }
    var entries = result.documents, current = JSON.parse(JSON.stringify(doc)), found = false;
    current.title = title.value; current.text = manuscript.value;
    entries = entries.map(function (entry) { if (entry.id === current.id) { found = true; return current; } return entry; });
    if (!found) { entries.push(current); }
    return entries;
  }
  function importFile(file) {
    if (!file) { return; }
    if (file.size > 5000000) { message('Traga arquivos de até 5 MB por vez.'); return; }
    if (!persist()) { return; }
    var reader = new FileReader();
    reader.onerror = function () { message('O arquivo não pôde ser lido. O acervo permanece.'); };
    reader.onload = function () {
      var entries, count = 0, latest = null;
      try {
        if (!persist()) { return; }
        if (/\.json$/i.test(file.name)) {
          var payload = JSON.parse(reader.result);
          if (!payload || payload.format !== 'escrevaral-astra' || payload.version !== 1 || Object.prototype.toString.call(payload.documents) !== '[object Array]' || !payload.documents.length || !payload.documents.every(E.validDocument)) { throw new Error('Formato de cópia não reconhecido.'); }
          entries = payload.documents;
        } else if (/\.txt$/i.test(file.name) || file.type === 'text/plain') {
          var entry = E.freshDocument(); entry.title = file.name.replace(/\.txt$/i, ''); entry.text = String(reader.result); entries = [entry];
        } else { throw new Error('Traga um texto .txt ou uma cópia .json do Escrevaral.'); }
        if (!archive) {
          if (doc.text || doc.title || entries.length !== 1) { throw new Error('Sem espaço para guardar novas folhas. Baixe sua escrita antes de trocar de navegador.'); }
          latest = E.freshDocument(); latest.title = entries[0].title; latest.text = entries[0].text; latest.project = projectName(entries[0].project); latest.created = noteDate(entries[0]); latest.createdApproximate = !entries[0].created || !!entries[0].createdApproximate; loadDocument(latest); dirty = true; message('Arquivo aberto apenas nesta folha. Baixe uma cópia antes de sair.'); return;
        }
        entries.forEach(function (entry) {
          var imported = E.freshDocument(); imported.title = entry.title; imported.text = entry.text; imported.dismissed = entry.dismissed.slice(); imported.project = projectName(entry.project); imported.created = noteDate(entry); imported.createdApproximate = !entry.created || !!entry.createdApproximate; imported.kind = entry.kind; imported.trashed = entry.trashed; var savedImport = archive.save(imported).document; if (!savedImport.trashed && savedImport.kind !== 'reminder') { latest = savedImport; } count += 1;
        });
        if (latest) { loadDocument(latest); } renderReminders(); if (cabinetOpen) { renderCabinet(); } message('Arquivo trazido como ' + count + (count === 1 ? ' nova folha.' : ' novas folhas.')); renderArchive();
      } catch (e) { message((count ? count + ' folhas já foram trazidas. ' : '') + (e.name === 'QuotaExceededError' ? 'Faltou espaço para guardar o restante.' : e instanceof SyntaxError ? 'O arquivo não contém uma cópia válida.' : e.message) + ' O acervo anterior permanece.'); }
    };
    reader.readAsText(file, 'UTF-8');
  }
  function stopSound() {
    byId('som').checked = false;
    text(byId('sound-status'), 'Som desligado.');
    if (audio) { try { if (audio.close) { audio.close(); } else if (audio.suspend) { audio.suspend(); } } catch (ignore) { /* Áudio opcional. */ } audio = null; }
  }
  function playKey(event) {
    if (!audio || !byId('som').checked || event.ctrlKey || event.metaKey || event.altKey || composing || event.isComposing || event.repeat) { return; }
    var key = event.key || '', code = event.keyCode;
    if (!(key.length === 1 || code === 8 || code === 13 || (!key && code >= 32 && code <= 222))) { return; }
    try {
      var oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
      oscillator.type = 'triangle'; oscillator.frequency.value = code === 13 ? 420 : code === 8 ? 160 : 850;
      gain.gain.setValueAtTime(0.018, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(now); oscillator.stop(now + 0.04);
      oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
    } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
  }
  /* Gabinete: apresentação do acervo real; o editor e as engines permanecem os mesmos. */
  var cabinetOpen = false, cabinetProject = null, cabinetLimit = 40, cabinetTimer = null, cabinetSelection = null;
  var desktopDrag = null;
  function desktopWindow(action, focus) {
    var open = action === 'open', win = byId('cabinet-window');
    win.hidden = !open;
    byId('os-window-task').hidden = action === 'close';
    byId('os-window-task').setAttribute('aria-pressed', open ? 'true' : 'false');
    queueSession();
    if (focus !== false) { (open ? byId('cabinet-heading') : action === 'minimize' ? byId('os-window-task') : byId('os-start')).focus(); }
    desktopDrag = null;
  }
  function setDesktopMaximized(maximized) {
    var control = byId('window-maximize');
    byId('cabinet-window').setAttribute('data-maximized', maximized ? 'true' : 'false');
    control.setAttribute('aria-pressed', maximized ? 'true' : 'false');
    control.setAttribute('aria-label', maximized ? 'Restaurar tamanho da janela' : 'Ampliar janela');
    control.setAttribute('title', maximized ? 'Restaurar tamanho da janela' : 'Ampliar janela');
    desktopDrag = null; queueSession();
  }
  function resetDesktopWindow() {
    var win = byId('cabinet-window');
    win.style.left = ''; win.style.top = ''; win.style.right = ''; win.style.bottom = ''; win.style.width = ''; win.style.height = '';
    setDesktopMaximized(false);
  }
  function startDesktopDrag(event) {
    var target = event.target, win = byId('cabinet-window'), surface = byId('desktop-surface');
    while (target && target !== byId('cabinet-window-handle')) { if (String(target.tagName).toLowerCase() === 'button') { return; } target = target.parentNode; }
    if (!cabinetOpen || window.innerWidth <= 760 || win.getAttribute('data-maximized') === 'true' || (typeof event.button === 'number' && event.button !== 0)) { return; }
    var point = event.touches ? event.touches[0] : event;
    if (!point || !win.getBoundingClientRect || !surface.getBoundingClientRect) { return; }
    var rect = win.getBoundingClientRect(), parent = surface.getBoundingClientRect();
    desktopDrag = { x: point.clientX, y: point.clientY, left: rect.left - parent.left, top: rect.top - parent.top, width: rect.right - rect.left, height: rect.bottom - rect.top, maxX: Math.max(0, parent.right - parent.left - (rect.right - rect.left)), maxY: Math.max(0, parent.bottom - parent.top - (rect.bottom - rect.top)) };
    win.style.width = desktopDrag.width + 'px'; win.style.height = desktopDrag.height + 'px'; win.style.right = 'auto'; win.style.bottom = 'auto';
    moveDesktopDrag(event); event.preventDefault();
  }
  function moveDesktopDrag(event) {
    if (!desktopDrag) { return; }
    var point = event.touches ? event.touches[0] : event; if (!point) { return; }
    var win = byId('cabinet-window');
    win.style.left = Math.max(0, Math.min(desktopDrag.maxX, desktopDrag.left + point.clientX - desktopDrag.x)) + 'px';
    win.style.top = Math.max(0, Math.min(desktopDrag.maxY, desktopDrag.top + point.clientY - desktopDrag.y)) + 'px';
    event.preventDefault();
  }
  function projectName(value) { return String(value || '').replace(/^\s+|\s+$/g, '').slice(0, 120); }
  function cabinetDocuments() {
    var result = archive ? archive.list() : { documents: [], unreadable: 0 }, found = false;
    result.documents = result.documents.map(function (entry) { if (entry.id === doc.id) { found = true; return doc; } return entry; });
    if (!found && (doc.revision || dirty || title.value || manuscript.value)) { result.documents.unshift(doc); }
    return result;
  }
  function renderCabinet() {
    updatePath(); queueSession();
    var result, list = byId('cabinet-notes'), projects = byId('cabinet-projects'), groups = [], query = byId('cabinet-search').value;
    try { result = cabinetDocuments(); } catch (e) { message('Não foi possível ler o acervo. Seus registros foram preservados.'); return; }
    list.textContent = ''; projects.textContent = '';
    result.documents.forEach(function (entry) {
      var name = projectName(entry.project), group = null;
      groups.forEach(function (g) { if (g.name === name) { group = g; } });
      if (!group) { group = { name: name, count: 0 }; groups.push(group); } group.count += 1;
    });
    groups.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    groups.forEach(function (group) {
      var b = button(projects, '', function () { cabinetProject = group.name; cabinetLimit = 40; byId('cabinet-search').value = ''; renderCabinet(); byId('cabinet-heading').focus(); });
      b.className = 'project-link'; b.setAttribute('aria-pressed', cabinetProject === group.name ? 'true' : 'false');
      var icon = document.createElement('span'); icon.className = 'project-icon'; icon.innerHTML = byId('project-icon-template').innerHTML; b.appendChild(icon);
      var label = document.createElement('span'); text(label, group.name || 'Folhas avulsas'); b.appendChild(label);
      var count = document.createElement('small'); text(count, group.count); b.appendChild(count);
    });
    byId('cabinet-all').setAttribute('aria-pressed', cabinetProject === null ? 'true' : 'false');
    var entries = query ? E.browseNotes(result.documents, { query: query }).notes.reverse() : result.documents.filter(function (entry) { return cabinetProject === null || projectName(entry.project) === cabinetProject; });
    text(byId('cabinet-heading'), query ? 'Busca no gabinete' : cabinetProject === null ? 'Seus textos' : cabinetProject || 'Folhas avulsas');
    text(byId('cabinet-count'), entries.length + (entries.length === 1 ? ' folha' : ' folhas'));
    byId('cabinet-clear').hidden = !query;
    byId('cabinet-empty').hidden = entries.length > 0;
    text(byId('cabinet-empty'), query ? 'Nenhuma folha encontrada. Tente outro título ou trecho.' : 'Seu gabinete começa com uma folha. Dê um título e encontre seu primeiro parágrafo.');
    byId('cabinet-more').hidden = entries.length <= cabinetLimit;
    byId('cabinet-resume').hidden = !(doc.revision || title.value || manuscript.value) || !!query || (cabinetProject !== null && cabinetProject !== projectName(doc.project));
    text(byId('resume-title'), title.value || 'Sem título');
    text(byId('resume-date'), projectName(doc.project) || 'Folha avulsa');
    entries.slice(0, cabinetLimit).forEach(function (entry) {
      var row = document.createElement('div'); row.className = 'cabinet-note-row'; list.appendChild(row);
      var b = button(row, '', function () {
        var isCurrent = entry.id === doc.id;
        if (!persist()) { return; }
        if (!isCurrent) {
          try { var next = archive && archive.get(entry.id); if (!next) { renderCabinet(); message('Esta folha mudou. Escolha sua versão atual no gabinete.'); return; } loadDocument(next); } catch (e) { message('Não foi possível abrir esta folha. O texto atual permanece.'); return; }
          cabinetSelection = null;
        }
        enterDesk();
      });
      b.className = 'cabinet-note'; b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false');
      noteLabel(b, entry.title, timeLabel(new Date(noteDate(entry))) + ' · ' + new Date(noteDate(entry)).toLocaleDateString('pt-BR'));
      paragraph(b, projectName(entry.project) || 'Folha avulsa', 'note-project-label');
      var discard = button(row, '', function () { trashEntry(entry); byId('cabinet-heading').focus(); });
      discard.className = 'note-trash';
      discard.setAttribute('aria-label', 'Mover para a lixeira: ' + (entry.title || 'Sem título'));
      discard.setAttribute('title', 'Mover para a lixeira');
      discard.innerHTML = '<svg class="reminder-trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';
    });
    if (result.unreadable) { message('Algumas folhas não puderam ser lidas. Os registros originais permanecem.'); }
  }
  function enterDesk(focusEditor) {
    toggleStart(false);
    closePanels(false); collapseTimeline(); desktopDrag = null; cabinetOpen = false; byId('gabinete').hidden = true; byId('writing-space').hidden = false;
    document.body.setAttribute('data-view', 'mesa'); updatePath(); refreshCounts();
    sizeWorkspace(); cancelTypewriter();
    if (focusEditor !== false) { manuscript.focus(); }
    if (cabinetSelection && cabinetSelection.noteId === (doc.noteId || doc.id)) {
      manuscript.setSelectionRange(cabinetSelection.start, cabinetSelection.end); manuscript.scrollTop = cabinetSelection.scroll;
    }
    growManuscript();
    queueSession();
    try { if (storage && doc.revision) { storage.setItem('escrevaral.astra.current', doc.id); } } catch (ignore) { /* Preferência facultativa. */ }
  }
  function openCabinet(initial) {
    toggleStart(false);
    if (!initial && (composing || !persist())) { return false; }
    cabinetSelection = { noteId: doc.noteId || doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop };
    if (machineEnabled) { setMachine(false); }
    if (immersion) { setImmersion(false); }
    cancelTypewriter(); closePanels(false); collapseTimeline();
    cabinetOpen = true; byId('writing-space').hidden = true; byId('gabinete').hidden = false;
    byId('leave-focus').hidden = true; document.body.setAttribute('data-view', 'gabinete');
    desktopWindow('open', false); renderCabinet(); if (!initial) { byId('cabinet-heading').focus(); } return true;
  }
  function cabinetPanel(id, trigger) {
    if (id === 'acervo') { renderArchive(); }
    showPanel(id, trigger, true);
  }
  function createProject(event) {
    event.preventDefault(); var name = projectName(byId('project-name').value);
    if (!name) { text(byId('project-error'), 'Dê um nome ao projeto.'); byId('project-name').focus(); return; }
    if (!persist()) { return; }
    var next = E.freshDocument(); next.project = name;
    loadDocument(next); dirty = true;
    if (!persist()) { enterDesk(); message('Projeto aberto na folha, mas ainda não foi guardado. Baixe uma cópia.'); return; }
    cabinetProject = name; byId('project-form').hidden = true; byId('project-new').setAttribute('aria-expanded', 'false');
    byId('project-name').value = ''; cabinetSelection = null; enterDesk(); title.focus();
  }
  function chooseFont(value) {
    var style = value === 'maquina' ? 'maquina' : 'literaria';
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    document.body.setAttribute('data-letter', style);
    byId('font-literary').setAttribute('aria-pressed', style === 'literaria' ? 'true' : 'false');
    byId('font-typewriter').setAttribute('aria-pressed', style === 'maquina' ? 'true' : 'false');
    text(byId('desk-font'), style === 'maquina' ? 'Courier Prime' : 'Noto Serif');
    focusMeasure = null; typewriterInsets(); growManuscript();
    if (typeof start === 'number') { manuscript.setSelectionRange(start, end); }
    try { if (storage) { storage.setItem('escrevaral.astra.letter', style); } } catch (ignore) { /* Préférence facultativa. */ }
  }

  try {
    storage = window.localStorage; archive = E.createArchive(storage);
    var currentId = storage.getItem('escrevaral.astra.current'), current = currentId ? archive.get(currentId) : null;
    if (!current || current.trashed || current.kind === 'reminder') { current = archive.list().documents[0]; }
    if (current) { loadDocument(current); }
    applyTheme(storage.getItem('escrevaral.astra.theme'));
    focusEnabled = storage.getItem('escrevaral.astra.focus') !== 'off'; byId('focus-toggle').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');
  } catch (e) { message('A gravação pode estar indisponível. Sua folha está aberta; baixe uma cópia em Ajustes.'); }
  renderTimeline(true, null, true); sizeWorkspace();
  listen(window, 'resize', function () { if (byId('cabinet-window').getAttribute('data-maximized') !== 'true') { resetDesktopWindow(); } sizeWorkspace(); });
  listen(window, 'load', sizeWorkspace);
  if (window.visualViewport) { listen(window.visualViewport, 'resize', sizeWorkspace); }
  listen(byId('timeline-toggle'), 'click', function () { document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false'); var open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', open ? 'true' : 'false'); byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', open ? 'true' : 'false'); if (open) { renderTimeline(false, null, true); } });
  listen(byId('mesa-close'), 'click', function () { closePanels(true); });
  listen(byId('acervo-close'), 'click', function () { closePanels(true); });
  listen(byId('panel-backdrop'), 'click', function () { closePanels(true); });
  listen(document, 'mousedown', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(document, 'touchstart', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(byId('note-search'), 'input', function () {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () {
      timelineCount = 40; byId('timeline-list').scrollTop = 0; renderTimeline(true);
      byId('timeline-toggle').setAttribute('aria-expanded', 'true'); byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'true');
    }, 150);
  });
  listen(byId('note-search'), 'keydown', function (event) { if (event.keyCode === 27 && this.value) { event.preventDefault(); this.value = ''; window.clearTimeout(searchTimer); renderTimeline(false); } });
  listen(byId('clear-search'), 'click', function () { window.clearTimeout(searchTimer); byId('note-search').value = ''; renderTimeline(false); byId('note-search').focus(); });
  listen(byId('timeline-list'), 'scroll', function () { if (this.scrollTop < 24) { olderNotes(); } });
  listen(manuscript, 'input', followTyping);
  listen(manuscript, 'blur', cancelTypewriter);
  listen(manuscript, 'blur', function () { stopMachineStrike(); finishMachineFeed(); });
  listen(manuscript, 'mousedown', cancelTypewriter);
  listen(manuscript, 'touchstart', cancelTypewriter);
  listen(manuscript, 'wheel', cancelTypewriter);
  listen(manuscript, 'mousewheel', cancelTypewriter);
  listen(manuscript, 'keyup', function (event) { if (event.keyCode >= 33 && event.keyCode <= 40 && !event.shiftKey) { followTyping(); } });
  listen(manuscript, 'scroll', updateFocus);
  listen(manuscript, 'click', growManuscript);
  listen(manuscript, 'keyup', growManuscript);
  listen(manuscript, 'select', growManuscript);
  listen(manuscript, 'focus', function () { collapseTimeline(); growManuscript(); });
  listen(title, 'focus', collapseTimeline);
  listen(document, 'selectionchange', function () { if (document.activeElement === manuscript) { growManuscript(); } });
  listen(byId('immersion-toggle'), 'click', function () { setImmersion(!immersion); });
  listen(byId('leave-focus'), 'click', leaveImmersion);
  listen(byId('machine-toggle'), 'click', function () { setMachine(!machineEnabled); });
  listen(manuscript, 'input', machineInput);
  listen(byId('focus-toggle'), 'click', function () { focusEnabled = !focusEnabled; this.setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); byId('desk-paragraph').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); updateFocus(); try { if (storage) { storage.setItem('escrevaral.astra.focus', focusEnabled ? 'on' : 'off'); } } catch (ignore) { /* Préférence facultativa. */ } });
  listen(title, 'input', changed); listen(manuscript, 'input', changed);
  listen(manuscript, 'compositionstart', function () {
    cancelTypewriter(); window.clearTimeout(focusTimer); updateFocus();
    composing = true; window.clearTimeout(timer);
  });
  listen(manuscript, 'compositionend', function () {
    composing = false; focusMeasure = null; updateFocus(); changed(); followTyping(); machineInput();
  });
  listen(byId('acervo-toggle'), 'click', function () { if (!persist()) { return; } var open = byId('acervo').hidden; showPanel('acervo', 'acervo-toggle', open); if (open) { renderArchive(); } });
  listen(byId('mesa-toggle'), 'click', function () { showPanel('mesa', 'mesa-toggle', byId('mesa').hidden); });
  listen(byId('examinar-toggle'), 'click', function () { var open = byId('oficina').hidden; showPanel('oficina', 'examinar-toggle', open); if (open) { lensButtons[0].focus(); } });
  listen(byId('back-writing'), 'click', returnToWriting);
  function newDocument() { if (!persist()) { return; } var next = E.freshDocument(); next.project = cabinetOpen ? cabinetProject || '' : projectName(doc.project); loadDocument(next); dirty = true; persist(); renderTimeline(false, null, true); cabinetSelection = null; enterDesk(false); byId('path-document').focus(); }
  listen(byId('new-document'), 'click', newDocument);
  listen(byId('timeline-new'), 'click', newDocument);
  for (var i = 0; i < lensButtons.length; i += 1) { listen(lensButtons[i], 'click', function () { examine(this.getAttribute('data-lens')); }); }
  listen(byId('reset-dismissed'), 'click', function () { doc.dismissed = []; dirty = true; persist(); byId('reset-dismissed').hidden = true; invalidate(); text(analysisStatus, 'Escolhas liberadas. Escolha uma lente para examinar de novo.'); lensButtons[0].focus(); });
  function applyTheme(value) {
    var theme = value === 'escuro' ? 'escuro' : 'claro';
    document.body.setAttribute('data-theme', theme); byId('tema').value = theme;
    byId('theme-light').setAttribute('aria-pressed', theme === 'claro' ? 'true' : 'false');
    byId('theme-dark').setAttribute('aria-pressed', theme === 'escuro' ? 'true' : 'false');
  }
  function chooseTheme(value) { applyTheme(value); try { if (storage) { storage.setItem('escrevaral.astra.theme', byId('tema').value); } } catch (ignore) { /* Tema não bloqueia a escrita. */ } }
  listen(byId('theme-light'), 'click', function () { chooseTheme('claro'); });
  listen(byId('theme-dark'), 'click', function () { chooseTheme('escuro'); });
  listen(byId('tema'), 'change', function () { chooseTheme(this.value); });
  listen(byId('som'), 'change', function () {
    if (!this.checked) { stopSound(); return; }
    try { var Audio = window.AudioContext || window.webkitAudioContext; audio = new Audio(); if (audio.resume) { audio.resume(); } text(byId('sound-status'), 'Som ligado, em volume discreto.'); } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
  });
  listen(manuscript, 'keydown', playKey);
  listen(byId('print-document'), 'click', function () {
    preparePrint();
    if (window.print) { window.print(); } else { message('Use a opção de impressão do navegador.'); }
  });
  listen(window, 'beforeprint', preparePrint);
  listen(window, 'afterprint', finishPrint);
  if (window.matchMedia) {
    var printMedia = window.matchMedia('print');
    if (printMedia.addListener) { printMedia.addListener(function (event) { if (event.matches) { preparePrint(); } else { finishPrint(); } }); }
  }
  listen(byId('export-text'), 'click', function () { download((title.value ? title.value + '\n\n' : '') + manuscript.value, 'text/plain', 'manuscrito.txt'); });
  listen(byId('export-backup'), 'click', function () { persist(); try { download(JSON.stringify({ format: 'escrevaral-astra', version: 1, documents: exportedDocuments() }, null, 2), 'application/json', 'escrevaral-copia.json'); } catch (e) { message('Não foi possível reunir o acervo. Baixe o texto da folha atual.'); } });
  listen(byId('import-file'), 'focus', function () { this.parentNode.setAttribute('data-focus', 'true'); });
  listen(byId('import-file'), 'blur', function () { this.parentNode.setAttribute('data-focus', 'false'); });
  listen(byId('import-file'), 'change', function () { importFile(this.files[0]); this.value = ''; });
  listen(document, 'keydown', function (event) {
    var code = event.keyCode;
    if (code === 27 && composing) { return; }
    if (code === 27 && !byId('delete-confirm').hidden) { event.preventDefault(); cancelDelete(); return; }
    if (code === 27 && !byId('start-menu').hidden) { event.preventDefault(); toggleStart(false); byId('os-start').focus(); return; }
    if (code === 9) {
      document.body.setAttribute('data-input', 'keyboard');
      if (activePanel) {
        var controls = byId(activePanel).querySelectorAll('button, input, textarea, select, a[href], [tabindex="0"]'), focusable = [], j;
        for (j = 0; j < controls.length; j += 1) { if (!controls[j].disabled && !controls[j].hidden && controls[j].getClientRects().length) { focusable.push(controls[j]); } }
        var paths = byId('location-path').querySelectorAll('button'), pathControls = [];
        for (j = 0; j < paths.length; j += 1) { if (!paths[j].hidden) { pathControls.push(paths[j]); } }
        focusable = pathControls.concat(focusable); focusable.push(byId('os-start'));
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); byId(activePanel).focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === byId(activePanel))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === byId(activePanel))) { event.preventDefault(); first.focus(); }
      }
    }
    if ((event.ctrlKey || event.metaKey) && code === 75) { event.preventDefault(); closePanels(false); (cabinetOpen ? byId('cabinet-search') : byId('note-search')).focus(); }
    else if ((event.ctrlKey || event.metaKey) && code === 13) { event.preventDefault(); if (cabinetOpen) { enterDesk(); } showPanel('oficina', 'examinar-toggle', true); panelTrigger = manuscript; lensButtons[0].focus(); }
    else if ((event.ctrlKey || event.metaKey) && code === 83) { event.preventDefault(); persist(); }
    else if (code === 27 && document.body.getAttribute('data-counts') === 'true') { byId('desk-counts-close').click(); }
    else if (code === 27) { if (activePanel) { closePanels(true); } else if (immersion) { leaveImmersion(); } else if (!cabinetOpen) { if (byId('timeline-toggle').getAttribute('aria-expanded') === 'true') { collapseTimeline(); } else { openCabinet(false); } } else if (!byId('project-form').hidden) { byId('project-cancel').click(); } }
  });

  listen(byId('os-files'), 'click', function () { desktopWindow('open'); renderCabinet(); });
  listen(byId('os-desk'), 'click', enterDesk);
  listen(byId('os-arrange'), 'click', function () { resetDesktopWindow(); desktopWindow('open'); });
  listen(byId('os-start'), 'click', function () { toggleStart(byId('start-menu').hidden); });
  function outsideStart(event) {
    if (byId('start-menu').hidden) { return; }
    var node = event.target;
    while (node) { if (node === byId('start-menu') || node === byId('os-start')) { return; } node = node.parentNode; }
    toggleStart(false);
  }
  listen(document, 'click', outsideStart);
  listen(document, 'touchstart', outsideStart);
  listen(document, 'focusin', outsideStart);
  listen(byId('os-window-task'), 'click', function () { if (!cabinetOpen) { openCabinet(false); } else { desktopWindow(byId('cabinet-window').hidden ? 'open' : 'minimize'); } });
  listen(byId('window-minimize'), 'click', function () { desktopWindow('minimize'); });
  listen(byId('window-close'), 'click', function () { desktopWindow('close'); });
  listen(byId('window-maximize'), 'click', function () {
    setDesktopMaximized(this.getAttribute('aria-pressed') !== 'true');
  });
  listen(byId('cabinet-window-handle'), 'dblclick', function (event) {
    var target = event.target;
    while (target && target !== this) {
      if (String(target.tagName).toLowerCase() === 'button') { return; }
      target = target.parentNode;
    }
    desktopWindow('minimize');
  });
  listen(byId('cabinet-window-handle'), 'mousedown', startDesktopDrag);
  listen(byId('cabinet-window-handle'), 'touchstart', startDesktopDrag);
  listen(document, 'mousemove', moveDesktopDrag);
  listen(document, 'touchmove', moveDesktopDrag);
  listen(document, 'mouseup', function () { desktopDrag = null; });
  listen(document, 'touchend', function () { desktopDrag = null; });
  listen(document, 'touchcancel', function () { desktopDrag = null; });
  listen(window, 'blur', function () { desktopDrag = null; });
  listen(byId('skip-writing'), 'click', function (event) { event.preventDefault(); enterDesk(); });
  listen(byId('back-cabinet'), 'click', function () { openCabinet(false); });
  listen(byId('cabinet-return'), 'click', enterDesk);
  listen(byId('cabinet-resume'), 'click', enterDesk);
  listen(byId('cabinet-write'), 'click', enterDesk);
  listen(byId('cabinet-new'), 'click', newDocument);
  listen(byId('cabinet-settings'), 'click', function () { cabinetPanel('mesa', 'cabinet-settings'); });
  listen(byId('cabinet-archive'), 'click', function () { desktopWindow('open'); renderCabinet(); });
  listen(byId('cabinet-backup'), 'click', function () { byId('export-backup').click(); });
  listen(byId('cabinet-examine'), 'click', function () { enterDesk(); showPanel('oficina', 'examinar-toggle', true); lensButtons[0].focus(); });
  listen(byId('cabinet-poetry'), 'click', function () { enterDesk(); showPanel('oficina', 'examinar-toggle', true); for (var j = 0; j < lensButtons.length; j += 1) { if (lensButtons[j].getAttribute('data-lens') === 'rima') { lensButtons[j].focus(); break; } } });
  listen(byId('cabinet-all'), 'click', function () { cabinetProject = null; cabinetLimit = 40; byId('cabinet-search').value = ''; renderCabinet(); });
  listen(byId('cabinet-more'), 'click', function () { cabinetLimit += 40; renderCabinet(); });
  listen(byId('cabinet-search'), 'input', function () { window.clearTimeout(cabinetTimer); cabinetTimer = window.setTimeout(function () { cabinetLimit = 40; desktopWindow('open', false); renderCabinet(); }, 180); });
  listen(byId('cabinet-clear'), 'click', function () { window.clearTimeout(cabinetTimer); byId('cabinet-search').value = ''; renderCabinet(); byId('cabinet-search').focus(); });
  listen(byId('paste-mode'), 'click', function () { restrictedPaste = !restrictedPaste; this.setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {} });
  listen(manuscript, 'paste', function (event) {
    if (!restrictedPaste) { return; }
    event.preventDefault(); message('Colagem externa restrita. Use Colar cópia interna ou Trazer arquivo em Ajustes.');
  });
  listen(manuscript, 'mouseup', captureSelection); listen(manuscript, 'keyup', captureSelection); listen(manuscript, 'touchend', captureSelection);
  listen(manuscript, 'select', captureSelection);
  listen(byId('selection-close'), 'click', function () { byId('selection-tools').hidden = true; });
  listen(byId('selection-paste'), 'click', pasteInternal);
  listen(byId('selection-cut'), 'click', function () {
    if (composing || !copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { return; }
    var s = copiedSelection; manuscript.value = s.text.slice(0, s.start) + s.text.slice(s.end); manuscript.setSelectionRange(s.start, s.start); manuscript.focus(); copiedSelection = null; changed(); queueSession();
  });
  listen(byId('selection-examine'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { message('Selecione novamente o trecho para analisar.'); return; }
    analysisRange = copiedSelection; showPanel('oficina', 'examinar-toggle', true); lensButtons[0].focus();
  });
  listen(byId('selection-external'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value) { message('Selecione novamente o trecho para copiar.'); return; }
    manuscript.focus(); manuscript.setSelectionRange(copiedSelection.start, copiedSelection.end);
    try { if (document.execCommand && document.execCommand('copy')) { text(byId('clipboard-status'), 'Copiado para outros aplicativos'); return; } } catch (ignore) { /* Cópia interna já disponível. */ }
    text(byId('clipboard-status'), 'Use Ctrl+C ou o comando Copiar do aparelho.');
  });
  listen(byId('start-settings'), 'click', function () { toggleStart(false); showPanel('mesa', 'mesa-toggle', true); });
  listen(byId('start-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('start-trash'), 'click', function () { toggleStart(false); trashView = true; renderArchive(); showPanel('acervo', 'acervo-toggle', true); });
  listen(byId('trash-toggle'), 'click', function () { cancelDelete(); trashView = !trashView; renderArchive(); });
  listen(byId('trash-current'), 'click', function () { trashEntry(doc); });
  listen(byId('delete-cancel'), 'click', cancelDelete);
  listen(byId('delete-accept'), 'click', function () { if (!deleteTarget) { return; } try { archive.purge(deleteTarget); cancelDelete(); renderArchive(); message('Cópia excluída definitivamente deste acervo.'); } catch (e) { text(byId('delete-message'), e.message); } });
  listen(byId('reminder-new'), 'click', function () { if (!archive) { message('Armazenamento indisponível.'); return; } try { var note = E.freshDocument(); note.kind = 'reminder'; note.title = 'Lembrete'; archive.save(note); renderReminders(); } catch (e) { message('Não foi possível guardar o lembrete.'); } });
  listen(manuscript, 'input', queueSession); listen(manuscript, 'keyup', queueSession); listen(manuscript, 'scroll', queueSession); listen(manuscript, 'click', queueSession);
  listen(title, 'input', queueSession);
  listen(byId('start-menu'), 'click', function (event) {
    var node = event.target;
    while (node && node !== byId('start-menu')) {
      if (String(node.tagName).toLowerCase() === 'button') { toggleStart(false); return; }
      node = node.parentNode;
    }
  });
  listen(byId('path-home'), 'click', function () { pathToProjects(true); });
  listen(byId('path-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('path-project'), 'click', function () { pathToProjects(false); });
  listen(byId('path-document'), 'click', function () { returnToWriting(); updatePath(); });
  listen(title, 'input', updatePath);
  listen(byId('project-new'), 'click', function () { byId('project-form').hidden = false; this.setAttribute('aria-expanded', 'true'); text(byId('project-error'), ''); byId('project-name').focus(); });
  listen(byId('project-cancel'), 'click', function () { byId('project-form').hidden = true; byId('project-new').setAttribute('aria-expanded', 'false'); byId('project-new').focus(); });
  listen(byId('project-form'), 'submit', createProject);
  listen(byId('note-project-save'), 'click', function () { doc.project = projectName(byId('note-project').value); updatePath(); dirty = true; if (persist()) { message(doc.project ? 'Folha guardada em ' + doc.project + '.' : 'Folha guardada como avulsa.'); if (cabinetOpen) { renderCabinet(); } } });
  listen(byId('font-literary'), 'click', function () { chooseFont('literaria'); });
  listen(byId('font-typewriter'), 'click', function () { chooseFont('maquina'); });
  try { chooseFont(storage ? storage.getItem('escrevaral.astra.letter') : 'literaria'); } catch (ignore) { chooseFont('literaria'); }
  try { restrictedPaste = !!storage && storage.getItem('escrevaral.astra.restricted-paste') === 'on'; byId('paste-mode').setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); } catch (ignore) {}

  function refreshCounts() {
    var counts = E.countManuscript(manuscript.value);
    text(byId('desk-words'), counts.words.toLocaleString('pt-BR'));
    text(byId('desk-characters'), counts.characters.toLocaleString('pt-BR'));
    text(byId('desk-paragraphs'), counts.paragraphs);
    text(byId('desk-count-status'), 'Corpo do texto · caracteres incluem espaços; cada linha não vazia conta como parágrafo.');
  }
  function resizeLetter(value) {
    readingSize = Math.max(16, Math.min(30, Number(value) || 21));
    manuscript.style.fontSize = readingSize + 'px'; text(byId('type-size'), readingSize);
    byId('type-smaller').disabled = readingSize <= 16; byId('type-larger').disabled = readingSize >= 30;
    focusMeasure = null; typewriterInsets(); growManuscript();
    try { if (storage) { storage.setItem('escrevaral.astra.font-size', String(readingSize)); } } catch (ignore) {}
  }
  function inspectWith(lens) {
    analysisRange = null; showPanel('oficina', 'examinar-toggle', true); if (lens) { examine(lens); }
  }
  listen(byId('desk-project'), 'click', function () { pathToProjects(false); });
  listen(byId('scope-project'), 'click', function () { projectScope = true; timelineCount = 40; renderTimeline(true, null, true); queueSession(); });
  listen(byId('scope-dates'), 'click', function () { projectScope = false; renderTimeline(true, null, true); queueSession(); });
  listen(byId('desk-documents'), 'click', function () { byId('timeline-toggle').click(); this.setAttribute('aria-expanded', byId('timeline-toggle').getAttribute('aria-expanded')); });
  listen(byId('desk-font'), 'click', function () { chooseFont(document.body.getAttribute('data-letter') === 'maquina' ? 'literaria' : 'maquina'); });
  listen(byId('type-smaller'), 'click', function () { resizeLetter(readingSize - 1); });
  listen(byId('type-larger'), 'click', function () { resizeLetter(readingSize + 1); });
  listen(byId('desk-paragraph'), 'click', function () { byId('focus-toggle').click(); this.setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); });
  listen(byId('desk-print'), 'click', function () { byId('print-document').click(); });
  listen(byId('desk-export'), 'click', function () { byId('export-text').click(); });
  listen(byId('desk-counts'), 'click', function () { var open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.setAttribute('data-counts', open ? 'true' : 'false'); if (open) { collapseTimeline(); refreshCounts(); } });
  listen(byId('desk-counts-close'), 'click', function () { document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false'); byId('desk-counts').focus(); });
  listen(byId('desk-refresh'), 'click', refreshCounts);
  listen(byId('desk-conventions'), 'click', function () { inspectWith(''); });
  listen(byId('desk-rhythm'), 'click', function () { inspectWith('ritmo'); });
  listen(byId('desk-dialogue'), 'click', function () { inspectWith('dialogo'); });
  listen(byId('desk-project-change'), 'click', function () { showPanel('mesa', 'mesa-toggle', true); byId('note-project').focus(); });
  listen(byId('desk-trash'), 'click', function () { trashEntry(doc); });
  try { resizeLetter(storage ? storage.getItem('escrevaral.astra.font-size') : 21); } catch (ignore) { resizeLetter(21); }
  byId('desk-paragraph').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');

  setDesktopMaximized(true); openCabinet(true); renderReminders(); restoreSession(); sessionReady = true;

  E.mountUtilities({
    storage: storage, checkpoint: checkpoint, download: download,
    hideStart: function () { toggleStart(false); },
    show: function (id, trigger) { toggleStart(false); showPanel(id, trigger, true); },
    close: function () { closePanels(true); },
    write: function () { if (cabinetOpen) { enterDesk(true); } else { closePanels(false); manuscript.focus(); growManuscript(); } },
    documents: function () { return cabinetDocuments().documents; },
    openNote: function (entry) {
      if (!checkpoint()) { return; }
      try { var next = archive.get(entry.id); if (!next || next.trashed) { return; } loadDocument(next); cabinetSelection = null; enterDesk(true); }
      catch (e) { message('Não foi possível abrir esta folha.'); }
    }
  });

  listen(document, 'visibilitychange', function () { if (document.hidden) { checkpoint(); stopSound(); stopMachineStrike(); finishMachineFeed(); } });
  listen(window, 'pagehide', checkpoint);
  listen(window, 'beforeunload', function (event) { if (!checkpoint()) { event.preventDefault(); event.returnValue = 'Há escrita que não foi guardada.'; } });
}());
