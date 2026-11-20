/* Temas oficiais (Papel digital E-Ink Sálvia, Papel, Claro, Escuro Carbon), Leitura confortável, Piscar E-Ink e Tela cheia — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var THEME_KEY = 'escrevaral.theme.v2';
  var READING_KEY = 'escrevaral.reading.comfortable.v1';
  var VALID_THEMES = { eink: 1, papel: 1, claro: 1, escuro: 1 };
  var LABELS = {
    eink: 'Papel digital (Sálvia)',
    papel: 'Papel',
    claro: 'Claro',
    escuro: 'Escuro (Carbon)'
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
    var currentTheme = 'eink';
    var comfortable = false;

    try {
      if (storage) {
        var saved = storage.getItem(THEME_KEY);
        if (saved && VALID_THEMES[saved]) {
          currentTheme = saved;
        } else {
          var legacy = storage.getItem('escrevaral.astra.theme');
          if (legacy === 'escuro') { currentTheme = 'escuro'; }
        }
        comfortable = storage.getItem(READING_KEY) === 'true';
      }
    } catch (ignore) {}

    function applyTheme(name, persistPref) {
      if (!VALID_THEMES[name]) { name = 'eink'; }
      currentTheme = name;
      var legacyTheme = name === 'escuro' ? 'escuro' : 'claro';
      if (document.body) {
        document.body.setAttribute('data-esc-theme', name);
        document.body.setAttribute('data-theme', legacyTheme);
      }
      var meta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
      if (meta) {
        meta.setAttribute('content', name === 'escuro' ? '#1f2420' : (name === 'eink' ? '#c4cfc2' : (name === 'papel' ? '#f4efe6' : '#f8f8f6')));
      }
      var btns = document.querySelectorAll ? document.querySelectorAll('[data-esc-theme-choice]') : [];
      var i;
      for (i = 0; i < btns.length; i += 1) {
        var val = btns[i].getAttribute('data-esc-theme-choice');
        btns[i].setAttribute('aria-pressed', val === name ? 'true' : 'false');
      }
      var lightBtn = document.getElementById && document.getElementById('theme-light');
      var darkBtn = document.getElementById && document.getElementById('theme-dark');
      if (lightBtn) { lightBtn.setAttribute('aria-pressed', legacyTheme === 'claro' ? 'true' : 'false'); }
      if (darkBtn) { darkBtn.setAttribute('aria-pressed', legacyTheme === 'escuro' ? 'true' : 'false'); }

      if (persistPref !== false && storage) {
        try {
          storage.setItem(THEME_KEY, name);
          storage.setItem('escrevaral.astra.theme', legacyTheme);
        } catch (ignore) {}
      }
      // Sincroniza tema com iframe da Academia se aberto
      try {
        var frame = document.querySelector && document.querySelector('iframe.esc-academy-frame');
        if (frame && frame.contentWindow && frame.contentWindow.postMessage) {
          frame.contentWindow.postMessage({ channel: 'escrevaral-theme', theme: name, dark: name === 'escuro' }, '*');
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
      if (btn) { btn.setAttribute('aria-pressed', comfortable ? 'true' : 'false'); }
      if (persistPref !== false && storage) {
        try { storage.setItem(READING_KEY, comfortable ? 'true' : 'false'); } catch (ignore) {}
      }
    }

    function bindControls() {
      var btns = document.querySelectorAll ? document.querySelectorAll('[data-esc-theme-choice]') : [];
      var i;
      for (i = 0; i < btns.length; i += 1) {
        (function (b) {
          on(b, 'click', function () {
            applyTheme(b.getAttribute('data-esc-theme-choice'), true);
          });
        }(btns[i]));
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
      var themeCycle = document.getElementById && document.getElementById('esc-theme-cycle');
      if (themeCycle) {
        on(themeCycle, 'click', function () {
          var order = ['eink', 'papel', 'claro', 'escuro'];
          var idx = order.indexOf(currentTheme);
          var next = order[(idx + 1) % order.length];
          applyTheme(next, true);
          themeCycle.title = 'Tema atual: ' + LABELS[next] + ' (clique para alternar)';
        });
      }
      on(document, 'keydown', function (ev) {
        // Alt+Shift+N: nova nota com piscar E-Ink
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
      getTheme: function () { return currentTheme; },
      setComfortable: function (v) { applyReading(v, true); },
      isComfortable: function () { return comfortable; },
      flash: flashEink,
      LABELS: LABELS
    };
  };
}(typeof window !== 'undefined' ? window : this));
