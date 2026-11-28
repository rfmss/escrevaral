/* Assistente Visual Ao Vivo do Soneto (Partitura Silábica, Mapa 14 Versos, Volta e Rimas Consoantes/Toantes) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var SCHEMES = [
    'ABBA ABBA CDC DCD',
    'ABBA ABBA CDE CDE',
    'ABAB ABAB CDC DCD',
    'ABAB CDCD EFEF GG',
    'ABAB BCBC CDCD EE',
    'AABB AABB CDC DCD',
    'Livre'
  ];

  var SCHEME_NAMES = {
    'ABBA ABBA CDC DCD': 'Italiano / petrarquiano',
    'ABBA ABBA CDE CDE': 'Italiano · outra terminação',
    'ABAB ABAB CDC DCD': 'Quartetos alternados',
    'ABAB CDCD EFEF GG': 'Inglês / shakespeariano',
    'ABAB BCBC CDCD EE': 'Spenseriano',
    'AABB AABB CDC DCD': 'Quartetos emparelhados'
  };

  var RHYTHMS = {
    none: 'Livre · conferir contagem apenas',
    heroic: 'Decassílabo heroico · apoios 6ª e 10ª',
    sapphic: 'Decassílabo sáfico · apoios 4ª, 8ª e 10ª',
    alexandrine: 'Alexandrino · dois hemistíquios de 6'
  };

  var GUIDANCE = [
    'Uma imagem para abrir o poema.',
    'O que se move nessa imagem?',
    'Um detalhe que a transforma.',
    'Onde o primeiro movimento pousa?',
    'Retome ou contraste a imagem inicial.',
    'Que tensão ganha força?',
    'Que som ou detalhe merece ficar?',
    'Prepare a passagem para outro olhar.',
    'Volta: experimente uma virada de perspectiva.',
    'O que essa mudança permite perceber?',
    'Leve a imagem um pouco além.',
    'Aproxime o poema do seu desfecho.',
    'O que ainda precisa ressoar?',
    'Encontre o último verso.'
  ];

  var RHYME_PALETTE = {
    A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f', G: 'g',
    H: 'a', I: 'b', J: 'c', K: 'd', L: 'e', M: 'f', N: 'g'
  };

  function verso() { return root.Escr.versoCore || null; }

  function findRhymesFor(word) {
    var vc = verso();
    if (vc && vc.findRhymes) {
      return vc.findRhymes(word, 30).consonant;
    }
    var poetry = root.Escr.poetry;
    var lex = root.Escr.portiLexicon;
    if (!poetry || !lex || !lex.entries || !word) { return []; }
    var clean = String(word).replace(/^[^a-záàâãéêíóôõúüç]+|[^a-záàâãéêíóôõúüç]+$/gi, '').toLowerCase();
    if (!clean) { return []; }
    var r = poetry.wordReading(clean);
    if (!r || !r.rhyme) { return []; }
    var keys = Object.keys(lex.entries), out = [], i, w, wr;
    for (i = 0; i < keys.length && out.length < 30; i += 1) {
      w = keys[i];
      if (w === clean || w.length < 2 || w.length > 24) { continue; }
      wr = poetry.wordReading(w);
      if (wr && wr.rhyme === r.rhyme) { out.push(w); }
    }
    return out;
  }

  function structureOf(scheme) {
    if (scheme === 'Livre') { return 'italian'; }
    var clean = String(scheme || '').replace(/\s+/g, '');
    if (clean === 'ABABCDCDEFEFGG' || clean === 'ABABBCBCCDCDEE') { return 'english'; }
    return 'italian';
  }

  function defaultSettings() {
    return { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'heroic', elisions: {} };
  }

  function normalizeSettings(raw) {
    var base = { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'none', elisions: {} };
    if (!raw || typeof raw !== 'object') { return base; }
    if (raw.structure === 'italian' || raw.structure === 'english') { base.structure = raw.structure; }
    if (typeof raw.scheme === 'string' && raw.scheme) { base.scheme = raw.scheme; }
    if (typeof raw.target === 'number' && raw.target >= 2 && raw.target <= 20) { base.target = raw.target; }
    if (typeof raw.rhythm === 'string' && Object.prototype.hasOwnProperty.call(RHYTHMS, raw.rhythm)) { base.rhythm = raw.rhythm; }
    if (raw.elisions && typeof raw.elisions === 'object') { base.elisions = raw.elisions; }
    return base;
  }

  function analyzeText(text, activeLineIdx, settings) {
    var vc = verso();
    var poetry = root.Escr.poetry;
    var linesRaw = String(text || '').split(/\r?\n/);
    var rows = [];
    var stanzas = [];
    var currentStanza = 0;
    var letters = settings.scheme === 'Livre' ? '' : String(settings.scheme || '').replace(/\s+/g, '');
    var i, count = 0;

    for (i = 0; i < linesRaw.length && rows.length < 200; i += 1) {
      var trimmed = linesRaw[i].replace(/^\s+|\s+$/g, '');
      if (!trimmed) {
        if (currentStanza > 0) { stanzas.push(currentStanza); currentStanza = 0; }
        continue;
      }
      var isPlaceholder = root.Escr.templates && root.Escr.templates.isPlaceholder(trimmed);
      var isHeading = trimmed.indexOf('#') === 0;
      if (isHeading && rows.length === 0) { continue; }
      count += 1;
      currentStanza += 1;
      var scan = !isPlaceholder ? (vc ? vc.scanLine(trimmed) : (poetry ? poetry.scan(trimmed) : null)) : null;
      var lineOverrides = (settings.elisions && settings.elisions['v' + count]) || null;
      var scansion = scan && vc ? vc.buildSyllableCells(scan, lineOverrides) : null;
      var letter = letters && count <= letters.length ? letters.charAt(count - 1) : '';
      rows.push({
        number: count,
        lineIndex: i,
        text: trimmed,
        placeholder: isPlaceholder,
        reading: scan,
        scansion: scansion,
        letter: letter,
        rhymeState: 'open',
        lastWord: scan && scan.words.length ? scan.words[scan.words.length - 1].word : ''
      });
    }
    if (currentStanza > 0) { stanzas.push(currentStanza); }

    /* Calcula estado das rimas por família (consoante ● / toante ◎ / aberto ○) */
    var firstByLetter = {};
    for (i = 0; i < rows.length; i += 1) {
      var rowI = rows[i];
      if (!rowI.letter || rowI.placeholder || !rowI.reading) { continue; }
      var lk = '$' + rowI.letter;
      if (!firstByLetter[lk]) {
        firstByLetter[lk] = rowI;
      } else {
        var anchor = firstByLetter[lk];
        var mk = vc ? vc.rhymeMatchKind(rowI.reading, anchor.reading)
          : (rowI.reading.rhyme && anchor.reading.rhyme && rowI.reading.rhyme === anchor.reading.rhyme ? 'consonant' : 'none');
        if (mk === 'consonant') {
          rowI.rhymeState = 'consonant';
          if (anchor.rhymeState === 'open') { anchor.rhymeState = 'consonant'; }
        } else if (mk === 'assonant') {
          rowI.rhymeState = 'assonant';
          if (anchor.rhymeState === 'open') { anchor.rhymeState = 'assonant'; }
        }
      }
    }

    var current = null;
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].lineIndex === activeLineIdx) { current = rows[i]; break; }
    }
    if (!current && rows.length) {
      for (i = rows.length - 1; i >= 0; i -= 1) {
        if (rows[i].lineIndex <= activeLineIdx) { current = rows[i]; break; }
      }
      if (!current) { current = rows[0]; }
    }

    var rhymeReference = null;
    if (current && current.letter) {
      for (i = 0; i < rows.length; i += 1) {
        if (rows[i].number === current.number) { break; }
        if (rows[i].letter === current.letter && !rows[i].placeholder) {
          var matchKind = (current.reading && rows[i].reading && vc)
            ? vc.rhymeMatchKind(current.reading, rows[i].reading)
            : ((current.reading && rows[i].reading && current.reading.rhyme === rows[i].reading.rhyme) ? 'consonant' : 'none');
          rhymeReference = {
            number: rows[i].number,
            word: rows[i].lastWord,
            possible: matchKind === 'consonant',
            matchKind: matchKind
          };
          break;
        }
      }
    }

    /* Sugestão inteligente: prioriza o verso-par (o que o poeta precisa rimar AGORA!) */
    var refWord = (rhymeReference && rhymeReference.word)
      ? rhymeReference.word
      : (current && current.lastWord ? current.lastWord : '');

    return {
      written: rows.filter(function (r) { return !r.placeholder; }).length,
      stanzas: stanzas,
      rows: rows,
      current: current,
      rhymeReference: rhymeReference,
      suggestionWord: refWord
    };
  }

  function cursorLineOf(el) {
    if (!el || typeof el.value !== 'string') { return 0; }
    var pos = typeof el.selectionStart === 'number' ? el.selectionStart : 0;
    return el.value.slice(0, pos).split(/\r?\n/).length - 1;
  }

  function isSonnetDoc(doc) {
    if (!doc || doc.trashed) { return false; }
    return doc.role === 'sonnet' || doc.folder === '02 · Poema';
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }
  function createEl(tag, className, textValue) {
    var el = document.createElement(tag);
    if (className) { el.className = className; }
    if (typeof textValue === 'string') { el.textContent = textValue; }
    return el;
  }

  root.Escr.sonnetCore = {
    schemes: SCHEMES,
    rhythms: RHYTHMS,
    analyze: analyzeText,
    findRhymes: findRhymesFor,
    normalizeSettings: normalizeSettings
  };

  root.Escr.mountSonnetAssistant = function (opts) {
    var container = byId(opts.containerId || 'esc-sonnet-panel');
    var manuscript = opts.manuscriptEl;
    var activeDoc = null;
    var collapsed = false;
    var mobileSheetOpen = false;
    var manualLine = null;
    var lastCursorLine = -1;
    var composing = false;
    var rhymeQuery = '';
    var rhymeTab = 'consonant';
    var showMoreRhymes = false;
    var draftScheme = '';
    var draftError = '';
    var settingsOpen = false;
    var renderTimer = null;

    function syncBodyFlag(active) {
      if (!document || !document.body) { return; }
      if (active) {
        document.body.setAttribute('data-esc-sonnet-open', collapsed ? 'collapsed' : 'open');
        document.body.setAttribute('data-esc-verse-sheet', mobileSheetOpen ? 'open' : 'closed');
      } else {
        document.body.removeAttribute('data-esc-sonnet-open');
        document.body.removeAttribute('data-esc-verse-sheet');
      }
    }

    function saveSettings(next) {
      if (!activeDoc) { return; }
      activeDoc.sonnetSettings = next;
      if (opts.onSaveSettings) { opts.onSaveSettings(next); }
      render();
    }

    function chooseSetting(key, val) {
      var cur = normalizeSettings(activeDoc && activeDoc.sonnetSettings);
      var next = { structure: cur.structure, scheme: cur.scheme, target: cur.target, rhythm: cur.rhythm, elisions: cur.elisions || {} };
      next[key] = val;
      if (key === 'structure' && next.scheme !== 'Livre' && SCHEMES.indexOf(next.scheme) !== -1 && structureOf(next.scheme) !== val) {
        next.scheme = val === 'english' ? 'ABAB CDCD EFEF GG' : SCHEMES[0];
      }
      if (key === 'scheme' && val !== 'Livre' && SCHEMES.indexOf(val) !== -1) { next.structure = structureOf(val); }
      if (key === 'rhythm' && val !== 'none') { next.target = val === 'alexandrine' ? 12 : 10; }
      if (key === 'target') { next.rhythm = 'none'; }
      draftError = '';
      saveSettings(next);
    }

    function toggleElision(verseNum, elisionKey) {
      var cur = normalizeSettings(activeDoc && activeDoc.sonnetSettings);
      var map = {};
      if (cur.elisions) {
        Object.keys(cur.elisions).forEach(function (k) { map[k] = cur.elisions[k]; });
      }
      var vKey = 'v' + verseNum;
      var vMap = {};
      if (map[vKey]) {
        Object.keys(map[vKey]).forEach(function (k) { vMap[k] = map[vKey][k]; });
      }
      vMap[elisionKey] = vMap[elisionKey] === false ? true : false;
      map[vKey] = vMap;
      saveSettings({ structure: cur.structure, scheme: cur.scheme, target: cur.target, rhythm: cur.rhythm, elisions: map });
    }

    function measureBadgeText(row, target) {
      if (!row || row.placeholder || !row.reading) { return { text: '—', tone: 'empty', count: 0 }; }
      var count = row.scansion ? row.scansion.poeticCount : row.reading.max;
      var diff = count - target;
      if (diff === 0) { return { text: count + ' ✓', tone: 'ok', count: count }; }
      if (row.reading.min <= target && row.reading.max >= target) { return { text: count + ' ~', tone: 'near', count: count }; }
      return { text: count + (diff > 0 ? ' (+' + diff + ')' : ' (' + diff + ')'), tone: 'off', count: count };
    }

    function render() {
      if (!container) { return; }
      var hintEl = byId('esc-sonnet-editor-hint');
      if (!isSonnetDoc(activeDoc)) {
        container.hidden = true;
        if (hintEl) { hintEl.hidden = true; }
        container.textContent = '';
        syncBodyFlag(false);
        return;
      }
      container.hidden = false;
      syncBodyFlag(true);
      if (hintEl) {
        var rawTxt = manuscript ? String(manuscript.value || '').replace(/^\s+|\s+$/g, '') : '';
        var hasRealVerse = rawTxt.length > 0 && rawTxt.indexOf('«') !== 0;
        hintEl.hidden = hasRealVerse;
      }

      var vc = verso();
      var settings = normalizeSettings(activeDoc.sonnetSettings);
      var lineIdx = manualLine !== null ? manualLine : cursorLineOf(manuscript);
      lastCursorLine = lineIdx;
      var res = analyzeText(manuscript ? manuscript.value : activeDoc.text, lineIdx, settings);
      var row = res.current;
      var stanzaPlan = settings.structure === 'english' ? [4, 4, 4, 2] : [4, 4, 3, 3];
      var supports = vc ? vc.expectedSupports(settings.rhythm, settings.target) : [settings.target];
      var badge = measureBadgeText(row, settings.target);

      container.textContent = '';
      var aside = createEl('aside', 'esc-sonnet esc-sonnet-live');
      aside.setAttribute('aria-label', 'Partitura ao vivo do soneto');

      /* 1. Faixa-HUD compacta (sempre útil no topo no celular/tablet) */
      var hud = createEl('div', 'esc-verse-hud');
      var hudSummary = createEl('div', 'esc-verse-hud-info');
      var hudTag = createEl('span', 'esc-verse-hud-tag', row ? ('V' + row.number + (row.letter ? ' · ' + row.letter : '')) : 'Soneto');
      var hudCount = createEl('span', 'esc-verse-hud-count is-' + badge.tone, badge.text + '/' + settings.target);
      var hudRhyme = createEl('span', 'esc-verse-hud-rhyme', res.rhymeReference ? ('rima: ' + res.rhymeReference.word) : (res.written + '/14 versos'));
      hudSummary.appendChild(hudTag);
      hudSummary.appendChild(hudCount);
      hudSummary.appendChild(hudRhyme);
      hud.appendChild(hudSummary);

      var hudBtn = createEl('button', 'esc-verse-hud-btn', mobileSheetOpen ? 'Fechar ▴' : 'Partitura ▾');
      hudBtn.type = 'button';
      hudBtn.setAttribute('aria-expanded', mobileSheetOpen ? 'true' : 'false');
      on(hudBtn, 'click', function () {
        mobileSheetOpen = !mobileSheetOpen;
        syncBodyFlag(true);
        render();
      });
      hud.appendChild(hudBtn);
      aside.appendChild(hud);

      /* 2. Cabeçalho editorial desktop */
      var top = createEl('header', 'esc-sonnet-top');
      var headLeft = createEl('div', 'esc-sonnet-head-left');
      headLeft.appendChild(createEl('strong', '', 'Soneto ao vivo'));
      headLeft.appendChild(createEl('span', 'esc-sonnet-progress', res.written + '/14 versos · ' + (settings.structure === 'english' ? 'Inglês' : 'Italiano') + ' · ' + settings.target + ' síl.'));
      top.appendChild(headLeft);

      var headActions = createEl('div', 'esc-sonnet-head-actions');
      var gearBtn = createEl('button', 'esc-sonnet-chip-btn', '⚙ Forma');
      gearBtn.type = 'button';
      gearBtn.setAttribute('aria-pressed', settingsOpen ? 'true' : 'false');
      on(gearBtn, 'click', function () { settingsOpen = !settingsOpen; render(); });
      headActions.appendChild(gearBtn);

      var toggleBtn = createEl('button', 'esc-sonnet-quiet', collapsed ? 'Abrir' : 'Recolher');
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      on(toggleBtn, 'click', function () { collapsed = !collapsed; syncBodyFlag(true); render(); });
      headActions.appendChild(toggleBtn);
      top.appendChild(headActions);
      aside.appendChild(top);

      /* Barra visual de progresso dos 14 versos */
      var progTrack = createEl('div', 'esc-sonnet-prog-track');
      var progFill = createEl('span', 'esc-sonnet-prog-fill');
      if (progFill.style) { progFill.style.width = Math.min(100, Math.round((res.written / 14) * 100)) + '%'; }
      progTrack.appendChild(progFill);
      aside.appendChild(progTrack);

      if (collapsed) {
        container.appendChild(aside);
        return;
      }

      var body = createEl('div', 'esc-sonnet-body');

      /* Gaveta compacta de Forma (recolhida por padrão p/ dar palco à partitura) */
      if (settingsOpen || draftError) {
        var formBox = createEl('section', 'esc-sonnet-settings-box');
        var controls = createEl('div', 'esc-sonnet-controls');

        var lStruct = createEl('label', '', 'Estrutura');
        var sStruct = createEl('select');
        [['italian', 'Italiano · 4 / 4 / 3 / 3'], ['english', 'Inglês · 4 / 4 / 4 / 2']].forEach(function (pair) {
          var o = createEl('option', '', pair[1]); o.value = pair[0];
          if (settings.structure === pair[0]) { o.selected = true; }
          sStruct.appendChild(o);
        });
        on(sStruct, 'change', function () { chooseSetting('structure', sStruct.value); });
        lStruct.appendChild(sStruct);
        controls.appendChild(lStruct);

        var lScheme = createEl('label', '', 'Esquema de rimas');
        var sScheme = createEl('select');
        var optsList = SCHEMES.slice();
        if (optsList.indexOf(settings.scheme) === -1) { optsList.push(settings.scheme); }
        optsList.filter(function (sc) { return sc === 'Livre' || sc === settings.scheme || structureOf(sc) === settings.structure; }).forEach(function (sc) {
          var o = createEl('option', '', sc === 'Livre' ? 'Rimas livres' : (SCHEME_NAMES[sc] || 'Personalizado') + ' · ' + sc);
          o.value = sc;
          if (settings.scheme === sc) { o.selected = true; }
          sScheme.appendChild(o);
        });
        on(sScheme, 'change', function () { chooseSetting('scheme', sScheme.value); });
        lScheme.appendChild(sScheme);
        controls.appendChild(lScheme);

        var lTarget = createEl('label', '', 'Medida');
        var sTarget = createEl('select');
        [[10, 'Decassílabo · 10'], [12, 'Alexandrino · 12'], [7, 'Redondilha maior · 7'], [5, 'Redondilha menor · 5']].forEach(function (pair) {
          var o = createEl('option', '', pair[1]); o.value = String(pair[0]);
          if (settings.target === pair[0]) { o.selected = true; }
          sTarget.appendChild(o);
        });
        on(sTarget, 'change', function () { chooseSetting('target', Number(sTarget.value)); });
        lTarget.appendChild(sTarget);
        controls.appendChild(lTarget);

        var lRhythm = createEl('label', '', 'Ritmo e apoios');
        var sRhythm = createEl('select');
        Object.keys(RHYTHMS).forEach(function (k) {
          var o = createEl('option', '', RHYTHMS[k]); o.value = k;
          if (settings.rhythm === k) { o.selected = true; }
          sRhythm.appendChild(o);
        });
        on(sRhythm, 'change', function () { chooseSetting('rhythm', sRhythm.value); });
        lRhythm.appendChild(sRhythm);
        controls.appendChild(lRhythm);

        var customWrap = createEl('div', 'esc-sonnet-custom');
        var cLabel = createEl('label', '', 'Esquema personalizado (14 letras A–N)');
        var cInput = createEl('input');
        cInput.type = 'text'; cInput.maxLength = 30; cInput.value = draftScheme;
        cInput.placeholder = settings.structure === 'english' ? 'ABAB BCBC CDCD EE' : 'AABB AABB CDC DCD';
        on(cInput, 'input', function () { draftScheme = cInput.value; draftError = ''; });
        cLabel.appendChild(cInput);
        customWrap.appendChild(cLabel);
        var cBtn = createEl('button', 'esc-sonnet-chip-btn', 'Aplicar esquema');
        cBtn.type = 'button';
        on(cBtn, 'click', function () {
          var lettersOnly = String(cInput.value || '').toUpperCase().replace(/\s+/g, '');
          if (!/^[A-N]{14}$/.test(lettersOnly)) {
            draftError = 'Use 14 letras de A a N.';
            render();
            return;
          }
          var pos = 0, chunks = [], si3;
          for (si3 = 0; si3 < stanzaPlan.length; si3 += 1) {
            chunks.push(lettersOnly.slice(pos, pos + stanzaPlan[si3]));
            pos += stanzaPlan[si3];
          }
          chooseSetting('scheme', chunks.join(' '));
        });
        customWrap.appendChild(cBtn);
        if (draftError) { customWrap.appendChild(createEl('p', 'esc-sonnet-err', draftError)); }
        controls.appendChild(customWrap);

        formBox.appendChild(controls);
        body.appendChild(formBox);
      }

      /* 3. PARTITURA SILÁBICA AO VIVO DO VERSO ATIVO */
      var curSec = createEl('section', 'esc-sonnet-score-card');
      var curTop = createEl('div', 'esc-sonnet-current-title');
      var curBadgeWrap = createEl('div', 'esc-sonnet-cur-left');
      curBadgeWrap.appendChild(createEl('strong', '', row ? ('Verso ' + row.number) : 'Comece a escrever'));
      if (row && row.letter) {
        var letPill = createEl('span', 'esc-rhyme-pill is-fam-' + (RHYME_PALETTE[row.letter] || 'a'), row.letter);
        curBadgeWrap.appendChild(letPill);
      }
      curTop.appendChild(curBadgeWrap);
      curTop.appendChild(createEl('span', 'esc-sonnet-status-pill is-' + badge.tone, badge.text + ' / ' + settings.target));
      curSec.appendChild(curTop);

      if (manualLine !== null) {
        var resumeBtn = createEl('button', 'esc-sonnet-quiet', '← Voltar a acompanhar o cursor');
        resumeBtn.type = 'button';
        on(resumeBtn, 'click', function () { manualLine = null; rhymeQuery = ''; showMoreRhymes = false; render(); });
        curSec.appendChild(resumeBtn);
      }

      if (row && !row.placeholder && row.scansion && row.scansion.cells.length) {
        var cellsWrap = createEl('div', 'esc-syl-strip');
        row.scansion.cells.forEach(function (cell) {
          var isSupport = supports.indexOf(cell.index) !== -1;
          var isCaesura = settings.rhythm === 'alexandrine' && cell.index === 7;
          if (isCaesura) {
            cellsWrap.appendChild(createEl('span', 'esc-syl-caesura', '│'));
          }
          var cellEl = createEl('div', 'esc-syl-cell' +
            (cell.tonic ? ' is-tonic' : '') +
            (isSupport ? ' is-support' : '') +
            (cell.index > settings.target ? ' is-over' : '') +
            (cell.canToggleElision ? ' is-elidable' : ''));

          if (cell.canToggleElision) {
            var eBtn = createEl('button', 'esc-syl-txt');
            eBtn.type = 'button';
            eBtn.title = cell.fused ? 'Elisão ativa (clique para separar em hiato)' : 'Hiato ativo (clique para fundir em elisão)';
            eBtn.textContent = cell.fused ? (cell.text + '◡' + cell.fusedText) : cell.text;
            on(eBtn, 'click', function () { toggleElision(row.number, cell.elisionKey); });
            cellEl.appendChild(eBtn);
          } else {
            cellEl.appendChild(createEl('span', 'esc-syl-txt', cell.text));
          }
          cellEl.appendChild(createEl('span', 'esc-syl-num', String(cell.index)));
          var beatMark = isSupport ? (cell.tonic ? '★' : '☆') : (cell.tonic ? '●' : '○');
          cellEl.appendChild(createEl('span', 'esc-syl-beat' + (isSupport && cell.tonic ? ' is-hit' : ''), beatMark));
          cellsWrap.appendChild(cellEl);
        });
        if (row.scansion.postTonic.length) {
          var post = createEl('div', 'esc-syl-cell is-post');
          post.appendChild(createEl('span', 'esc-syl-txt', '(' + row.scansion.postTonic.join('·') + ')'));
          post.appendChild(createEl('span', 'esc-syl-num', '—'));
          post.appendChild(createEl('span', 'esc-syl-beat', '·'));
          cellsWrap.appendChild(post);
        }
        curSec.appendChild(cellsWrap);

        var legendTxt = (settings.rhythm !== 'none' ? RHYTHMS[settings.rhythm] : 'Tônicas em ● · pós-tônicas entre parênteses') +
          (row.scansion.elisionCount > 0 ? ' · clique em ◡ para alternar elisão/hiato.' : '.');
        curSec.appendChild(createEl('p', 'esc-sonnet-caption', legendTxt));
      } else {
        var guideMsg = row ? (GUIDANCE[row.number - 1] || 'Escreva um verso por linha para acender a partitura.') : GUIDANCE[0];
        curSec.appendChild(createEl('p', 'esc-sonnet-prompt', guideMsg));
      }

      if (row && settings.scheme !== 'Livre') {
        var rLine = createEl('p', 'esc-sonnet-rhyme-line');
        if (res.rhymeReference) {
          var statusLbl = res.rhymeReference.matchKind === 'consonant' ? '✓ rima consoante'
            : res.rhymeReference.matchKind === 'assonant' ? '◎ rima toante'
            : 'aguardando rima';
          rLine.textContent = 'Par do verso ' + res.rhymeReference.number + ' (“' + res.rhymeReference.word + '”) · ' + statusLbl;
        } else {
          rLine.textContent = 'Verso ' + row.number + ' abre a família de rima ' + (row.letter || '') + '.';
        }
        curSec.appendChild(rLine);
      }
      body.appendChild(curSec);

      /* 4. MAPA VISUAL DOS 14 VERSOS (4-4-3-3 / 4-4-4-2 + LINHA DA VOLTA) */
      var mapSec = createEl('section', 'esc-sonnet-map');
      mapSec.appendChild(createEl('h3', '', 'Mapa dos 14 versos'));
      var lettersFlat = settings.scheme === 'Livre' ? '' : String(settings.scheme || '').replace(/\s+/g, '');
      var offset = 0, si2, vi;
      for (si2 = 0; si2 < stanzaPlan.length; si2 += 1) {
        /* Indicador clássico da Volta (9º verso italiano / 13º inglês) */
        if ((settings.structure === 'italian' && offset === 8) || (settings.structure === 'english' && offset === 12)) {
          var volta = createEl('div', 'esc-sonnet-volta');
          volta.appendChild(createEl('span', '', settings.structure === 'english' ? '✦ DÍSTICO FINAL (v. 13–14)' : '✦ VOLTA · virada (v. 9)'));
          mapSec.appendChild(volta);
        }
        var size = stanzaPlan[si2];
        var stLabel = size === 4 ? ('Quarteto ' + (si2 + 1)) : size === 3 ? ('Terceto ' + (si2 - 1)) : 'Dístico';
        var stBox = createEl('div', 'esc-sonnet-stanza-list');
        stBox.appendChild(createEl('small', 'esc-sonnet-stanza-lbl', stLabel));

        for (vi = 0; vi < size; vi += 1) {
          (function (vRow, num) {
            var expLetter = lettersFlat && num <= lettersFlat.length ? lettersFlat.charAt(num - 1) : '';
            var fam = RHYME_PALETTE[expLetter] || 'a';
            var isCur = !!(row && vRow && row.lineIndex === vRow.lineIndex);
            var mBadge = measureBadgeText(vRow, settings.target);
            var rowBtn = createEl('button', 'esc-map-row' + (isCur ? ' is-current' : '') + (!vRow || vRow.placeholder ? ' is-empty' : ''));
            rowBtn.type = 'button';
            rowBtn.setAttribute('aria-pressed', isCur ? 'true' : 'false');

            rowBtn.appendChild(createEl('span', 'esc-map-num', (num < 10 ? '0' : '') + num));
            if (expLetter) {
              var sym = !vRow || vRow.placeholder ? '○' : (vRow.rhymeState === 'consonant' ? '●' : vRow.rhymeState === 'assonant' ? '◎' : '○');
              rowBtn.appendChild(createEl('span', 'esc-rhyme-pill is-fam-' + fam, expLetter + sym));
            }
            var barWrap = createEl('span', 'esc-map-bar');
            var barFill = createEl('span', 'esc-map-bar-fill is-' + mBadge.tone);
            var pct = mBadge.count ? Math.min(100, Math.round((mBadge.count / settings.target) * 100)) : 0;
            if (barFill.style) { barFill.style.width = pct + '%'; }
            barWrap.appendChild(barFill);
            rowBtn.appendChild(barWrap);

            rowBtn.appendChild(createEl('span', 'esc-map-count is-' + mBadge.tone, mBadge.count ? String(mBadge.count) : '—'));
            rowBtn.appendChild(createEl('span', 'esc-map-word', vRow && !vRow.placeholder ? (vRow.lastWord || '…') : ''));

            on(rowBtn, 'click', function () {
              if (vRow) {
                manualLine = vRow.lineIndex;
                rhymeQuery = '';
                showMoreRhymes = false;
                if (vc && manuscript) { vc.jumpToLine(manuscript, vRow.lineIndex); }
                render();
              }
            });
            stBox.appendChild(rowBtn);
          }(res.rows[offset + vi], offset + vi + 1));
        }
        offset += size;
        mapSec.appendChild(stBox);
      }
      body.appendChild(mapSec);

      /* 5. BANDEJA DE RIMAS AO VIVO (Consoantes + Toantes, alvo inteligente no verso-par) */
      var rSec = createEl('section', 'esc-sonnet-rhyme-tray');
      var targetWord = rhymeQuery || res.suggestionWord;
      var rHead = createEl('div', 'esc-rhyme-tray-head');
      rHead.appendChild(createEl('h3', '', targetWord ? ('Rimas p/ “' + targetWord + '”') : 'Rimas ao vivo'));
      var rTabs = createEl('div', 'esc-rhyme-tabs');
      [['consonant', 'Consoantes'], ['assonant', 'Toantes']].forEach(function (pair) {
        var tb = createEl('button', 'esc-rhyme-tab', pair[1]);
        tb.type = 'button';
        tb.setAttribute('aria-pressed', rhymeTab === pair[0] ? 'true' : 'false');
        on(tb, 'click', function () { rhymeTab = pair[0]; showMoreRhymes = false; render(); });
        rTabs.appendChild(tb);
      });
      rHead.appendChild(rTabs);
      rSec.appendChild(rHead);

      if (targetWord) {
        var rhymeData = vc ? vc.findRhymes(targetWord, 30) : { consonant: findRhymesFor(targetWord), assonant: [] };
        var list = rhymeTab === 'assonant' ? rhymeData.assonant : rhymeData.consonant;
        var shown = list.slice(0, showMoreRhymes ? 24 : 10);
        if (shown.length) {
          var chips = createEl('div', 'esc-rhyme-chips');
          shown.forEach(function (w) {
            var ch = createEl('button', 'esc-rhyme-chip', w);
            ch.type = 'button';
            ch.title = 'Inserir “' + w + '” no fim do verso';
            on(ch, 'click', function () {
              if (vc && manuscript && row) {
                vc.insertWordAtLineEnd(manuscript, row.lineIndex, w);
              }
            });
            chips.appendChild(ch);
          });
          rSec.appendChild(chips);
          if (list.length > 10) {
            var moreBtn = createEl('button', 'esc-sonnet-quiet', showMoreRhymes ? 'Ver menos' : ('Ver mais (' + list.length + ')'));
            moreBtn.type = 'button';
            on(moreBtn, 'click', function () { showMoreRhymes = !showMoreRhymes; render(); });
            rSec.appendChild(moreBtn);
          }
        } else {
          rSec.appendChild(createEl('p', 'esc-sonnet-caption', 'Sem sugestões ' + (rhymeTab === 'assonant' ? 'toantes' : 'consoantes') + ' para “' + targetWord + '”.'));
        }
      } else {
        rSec.appendChild(createEl('p', 'esc-sonnet-caption', 'Digite um verso ou busque uma palavra abaixo.'));
      }

      var qWrap = createEl('div', 'esc-sonnet-search');
      var qInput = createEl('input');
      qInput.type = 'search';
      qInput.maxLength = 60;
      qInput.placeholder = 'Buscar rimas de outra palavra (ex.: amor)…';
      qInput.value = rhymeQuery;
      on(qInput, 'change', function () { rhymeQuery = qInput.value.replace(/^\s+|\s+$/g, ''); showMoreRhymes = false; render(); });
      qWrap.appendChild(qInput);
      rSec.appendChild(qWrap);
      body.appendChild(rSec);

      aside.appendChild(body);
      container.appendChild(aside);
    }

    function schedule(delay) {
      if (composing) { return; }
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(render, typeof delay === 'number' ? delay : 75);
    }

    if (manuscript) {
      on(manuscript, 'compositionstart', function () { composing = true; });
      on(manuscript, 'compositionend', function () { composing = false; manualLine = null; schedule(40); });
      on(manuscript, 'input', function () { if (isSonnetDoc(activeDoc)) { manualLine = null; schedule(75); } });
      on(manuscript, 'keyup', function () {
        if (!isSonnetDoc(activeDoc)) { return; }
        var cur = cursorLineOf(manuscript);
        if (cur !== lastCursorLine) { manualLine = null; schedule(60); }
      });
      on(manuscript, 'mouseup', function () {
        if (!isSonnetDoc(activeDoc)) { return; }
        var cur = cursorLineOf(manuscript);
        if (cur !== lastCursorLine) { manualLine = null; schedule(50); }
      });
    }

    if (typeof window !== 'undefined' && window.visualViewport && window.visualViewport.addEventListener) {
      window.visualViewport.addEventListener('resize', function () {
        if (mobileSheetOpen && window.visualViewport.height < 480 && document.activeElement === manuscript) {
          mobileSheetOpen = false;
          syncBodyFlag(true);
          render();
        }
      }, false);
    }

    return {
      sync: function (doc) {
        activeDoc = doc || null;
        manualLine = null;
        lastCursorLine = -1;
        rhymeQuery = '';
        showMoreRhymes = false;
        draftError = '';
        mobileSheetOpen = false;
        render();
      },
      refresh: render,
      schedule: function () { if (isSonnetDoc(activeDoc)) { schedule(75); } },
      isSonnetDoc: isSonnetDoc
    };
  };
}(typeof window !== 'undefined' ? window : this));
