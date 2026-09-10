(function () {
  'use strict';
  var E = window.Escr, vault = E.createVault(E.knowledge), storage = null, archive = null;
  var doc = E.freshDocument(), dirty = false, timer = null, pendingAnalysis = null, snapshot = '', activeLens = '', composing = false, audio = null;
  var title = byId('titulo'), manuscript = byId('manuscrito'), saveStatus = byId('save-status'), analysisStatus = byId('analysis-status');
  var activePanel = '', panelTrigger = null, panelIds = ['oficina', 'acervo', 'mesa'], panelToggles = ['examinar-toggle', 'acervo-toggle', 'mesa-toggle'];
  var focusEnabled = true, focusTimer = null, focusMeasure = null, typewriterTimer = null;
  var lensButtons = document.querySelectorAll('[data-lens]');
  var timelineEntries = [], timelineCount = 40, timelineRendering = false, months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function byId(id) { return document.getElementById(id); }
  function text(node, value) { node.textContent = value; }
  function listen(node, event, fn) { node.addEventListener(event, fn, false); }
  function paragraph(parent, value, className) { var p = document.createElement('p'); if (className) { p.className = className; } text(p, value); parent.appendChild(p); return p; }
  function button(parent, label, fn) { var b = document.createElement('button'); b.type = 'button'; text(b, label); listen(b, 'click', fn); parent.appendChild(b); return b; }
  function message(value) { text(saveStatus, value); text(byId('panel-status'), value); if (activePanel === 'acervo') { text(byId('archive-status'), value); } }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function timeLabel(date) { return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()); }
  function noteDate(entry) { return entry.created || entry.updated; }
  function metadata(entry) { return { id: entry.id, noteId: entry.noteId || entry.id, title: entry.title, created: noteDate(entry), updated: entry.updated, createdApproximate: !entry.created || !!entry.createdApproximate }; }
  function renderTimeline(refresh, previousId, reveal) {
    var list = byId('timeline-list'), date = new Date(noteDate(doc)), monthKey = '', dayKey = '', active = null, oldScroll = list.scrollTop;
    timelineRendering = true;
    if (list.style && list.clientHeight) { list.style.paddingTop = Math.max(16, list.clientHeight / 2 - 32) + 'px'; list.style.paddingBottom = list.style.paddingTop; }
    text(byId('manuscript-date'), timeLabel(date) + ' · ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear());
    byId('manuscript-date').setAttribute('datetime', noteDate(doc));
    byId('manuscript-date').setAttribute('aria-label', doc.created && !doc.createdApproximate ? 'Data de criação da folha' : 'Data preservada da folha antiga; criação desconhecida');
    if (refresh && archive) {
      try { timelineEntries = archive.list().documents.map(metadata); } catch (ignore) { /* A folha aberta permanece acessível. */ }
    }
    timelineEntries = timelineEntries.filter(function (entry) { return entry.id !== doc.id && entry.id !== previousId; });
    timelineEntries.push(metadata(doc));
    timelineEntries.sort(function (a, b) { return Date.parse(a.created) - Date.parse(b.created) || (a.noteId < b.noteId ? -1 : a.noteId > b.noteId ? 1 : 0); });
    if (reveal) { timelineEntries.forEach(function (entry, i) { if (entry.id === doc.id) { timelineCount = Math.max(timelineCount, timelineEntries.length - i); } }); }
    var visible = timelineEntries.slice(-timelineCount);
    list.textContent = '';
    if (visible.length < timelineEntries.length) { var older = button(list, 'Anteriores ↑', olderNotes); older.className = 'timeline-older'; }
    visible.forEach(function (entry) {
      var when = new Date(entry.created), month = when.getFullYear() + '-' + when.getMonth(), day = month + '-' + when.getDate();
      if (month !== monthKey) {
        var m = paragraph(list, months[when.getMonth()].slice(0, 1).toUpperCase() + months[when.getMonth()].slice(1, 3) + ' ' + when.getFullYear(), 'timeline-month');
        m.setAttribute('title', months[when.getMonth()] + ' de ' + when.getFullYear()); monthKey = month;
      }
      if (day !== dayKey) { paragraph(list, when.getDate() + ' ' + ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][when.getDay()], 'timeline-day'); dayKey = day; }
      var b = button(list, '', function () {
        if (entry.id === doc.id || !persist()) { return; }
        try {
          var next = archive && archive.get(entry.id);
          if (!next) { renderTimeline(true); message('Esta folha mudou. Consulte o acervo para abrir a versão guardada.'); return; }
          loadDocument(next); collapseTimeline(); showPanel('oficina', 'examinar-toggle', false);
          try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
        } catch (e) { message('Não foi possível abrir esta folha. Sua escrita permanece aqui.'); }
      });
      noteLabel(b, entry.title, timeLabel(when));
      if (entry.id === doc.id) { active = b; }
      b.className = 'timeline-entry'; b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false');
      b.setAttribute('aria-label', (entry.title || 'Sem título') + ', ' + when.getDate() + ' de ' + months[when.getMonth()] + ' de ' + when.getFullYear() + ', ' + timeLabel(when) + (entry.createdApproximate ? '; data antiga preservada, criação desconhecida' : ''));
      b.setAttribute('title', entry.title || 'Sem título');
    });
    list.scrollTop = reveal && active ? Math.max(0, active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2) : oldScroll;
    timelineRendering = false; shapeWheel();
  }
  function olderNotes() {
    if (timelineRendering || timelineCount >= timelineEntries.length) { return; }
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
      renderTimeline(false, previousId);
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
    dirty = true; invalidate(); window.clearTimeout(timer);
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
    var top = marker.offsetTop;
    document.body.removeChild(mirror); return { top: top, line: line };
  }
  function updateFocus() {
    if (!window.getComputedStyle || !manuscript.style) { return; }
    var before = byId('focus-before'), after = byId('focus-after');
    before.hidden = true; after.hidden = true;
    if (!focusEnabled || composing || !manuscript.value) { return; }
    var bounds = paragraphBounds(manuscript.value, manuscript.selectionStart, manuscript.selectionEnd);
    if (!focusMeasure || focusMeasure.value !== manuscript.value || focusMeasure.width !== manuscript.clientWidth || focusMeasure.start !== bounds.start || focusMeasure.end !== bounds.end) {
      focusMeasure = { value: manuscript.value, width: manuscript.clientWidth, start: bounds.start, end: bounds.end, first: textPosition(bounds.start), last: textPosition(bounds.end) };
    }
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
  function typewriterInsets() {
    if (!window.getComputedStyle || !manuscript.style || !manuscript.clientHeight) { return; }
    var style = window.getComputedStyle(manuscript), line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.7;
    var inset = Math.max(0, (manuscript.clientHeight - line) / 2);
    manuscript.style.paddingTop = inset + 'px'; manuscript.style.paddingBottom = inset + 'px';
    focusMeasure = null;
  }
  function centerTypingLine() {
    typewriterTimer = null;
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript || manuscript.selectionStart !== manuscript.selectionEnd) { return; }
    var position = textPosition(manuscript.selectionStart);
    manuscript.scrollTop = Math.max(0, position.top + position.line / 2 - manuscript.clientHeight / 2);
    updateFocus();
  }
  function followTyping() {
    cancelTypewriter();
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript) { return; }
    typewriterTimer = window.setTimeout(centerTypingLine, 20);
  }
  function sizeWorkspace() {
    var area = byId('writing-space');
    if (area.style && window.innerHeight) {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      area.style.height = height + 'px';
      document.body.setAttribute('data-viewport', height < 360 ? 'small' : height < 480 ? 'compact' : 'full');
    }
    typewriterInsets(); growManuscript(); followTyping(); renderTimeline(false, null, true);
  }
  function shapeWheel() {
    var list = byId('timeline-list'), children = list.childNodes, centre = list.clientHeight / 2, i, node, distance, angle, scale;
    if (!list.style) { return; }
    for (i = 0; i < children.length; i += 1) {
      node = children[i]; if (node.className !== 'timeline-entry') { continue; }
      distance = (node.offsetTop + node.offsetHeight / 2 - list.scrollTop - centre) / Math.max(centre, 1);
      angle = Math.max(-48, Math.min(48, distance * -38)); scale = Math.max(.88, 1 - Math.abs(distance) * .07);
      node.style.transform = 'perspective(500px) rotateX(' + angle + 'deg) scale(' + scale + ')';
      node.style.webkitTransform = node.style.transform;
      node.style.opacity = String(Math.max(.42, 1 - Math.abs(distance) * .35));
    }
  }
  function revealSelection(start, end) {
    returnToWriting(); manuscript.setSelectionRange(start, end);
    if (!window.getComputedStyle) { return; }
    manuscript.scrollTop = Math.max(0, textPosition(start).top - manuscript.clientHeight / 3); updateFocus();
  }
  function collapseTimeline() {
    byId('timeline-toggle').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'false');
  }
  function closePanels(restore) {
    var trigger = panelTrigger;
    panelIds.forEach(function (id, i) { byId(id).hidden = true; byId(panelToggles[i]).setAttribute('aria-expanded', 'false'); });
    activePanel = ''; panelTrigger = null;
    byId('panel-backdrop').hidden = true; document.body.setAttribute('data-panel', 'closed');
    byId('writing-space').removeAttribute('aria-hidden');
    if (restore && trigger && trigger.focus) { trigger.focus(); }
  }
  function showPanel(id, toggle, open) {
    if (!open) { if (activePanel === id) { closePanels(true); } return; }
    closePanels(false); collapseTimeline();
    panelTrigger = byId(toggle); activePanel = id; text(byId('panel-status'), '');
    byId(id).hidden = false; byId(toggle).setAttribute('aria-expanded', 'true');
    byId('panel-backdrop').hidden = false; document.body.setAttribute('data-panel', 'open');
    byId(id).focus(); byId('writing-space').setAttribute('aria-hidden', 'true');
  }
  function returnToWriting() { closePanels(false); collapseTimeline(); manuscript.focus(); }
  function loadDocument(next) {
    doc = next; title.value = doc.title; manuscript.value = doc.text; dirty = false; manuscript.scrollTop = 0; manuscript.setSelectionRange(0, 0); growManuscript();
    invalidate(); text(analysisStatus, 'Nenhuma análise iniciada.');
    byId('reset-dismissed').hidden = !doc.dismissed.length;
    message(doc.revision ? 'Guardado neste aparelho.' : 'A folha é sua.');
    renderTimeline(true, null, true);
  }
  function renderArchive() {
    var list = byId('document-list'); list.textContent = '';
    if (!archive) { text(byId('archive-status'), 'O acervo não está disponível. Sua folha continua aberta.'); return; }
    try {
      var result = archive.list();
      text(byId('archive-status'), result.unreadable ? 'Algumas folhas não puderam ser lidas. Os registros originais foram preservados.' : result.documents.length ? '' : 'Sua primeira folha começa aqui.');
      result.documents.forEach(function (entry) {
        var li = document.createElement('li');
        var b = button(li, '', function () {
          var isCurrent = entry.id === doc.id;
          if (!persist()) { return; }
          loadDocument(isCurrent ? doc : entry); showPanel('acervo', 'acervo-toggle', false);
          try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
          message('Folha aberta.');
        });
        noteLabel(b, entry.title, timeLabel(new Date(noteDate(entry))) + ' · ' + new Date(noteDate(entry)).toLocaleDateString('pt-BR'));
        b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false'); list.appendChild(li);
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
    byId('reset-dismissed').hidden = !doc.dismissed.length;
  }
  function examine(lens) {
    if (pendingAnalysis !== null || composing) { return; }
    snapshot = manuscript.value; activeLens = lens;
    byId('findings').textContent = '';
    text(analysisStatus, 'Observando o manuscrito…');
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = true; lensButtons[i].setAttribute('aria-pressed', lensButtons[i].getAttribute('data-lens') === lens ? 'true' : 'false'); }
    pendingAnalysis = window.setTimeout(function () {
      pendingAnalysis = null;
      try { renderResult(vault.analyze(lens, snapshot)); } catch (e) { text(analysisStatus, e.message); }
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
    var result = archive ? archive.list() : { documents: [], unreadable: 0 };
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
          latest = E.freshDocument(); latest.title = entries[0].title; latest.text = entries[0].text; latest.created = noteDate(entries[0]); latest.createdApproximate = !entries[0].created || !!entries[0].createdApproximate; loadDocument(latest); dirty = true; message('Arquivo aberto apenas nesta folha. Baixe uma cópia antes de sair.'); return;
        }
        entries.forEach(function (entry) {
          var imported = E.freshDocument(); imported.title = entry.title; imported.text = entry.text; imported.dismissed = entry.dismissed.slice(); imported.created = noteDate(entry); imported.createdApproximate = !entry.created || !!entry.createdApproximate; latest = archive.save(imported).document; count += 1;
        });
        loadDocument(latest); message('Arquivo trazido como ' + count + (count === 1 ? ' nova folha.' : ' novas folhas.')); renderArchive();
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
  try {
    storage = window.localStorage; archive = E.createArchive(storage);
    var currentId = storage.getItem('escrevaral.astra.current'), current = currentId ? archive.get(currentId) : null;
    if (!current) { current = archive.list().documents[0]; }
    if (current) { loadDocument(current); }
    applyTheme(storage.getItem('escrevaral.astra.theme'));
    focusEnabled = storage.getItem('escrevaral.astra.focus') !== 'off'; byId('focus-toggle').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');
  } catch (e) { message('A gravação pode estar indisponível. Sua folha está aberta; baixe uma cópia em Ajustes.'); }
  renderTimeline(true, null, true); sizeWorkspace();
  listen(window, 'resize', sizeWorkspace);
  listen(window, 'load', sizeWorkspace);
  if (window.visualViewport) { listen(window.visualViewport, 'resize', sizeWorkspace); }
  listen(byId('timeline-toggle'), 'click', function () { var open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', open ? 'true' : 'false'); byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', open ? 'true' : 'false'); if (open) { renderTimeline(false, null, true); } });
  listen(byId('mesa-close'), 'click', function () { closePanels(true); });
  listen(byId('acervo-close'), 'click', function () { closePanels(true); });
  listen(byId('panel-backdrop'), 'click', function () { closePanels(true); });
  listen(document, 'mousedown', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(document, 'touchstart', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(byId('timeline-list'), 'scroll', function () { if (this.scrollTop < 24) { olderNotes(); } shapeWheel(); });
  listen(manuscript, 'input', followTyping);
  listen(manuscript, 'compositionend', function () { composing = false; followTyping(); });
  listen(manuscript, 'compositionstart', cancelTypewriter);
  listen(manuscript, 'blur', cancelTypewriter);
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
  listen(byId('focus-toggle'), 'click', function () { focusEnabled = !focusEnabled; this.setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); updateFocus(); try { if (storage) { storage.setItem('escrevaral.astra.focus', focusEnabled ? 'on' : 'off'); } } catch (ignore) { /* Préférence facultativa. */ } });
  listen(title, 'input', changed); listen(manuscript, 'input', changed);
  listen(manuscript, 'compositionstart', function () { composing = true; window.clearTimeout(timer); updateFocus(); });
  listen(manuscript, 'compositionend', function () { composing = false; changed(); });
  listen(byId('acervo-toggle'), 'click', function () { if (!persist()) { return; } var open = byId('acervo').hidden; showPanel('acervo', 'acervo-toggle', open); if (open) { renderArchive(); } });
  listen(byId('mesa-toggle'), 'click', function () { showPanel('mesa', 'mesa-toggle', byId('mesa').hidden); });
  listen(byId('examinar-toggle'), 'click', function () { var open = byId('oficina').hidden; showPanel('oficina', 'examinar-toggle', open); if (open) { lensButtons[0].focus(); } });
  listen(byId('back-writing'), 'click', returnToWriting);
  function newDocument() { if (!persist()) { return; } loadDocument(E.freshDocument()); dirty = true; persist(); renderTimeline(false, null, true); showPanel('acervo', 'acervo-toggle', false); collapseTimeline(); }
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
  listen(byId('export-text'), 'click', function () { download((title.value ? title.value + '\n\n' : '') + manuscript.value, 'text/plain', 'manuscrito.txt'); });
  listen(byId('export-backup'), 'click', function () { persist(); try { download(JSON.stringify({ format: 'escrevaral-astra', version: 1, documents: exportedDocuments() }, null, 2), 'application/json', 'escrevaral-copia.json'); } catch (e) { message('Não foi possível reunir o acervo. Baixe o texto da folha atual.'); } });
  listen(byId('import-file'), 'focus', function () { this.parentNode.setAttribute('data-focus', 'true'); });
  listen(byId('import-file'), 'blur', function () { this.parentNode.setAttribute('data-focus', 'false'); });
  listen(byId('import-file'), 'change', function () { importFile(this.files[0]); this.value = ''; });
  listen(document, 'keydown', function (event) {
    var code = event.keyCode;
    if (code === 9) {
      document.body.setAttribute('data-input', 'keyboard');
      if (activePanel) {
        var controls = byId(activePanel).querySelectorAll('button, input, select, a[href], [tabindex="0"]'), focusable = [], j;
        for (j = 0; j < controls.length; j += 1) { if (!controls[j].disabled && !controls[j].hidden && controls[j].getClientRects().length) { focusable.push(controls[j]); } }
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); byId(activePanel).focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === byId(activePanel))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === byId(activePanel))) { event.preventDefault(); first.focus(); }
      }
    }
    if ((event.ctrlKey || event.metaKey) && code === 13) { event.preventDefault(); showPanel('oficina', 'examinar-toggle', true); panelTrigger = manuscript; lensButtons[0].focus(); }
    else if ((event.ctrlKey || event.metaKey) && code === 83) { event.preventDefault(); persist(); }
    else if (code === 27) { if (activePanel) { closePanels(true); } else { collapseTimeline(); } }
  });
  listen(document, 'visibilitychange', function () { if (document.hidden) { persist(); stopSound(); } });
  listen(window, 'pagehide', persist);
  listen(window, 'beforeunload', function (event) { if (!persist()) { event.preventDefault(); event.returnValue = 'Há escrita que não foi guardada.'; } });
}());
