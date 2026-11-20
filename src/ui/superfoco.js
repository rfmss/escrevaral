/* Superfoco automático (2 palavras + 30 s), barra dedicada e fluxo ancorado no rolo — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var AUTO_KEY = 'escrevaral.writing.automatic.v1';
  var IDLE_MS = 30000;
  var WORD_RE = /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F]/;
  var JOIN_RE = /['\u2019\-]/;

  function on(el, ev, fn, capture) {
    if (el && el.addEventListener) { el.addEventListener(ev, fn, !!capture); }
  }
  function off(el, ev, fn, capture) {
    if (el && el.removeEventListener) { el.removeEventListener(ev, fn, !!capture); }
  }

  function svgEl(paths) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '18');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var i;
    for (i = 0; i < paths.length; i += 1) {
      var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
      p.setAttribute('d', paths[i]);
      svg.appendChild(p);
    }
    return svg;
  }

  var ICON_SOUND_ON = [
    'M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z',
    'M192 106.8a32 32 0 0 1 0 42.4',
    'M218.6 80a72 72 0 0 1 0 96'
  ];
  var ICON_SOUND_OFF = [
    'M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z',
    'M240 104l-48 48',
    'M192 104l48 48'
  ];
  var ICON_MACHINE = [
    'M48 112V64a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8v48',
    'M24 112h208a8 8 0 0 1 8 8v72a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8v-72a8 8 0 0 1 8-8Z',
    'M64 148h16',
    'M108 148h16',
    'M152 148h16',
    'M80 176h96'
  ];
  var ICON_FULLSCREEN = [
    'M48 96V48h48',
    'M208 96V48h-48',
    'M48 160v48h48',
    'M208 160v48h-48'
  ];

  function createAutomaticPreference(storage) {
    var enabled = true;
    var listeners = [];
    try {
      if (storage) {
        var raw = storage.getItem(AUTO_KEY);
        if (raw === 'false' || raw === '0' || raw === 'off') { enabled = false; }
        else if (raw === 'true' || raw === '1' || raw === 'on') { enabled = true; }
      }
    } catch (ignore) {}

    return {
      get: function () { return enabled; },
      set: function (value) {
        enabled = !!value;
        var saved = true;
        try {
          if (storage) { storage.setItem(AUTO_KEY, enabled ? 'true' : 'false'); }
        } catch (ignore) { saved = false; }
        var i;
        for (i = 0; i < listeners.length; i += 1) {
          try { listeners[i](enabled); } catch (ignore) {}
        }
        return saved;
      },
      subscribe: function (fn) {
        if (typeof fn === 'function') { listeners.push(fn); }
        return function () {
          var idx = listeners.indexOf(fn);
          if (idx >= 0) { listeners.splice(idx, 1); }
        };
      }
    };
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
  }

  function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        if (document.exitFullscreen) { document.exitFullscreen(); }
        else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
      } else {
        var el = document.documentElement;
        if (el.requestFullscreen) { el.requestFullscreen(); }
        else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); }
        else if (el.mozRequestFullScreen) { el.mozRequestFullScreen(); }
      }
    } catch (ignore) {}
  }

  root.Escr.superfocoCore = {
    AUTO_KEY: AUTO_KEY,
    IDLE_MS: IDLE_MS,
    createAutomaticPreference: createAutomaticPreference,
    toggleFullscreen: toggleFullscreen,
    isFullscreen: isFullscreen
  };

  root.Escr.mountSuperfoco = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var manuscriptEl = opts.manuscriptEl || null;
    var richEl = opts.richEl || null;
    var clock = opts.clock || (typeof window !== 'undefined' ? window : { setTimeout: setTimeout, clearTimeout: clearTimeout });
    var getActive = opts.isActive || function () { return false; };
    var onOpen = opts.onOpen || function () {};
    var onClose = opts.onClose || function () {};
    var onToggleFace = opts.onToggleFace || function () {};
    var getFace = opts.getFace || function () { return 'maquina'; };
    var onToggleMachine = opts.onToggleMachine || function () {};
    var getMachineEnabled = opts.getMachineEnabled || function () { return true; };
    var getMachineAnchor = opts.getMachineAnchor || function () { return null; };
    var isSonnetActive = opts.isSonnetActive || function () { return false; };
    var isEditable = opts.isEditable || function () { return true; };

    var pref = createAutomaticPreference(storage);
    var idleTimer = null;
    var words = 0;
    var inWord = false;
    var suppressed = false;
    var composing = false;
    var openedAutomatically = false;
    var disposed = false;

    var barEl = null;
    var backBtn = null;
    var faceBtn = null;
    var soundBtn = null;
    var machineBtn = null;
    var idleNote = null;
    var fullBtn = null;
    var switchBtn = opts.switchBtn || (typeof document !== 'undefined' ? document.getElementById('esc-superfocus-auto-toggle') : null);

    function isConsultaOpen() {
      try {
        return !!(document.body && document.body.getAttribute('data-esc-consulta-open') === 'true');
      } catch (e) { return false; }
    }

    function clearIdle() {
      if (idleTimer !== null) {
        clock.clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function resetCounter() {
      words = 0;
      inWord = false;
      suppressed = false;
    }

    function armIdle() {
      clearIdle();
      if (disposed || !getActive() || !openedAutomatically || !pref.get()) { return; }
      if (isConsultaOpen()) { return; }
      idleTimer = clock.setTimeout(function () {
        idleTimer = null;
        if (disposed || !getActive() || !openedAutomatically) { return; }
        if (composing || isConsultaOpen()) {
          armIdle();
          return;
        }
        openedAutomatically = false;
        resetCounter();
        onClose('idle');
      }, IDLE_MS);
    }

    function isTargetInEditor(target) {
      if (!target) { return false; }
      if (manuscriptEl && !manuscriptEl.hidden && target === manuscriptEl) {
        return !manuscriptEl.readOnly && !manuscriptEl.disabled;
      }
      if (richEl && !richEl.hidden && (target === richEl || (richEl.contains && richEl.contains(target)))) {
        return richEl.getAttribute('contenteditable') === 'true';
      }
      return false;
    }

    function feedText(data, target) {
      if (disposed || !data || !isEditable() || !isTargetInEditor(target)) { return; }
      if (!pref.get() || isConsultaOpen()) { return; }
      if (getActive()) {
        armIdle();
        return;
      }
      if (suppressed) { return; }
      var i, ch;
      for (i = 0; i < data.length; i += 1) {
        ch = data.charAt(i);
        if (WORD_RE.test(ch)) {
          if (!inWord) { words += 1; }
          inWord = true;
        } else if (!JOIN_RE.test(ch)) {
          inWord = false;
        }
        if (words >= 2) {
          suppressed = true;
          openedAutomatically = true;
          onOpen({ automatic: true });
          armIdle();
          syncBar();
          break;
        }
      }
    }

    function updateRichParagraphFocus() {
      if (!richEl || richEl.hidden || !getActive()) { return; }
      var children = richEl.children || [];
      var activeBlock = null;
      try {
        if (window.getSelection) {
          var sel = window.getSelection();
          if (sel && sel.rangeCount) {
            var node = sel.getRangeAt(0).startContainer;
            while (node && node !== richEl) {
              if (node.parentNode === richEl && node.nodeType === 1) {
                activeBlock = node;
                break;
              }
              node = node.parentNode;
            }
          }
        }
      } catch (ignore) {}
      var i;
      for (i = 0; i < children.length; i += 1) {
        if (children[i] === activeBlock) {
          children[i].setAttribute('data-esc-active-para', 'true');
        } else {
          children[i].removeAttribute('data-esc-active-para');
        }
      }
      if (activeBlock && activeBlock.getBoundingClientRect) {
        var anchor = getMachineAnchor();
        if (typeof anchor === 'number' && anchor > 60) {
          var rect = activeBlock.getBoundingClientRect();
          var diff = (rect.top + rect.height / 2) - anchor;
          if (Math.abs(diff) > 12 && richEl.scrollTop !== undefined) {
            richEl.scrollTop = Math.max(0, richEl.scrollTop + diff);
          }
        }
      }
    }

    function updatePlainAnchor() {
      if (!manuscriptEl || manuscriptEl.hidden || !getActive()) { return; }
      var anchor = getMachineAnchor();
      if (typeof anchor !== 'number' || anchor <= 60) { return; }
      var pos = typeof manuscriptEl.selectionEnd === 'number' ? manuscriptEl.selectionEnd : 0;
      var before = manuscriptEl.value.slice(0, pos);
      var lineCount = before.split('\n').length - 1;
      var cs = window.getComputedStyle ? window.getComputedStyle(manuscriptEl) : null;
      var lh = cs ? (parseFloat(cs.lineHeight) || 35) : 35;
      var padTop = cs ? (parseFloat(cs.paddingTop) || 0) : 0;
      var targetTop = padTop + lineCount * lh - (anchor - 40);
      if (isFinite(targetTop) && targetTop >= 0) {
        manuscriptEl.scrollTop = targetTop;
      }
    }

    function syncFlow() {
      if (!getActive()) {
        if (richEl && richEl.children) {
          var i;
          for (i = 0; i < richEl.children.length; i += 1) {
            richEl.children[i].removeAttribute('data-esc-active-para');
          }
        }
        return;
      }
      if (richEl && !richEl.hidden) { updateRichParagraphFocus(); }
      else { updatePlainAnchor(); }
    }

    function syncSwitch() {
      if (!switchBtn) { return; }
      var onVal = pref.get();
      switchBtn.setAttribute('aria-checked', onVal ? 'true' : 'false');
      switchBtn.setAttribute('data-auto', onVal ? 'on' : 'off');
      var lbl = switchBtn.querySelector ? switchBtn.querySelector('.esc-switch-state') : null;
      if (lbl) { lbl.textContent = onVal ? 'ON' : 'OFF'; }
    }

    function buildBar() {
      if (barEl || typeof document === 'undefined' || !document.body) { return; }
      barEl = document.createElement('header');
      barEl.id = 'esc-writing-bar';
      barEl.className = 'esc-writing-bar';
      barEl.setAttribute('aria-label', 'Controles do Superfoco');
      barEl.hidden = true;

      var left = document.createElement('div');
      left.className = 'esc-writing-bar-group';

      backBtn = document.createElement('button');
      backBtn.id = 'esc-writing-back';
      backBtn.type = 'button';
      backBtn.className = 'esc-writing-btn esc-writing-back';
      backBtn.textContent = '\u2190 Voltar ao aplicativo \u00B7 Esc';
      on(backBtn, 'click', function () {
        openedAutomatically = false;
        clearIdle();
        resetCounter();
        onClose('manual');
      });
      left.appendChild(backBtn);

      faceBtn = document.createElement('button');
      faceBtn.id = 'esc-writing-face';
      faceBtn.type = 'button';
      faceBtn.className = 'esc-writing-btn';
      on(faceBtn, 'click', function () {
        onToggleFace();
        syncBar();
      });
      left.appendChild(faceBtn);

      var right = document.createElement('div');
      right.className = 'esc-writing-bar-group';

      idleNote = document.createElement('span');
      idleNote.className = 'esc-writing-idle-note';
      idleNote.textContent = 'Volta ap\u00F3s 30 s sem atividade';
      right.appendChild(idleNote);

      soundBtn = document.createElement('button');
      soundBtn.id = 'esc-writing-sound';
      soundBtn.type = 'button';
      soundBtn.className = 'esc-writing-icon-btn';
      soundBtn.title = 'Som da m\u00E1quina de escrever';
      soundBtn.setAttribute('aria-label', 'Som da m\u00E1quina de escrever');
      on(soundBtn, 'click', function () {
        if (root.Escr.machineSound) {
          root.Escr.machineSound.setEnabled(!root.Escr.machineSound.isEnabled(), storage, false);
        }
        syncBar();
      });
      right.appendChild(soundBtn);

      machineBtn = document.createElement('button');
      machineBtn.id = 'esc-writing-machine';
      machineBtn.type = 'button';
      machineBtn.className = 'esc-writing-icon-btn';
      machineBtn.title = 'Mostrar ou esconder m\u00E1quina de escrever';
      machineBtn.setAttribute('aria-label', 'Mostrar ou esconder m\u00E1quina de escrever');
      on(machineBtn, 'click', function () {
        onToggleMachine();
        syncBar();
        syncFlow();
      });
      right.appendChild(machineBtn);

      fullBtn = document.createElement('button');
      fullBtn.id = 'esc-writing-fullscreen';
      fullBtn.type = 'button';
      fullBtn.className = 'esc-writing-btn';
      fullBtn.title = 'Alternar tela cheia (F11)';
      on(fullBtn, 'click', function () {
        toggleFullscreen();
        syncBar();
      });
      right.appendChild(fullBtn);

      barEl.appendChild(left);
      barEl.appendChild(right);
      document.body.appendChild(barEl);
    }

    function syncBar() {
      var active = !!getActive();
      if (active) { buildBar(); }
      if (document.body) {
        if (active && isSonnetActive()) {
          document.body.setAttribute('data-esc-writing-sonnet', 'true');
        } else {
          document.body.removeAttribute('data-esc-writing-sonnet');
        }
      }
      if (!barEl) { return; }
      barEl.hidden = !active;
      if (!active) { return; }

      var face = getFace();
      if (faceBtn) {
        faceBtn.textContent = face === 'maquina' ? 'Letra: m\u00E1quina' : 'Letra: livro';
      }
      if (idleNote) {
        idleNote.hidden = !(openedAutomatically && pref.get());
      }
      if (soundBtn) {
        var soundOn = !!(root.Escr.machineSound && root.Escr.machineSound.isEnabled());
        soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        soundBtn.textContent = '';
        soundBtn.appendChild(svgEl(soundOn ? ICON_SOUND_ON : ICON_SOUND_OFF));
      }
      if (machineBtn) {
        var machOn = !!getMachineEnabled();
        machineBtn.setAttribute('aria-pressed', machOn ? 'true' : 'false');
        machineBtn.textContent = '';
        machineBtn.appendChild(svgEl(ICON_MACHINE));
      }
      if (fullBtn) {
        var fs = isFullscreen();
        fullBtn.setAttribute('aria-pressed', fs ? 'true' : 'false');
        fullBtn.textContent = '';
        fullBtn.appendChild(svgEl(ICON_FULLSCREEN));
        var sp = document.createElement('span');
        sp.textContent = fs ? 'Sair da tela cheia' : 'Tela cheia';
        fullBtn.appendChild(sp);
      }
    }

    function onInput(ev) {
      if (disposed) { return; }
      if (!isTargetInEditor(ev.target)) { return; }
      if (getActive()) { armIdle(); syncFlow(); }
      if (composing || ev.isComposing) { return; }
      var inputType = ev.inputType || '';
      if (inputType) {
        if (inputType === 'insertText') {
          var chunk = ev.data || '';
          if (chunk.length <= 3) { feedText(chunk, ev.target); } else { resetCounter(); }
        } else if (inputType === 'insertLineBreak' || inputType === 'insertParagraph') {
          inWord = false;
        } else if (inputType.indexOf('Paste') >= 0 || inputType.indexOf('history') === 0 || inputType.indexOf('delete') === 0) {
          resetCounter();
        }
      } else if (typeof ev.data === 'string' && ev.data.length === 1) {
        feedText(ev.data, ev.target);
      }
    }

    function onCompStart(ev) {
      if (isTargetInEditor(ev.target)) {
        composing = true;
        if (getActive()) { armIdle(); }
      }
    }
    function onCompEnd(ev) {
      if (isTargetInEditor(ev.target)) {
        composing = false;
        feedText(ev.data || '', ev.target);
        if (getActive()) { syncFlow(); }
      }
    }
    function onActivity() {
      if (getActive() && openedAutomatically) { armIdle(); }
    }
    function onKeyDown(ev) {
      if (getActive() && openedAutomatically) { armIdle(); }
      if (ev.keyCode === 122) { // F11
        ev.preventDefault();
        toggleFullscreen();
        syncBar();
        return;
      }
      if (!getActive() && isTargetInEditor(ev.target)) {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || (ev.keyCode >= 33 && ev.keyCode <= 40)) {
          resetCounter();
        }
      }
    }

    if (typeof document !== 'undefined') {
      on(document, 'input', onInput, true);
      on(document, 'compositionstart', onCompStart, true);
      on(document, 'compositionend', onCompEnd, true);
      on(document, 'keydown', onKeyDown, true);
      on(document, 'mousedown', onActivity, true);
      on(document, 'wheel', onActivity, true);
      on(document, 'selectionchange', syncFlow, false);
      on(document, 'fullscreenchange', syncBar, false);
      on(document, 'webkitfullscreenchange', syncBar, false);
    }

    if (switchBtn) {
      on(switchBtn, 'click', function () {
        pref.set(!pref.get());
        resetCounter();
        syncSwitch();
        syncBar();
      });
      syncSwitch();
    }
    if (root.Escr.machineSound && root.Escr.machineSound.subscribe) {
      root.Escr.machineSound.subscribe(syncBar);
    }

    return {
      preference: pref,
      syncBar: syncBar,
      syncFlow: syncFlow,
      notifyState: function (active, reason) {
        if (!active) {
          openedAutomatically = false;
          clearIdle();
          resetCounter();
        } else {
          if (reason === 'manual') { openedAutomatically = false; clearIdle(); }
          else if (reason === 'automatic') { openedAutomatically = true; armIdle(); }
        }
        syncBar();
        syncFlow();
      },
      resetDocument: function () {
        clearIdle();
        resetCounter();
        openedAutomatically = false;
        syncBar();
      },
      isAutomaticOpen: function () { return openedAutomatically; },
      destroy: function () {
        disposed = true;
        clearIdle();
        if (typeof document !== 'undefined') {
          off(document, 'input', onInput, true);
          off(document, 'compositionstart', onCompStart, true);
          off(document, 'compositionend', onCompEnd, true);
          off(document, 'keydown', onKeyDown, true);
          off(document, 'mousedown', onActivity, true);
          off(document, 'wheel', onActivity, true);
          off(document, 'selectionchange', syncFlow, false);
          off(document, 'fullscreenchange', syncBar, false);
          off(document, 'webkitfullscreenchange', syncBar, false);
        }
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));
