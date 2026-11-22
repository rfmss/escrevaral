/* Tema único calibrado (Papel digital E-Ink Sálvia #c4cfc2), Leitura confortável, Piscar E-Ink e Tela cheia — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var THEME_KEY = 'escrevaral.theme.v2';
  var READING_KEY = 'escrevaral.reading.comfortable.v1';
  var LOCKED_THEME = 'eink';
  var LABELS = {
    eink: 'Papel digital (E-Ink S\u00E1lvia)'
  };

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
    var currentTheme = LOCKED_THEME;
    var comfortable = false;

    try {
      if (storage) {
        comfortable = storage.getItem(READING_KEY) === 'true';
      }
    } catch (ignore) {}

    function applyTheme(name, persistPref) {
      currentTheme = LOCKED_THEME;
      if (document.body) {
        document.body.setAttribute('data-esc-theme', LOCKED_THEME);
        document.body.setAttribute('data-theme', 'claro');
      }
      var meta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
      if (meta) { meta.setAttribute('content', '#c4cfc2'); }
      var lightBtn = document.getElementById && document.getElementById('theme-light');
      var darkBtn = document.getElementById && document.getElementById('theme-dark');
      if (lightBtn) { lightBtn.setAttribute('aria-pressed', 'true'); }
      if (darkBtn) { darkBtn.setAttribute('aria-pressed', 'false'); }
      if (persistPref !== false && storage) {
        try {
          storage.setItem(THEME_KEY, LOCKED_THEME);
          storage.setItem('escrevaral.astra.theme', 'claro');
        } catch (ignore) {}
      }
      try {
        var frame = document.querySelector && document.querySelector('iframe.esc-academy-frame');
        if (frame && frame.contentWindow && frame.contentWindow.postMessage) {
          frame.contentWindow.postMessage({ channel: 'escrevaral-theme', theme: LOCKED_THEME, dark: false }, '*');
        }
      } catch (ignore) {}
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
    }

    function bindControls() {
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
      on(document, 'keydown', function (ev) {
        if (ev.altKey && ev.shiftKey && !ev.ctrlKey && !ev.metaKey && ev.keyCode === 78) {
          ev.preventDefault();
          onNewNote();
        }
      });
    }

    applyTheme(LOCKED_THEME, true);
    applyReading(comfortable, false);
    bindControls();

    return {
      setTheme: function (name) { applyTheme(name, true); },
      getTheme: function () { return currentTheme; },
      setComfortable: function (v) { applyReading(v, true); },
      isComfortable: function () { return comfortable; },
      flash: flashEink,
      LABELS: LABELS
    };
  };
}(typeof window !== 'undefined' ? window : this));
