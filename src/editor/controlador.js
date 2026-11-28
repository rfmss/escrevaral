(function () {
  'use strict';
  var E = window.Escr, vault = E.createVault(E.knowledge), storage = null, archive = null;
  var doc = E.freshDocument(), dirty = false, timer = null, pendingAnalysis = null, snapshot = '', activeLens = '', composing = false, audio = null;
  var title = byId('titulo'), manuscript = byId('manuscrito'), saveStatus = byId('save-status'), analysisStatus = byId('analysis-status');
  var activePanel = '', panelTrigger = null, panelIds = ['oficina', 'acervo', 'mesa', 'utilidades', 'focus-pause', 'lineage-panel', 'sobre', 'usos-lingua'], panelToggles = ['examinar-toggle', 'acervo-toggle', 'mesa-toggle', 'start-pomodoro', 'pomodoro-task', 'start-lineage', 'esc-open-about', 'esc-open-usos'];
  var projectScope = false, readingSize = 21, chalkUI = null, forceHistory=false, linguisticStore=E.createLinguisticStore(), analysisEpoch=0;
  var restrictedPaste = false, internalClipboard = '', copiedSelection = null, dismissedSelection = null, analysisRange = null;
  var trashView = false, sessionReady = false, sessionTimer = null, sessionKey = 'escrevaral.astra.session.v1';
  var immersion = false, machineEnabled = false, machinePreviousFocus = false, machineTimer = null, machineFeedTimer = null, machineCarriage = 0, machineLastLength = 0, machinePendingStrike = false;
  var focusEnabled = true, focusTimer = null, focusMeasure = null, typewriterTimer = null;
  var lensButtons = document.querySelectorAll('[data-lens]');
  var navDay = E.noteDateKey(doc), navMonth = navDay.slice(0, 7), searchTimer = null, timelineTotal = 0, timelineUnreadable = 0;
  var timelineEntries = [], timelineCount = 40, timelineRendering = false, months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  /* A capa é a entrada do projeto; o editor continua compartilhado. */
  var notebooks = null, activeNotebookId = null, notebookEditing = null, notebookReturn = null, notebookReady = false, showingAbout = false, deferredInstallPrompt = null;
  var originals = null, activeOriginalId = null, formTarget = 'volume', workspaceUI = null, templatesUI = null, sonnetUI = null, songUI = null, usosUI = null, richUI = null, readerUI = null, printStudioUI = null, visualMachine = null, superfocoUI = null, themeChromeUI = null, wordCardUI = null, academyUI = null;
  function availableBook(b) { var o = b && b.originalId && originals ? originals.get(b.originalId) : null; return b && !b.trashed && (!b.originalId || (o && !o.trashed)); }
  function activeNotebook() { var b = notebooks && activeNotebookId ? notebooks.get(activeNotebookId) : null; return availableBook(b) ? b : null; }
  function activeOriginal() { return originals && activeOriginalId ? originals.get(activeOriginalId) : null; }
  function rememberNotebook() {
    if (!notebooks || !activeNotebookId || !doc.projectId || doc.projectId !== activeNotebookId) { return true; }
    try {
      if (!activeNotebook()) { return true; }
      notebooks.update(activeNotebookId, { resume: { noteId: doc.noteId || doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop || 0, view: cabinetOpen ? 'files' : 'writing' } }); return true;
    } catch (e) { message('O texto está guardado, mas não foi possível guardar a posição no caderno.'); return false; }
  }
  function isLightHex(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) { return false; }
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 120;
  }
  function pulseSpatialEnter(el) {
    if (!el || !el.classList) { return; }
    el.classList.remove('esc-spatial-enter');
    try { void el.offsetWidth; } catch (ignore) {}
    el.classList.add('esc-spatial-enter');
    window.setTimeout(function () {
      if (el && el.classList) { el.classList.remove('esc-spatial-enter'); }
    }, 320);
  }
  function notebookLabels() {
    var book = activeNotebook(), label = book ? book.name : 'Todos os textos';
    var parentOrig = book && book.originalId && originals ? originals.get(book.originalId) : null;
    text(byId('notebook-window-name'), label); text(byId('os-window-task'), label);
    byId('os-window-task').setAttribute('data-notebook', book ? 'true' : 'false'); byId('os-window-task').setAttribute('title', label);
    byId('os-window-task').style.borderLeftColor = book ? book.color : '';
    var cabWin = byId('cabinet-window');
    if (cabWin && cabWin.style && cabWin.style.setProperty) {
      cabWin.style.setProperty('--esc-book-color', book ? book.color : '#6f8e68');
    }
    var nbMini = byId('esc-notebook-mini'), nbStrap = byId('esc-notebook-mini-strap'), nbKicker = byId('esc-notebook-kicker');
    if (nbMini) { nbMini.hidden = !book; }
    if (nbStrap && book) { nbStrap.style.backgroundColor = book.color; }
    if (nbKicker) {
      text(nbKicker, book ? (parentOrig ? 'DENTRO DO CADERNO · GAVETA ' + parentOrig.name.toUpperCase() : 'VOCÊ ESTÁ DENTRO DO CADERNO') : 'GABINETE DE ESCRITA');
    }
    byId('cabinet-search').placeholder = book ? 'Buscar neste caderno' : 'Buscar em todos os textos';
    byId('cabinet-search').setAttribute('aria-label', byId('cabinet-search').placeholder);
    byId('notebook-rename').hidden = byId('notebook-export').hidden = byId('notebook-trash').hidden = !book;
    byId('notebook-more').hidden = !book; byId('notebook-more-menu').hidden = true; byId('notebook-more').setAttribute('aria-expanded','false');
    byId('start-universe').hidden = byId('start-chalkboard').hidden = byId('start-lineage').hidden = !book;
    byId('export-notebook').disabled = !book;
    text(byId('notebook-back'), book && book.originalId ? '← Voltar à gaveta' : '← Voltar à Estante');
    byId('notebook-organization').hidden = !book;
    var parentSelect = byId('notebook-parent'); parentSelect.textContent = '';
    var loose = document.createElement('option'); loose.value = ''; text(loose, 'Na Estante, sem gaveta'); parentSelect.appendChild(loose);
    if (originals) { originals.list().filter(function (o) { return !o.trashed; }).forEach(function (o) { var opt = document.createElement('option'); opt.value = o.id; text(opt, o.name); parentSelect.appendChild(opt); }); }
    parentSelect.value = book ? book.originalId || '' : '';
    byId('cabinet-window').setAttribute('data-scope', book ? 'notebook' : 'all');
    text(byId('cabinet-context-label'), book ? (parentOrig ? 'DENTRO DO CADERNO · ' + parentOrig.name.toUpperCase() : 'DENTRO DO CADERNO') : 'CONSULTA · TODOS OS TEXTOS');
    byId('cabinet-window').setAttribute('aria-label', book ? 'Caderno aberto: ' + book.name : 'Consulta de todos os textos');
    byId('notebook-universe').hidden = byId('notebook-chalkboard').hidden = !book;
    byId('note-project').textContent = '';
    if (notebooks) { notebooks.list().filter(availableBook).forEach(function (b) { var option = document.createElement('option'); option.value = b.id; text(option, (b.originalId && originals ? originals.get(b.originalId).name + ' / ' : '') + b.name); byId('note-project').appendChild(option); }); }
    byId('note-project').value = doc.projectId || activeNotebookId || '';
  }
  function renderNotebooks() {
    var list = byId('notebook-list'); list.textContent = '';
    if (!notebooks || !originals) { return; }
    var boxes = originals.list(), books = notebooks.list(), parents = Object.create(null), groups = Object.create(null), counts = Object.create(null), current;
    var existing = archive && archive.list(true), firstRun = byId('first-run');
    firstRun.hidden = !(books.length === 0 && boxes.length === 0 && existing && existing.documents.length === 0 && !existing.unreadable);
    boxes.forEach(function (o) { parents[o.id] = o; groups[o.id] = []; });
    books.forEach(function (b) { if (b.originalId && groups[b.originalId] && !b.trashed) { groups[b.originalId].push(b); } });
    if (archive) { archive.list().documents.forEach(function (d) { if (d.kind !== 'reminder') { counts[d.projectId] = (counts[d.projectId] || 0) + 1; } }); }
    current = parents[activeOriginalId]; if (!current || current.trashed) { activeOriginalId = null; current = null; }
    byId('original-header').hidden = !current;
    byId('original-new').hidden = !!current;
    byId('project-new').hidden = !!current;
    byId('desktop-organize').hidden = !!current;
    byId('desktop-organize-menu').hidden = true; byId('desktop-organize').setAttribute('aria-expanded','false');
    byId('volume-new').hidden = !current;
    byId('original-more-menu').hidden = true; byId('original-more').setAttribute('aria-expanded','false');
    byId('notebook-area').setAttribute('data-drawer-open', current ? 'true' : 'false');
    if (byId('desktop-surface')) { byId('desktop-surface').setAttribute('data-drawer-open', current ? 'true' : 'false'); }
    text(byId('original-title-label'), current ? current.name : 'GAVETA');
    var drawerSub = byId('original-drawer-sub');
    if (drawerSub) {
      if (current) {
        var inDrawerBooks = groups[current.id] || [];
        var inDrawerDocs = 0;
        inDrawerBooks.forEach(function (bk) { inDrawerDocs += counts[bk.id] || 0; });
        text(drawerSub, inDrawerBooks.length
          ? inDrawerBooks.length + (inDrawerBooks.length === 1 ? ' caderno' : ' cadernos') + ' · ' + inDrawerDocs + (inDrawerDocs === 1 ? ' texto guardado aqui' : ' textos guardados aqui')
          : 'Gaveta vazia — crie seu primeiro caderno aqui dentro');
      } else {
        text(drawerSub, '');
      }
    }
    byId('notebook-hint').innerHTML = current
      ? '<span class="pointer-hint">Esta gaveta guarda os cadernos desta obra. Dê dois cliques aqui para criar um caderno dentro dela.</span><span class="touch-hint">Toque em + Novo caderno para guardar um caderno nesta gaveta.</span>'
      : '<span class="pointer-hint">Dê dois cliques aqui para criar um caderno.</span><span class="touch-hint">Toque em + Novo caderno para começar.</span>';
    function cover(book) {
      var b = button(list, '', function () { openNotebook(book.id); });
      b.className = 'notebook-cover'; b.setAttribute('title', book.name); b.setAttribute('data-notebook-id', book.id); b.setAttribute('aria-label', 'Abrir caderno ' + book.name);
      b.setAttribute('aria-pressed', activeNotebookId === book.id ? 'true' : 'false');
      var face = document.createElement('span'); face.className = 'notebook-front'; face.setAttribute('aria-hidden', 'true'); b.appendChild(face);
      var strap = document.createElement('span'); strap.className = 'notebook-strap'; strap.style.backgroundColor = book.color; strap.setAttribute('data-light-strap', isLightHex(book.color) ? 'true' : 'false'); text(strap, book.name); face.appendChild(strap);
      var woven = document.createElement('span'); woven.className = 'woven-tab'; woven.setAttribute('aria-hidden', 'true'); woven.innerHTML = 'ESCREVA<b>RAL</b>'; face.appendChild(woven);
      var elastic = document.createElement('span'); elastic.className = 'notebook-elastic'; elastic.setAttribute('aria-hidden', 'true'); face.appendChild(elastic);
    }
    if (!current) {
      boxes.filter(function (o) { return !o.trashed; }).forEach(function (o) {
        var b = button(list, '', function () { openOriginal(o.id); }); b.className = 'original-box'; b.setAttribute('data-original-id', o.id); b.setAttribute('aria-label', 'Abrir gaveta ' + o.name);
        var lid = document.createElement('span'); lid.className = 'box-lid'; b.appendChild(lid);
        var stack = document.createElement('span'); stack.className = 'drawer-stack'; stack.setAttribute('aria-hidden','true'); b.appendChild(stack);
        var shown = Math.min(groups[o.id].length,4), spineIndex;
        for (spineIndex=0;spineIndex<shown;spineIndex+=1) { var spine=document.createElement('span'); spine.className='drawer-book-spine'; spine.style.borderLeftColor=groups[o.id][spineIndex].color; text(spine,groups[o.id][spineIndex].name); stack.appendChild(spine); }
        var label = document.createElement('span'); label.className = 'box-label'; b.appendChild(label);
        var tag = document.createElement('span'); tag.className = 'box-tag'; text(tag, 'GAVETA'); label.appendChild(tag);
        var titleNode = document.createElement('span'); titleNode.className = 'box-title'; text(titleNode, o.name); label.appendChild(titleNode);
        var count = 0, volumes = groups[o.id]; volumes.forEach(function (book) { count += counts[book.id] || 0; });
        var meta = document.createElement('span'); meta.className = 'box-meta'; text(meta, volumes.length + (volumes.length === 1 ? ' caderno' : ' cadernos') + ' · ' + count + (count === 1 ? ' texto' : ' textos')); label.appendChild(meta);
        var pull = document.createElement('span'); pull.className = 'box-pull'; b.appendChild(pull);
      });
    }
    books.filter(function (book) { return !book.trashed && (current ? book.originalId === current.id : !book.originalId); }).forEach(cover);
    byId('notebook-hint').hidden = false;
    notebookLabels();
  }
  function openOriginal(origId) {
    if (!originals || composing || !persist() || !rememberNotebook()) { return false; }
    var orig = originals.get(origId); if (!orig || orig.trashed) { message('Esta gaveta não está disponível.'); return false; }
    if (!closeNotebook()) { return false; }
    activeOriginalId = orig.id;
    activeNotebookId = null;
    cabinetProject = null;
    byId('cabinet-window').hidden = true;
    byId('os-window-task').hidden = true;
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    pulseSpatialEnter(byId('notebook-area'));
    byId('notebook-area').scrollTop = 0; byId('desktop-surface').scrollTop = 0;
    var focusOrig = byId('volume-new') && !byId('volume-new').hidden ? byId('volume-new') : byId('original-back');
    if (focusOrig && focusOrig.focus) { focusOrig.focus(); }
    return true;
  }
  function closeOriginal() {
    if (composing || !persist() || !rememberNotebook()) { return false; }
    var previous = activeOriginalId;
    if (!closeNotebook()) { return false; }
    activeOriginalId = null;
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    var box = previous ? byId('notebook-list').querySelector('[data-original-id="' + previous + '"]') : null;
    (box || byId('project-new')).focus();
    byId('notebook-area').scrollTop = 0; byId('desktop-surface').scrollTop = 0;
    return true;
  }
  function closeNotebook() {
    if (composing || !persist() || !rememberNotebook()) { return false; }
    var previous = activeNotebookId;
    if (!cabinetOpen && !openCabinet(false)) { return false; }
    closePanels(false); toggleStart(false); activeNotebookId = null; cabinetProject = null; showingAbout = false;
    byId('cabinet-window').hidden = true; byId('os-window-task').hidden = true;
    byId('os-window-task').setAttribute('aria-pressed', 'false');
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    var cover = previous ? byId('notebook-list').querySelector('[data-notebook-id="' + previous + '"]') : null;
    (cover || (activeOriginalId ? byId('volume-new') : byId('project-new'))).focus(); return true;
  }
  function openNotebook(bookId) {
    if (!notebooks || composing || !persist() || !rememberNotebook()) { return false; }
    var book = notebooks.get(bookId); if (!availableBook(book)) { message('Este caderno está na lixeira ou não está disponível.'); return false; }
    activeNotebookId = book.id;
    activeOriginalId = book.originalId || null;
    cabinetProject = book.name; projectScope = true; showingAbout = false;
    byId('cabinet-search').value = ''; byId('note-search').value = ''; cabinetLimit = 40;
    var entries = archive.list().documents.filter(function (d) { return d.projectId === book.id && d.kind !== 'reminder'; }), next = null;
    entries.forEach(function (d) { if (book.resume && (d.noteId || d.id) === book.resume.noteId) { next = d; } });
    next = next || entries[0];
    if (next) { loadDocument(next); } else { next = E.freshDocument(); next.projectId = book.id; next.project = book.name; loadDocument(next); }
    if (!openCabinet(false)) { return false; }
    cabinetSelection = null;
    if (book.resume && (doc.noteId || doc.id) === book.resume.noteId) {
      cabinetSelection = { noteId: book.resume.noteId, start: Math.max(0, Math.min(doc.text.length, Number(book.resume.start) || 0)), end: Math.max(0, Math.min(doc.text.length, Number(book.resume.end) || 0)), scroll: Math.max(0, Number(book.resume.scroll) || 0) };
      if (book.resume.view === 'writing') { enterDesk(true); }
    }
    renderNotebooks(); renderReminders(); notebookLabels();
    if (cabinetOpen) { pulseSpatialEnter(byId('cabinet-window')); }
    return true;
  }
  function showNotebookForm(id, target) {
    if (!notebooks) { message('A gravação está indisponível.'); return; }
    if (!checkpoint()) { return; }
    notebookReturn = document.activeElement;
    formTarget = target || 'volume';
    notebookEditing = id || null;
    var heading = '';
    if (formTarget === 'original') {
      var orig = id && originals ? originals.get(id) : null;
      heading = orig ? 'Renomear gaveta' : 'Nova gaveta';
      byId('project-name').value = orig ? orig.name : '';
    } else {
      var book = id ? notebooks.get(id) : null;
      heading = book ? 'Renomear caderno' : 'Novo caderno';
      byId('project-name').value = book ? book.name : '';
    }
    text(byId('notebook-form-heading'), heading);
    if (byId('project-create')) { text(byId('project-create'), notebookEditing ? 'Salvar' : 'Criar'); }
    text(byId('project-error'), '');
    toggleStart(false); byId('notebook-dialog').hidden = false; byId('project-form').hidden = false; byId('project-name').focus();
  }
  function hideNotebookForm() { byId('notebook-dialog').hidden = true; byId('project-form').hidden = true; if (notebookReturn) { notebookReturn.focus(); } }
  function submitNotebook(event) {
    event.preventDefault();
    try {
      var value = projectName(byId('project-name').value); if (!value) { throw new Error('Dê um nome para continuar.'); }
      if (formTarget === 'original') {
        var orig;
        if (notebookEditing) {
          orig = originals.update(notebookEditing, { name: value });
          hideNotebookForm(); renderNotebooks(); updatePath();
        } else {
          orig = originals.add(value);
          hideNotebookForm(); openOriginal(orig.id);
          message('Gaveta “' + orig.name + '” criada — você está dentro dela.');
        }
      } else {
        var book;
        if (notebookEditing) {
          book = notebooks.update(notebookEditing, { name: value });
          if (doc.projectId === book.id) { doc.project = book.name; }
          if (activeNotebookId === book.id) { cabinetProject = book.name; }
          hideNotebookForm(); renderNotebooks(); renderCabinet(); updatePath(); renderTimeline(false, null, true);
          if (workspaceUI) { workspaceUI.render(); }
        } else {
          book = notebooks.add(value, activeOriginalId || null);
          hideNotebookForm(); renderNotebooks(); openNotebook(book.id);
          if (workspaceUI) { workspaceUI.selectProject(book.id, ''); }
          message('Caderno “' + book.name + '” criado — você está dentro dele.');
        }
      }
    } catch (e) { text(byId('project-error'), e.message || 'Não foi possível guardar.'); }
  }
  var BACKUP_KEY = 'escrevaral.backup.last.v1';
  var WELCOME_KEY = 'escrevaral.welcome.seen.v1';
  var safetyDismissed = false;
  var safetyUrgent = false;
  var folderBridge = (E.backupGuard && E.backupGuard.createFolderBridge) ? E.backupGuard.createFolderBridge({ storage: storage, window: window }) : null;
  var folderMirrorTimer = 0;
  var storagePersistedState = null;

  function countArchiveWords() {
    if (!archive) { return manuscript ? E.countWords(manuscript.value || '') : 0; }
    try {
      var docsList = archive.list(false).documents || [];
      var total = 0, i, curId = doc && doc.id;
      var sawCurrent = false;
      for (i = 0; i < docsList.length; i += 1) {
        var entry = docsList[i];
        if (!entry || entry.kind === 'reminder') { continue; }
        if (curId && entry.id === curId && manuscript) {
          sawCurrent = true;
          total += E.countWords(manuscript.value || '');
        } else if (entry.text) {
          total += E.countWords(entry.text);
        }
      }
      if (!sawCurrent && manuscript && manuscript.value) {
        total += E.countWords(manuscript.value);
      }
      return total;
    } catch (ignore) { return 0; }
  }

  function updateFolderUi(meta) {
    var box = byId('local-folder-box');
    var st = byId('folder-backup-status');
    var btnConnect = byId('backup-folder-connect');
    var btnSync = byId('backup-folder-sync');
    var btnDisc = byId('backup-folder-disconnect');
    var persistEl = byId('storage-persist-status');
    if (!box || !st || !btnConnect) { return; }
    var fState = folderBridge ? folderBridge.getState() : 'unsupported';
    var fName = (folderBridge && folderBridge.getFolderName()) || (meta && meta.folderName) || '';
    var fmtTs = E.backupGuard && E.backupGuard.formatTimestamp ? E.backupGuard.formatTimestamp : function (s) { return s; };

    if (fState === 'unsupported') {
      text(st, 'Espelho automático em pasta disponível no Chrome e Edge em computador. Aqui, use “Exportar tudo” (.scrvrl) para guardar sua cópia.');
      btnConnect.hidden = true;
      if (btnSync) { btnSync.hidden = true; }
      if (btnDisc) { btnDisc.hidden = true; }
    } else if (fState === 'connected') {
      text(st, 'Pasta conectada: “' + (fName || 'Pasta local') + '”' + (meta && meta.folderSyncedAt ? ' · último espelho em ' + fmtTs(meta.folderSyncedAt) + '.' : ' · espelho automático ativo (escrevaral-backup-atual.scrvrl + 1 cópia diária).'));
      text(btnConnect, 'Trocar pasta');
      btnConnect.hidden = false;
      if (btnSync) { btnSync.hidden = false; }
      if (btnDisc) { btnDisc.hidden = false; }
    } else if (fState === 'needs-permission') {
      text(st, 'Pasta lembrada: “' + (fName || 'Pasta local') + '”. Clique em “Reativar pasta” para retomar o espelho automático nesta sessão.');
      text(btnConnect, 'Reativar pasta');
      btnConnect.hidden = false;
      if (btnSync) { btnSync.hidden = true; }
      if (btnDisc) { btnDisc.hidden = false; }
    } else {
      text(st, 'Nenhuma pasta conectada. Opcional: escolha uma pasta no computador para gravar um espelho .scrvrl automático (100% offline, sem nuvem).');
      text(btnConnect, 'Conectar pasta no computador');
      btnConnect.hidden = false;
      if (btnSync) { btnSync.hidden = true; }
      if (btnDisc) { btnDisc.hidden = true; }
    }

    if (persistEl) {
      if (storagePersistedState === true) {
        text(persistEl, 'Armazenamento persistente ativo neste navegador.');
      } else if (storagePersistedState === false) {
        text(persistEl, 'Este navegador pode limpar dados se o disco encher; mantenha cópias .scrvrl ou conecte uma pasta.');
      } else {
        text(persistEl, '');
      }
    }
  }

  function updateBackupStatus() {
    var el = byId('backup-status');
    var pill = byId('esc-backup-pill');
    var pillLabel = byId('esc-backup-pill-label');
    var guard = E.backupGuard;
    var totalWords = countArchiveWords();
    var fState = folderBridge ? folderBridge.getState() : 'unsupported';
    var meta = guard ? guard.readMeta(storage) : null;

    if (guard && meta) {
      var health = guard.evaluateHealth(meta, totalWords, fState);
      if (pill) {
        pill.setAttribute('data-health', health.level);
        pill.title = health.title;
        if (pillLabel) { text(pillLabel, health.pillLabel); }
      }
      if (el) {
        if (!meta.lastBackupAt) {
          text(el, 'Nenhuma cópia geral (.scrvrl) baixada ainda neste aparelho (' + totalWords.toLocaleString('pt-BR') + ' palavras no acervo).');
        } else {
          var deltaNote = health.wordsDelta > 0 ? ' · +' + health.wordsDelta.toLocaleString('pt-BR') + ' palavras novas' : '';
          text(el, 'Última cópia geral (.scrvrl): ' + guard.formatTimestamp(meta.lastBackupAt) + deltaNote + '.');
        }
      }
      updateFolderUi(meta);
      return health;
    }

    if (!el || !storage) { return null; }
    try {
      var raw = storage.getItem(BACKUP_KEY);
      if (!raw) {
        text(el, 'Nenhuma cópia geral (.scrvrl) baixada ainda neste aparelho.');
      } else {
        var dt = new Date(raw);
        text(el, 'Última cópia geral (.scrvrl): ' + (isNaN(dt.getTime()) ? raw : dt.toLocaleDateString('pt-BR') + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })) + '.');
      }
    } catch (ignore) {}
    return null;
  }

  function showSafetyBanner(msg, urgent) {
    var box = byId('esc-safety-banner'), txt = byId('esc-safety-text'), dis = byId('esc-safety-dismiss');
    if (!box || !txt) { return; }
    if (!urgent && (safetyDismissed || safetyUrgent)) { return; }
    safetyUrgent = !!urgent;
    text(txt, msg);
    box.setAttribute('data-urgent', urgent ? 'true' : 'false');
    if (dis) { dis.hidden = !!urgent; }
    box.hidden = false;
  }
  function hideSafetyBanner(force) {
    var box = byId('esc-safety-banner');
    if (!box) { return; }
    if (safetyUrgent && !force) { return; }
    safetyUrgent = false;
    box.hidden = true;
  }
  function recordBackupExport() {
    var totalWords = countArchiveWords();
    if (E.backupGuard && E.backupGuard.recordExport) {
      E.backupGuard.recordExport(storage, totalWords);
    } else {
      try { if (storage) { storage.setItem(BACKUP_KEY, new Date().toISOString()); } } catch (ignore) {}
    }
    if (folderBridge && folderBridge.requestStoragePersistence && storagePersistedState !== true) {
      folderBridge.requestStoragePersistence(function (ok) {
        storagePersistedState = ok;
        updateBackupStatus();
      });
    }
    safetyDismissed = true;
    hideSafetyBanner(true);
    updateBackupStatus();
  }

  function runFolderMirror(manual) {
    if (!folderBridge || folderBridge.getState() !== 'connected') { return; }
    if (document.body && document.body.getAttribute('data-locked') === 'true') { return; }
    if (!notebooks || composing || (chalkUI && !chalkUI.flush())) { return; }
    try {
      var payload = notebooks.pack(exportedDocuments(), null);
      notebooks.validate(payload);
      var totalWords = countArchiveWords();
      folderBridge.writeSnapshot(JSON.stringify(payload), totalWords, new Date(), function (err, info) {
        if (err) {
          updateBackupStatus();
          if (manual) { message('Não foi possível espelhar na pasta local: ' + (err.message || 'verifique a permissão.')); }
          return;
        }
        if (info && info.skipped) { return; }
        safetyDismissed = true;
        hideSafetyBanner(false);
        updateBackupStatus();
        if (manual) {
          message('Espelho gravado na pasta “' + (info.folderName || 'local') + '”' + (info.dailyFile ? ' (+ cópia diária).' : '.'));
        }
      });
    } catch (e) {
      if (manual) { message(e.message || 'Não foi possível preparar o espelho da pasta.'); }
    }
  }

  function scheduleFolderMirror() {
    if (!folderBridge || folderBridge.getState() !== 'connected') { return; }
    window.clearTimeout(folderMirrorTimer);
    folderMirrorTimer = window.setTimeout(function () { runFolderMirror(false); }, 4000);
  }

  function checkBackupReminder() {
    var health = updateBackupStatus();
    if (safetyDismissed || safetyUrgent || !storage || !archive) { return; }
    if (health) {
      if (health.shouldRemind && health.reminderMessage) {
        showSafetyBanner(health.reminderMessage, false);
      }
      return;
    }
    try {
      var lastRaw = storage.getItem(BACKUP_KEY);
      var stale = !lastRaw;
      if (lastRaw) {
        var ts = Date.parse(lastRaw);
        stale = !ts || (Date.now() - ts) > 7 * 86400000;
      }
      if (!stale) { return; }
      var totalWords = countArchiveWords();
      if (totalWords >= 250) {
        showSafetyBanner('Você já escreveu ' + totalWords + ' palavras neste aparelho. Guarde uma cópia (.scrvrl) para proteger seus textos.', false);
      }
    } catch (ignore) {}
  }
  function exportNotebook(all) {
    if (!notebooks || composing || (chalkUI && !chalkUI.flush())) { return; }
    try {
      var book = activeNotebook(); if (!all && !book) { throw new Error('Abra o caderno que deseja exportar.'); }
      var payload = notebooks.pack(exportedDocuments(), all ? null : book.id); notebooks.validate(payload);
      var ok = download(JSON.stringify(payload), 'application/json', all ? 'escrevaral-todos.scrvrl' : (book.name.replace(/[^A-Za-z0-9À-ÿ_-]+/g, '-').slice(0, 80) || 'volume') + '.scrvrl');
      if (all && ok) { recordBackupExport(); }
    } catch (e) { message(e.message || 'Não foi possível reunir o caderno.'); }
  }
  function notebookStorage() {
    return {
      getItem: function (k) { var b = activeNotebook(); return k === 'vrda-planner' && b ? JSON.stringify(b.data.planner || {}) : storage.getItem(k); },
      setItem: function (k, value) { var b = activeNotebook(); if (k === 'vrda-planner' && b) { b.data.planner = JSON.parse(value); notebooks.update(b.id, { data: b.data }); } else { storage.setItem(k, value); } }
    };
  }
  function wireNotebooks() {
    listen(byId('desktop-organize'), 'click', function () { var open=byId('desktop-organize-menu').hidden; closeContextMenus(false); setDisclosure('desktop-organize','desktop-organize-menu',open); });
    listen(byId('original-more'), 'click', function () { var open=byId('original-more-menu').hidden; closeContextMenus(false); setDisclosure('original-more','original-more-menu',open); });
    listen(byId('notebook-more'), 'click', function () { var open=byId('notebook-more-menu').hidden; closeContextMenus(false); setDisclosure('notebook-more','notebook-more-menu',open); });
    listen(byId('start-tools-toggle'), 'click', function () { toggleDisclosure('start-tools-toggle','start-tools-items'); });
    listen(byId('start-system-toggle'), 'click', function () { toggleDisclosure('start-system-toggle','start-system-items'); });
    listen(byId('desktop-organize-menu'), 'click', function () { setDisclosure('desktop-organize','desktop-organize-menu',false); });
    listen(byId('original-more-menu'), 'click', function () { setDisclosure('original-more','original-more-menu',false); });
    listen(byId('notebook-more-menu'), 'click', function () { setDisclosure('notebook-more','notebook-more-menu',false); });
    listen(byId('project-new'), 'click', function () { showNotebookForm(null, 'volume'); });
    listen(byId('original-new'), 'click', function () { showNotebookForm(null, 'original'); });
    listen(byId('start-new-original'), 'click', function () { showNotebookForm(null, 'original'); });
    listen(byId('original-rename'), 'click', function () { showNotebookForm(activeOriginalId, 'original'); });
    listen(byId('original-export'), 'click', function () {
      if (!notebooks || composing || !activeOriginalId || (chalkUI && !chalkUI.flush())) { return; }
      try { var o = activeOriginal(), payload = notebooks.pack(exportedDocuments(), null, o.id); notebooks.validate(payload); download(JSON.stringify(payload), 'application/json', (o.name.replace(/[^A-Za-z0-9À-ÿ_-]+/g, '-').slice(0, 80) || 'original') + '.scrvrl'); }
      catch (e) { message(e.message || 'Não foi possível exportar a gaveta.'); }
    });
    listen(byId('original-trash'), 'click', function () {
      if (!checkpoint() || !rememberNotebook()) { return; } var o = activeOriginal(); if (!o) { return; }
      E.dialog.ask({title:'Mover gaveta para a lixeira?',message:'A gaveta “' + o.name + '” irá com seus cadernos. Você poderá restaurar tudo pelo Menu → Lixeira.',accept:'Mover para a lixeira'},function (ok) {
        if (!ok || activeOriginalId !== o.id || !checkpoint() || !rememberNotebook()) { return; }
        try { originals.update(o.id, {trashed:true}); activeNotebookId = null; activeOriginalId = null; resetToAvailableOrBlank(); goHomeToEstante(); renderArchive(); renderTimeline(false); if (workspaceUI) { workspaceUI.render(); } message('Gaveta guardada na lixeira com seus cadernos.'); } catch (e) { message(e.message); }
      });
    });
    listen(byId('notebook-parent-save'), 'click', function () {
      if (!checkpoint() || !rememberNotebook()) { return; } var b = activeNotebook(); if (!b) { return; }
      try { b = notebooks.update(b.id, {originalId:byId('notebook-parent').value || null}); activeOriginalId = b.originalId; renderNotebooks(); updatePath(); saveSession(); message('Organização do caderno guardada.'); } catch (e) { message(e.message); }
    });
    listen(byId('volume-new'), 'click', function () { showNotebookForm(null, 'volume'); });
    listen(byId('original-back'), 'click', closeOriginal);
    listen(byId('path-original'), 'click', function () {
      if (activeNotebook() && activeNotebook().originalId) {
        var oid = activeNotebook().originalId;
        openOriginal(oid);
      } else {
        closeNotebook();
      }
    });
    listen(byId('project-cancel'), 'click', hideNotebookForm);
    listen(byId('start-new-notebook'), 'click', function () { showNotebookForm(); });
    listen(byId('project-form'), 'submit', submitNotebook);
    listen(byId('notebook-dialog'), 'keydown', function (event) {
      if (event.keyCode === 27) { event.preventDefault(); event.stopPropagation(); hideNotebookForm(); }
      if (event.keyCode === 9) { var first = byId('project-name'), last = byId('project-cancel'); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } event.stopPropagation(); }
    });
    listen(byId('desktop-surface'), 'dblclick', function (event) { if (event.target === this || event.target === byId('notebook-list') || event.target === byId('notebook-area') || byId('notebook-hint').contains(event.target)) { showNotebookForm(); } });
    listen(byId('notebook-rename'), 'click', function () { showNotebookForm(activeNotebookId, 'volume'); });
    listen(byId('notebook-export'), 'click', function () { exportNotebook(false); });
    listen(byId('export-notebook'), 'click', function () { exportNotebook(false); });
    listen(byId('desk-minimize'), 'click', goHomeToEstante);
    listen(byId('notebook-trash'), 'click', function () {
      if (!checkpoint()) { return; } var b = activeNotebook(); if (!b) { return; }
      E.dialog.ask({title:'Mover caderno para a lixeira?',message:'O caderno “' + b.name + '” irá com todos os seus textos. Você poderá restaurá-lo inteiro pela Lixeira ou pelo Menu → Lixeira.',accept:'Mover para a lixeira'},function(ok){
        if (!ok || activeNotebookId !== b.id || !notebooks.get(b.id)) { return; }
        try {
          if (!checkpoint() || !rememberNotebook()) { return; }
          var keepOriginalId = b.originalId || null;
          notebooks.update(b.id, { trashed: true });
          if (archive) {
            (archive.list(true).documents || []).filter(function (d) { return d.projectId === b.id && !d.trashed; }).forEach(function (d) {
              try { archive.trash(d, true); } catch (ignore) {}
            });
          }
          activeNotebookId = null;
          resetToAvailableOrBlank();
          activeOriginalId = keepOriginalId;
          closeNotebook();
          renderArchive(); renderTimeline(false);
          if (workspaceUI) { workspaceUI.render(); }
          message('Caderno movido para a lixeira. Você pode restaurar o caderno inteiro pela Lixeira.');
        } catch (e) { message('Não foi possível mover o caderno.'); }
      });
    });
    listen(window, 'storage', function (event) { if (event.key === 'escrevaral.astra.notebooks.v1' || event.key === 'escrevaral.astra.originais.v1' || event.key === 'escrevaral.astra.notebooks.transaction.v1') { if (storage.getItem('escrevaral.astra.notebooks.transaction.v1')) { return; } renderNotebooks(); var b = activeNotebook(); if (b) { cabinetProject = b.name; if (doc.projectId === b.id) { doc.project = b.name; } updatePath(); } } });
    renderNotebooks(); notebookReady = true;
  }

  function byId(id) { return document.getElementById(id); }
  function text(node, value) { node.textContent = value; }
  function listen(node, event, fn) { node.addEventListener(event, fn, false); }
  function paragraph(parent, value, className) { var p = document.createElement('p'); if (className) { p.className = className; } text(p, value); parent.appendChild(p); return p; }
  function button(parent, label, fn) { var b = document.createElement('button'); b.type = 'button'; text(b, label); listen(b, 'click', fn); parent.appendChild(b); return b; }
  var toastTimer = null;
  function showToast(value) {
    var toast = byId('esc-toast');
    if (!toast || !value) { return; }
    var v = String(value);
    if (v === 'Guardado neste aparelho.' || v === 'A folha é sua.' || v === 'Folha aberta.') { return; }
    text(toast, v);
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 2800);
  }
  function message(value) { text(saveStatus, value); text(byId('cabinet-status'), value); text(byId('panel-status'), value); if (activePanel === 'acervo') { text(byId('archive-status'), value); } showToast(value); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function timeLabel(date) { return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()); }
  function noteDate(entry) { return entry.created || entry.updated; }
  function metadata(entry) { return { id: entry.id, noteId: entry.noteId || entry.id, kind: entry.kind, title: entry.title, text: entry.text || '', project: entry.project || '', projectId: entry.projectId || '', created: noteDate(entry), updated: entry.updated, createdApproximate: !entry.created || !!entry.createdApproximate }; }
  function monthLabel(key) { return months[Number(key.slice(5, 7)) - 1] + ' ' + key.slice(0, 4); }
  function dayLabel(key) { var d = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))); return d.getDate() + ' · ' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][d.getDay()]; }
  function openNote(entry) {
    if (composing || entry.id === doc.id || !persist()) { return; }
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
  var drawerRouteSignature = '';
  function renderDrawerRoute() {
    if (!notebooks || !originals) { return; }
    var books = notebooks.list().filter(availableBook), drawers = originals.list().filter(function (o) { return !o.trashed; });
    var signature = JSON.stringify([activeNotebookId, books.map(function (b) { return [b.id,b.name,b.originalId,b.color]; }), drawers.map(function (o) { return [o.id,o.name]; })]);
    if (signature === drawerRouteSignature) { return; }
    drawerRouteSignature = signature;
    var route = byId('drawer-route'); route.textContent = '';
    function group(id, name) {
      var children = books.filter(function (b) { return (b.originalId || '') === id; });
      if (!id && !children.length) { return; }
      var tray = document.createElement('details'), front = document.createElement('summary'), contents = document.createElement('div');
      tray.className = 'route-drawer'; tray.open = children.some(function (b) { return b.id === activeNotebookId; });
      front.title = name; text(front, name); tray.appendChild(front); contents.className = 'route-books'; tray.appendChild(contents);
      children.forEach(function (book) {
        var link = button(contents, book.name, function () {
          if (book.id === activeNotebookId) { collapseTimeline(); manuscript.focus(); return; }
          if (openNotebook(book.id)) { enterDesk(true); collapseTimeline(); }
        });
        link.setAttribute('data-route-book', book.id); link.setAttribute('title', book.name); link.setAttribute('aria-label', 'Escrever no caderno ' + book.name);
        link.setAttribute('aria-current', book.id === activeNotebookId ? 'true' : 'false');
        var spine = document.createElement('span'); spine.className = 'route-spine'; spine.style.backgroundColor = book.color; spine.setAttribute('aria-hidden','true'); link.insertBefore(spine,link.firstChild);
      });
      if (!children.length) { paragraph(contents, 'Nenhum caderno nesta gaveta.', 'quiet'); }
      route.appendChild(tray);
    }
    drawers.forEach(function (o) { group(o.id,o.name); }); group('', 'Na mesa');
  }
  function renderTimeline(refresh, previousId, reveal) {
    renderDrawerRoute();
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
    var entries = timelineEntries.filter(function (entry) { return entry.kind !== 'reminder' && (!activeNotebookId || entry.projectId === activeNotebookId); });
    var model = E.browseNotes(entries, { month: navMonth, day: navDay, query: byId('note-search').value });
    if (inProject) { model.notes = entries.slice().sort(function (a, b) { return a.created < b.created ? -1 : a.created > b.created ? 1 : 0; }); }
    text(byId('desk-project'), doc.project || 'Folhas avulsas');
    byId('scope-project').setAttribute('aria-pressed', projectScope ? 'true' : 'false');
    byId('scope-dates').setAttribute('aria-pressed', projectScope ? 'false' : 'true');
    var path = byId('date-path'); path.textContent = ''; path.hidden = inProject;
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
    if (!archive) {
      message('Sem gravação neste navegador. Baixe uma cópia em Ajustes.');
      showSafetyBanner('Sem gravação disponível neste navegador. Seu texto está aberto — exporte uma cópia agora.', true);
      return false;
    }
    try {
      var previousId = doc.id, saved = archive.save(doc,forceHistory); doc = saved.document; dirty = false; forceHistory=false;
      hideSafetyBanner(true);
      message(saved.conflict ? 'Outra versão foi preservada no acervo.' : 'Guardado neste aparelho.');
      try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Só a preferência de abertura falhou. */ }
      if (!byId('acervo').hidden) { renderArchive(); }
      renderTimeline(false, previousId); refreshCounts(); saveSession();
      if (workspaceUI) { workspaceUI.render(); }
      checkPostWritePwa();
      checkBackupReminder();
      scheduleFolderMirror();
      if (E.ptbrPanelSaved) { E.ptbrPanelSaved(saved.conflict); }
      return true;
    } catch (e) {
      message('Não foi possível guardar. Seu texto está na folha; baixe uma cópia em Ajustes.');
      showSafetyBanner('Espaço do navegador esgotado ou bloqueado. Seu texto está aberto — exporte uma cópia (.scrvrl) agora.', true);
      return false;
    }
  }
  function isStandaloneApp() {
    var standalone = false;
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        standalone = true;
      }
      if (typeof navigator.standalone === 'boolean' && navigator.standalone) {
        standalone = true;
      }
    } catch (ignore) {}
    return standalone;
  }
  function checkPostWritePwa() {
    if (isStandaloneApp() || !deferredInstallPrompt) { return; }
    try {
      if (storage && storage.getItem('escrevaral.pwa.dismissed') === '1') { return; }
    } catch (ignore) {}
    if (doc && doc.revision >= 1 && (doc.text || '').trim().length > 20) {
      var banner = byId('post-write-pwa');
      if (banner && banner.hidden) {
        banner.hidden = false;
        var actionBtn = byId('post-write-pwa-action');
        if (actionBtn && deferredInstallPrompt) { actionBtn.hidden = false; }
      }
    }
  }
  function invalidate() {
    if (pendingAnalysis === null && !activeLens && !byId('findings').childNodes.length) { return; }
    analysisEpoch+=1;window.clearTimeout(pendingAnalysis); pendingAnalysis = null;
    byId('findings').textContent = ''; snapshot = ''; activeLens = '';
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = false; lensButtons[i].setAttribute('aria-pressed', 'false'); }
    text(analysisStatus, 'O manuscrito mudou. Escolha uma lente quando quiser examinar de novo.');
  }
  function changed() {
    analysisRange = null;
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
    mirror.style.boxSizing = style.boxSizing || 'border-box';
    mirror.style.font = style.font; mirror.style.fontFamily = style.fontFamily; mirror.style.fontSize = style.fontSize;
    mirror.style.lineHeight = style.lineHeight; mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.paddingTop = style.paddingTop; mirror.style.paddingRight = style.paddingRight;
    mirror.style.paddingBottom = style.paddingBottom; mirror.style.paddingLeft = style.paddingLeft;
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
  function typingLineTarget() {
    if (immersion && visualMachine && visualMachine.anchorY() !== null && manuscript.getBoundingClientRect) {
      var rect = manuscript.getBoundingClientRect();
      var anchorOffset = visualMachine.anchorY() - rect.top;
      if (isFinite(anchorOffset) && anchorOffset > 40 && anchorOffset < manuscript.clientHeight) {
        return anchorOffset;
      }
    }
    return manuscript.clientHeight * 0.42;
  }
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
    var nextScroll = Math.max(0, Math.round(position.top + position.line / 2 - typingLineTarget()));
    if (Math.abs(manuscript.scrollTop - nextScroll) > 1) {
      manuscript.scrollTop = nextScroll;
    }
    updateFocus();
    if (machineEnabled) { aimMachineStrike(position); }
  }
  function followTyping() {
    cancelTypewriter();
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript) { return; }
    typewriterTimer = window.setTimeout(centerTypingLine, 20);
  }
  function dismissSelection() { dismissedSelection = copiedSelection; byId('selection-tools').hidden = true; }
  function captureSelection() {
    if (composing || activePanel || cabinetOpen || !byId('start-menu').hidden || document.activeElement !== manuscript) { return; }
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) { copiedSelection = null; dismissedSelection = null; byId('selection-tools').hidden = true; return; }
    /* Regra do Superfoco: modo foco é exclusivo para escrita fluida; qualquer seleção volta ao Modo Nota */
    if (immersion) {
      setImmersion(false, 'selection');
    }
    if (dismissedSelection && dismissedSelection.documentId === (doc.noteId || doc.id) && dismissedSelection.text === manuscript.value && dismissedSelection.start === start && dismissedSelection.end === end) { return; }
    dismissedSelection = null;
    copiedSelection = { documentId: doc.noteId || doc.id, text: manuscript.value, start: start, end: end };
    if (wordCardUI && wordCardUI.trimWordSelection && wordCardUI.trimWordSelection(manuscript.value.slice(start, end), start)) {
      byId('selection-tools').hidden = true;
      return;
    }
    byId('selection-tools').hidden = false; text(byId('clipboard-status'), 'Trecho selecionado');
  }
  function copyInternal() {
    if (composing || !copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { return false; }
    internalClipboard = manuscript.value.slice(copiedSelection.start, copiedSelection.end);
    byId('desk-paste').hidden = false; byId('selection-paste').disabled = false;
    text(byId('clipboard-status'), 'Cópia interna guardada'); return true;
  }
  function pasteInternal() {
    if (composing || !internalClipboard) { return; }
    var start = manuscript.selectionStart || 0, end = manuscript.selectionEnd || start;
    manuscript.value = manuscript.value.slice(0, start) + internalClipboard + manuscript.value.slice(end);
    if (E.cartorio) { E.cartorio.recordSignal(doc, 'intPaste', internalClipboard.length); }
    E.transfer.selectRange(manuscript, start + internalClipboard.length, start + internalClipboard.length); manuscript.focus();
    copiedSelection = null; byId('selection-tools').hidden = true; changed(); queueSession();
  }
  function toggleStart(open) {
    if (open) { analysisRange = null; dismissSelection(); closePanels(false); }
    if (open) { setDisclosure('start-tools-toggle','start-tools-items',false); setDisclosure('start-system-toggle','start-system-items',false); }
    byId('start-menu').hidden = !open;
    byId('os-start').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { byId('start-projects').focus(); }
  }
  function setDisclosure(toggleId,panelId,open) {
    var toggle=byId(toggleId),panel=byId(panelId); if(!toggle||!panel){return;}
    panel.hidden=!open;toggle.setAttribute('aria-expanded',open?'true':'false');
  }
  function toggleDisclosure(toggleId,panelId) {
    var panel=byId(panelId);if(!panel){return;}setDisclosure(toggleId,panelId,panel.hidden);
  }
  function closeContextMenus(restoreFocus) {
    var pairs=[['desktop-organize','desktop-organize-menu'],['original-more','original-more-menu'],['notebook-more','notebook-more-menu']],changed=false,focus=null,i;
    for(i=0;i<pairs.length;i+=1){if(!byId(pairs[i][1]).hidden){changed=true;focus=focus||byId(pairs[i][0]);setDisclosure(pairs[i][0],pairs[i][1],false);}}
    if(changed&&restoreFocus&&focus&&!focus.hidden){focus.focus();}return changed;
  }
  function saveSession() {
    if (!sessionReady || !storage) { return; }
    try {
      storage.setItem(sessionKey, JSON.stringify({ version: 1, view: cabinetOpen ? 'gabinete' : 'mesa', documentId: doc.noteId || doc.id,
        recordId: doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop || 0,
        notebookId: activeNotebookId, originalId: activeOriginalId, project: cabinetProject, panel: activePanel, immersion: immersion, month: navMonth, day: navDay, projectScope: projectScope,
        search: byId('cabinet-search').value, noteSearch: byId('note-search').value,
        windowHidden: byId('cabinet-window').hidden, maximized: byId('cabinet-window').getAttribute('data-maximized') === 'true',
        left: byId('cabinet-window').style.left || '', top: byId('cabinet-window').style.top || '' }));
    } catch (e) { message('O estado da tela não foi guardado. Confira sua cópia do acervo.'); }
  }
  function checkpoint() { if (chalkUI && !chalkUI.flush()) { return false; } if (composing) { return false; } window.clearTimeout(sessionTimer); var ok = persist(); if (ok) { saveSession(); } return ok; }
  function queueSession() {
    if (!sessionReady || composing) { return; }
    window.clearTimeout(sessionTimer); sessionTimer = window.setTimeout(checkpoint, 350);
  }
  function restoreSession() {
    if (!storage) { return; }
    try {
      var state = JSON.parse(storage.getItem(sessionKey) || 'null'), saved;
      if (!state || state.version !== 1) { return; }
      activeNotebookId = notebooks && state.notebookId && availableBook(notebooks.get(state.notebookId)) ? state.notebookId : null;
      activeOriginalId = originals && state.originalId && originals.get(state.originalId) && !originals.get(state.originalId).trashed ? state.originalId : null;
      saved = typeof state.recordId === 'string' ? archive.get(state.recordId) : null;
      if (saved && !saved.trashed && saved.kind !== 'reminder' && (!saved.projectId || availableBook(notebooks.get(saved.projectId)))) { loadDocument(saved); }
      if (state.windowHidden) { activeNotebookId = null; activeOriginalId = originals && state.originalId && originals.get(state.originalId) && !originals.get(state.originalId).trashed ? state.originalId : null; }
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
        E.transfer.selectRange(manuscript, start, end); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
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
        E.transfer.selectRange(manuscript, savedStart, savedEnd); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
        cabinetSelection = { noteId: doc.noteId || doc.id, start: savedStart, end: savedEnd, scroll: manuscript.scrollTop };
      }
      updatePath();
    } catch (e) { message('Não foi possível retomar a tela anterior. O acervo foi preservado.'); }
  }
  function renderReminders() {
    var list = byId('reminder-list'); list.textContent = '';
    if (!archive) { return; }
    try {
      archive.list(true).documents.filter(function (entry) { return entry.kind === 'reminder' && !entry.trashed && (activeNotebookId ? entry.projectId === activeNotebookId : !entry.projectId); }).forEach(function (entry) {
        var card = document.createElement('div'), field = document.createElement('textarea'), saved = entry;
        card.className = 'desktop-reminder'; field.value = entry.text; field.setAttribute('aria-label', 'Post-it'); field.setAttribute('maxlength', '2000');
        field.rows = 4; card.appendChild(field);
        listen(field, 'input', function () {
          var next = JSON.parse(JSON.stringify(saved)); next.text = field.value; next.title = field.value.split(/\r?\n/)[0].slice(0, 60) || 'Post-it';
          try { saved = archive.save(next).document; text(byId('reminder-status'), 'Post-it guardado.'); }
          catch (e) { text(byId('reminder-status'), 'Não foi possível guardar. Copie este post-it antes de sair.'); }
        });
        var discard = button(card, '', function () { E.dialog.ask({title:'Mover post-it para a lixeira?',message:'Você poderá restaurá-lo pelo menu Início.',accept:'Mover para a lixeira'},function(ok){ if(ok){ trashEntry(saved); byId('reminder-new').focus(); } }); });
        discard.className = 'reminder-trash'; discard.setAttribute('aria-label', 'Mover post-it para a lixeira'); discard.setAttribute('title', 'Mover para a lixeira');
        discard.innerHTML = '<svg class="reminder-trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>'; list.appendChild(card);
      });
    } catch (e) { text(byId('reminder-status'), 'Não foi possível ler os post-its.'); }
  }
  function isDocumentActiveInArchive(candidate) {
    if (!candidate) { return false; }
    if (!archive) { return true; }
    var stored = archive.get(candidate.id);
    if (!stored || stored.trashed) { return false; }
    if (stored.projectId && notebooks && !availableBook(notebooks.get(stored.projectId))) { return false; }
    return true;
  }
  function resetToAvailableOrBlank() {
    var remaining = archive ? archive.list().documents : [];
    var next = remaining.length ? remaining[0] : null;
    cabinetSelection = null;
    if (next) {
      loadDocument(next);
      try { if (storage) { storage.setItem('escrevaral.astra.current', next.id); } } catch (ignore) {}
    } else {
      activeNotebookId = null;
      activeOriginalId = null;
      cabinetProject = null;
      loadDocument(E.freshDocument());
      try { if (storage) { storage.removeItem('escrevaral.astra.current'); } } catch (ignore) {}
    }
  }
  function ensureActiveDocumentStillValid(removedIds, removedProjectId) {
    if (!doc) { return false; }
    var curId = doc.id;
    var curNoteId = doc.noteId || doc.id;
    var explicitlyRemoved = false;
    if (removedIds && removedIds.length) {
      explicitlyRemoved = removedIds.indexOf(curId) !== -1 || removedIds.indexOf(curNoteId) !== -1;
    }
    if (!explicitlyRemoved && removedProjectId && doc.projectId === removedProjectId) {
      explicitlyRemoved = true;
    }
    var projectInvalid = !!(doc.projectId && notebooks && !availableBook(notebooks.get(doc.projectId)));
    var savedButGone = !!doc.revision && !isDocumentActiveInArchive(doc);
    if (explicitlyRemoved || projectInvalid || savedButGone) {
      resetToAvailableOrBlank();
      return true;
    }
    if (activeNotebookId && notebooks && !availableBook(notebooks.get(activeNotebookId))) {
      activeNotebookId = null;
      cabinetProject = null;
      updatePath();
    }
    return false;
  }
  function askIrreversibleDelete(firstStep, secondStep, onConfirm) {
    E.dialog.ask({
      title: firstStep.title || 'Excluir definitivamente?',
      message: firstStep.message,
      accept: firstStep.accept || 'Continuar exclusão'
    }, function (okFirst) {
      if (!okFirst) { return; }
      E.dialog.ask({
        title: (secondStep && secondStep.title) || 'Segunda confirmação — ação irreversível',
        message: (secondStep && secondStep.message) || 'Esta exclusão é definitiva e não pode ser desfeita. O conteúdo não irá para a lixeira. Confirma apagar para sempre?',
        accept: (secondStep && secondStep.accept) || 'Sim, excluir para sempre'
      }, function (okSecond) {
        if (!okSecond) { return; }
        onConfirm();
      });
    });
  }
  function trashEntry(entry) {
    if (!archive || !persist()) { return; }
    if (entry && entry.locked) { message('Esta folha de referência está protegida contra exclusão.'); return; }
    var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
    try {
      archive.trash(isCurrent ? doc : entry);
      ensureActiveDocumentStillValid([entry.id, entry.noteId || entry.id], null);
      renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
      if (workspaceUI) { workspaceUI.render(); }
      message('Movido para a lixeira. Você pode restaurar pela Lixeira.');
    } catch (e) { message('Não foi possível mover para a lixeira. A folha foi preservada.'); }
  }
  function purgeEntrySafe(entry) {
    if (!archive || !entry) { return false; }
    var isCurrent = doc && (entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id));
    if (isCurrent && dirty) { persist(); }
    var targetId = isCurrent && doc && doc.id ? doc.id : entry.id;
    var latest = archive.get(targetId);
    if (!latest && entry.noteId) {
      var all = archive.list(true).documents || [];
      var idx;
      for (idx = 0; idx < all.length; idx += 1) {
        if ((all[idx].noteId || all[idx].id) === entry.noteId) { latest = all[idx]; break; }
      }
    }
    if (!latest) { return false; }
    if (!latest.trashed) {
      var trashedRes = archive.trash(latest, true);
      latest = (trashedRes && trashedRes.document) ? trashedRes.document : archive.get(latest.id);
    }
    if (!latest) { return false; }
    archive.purge(latest);
    linguisticStore.removeDocument('analysis/' + (latest.projectId || 'avulsos') + '/' + (latest.noteId || latest.id) + '/');
    return true;
  }
  function askDelete(entry) {
    if (!archive || !entry) { return; }
    if (entry.locked) { message('Esta folha de referência está protegida contra exclusão.'); return; }
    var isCurrent = doc && (entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id));
    if (isCurrent && dirty) { persist(); }
    var label = entry.title || (entry.kind === 'reminder' ? 'Post-it' : 'Sem título');
    var noun = entry.kind === 'reminder' ? 'O post-it' : 'O texto';
    var firstMsg = entry.trashed
      ? noun + ' “' + label + '” será apagado definitivamente da lixeira deste aparelho. Não será possível restaurar esta cópia.'
      : noun + ' “' + label + '” será apagado definitivamente deste aparelho, sem passar pela lixeira. Para poder recuperar depois, use “Lixeira” em vez de excluir.';
    askIrreversibleDelete({
      title: 'Excluir definitivamente?',
      message: firstMsg,
      accept: 'Continuar exclusão'
    }, {
      title: 'Segunda confirmação — exclusão irreversível',
      message: 'Atenção: ' + noun.toLowerCase() + ' “' + label + '” será removido para sempre deste aparelho e não poderá ser recuperado. Arquivos já exportados (.scrvrl) não são apagados. Confirma?',
      accept: 'Sim, excluir para sempre'
    }, function () {
      try {
        purgeEntrySafe(entry);
        ensureActiveDocumentStillValid([entry.id, entry.noteId || entry.id], null);
        renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
        if (workspaceUI) { workspaceUI.render(); }
        if (activePanel === 'acervo' && byId('trash-toggle')) { byId('trash-toggle').focus(); }
        message('Cópia excluída definitivamente deste aparelho.');
      } catch (e) {
        text(byId('archive-status'), e.message);
        message(e.message || 'Não foi possível excluir esta cópia.');
      }
    });
  }

  function updatePath() {
    var project = cabinetOpen ? cabinetProject : projectName(doc.project), currentId, names = { oficina: 'Examinar', acervo: 'Acervo', mesa: 'Ajustes', 'lineage-panel':'Versões' };
    var crumbBook = cabinetOpen
      ? (activeNotebook() || null)
      : (doc && doc.projectId && notebooks ? notebooks.get(doc.projectId) : null);
    if (crumbBook && !availableBook(crumbBook)) { crumbBook = null; }
    var orig = cabinetOpen ? activeOriginal() : null;
    if (!orig && crumbBook && crumbBook.originalId && originals) {
      orig = originals.get(crumbBook.originalId);
      if (orig && orig.trashed) { orig = null; }
    }
    if (orig && (cabinetOpen ? (activeOriginalId || project !== null) : true)) {
      byId('path-original-separator').hidden = false;
      byId('path-original').hidden = false;
      text(byId('path-original'), orig.name);
      byId('path-original').setAttribute('title', 'Gaveta: ' + orig.name);
    } else {
      byId('path-original-separator').hidden = true;
      byId('path-original').hidden = true;
    }
    var locBar = byId('location-path');
    if (locBar && locBar.style && locBar.style.setProperty) {
      locBar.style.setProperty('--esc-crumb-book-color', crumbBook && crumbBook.color ? crumbBook.color : '#6f8e68');
    }
    byId('path-project').hidden = byId('path-project-separator').hidden = project === null;
    byId('path-project').setAttribute('data-has-book', crumbBook ? 'true' : 'false');
    text(byId('path-project'), project || 'Textos avulsos');
    byId('path-project').setAttribute('title', crumbBook ? 'Caderno: ' + crumbBook.name : (project || 'Textos avulsos'));
    if (byId('path-folder')) { var hasFolder = !cabinetOpen && !!(doc.folder && doc.folder.length); byId('path-folder').hidden = byId('path-folder-separator').hidden = !hasFolder; text(byId('path-folder'), doc.folder || ''); }
    byId('path-document').hidden = byId('path-document-separator').hidden = cabinetOpen;
    text(byId('path-document'), title.value || 'Sem título');
    byId('path-document').setAttribute('title', title.value || 'Sem título');
    var showEstanteCrumb = cabinetOpen && !activePanel && project === null && !activeOriginalId && (!byId('cabinet-window') || byId('cabinet-window').hidden);
    byId('path-panel').hidden = byId('path-panel-separator').hidden = !activePanel && !showEstanteCrumb;
    text(byId('path-panel'), activePanel ? (activePanel === 'utilidades' ? byId('utility-heading').textContent : activePanel === 'focus-pause' ? 'Pausa' : names[activePanel] || '') : showEstanteCrumb ? 'Estante de cadernos' : '');
    var pathRet = byId('esc-path-return');
    if (pathRet) {
      var showReturn = !!(cabinetOpen || activePanel);
      pathRet.hidden = !showReturn;
      if (showReturn) {
        text(pathRet, activePanel ? '← Fechar painel' : '← Voltar à escrita');
      }
    }
    currentId = activePanel || showEstanteCrumb ? 'path-panel' : !cabinetOpen ? 'path-document' : project !== null ? 'path-project' : activeOriginalId ? 'path-original' : 'path-projects';
    ['path-home', 'path-projects', 'path-original', 'path-project', 'path-document', 'path-panel'].forEach(function (id) {
      var el = byId(id);
      if (el) { el.removeAttribute('aria-current'); if (id === currentId) { el.setAttribute('aria-current', 'location'); } }
    });
  }
  function goHomeToEstante() {
    if (composing || !persist() || !rememberNotebook()) { return false; }
    if (!cabinetOpen && !openCabinet(false)) { return false; }
    closePanels(false);
    toggleStart(false);
    activeOriginalId = null;
    activeNotebookId = null;
    cabinetProject = null;
    showingAbout = false;
    byId('cabinet-window').hidden = true;
    byId('os-window-task').hidden = true;
    byId('os-window-task').setAttribute('aria-pressed', 'false');
    renderNotebooks();
    renderReminders();
    updatePath();
    queueSession();
    var target = byId('project-new');
    if (target && !target.hidden) { target.focus(); }
    byId('notebook-area').scrollTop = 0;
    byId('desktop-surface').scrollTop = 0;
    return true;
  }
  function pathToProjects(all) {
    if (all) {
      goHomeToEstante();
      return;
    }
    if (cabinetOpen) {
      var selected = cabinetProject;
      cabinetProject = selected; byId('cabinet-search').value = ''; renderCabinet();
      return;
    }
    if (workspaceUI) {
      if (doc.projectId) { workspaceUI.selectProject(doc.projectId, doc.folder || ''); }
      else { workspaceUI.selectLibrary('all'); }
    }
  }
  function sizeWorkspace() {
    var area = byId('writing-space');
    if (area.style && window.innerHeight) {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      var topBar = byId('location-path').offsetHeight || 44;
      var bottomBar = byId('system-bar').offsetHeight || 0;
      var cabinetBottomBar = bottomBar || 44;
      area.style.height = Math.max(0, height - topBar - bottomBar) + 'px';
      byId('gabinete').style.height = Math.max(0, height - topBar - cabinetBottomBar) + 'px';
      byId('machine-shell').style.height = height + 'px';
      sizePanels(height, topBar, bottomBar);
      document.body.setAttribute('data-viewport', height < 360 ? 'small' : height < 480 ? 'compact' : 'full');
      var browser = byId('note-browser');
      if (browser.style) { browser.style.height = window.innerWidth <= 760 && height < 480 ? Math.max(84, height - 108) + 'px' : ''; }
    }
    typewriterInsets(); growManuscript(); followTyping(); renderTimeline(false, null, true);
  }
  function sizePanels(height,topBar,bottomBar) {
    var desktop = window.innerWidth > 760;
    panelIds.forEach(function(id){var p=byId(id),margin=desktop?0:8,available=Math.max(0,height-topBar-bottomBar-margin*2),width=id==='utilidades'?(p.getAttribute('data-tool')==='calculator'?340:p.getAttribute('data-tool')==='calendar'?420:380):id==='lineage-panel'?560:(id==='sobre'||id==='usos-lingua')?560:440;
      p.style.bottom='auto';p.style.top=(topBar+(id==='focus-pause'?0:margin))+'px';
      if(id==='focus-pause'){p.style.height=Math.max(0,height-topBar-bottomBar)+'px';p.style.maxHeight='none';return;}
      p.style.width=(!desktop?Math.max(0,window.innerWidth-margin*2):Math.min(width,Math.max(0,window.innerWidth-margin*2)))+'px';
      p.style.right=margin+'px';
      p.style.height=desktop?available+'px':'auto';
      p.style.maxHeight=available+'px';
    });
  }
  function revealSelection(start, end, fallbackMessage) {
    returnToWriting();
    if (typeof richUI !== 'undefined' && richUI && richUI.isRich()) {
      if (!richUI.revealRange(start, end)) { message(fallbackMessage || 'Selecione o trecho manualmente no manuscrito.'); return false; }
      return true;
    }
    if (!E.transfer.selectRange(manuscript, start, end)) { message(fallbackMessage || 'Selecione o trecho manualmente no manuscrito.'); return false; }
    if (!window.getComputedStyle) { return true; }
    manuscript.scrollTop = Math.max(0, textPosition(start).top - manuscript.clientHeight / 3); updateFocus(); return true;
  }
  function collapseTimeline() {
    byId('desk-documents').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'false');
  }
  function closePanels(restore) {
    if (E.ptbrPanelReset) { E.ptbrPanelReset(); }
    invalidate();
    var trigger = panelTrigger;
    if (trigger && trigger.setAttribute) { trigger.setAttribute('aria-expanded', 'false'); }
    panelIds.forEach(function (id, i) { byId(id).hidden = true; byId(panelToggles[i]).setAttribute('aria-expanded', 'false'); });
    activePanel = ''; panelTrigger = null; updatePath();
    byId('panel-backdrop').hidden = true; document.body.setAttribute('data-panel', 'closed');
    byId('writing-space').removeAttribute('aria-hidden'); byId('gabinete').removeAttribute('aria-hidden');
    if (restore && trigger && trigger.focus) { if (/^start-/.test(trigger.id || '') && byId('start-menu').hidden) { byId('os-start').focus(); } else { trigger.focus(); } } queueSession();
  }
  function showPanel(id, toggle, open) {
    dismissSelection();
    if (!open) { if (activePanel === id) { if (id === 'oficina') { analysisRange = null; } closePanels(true); } return; }
    if (immersion) { setImmersion(false, 'panel'); }
    closePanels(false); collapseTimeline();
    panelTrigger = byId(toggle); activePanel = id; text(byId('panel-status'), '');
    byId(id).hidden = false; byId(toggle).setAttribute('aria-expanded', 'true');
    byId('panel-backdrop').hidden = false; document.body.setAttribute('data-panel', 'open');
    byId(id).focus(); byId('writing-space').setAttribute('aria-hidden', 'true'); byId('gabinete').setAttribute('aria-hidden', 'true');
    if (id === 'mesa') { notebookLabels(); }sizePanels(window.visualViewport?window.visualViewport.height:window.innerHeight,byId('location-path').offsetHeight,byId('system-bar').offsetHeight);
    updatePath(); queueSession();
  }
  function openExaminePanel(options) {
    options = options || {};
    if (dirty && archive && !composing) { persist(); }
    analysisRange = options.range || null;
    showPanel('oficina', options.toggle || 'examinar-toggle', true);
    if (E.ptbrPanelOpen) { E.ptbrPanelOpen({ group: options.group, lens: options.lens }); return; }
    if (options.lens) { examine(options.lens); return; }
    if (options.legacyLens) {
      for (var j = 0; j < lensButtons.length; j += 1) {
        if (lensButtons[j].getAttribute('data-lens') === options.legacyLens) { lensButtons[j].focus(); break; }
      }
      return;
    }
    if (E.ptbrPanelFocus) { E.ptbrPanelFocus(); } else { lensButtons[0].focus(); }
  }
  function setImmersion(enabled, reason) {
    var start = manuscript.selectionStart, end = manuscript.selectionEnd, scroll = manuscript.scrollTop;
    var oldInset = manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0;
    cancelTypewriter(); closePanels(false); collapseTimeline();
    document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false');
    immersion = enabled; document.body.setAttribute('data-immersion', enabled ? 'true' : 'false');
    byId('immersion-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    byId('leave-focus').hidden = !enabled;
    if (visualMachine) { visualMachine.setFocusActive(enabled); }
    if (superfocoUI) { superfocoUI.notifyState(enabled, reason || (enabled ? 'manual' : 'manual')); }
    if (richUI && richUI.isRich() && byId('esc-rich-editor')) {
      byId('esc-rich-editor').focus();
    } else {
      manuscript.focus();
    }
    sizeWorkspace();
    if (!(richUI && richUI.isRich())) {
      if (typeof start === 'number') { E.transfer.selectRange(manuscript, start, end); }
      manuscript.scrollTop = Math.max(0, scroll + (manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0) - oldInset);
    }
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
    if (visualMachine) {
      visualMachine.setEnabled(enabled);
      byId('machine-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
      text(byId('machine-toggle'), enabled ? 'Desativar' : 'Ativar');
      sizeWorkspace();
      return;
    }
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
    var ptTitle = byId('print-title'), ptText = byId('print-text');
    if (document.body && document.body.getAttribute('data-locked') === 'true') {
      finishPrint();
      return;
    }
    if (printStudioUI && printStudioUI.prepareQuickPrint) {
      if (printStudioUI.prepareQuickPrint()) { return; }
    }
    if (!ptTitle || !ptText) { return; }
    var cleanTitle = title && typeof title.value === 'string' ? title.value : '';
    text(ptTitle, cleanTitle);
    ptTitle.hidden = !cleanTitle;
    var isRichNow = (richUI && richUI.isRich && richUI.isRich()) || (doc && doc.format === 'rich' && doc.richHtml);
    if (isRichNow && E.richEditor && E.richEditor.sanitizeHtml) {
      var liveHtml = (richUI && richUI.isRich && richUI.isRich()) ? richUI.html() : doc.richHtml;
      ptText.className = 'is-rich';
      ptText.innerHTML = E.richEditor.sanitizeHtml(liveHtml || '');
    } else {
      ptText.className = 'is-plain';
      ptText.textContent = '';
      var rawText = manuscript && typeof manuscript.value === 'string' ? manuscript.value : '';
      var blocks = rawText.replace(/\r\n?/g, '\n').split(/\n{2,}/);
      var bi, blockText, pEl;
      for (bi = 0; bi < blocks.length; bi += 1) {
        blockText = blocks[bi].replace(/^\n+|\n+$/g, '');
        if (!blockText) { continue; }
        pEl = document.createElement('p');
        text(pEl, blockText);
        ptText.appendChild(pEl);
      }
    }
  }
  function finishPrint() {
    if (printStudioUI && printStudioUI.finishPrint) {
      printStudioUI.finishPrint();
      return;
    }
    var ptText = byId('print-text');
    var ptTitle = byId('print-title');
    if (ptTitle) { text(ptTitle, ''); }
    if (ptText) { ptText.className = ''; ptText.innerHTML = ''; }
  }
  function returnToWriting() { analysisRange = null; if (cabinetOpen) { enterDesk(); } closePanels(false); collapseTimeline(); manuscript.focus(); }
  function loadDocument(next) {
    if(E.ptbrPanelReset){E.ptbrPanelReset();}
    analysisRange = null; copiedSelection = null; byId('selection-tools').hidden = true;
    doc = next;
    if (doc.projectId) {
      activeNotebookId = doc.projectId;
      cabinetProject = doc.project || '';
      var loadedBook = notebooks && notebooks.get(doc.projectId);
      activeOriginalId = loadedBook ? loadedBook.originalId || null : null;
    } else {
      activeNotebookId = null;
      activeOriginalId = null;
      cabinetProject = null;
    }
    navDay = E.noteDateKey(doc); navMonth = navDay.slice(0, 7); timelineCount = 40; title.value = doc.title; manuscript.value = doc.text; dirty = false; manuscript.scrollTop = 0; E.transfer.selectRange(manuscript, 0, 0); growManuscript();
    invalidate(); text(analysisStatus, 'Nenhuma análise iniciada.');
    byId('reset-dismissed').hidden = !doc.dismissed.length;
    var isLockedRef = !!(doc.locked || doc.category === 'reference');
    title.readOnly = isLockedRef;
    manuscript.readOnly = isLockedRef;
    if (byId('esc-reference-banner')) { byId('esc-reference-banner').hidden = !isLockedRef; }
    var refView = byId('esc-reference-view');
    if (refView) {
      if (isLockedRef && E.renderReferenceView) {
        refView.hidden = false;
        if (byId('editor-viewport')) { byId('editor-viewport').hidden = true; }
        E.renderReferenceView(refView, doc.title, doc.text, function () { trashEntry(doc); });
      } else {
        refView.hidden = true;
        if (byId('editor-viewport')) { byId('editor-viewport').hidden = false; }
      }
    }
    if (richUI) { richUI.loadDoc(doc); }
    if (wordCardUI) { wordCardUI.hide(false); }
    if (sonnetUI) { sonnetUI.sync(doc); }
    if (songUI) { songUI.sync(doc); }
    if (immersion && isLockedRef) { setImmersion(false, 'locked'); }
    else if (immersion && visualMachine) { visualMachine.layout(); }
    if (superfocoUI) { superfocoUI.resetDocument(); }
    message(doc.revision ? 'Guardado neste aparelho.' : 'A folha é sua.'); updatePath();
    renderTimeline(true, null, true); refreshCounts();
    if (workspaceUI) { workspaceUI.render(); }
  }
  function renderArchive() {
    var list = byId('document-list'); list.textContent = '';
    if (!archive) { text(byId('archive-status'), 'O acervo não está disponível. Sua folha continua aberta.'); return; }
    try {
      var result = archive.list(trashView);
      if (trashView) { result.documents = result.documents.filter(function (entry) { return !!entry.trashed; }); }
      else if (activeNotebookId) { result.documents = result.documents.filter(function (entry) { return entry.projectId === activeNotebookId; }); }
      if (trashView && originals) { originals.list().filter(function (o) { return o.trashed; }).forEach(function (o) { var li = document.createElement('li'); paragraph(li, 'Gaveta: ' + o.name); button(li, 'Restaurar gaveta completa', function () { try { originals.update(o.id, {trashed:false}); renderNotebooks(); renderArchive(); message('Gaveta restaurada com seus cadernos.'); } catch (e) { message(e.message); } }); list.appendChild(li); }); }
      if (trashView && notebooks) { notebooks.list().filter(function (b) { return b.trashed && (!b.originalId || !originals.get(b.originalId).trashed); }).forEach(function (b) { var li = document.createElement('li'); paragraph(li, 'Caderno: ' + b.name); button(li, 'Restaurar caderno completo', function () { try { notebooks.update(b.id, { trashed: false }); if (archive) { (archive.list(true).documents || []).filter(function (d) { return d.projectId === b.id && !!d.trashed; }).forEach(function (d) { try { archive.trash(d, false); } catch (ignore) {} }); } renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false); if (workspaceUI) { workspaceUI.render(); } message('Caderno restaurado com todo o conteúdo.'); } catch (e) { message(e.message); } }); list.appendChild(li); }); }
      text(byId('acervo-heading'), trashView ? 'Lixeira' : 'Acervo');
      text(byId('trash-toggle'), trashView ? 'Voltar ao acervo' : 'Lixeira'); byId('trash-toggle').setAttribute('aria-pressed', trashView ? 'true' : 'false');
      var hasAnyTrashItem = list.children.length > 0 || result.documents.length > 0;
      text(byId('archive-status'), result.unreadable ? 'Algumas folhas não puderam ser lidas. Os registros originais foram preservados.' : hasAnyTrashItem ? '' : trashView ? 'A lixeira está vazia.' : 'Sua primeira folha começa aqui.');
      result.documents.forEach(function (entry) {
        var li = document.createElement('li');
        if (trashView) {
          paragraph(li, entry.title || (entry.kind === 'reminder' ? 'Post-it' : 'Sem título'));
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
  /* A revisão progressiva respeita as escolhas já mantidas no caderno. */
  E.ptbrPanelDocument=function(){return doc.noteId||doc.id;};
  E.ptbrPanelTitle=function(){return (title&&title.value?title.value:(doc.title||''))||'Nota sem título';};
  E.ptbrPanelRevision=function(){return doc.id+'|'+doc.revision;};
  E.ptbrPanelRequest=function(snapshot,start,end){return E.analysisContract.request(doc,snapshot,start,end);};
  E.ptbrPanelCurrent=function(request){return E.analysisContract.current(request,doc,manuscript.value);};
  E.ptbrPanelKeep=function(f,source,key){
    if(source!==manuscript.value||key!==(doc.noteId||doc.id)){return false;}
    var choice=findingKey(f),added=doc.dismissed.indexOf(choice)<0,wasDirty=dirty;if(added){doc.dismissed.push(choice);dirty=true;}
    var saved=persist();if(!saved&&added){doc.dismissed.splice(doc.dismissed.indexOf(choice),1);dirty=wasDirty;}byId("reset-dismissed").hidden=!doc.dismissed.length;return saved;
  };
  E.ptbrPanelChoices=function(){ return (doc.dismissed||[]).slice(); };
  E.ptbrPanelReveal=revealSelection;
  E.ptbrPanelFlush=function(){if(dirty&&archive&&!composing){return persist();}return true;};
  E.ptbrPanelSelection=function(){return analysisRange&&analysisRange.documentId===(doc.noteId||doc.id)&&analysisRange.text===manuscript.value?analysisRange:null;};
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
  E.ptbrLegacyCancel = invalidate;
  function examine(lens) {
    if (composing) { return; }
    if (E.ptbrPanelReset) { E.ptbrPanelReset(); }
    invalidate();
    if(dirty&&archive){persist();}snapshot = manuscript.value; activeLens = lens;
    var selected = analysisRange && analysisRange.documentId === (doc.noteId || doc.id) && analysisRange.text === snapshot ? analysisRange : null;
    var request = E.analysisContract.request(doc, snapshot, selected ? selected.start : 0, selected ? selected.end : snapshot.length);
    byId('findings').textContent = '';
    text(analysisStatus, 'Observando o manuscrito…');
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = false; lensButtons[i].setAttribute('aria-pressed', lensButtons[i].getAttribute('data-lens') === lens ? 'true' : 'false'); }
    var token=++analysisEpoch;
    pendingAnalysis=window.setTimeout(function(){
      function complete(record){
        if(token!==analysisEpoch){return;}pendingAnalysis=null;
        try{
          if(!E.analysisContract.current(request,doc,manuscript.value)){invalidate();return;}
          var cached=E.linguistics.match(record,lens,request),result=cached?JSON.parse(JSON.stringify(record.result)):E.analysisContract.analyze(vault,lens,request);
          if(cached){result.source=JSON.parse(JSON.stringify(request.source));result.processing={mode:'persistido'};}
          if(!cached||!E.linguistics.fromDoc(doc,lens,request)){var saved=E.linguistics.remember(doc,request,result);if(saved){dirty=true;persist();linguisticStore.put('analysis/'+(doc.projectId||'avulsos')+'/'+(doc.noteId||doc.id)+'/'+lens,saved);}}
          renderResult(result);linguisticStore.corpus();
        }catch(e){text(analysisStatus,e.message);}
        for(var j=0;j<lensButtons.length;j+=1){lensButtons[j].disabled=false;}
      }
      var record=E.linguistics.fromDoc(doc,lens,request);if(record){complete(record);}else{linguisticStore.get('analysis/'+(doc.projectId||'avulsos')+'/'+(doc.noteId||doc.id)+'/'+lens,complete);}
    },20);
  }

  function showTransfer(contents, name, importing) {
    showPanel('mesa', 'mesa-toggle', true);
    byId('transfer-box').hidden = false;
    byId('transfer-content').value = contents; byId('transfer-content').readOnly = !importing;
    byId('transfer-name').value = name; byId('transfer-name').readOnly = !importing;
    byId('transfer-import').hidden = !importing;
    text(byId('transfer-help'), importing ? 'Cole o conteúdo completo do arquivo. Ele será conferido antes de pedir sua confirmação.' : 'O download não ficou disponível. Copie todo este conteúdo e guarde em um arquivo de texto com o nome indicado. Esta cópia contém exatamente o que seria baixado.');
    byId('transfer-content').focus();
  }
  function download(contents, mime, name, host) {
    var isBinary = typeof contents !== 'string';
    var saved = E.transfer.download(contents, mime, name, function (value, filename) { showTransfer(value, filename, false); }, host);
    if (saved) {
      message('Cópia preparada. Confira o arquivo salvo.');
    } else if (isBinary) {
      message('Não foi possível iniciar o download neste navegador.');
    } else {
      message('Cópia disponível em Ajustes para selecionar e guardar.');
    }
    return saved;
  }
  function exportedDocuments() {
    var result = archive ? archive.list(true) : { documents: [], unreadable: 0 };
    if (result.unreadable) { throw new Error('Há folhas ilegíveis no acervo.'); }
    var entries = result.documents, current = JSON.parse(JSON.stringify(doc)), found = false;
    var draftChanged = current.title !== title.value || current.text !== manuscript.value;
    current.title = title.value; current.text = manuscript.value;
    if (draftChanged && E.cartorio && E.cartorio.sealDocument) {
      current.revision = (current.revision || 0) + 1;
      current.updated = new Date().toISOString();
      current.cartorio = E.cartorio.sealDocument(doc, current, null, true);
    }
    entries = entries.map(function (entry) { if (entry.id === current.id) { found = true; return current; } return entry; });
    if (!found && (current.revision || dirty || current.title || current.text)) { entries.push(current); }
    return entries;
  }
  function buildImportedDocsFromEditorial(parsed, bookName) {
    var list = [], i, ch, entry;
    var chapters = (parsed && parsed.chapters && parsed.chapters.length) ? parsed.chapters : [{ title: parsed.title || 'Texto importado', text: parsed.text || '' }];
    for (i = 0; i < chapters.length; i += 1) {
      ch = chapters[i];
      entry = E.freshDocument();
      entry.title = String(ch.title || parsed.title || ('Capítulo ' + (i + 1))).slice(0, 140);
      entry.text = String(ch.text || '');
      entry.project = bookName;
      if (E.cartorio) { entry.cartorio = E.cartorio.sealDocument(null, entry, 'imported'); }
      list.push(entry);
    }
    return list;
  }
  function importFile(file) {
    if (!file) { return; }
    if (file.size > 50000000) { message('Traga pacotes de até 50 MB por vez.'); return; }
    if (!notebooks || !archive || !checkpoint()) { message('A gravação precisa estar disponível para importar um caderno.'); return; }
    if (/\.docx$/i.test(file.name) && E.editorialImport && E.transfer && E.transfer.readBinary) {
      E.transfer.readBinary(file, function (error, buf) {
        if (error) { message(error.message); return; }
        try {
          var parsed = E.editorialImport.parseDocxBytes(buf, file.name);
          var bookLabel = parsed.chapters.length > 1
            ? parsed.title
            : (activeNotebook() ? activeNotebook().name + ' — importado' : parsed.title);
          importDocsArray(buildImportedDocsFromEditorial(parsed, bookLabel));
        } catch (e) {
          message((e && e.message ? e.message : 'Não foi possível ler este arquivo .docx.') + ' O acervo anterior foi preservado.');
        }
      });
      return;
    }
    E.transfer.read(file, function (error, contents) {
      if (error) { message(error.message); return; }
      importContents(contents, file.name, file.type);
    });
  }
  function importDocsArray(docs) {
    var payload = null, converted = [];
    try {
      docs = JSON.parse(JSON.stringify(docs));
      docs.forEach(function (d) {
        if (d.kind === 'reminder' && !projectName(d.project)) { delete d.projectId; return; }
        var title = projectName(d.project) || 'Avulsos', book = null;
        converted.forEach(function (b) { if (b.name === title) { book = b; } });
        if (!book) { book = { id: 'book-' + E.freshDocument().id, name: title, aliases: [], color: '#c4cfc2', data: {} }; converted.push(book); }
        d.projectId = book.id; d.project = book.name;
      });
      payload = { format: 'escrevaral-cadernos', version: 1, scope: 'all', notebooks: converted, documents: docs, globals: {}, inventory: { notebooks: converted.length, documents: docs.length } };
      notebooks.validate(payload);
      var notice = 'Importar ' + payload.notebooks.length + ' caderno(s) e ' + payload.documents.length + ' registro(s)? Cadernos já existentes serão preservados; os repetidos entrarão como cópias.';
      E.dialog.ask({ title: 'Importar manuscrito?', message: notice, accept: 'Importar' }, function (ok) {
        if (!ok) { message('Importação cancelada. O acervo anterior foi preservado.'); return; }
        try {
          var result = E.installPackage(storage, notebooks, archive, payload, { sessionKey: sessionKey });
          renderNotebooks(); renderCabinet(); if (workspaceUI) { workspaceUI.render(); }
          if (result && result.documents && result.documents.length) {
            var opened = archive.get(result.documents[0]);
            if (opened) { loadDocument(opened); enterDesk(false); }
          }
          message('Importação concluída: ' + payload.documents.length + ' texto(s) trazido(s) sem alterar o acervo anterior.');
        } catch (err) {
          message((err && err.message ? err.message : 'Falha ao importar.') + ' O acervo anterior foi preservado.');
        }
      });
    } catch (e) {
      message((e && e.message ? e.message : 'Arquivo inválido.') + ' O acervo anterior foi preservado.');
    }
  }
  function importContents(contents, name, type) {
    if (typeof contents !== 'string' || contents.length > 50000000) { message('Traga uma cópia menor, em partes de até 50 milhões de unidades de texto.'); return; }
    if (!notebooks || !archive || !checkpoint()) { message('A gravação precisa estar disponível para importar um caderno.'); return; }
    function importError(e) { message((e.name === 'QuotaExceededError' ? 'Faltou espaço para importar o pacote.' : e instanceof SyntaxError ? 'O arquivo não contém uma cópia válida.' : e.message) + ' O acervo anterior foi preservado.'); }
    try {
      var payload, docs, converted = [], i;
      if (/\.(scrvrl|json)$/i.test(name)) {
        payload = JSON.parse(contents);
        if (payload && payload.format === 'escrevaral-astra' && payload.version === 1 && Object.prototype.toString.call(payload.documents) === '[object Array]' && payload.documents.every(E.validDocument)) {
          docs = payload.documents; payload = null;
        }
      } else if (/\.(md|markdown)$/i.test(name) && E.editorialImport) {
        var mdParsed = E.editorialImport.parseMarkdown(contents, name);
        var mdBook = mdParsed.chapters.length > 1
          ? mdParsed.title
          : (activeNotebook() ? activeNotebook().name + ' — importado' : mdParsed.title);
        docs = buildImportedDocsFromEditorial(mdParsed, mdBook);
      } else if (/\.txt$/i.test(name) || type === 'text/plain') {
        var entry = E.freshDocument(); entry.title = name.replace(/\.txt$/i, ''); entry.text = String(contents); entry.project = activeNotebook() ? activeNotebook().name + ' — importado' : 'Texto importado';
        if (E.cartorio) { entry.cartorio = E.cartorio.sealDocument(null, entry, 'imported'); }
        docs = [entry];
      } else { throw new Error('Traga um caderno .scrvrl, um Word .docx, um Markdown .md, uma cópia .json ou um texto .txt.'); }
      if (docs) {
        docs = JSON.parse(JSON.stringify(docs));
        docs.forEach(function (d) {
          if (d.kind === 'reminder' && !projectName(d.project)) { delete d.projectId; return; }
          var title = projectName(d.project) || 'Avulsos', book = null;
          converted.forEach(function (b) { if (b.name === title) { book = b; } });
          if (!book) { book = { id: 'book-' + E.freshDocument().id, name: title, aliases: [], color: '#c4cfc2', data: {} }; converted.push(book); }
          d.projectId = book.id; d.project = book.name;
        });
        payload = { format: 'escrevaral-cadernos', version: 1, scope: 'all', notebooks: converted, documents: docs, globals: {}, inventory: { notebooks: converted.length, documents: docs.length } };
      }
      notebooks.validate(payload);
      var incomingGlobals = Object.keys(payload.globals).filter(function (k) { return k !== sessionKey && k !== 'escrevaral.astra.current'; });
      var notice = 'Importar ' + payload.notebooks.length + ' caderno(s) e ' + payload.documents.length + ' registro(s)? Cadernos já existentes serão preservados; os repetidos entrarão como cópias.';
      if (incomingGlobals.length) { notice += ' Esta cópia completa também restaura as preferências e o calendário geral do arquivo, substituindo os atuais.'; }
      E.dialog.ask({title:'Importar cadernos?',message:notice,accept:'Importar'},function(ok){
        if (!ok) { return; }
        try {
          if (!checkpoint() || !rememberNotebook()) { return; }
          var result = notebooks.bring(payload);
          activeNotebookId = null; activeOriginalId = null; cabinetProject = null; loadDocument(E.freshDocument());
          closeNotebook(); renderNotebooks(); renderReminders(); renderCabinet(); byId('cabinet-window').hidden = true;
          if (incomingGlobals.length) { window.location.reload(); return; }
          message(result.notebooks + ' caderno(s) importado(s), ' + result.documents + ' registro(s)' + (result.copies ? '; ' + result.copies + ' como cópia' : '') + '.');
        } catch (e) { importError(e); }
      });
    } catch (e) { importError(e); }
  }
  function silenceSound() {
    if (E.machineSound && E.machineSound.silence) { E.machineSound.silence(); }
    if (audio) { try { if (audio.suspend) { audio.suspend(); } } catch (ignore) {} }
  }
  function stopSound() {
    if (E.machineSound) { E.machineSound.setEnabled(false, storage, true); }
    byId('som').checked = false;
    text(byId('sound-status'), 'Som desligado.');
    if (audio) { try { if (audio.close) { audio.close(); } else if (audio.suspend) { audio.suspend(); } } catch (ignore) {} audio = null; }
  }
  function playKey(event) {
    if (E.machineSound) { E.machineSound.handleKey(event); }
  }
  function playInput(event) {
    if (E.machineSound && E.machineSound.handleInput) { E.machineSound.handleInput(event); }
  }
  function resetCompSound() {
    if (E.machineSound && E.machineSound.resetComposition) { E.machineSound.resetComposition(); }
  }
  function unlockAudio() {
    if (E.machineSound && E.machineSound.unlock) { E.machineSound.unlock(); }
  }
  /* Gabinete: apresentação do acervo real; o editor e as engines permanecem os mesmos. */
  var cabinetOpen = false, cabinetProject = null, cabinetLimit = 40, cabinetTimer = null, cabinetSelection = null;
  var desktopDrag = null;
  function desktopWindow(action, focus) {
    if (notebookReady && action !== 'open') { return closeNotebook(); }
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
    if (!found && (doc.revision || dirty || title.value || manuscript.value) && (!doc.projectId || (notebooks && availableBook(notebooks.get(doc.projectId))))) { result.documents.unshift(doc); }
    return result;
  }
  function renderCabinet() {
    updatePath(); queueSession();
    var result, list = byId('cabinet-notes'), projects = byId('cabinet-projects'), groups = [], query = byId('cabinet-search').value;
    try { result = cabinetDocuments(); } catch (e) { message('Não foi possível ler o acervo. Seus registros foram preservados.'); return; }
    list.textContent = ''; projects.textContent = '';
    if (notebooks) { notebooks.list().filter(availableBook).forEach(function (book) {
      var b = button(projects, book.name, function () { openNotebook(book.id); }); b.className = 'project-link'; b.setAttribute('aria-pressed', activeNotebookId === book.id ? 'true' : 'false');
    }); }
    notebookLabels();
    byId('cabinet-all').setAttribute('aria-pressed', cabinetProject === null ? 'true' : 'false');
    var scoped = result.documents.filter(function (entry) { return !activeNotebookId || entry.projectId === activeNotebookId; });
    var entries = query ? E.browseNotes(scoped, { query: query }).notes.reverse() : scoped;
    text(byId('cabinet-heading'), query ? (activeNotebookId ? 'Busca neste caderno' : 'Busca no gabinete') : cabinetProject === null ? 'Seus textos' : cabinetProject || 'Textos avulsos');
    text(byId('cabinet-count'), entries.length + (entries.length === 1 ? ' texto' : ' textos'));
    byId('cabinet-clear').hidden = !query;
    var showWelcome = (entries.length === 0 && !query && activeNotebookId === null) || showingAbout;
    byId('cabinet-window').setAttribute('data-welcome', showWelcome ? 'true' : 'false');
    var welcomeEl = byId('welcome-reception');
    if (welcomeEl) {
      welcomeEl.hidden = !showWelcome;
      var backNotesBtn = byId('welcome-back-notes');
      if (backNotesBtn) {
        backNotesBtn.hidden = !showingAbout || entries.length === 0;
      }
      var pwaBtn = byId('welcome-pwa-btn');
      if (pwaBtn) {
        pwaBtn.hidden = !deferredInstallPrompt || isStandaloneApp();
      }
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      var iosHint = byId('welcome-ios-hint');
      if (iosHint) {
        iosHint.hidden = !isIOS || isStandaloneApp();
      }
    }
    byId('cabinet-notes').hidden = showWelcome;
    var filesLabel = document.querySelector('.files-label');
    if (filesLabel) { filesLabel.hidden = showWelcome; }
    var cabinetContext = document.querySelector('#cabinet-window .cabinet-context');
    if (cabinetContext) { cabinetContext.hidden = showWelcome; }
    var cabinetHeading = document.querySelector('.cabinet-heading');
    if (cabinetHeading) { cabinetHeading.hidden = showWelcome; }
    byId('cabinet-empty').hidden = showWelcome || entries.length > 0;
    text(byId('cabinet-empty'), query ? 'Nenhum texto encontrado. Tente outro título ou trecho.' : 'Seu caderno está pronto. Crie um texto para começar.');
    byId('cabinet-more').hidden = showWelcome || entries.length <= cabinetLimit;
    byId('cabinet-resume').hidden = showWelcome || !(doc.revision || title.value || manuscript.value) || !!query || (cabinetProject !== null && cabinetProject !== projectName(doc.project));
    text(byId('resume-title'), title.value || 'Sem título');
    text(byId('resume-date'), projectName(doc.project) || 'Texto avulso');
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
    if (notebookReady && !activeNotebookId && doc.projectId && notebooks && availableBook(notebooks.get(doc.projectId))) {
      var resyncBook = notebooks.get(doc.projectId);
      activeNotebookId = resyncBook.id;
      activeOriginalId = resyncBook.originalId || null;
      cabinetProject = resyncBook.name;
      notebookLabels();
    }
    toggleStart(false);
    closePanels(false); collapseTimeline(); desktopDrag = null; cabinetOpen = false; byId('gabinete').hidden = true; byId('writing-space').hidden = false;
    document.body.setAttribute('data-view', 'workspace'); updatePath(); refreshCounts();
    sizeWorkspace(); cancelTypewriter();
    if (focusEditor !== false) { manuscript.focus(); }
    if (cabinetSelection && cabinetSelection.noteId === (doc.noteId || doc.id)) {
      E.transfer.selectRange(manuscript, cabinetSelection.start, cabinetSelection.end); manuscript.scrollTop = cabinetSelection.scroll;
    }
    growManuscript();
    if (workspaceUI) { workspaceUI.render(); }
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
    sizeWorkspace();
    if (doc.projectId && !activeNotebookId && availableBook(notebooks.get(doc.projectId))) { activeNotebookId = doc.projectId; }
    if (activeNotebookId) { var openedBook = notebooks.get(activeNotebookId); if (openedBook) { cabinetProject = openedBook.name; } }
    desktopWindow('open', false); renderCabinet(); if (!initial) { byId('cabinet-heading').focus(); } return true;
  }
  function cabinetPanel(id, trigger) {
    if (id === 'acervo') { renderArchive(); }
    showPanel(id, trigger, true);
  }
  function chooseFont(value) {
    var style = value === 'maquina' ? 'maquina' : 'literaria';
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    document.body.setAttribute('data-letter', style);
    byId('font-literary').setAttribute('aria-pressed', style === 'literaria' ? 'true' : 'false');
    byId('font-typewriter').setAttribute('aria-pressed', style === 'maquina' ? 'true' : 'false');
    var dfBtn = byId('desk-font'), dfLbl = dfBtn && dfBtn.querySelector ? dfBtn.querySelector('.esc-btn-label') : null;
    text(dfLbl || dfBtn, style === 'maquina' ? 'Courier Prime' : 'Noto Serif');
    focusMeasure = null; typewriterInsets(); growManuscript();
    if (typeof start === 'number') { E.transfer.selectRange(manuscript, start, end); }
    try { if (storage) { storage.setItem('escrevaral.astra.letter', style); } } catch (ignore) { /* Préférence facultativa. */ }
  }

  try {
    storage = window.localStorage; notebooks = E.createNotebooks(storage);
    originals = notebooks.originals;
    var rawArchive = E.createArchive(storage);
    notebooks.migrate(rawArchive.list(true).documents);
    archive = {
      get: function (id) { var d = rawArchive.get(id); return d ? notebooks.decorate(d) : null; },
      list: function (all) { var hidden = Object.create(null), hiddenOriginals = Object.create(null); originals.list().forEach(function (o) { if (o.trashed) { hiddenOriginals[o.id] = true; } }); notebooks.list().forEach(function (b) { if (b.trashed || hiddenOriginals[b.originalId]) { hidden[b.id] = true; } }); var r = rawArchive.list(all); r.documents = r.documents.map(notebooks.decorate).filter(function (d) { return all || !hidden[d.projectId]; }); return r; },
      save: function (d, forceHistory) { return rawArchive.save(notebooks.decorate(d), forceHistory); },
      trash: rawArchive.trash, purge: rawArchive.purge
    };
    var currentId = storage.getItem('escrevaral.astra.current'), current = currentId ? archive.get(currentId) : null;
    if (!current || current.trashed || current.kind === 'reminder' || (current.projectId && !availableBook(notebooks.get(current.projectId)))) { current = archive.list().documents[0]; }
    if (!current && !archive.list(true).documents.length && !notebooks.list().length && storage.getItem(WELCOME_KEY) !== '1') {
      try {
        var welcomeDoc = E.freshDocument();
        welcomeDoc.title = 'Comece por aqui — seu gabinete de escrita';
        welcomeDoc.text =
          'Seus textos ficam guardados apenas neste aparelho, sem cadastro e sem nuvem. Você pode apagar esta nota ou escrever direto por cima.\n\n' +
          '• Para começar uma obra organizada (livro, conto, soneto ou diário), clique em “+ Novo projeto” à esquerda. Para escrever solto, use “+ Nova nota”.\n\n' +
          '• Selecione qualquer palavra no texto para consultar sinônimos, ou clique em “Examinar” para revisar ritmo, repetições, gramática e poesia.\n\n' +
          '• Como tudo vive neste navegador, guarde uma cópia de segurança de tempos em tempos em Ajustes → “Exportar tudo”.';
        current = archive.save(welcomeDoc, false).document;
        storage.setItem(WELCOME_KEY, '1');
        storage.setItem('escrevaral.astra.current', current.id);
      } catch (ignore) {}
    }
    loadDocument(current || E.freshDocument());
    updateBackupStatus();
    if (folderBridge) {
      folderBridge.restore(function () { updateBackupStatus(); });
      folderBridge.checkStoragePersistence(function (persisted) {
        storagePersistedState = persisted;
        updateBackupStatus();
      });
    }
    applyTheme(storage.getItem('escrevaral.astra.theme'));
    focusEnabled = storage.getItem('escrevaral.astra.focus') !== 'off'; byId('focus-toggle').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');
  } catch (e) {
    message('A gravação pode estar indisponível. Seu texto está aberto; baixe uma cópia em Ajustes.');
    showSafetyBanner('A gravação automática parece bloqueada neste navegador (ex.: janela anônima). Baixe uma cópia antes de fechar.', true);
  }
  if (byId('esc-safety-export')) { listen(byId('esc-safety-export'), 'click', function () { exportNotebook(true); }); }
  if (byId('esc-safety-dismiss')) { listen(byId('esc-safety-dismiss'), 'click', function () { safetyDismissed = true; hideSafetyBanner(false); }); }
  if (byId('esc-backup-pill')) {
    listen(byId('esc-backup-pill'), 'click', function () {
      showPanel('mesa', 'mesa-toggle', true);
      var box = byId('local-folder-box');
      if (box && box.scrollIntoView) { try { box.scrollIntoView({ block: 'center' }); } catch (ignore) {} }
      var targetBtn = (byId('backup-folder-connect') && !byId('backup-folder-connect').hidden) ? byId('backup-folder-connect') : byId('export-backup');
      if (targetBtn && targetBtn.focus) { targetBtn.focus(); }
    });
  }
  if (byId('backup-folder-connect')) {
    listen(byId('backup-folder-connect'), 'click', function () {
      if (!folderBridge) { return; }
      if (document.body && document.body.getAttribute('data-locked') === 'true') { return; }
      var action = folderBridge.getState() === 'needs-permission' ? folderBridge.reconnect : folderBridge.connect;
      action(function (err, info) {
        if (err) {
          message(err.message || 'Não foi possível conectar a pasta local.');
          updateBackupStatus();
          return;
        }
        if (info && info.cancelled) { return; }
        updateBackupStatus();
        if (folderBridge.requestStoragePersistence) {
          folderBridge.requestStoragePersistence(function (ok) {
            storagePersistedState = ok;
            updateBackupStatus();
          });
        }
        runFolderMirror(true);
      });
    });
  }
  if (byId('backup-folder-sync')) {
    listen(byId('backup-folder-sync'), 'click', function () { runFolderMirror(true); });
  }
  if (byId('backup-folder-disconnect')) {
    listen(byId('backup-folder-disconnect'), 'click', function () {
      if (!folderBridge) { return; }
      folderBridge.disconnect(function () {
        window.clearTimeout(folderMirrorTimer);
        updateBackupStatus();
        message('Pasta local desconectada. Os arquivos já gravados permanecem no seu computador.');
      });
    });
  }
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
  listen(byId('machine-toggle'), 'click', function () { setMachine(visualMachine ? !visualMachine.isEnabled() : !machineEnabled); });
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
  if (byId('esc-open-about')) {
    listen(byId('esc-open-about'), 'click', function () { showPanel('sobre', 'esc-open-about', byId('sobre').hidden); });
  }
  if (byId('open-about-from-settings')) {
    listen(byId('open-about-from-settings'), 'click', function () { showPanel('sobre', 'esc-open-about', true); });
  }
  if (byId('sobre-close')) {
    listen(byId('sobre-close'), 'click', function () { showPanel('sobre', 'esc-open-about', false); });
  }
  if (byId('sobre-open-cartorio')) {
    listen(byId('sobre-open-cartorio'), 'click', function () {
      closePanels(false);
      if (byId('esc-open-cartorio')) { byId('esc-open-cartorio').click(); }
    });
  }
  if (byId('sobre-open-backup')) {
    listen(byId('sobre-open-backup'), 'click', function () { showPanel('mesa', 'mesa-toggle', true); });
  }
  listen(byId('examinar-toggle'), 'click', function () { var open = byId('oficina').hidden; if (open) { openExaminePanel({ toggle: 'examinar-toggle' }); } else { showPanel('oficina', 'examinar-toggle', false); } });
  listen(byId('back-writing'), 'click', returnToWriting);
  function createNewNote(opts) {
    opts = opts || {};
    if (!persist()) { return; }
    var targetId = typeof opts.projectId === 'string' && opts.projectId ? opts.projectId : (opts.projectId === null ? '' : (activeNotebook() ? activeNotebookId : ''));
    var book = targetId && notebooks ? notebooks.get(targetId) : null;
    if (book && !availableBook(book)) { book = null; }
    var next = E.freshDocument();
    if (book) { next.projectId = book.id; next.project = book.name; activeNotebookId = book.id; }
    if (opts.folder) { next.folder = String(opts.folder).slice(0, 120); }
    loadDocument(next);
    dirty = true;
    persist();
    cabinetSelection = null;
    enterDesk(false);
    if (workspaceUI) { workspaceUI.flashEink(); workspaceUI.render(); }
    manuscript.focus();
  }
  function newDocument() { createNewNote(); }
  function startFirstText() {
    showingAbout = false;
    if (!notebooks || !originals || !archive) { text(byId('first-run-status'), 'O armazenamento não está disponível. Verifique as permissões do navegador.'); return; }
    var existing;
    try { existing = archive.list(true); } catch (e) { text(byId('first-run-status'), 'Não foi possível conferir os textos existentes. Nenhum caderno foi criado.'); return; }
    if (notebooks.list().length || originals.list().length || existing.documents.length || existing.unreadable) { newDocument(); return; }
    if (composing || !checkpoint()) { return; }
    try {
      var book = notebooks.add('Meu primeiro caderno', null);
      if (!openNotebook(book.id)) { text(byId('first-run-status'), 'O caderno foi criado, mas não foi possível abri-lo. Encontre-o na mesa.'); return; }
      newDocument();
      if (!byId('writing-space').hidden) { manuscript.focus(); }
    } catch (e) { text(byId('first-run-status'), 'Não foi possível criar o caderno. Nenhum texto anterior foi alterado.'); renderNotebooks(); }
  }
  listen(byId('first-run-write'), 'click', startFirstText);
  listen(byId('new-document'), 'click', newDocument);
  listen(byId('timeline-new'), 'click', newDocument);
  for (var i = 0; i < lensButtons.length; i += 1) { listen(lensButtons[i], 'click', function () { examine(this.getAttribute('data-lens')); }); }
  listen(byId('reset-dismissed'), 'click', function () { doc.dismissed = []; dirty = true; persist(); byId('reset-dismissed').hidden = true; invalidate(); text(analysisStatus, 'Escolhas liberadas. Escolha uma lente para examinar de novo.'); if(E.ptbrPanelLiberate){E.ptbrPanelLiberate('Escolhas liberadas. Escolha uma lente para examinar de novo.');}else if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} });
  function applyTheme(value) {
    var theme = value === 'escuro' ? 'escuro' : 'claro';
    document.body.setAttribute('data-theme', theme); byId('tema').value = theme;
    byId('theme-light').setAttribute('aria-pressed', theme === 'claro' ? 'true' : 'false');
    byId('theme-dark').setAttribute('aria-pressed', theme === 'escuro' ? 'true' : 'false');
  }
  function chooseTheme(value) { applyTheme(value); try { if (storage) { storage.setItem('escrevaral.astra.theme', byId('tema').value); } } catch (ignore) { /* Tema não bloqueia a escrita. */ } }
  listen(byId('theme-light'), 'click', function () { chooseTheme('claro'); if (themeChromeUI) { themeChromeUI.setTheme('eink'); } });
  listen(byId('theme-dark'), 'click', function () { chooseTheme('escuro'); if (themeChromeUI) { themeChromeUI.setTheme('escuro'); } });
  listen(byId('tema'), 'change', function () { chooseTheme(this.value); });
  listen(byId('som'), 'change', function () {
    if (E.machineSound) {
      E.machineSound.setEnabled(this.checked, storage, false);
      text(byId('sound-status'), this.checked ? 'Som mecânico ligado.' : 'Som desligado.');
      return;
    }
    if (!this.checked) { stopSound(); return; }
    try { var Audio = window.AudioContext || window.webkitAudioContext; audio = new Audio(); if (audio.resume) { audio.resume(); } text(byId('sound-status'), 'Som ligado, em volume discreto.'); } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
  });
  listen(manuscript, 'keydown', playKey);
  listen(manuscript, 'input', playInput);
  listen(manuscript, 'compositionstart', resetCompSound);
  listen(manuscript, 'compositionend', resetCompSound);
  listen(manuscript, 'pointerdown', unlockAudio);
  listen(manuscript, 'touchstart', unlockAudio);
  listen(byId('print-document'), 'click', function () {
    if (printStudioUI && printStudioUI.open) {
      closePanels(false);
      printStudioUI.open();
      return;
    }
    preparePrint();
    if (window.print) { window.print(); } else { message('Use a opção de impressão do navegador.'); }
  });
  listen(window, 'beforeprint', preparePrint);
  listen(window, 'afterprint', finishPrint);
  if (window.matchMedia) {
    var printMedia = window.matchMedia('print');
    var onPrintMediaChange = function (event) { if (event.matches) { preparePrint(); } else { finishPrint(); } };
    if (printMedia.addEventListener) { printMedia.addEventListener('change', onPrintMediaChange); }
    else if (printMedia.addListener) { printMedia.addListener(onPrintMediaChange); }
  }
  function triggerEditorialExport(kind) {
    if (printStudioUI && (kind === 'epub' ? printStudioUI.exportEpub : printStudioUI.exportDocx)) {
      if (kind === 'epub') { printStudioUI.exportEpub(); } else { printStudioUI.exportDocx(); }
      return;
    }
    if (!E.editorialExport) {
      message('Exportação editorial indisponível nesta sessão.');
      return;
    }
    var cur = {
      title: title ? title.value : (doc.title || ''),
      displayTitle: title ? title.value : (doc.title || ''),
      text: manuscript ? manuscript.value : (doc.text || ''),
      format: (richUI && richUI.isRich && richUI.isRich()) ? 'rich' : (doc.format || 'plain'),
      richHtml: (richUI && richUI.isRich && richUI.isRich()) ? richUI.html() : doc.richHtml
    };
    var res = kind === 'epub'
      ? E.editorialExport.buildEpub({ chapters: [cur] })
      : E.editorialExport.buildDocx({ chapters: [cur] });
    if (download(res.bytes, res.mime, res.filename)) {
      message((kind === 'epub' ? 'E-book (.epub)' : 'Word (.docx)') + ' gerado offline: ' + res.filename + '.');
    }
  }
  listen(byId('export-docx'), 'click', function () { triggerEditorialExport('docx'); });
  listen(byId('export-epub'), 'click', function () { triggerEditorialExport('epub'); });
  listen(byId('export-text'), 'click', function () {
    var base = String(title.value || '').replace(/^\s+|\s+$/g, '').replace(/[^A-Za-z0-9À-ÿ_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    download((title.value ? title.value + '\n\n' : '') + manuscript.value, 'text/plain', (base || 'manuscrito') + '.txt');
  });
  listen(byId('export-backup'), 'click', function () { exportNotebook(true); });
  listen(byId('import-file'), 'focus', function () { this.parentNode.setAttribute('data-focus', 'true'); });
  listen(byId('import-file'), 'blur', function () { this.parentNode.setAttribute('data-focus', 'false'); });
  listen(byId('import-file'), 'change', function () { importFile(this.files && this.files[0]); this.value = ''; });
  listen(byId('import-copied'), 'click', function () { showTransfer('', 'copia.scrvrl', true); });
  listen(byId('transfer-import'), 'click', function () { importContents(byId('transfer-content').value, byId('transfer-name').value, ''); });
  listen(byId('transfer-select'), 'click', function () {
    var field = byId('transfer-content'); field.focus();
    if (!E.transfer.selectRange(field, 0, field.value.length)) { message('Use Selecionar tudo e Copiar no campo da cópia.'); }
  });
  listen(byId('transfer-close'), 'click', function () { byId('transfer-content').value = ''; byId('transfer-box').hidden = true; byId('import-copied').focus(); });
  listen(document, 'keydown', function (event) {
    var code = event.keyCode;
    if (code === 27 && composing) { return; }
    if (code === 27 && !byId('start-menu').hidden) { event.preventDefault(); toggleStart(false); byId('os-start').focus(); return; }
    if (code === 27 && !activePanel && !byId('selection-tools').hidden) { event.preventDefault(); byId('selection-close').click(); return; }
    if (code === 27 && closeContextMenus(true)) { event.preventDefault(); return; }
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
    if ((event.ctrlKey || event.metaKey) && code === 72) {
      if (!cabinetOpen && findReplaceUI) {
        event.preventDefault();
        closePanels(false);
        findReplaceUI.open();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && code === 75) {
      event.preventDefault(); closePanels(false);
      if (cabinetOpen) { byId('cabinet-search').focus(); }
      else if (document.body.getAttribute('data-view') === 'workspace' && workspaceUI && workspaceUI.focusSearch) { workspaceUI.focusSearch(); }
      else { byId('note-search').focus(); }
    }
    else if ((event.ctrlKey || event.metaKey) && code === 13) { event.preventDefault(); if (cabinetOpen) { enterDesk(); } openExaminePanel({ toggle: 'examinar-toggle' }); panelTrigger = manuscript; }
    else if ((event.ctrlKey || event.metaKey) && code === 83) { event.preventDefault(); persist(); }
    else if (code === 27 && document.body.getAttribute('data-counts') === 'true') { byId('desk-counts-close').click(); }
    else if (code === 27) {
      var hasOverlay = (byId('esc-word-card') && !byId('esc-word-card').hidden) ||
        (byId('esc-find-bar') && !byId('esc-find-bar').hidden) ||
        (byId('esc-academy-overlay') && !byId('esc-academy-overlay').hidden) ||
        (byId('esc-calculator') && !byId('esc-calculator').hidden) ||
        (byId('esc-template-modal') && !byId('esc-template-modal').hidden) ||
        (byId('esc-inline-modal') && !byId('esc-inline-modal').hidden) ||
        (byId('esc-reader-overlay') && !byId('esc-reader-overlay').hidden) ||
        (byId('esc-print-overlay') && !byId('esc-print-overlay').hidden) ||
        (byId('esc-items-filters-panel') && !byId('esc-items-filters-panel').hidden) ||
        (byId('esc-folder-menu') && !byId('esc-folder-menu').hidden) ||
        (byId('esc-color-popover') && !byId('esc-color-popover').hidden);
      if (hasOverlay) { return; }
      if (activePanel) { if (activePanel === 'oficina') { analysisRange = null; } closePanels(true); }
      else if (immersion) { leaveImmersion(); }
      else if (!cabinetOpen) { if (byId('timeline-toggle').getAttribute('aria-expanded') === 'true') { collapseTimeline(); } else if (document.body.getAttribute('data-view') !== 'workspace') { openCabinet(false); } }
      else if (!byId('project-form').hidden) { byId('project-cancel').click(); }
      else if (cabinetOpen && byId('start-menu').hidden) { enterDesk(true); }
    }
  });

  listen(byId('os-files'), 'click', function () { activeOriginalId = null; desktopWindow('open'); renderCabinet(); updatePath(); });
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
  function outsideContextMenus(event) {
    var node=event.target;
    while(node){if(node===byId('desktop-organize')||node===byId('desktop-organize-menu')||node===byId('original-more')||node===byId('original-more-menu')||node===byId('notebook-more')||node===byId('notebook-more-menu')){return;}node=node.parentNode;}
    closeContextMenus(false);
  }
  listen(document,'click',outsideContextMenus);
  listen(document,'touchstart',outsideContextMenus);
  listen(byId('os-window-task'), 'click', function () { if (!cabinetOpen) { openCabinet(false); } else { if(byId('cabinet-window').hidden){desktopWindow('open');}else{closeNotebook();} } });
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
  if (byId('esc-path-return')) {
    listen(byId('esc-path-return'), 'click', function () {
      if (activePanel) { if (activePanel === 'oficina') { analysisRange = null; } closePanels(true); }
      else if (cabinetOpen) { enterDesk(true); }
    });
  }
  listen(byId('cabinet-resume'), 'click', enterDesk);
  listen(byId('cabinet-write'), 'click', enterDesk);
  listen(byId('cabinet-new'), 'click', newDocument);
  listen(byId('welcome-start-btn'), 'click', startFirstText);
  listen(byId('welcome-back-notes'), 'click', function () { showingAbout = false; renderCabinet(); });
  listen(byId('welcome-donate-link'), 'click', function (event) { event.preventDefault(); message('Oficina independente mantida pela comunidade que escreve.'); });
  listen(byId('welcome-pwa-btn'), 'click', function () {
    if (!deferredInstallPrompt) { return; }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function () {
      deferredInstallPrompt = null;
      var btn = byId('welcome-pwa-btn');
      if (btn) { btn.hidden = true; }
    });
  });
  listen(byId('post-write-pwa-action'), 'click', function () {
    if (!deferredInstallPrompt) { return; }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function () {
      deferredInstallPrompt = null;
      var banner = byId('post-write-pwa');
      if (banner) { banner.hidden = true; }
    });
  });
  listen(byId('post-write-pwa-dismiss'), 'click', function () {
    var banner = byId('post-write-pwa');
    if (banner) { banner.hidden = true; }
    try { if (storage) { storage.setItem('escrevaral.pwa.dismissed', '1'); } } catch (ignore) {}
  });
  listen(window, 'beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    var btn = byId('welcome-pwa-btn');
    if (btn && !isStandaloneApp()) { btn.hidden = false; }
    var actionBtn = byId('post-write-pwa-action');
    if (actionBtn && !isStandaloneApp()) { actionBtn.hidden = false; }
  });
  listen(byId('cabinet-settings'), 'click', function () { cabinetPanel('mesa', 'cabinet-settings'); });
  listen(byId('cabinet-archive'), 'click', function () { toggleStart(false); openCabinet(false); });
  listen(byId('cabinet-backup'), 'click', function () { byId('export-backup').click(); });
  listen(byId('start-export-text'), 'click', function () { toggleStart(false); if (!activeNotebook()) { message('Abra um caderno para baixar seu texto.'); return; } byId('export-text').click(); });
  listen(byId('cabinet-examine'), 'click', function () { enterDesk(); openExaminePanel({ toggle: 'examinar-toggle' }); });
  listen(byId('cabinet-poetry'), 'click', function () { enterDesk(); openExaminePanel({ toggle: 'examinar-toggle', group: 3, legacyLens: 'rima' }); });
  listen(byId('notebook-back'),'click',closeNotebook);
  listen(byId('cabinet-all'), 'click', function () { if (!checkpoint() || !rememberNotebook()) { return; } activeOriginalId = null; activeNotebookId = null; cabinetProject = null; cabinetLimit = 40; byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); updatePath(); });
  listen(byId('cabinet-more'), 'click', function () { cabinetLimit += 40; renderCabinet(); });
  listen(byId('cabinet-search'), 'input', function () { showingAbout = false; window.clearTimeout(cabinetTimer); cabinetTimer = window.setTimeout(function () { cabinetLimit = 40; desktopWindow('open', false); renderCabinet(); }, 180); });
  listen(byId('cabinet-clear'), 'click', function () { window.clearTimeout(cabinetTimer); byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); byId('cabinet-search').focus(); });
  listen(byId('paste-mode'), 'click', function () { restrictedPaste = !restrictedPaste; this.setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {} });
  function handleEditorPaste(event) {
    if (restrictedPaste) {
      event.preventDefault();
      if (E.cartorio) { E.cartorio.recordSignal(doc, 'blockedPaste', 1); }
      message('Colagem externa restrita. Use Colar cópia interna ou Trazer arquivo em Ajustes.');
      return;
    }
    if (E.cartorio) {
      var pasted = '';
      try { pasted = (event.clipboardData && event.clipboardData.getData('text/plain')) || ''; } catch (ignore) {}
      if (pasted && internalClipboard && pasted === internalClipboard) {
        E.cartorio.recordSignal(doc, 'intPaste', pasted.length);
      } else if (pasted.length > 0) {
        E.cartorio.recordSignal(doc, 'extPaste', pasted.length);
      }
    }
  }
  listen(manuscript, 'paste', handleEditorPaste);
  if (byId('esc-rich-editor')) { listen(byId('esc-rich-editor'), 'paste', handleEditorPaste); }
  function recordTypingSignal(event) {
    if (!E.cartorio) { return; }
    if (event && event.inputType && String(event.inputType).indexOf('Paste') !== -1) { return; }
    E.cartorio.recordSignal(doc, 'key', 1);
  }
  listen(manuscript, 'input', recordTypingSignal);
  if (byId('esc-rich-editor')) { listen(byId('esc-rich-editor'), 'input', recordTypingSignal); }
  listen(manuscript, 'mouseup', captureSelection); listen(manuscript, 'keyup', function (event) { if (event.keyCode !== 27) { captureSelection(); } }); listen(manuscript, 'touchend', captureSelection);
  listen(manuscript, 'select', captureSelection);
  listen(byId('selection-close'), 'click', function () { dismissSelection(); manuscript.focus(); });
  listen(manuscript, 'mousedown', function () { dismissedSelection = null; });
  listen(manuscript, 'touchstart', function () { dismissedSelection = null; });
  listen(byId('selection-copy'), 'click', copyInternal);
  listen(byId('desk-paste'), 'click', pasteInternal);
  listen(manuscript, 'copy', function () { captureSelection(); copyInternal(); });
  listen(manuscript, 'cut', function () { captureSelection(); copyInternal(); });
  listen(manuscript, 'input', function () { copiedSelection = null; byId('selection-tools').hidden = true; });
  listen(byId('selection-paste'), 'click', pasteInternal);
  listen(byId('selection-cut'), 'click', function () {
    if (composing || !copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { return; }
    if (!copyInternal()) { return; }
    var s = copiedSelection; byId('selection-tools').hidden = true; manuscript.value = s.text.slice(0, s.start) + s.text.slice(s.end); E.transfer.selectRange(manuscript, s.start, s.start); manuscript.focus(); copiedSelection = null; changed(); queueSession();
  });
  listen(byId('selection-examine'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { message('Selecione novamente o trecho para analisar.'); return; }
    openExaminePanel({ toggle: 'examinar-toggle', range: copiedSelection });
  });
  listen(byId('selection-external'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { message('Selecione novamente o trecho para copiar.'); return; }
    manuscript.focus(); if (!E.transfer.selectRange(manuscript, copiedSelection.start, copiedSelection.end)) { text(byId('clipboard-status'), 'Selecione o trecho manualmente e use Copiar.'); return; }
    try { if (document.execCommand && document.execCommand('copy')) { text(byId('clipboard-status'), 'Copiado para outros aplicativos'); return; } } catch (ignore) { /* Cópia interna já disponível. */ }
    text(byId('clipboard-status'), 'Use Ctrl+C ou o comando Copiar do aparelho.');
  });
  listen(byId('start-settings'), 'click', function () { toggleStart(false); showPanel('mesa', 'mesa-toggle', true); });
  listen(byId('start-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('start-trash'), 'click', function () { toggleStart(false); trashView = true; renderArchive(); showPanel('acervo', 'acervo-toggle', true); });
  listen(byId('start-about'), 'click', function () { toggleStart(false); showingAbout = true; openCabinet(false); });
  listen(byId('trash-toggle'), 'click', function () { trashView = !trashView; renderArchive(); });
  listen(byId('trash-current'), 'click', function () { trashEntry(doc); });
  listen(byId('reminder-new'), 'click', function () { if (!archive) { message('Armazenamento indisponível.'); return; } try { var note = E.freshDocument(); note.kind = 'reminder'; note.title = 'Post-it'; if (activeNotebookId) { note.projectId = activeNotebookId; note.project = activeNotebook().name; } archive.save(note); renderReminders(); } catch (e) { message('Não foi possível guardar o post-it.'); } });
  listen(manuscript, 'input', queueSession); listen(manuscript, 'keyup', queueSession); listen(manuscript, 'scroll', queueSession); listen(manuscript, 'click', queueSession);
  listen(title, 'input', queueSession);
  listen(byId('start-menu'), 'click', function (event) {
    var node = event.target;
    while (node && node !== byId('start-menu')) {
      if (String(node.tagName).toLowerCase() === 'button') { if(node.getAttribute('data-start-disclosure')==='true'){return;} toggleStart(false); return; }
      node = node.parentNode;
    }
  });
  listen(byId('path-home'), 'click', function () { pathToProjects(true); });
  listen(byId('path-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('path-project'), 'click', function () { pathToProjects(false); });
  listen(byId('path-document'), 'click', function () { returnToWriting(); updatePath(); });
  listen(title, 'input', updatePath);
  listen(byId('note-project-save'), 'click', function () { var b = notebooks && notebooks.get(byId('note-project').value); if (!availableBook(b) || !checkpoint()) { return; } doc.projectId = b.id; doc.project = b.name; activeNotebookId = b.id; activeOriginalId = b.originalId || null; cabinetProject = b.name; dirty = true; if (persist()) { updatePath(); renderNotebooks(); renderCabinet(); message('Texto guardado em ' + b.name + '.'); } });
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
    manuscript.style.fontSize = readingSize + 'px';
    if (byId('esc-rich-editor')) { byId('esc-rich-editor').style.fontSize = readingSize + 'px'; }
    text(byId('type-size'), readingSize);
    byId('type-smaller').disabled = readingSize <= 16; byId('type-larger').disabled = readingSize >= 30;
    focusMeasure = null; typewriterInsets(); growManuscript();
    try { if (storage) { storage.setItem('escrevaral.astra.font-size', String(readingSize)); } } catch (ignore) {}
  }
  function inspectWith(lens) {
    openExaminePanel({ toggle: 'examinar-toggle', lens: lens || '' });
  }
  listen(byId('desk-project'), 'click', function () { pathToProjects(false); });
  listen(byId('scope-project'), 'click', function () { projectScope = true; timelineCount = 40; renderTimeline(true, null, true); queueSession(); });
  listen(byId('scope-dates'), 'click', function () { projectScope = false; renderTimeline(true, null, true); queueSession(); });
  listen(byId('desk-documents'), 'click', function () { byId('timeline-toggle').click(); this.setAttribute('aria-expanded', byId('timeline-toggle').getAttribute('aria-expanded')); if(this.getAttribute('aria-expanded') === 'true' && byId('drawer-route-close').offsetWidth){ byId('drawer-route-close').focus(); } });
  listen(byId('drawer-route-close'), 'click', function () { collapseTimeline(); manuscript.focus(); });
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
  wireNotebooks();
  var notebookSession = null; try { notebookSession = storage && JSON.parse(storage.getItem(sessionKey) || 'null'); } catch (ignore) {}
  if (!notebookSession || !notebookSession.notebookId || (notebookSession.view === 'gabinete' && notebookSession.windowHidden)) { activeNotebookId = null; closeNotebook(); }
  else if (!activeNotebookId) { closeNotebook(); }
  notebookLabels();

  if (E.mountWorkspace) {
    workspaceUI = E.mountWorkspace({
      storage: storage,
      archive: archive,
      notebooks: notebooks,
      originals: originals,
      currentDoc: function () { return doc; },
      activeNotebookId: function () { return activeNotebookId; },
      checkpoint: checkpoint,
      openDoc: function (entry) {
        if (!entry || composing || !persist()) { return; }
        if (entry.trashed) {
          message('Este texto está na lixeira. Clique em “Restaurar” para voltar a editá-lo.');
          return;
        }
        var isCurrent = entry.id === doc.id;
        if (!isCurrent) {
          try {
            var next = archive && archive.get(entry.id);
            if (!next || next.trashed) { workspaceUI.render(); message('Esta folha não foi encontrada.'); return; }
            loadDocument(next);
          } catch (e) { message('Não foi possível abrir esta folha.'); return; }
        }
        cabinetSelection = null;
        enterDesk(false);
        workspaceUI.flashEink();
      },
      newNote: function (noteOpts) { createNewNote(noteOpts); },
      newProject: function () { if (templatesUI) { templatesUI.open(); } else { showNotebookForm(null, 'volume'); } },
      onProjectSelect: function (bookId) {
        if (bookId && notebooks && availableBook(notebooks.get(bookId))) { openNotebook(bookId); }
      },
      onOpenNotebookTable: function () { goHomeToEstante(); },
      trashDoc: function (entry) { trashEntry(entry); },
      restoreDoc: function (entry) {
        if (!archive) { return; }
        try {
          archive.trash(entry, false);
          renderArchive(); renderCabinet(); renderTimeline(false);
          workspaceUI.render();
          message('Folha restaurada da lixeira.');
        } catch (e) { message('Não foi possível restaurar esta folha.'); }
      },
      purgeDoc: function (entry) {
        if (!archive) { return; }
        askDelete(entry);
      },
      emptyTrash: function () {
        if (!archive) { return; }
        var trashed = archive.list(true).documents.filter(function (d) { return !!d.trashed; });
        var trashedProjects = notebooks ? notebooks.list().filter(function (b) { return !!b.trashed; }) : [];
        if (!trashed.length && !trashedProjects.length) { return; }
        var parts = [];
        if (trashed.length) { parts.push(trashed.length + (trashed.length === 1 ? ' texto' : ' textos')); }
        if (trashedProjects.length) { parts.push(trashedProjects.length + (trashedProjects.length === 1 ? ' pasta' : ' pastas')); }
        var summary = parts.join(' e ');
        askIrreversibleDelete({
          title: 'Esvaziar lixeira definitivamente?',
          message: 'Remover definitivamente ' + summary + ' da lixeira? Itens excluídos da lixeira não podem ser recuperados.',
          accept: 'Continuar exclusão'
        }, {
          title: 'Segunda confirmação — ação irreversível',
          message: 'Atenção: ' + summary + ' serão apagados para sempre deste aparelho. Esta ação não pode ser desfeita. Confirma esvaziar a lixeira?',
          accept: 'Sim, esvaziar para sempre'
        }, function () {
          var removedIds = [];
          trashed.forEach(function (entry) {
            removedIds.push(entry.id);
            if (entry.noteId && entry.noteId !== entry.id) { removedIds.push(entry.noteId); }
          });
          trashedProjects.forEach(function (bk) {
            (archive.list(true).documents || []).filter(function (d) { return d.projectId === bk.id; }).forEach(function (d) {
              removedIds.push(d.id);
              try { purgeEntrySafe(d); } catch (ignore) {}
            });
            try { notebooks.purge(bk.id); } catch (ignore) {}
          });
          trashed.forEach(function (entry) {
            try { purgeEntrySafe(entry); } catch (ignore) {}
          });
          ensureActiveDocumentStillValid(removedIds, null);
          renderNotebooks(); renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
          if (workspaceUI) { workspaceUI.render(); }
          message('Lixeira esvaziada definitivamente.');
        });
      },
      updateDocMeta: function (entry, patch) {
        if (!archive || !entry || !patch) { return; }
        var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
        var key;
        if (isCurrent) {
          for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { doc[key] = patch[key]; } }
          dirty = true;
          persist();
        } else {
          try {
            var target = archive.get(entry.id);
            if (!target) { return; }
            for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { target[key] = patch[key]; } }
            archive.save(target, false);
          } catch (e) { message('Não foi possível atualizar a nota.'); return; }
        }
        renderArchive(); renderCabinet(); renderTimeline(false);
        workspaceUI.render();
      },
      createBlankFolder: function (name) {
        if (!notebooks) { return; }
        var created = notebooks.add(name);
        activeNotebookId = created.id;
        renderNotebooks(); renderCabinet();
        if (workspaceUI) { workspaceUI.selectProject(created.id, ''); }
        message('Pasta “' + created.name + '” criada.');
      },
      renameProject: function (book, nextName) {
        if (!notebooks || !book) { return; }
        var updated = notebooks.update(book.id, { name: nextName });
        if (archive) {
          (archive.list(true).documents || []).forEach(function (d) {
            if (d.projectId === book.id) {
              d.project = updated.name;
              if (d.id === doc.id) { doc.project = updated.name; dirty = true; persist(); }
              else { try { archive.save(d, false); } catch (ignore) {} }
            }
          });
        }
        renderNotebooks(); renderCabinet(); renderTimeline(false); updatePath();
        if (workspaceUI) { workspaceUI.render(); }
        message('Pasta renomeada para “' + updated.name + '”.');
      },
      openProjectBoard: function (book) {
        if (!book) { return; }
        activeNotebookId = book.id;
        if (chalkUI && chalkUI.open) { chalkUI.open(); }
        else if (byId('start-chalkboard')) { byId('start-chalkboard').click(); }
      },
      trashProjectDocs: function (book) {
        if (!archive || !book) { return; }
        if (dirty) { persist(); }
        var list = (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !d.trashed; });
        if (!list.length) { message('Não há textos ativos nesta pasta.'); return; }
        var removedIds = [];
        list.forEach(function (d) {
          removedIds.push(d.id);
          if (d.noteId && d.noteId !== d.id) { removedIds.push(d.noteId); }
          try { archive.trash(d, true); } catch (ignore) {}
        });
        ensureActiveDocumentStillValid(removedIds, null);
        renderArchive(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
        if (workspaceUI) { workspaceUI.render(); }
        message(list.length + (list.length === 1 ? ' texto movido' : ' textos movidos') + ' para a lixeira. Você pode restaurar pela Lixeira.');
      },
      trashProject: function (book) {
        if (!notebooks || !book) { return; }
        if (dirty) { persist(); }
        var inside = archive ? (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !d.trashed; }) : [];
        var removedIds = [];
        notebooks.update(book.id, { trashed: true });
        inside.forEach(function (d) {
          removedIds.push(d.id);
          if (d.noteId && d.noteId !== d.id) { removedIds.push(d.noteId); }
          try { archive.trash(d, true); } catch (ignore) {}
        });
        if (activeNotebookId === book.id) { activeNotebookId = null; }
        ensureActiveDocumentStillValid(removedIds, book.id);
        renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
        if (workspaceUI) { workspaceUI.selectLibrary('all'); }
        message('Pasta “' + book.name + '” e ' + inside.length + ' texto(s) enviados para a lixeira. Você pode restaurar a pasta inteira pela Lixeira.');
      },
      restoreProject: function (book) {
        if (!notebooks || !book) { return; }
        notebooks.update(book.id, { trashed: false });
        var inside = archive ? (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !!d.trashed; }) : [];
        inside.forEach(function (d) { try { archive.trash(d, false); } catch (ignore) {} });
        renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
        if (workspaceUI) { workspaceUI.render(); }
        message('Pasta “' + book.name + '” restaurada inteira com ' + inside.length + ' texto(s).');
      },
      purgeProject: function (book, insideCount) {
        if (!notebooks || !book) { return; }
        if (dirty) { persist(); }
        var insideDocs = archive ? (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id; }) : [];
        var count = typeof insideCount === 'number' ? Math.max(insideCount, insideDocs.length) : insideDocs.length;
        var countLabel = count + (count === 1 ? ' texto associado' : ' textos associados');
        askIrreversibleDelete({
          title: 'Excluir pasta definitivamente?',
          message: 'A pasta “' + book.name + '” e ' + countLabel + ' serão removidos definitivamente deste aparelho. Para poder recuperar a pasta inteira depois, use “Mover pasta para a lixeira”.',
          accept: 'Continuar exclusão'
        }, {
          title: 'Segunda confirmação — exclusão irreversível',
          message: 'Atenção: a pasta “' + book.name + '” e todo o seu conteúdo (' + countLabel + ') serão apagados para sempre e não poderão ser recuperados. Confirma?',
          accept: 'Sim, excluir pasta para sempre'
        }, function () {
          var removedIds = [];
          if (archive) {
            (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id; }).forEach(function (d) {
              removedIds.push(d.id);
              if (d.noteId && d.noteId !== d.id) { removedIds.push(d.noteId); }
              try { purgeEntrySafe(d); } catch (ignore) {}
            });
          }
          notebooks.purge(book.id);
          if (activeNotebookId === book.id) { activeNotebookId = null; }
          ensureActiveDocumentStillValid(removedIds, book.id);
          renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false); updatePath(); saveSession();
          if (workspaceUI) { workspaceUI.render(); }
          message('Pasta excluída definitivamente deste aparelho.');
        });
      },
      refreshParent: function () { renderNotebooks(); renderCabinet(); renderTimeline(false); updatePath(); }
    });
    enterDesk(false);
    workspaceUI.render();
  }

  if (E.mountTemplatesModal) {
    templatesUI = E.mountTemplatesModal({
      notebooks: notebooks,
      archive: archive,
      manuscriptEl: manuscript,
      originalId: function () { return activeOriginalId; },
      onBlankProject: function () { showNotebookForm(null, 'volume'); },
      onCreated: function (created) {
        if (created && created.book) {
          openNotebook(created.book.id);
          if (created.firstNote) { loadDocument(created.firstNote); }
          enterDesk(false);
          if (workspaceUI) { workspaceUI.selectProject(created.book.id, created.firstNote && created.firstNote.folder || ''); workspaceUI.flashEink(); }
          renderNotebooks(); renderCabinet();
          message('Projeto “' + created.book.name + '” criado.');
        }
      }
    });
  }

  if (E.mountSonnetAssistant) {
    sonnetUI = E.mountSonnetAssistant({
      containerId: 'esc-sonnet-panel',
      manuscriptEl: manuscript,
      onSaveSettings: function (nextSettings) {
        doc.sonnetSettings = nextSettings;
        dirty = true;
        persist();
      }
    });
    sonnetUI.sync(doc);
  }

  if (E.mountSongAssistant) {
    songUI = E.mountSongAssistant({
      containerId: 'esc-song-panel',
      manuscriptEl: manuscript,
      onSaveSettings: function (nextSettings) {
        doc.songSettings = nextSettings;
        dirty = true;
        persist();
      }
    });
    songUI.sync(doc);
  }

  if (E.mountUsosLingua) {
    usosUI = E.mountUsosLingua({
      containerId: 'usos-lingua-body',
      onOpenSheet: function () { showPanel('usos-lingua', 'esc-open-usos', true); }
    });
    E.openUsosLingua = function (idOrQuery) {
      usosUI.openWith(idOrQuery || '');
    };
    if (byId('esc-open-usos')) {
      listen(byId('esc-open-usos'), 'click', function () {
        if (byId('usos-lingua').hidden) { usosUI.openWith(''); }
        else { showPanel('usos-lingua', 'esc-open-usos', false); }
      });
    }
    if (byId('usos-lingua-close')) {
      listen(byId('usos-lingua-close'), 'click', function () { showPanel('usos-lingua', 'esc-open-usos', false); });
    }
  }

  if (E.mountRichEditor) {
    richUI = E.mountRichEditor({
      manuscriptEl: manuscript,
      onSync: function (plainText, safeHtml) {
        doc.text = plainText;
        doc.format = 'rich';
        doc.richHtml = safeHtml;
        if (sonnetUI && sonnetUI.isSonnetDoc(doc)) { sonnetUI.schedule ? sonnetUI.schedule() : sonnetUI.refresh(); }
        if (songUI && songUI.isSongDoc(doc)) { songUI.schedule ? songUI.schedule() : songUI.refresh(); }
        changed();
      },
      onFormatChange: function (fmt, html) {
        doc.format = fmt;
        doc.richHtml = fmt === 'rich' ? html : undefined;
        changed();
      }
    });
    richUI.loadDoc(doc);
    if (byId('esc-format-toggle')) {
      listen(byId('esc-format-toggle'), 'click', function () {
        if (richUI) { richUI.toggleMode(); }
      });
    }
  }

  if (E.mountPrintStudio) {
    printStudioUI = E.mountPrintStudio({
      storage: storage,
      checkpoint: checkpoint,
      download: download,
      message: message,
      getCurrentDoc: function () {
        var snap = JSON.parse(JSON.stringify(doc));
        snap.title = title ? title.value : snap.title;
        snap.text = manuscript ? manuscript.value : snap.text;
        if (richUI && richUI.isRich && richUI.isRich()) {
          snap.format = 'rich';
          snap.richHtml = richUI.html();
        }
        return snap;
      },
      getActiveBook: function () {
        var b = activeNotebook();
        if (b) { return b; }
        if (doc && doc.projectId && notebooks) {
          var fromDoc = notebooks.get(doc.projectId);
          if (availableBook(fromDoc)) { return fromDoc; }
        }
        return null;
      },
      getBookDocs: function (book) {
        if (!book || !archive) { return []; }
        return (archive.list(false).documents || []).filter(function (d) {
          return d && d.projectId === book.id && !d.trashed && d.kind !== 'reminder';
        });
      },
      saveBookPrintConfig: function (bookId, cfg) {
        if (!notebooks || !bookId) { return; }
        var b = notebooks.get(bookId);
        if (!b || b.trashed) { return; }
        var nextData = b.data ? JSON.parse(JSON.stringify(b.data)) : {};
        nextData.printConfig = cfg;
        notebooks.update(bookId, { data: nextData });
      }
    });
  }

  if (E.mountReaderMode) {
    readerUI = E.mountReaderMode({
      storage: storage,
      onOpenAcademy: function (guideId) {
        if (academyUI && academyUI.openGuide) { academyUI.openGuide(guideId || 'objeto-livro'); }
      },
      onJumpToWord: function (word) {
        if (!word || !manuscript) { return; }
        var textVal = manuscript.value || '';
        var esc = String(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var rx = new RegExp('(^|[^A-Za-zÀ-ÖØ-öø-ÿ])(' + esc + ')(?=$|[^A-Za-zÀ-ÖØ-öø-ÿ])', 'i');
        var m = rx.exec(textVal);
        var idx = m ? (m.index + m[1].length) : textVal.toLowerCase().indexOf(String(word).toLowerCase());
        if (idx >= 0) {
          if (richUI && richUI.isRich && richUI.isRich() && richUI.selectPlainRange) {
            richUI.selectPlainRange(idx, idx + word.length);
          } else if (E.transfer && E.transfer.selectRange) {
            E.transfer.selectRange(manuscript, idx, idx + word.length);
          } else if (manuscript.setSelectionRange) {
            manuscript.focus();
            manuscript.setSelectionRange(idx, idx + word.length);
          }
          message('Palavra “' + word + '” localizada no manuscrito.');
        }
      },
      onPrint: function () {
        if (printStudioUI && printStudioUI.open) {
          printStudioUI.open({ scope: 'current' });
          return;
        }
        preparePrint();
        if (window.print) { window.print(); } else { message('Use a opção de impressão do navegador.'); }
      }
    });
    if (byId('esc-reader-toggle')) {
      listen(byId('esc-reader-toggle'), 'click', function () {
        if (readerUI) {
          doc.title = title.value;
          doc.text = manuscript.value;
          if (richUI && richUI.isRich()) { doc.richHtml = richUI.html(); }
          readerUI.open(doc);
        }
      });
    }
  }

  if (E.mountVisualMachine) {
    visualMachine = E.mountVisualMachine({
      storage: storage,
      columnEl: byId('writing-paper') || manuscript
    });
    if (byId('machine-toggle')) {
      var mOn = visualMachine.isEnabled();
      byId('machine-toggle').setAttribute('aria-pressed', mOn ? 'true' : 'false');
      text(byId('machine-toggle'), mOn ? 'Desativar' : 'Ativar');
    }
  }

  if (E.machineSound) {
    E.machineSound.syncPreference(storage);
    var syncSoundUI = function (enabled) {
      if (byId('som')) { byId('som').checked = !!enabled; }
      if (byId('esc-sound-btn')) { byId('esc-sound-btn').setAttribute('aria-pressed', enabled ? 'true' : 'false'); }
      text(byId('sound-status'), enabled ? 'Som mecânico ligado.' : 'Som desligado.');
    };
    syncSoundUI(E.machineSound.isEnabled());
    E.machineSound.subscribe(syncSoundUI);
    if (byId('esc-sound-btn')) {
      listen(byId('esc-sound-btn'), 'click', function () {
        E.machineSound.setEnabled(!E.machineSound.isEnabled(), storage, false);
      });
    }
    if (byId('esc-rich-editor')) {
      listen(byId('esc-rich-editor'), 'keydown', playKey);
      listen(byId('esc-rich-editor'), 'input', playInput);
      listen(byId('esc-rich-editor'), 'compositionstart', resetCompSound);
      listen(byId('esc-rich-editor'), 'compositionend', resetCompSound);
      listen(byId('esc-rich-editor'), 'pointerdown', unlockAudio);
      listen(byId('esc-rich-editor'), 'touchstart', unlockAudio);
    }
  }

  
  if (E.mountSuperfoco) {
    superfocoUI = E.mountSuperfoco({
      storage: storage,
      manuscriptEl: manuscript,
      richEl: byId('esc-rich-editor'),
      isActive: function () { return immersion; },
      onOpen: function (info) { setImmersion(true, info && info.automatic ? 'automatic' : 'manual'); },
      onClose: function (why) { setImmersion(false, why || 'manual'); },
      getFace: function () { return document.body.getAttribute('data-letter') || 'maquina'; },
      onToggleFace: function () {
        var cur = document.body.getAttribute('data-letter') || 'maquina';
        chooseFont(cur === 'maquina' ? 'literaria' : 'maquina');
      },
      getMachineEnabled: function () { return visualMachine ? visualMachine.isEnabled() : false; },
      onToggleMachine: function () { setMachine(visualMachine ? !visualMachine.isEnabled() : !machineEnabled); },
      getMachineAnchor: function () { return visualMachine ? visualMachine.anchorY() : null; },
      isSonnetActive: function () { return !!((sonnetUI && sonnetUI.isSonnetDoc && sonnetUI.isSonnetDoc(doc)) || (songUI && songUI.isSongDoc && songUI.isSongDoc(doc))); },
      isEditable: function () { return !(doc && (doc.locked || doc.category === 'reference')); }
    });
    if (immersion) {
      if (visualMachine) { visualMachine.setFocusActive(true); }
      superfocoUI.notifyState(true, 'manual');
    }
  }

  if (E.mountThemeChrome) {
    themeChromeUI = E.mountThemeChrome({
      storage: storage,
      onNewNote: function () { createNewNote(); }
    });
  }

  if (byId('path-folder')) {
    listen(byId('path-folder'), 'click', function () {
      if (workspaceUI && doc.projectId) {
        workspaceUI.selectProject(doc.projectId, doc.folder || '');
      }
    });
  }

  if (E.mountWordCard) {
    wordCardUI = E.mountWordCard({
      manuscriptEl: manuscript,
      richEl: byId('esc-rich-editor'),
      onDismissSelection: dismissSelection,
      onRichSync: function () {
        if (richUI) { richUI.sync(); }
      },
      onReplace: function (start, end, replacement) {
        if (manuscript.readOnly || manuscript.disabled) { return; }
        manuscript.value = manuscript.value.slice(0, start) + replacement + manuscript.value.slice(end);
        E.transfer.selectRange(manuscript, start, start + replacement.length);
        changed();
      }
    });
  }

  if (byId('esc-synonyms-btn') && wordCardUI && wordCardUI.openManual) {
    listen(byId('esc-synonyms-btn'), 'click', function () { wordCardUI.openManual(''); });
  }
  E.ptbrOpenWordCard = function (word) {
    if (wordCardUI && wordCardUI.openManual) { wordCardUI.openManual(word || ''); }
  };

  var pomodoroDockUI = null, calcUI = null;
  if (E.mountPomodoroDock) {
    pomodoroDockUI = E.mountPomodoroDock({
      storage: storage,
      onBreakStart: function () { message("Tempo de escrita concluído. Pausa iniciada."); }
    });
  }
  var findReplaceUI = null;
  if (E.mountFindReplace) {
    findReplaceUI = E.mountFindReplace({
      hostEl: byId('editor-viewport'),
      manuscriptEl: manuscript,
      getText: function () { return manuscript.value || ''; },
      isReadOnly: function () { return !!(doc && (doc.locked || doc.category === 'reference')) || !!manuscript.readOnly; },
      onReveal: function (start, end, focusEditor) {
        if (richUI && richUI.isRich && richUI.isRich()) {
          richUI.revealRange(start, end);
          return;
        }
        if (focusEditor && manuscript.focus) { manuscript.focus(); }
        if (manuscript.setSelectionRange) { manuscript.setSelectionRange(start, end); }
        if (manuscript.scrollHeight && manuscript.value.length) {
          var ratio = start / manuscript.value.length;
          manuscript.scrollTop = Math.max(0, Math.round(ratio * manuscript.scrollHeight - (manuscript.clientHeight || 200) * 0.35));
        }
        if (typeof positionFocus === 'function') { positionFocus(); }
      },
      onReplaceRange: function (start, end, rep) {
        if (richUI && richUI.isRich && richUI.isRich() && richUI.replaceRange) {
          var okR = richUI.replaceRange(start, end, rep);
          if (okR) { schedule(); }
          return okR;
        }
        manuscript.value = E.findReplaceCore.replaceOne(manuscript.value, { start: start, end: end }, rep);
        schedule();
        return true;
      },
      onReplaceAll: function (nextText) {
        if (richUI && richUI.isRich && richUI.isRich() && richUI.replaceAllPlain) {
          richUI.replaceAllPlain(nextText);
          schedule();
          return;
        }
        manuscript.value = nextText;
        schedule();
      },
      onClose: function () {
        if (richUI && richUI.isRich && richUI.isRich()) {
          var rEl = byId('esc-rich-editor');
          if (rEl && rEl.focus) { rEl.focus(); }
        } else if (manuscript && manuscript.focus) {
          manuscript.focus();
        }
      }
    });
    if (byId('esc-find-btn')) {
      listen(byId('esc-find-btn'), 'click', function () {
        if (findReplaceUI.isOpen()) { findReplaceUI.close(); }
        else { findReplaceUI.open(); }
      });
    }
  }
  if (E.mountCalculator) {
    calcUI = E.mountCalculator({
      getCounts: function () {
        var c = E.countManuscript ? E.countManuscript(manuscript.value || "") : { words: 0, characters: (manuscript.value || "").length };
        return { words: c.words || 0, characters: c.characters || (manuscript.value || "").length };
      }
    });
    if (byId("esc-open-calculator")) {
      listen(byId("esc-open-calculator"), "click", function () { calcUI.toggle(); });
    }
  }
  if (byId("esc-open-calendar")) {
    listen(byId("esc-open-calendar"), "click", function () { if (byId("start-calendar")) { byId("start-calendar").click(); } });
  }
  function ensureNotebookForTool(toolTitle, toolSubject, needsDocInBook, onReady) {
    var book = activeNotebook();
    if (book && (!needsDocInBook || doc.projectId)) {
      onReady();
      return;
    }
    var available = notebooks ? notebooks.list().filter(availableBook) : [];
    if (available.length > 0 && !needsDocInBook) {
      activeNotebookId = available[0].id;
      notebookLabels();
      if (workspaceUI) { workspaceUI.render(); }
      onReady();
      return;
    }
    var targetBook = book || (available.length > 0 ? available[0] : null);
    var askTitle = targetBook
      ? 'Vincular esta folha a "' + targetBook.name + '"?'
      : 'Criar projeto para abrir ' + toolTitle + '?';
    var askMsg = targetBook
      ? toolSubject + ' Podemos vincular a folha atual ao projeto "' + targetBook.name + '" agora e abrir imediatamente.'
      : toolSubject + ' Podemos criar seu primeiro projeto ("Meu projeto") e vincular esta folha agora para abrir imediatamente.';
    var askBtn = targetBook ? 'Vincular e abrir' : 'Criar projeto e abrir';
    if (E.dialog && E.dialog.ask) {
      E.dialog.ask({ title: askTitle, message: askMsg, accept: askBtn }, function (ok) {
        if (!ok) { return; }
        try {
          var chosen = targetBook;
          if (!chosen && notebooks) {
            chosen = notebooks.add('Meu projeto', null);
          }
          if (!chosen) { return; }
          activeNotebookId = chosen.id;
          doc.projectId = chosen.id;
          doc.project = chosen.name;
          dirty = true;
          persist();
          notebookLabels();
          renderNotebooks();
          if (workspaceUI) { workspaceUI.selectProject(chosen.id, doc.folder || ''); }
          updatePath();
          onReady();
        } catch (e) {
          message(e && e.message ? e.message : 'Não foi possível preparar o projeto.');
        }
      });
    } else {
      message('Crie ou selecione um projeto na coluna esquerda para abrir ' + toolTitle + '.');
    }
  }
  if (byId("esc-open-chalk")) {
    listen(byId("esc-open-chalk"), "click", function () {
      ensureNotebookForTool('o Quadro de giz', 'O Quadro de giz acompanha um projeto.', false, function () {
        if (chalkUI && chalkUI.open) { chalkUI.open(); }
        else if (byId("start-chalkboard")) { byId("start-chalkboard").click(); }
      });
    });
  }
  if (byId("esc-open-lineage")) {
    listen(byId("esc-open-lineage"), "click", function () {
      ensureNotebookForTool('as Versões do texto', 'O histórico de versões acompanha um projeto.', true, function () {
        if (byId("start-lineage")) { byId("start-lineage").click(); }
      });
    });
  }
  if (byId("esc-open-universe")) {
    listen(byId("esc-open-universe"), "click", function () {
      ensureNotebookForTool('o Universo do projeto', 'O Universo do projeto acompanha um projeto.', false, function () {
        if (byId("start-universe")) { byId("start-universe").click(); }
      });
    });
  }
  if (byId("esc-open-packages")) {
    listen(byId("esc-open-packages"), "click", function () { showPanel("mesa", "mesa-toggle", true); });
  }

  if (E.mountAcademy) {
    academyUI = E.mountAcademy({
      storage: storage,
      getContext: function () {
        var raw = manuscript.value || '';
        var counts = E.countManuscript ? E.countManuscript(raw) : { words: 0 };
        var cleanTitle = (title.value || '').replace(/^\s+|\s+$/g, '');
        return {
          words: counts.words || 0,
          hasTitle: !!(cleanTitle && cleanTitle !== 'Sem título'),
          title: cleanTitle
        };
      },
      onAction: function (action, entry, lensId) {
        if (action === 'reader') {
          if (readerUI) {
            doc.title = title.value;
            doc.text = manuscript.value;
            if (richUI && richUI.isRich()) { doc.richHtml = richUI.html(); }
            readerUI.open(doc);
          }
        } else if (action === 'superfoco') {
          if (cabinetOpen) { enterDesk(true); }
          setImmersion(true, 'manual');
        } else if (action === 'focus-title') {
          if (cabinetOpen) { enterDesk(true); } else { closePanels(false); }
          if (title && title.focus) {
            title.focus();
            if (title.select) { title.select(); }
          }
        } else if (action === 'examine-lens' && lensId) {
          if (cabinetOpen) { enterDesk(true); }
          openExaminePanel({ toggle: 'examinar-toggle', lens: lensId });
        } else if (action === 'examine') {
          if (cabinetOpen) { enterDesk(true); }
          openExaminePanel({ toggle: 'examinar-toggle' });
        } else if (action === 'calculator') {
          if (cabinetOpen) { enterDesk(true); }
          if (calcUI && calcUI.open) { calcUI.open('paginas', true); }
        } else if (action === 'cartorio') {
          if (cartorioUI && cartorioUI.open) { cartorioUI.open('desk'); }
        } else {
          if (cabinetOpen) { enterDesk(true); } else { closePanels(false); }
          if (richUI && richUI.isRich() && byId('esc-rich-editor')) { byId('esc-rich-editor').focus(); }
          else if (manuscript && manuscript.focus) { manuscript.focus(); }
        }
      }
    });
    E.openAcademyGuide = function (guideId) {
      if (!academyUI) { return; }
      if (guideId) { academyUI.openGuide(guideId); }
      else { academyUI.openList(); }
    };
    if (byId('esc-open-academy')) {
      listen(byId('esc-open-academy'), 'click', function () { academyUI.openList(); });
    }
    if (byId('start-academy')) {
      listen(byId('start-academy'), 'click', function () { toggleStart(false); academyUI.openList(); });
    }
  }

  var cartorioUI = null;
  if (E.mountCartorio) {
    cartorioUI = E.mountCartorio({
      checkpoint: checkpoint,
      download: download,
      isRestrictedPaste: function () { return !!restrictedPaste; },
      onToggleRestrictedPaste: function () {
        restrictedPaste = !restrictedPaste;
        if (byId('paste-mode')) { byId('paste-mode').setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); }
        try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {}
        return restrictedPaste;
      },
      buildCurrentPackage: function () {
        if (!notebooks) { return null; }
        var entries = exportedDocuments();
        if (!entries.length) { return null; }
        return notebooks.pack(entries, null);
      },
      onExportSealed: function () { exportNotebook(true); },
      onOpenAcademy: function (guideId) {
        if (academyUI && academyUI.openGuide) { academyUI.openGuide(guideId || 'submissao-editoras'); }
      },
      onClose: function () { if (!cabinetOpen) { manuscript.focus(); } }
    });
    if (byId('esc-open-cartorio')) {
      listen(byId('esc-open-cartorio'), 'click', function () { cartorioUI.open('desk'); });
    }
    if (byId('start-cartorio')) {
      listen(byId('start-cartorio'), 'click', function () { toggleStart(false); cartorioUI.open('desk'); });
    }
  }

  ['window-close','window-minimize','window-maximize','mesa-close','acervo-close','utility-close','desk-counts-close'].forEach(function(id){byId(id).classList.add('material-key');});
  E.mountFinish({
    book: activeNotebook, checkpoint: checkpoint, message: message,
    prepare: function(){closePanels(false);toggleStart(false);},
    prepareLock: function(){toggleStart(false);silenceSound();stopMachineStrike();finishMachineFeed();},
    save: function(book){notebooks.update(book.id,{data:book.data});},
    documents: function(){return cabinetDocuments().documents.filter(function(d){return d.projectId===activeNotebookId&&!d.trashed&&d.kind!=='reminder';});},
    open: function(entry){if(!checkpoint()){return;}try{var next=archive.get(entry.id);if(!next||next.trashed||next.projectId!==activeNotebookId){message('Este capítulo não está disponível.');return;}loadDocument(next);cabinetSelection=null;enterDesk(true);}catch(e){message('Não foi possível abrir o capítulo.');}}
  });

  chalkUI = E.mountChalk({book:activeNotebook, checkpoint:checkpoint, message:message, download:download,
    prepare:function(){closePanels(false);toggleStart(false);},
    save:function(id,revision,next){return E.chalk.write(notebooks,id,revision,next);}
  });

  E.mountLineage({checkpoint:checkpoint,message:message,document:function(){return JSON.parse(JSON.stringify(doc));},
    show:function(){toggleStart(false);showPanel('lineage-panel','start-lineage',true);},close:function(){closePanels(true);},
    mark:function(){if(!checkpoint()){throw new Error('Guarde a folha antes de criar um marco.');}forceHistory=true;dirty=true;if(!persist()){throw new Error('Não foi possível guardar o marco.');}},
    restore:function(version){
      title.value=version.title;
      manuscript.value=version.text;
      if(doc.format==='rich'&&E.richEditor&&E.richEditor.plainToSafeHtml){
        doc.richHtml=E.richEditor.plainToSafeHtml(version.text);
        if(typeof richUI!=='undefined'&&richUI&&richUI.loadDoc){richUI.loadDoc(doc);}
      }
      forceHistory=true;dirty=true;invalidate();
      if(!persist()){throw new Error('Não foi possível guardar a restauração. O texto escolhido permanece na folha.');}
      growManuscript();
    }
  });

  E.mountUtilities({
    storage: storage ? notebookStorage() : null, checkpoint: checkpoint, download: download,
    hideStart: function () { toggleStart(false); },
    show: function (id, trigger) { if (document.body.getAttribute('data-locked') === 'true' || !byId('story-screen').hidden || !byId('chalkboard').hidden) { return; } toggleStart(false); showPanel(id, trigger, true); },
    close: function () { closePanels(true); },
    write: function () { if (cabinetOpen) { enterDesk(true); } else { closePanels(false); manuscript.focus(); growManuscript(); } },
    documents: function () { return cabinetDocuments().documents.filter(function (d) { return !activeNotebookId || d.projectId === activeNotebookId; }); },
    openNote: function (entry) {
      if (!checkpoint()) { return; }
      try { var next = archive.get(entry.id); if (!next || next.trashed) { return; } loadDocument(next); cabinetSelection = null; enterDesk(true); }
      catch (e) { message('Não foi possível abrir esta folha.'); }
    }
  });

  listen(document, 'visibilitychange', function () { if (document.hidden) { if (checkpoint()) { rememberNotebook(); } silenceSound(); stopMachineStrike(); finishMachineFeed(); } });
  listen(window, 'pagehide', function () { if (checkpoint()) { rememberNotebook(); } });
  listen(window, 'beforeunload', function (event) { if (!checkpoint()) { event.preventDefault(); event.returnValue = 'Há escrita que não foi guardada.'; } });
}());
