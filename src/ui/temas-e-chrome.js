/* Dois modos calibrados por neurociência visual (Papel Sálvia claro #c4cfc2 e Noturno Opaco #1d221d / Nogueira #211a14), Leitura confortável, Piscar E-Ink e Tela cheia — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var THEME_KEY = 'escrevaral.theme.v2';
  var LEGACY_THEME_KEY = 'escrevaral.astra.theme';
  var READING_KEY = 'escrevaral.reading.comfortable.v1';
  var LABELS = {
    eink: 'Papel S\u00E1lvia claro',
    noturno: 'Noturno opaco'
  };

  function normalizeTheme(name) {
    var v = String(name || '').toLowerCase();
    if (v === 'escuro' || v === 'noturno' || v === 'dark') { return 'noturno'; }
    return 'eink';
  }

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function reducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  var flashTimer = null;
  function flashEink(node) {
    if (!node || !node.setAttribute || reducedMotion()) { return; }
    if (flashTimer) { window.clearTimeout(flashTimer); flashTimer = null; }
    node.removeAttribute('data-eink-flash');
    node.setAttribute('data-eink-flash', 'true');
    flashTimer = window.setTimeout(function () {
      flashTimer = null;
      if (node && node.removeAttribute) { node.removeAttribute('data-eink-flash'); }
    }, 150);
  }

  root.Escr.einkFlash = flashEink;

  root.Escr.mountThemeChrome = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var onNewNote = opts.onNewNote || function () {};
    var currentTheme = 'eink';
    var comfortable = false;

    try {
      if (storage) {
        var saved = storage.getItem(THEME_KEY) || storage.getItem(LEGACY_THEME_KEY);
        if (saved) { currentTheme = normalizeTheme(saved); }
        comfortable = storage.getItem(READING_KEY) === 'true';
      }
    } catch (ignore) {}

    function syncAcademiaFrames(isDark) {
      try {
        var frame = document.querySelector && document.querySelector('iframe.esc-academy-frame');
        if (frame && frame.contentWindow && frame.contentWindow.postMessage) {
          var isLit = !!(frame.src && frame.src.indexOf('literatura-mundial') !== -1);
          var paper = isDark ? '#211a14' : '#cfc3ae';
          var ink = isDark ? '#d9cebc' : '#1f130b';
          var accent = isDark ? '#c49a58' : (isLit ? '#3a2013' : '#8b5a1e');
          frame.contentWindow.postMessage({
            channel: 'escrevaral-academia-theme',
            colors: { paper: paper, ink: ink, accent: accent },
            comfortable: !!comfortable
          }, '*');
        }
      } catch (ignore) {}
    }

    function applyTheme(name, persistPref) {
      currentTheme = normalizeTheme(name);
      var isDark = currentTheme === 'noturno';
      if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', isDark ? 'escuro' : 'claro');
      }
      if (document.body) {
        document.body.setAttribute('data-esc-theme', currentTheme);
        document.body.setAttribute('data-theme', isDark ? 'escuro' : 'claro');
      }
      var meta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
      if (meta) { meta.setAttribute('content', isDark ? '#1d221d' : '#c4cfc2'); }
      var temaInput = document.getElementById && document.getElementById('tema');
      if (temaInput) { temaInput.value = isDark ? 'escuro' : 'claro'; }
      var lightBtn = document.getElementById && document.getElementById('theme-light');
      var darkBtn = document.getElementById && document.getElementById('theme-dark');
      if (lightBtn) { lightBtn.setAttribute('aria-pressed', isDark ? 'false' : 'true'); }
      if (darkBtn) { darkBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false'); }
      var cycleBtn = document.getElementById && document.getElementById('esc-theme-cycle');
      if (cycleBtn) {
        cycleBtn.setAttribute('aria-label', 'Modo noturno');
        cycleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        cycleBtn.setAttribute('title', isDark ? 'Voltar ao Papel S\u00E1lvia claro' : 'Ativar Modo Noturno opaco');
        var lbl = cycleBtn.querySelector ? cycleBtn.querySelector('.esc-theme-label') : null;
        if (lbl) { lbl.textContent = isDark ? 'Diurno' : 'Noturno'; }
      }
      if (persistPref !== false && storage) {
        try {
          storage.setItem(THEME_KEY, currentTheme);
          storage.setItem(LEGACY_THEME_KEY, isDark ? 'escuro' : 'claro');
        } catch (ignore) {}
      }
      syncAcademiaFrames(isDark);
    }

    function applyReading(onVal, persistPref) {
      comfortable = !!onVal;
      if (document.body) {
        if (comfortable) { document.body.setAttribute('data-esc-reading', 'comfortable'); }
        else { document.body.removeAttribute('data-esc-reading'); }
      }
      var btn = document.getElementById && document.getElementById('esc-reading-toggle');
      if (btn) {
        btn.setAttribute('aria-pressed', comfortable ? 'true' : 'false');
        btn.textContent = comfortable ? 'Ativado' : 'Ativar';
      }
      if (persistPref !== false && storage) {
        try { storage.setItem(READING_KEY, comfortable ? 'true' : 'false'); } catch (ignore) {}
      }
      syncAcademiaFrames(currentTheme === 'noturno');
    }

    function bindControls() {
      var cycleBtn = document.getElementById && document.getElementById('esc-theme-cycle');
      if (cycleBtn) {
        on(cycleBtn, 'click', function () {
          applyTheme(currentTheme === 'noturno' ? 'eink' : 'noturno', true);
        });
      }
      var readBtn = document.getElementById && document.getElementById('esc-reading-toggle');
      if (readBtn) {
        on(readBtn, 'click', function () { applyReading(!comfortable, true); });
      }
      var fullBtn = document.getElementById && document.getElementById('esc-fullscreen-btn');
      if (fullBtn) {
        on(fullBtn, 'click', function () {
          if (root.Escr.superfocoCore) { root.Escr.superfocoCore.toggleFullscreen(); }
        });
      }
      if (document.querySelectorAll) {
        var dioramaImgs = document.querySelectorAll('#esc-cafe-diorama img');
        var di;
        for (di = 0; di < dioramaImgs.length; di += 1) {
          (function (imgEl) {
            on(imgEl, 'error', function () { imgEl.hidden = true; imgEl.style.display = 'none'; });
            if (imgEl.complete && imgEl.naturalWidth === 0) { imgEl.hidden = true; imgEl.style.display = 'none'; }
          }(dioramaImgs[di]));
        }
      }
      on(document, 'keydown', function (ev) {
        if (ev.altKey && ev.shiftKey && !ev.ctrlKey && !ev.metaKey && ev.keyCode === 78) {
          ev.preventDefault();
          onNewNote();
        }
      });
    }

    applyTheme(currentTheme, false);
    applyReading(comfortable, false);
    bindControls();

    return {
      setTheme: function (name) { applyTheme(name, true); },
      toggleTheme: function () { applyTheme(currentTheme === 'noturno' ? 'eink' : 'noturno', true); },
      getTheme: function () { return currentTheme; },
      isDark: function () { return currentTheme === 'noturno'; },
      setComfortable: function (v) { applyReading(v, true); },
      isComfortable: function () { return comfortable; },
      flash: flashEink,
      LABELS: LABELS
    };
  };
}(typeof window !== 'undefined' ? window : this));
