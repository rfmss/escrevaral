(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PREFS_KEY = 'escrevaral.reader.prefs.v1';

  function clamp(val, min, max, fallback) {
    var n = Number(val);
    if (!isFinite(n)) { return fallback; }
    return Math.max(min, Math.min(max, n));
  }

  function normalizePrefs(raw) {
    var p = raw && typeof raw === 'object' ? raw : {};
    var okPalette = p.palette === 'white' || p.palette === 'night' || p.palette === 'linen' || p.palette === 'mist' || p.palette === 'sage';
    return {
      palette: okPalette ? p.palette : 'paper',
      face: p.face === 'sans' ? 'sans' : 'serif',
      size: clamp(p.size, 17, 28, 21),
      leading: clamp(p.leading, 1.5, 2.0, 1.82),
      width: clamp(p.width, 50, 74, 62),
      breakMin: p.breakMin === 15 || p.breakMin === 25 || p.breakMin === 45 ? p.breakMin : 0
    };
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
    scrollProgress: scrollProgress
  };

  root.Escr.mountReaderMode = function (opts) {
    var storage = opts.storage;
    var overlayEl = null;
    var prefs = normalizePrefs(null);
    var breakTimer = null;
    var settingsOpen = false;
    var previousFocus = null;

    try {
      if (storage) {
        prefs = normalizePrefs(JSON.parse(storage.getItem(PREFS_KEY) || 'null'));
      }
    } catch (ignore) {}

    function savePrefs() {
      try {
        if (storage) { storage.setItem(PREFS_KEY, JSON.stringify(prefs)); }
      } catch (ignore) {}
    }

    function applyPrefs() {
      if (!overlayEl) { return; }
      overlayEl.setAttribute('data-palette', prefs.palette);
      overlayEl.setAttribute('data-face', prefs.face);
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
          '<label>Papel<select id="esc-reader-palette"><option value="paper">Jornal (Marfim)</option><option value="sage">Sálvia E-Ink</option><option value="linen">Creme suave</option><option value="mist">Névoa clara</option><option value="white">Galeria</option><option value="night">Noturno</option></select></label>' +
          '<label>Letra<select id="esc-reader-face"><option value="serif">Literária (Serifada)</option><option value="sans">Sem serifa</option></select></label>' +
          '<label>Tamanho<select id="esc-reader-size"><option value="18">18 px</option><option value="20">20 px</option><option value="21">21 px</option><option value="24">24 px</option><option value="28">28 px</option></select></label>' +
          '<label>Entrelinha<select id="esc-reader-leading"><option value="1.6">Compacta</option><option value="1.82">Editorial</option><option value="2">Ampla</option></select></label>' +
          '<label>Pausa de leitura<select id="esc-reader-break"><option value="0">Sem pausa</option><option value="15">A cada 15 min</option><option value="25">A cada 25 min</option><option value="45">A cada 45 min</option></select></label>' +
        '</div>' +
        '<div id="esc-reader-viewport" class="esc-reader-viewport" tabindex="0">' +
          '<div id="esc-reader-page" class="esc-reader-page">' +
            '<div class="esc-reader-masthead"><span id="esc-reader-date"></span><strong class="esc-reader-brand">ESCREVARAL</strong><span id="esc-reader-project-tag"></span></div>' +
            '<article id="esc-reader-article" class="esc-reader-article"></article>' +
          '</div>' +
          '<div id="esc-reader-pause" class="esc-reader-pause" hidden>' +
            '<h2>Pausa para os olhos</h2>' +
            '<p>Descanse um instante longe da tela antes de retomar a leitura.</p>' +
            '<button id="esc-reader-resume" type="button">Retomar leitura</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(sec);
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(sec, 'viewport');
      }
      overlayEl = sec;

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

      on(byId('esc-reader-close'), 'click', close);
      on(byId('esc-reader-settings-btn'), 'click', function () {
        settingsOpen = !settingsOpen;
        byId('esc-reader-settings').hidden = !settingsOpen;
        this.setAttribute('aria-expanded', settingsOpen ? 'true' : 'false');
      });
      on(byId('esc-reader-prev'), 'click', function () { stepPage(-1); });
      on(byId('esc-reader-next'), 'click', function () { stepPage(1); });
      on(byId('esc-reader-viewport'), 'scroll', updateProgress);
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
      on(byId('esc-reader-size'), 'change', function () { prefs.size = clamp(this.value, 17, 28, 22); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-leading'), 'change', function () { prefs.leading = clamp(this.value, 1.5, 2.0, 1.7); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-break'), 'change', function () { prefs.breakMin = Number(this.value) || 0; savePrefs(); scheduleBreak(); });
      on(overlayEl, 'keydown', function (ev) {
        var tag = ev.target && ev.target.tagName ? String(ev.target.tagName).toUpperCase() : '';
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); close(); return; }
        if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') { return; }
        if (ev.keyCode === 34 || ev.keyCode === 39) { ev.preventDefault(); stepPage(1); }
        else if (ev.keyCode === 33 || ev.keyCode === 37) { ev.preventDefault(); stepPage(-1); }
        else if (ev.keyCode === 36) { var vpH = byId('esc-reader-viewport'); if (vpH) { ev.preventDefault(); vpH.scrollTop = 0; updateProgress(); } }
        else if (ev.keyCode === 35) { var vpE = byId('esc-reader-viewport'); if (vpE) { ev.preventDefault(); vpE.scrollTop = vpE.scrollHeight || 0; updateProgress(); } }
      });

      overlayEl._updateProgress = updateProgress;
      return overlayEl;
    }

    function open(doc) {
      buildOverlay();
      previousFocus = document.activeElement;
      byId('esc-reader-palette').value = prefs.palette;
      byId('esc-reader-face').value = prefs.face;
      byId('esc-reader-size').value = String(prefs.size);
      byId('esc-reader-leading').value = String(prefs.leading);
      byId('esc-reader-break').value = String(prefs.breakMin);
      applyPrefs();

      var text = doc && typeof doc.text === 'string' ? doc.text : '';
      var stats = readingMinutes(text);
      var statLine = stats.words + (stats.words === 1 ? ' palavra' : ' palavras') + (stats.minutes ? ' · ' + stats.minutes + ' min de leitura' : '');
      var statsNode = byId('esc-reader-stats');
      if (statsNode) {
        statsNode.setAttribute('data-base-stat', stats.minutes ? (stats.minutes + ' min') : '');
        statsNode.textContent = stats.minutes ? (stats.minutes + ' min · 0%') : '0%';
      }
      if (byId('esc-reader-date')) { byId('esc-reader-date').textContent = formatEditionDate(); }
      byId('esc-reader-project-tag').textContent = doc && doc.project ? doc.project : 'EDIÇÃO DE LEITURA';

      var article = byId('esc-reader-article');
      article.textContent = '';
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

      if (doc && doc.format === 'rich' && doc.richHtml && root.Escr.richEditor) {
        var richWrap = document.createElement('div');
        richWrap.className = 'esc-reader-body';
        richWrap.innerHTML = root.Escr.richEditor.sanitizeHtml(doc.richHtml);
        article.appendChild(richWrap);
      } else {
        var plain = document.createElement('div');
        plain.className = 'esc-reader-plain esc-reader-body';
        var blocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/);
        var hasDropCap = text.replace(/\s+/g, '').length >= 80;
        var pIdx = 0, bi, blockText, pEl;
        for (bi = 0; bi < blocks.length; bi += 1) {
          blockText = blocks[bi].replace(/^\n+|\n+$/g, '');
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
      article.appendChild(endMark);

      overlayEl.hidden = false;
      byId('esc-reader-viewport').scrollTop = 0;
      if (overlayEl._updateProgress) { overlayEl._updateProgress(); }
      scheduleBreak();
      byId('esc-reader-close').focus();
    }

    function close() {
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
