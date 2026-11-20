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
    'Experimente uma mudança de perspectiva.',
    'O que essa mudança permite perceber?',
    'Leve a imagem um pouco além.',
    'Aproxime o poema do seu desfecho.',
    'O que ainda precisa ressoar?',
    'Encontre o último verso.'
  ];

  var rhymeIndex = null;

  function buildRhymeIndex() {
    if (rhymeIndex) { return rhymeIndex; }
    rhymeIndex = {};
    var lex = root.Escr.portiLexicon;
    var poetry = root.Escr.poetry;
    if (!lex || !lex.entries || !poetry) { return rhymeIndex; }
    var keys = Object.keys(lex.entries);
    var i, w, r, key;
    for (i = 0; i < keys.length; i += 1) {
      w = keys[i];
      if (w.length < 2 || w.length > 24) { continue; }
      r = poetry.wordReading(w);
      if (!r || !r.rhyme) { continue; }
      key = '$' + r.rhyme;
      if (!rhymeIndex[key]) { rhymeIndex[key] = []; }
      rhymeIndex[key].push(w);
    }
    return rhymeIndex;
  }

  function findRhymesFor(word) {
    var poetry = root.Escr.poetry;
    if (!poetry || !word) { return []; }
    var clean = String(word).replace(/^[^a-záàâãéêíóôõúüç]+|[^a-záàâãéêíóôõúüç]+$/gi, '').toLowerCase();
    if (!clean) { return []; }
    var r = poetry.wordReading(clean);
    if (!r || !r.rhyme) { return []; }
    var idx = buildRhymeIndex();
    var list = idx['$' + r.rhyme] || [];
    var out = [], i;
    for (i = 0; i < list.length && out.length < 30; i += 1) {
      if (list[i] !== clean) { out.push(list[i]); }
    }
    return out;
  }

  function structureOf(scheme) {
    if (scheme === 'Livre') { return 'italian'; }
    var clean = String(scheme || '').replace(/\s+/g, '');
    if (clean.indexOf('GG') === 12 || clean.indexOf('EE') === 12 || clean.slice(8, 12) === 'EFEF' || clean.slice(8, 12) === 'CDCD') {
      if (clean.slice(0, 12) === 'ABABCDCD' + 'EFEF' || clean.slice(0, 12) === 'ABABBCBC' + 'CDCD') {
        return 'english';
      }
    }
    if (clean === 'ABABCDCD' + 'EFEFGG' || clean === 'ABABBCBC' + 'CDCDEE') { return 'english'; }
    return 'italian';
  }

  function defaultSettings() {
    return { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'none' };
  }

  function normalizeSettings(raw) {
    var base = defaultSettings();
    if (!raw || typeof raw !== 'object') { return base; }
    if (raw.structure === 'italian' || raw.structure === 'english') { base.structure = raw.structure; }
    if (typeof raw.scheme === 'string' && raw.scheme) { base.scheme = raw.scheme; }
    if (typeof raw.target === 'number' && raw.target >= 2 && raw.target <= 20) { base.target = raw.target; }
    if (typeof raw.rhythm === 'string' && Object.prototype.hasOwnProperty.call(RHYTHMS, raw.rhythm)) { base.rhythm = raw.rhythm; }
    return base;
  }

  function analyzeText(text, activeLineIdx, settings) {
    var poetry = root.Escr.poetry;
    var linesRaw = String(text || '').split(/\r?\n/);
    var rows = [];
    var stanzas = [];
    var currentStanza = 0;
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
      var scan = !isPlaceholder && poetry ? poetry.scan(trimmed) : null;
      rows.push({
        number: count,
        lineIndex: i,
        text: trimmed,
        placeholder: isPlaceholder,
        reading: scan,
        lastWord: scan && scan.words.length ? scan.words[scan.words.length - 1].word : ''
      });
    }
    if (currentStanza > 0) { stanzas.push(currentStanza); }

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
    var letters = String(settings.scheme || '').replace(/\s+/g, '');
    if (current && settings.scheme !== 'Livre' && current.number <= letters.length) {
      var myLetter = letters.charAt(current.number - 1);
      for (i = 0; i < rows.length; i += 1) {
        if (rows[i].number === current.number) { break; }
        if (rows[i].number <= letters.length && letters.charAt(rows[i].number - 1) === myLetter && !rows[i].placeholder) {
          rhymeReference = {
            number: rows[i].number,
            word: rows[i].lastWord,
            possible: !!(current.reading && rows[i].reading && current.reading.rhyme === rows[i].reading.rhyme)
          };
          break;
        }
      }
    }

    var refWord = current && current.lastWord ? current.lastWord : '';
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
    var manualLine = null;
    var rhymeQuery = '';
    var showMoreRhymes = false;
    var draftScheme = '';
    var draftError = '';
    var renderTimer = null;

    function measureStr(reading) {
      return reading.min === reading.max ? String(reading.max) : reading.min + '–' + reading.max;
    }

    function saveSettings(next) {
      if (!activeDoc) { return; }
      activeDoc.sonnetSettings = next;
      if (opts.onSaveSettings) { opts.onSaveSettings(next); }
      render();
    }

    function chooseSetting(key, val) {
      var cur = normalizeSettings(activeDoc && activeDoc.sonnetSettings);
      var next = { structure: cur.structure, scheme: cur.scheme, target: cur.target, rhythm: cur.rhythm };
      next[key] = val;
      if (key === 'structure' && next.scheme !== 'Livre' && structureOf(next.scheme) !== val) {
        next.scheme = val === 'english' ? 'ABAB CDCD EFEF GG' : SCHEMES[0];
      }
      if (key === 'scheme' && val !== 'Livre') { next.structure = structureOf(val); }
      if (key === 'rhythm' && val !== 'none') { next.target = val === 'alexandrine' ? 12 : 10; }
      if (key === 'target') { next.rhythm = 'none'; }
      draftError = '';
      saveSettings(next);
    }

    function render() {
      if (!container) { return; }
      var hintEl = byId('esc-sonnet-editor-hint');
      if (!isSonnetDoc(activeDoc)) {
        container.hidden = true;
        if (hintEl) { hintEl.hidden = true; }
        container.textContent = '';
        return;
      }
      container.hidden = false;
      if (hintEl) {
        var rawTxt = manuscript ? String(manuscript.value || '').replace(/^\s+|\s+$/g, '') : '';
        var hasRealVerse = rawTxt.length > 0 && rawTxt.indexOf('«') !== 0;
        hintEl.hidden = hasRealVerse;
      }
      var settings = normalizeSettings(activeDoc.sonnetSettings);
      var lineIdx = manualLine !== null ? manualLine : cursorLineOf(manuscript);
      var res = analyzeText(manuscript ? manuscript.value : activeDoc.text, lineIdx, settings);
      var row = res.current;
      var r = row ? row.reading : null;
      var stanzaPlan = settings.structure === 'english' ? [4, 4, 4, 2] : [4, 4, 3, 3];

      container.textContent = '';
      var aside = createEl('aside', 'esc-sonnet');
      aside.setAttribute('aria-label', 'Assistente do soneto');

      var top = createEl('header', 'esc-sonnet-top');
      var headLeft = createEl('div');
      headLeft.appendChild(createEl('strong', '', 'Seu soneto'));
      headLeft.appendChild(createEl('span', 'esc-sonnet-progress', res.written + ' de 14 versos'));
      top.appendChild(headLeft);

      var toggleBtn = createEl('button', 'esc-sonnet-quiet', collapsed ? 'Mostrar' : 'Recolher');
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      on(toggleBtn, 'click', function () { collapsed = !collapsed; render(); });
      top.appendChild(toggleBtn);
      aside.appendChild(top);

      if (collapsed) {
        container.appendChild(aside);
        return;
      }

      var body = createEl('div', 'esc-sonnet-body');
      body.appendChild(createEl('p', 'esc-sonnet-intro', 'Escreva um verso por linha. Acompanhe aqui a medida e as rimas.'));

      // Acompanhamento do verso
      var curSec = createEl('section', 'esc-sonnet-current');
      var curTitle = createEl('div', 'esc-sonnet-current-title');
      curTitle.appendChild(createEl('strong', '', row ? 'Verso ' + row.number : 'Escolha um verso'));
      curTitle.appendChild(createEl('small', '', manualLine !== null ? 'Em consulta' : 'Verso do cursor'));
      curSec.appendChild(curTitle);

      if (manualLine !== null) {
        var resumeBtn = createEl('button', 'esc-sonnet-quiet', 'Acompanhar o cursor');
        resumeBtn.type = 'button';
        on(resumeBtn, 'click', function () { manualLine = null; rhymeQuery = ''; showMoreRhymes = false; render(); });
        curSec.appendChild(resumeBtn);
      }

      if (row) {
        if (row.placeholder) {
          curSec.appendChild(createEl('p', 'esc-sonnet-prompt', res.written === 0 ? 'Comece com uma imagem ou pergunta.' : (GUIDANCE[row.number - 1] || 'Continue seu poema.')));
        } else {
          curSec.appendChild(createEl('p', 'esc-sonnet-excerpt', row.text));
          if (r) {
            var measureBox = createEl('div', 'esc-sonnet-measure');
            measureBox.appendChild(createEl('span', 'esc-sonnet-caption', 'Contagem estimada'));
            var big = createEl('strong', '', measureStr(r) + ' ');
            big.appendChild(createEl('small', '', 'sílabas poéticas'));
            measureBox.appendChild(big);
            measureBox.appendChild(createEl('p', '', 'Referência escolhida: ' + settings.target + ' sílabas.'));
            if (settings.rhythm !== 'none') {
              measureBox.appendChild(createEl('p', '', RHYTHMS[settings.rhythm]));
            }
            curSec.appendChild(measureBox);

            var scansion = createEl('section', 'esc-sonnet-scansion');
            scansion.appendChild(createEl('h3', '', 'Sílabas e tônicas'));
            var sylP = createEl('p', 'esc-sonnet-syllables');
            r.words.forEach(function (word, wi) {
              if (wi > 0) { sylP.appendChild(document.createTextNode(' / ')); }
              var wSpan = createEl('span', 'esc-sonnet-word');
              word.syllables.forEach(function (syl, si) {
                if (si > 0) { wSpan.appendChild(document.createTextNode('·')); }
                if (wi === r.words.length - 1 && si > word.tonic) {
                  wSpan.appendChild(createEl('span', 'esc-sonnet-after-tonic', '(' + syl + ')'));
                } else if (si === word.tonic) {
                  wSpan.appendChild(createEl('strong', '', syl));
                } else {
                  wSpan.appendChild(document.createTextNode(syl));
                }
              });
              sylP.appendChild(wSpan);
            });
            scansion.appendChild(sylP);
            scansion.appendChild(createEl('p', 'esc-sonnet-caption', 'Tônicas em negrito; finais após a última tônica ficam fora da métrica.'));
            curSec.appendChild(scansion);
          } else {
            curSec.appendChild(createEl('p', '', 'Leia este verso em voz alta para conferir a medida.'));
          }
        }

        var rhymeSec = createEl('section', 'esc-sonnet-rhyme');
        rhymeSec.appendChild(createEl('h3', '', 'Rima deste verso'));
        var rhymeMsg = settings.scheme === 'Livre'
          ? 'Rimas livres escolhidas.'
          : res.rhymeReference
            ? 'Neste esquema, o verso ' + row.number + ' rima com o verso ' + res.rhymeReference.number + ' (“' + res.rhymeReference.word + '”).'
            : 'Este verso inicia um grupo de rimas.';
        rhymeSec.appendChild(createEl('p', '', rhymeMsg));
        if (res.rhymeReference && r) {
          rhymeSec.appendChild(createEl('p', 'esc-sonnet-caption', res.rhymeReference.possible ? 'Terminação compatível encontrada.' : 'Confira a sonoridade destes finais em voz alta.'));
        }
        curSec.appendChild(rhymeSec);
      }
      body.appendChild(curSec);

      // Mapa do poema
      var mapSec = createEl('section', 'esc-sonnet-map');
      mapSec.appendChild(createEl('h3', '', 'Mapa do poema'));
      mapSec.appendChild(createEl('p', 'esc-sonnet-caption', 'Forma · ' + stanzaPlan.join(' / ') + ' versos.'));
      var stanzasGrid = createEl('div', 'esc-sonnet-stanzas');
      var offset = 0, si2, vi;
      for (si2 = 0; si2 < stanzaPlan.length; si2 += 1) {
        var size = stanzaPlan[si2];
        var stBox = createEl('div', 'esc-sonnet-stanza');
        stBox.appendChild(createEl('small', '', 'Estrofe ' + (si2 + 1)));
        var slots = createEl('div', 'esc-sonnet-slots');
        for (vi = 0; vi < size; vi += 1) {
          (function (vRow, num) {
            if (vRow && !vRow.placeholder) {
              var slotBtn = createEl('button', '', String(num));
              slotBtn.type = 'button';
              slotBtn.setAttribute('aria-pressed', row && row.lineIndex === vRow.lineIndex ? 'true' : 'false');
              on(slotBtn, 'click', function () { manualLine = vRow.lineIndex; rhymeQuery = ''; showMoreRhymes = false; render(); });
              slots.appendChild(slotBtn);
            } else {
              slots.appendChild(createEl('span', 'esc-sonnet-empty-slot', String(num)));
            }
          }(res.rows[offset + vi], offset + vi + 1));
        }
        offset += size;
        stBox.appendChild(slots);
        stanzasGrid.appendChild(stBox);
      }
      mapSec.appendChild(stanzasGrid);
      body.appendChild(mapSec);

      // Explorar rimas
      var sugDet = createEl('details', 'esc-sonnet-suggestions');
      var sugSum = createEl('summary', '', 'Explorar rimas');
      sugDet.appendChild(sugSum);
      var targetWord = rhymeQuery || res.suggestionWord;
      if (targetWord) {
        var hits = findRhymesFor(targetWord);
        sugDet.appendChild(createEl('small', '', 'Próximos de “' + targetWord + '” (PortiLexicon)'));
        var shown = hits.slice(0, showMoreRhymes ? 24 : 6);
        sugDet.appendChild(createEl('p', '', shown.length ? shown.join(' · ') : 'Sem sugestões para esta palavra.'));
        if (hits.length > 6) {
          var moreBtn = createEl('button', 'esc-sonnet-quiet', showMoreRhymes ? 'Ver menos' : 'Mais finais');
          moreBtn.type = 'button';
          on(moreBtn, 'click', function () { showMoreRhymes = !showMoreRhymes; render(); });
          sugDet.appendChild(moreBtn);
        }
      }
      var qWrap = createEl('div', 'esc-sonnet-search');
      var qLabel = createEl('label', '', 'Outra palavra de referência');
      var qInput = createEl('input');
      qInput.type = 'text';
      qInput.maxLength = 60;
      qInput.placeholder = 'Ex.: amor';
      qInput.value = rhymeQuery;
      on(qInput, 'change', function () { rhymeQuery = qInput.value.trim(); showMoreRhymes = false; render(); });
      qLabel.appendChild(qInput);
      qWrap.appendChild(qLabel);
      sugDet.appendChild(qWrap);
      body.appendChild(sugDet);

      // Forma do soneto
      var formDet = createEl('details', 'esc-sonnet-settings');
      formDet.appendChild(createEl('summary', '', 'Forma do soneto'));
      var controls = createEl('div', 'esc-sonnet-controls');

      var lStruct = createEl('label', '', 'Estrutura');
      var sStruct = createEl('select');
      [['italian', 'Italiano · 4 / 4 / 3 / 3'], ['english', 'Inglês · 4 / 4 / 4 / 2']].forEach(function (pair) {
        var o = createEl('option', '', pair[1]);
        o.value = pair[0];
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
      optsList.filter(function (sc) { return sc === 'Livre' || structureOf(sc) === settings.structure; }).forEach(function (sc) {
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
      [[10, 'Decassílabo · 10'], [12, 'Dodecassílabo · 12'], [7, 'Redondilha maior · 7'], [5, 'Redondilha menor · 5']].forEach(function (pair) {
        var o = createEl('option', '', pair[1]);
        o.value = String(pair[0]);
        if (settings.target === pair[0]) { o.selected = true; }
        sTarget.appendChild(o);
      });
      on(sTarget, 'change', function () { chooseSetting('target', Number(sTarget.value)); });
      lTarget.appendChild(sTarget);
      controls.appendChild(lTarget);

      var lRhythm = createEl('label', '', 'Ritmo');
      var sRhythm = createEl('select');
      Object.keys(RHYTHMS).forEach(function (k) {
        var o = createEl('option', '', RHYTHMS[k]);
        o.value = k;
        if (settings.rhythm === k) { o.selected = true; }
        sRhythm.appendChild(o);
      });
      on(sRhythm, 'change', function () { chooseSetting('rhythm', sRhythm.value); });
      lRhythm.appendChild(sRhythm);
      controls.appendChild(lRhythm);

      var customWrap = createEl('div', 'esc-sonnet-custom');
      var cLabel = createEl('label', '', 'Personalizar rimas (14 letras A–N)');
      var cInput = createEl('input');
      cInput.type = 'text';
      cInput.maxLength = 30;
      cInput.value = draftScheme;
      cInput.placeholder = settings.structure === 'english' ? 'ABAB BCBC CDCD EE' : 'AABB AABB CDC DCD';
      on(cInput, 'input', function () { draftScheme = cInput.value; draftError = ''; });
      cLabel.appendChild(cInput);
      customWrap.appendChild(cLabel);
      var cBtn = createEl('button', '', 'Aplicar');
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
      if (draftError) { customWrap.appendChild(createEl('p', '', draftError)); }
      controls.appendChild(customWrap);

      formDet.appendChild(controls);
      body.appendChild(formDet);

      aside.appendChild(body);
      container.appendChild(aside);
    }

    function schedule() {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(render, 120);
    }

    if (manuscript) {
      on(manuscript, 'input', function () { manualLine = null; schedule(); });
      on(manuscript, 'keyup', function () { if (isSonnetDoc(activeDoc)) { manualLine = null; schedule(); } });
      on(manuscript, 'mouseup', function () { if (isSonnetDoc(activeDoc)) { manualLine = null; schedule(); } });
    }

    return {
      sync: function (doc) {
        activeDoc = doc || null;
        manualLine = null;
        rhymeQuery = '';
        showMoreRhymes = false;
        draftError = '';
        render();
      },
      refresh: render,
      isSonnetDoc: isSonnetDoc
    };
  };
}(typeof window !== 'undefined' ? window : this));
