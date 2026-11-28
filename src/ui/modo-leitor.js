(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PREFS_KEY = 'escrevaral.reader.prefs.v1';

  function isPortableDoc() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        var meta = document.querySelector('meta[name="distribution-mode"]');
        if (meta && meta.getAttribute('content') === 'portable') { return true; }
      }
    } catch (ignore) {}
    return false;
  }

  function resolveAssetUrl(path) {
    try {
      if (typeof URL === 'function' && typeof location !== 'undefined' && location && location.href) {
        return new URL(path, location.href).href;
      }
    } catch (ignore) {}
    return path;
  }

  function cssAsset(path) {
    return ['u', 'rl("', resolveAssetUrl(path), '")'].join('');
  }

  var HERO_ART_LER = 'assets/library/reader-atelier.webp';
  var HERO_ART_ENSAIO = 'assets/library/reader-readthru.webp';

  function bindReaderAtmosphere() {
    try {
      if (isPortableDoc()) { return; }
      if (typeof document === 'undefined' || !document.documentElement || !document.documentElement.style) { return; }
      var st = document.documentElement.style;
      st.setProperty('--esc-reader-atelier-art', cssAsset(HERO_ART_LER));
      st.setProperty('--esc-reader-readthru-art', cssAsset(HERO_ART_ENSAIO));
    } catch (ignore) {}
  }
  bindReaderAtmosphere();

  function clamp(val, min, max, fallback) {
    var n = Number(val);
    if (!isFinite(n)) { return fallback; }
    return Math.max(min, Math.min(max, n));
  }

  function normalizePrefs(raw) {
    var p = raw && typeof raw === 'object' ? raw : {};
    var okPalette = p.palette === 'white' || p.palette === 'night' || p.palette === 'linen' || p.palette === 'mist' || p.palette === 'sage' || p.palette === 'cotton';
    return {
      palette: okPalette ? p.palette : 'paper',
      face: p.face === 'sans' ? 'sans' : 'serif',
      size: clamp(p.size, 17, 32, 21),
      leading: clamp(p.leading, 1.5, 2.0, 1.82),
      width: clamp(p.width, 50, 74, 62),
      breakMin: p.breakMin === 15 || p.breakMin === 25 || p.breakMin === 45 ? p.breakMin : 0,
      showScene: p.showScene !== false
    };
  }

  function isScriptHeading(line) {
    return /^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|CENA\s+\d|ATO\s+[IVX\d])/i.test(line);
  }

  function isCharacterCue(line) {
    if (!line || line.length < 2 || line.length > 38) { return false; }
    if (isScriptHeading(line)) { return false; }
    if (/^[—–\-•*]/.test(line)) { return false; }
    if (/[.!?;:]$/.test(line) && !/\((V\.O\.|O\.S\.|CONT\.|OFF)\)$/i.test(line)) { return false; }
    var base = line.replace(/\s*\([^)]*\)\s*$/g, '').replace(/^\s+|\s+$/g, '');
    if (base.length < 2 || !/[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(base)) { return false; }
    if (/[a-záàâãéêíóôõúç]/.test(base)) { return false; }
    return base.split(/\s+/).length <= 4;
  }

  function normalizeSpeaker(line) {
    return String(line || '').replace(/\s*\([^)]*\)\s*$/g, '').replace(/^\s+|\s+$/g, '');
  }

  function parseReadThru(rawText) {
    var text = String(rawText || '').replace(/\r\n?/g, '\n');
    var lines = text.split('\n');
    var blocks = [];
    var charSet = {};
    var characters = [];
    var steps = [];
    var cueCount = 0;
    var headingCount = 0;
    var i, trimmed, nextTrimmed;

    for (i = 0; i < lines.length; i += 1) {
      trimmed = lines[i].replace(/^\s+|\s+$/g, '');
      if (!trimmed) { continue; }
      if (isScriptHeading(trimmed)) { headingCount += 1; continue; }
      nextTrimmed = (lines[i + 1] || '').replace(/^\s+|\s+$/g, '');
      if (isCharacterCue(trimmed) && nextTrimmed && !isScriptHeading(nextTrimmed)) {
        cueCount += 1;
      }
    }

    var isScript = headingCount >= 1 || cueCount >= 2;
    if (isScript) {
      var curSpeaker = '';
      for (i = 0; i < lines.length; i += 1) {
        trimmed = lines[i].replace(/^\s+|\s+$/g, '');
        if (!trimmed) { curSpeaker = ''; continue; }
        if (isScriptHeading(trimmed)) {
          curSpeaker = '';
          blocks.push({ kind: 'heading', text: trimmed, speaker: '', stepIndex: -1 });
        } else if (!curSpeaker && isCharacterCue(trimmed) && (lines[i + 1] || '').replace(/^\s+|\s+$/g, '')) {
          curSpeaker = normalizeSpeaker(trimmed);
          if (curSpeaker && !charSet['$' + curSpeaker]) {
            charSet['$' + curSpeaker] = true;
            characters.push(curSpeaker);
          }
          blocks.push({ kind: 'character', text: trimmed, speaker: curSpeaker, stepIndex: -1 });
        } else if (curSpeaker && /^\([^)]+\)$/.test(trimmed)) {
          blocks.push({ kind: 'parenthetical', text: trimmed, speaker: curSpeaker, stepIndex: -1 });
        } else if (curSpeaker) {
          var stepIdx = steps.length;
          blocks.push({ kind: 'dialogue', text: trimmed, speaker: curSpeaker, stepIndex: stepIdx });
          steps.push(blocks.length - 1);
        } else {
          blocks.push({ kind: 'action', text: trimmed, speaker: '', stepIndex: -1 });
        }
      }
      if (!steps.length) { isScript = false; blocks = []; }
    }

    if (!isScript) {
      var dialogueCount = 0;
      for (i = 0; i < lines.length; i += 1) {
        trimmed = lines[i].replace(/^\s+|\s+$/g, '');
        if (!trimmed) { continue; }
        var isDial = /^[—–\-]\s*\S/.test(trimmed);
        if (isDial) { dialogueCount += 1; }
        var sIdx = steps.length;
        blocks.push({ kind: isDial ? 'prose-dialogue' : 'prose-line', text: trimmed, speaker: isDial ? 'DIÁLOGO' : '', stepIndex: sIdx });
        steps.push(blocks.length - 1);
      }
      return { isScript: false, hasDialogues: dialogueCount > 0, characters: [], blocks: blocks, steps: steps };
    }

    return { isScript: true, hasDialogues: true, characters: characters, blocks: blocks, steps: steps };
  }

  function scrollProgress(scrollTop, scrollHeight, clientHeight) {
    var maxScroll = Math.max(0, (Number(scrollHeight) || 0) - (Number(clientHeight) || 0));
    if (maxScroll <= 0) { return 100; }
    return Math.max(0, Math.min(100, Math.round(((Number(scrollTop) || 0) / maxScroll) * 100)));
  }

  function formatEditionDate() {
    try {
      var d = new Date();
      var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
    } catch (e) { return ''; }
  }

  function readingMinutes(text) {
    var words = root.Escr.countManuscript ? root.Escr.countManuscript(text || '').words : 0;
    return { words: words, minutes: words ? Math.max(1, Math.round(words / 200)) : 0 };
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  root.Escr.readerCore = {
    normalizePrefs: normalizePrefs,
    readingMinutes: readingMinutes,
    scrollProgress: scrollProgress,
    parseReadThru: parseReadThru
  };

  root.Escr.mountReaderMode = function (opts) {
    var storage = opts.storage;
    var overlayEl = null;
    var prefs = normalizePrefs(null);
    var breakTimer = null;
    var settingsOpen = false;
    var previousFocus = null;
    var currentDoc = null;
    var activeMode = 'ler';
    var parsedReadThru = null;
    var selectedSpeaker = '';
    var onlyDialogues = false;
    var activeStep = 0;
    var reviewMarks = [];
    var popReqToken = 0;
    var popWord = '';
    var popMarkEl = null;
    var lexService = null;

    function getLexService() {
      if (lexService) { return lexService; }
      if (root.Escr.getLexicoP01) { lexService = root.Escr.getLexicoP01(); }
      else if (root.Escr.createLexicoP01) { lexService = root.Escr.createLexicoP01(); }
      return lexService;
    }

    try {
      if (storage) {
        prefs = normalizePrefs(JSON.parse(storage.getItem(PREFS_KEY) || 'null'));
      }
    } catch (ignore) {}

    function hasSavedPalette() {
      try {
        if (!storage) { return false; }
        var raw = JSON.parse(storage.getItem(PREFS_KEY) || 'null');
        return !!(raw && typeof raw.palette === 'string');
      } catch (ignore) { return false; }
    }

    function savePrefs() {
      try {
        if (storage) { storage.setItem(PREFS_KEY, JSON.stringify(prefs)); }
      } catch (ignore) {}
    }

    function applyPrefs(paletteOverride) {
      if (!overlayEl) { return; }
      overlayEl.setAttribute('data-palette', paletteOverride || prefs.palette);
      overlayEl.setAttribute('data-face', prefs.face);
      overlayEl.setAttribute('data-reader-mode', activeMode);
      overlayEl.setAttribute('data-show-scene', prefs.showScene ? 'true' : 'false');
      if (overlayEl.style && overlayEl.style.setProperty) {
        overlayEl.style.setProperty('--reader-size', prefs.size + 'px');
        overlayEl.style.setProperty('--reader-leading', String(prefs.leading));
        overlayEl.style.setProperty('--reader-width', prefs.width + 'ch');
      }
    }

    function stopBreakTimer() {
      window.clearTimeout(breakTimer);
      breakTimer = null;
    }

    function scheduleBreak() {
      stopBreakTimer();
      var pauseEl = byId('esc-reader-pause');
      var bodyEl = byId('esc-reader-page');
      if (pauseEl) { pauseEl.hidden = true; }
      if (bodyEl) { bodyEl.hidden = false; }
      if (!prefs.breakMin || !overlayEl || overlayEl.hidden) { return; }
      breakTimer = window.setTimeout(function () {
        if (!overlayEl || overlayEl.hidden) { return; }
        if (pauseEl && bodyEl) {
          bodyEl.hidden = true;
          pauseEl.hidden = false;
        }
      }, prefs.breakMin * 60000);
    }

    function cleanWordToken(raw) {
      var s = String(raw || '').replace(/^[^A-Za-zÀ-ÖØ-öø-ÿ]+|[^A-Za-zÀ-ÖØ-öø-ÿ]+$/g, '');
      if (!s || s.length > 48) { return ''; }
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(s)) { return ''; }
      return s;
    }

    function unwrapTempMark(mark) {
      if (!mark || !mark.parentNode) { return; }
      if (mark.getAttribute && mark.getAttribute('data-review-marked') === 'true') {
        mark.className = 'esc-reader-review-mark';
        return;
      }
      var parent = mark.parentNode;
      var txt = document.createTextNode(mark.textContent || '');
      parent.replaceChild(txt, mark);
      if (parent.normalize) { try { parent.normalize(); } catch (ignore) {} }
    }

    function closePopover() {
      popReqToken += 1;
      var pop = byId('esc-reader-popover');
      if (pop) {
        pop.hidden = true;
        pop.textContent = '';
      }
      if (popMarkEl) {
        unwrapTempMark(popMarkEl);
        popMarkEl = null;
      }
      popWord = '';
    }

    function updateReviewPill() {
      var pill = byId('esc-reader-marks-pill');
      if (!pill) { return; }
      if (!reviewMarks.length) {
        pill.hidden = true;
        pill.textContent = '';
      } else {
        pill.hidden = false;
        pill.textContent = reviewMarks.length + (reviewMarks.length === 1 ? ' marcada' : ' marcadas');
      }
    }

    function positionPopover(pop, anchorEl) {
      if (!pop || !pop.style) { return; }
      var vw = window.innerWidth || 800;
      var vh = window.innerHeight || 600;
      if (vw <= 680 || !anchorEl || !anchorEl.getBoundingClientRect) {
        pop.setAttribute('data-pos', 'dock');
        pop.style.left = '';
        pop.style.top = '';
        return;
      }
      var r = anchorEl.getBoundingClientRect();
      var popW = Math.min(320, vw - 28);
      pop.style.width = popW + 'px';
      pop.style.visibility = 'hidden';
      pop.hidden = false;
      var popH = pop.offsetHeight || 190;
      var above = (r.top - popH - 14) >= 54;
      var top = above ? (r.top - popH - 12) : Math.min(vh - popH - 14, r.bottom + 12);
      var centerX = r.left + (r.width / 2);
      var left = Math.max(14, Math.min(vw - popW - 14, centerX - (popW / 2)));
      var arrowLeft = Math.max(18, Math.min(popW - 18, centerX - left));
      pop.setAttribute('data-pos', above ? 'above' : 'below');
      pop.style.left = Math.round(left) + 'px';
      pop.style.top = Math.round(Math.max(12, top)) + 'px';
      if (pop.style.setProperty) { pop.style.setProperty('--pop-arrow-x', Math.round(arrowLeft) + 'px'); }
      pop.style.visibility = '';
    }

    function copyTextSafe(str) {
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(str);
          return true;
        }
      } catch (ignore) {}
      try {
        var ta = document.createElement('textarea');
        ta.value = str;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (ignore2) {}
      return false;
    }

    function renderWordPopover(word, anchorEl, res, loading) {
      var pop = byId('esc-reader-popover');
      if (!pop) { return; }
      pop.textContent = '';

      var head = document.createElement('div');
      head.className = 'esc-reader-pop-head';
      var titleEl = document.createElement('strong');
      titleEl.className = 'esc-reader-pop-word';
      titleEl.textContent = word;
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-reader-pop-close';
      closeBtn.setAttribute('aria-label', 'Fechar consulta da palavra');
      closeBtn.textContent = '×';
      on(closeBtn, 'click', closePopover);
      head.appendChild(titleEl);
      head.appendChild(closeBtn);
      pop.appendChild(head);

      /* Separação silábica e tônica 100% offline (cofre poético) */
      if (root.Escr.poetry && root.Escr.poetry.wordReading) {
        try {
          var pr = root.Escr.poetry.wordReading(word);
          if (pr && pr.syllables && pr.syllables.length) {
            var prosody = document.createElement('p');
            prosody.className = 'esc-reader-pop-prosody';
            var sep = document.createElement('span');
            sep.className = 'esc-reader-pop-syls';
            for (var si = 0; si < pr.syllables.length; si += 1) {
              if (si > 0) {
                var dot = document.createElement('span');
                dot.className = 'esc-reader-pop-dot';
                dot.textContent = '·';
                sep.appendChild(dot);
              }
              var sp = document.createElement('span');
              sp.className = si === pr.tonic ? 'esc-reader-pop-tonic' : 'esc-reader-pop-syl';
              sp.textContent = pr.syllables[si];
              sep.appendChild(sp);
            }
            prosody.appendChild(sep);
            pop.appendChild(prosody);
          }
        } catch (ignore) {}
      }

      var body = document.createElement('div');
      body.className = 'esc-reader-pop-body';
      if (loading) {
        var waitP = document.createElement('p');
        waitP.className = 'esc-reader-pop-meta';
        waitP.textContent = 'Consultando dicionário local…';
        body.appendChild(waitP);
      } else if (!res || res.state !== 'found' || !res.entries || !res.entries.length) {
        var nf = document.createElement('p');
        nf.className = 'esc-reader-pop-meta';
        nf.textContent = 'Palavra fora do recorte de sinônimos; você ainda pode marcá-la para revisar.';
        body.appendChild(nf);
      } else {
        var entry = res.entries[0];
        if (entry.posLabel || entry.lemma) {
          var clsP = document.createElement('p');
          clsP.className = 'esc-reader-pop-class';
          clsP.textContent = (entry.posLabel || '') + (entry.lemma && entry.lemma !== word.toLowerCase() ? ' · lema: ' + entry.lemma : '');
          body.appendChild(clsP);
        }
        if (entry.definition) {
          var defP = document.createElement('p');
          defP.className = 'esc-reader-pop-def';
          defP.textContent = entry.definition;
          body.appendChild(defP);
        }
        if (entry.synonyms && entry.synonyms.length) {
          var synWrap = document.createElement('div');
          synWrap.className = 'esc-reader-pop-syns';
          entry.synonyms.slice(0, 3).forEach(function (syn) {
            var sb = document.createElement('button');
            sb.type = 'button';
            sb.className = 'esc-reader-pop-syn';
            sb.textContent = syn;
            sb.title = 'Copiar sinônimo';
            on(sb, 'click', function () {
              copyTextSafe(syn);
              sb.textContent = 'Copiado ✓';
              window.setTimeout(function () { if (sb) { sb.textContent = syn; } }, 900);
            });
            synWrap.appendChild(sb);
          });
          body.appendChild(synWrap);
        }
      }
      pop.appendChild(body);

      /* Barra dupla inspirada no Anexo 4: Marcar p/ revisar | Ir editar */
      var actions = document.createElement('div');
      actions.className = 'esc-reader-pop-actions';
      var isMarked = !!(anchorEl && anchorEl.getAttribute && anchorEl.getAttribute('data-review-marked') === 'true');
      var markBtn = document.createElement('button');
      markBtn.type = 'button';
      markBtn.className = 'esc-reader-pop-act esc-reader-pop-act-mark';
      markBtn.textContent = isMarked ? 'Desmarcar' : 'Marcar p/ revisar';
      on(markBtn, 'click', function () {
        if (!anchorEl) { closePopover(); return; }
        var nowMarked = anchorEl.getAttribute('data-review-marked') === 'true';
        if (nowMarked) {
          anchorEl.removeAttribute('data-review-marked');
          anchorEl.className = 'esc-reader-tap-mark';
          reviewMarks = reviewMarks.filter(function (m) { return m.el !== anchorEl; });
        } else {
          anchorEl.setAttribute('data-review-marked', 'true');
          anchorEl.className = 'esc-reader-review-mark is-active';
          reviewMarks.push({ word: word, el: anchorEl });
        }
        updateReviewPill();
        closePopover();
      });
      actions.appendChild(markBtn);

      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'esc-reader-pop-act esc-reader-pop-act-edit';
      editBtn.textContent = (opts && typeof opts.onJumpToWord === 'function') ? 'Ir editar' : 'Entendi';
      on(editBtn, 'click', function () {
        var targetWord = word;
        closePopover();
        if (opts && typeof opts.onJumpToWord === 'function') {
          close();
          opts.onJumpToWord(targetWord);
        }
      });
      actions.appendChild(editBtn);
      pop.appendChild(actions);

      pop.hidden = false;
      positionPopover(pop, anchorEl);
    }

    function openWordAtMark(word, markEl) {
      if (popMarkEl && popMarkEl !== markEl) {
        unwrapTempMark(popMarkEl);
      }
      popMarkEl = markEl;
      popWord = word;
      var svc = getLexService();
      if (!svc) {
        renderWordPopover(word, markEl, null, false);
        return;
      }
      var tok = ++popReqToken;
      renderWordPopover(word, markEl, null, true);
      svc.lookup(word, function (res) {
        if (tok !== popReqToken) { return; }
        renderWordPopover(word, markEl, res, false);
      });
    }

    function handleArticleClick(ev) {
      if (activeMode !== 'ler') { return; }
      var target = ev.target;
      if (!target) { return; }
      if (target.className && String(target.className).indexOf('esc-reader-review-mark') !== -1) {
        var existingWord = cleanWordToken(target.textContent);
        if (existingWord) {
          target.className = 'esc-reader-review-mark is-active';
          openWordAtMark(existingWord, target);
        }
        return;
      }
      var bodyRoot = overlayEl && overlayEl.querySelector ? overlayEl.querySelector('.esc-reader-body') : null;
      if (!bodyRoot || !bodyRoot.contains || !bodyRoot.contains(target)) { return; }

      var node = null, offset = 0;
      if (document.caretRangeFromPoint && typeof ev.clientX === 'number') {
        var cr = document.caretRangeFromPoint(ev.clientX, ev.clientY);
        if (cr && cr.startContainer && cr.startContainer.nodeType === 3) {
          node = cr.startContainer;
          offset = cr.startOffset;
        }
      } else if (document.caretPositionFromPoint && typeof ev.clientX === 'number') {
        var cp = document.caretPositionFromPoint(ev.clientX, ev.clientY);
        if (cp && cp.offsetNode && cp.offsetNode.nodeType === 3) {
          node = cp.offsetNode;
          offset = cp.offset;
        }
      }
      if (!node || !bodyRoot.contains(node)) { return; }
      var val = node.nodeValue || '';
      var wordChar = /[A-Za-zÀ-ÖØ-öø-ÿ'-]/;
      if (offset >= val.length && offset > 0) { offset = val.length - 1; }
      if (!wordChar.test(val.charAt(offset))) {
        if (offset > 0 && wordChar.test(val.charAt(offset - 1))) { offset -= 1; }
        else { closePopover(); return; }
      }
      var start = offset, end = offset;
      while (start > 0 && wordChar.test(val.charAt(start - 1))) { start -= 1; }
      while (end < val.length && wordChar.test(val.charAt(end))) { end += 1; }
      var rawWord = val.slice(start, end);
      var clean = cleanWordToken(rawWord);
      if (!clean) { closePopover(); return; }

      /* Limpa marca temporária anterior antes de envolver a nova palavra */
      closePopover();
      var before = val.slice(0, start);
      var after = val.slice(end);
      var parent = node.parentNode;
      if (!parent) { return; }
      var mark = document.createElement('mark');
      mark.className = 'esc-reader-tap-mark';
      mark.textContent = rawWord;
      if (before) { parent.insertBefore(document.createTextNode(before), node); }
      parent.insertBefore(mark, node);
      if (after) { parent.insertBefore(document.createTextNode(after), node); }
      parent.removeChild(node);
      openWordAtMark(clean, mark);
    }

    function buildOverlay() {
      if (overlayEl) { return overlayEl; }
      var sec = document.createElement('section');
      sec.id = 'esc-reader-overlay';
      sec.className = 'esc-reader';
      sec.setAttribute('role', 'dialog');
      sec.setAttribute('aria-modal', 'true');
      sec.setAttribute('aria-label', 'Modo leitura');
      sec.hidden = true;
      sec.innerHTML =
        '<div class="esc-reader-progress" aria-hidden="true"><span id="esc-reader-progress-fill" class="esc-reader-progress-fill"></span></div>' +
        '<header class="esc-reader-bar">' +
          '<button id="esc-reader-close" type="button">← Voltar à escrita</button>' +
          '<span id="esc-reader-stats" class="esc-reader-mode" aria-live="polite"></span>' +
          '<button id="esc-reader-prev" type="button" aria-label="Página anterior">Anterior</button>' +
          '<button id="esc-reader-next" type="button" aria-label="Próxima página">Próxima</button>' +
          (opts && typeof opts.onPrint === 'function' ? '<button id="esc-reader-print" type="button" title="Imprimir ou salvar em PDF">Imprimir</button>' : '') +
          (opts && typeof opts.onOpenAcademy === 'function' ? '<button id="esc-reader-anatomy" type="button" title="Explorar a anatomia do livro na Academia">Objeto livro</button>' : '') +
          '<button id="esc-reader-settings-btn" type="button" aria-expanded="false">Papel e letra</button>' +
        '</header>' +
        '<div id="esc-reader-settings" class="esc-reader-settings" hidden>' +
          '<div class="esc-reader-settings-head"><strong>Papel e letra</strong><button id="esc-reader-settings-close" type="button" aria-label="Fechar ajustes de leitura">Fechar ×</button></div>' +
          '<label>Papel<select id="esc-reader-palette"><option value="paper">Real Gabinete (Pergaminho)</option><option value="cotton">Papel algodão (fibras)</option><option value="sage">Sálvia fosco</option><option value="linen">Pergaminho claro</option><option value="mist">Névoa suave</option><option value="white">Papel fosco</option><option value="night">Nogueira noturna</option></select></label>' +
          '<label>Letra<select id="esc-reader-face"><option value="serif">Literária (Serifada)</option><option value="sans">Sem serifa</option></select></label>' +
          '<label>Tamanho<select id="esc-reader-size"><option value="18">Normal (18)</option><option value="20">Confortável (20)</option><option value="21">Editorial (21)</option><option value="24">Grande (24)</option><option value="28">Muito grande (28)</option><option value="32">Extra (32)</option></select></label>' +
          '<label>Entrelinha<select id="esc-reader-leading"><option value="1.6">Compacta</option><option value="1.82">Editorial</option><option value="2">Ampla</option></select></label>' +
          '<label>Clima visual<select id="esc-reader-scene"><option value="on">Cena ilustrada</option><option value="off">Só papel</option></select></label>' +
          '<label>Pausa de leitura<select id="esc-reader-break"><option value="0">Sem pausa</option><option value="15">A cada 15 min</option><option value="25">A cada 25 min</option><option value="45">A cada 45 min</option></select></label>' +
        '</div>' +
        '<div id="esc-reader-viewport" class="esc-reader-viewport" tabindex="0">' +
          '<div id="esc-reader-page" class="esc-reader-page">' +
            '<div class="esc-reader-masthead"><span id="esc-reader-date"></span><strong class="esc-reader-brand">ESCREVARAL</strong><span id="esc-reader-project-tag"></span></div>' +
            '<div id="esc-reader-hero" class="esc-reader-hero" aria-hidden="true">' +
              (isPortableDoc() ? '' : '<img id="esc-reader-hero-img" class="esc-reader-hero-img" src="' + HERO_ART_LER + '" alt="" decoding="async">') +
              '<span id="esc-reader-hero-badge" class="esc-reader-hero-badge" hidden>READ-THRU · ENSAIO</span>' +
            '</div>' +
            '<div class="esc-reader-pills" role="tablist" aria-label="Modos da página de leitura">' +
              '<button id="esc-reader-tab-ler" type="button" class="esc-reader-pill" role="tab" aria-selected="true" data-mode="ler">Ler</button>' +
              '<button id="esc-reader-tab-ensaio" type="button" class="esc-reader-pill" role="tab" aria-selected="false" data-mode="ensaio">Roteiro / Ensaio</button>' +
              '<span id="esc-reader-time-pill" class="esc-reader-pill-meta"></span>' +
              '<button id="esc-reader-marks-pill" type="button" class="esc-reader-pill-marks" hidden></button>' +
            '</div>' +
            '<p id="esc-reader-hint" class="esc-reader-hint"></p>' +
            '<div id="esc-reader-ensaio-bar" class="esc-reader-ensaio-bar" hidden></div>' +
            '<article id="esc-reader-article" class="esc-reader-article"></article>' +
          '</div>' +
          '<div id="esc-reader-pause" class="esc-reader-pause" hidden>' +
            '<h2>Pausa para os olhos</h2>' +
            '<p>Descanse um instante longe da tela antes de retomar a leitura.</p>' +
            '<button id="esc-reader-resume" type="button">Retomar leitura</button>' +
          '</div>' +
        '</div>' +
        '<aside id="esc-reader-popover" class="esc-reader-pop" role="dialog" aria-label="Consulta rápida da palavra" hidden></aside>';
      document.body.appendChild(sec);
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(sec, 'viewport');
      }
      overlayEl = sec;

      var heroImgInit = byId('esc-reader-hero-img');
      if (heroImgInit) {
        on(heroImgInit, 'error', function () { heroImgInit.hidden = true; });
        on(heroImgInit, 'load', function () { heroImgInit.hidden = false; });
      }

      function updateProgress() {
        var vp = byId('esc-reader-viewport');
        var fill = byId('esc-reader-progress-fill');
        var statsEl = byId('esc-reader-stats');
        if (!vp) { return; }
        var pct = scrollProgress(vp.scrollTop, vp.scrollHeight, vp.clientHeight);
        if (fill && fill.style) { fill.style.width = pct + '%'; }
        if (statsEl) {
          var base = statsEl.getAttribute('data-base-stat') || '';
          statsEl.textContent = base ? (base + ' · ' + pct + '%') : (pct + '%');
        }
      }

      function stepPage(dir) {
        var vp = byId('esc-reader-viewport');
        if (!vp) { return; }
        var delta = Math.max(120, (vp.clientHeight || 400) * 0.85);
        vp.scrollTop = Math.max(0, vp.scrollTop + dir * delta);
        updateProgress();
      }

      function closeSettings() {
        settingsOpen = false;
        var st = byId('esc-reader-settings');
        var btn = byId('esc-reader-settings-btn');
        if (st) { st.hidden = true; }
        if (btn) { btn.setAttribute('aria-expanded', 'false'); }
      }
      on(byId('esc-reader-close'), 'click', close);
      on(byId('esc-reader-settings-btn'), 'click', function (ev) {
        if (ev && ev.stopPropagation) { ev.stopPropagation(); }
        settingsOpen = !settingsOpen;
        byId('esc-reader-settings').hidden = !settingsOpen;
        this.setAttribute('aria-expanded', settingsOpen ? 'true' : 'false');
      });
      on(byId('esc-reader-settings-close'), 'click', function () {
        closeSettings();
        var btn = byId('esc-reader-settings-btn');
        if (btn && btn.focus) { btn.focus(); }
      });
      on(overlayEl, 'click', function (ev) {
        if (settingsOpen) {
          var st = byId('esc-reader-settings');
          var btn = byId('esc-reader-settings-btn');
          if (st && !st.contains(ev.target) && (!btn || !btn.contains(ev.target))) {
            closeSettings();
          }
        }
        var pop = byId('esc-reader-popover');
        var art = byId('esc-reader-article');
        if (pop && !pop.hidden && !pop.contains(ev.target) && (!art || !art.contains(ev.target))) {
          closePopover();
        }
      });
      on(byId('esc-reader-article'), 'click', handleArticleClick);
      on(byId('esc-reader-tab-ler'), 'click', function () { switchReaderMode('ler'); });
      on(byId('esc-reader-tab-ensaio'), 'click', function () { switchReaderMode('ensaio'); });
      var markCycleIdx = 0;
      on(byId('esc-reader-marks-pill'), 'click', function () {
        if (!reviewMarks.length) { return; }
        var item = reviewMarks[markCycleIdx % reviewMarks.length];
        markCycleIdx += 1;
        if (item && item.el && item.el.scrollIntoView) {
          item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          openWordAtMark(item.word, item.el);
        }
      });
      on(byId('esc-reader-prev'), 'click', function () { stepPage(-1); });
      on(byId('esc-reader-next'), 'click', function () { stepPage(1); });
      on(byId('esc-reader-viewport'), 'scroll', function () {
        updateProgress();
        if (popMarkEl) {
          var pop = byId('esc-reader-popover');
          if (pop && !pop.hidden) { positionPopover(pop, popMarkEl); }
        }
      });
      if (byId('esc-reader-print') && opts && typeof opts.onPrint === 'function') {
        on(byId('esc-reader-print'), 'click', function () { opts.onPrint(); });
      }
      if (byId('esc-reader-anatomy') && opts && typeof opts.onOpenAcademy === 'function') {
        on(byId('esc-reader-anatomy'), 'click', function () {
          close();
          opts.onOpenAcademy('objeto-livro');
        });
      }
      on(byId('esc-reader-resume'), 'click', scheduleBreak);
      on(byId('esc-reader-palette'), 'change', function () { prefs.palette = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-face'), 'change', function () { prefs.face = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-size'), 'change', function () { prefs.size = clamp(this.value, 17, 32, 22); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-leading'), 'change', function () { prefs.leading = clamp(this.value, 1.5, 2.0, 1.7); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-scene'), 'change', function () { prefs.showScene = this.value !== 'off'; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-break'), 'change', function () { prefs.breakMin = Number(this.value) || 0; savePrefs(); scheduleBreak(); });
      on(overlayEl, 'keydown', function (ev) {
        var tag = ev.target && ev.target.tagName ? String(ev.target.tagName).toUpperCase() : '';
        if (ev.keyCode === 27) {
          ev.preventDefault(); ev.stopPropagation();
          var pop = byId('esc-reader-popover');
          if (pop && !pop.hidden) { closePopover(); return; }
          close(); return;
        }
        if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') { return; }
        if (activeMode === 'ensaio' && (ev.keyCode === 40 || ev.keyCode === 38)) {
          ev.preventDefault();
          stepEnsaio(ev.keyCode === 40 ? 1 : -1);
          return;
        }
        if (ev.keyCode === 34 || ev.keyCode === 39) { ev.preventDefault(); stepPage(1); }
        else if (ev.keyCode === 33 || ev.keyCode === 37) { ev.preventDefault(); stepPage(-1); }
        else if (ev.keyCode === 36) { var vpH = byId('esc-reader-viewport'); if (vpH) { ev.preventDefault(); vpH.scrollTop = 0; updateProgress(); } }
        else if (ev.keyCode === 35) { var vpE = byId('esc-reader-viewport'); if (vpE) { ev.preventDefault(); vpE.scrollTop = vpE.scrollHeight || 0; updateProgress(); } }
      });

      overlayEl._updateProgress = updateProgress;
      return overlayEl;
    }

    function steppableList() {
      if (!parsedReadThru || !parsedReadThru.steps.length) { return []; }
      var out = [], k, bIdx, blk;
      for (k = 0; k < parsedReadThru.steps.length; k += 1) {
        bIdx = parsedReadThru.steps[k];
        blk = parsedReadThru.blocks[bIdx];
        if (!blk) { continue; }
        if (selectedSpeaker && blk.speaker !== selectedSpeaker) { continue; }
        if (!parsedReadThru.isScript && onlyDialogues && blk.kind !== 'prose-dialogue') { continue; }
        out.push(blk.stepIndex);
      }
      return out;
    }

    function applyEnsaioHighlights(scrollToActive) {
      var art = byId('esc-reader-article');
      if (!art || !art.querySelectorAll) { return; }
      var list = steppableList();
      if (list.length && list.indexOf(activeStep) === -1) { activeStep = list[0]; }
      var marks = art.querySelectorAll('[data-rt-step]');
      var activeEl = null;
      for (var i = 0; i < marks.length; i += 1) {
        var el = marks[i];
        var sIdx = Number(el.getAttribute('data-rt-step'));
        var spk = el.getAttribute('data-rt-speaker') || '';
        var isCur = list.length && sIdx === activeStep;
        var isCharHit = !!selectedSpeaker && spk === selectedSpeaker;
        el.setAttribute('data-rt-active', isCur ? 'true' : 'false');
        el.setAttribute('data-rt-char-hl', isCharHit ? 'true' : 'false');
        if (isCur) { activeEl = el; }
      }
      var counter = byId('esc-rt-counter');
      var prevB = byId('esc-rt-prev');
      var nextB = byId('esc-rt-next');
      var pos = list.indexOf(activeStep);
      if (counter) { counter.textContent = list.length ? ('Fala ' + (pos + 1) + ' / ' + list.length) : 'Sem falas'; }
      if (prevB) { prevB.disabled = pos <= 0; }
      if (nextB) { nextB.disabled = pos < 0 || pos >= list.length - 1; }
      if (scrollToActive && activeEl && activeEl.scrollIntoView) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function stepEnsaio(dir) {
      var list = steppableList();
      if (!list.length) { return; }
      var pos = list.indexOf(activeStep);
      if (pos < 0) { activeStep = list[0]; }
      else { activeStep = list[Math.max(0, Math.min(list.length - 1, pos + dir))]; }
      applyEnsaioHighlights(true);
    }

    function renderEnsaioControls() {
      var bar = byId('esc-reader-ensaio-bar');
      if (!bar) { return; }
      bar.textContent = '';
      if (activeMode !== 'ensaio' || !parsedReadThru) {
        bar.hidden = true;
        return;
      }
      bar.hidden = false;

      if (parsedReadThru.isScript && parsedReadThru.characters.length) {
        var group = document.createElement('div');
        group.className = 'esc-rt-chars';
        var allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'esc-rt-chip';
        allBtn.textContent = 'Todos';
        allBtn.setAttribute('aria-pressed', !selectedSpeaker ? 'true' : 'false');
        on(allBtn, 'click', function () { selectedSpeaker = ''; renderEnsaioControls(); applyEnsaioHighlights(false); });
        group.appendChild(allBtn);

        parsedReadThru.characters.slice(0, 12).forEach(function (ch) {
          var cb = document.createElement('button');
          cb.type = 'button';
          cb.className = 'esc-rt-chip';
          cb.textContent = ch;
          cb.setAttribute('aria-pressed', selectedSpeaker === ch ? 'true' : 'false');
          on(cb, 'click', function () {
            selectedSpeaker = selectedSpeaker === ch ? '' : ch;
            renderEnsaioControls();
            applyEnsaioHighlights(true);
          });
          group.appendChild(cb);
        });
        bar.appendChild(group);
      } else if (!parsedReadThru.isScript && parsedReadThru.hasDialogues) {
        var fGroup = document.createElement('div');
        fGroup.className = 'esc-rt-chars';
        var dBtn = document.createElement('button');
        dBtn.type = 'button';
        dBtn.className = 'esc-rt-chip';
        dBtn.textContent = onlyDialogues ? 'Só diálogos ✓' : 'Filtrar só diálogos';
        dBtn.setAttribute('aria-pressed', onlyDialogues ? 'true' : 'false');
        on(dBtn, 'click', function () {
          onlyDialogues = !onlyDialogues;
          renderEnsaioControls();
          applyEnsaioHighlights(true);
        });
        fGroup.appendChild(dBtn);
        bar.appendChild(fGroup);
      }

      var nav = document.createElement('div');
      nav.className = 'esc-rt-nav';
      var prevB = document.createElement('button');
      prevB.id = 'esc-rt-prev'; prevB.type = 'button'; prevB.className = 'esc-rt-step';
      prevB.textContent = '← Anterior';
      on(prevB, 'click', function () { stepEnsaio(-1); });
      var cnt = document.createElement('span');
      cnt.id = 'esc-rt-counter'; cnt.className = 'esc-rt-counter';
      var nextB = document.createElement('button');
      nextB.id = 'esc-rt-next'; nextB.type = 'button'; nextB.className = 'esc-rt-step';
      nextB.textContent = 'Próxima →';
      on(nextB, 'click', function () { stepEnsaio(1); });
      nav.appendChild(prevB);
      nav.appendChild(cnt);
      nav.appendChild(nextB);
      bar.appendChild(nav);
    }

    function renderArticleBody() {
      if (!currentDoc) { return; }
      var doc = currentDoc;
      var text = typeof doc.text === 'string' ? doc.text : '';
      var stats = readingMinutes(text);
      var statLine = stats.words + (stats.words === 1 ? ' palavra' : ' palavras') + (stats.minutes ? ' · ' + stats.minutes + ' min de leitura' : '');
      var article = byId('esc-reader-article');
      if (!article) { return; }
      article.textContent = '';

      var heroBadge = byId('esc-reader-hero-badge');
      if (heroBadge) { heroBadge.hidden = activeMode !== 'ensaio'; }
      var heroImg = byId('esc-reader-hero-img');
      if (heroImg) {
        var desiredArt = activeMode === 'ensaio' ? HERO_ART_ENSAIO : HERO_ART_LER;
        if (heroImg.getAttribute('src') !== desiredArt) {
          heroImg.hidden = false;
          heroImg.setAttribute('src', desiredArt);
        }
      }
      var tabLer = byId('esc-reader-tab-ler');
      var tabEns = byId('esc-reader-tab-ensaio');
      if (tabLer) { tabLer.setAttribute('aria-selected', activeMode === 'ler' ? 'true' : 'false'); }
      if (tabEns) { tabEns.setAttribute('aria-selected', activeMode === 'ensaio' ? 'true' : 'false'); }
      var hintEl = byId('esc-reader-hint');
      if (hintEl) {
        hintEl.textContent = activeMode === 'ensaio'
          ? (parsedReadThru && parsedReadThru.isScript
            ? 'Clique num personagem para acender todas as suas falas ou use ↑/↓ para ensaiar em voz alta.'
            : 'Use ↑/↓ ou clique em qualquer fala para conduzir a leitura em voz alta linha a linha.')
          : 'Toque em qualquer palavra da página para ver significado, sílabas e sinônimos offline.';
      }

      var h1 = document.createElement('h1');
      h1.className = 'esc-reader-title';
      h1.textContent = doc && doc.title ? doc.title : 'Sem título';
      article.appendChild(h1);

      var byline = document.createElement('p');
      byline.className = 'esc-reader-byline';
      byline.textContent = statLine;
      article.appendChild(byline);
      if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
        article.appendChild(root.Escr.ornaments.createStairRod('left'));
      }

      if (activeMode === 'ensaio') {
        var rtWrap = document.createElement('div');
        rtWrap.className = 'esc-reader-body esc-rt-body' + (parsedReadThru && parsedReadThru.isScript ? ' is-script' : ' is-prose');
        var blocks = parsedReadThru ? parsedReadThru.blocks : [];
        if (!blocks.length) {
          var emp = document.createElement('p');
          emp.className = 'esc-reader-empty';
          emp.textContent = 'Folha em branco.';
          rtWrap.appendChild(emp);
        } else {
          blocks.forEach(function (blk) {
            var p = document.createElement('p');
            p.className = 'esc-rt-' + blk.kind;
            if (blk.stepIndex >= 0) {
              var span = document.createElement('span');
              span.className = 'esc-rt-hl';
              span.setAttribute('data-rt-step', String(blk.stepIndex));
              span.setAttribute('data-rt-speaker', blk.speaker || '');
              span.setAttribute('data-rt-active', 'false');
              span.setAttribute('data-rt-char-hl', 'false');
              span.textContent = blk.text;
              on(span, 'click', function () {
                activeStep = blk.stepIndex;
                applyEnsaioHighlights(false);
              });
              p.appendChild(span);
            } else {
              p.textContent = blk.text;
            }
            rtWrap.appendChild(p);
          });
        }
        article.appendChild(rtWrap);
        renderEnsaioControls();
        applyEnsaioHighlights(false);
      } else {
        renderEnsaioControls();
        if (doc && doc.format === 'rich' && doc.richHtml && root.Escr.richEditor) {
          var richWrap = document.createElement('div');
          richWrap.className = 'esc-reader-body';
          richWrap.innerHTML = root.Escr.richEditor.sanitizeHtml(doc.richHtml);
          article.appendChild(richWrap);
        } else {
          var plain = document.createElement('div');
          plain.className = 'esc-reader-plain esc-reader-body';
          var pBlocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/);
          var hasDropCap = text.replace(/\s+/g, '').length >= 80;
          var pIdx = 0, bi, blockText, pEl;
          for (bi = 0; bi < pBlocks.length; bi += 1) {
            blockText = pBlocks[bi].replace(/^\n+|\n+$/g, '');
            if (!blockText) { continue; }
            pEl = document.createElement('p');
            if (pIdx === 0 && hasDropCap && /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(blockText)) {
              pEl.className = 'esc-reader-dropcap';
            }
            pEl.textContent = blockText;
            plain.appendChild(pEl);
            pIdx += 1;
          }
          if (!pIdx) {
            pEl = document.createElement('p');
            pEl.className = 'esc-reader-empty';
            pEl.textContent = 'Folha em branco.';
            plain.appendChild(pEl);
          }
          article.appendChild(plain);
        }
      }

      var endMark = document.createElement('footer');
      endMark.className = 'esc-reader-end';
      if (root.Escr.ornaments && root.Escr.ornaments.createColophon) {
        endMark.appendChild(root.Escr.ornaments.createColophon());
      } else {
        var fleuron = document.createElement('span');
        fleuron.className = 'esc-reader-fleuron';
        fleuron.setAttribute('aria-hidden', 'true');
        fleuron.textContent = '— ❦ —';
        endMark.appendChild(fleuron);
      }
      var endText = document.createElement('span');
      endText.textContent = 'Fim da leitura · Esc para retornar à edição';
      endMark.appendChild(endText);
      var endBack = document.createElement('button');
      endBack.type = 'button';
      endBack.className = 'esc-reader-end-back';
      endBack.textContent = '← Voltar à escrita';
      on(endBack, 'click', close);
      endMark.appendChild(endBack);
      article.appendChild(endMark);
    }

    function switchReaderMode(mode) {
      closePopover();
      activeMode = mode === 'ensaio' ? 'ensaio' : 'ler';
      applyPrefs();
      renderArticleBody();
      if (overlayEl && overlayEl._updateProgress) { overlayEl._updateProgress(); }
    }

    function open(doc) {
      buildOverlay();
      closePopover();
      currentDoc = doc || { title: '', text: '' };
      reviewMarks = [];
      updateReviewPill();
      selectedSpeaker = '';
      onlyDialogues = false;
      activeStep = 0;
      parsedReadThru = parseReadThru(currentDoc.text || '');
      /* Se o documento for explicitamente um roteiro estruturado, abre pronto no modo Roteiro/Ensaio */
      activeMode = (parsedReadThru.isScript || currentDoc.template === 'roteiro' || currentDoc.printPreset === 'roteiro') ? 'ensaio' : 'ler';

      previousFocus = document.activeElement;
      var appIsDark = !!(document.body && document.body.getAttribute('data-theme') === 'escuro');
      var effectivePalette = prefs.palette;
      if (appIsDark && !hasSavedPalette()) { effectivePalette = 'night'; }
      byId('esc-reader-palette').value = effectivePalette;
      byId('esc-reader-face').value = prefs.face;
      byId('esc-reader-size').value = String(prefs.size);
      byId('esc-reader-leading').value = String(prefs.leading);
      if (byId('esc-reader-scene')) { byId('esc-reader-scene').value = prefs.showScene ? 'on' : 'off'; }
      byId('esc-reader-break').value = String(prefs.breakMin);
      applyPrefs(effectivePalette);

      var text = currentDoc && typeof currentDoc.text === 'string' ? currentDoc.text : '';
      var stats = readingMinutes(text);
      var statsNode = byId('esc-reader-stats');
      if (statsNode) {
        statsNode.setAttribute('data-base-stat', stats.minutes ? (stats.minutes + ' min') : '');
        statsNode.textContent = stats.minutes ? (stats.minutes + ' min · 0%') : '0%';
      }
      var timePill = byId('esc-reader-time-pill');
      if (timePill) {
        timePill.textContent = stats.minutes ? (stats.minutes + ' min') : 'Rascunho';
      }
      if (byId('esc-reader-date')) { byId('esc-reader-date').textContent = formatEditionDate(); }
      byId('esc-reader-project-tag').textContent = currentDoc && currentDoc.project ? currentDoc.project : 'EDIÇÃO DE LEITURA';

      renderArticleBody();

      overlayEl.hidden = false;
      byId('esc-reader-viewport').scrollTop = 0;
      if (overlayEl._updateProgress) { overlayEl._updateProgress(); }
      scheduleBreak();
      byId('esc-reader-close').focus();
    }

    function close() {
      closePopover();
      stopBreakTimer();
      if (overlayEl) { overlayEl.hidden = true; }
      if (previousFocus && previousFocus.focus) { previousFocus.focus(); }
    }

    return {
      open: open,
      close: close,
      isOpen: function () { return !!(overlayEl && !overlayEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));
