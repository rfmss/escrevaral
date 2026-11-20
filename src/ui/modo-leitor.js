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
    return {
      palette: p.palette === 'white' || p.palette === 'night' ? p.palette : 'paper',
      face: p.face === 'sans' ? 'sans' : 'serif',
      size: clamp(p.size, 17, 28, 22),
      leading: clamp(p.leading, 1.5, 2.0, 1.7),
      width: clamp(p.width, 50, 74, 62),
      breakMin: p.breakMin === 15 || p.breakMin === 25 || p.breakMin === 45 ? p.breakMin : 0
    };
  }

  function readingMinutes(text) {
    var words = root.Escr.countManuscript ? root.Escr.countManuscript(text || '').words : 0;
    return { words: words, minutes: words ? Math.max(1, Math.round(words / 200)) : 0 };
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  root.Escr.readerCore = {
    normalizePrefs: normalizePrefs,
    readingMinutes: readingMinutes
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
        '<header class="esc-reader-bar">' +
          '<button id="esc-reader-close" type="button">← Voltar à escrita</button>' +
          '<span id="esc-reader-stats" class="esc-reader-mode"></span>' +
          '<button id="esc-reader-prev" type="button" aria-label="Página anterior">▲ Anterior</button>' +
          '<button id="esc-reader-next" type="button" aria-label="Próxima página">▼ Próxima</button>' +
          '<button id="esc-reader-settings-btn" type="button" aria-expanded="false">Aparência</button>' +
        '</header>' +
        '<div id="esc-reader-settings" class="esc-reader-settings" hidden>' +
          '<label>Papel<select id="esc-reader-palette"><option value="paper">Papel sépia</option><option value="white">Branco claro</option><option value="night">Noturno</option></select></label>' +
          '<label>Letra<select id="esc-reader-face"><option value="serif">Literária (Serifada)</option><option value="sans">Sem serifa</option></select></label>' +
          '<label>Tamanho<select id="esc-reader-size"><option value="18">18 px</option><option value="20">20 px</option><option value="22">22 px</option><option value="25">25 px</option><option value="28">28 px</option></select></label>' +
          '<label>Entrelinha<select id="esc-reader-leading"><option value="1.5">Compacta</option><option value="1.7">Editorial</option><option value="1.95">Ampla</option></select></label>' +
          '<label>Pausa de leitura<select id="esc-reader-break"><option value="0">Sem pausa</option><option value="15">A cada 15 min</option><option value="25">A cada 25 min</option><option value="45">A cada 45 min</option></select></label>' +
        '</div>' +
        '<div id="esc-reader-viewport" class="esc-reader-viewport" tabindex="0">' +
          '<div id="esc-reader-page" class="esc-reader-page">' +
            '<div class="esc-reader-masthead"><span>ESCREVARAL · EDIÇÃO DE LEITURA</span><span id="esc-reader-project-tag"></span></div>' +
            '<article id="esc-reader-article" class="esc-reader-article"></article>' +
          '</div>' +
          '<div id="esc-reader-pause" class="esc-reader-pause" hidden>' +
            '<h2>Pausa para os olhos</h2>' +
            '<p>Descanse um instante longe da tela antes de retomar a leitura.</p>' +
            '<button id="esc-reader-resume" type="button">Retomar leitura</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(sec);
      overlayEl = sec;

      on(byId('esc-reader-close'), 'click', close);
      on(byId('esc-reader-settings-btn'), 'click', function () {
        settingsOpen = !settingsOpen;
        byId('esc-reader-settings').hidden = !settingsOpen;
        this.setAttribute('aria-expanded', settingsOpen ? 'true' : 'false');
      });
      on(byId('esc-reader-prev'), 'click', function () {
        var vp = byId('esc-reader-viewport');
        if (vp) { vp.scrollTop = Math.max(0, vp.scrollTop - Math.max(120, vp.clientHeight * 0.85)); }
      });
      on(byId('esc-reader-next'), 'click', function () {
        var vp = byId('esc-reader-viewport');
        if (vp) { vp.scrollTop += Math.max(120, vp.clientHeight * 0.85); }
      });
      on(byId('esc-reader-resume'), 'click', scheduleBreak);
      on(byId('esc-reader-palette'), 'change', function () { prefs.palette = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-face'), 'change', function () { prefs.face = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-size'), 'change', function () { prefs.size = clamp(this.value, 17, 28, 22); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-leading'), 'change', function () { prefs.leading = clamp(this.value, 1.5, 2.0, 1.7); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-break'), 'change', function () { prefs.breakMin = Number(this.value) || 0; savePrefs(); scheduleBreak(); });
      on(overlayEl, 'keydown', function (ev) {
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); close(); }
      });

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
      byId('esc-reader-stats').textContent = stats.words + ' palavras' + (stats.minutes ? ' · ~' + stats.minutes + ' min' : '');
      byId('esc-reader-project-tag').textContent = doc && doc.project ? doc.project : 'TEXTO AVULSO';

      var article = byId('esc-reader-article');
      article.textContent = '';
      var h1 = document.createElement('h1');
      h1.className = 'esc-reader-title';
      h1.textContent = doc && doc.title ? doc.title : 'Sem título';
      article.appendChild(h1);

      if (doc && doc.format === 'rich' && doc.richHtml && root.Escr.richEditor) {
        var richWrap = document.createElement('div');
        richWrap.innerHTML = root.Escr.richEditor.sanitizeHtml(doc.richHtml);
        article.appendChild(richWrap);
      } else {
        var plain = document.createElement('div');
        plain.className = 'esc-reader-plain';
        plain.textContent = text;
        article.appendChild(plain);
      }

      var endMark = document.createElement('footer');
      endMark.className = 'esc-reader-end';
      endMark.textContent = 'Fim da leitura · Esc para retornar à edição.';
      article.appendChild(endMark);

      overlayEl.hidden = false;
      byId('esc-reader-viewport').scrollTop = 0;
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
