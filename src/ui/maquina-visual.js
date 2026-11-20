(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var RATIO = 242 / 1222;
  var PLATEN = 0.60;
  var ROLLER_TOP = 61 / 242;
  var MIN_VISIBLE = 0.62;
  var MAX_SHARE = 0.38;
  var STRIKE = { lift: 2.2, ms: 115 };
  var CARRIAGE = { lift: 5.0, ms: 180 };
  var IDLE_TIMEOUT_MS = 135;
  var PREF_KEY = 'escrevaral.typewriter.machine.v1';
  var FRAME_FILES = [
    'typewriter-machine-idle',
    'typewriter-machine-strike-1',
    'typewriter-machine-strike-2',
    'typewriter-machine-strike-3',
    'typewriter-machine-strike-4'
  ];
  var WEBP_PROBE = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' ;
  var webpSupport = null;

  function makeFallbackSvg(idx) {
    var spark = idx > 0
      ? '<g stroke="#242d23" stroke-width="2.5" stroke-linecap="round"><line x1="611" y1="32" x2="' + (592 + idx * 9) + '" y2="14"/><line x1="611" y1="32" x2="' + (630 - idx * 7) + '" y2="16"/></g>'
      : '';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1222 242">' +
      '<rect x="64" y="61" width="1094" height="58" rx="18" fill="#242d23"/>' +
      '<rect x="18" y="68" width="54" height="44" rx="8" fill="#182018"/>' +
      '<rect x="1150" y="68" width="54" height="44" rx="8" fill="#182018"/>' +
      '<rect x="206" y="54" width="810" height="10" rx="3" fill="#4f5c4e"/>' +
      '<rect x="0" y="114" width="1222" height="128" fill="#2c352b"/>' +
      '<rect x="214" y="102" width="794" height="16" rx="4" fill="#182018"/>' +
      '<polygon points="592,102 630,102 618,64 604,64" fill="#141914"/>' +
      spark + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function isPortableDoc() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        var meta = document.querySelector('meta[name="distribution-mode"]');
        if (meta && meta.getAttribute('content') === 'portable') { return true; }
      }
      if (typeof location !== 'undefined' && location.protocol === 'file:') { return true; }
    } catch (ignore) {}
    return false;
  }

  function frameUrl(idx, ext, baseUrl) {
    var base = baseUrl || 'assets/typewriter/';
    var file = FRAME_FILES[idx] || FRAME_FILES[0];
    return base + file + '.' + (ext || 'webp');
  }

  function detectWebp(done) {
    if (webpSupport !== null) { done(webpSupport); return; }
    if (typeof Image === 'undefined') { webpSupport = true; done(true); return; }
    var probe = new Image();
    probe.onload = function () {
      webpSupport = !!(probe.width > 0 && probe.height > 0);
      done(webpSupport);
    };
    probe.onerror = function () {
      webpSupport = false;
      done(false);
    };
    probe.src = WEBP_PROBE;
  }

  function pickNextStrike(lastIdx) {
    var pool = [1, 2, 3, 4].filter(function (i) { return i !== lastIdx; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function computeGeometry(columnWidth, columnLeft, vw, vh, line) {
    if (!columnWidth || !vh) { return null; }
    var width = Math.min(columnWidth / PLATEN, vw);
    var height = width * RATIO;
    var baseSink = height * (6 / 242);
    var shown = Math.min(height, Math.max(vh * MAX_SHARE, height * MIN_VISIBLE));
    var center = columnLeft + columnWidth / 2;
    var left = center - width / 2;
    var bottom = shown - height - baseSink;
    var rollerTop = vh - shown + baseSink + height * ROLLER_TOP;
    var anchorY = rollerTop - line * 2.9;
    return {
      width: width,
      height: height,
      left: left,
      bottom: bottom,
      rollerTop: rollerTop,
      anchorY: anchorY,
      topInset: Math.max(0, anchorY - line / 2)
    };
  }

  root.Escr.machineCore = {
    RATIO: RATIO,
    PLATEN: PLATEN,
    ROLLER_TOP: ROLLER_TOP,
    IDLE_TIMEOUT_MS: IDLE_TIMEOUT_MS,
    STRIKE: STRIKE,
    CARRIAGE: CARRIAGE,
    FRAME_FILES: FRAME_FILES,
    frameUrl: frameUrl,
    makeFallbackSvg: makeFallbackSvg,
    pickNextStrike: pickNextStrike,
    computeGeometry: computeGeometry
  };

  root.Escr.mountVisualMachine = function (opts) {
    var storage = opts.storage;
    var columnEl = opts.columnEl;
    var baseUrl = opts.baseUrl || 'assets/typewriter/';
    var wrap = null;
    var frames = [];
    var framesLoaded = false;
    var isEnabled = true;
    var activeFocus = false;
    var visible = false;
    var anchorY = null;
    var activeIndex = 0;
    var lastStrikeIndex = 0;
    var idleTimer = null;
    var bounceTimer = null;
    var reflowTimer = null;
    var animObj = null;

    try {
      if (storage) {
        var raw = storage.getItem(PREF_KEY);
        if (raw !== null) { isEnabled = raw === 'true'; }
      }
    } catch (ignore) {}

    function assignFrameSources(ext) {
      var i, portable = isPortableDoc();
      for (i = 0; i < frames.length; i += 1) {
        (function (img, idx) {
          var fallbackSrc = makeFallbackSvg(idx);
          if (portable) {
            img.src = fallbackSrc;
            return;
          }
          var triedPng = ext === 'png';
          img.onerror = function () {
            if (!triedPng) {
              triedPng = true;
              img.src = frameUrl(idx, 'png', baseUrl);
            } else {
              img.onerror = null;
              img.src = fallbackSrc;
            }
          };
          img.src = frameUrl(idx, ext, baseUrl);
        }(frames[i], i));
      }
    }

    function buildWrap() {
      if (wrap) { return wrap; }
      wrap = document.createElement('div');
      wrap.id = 'esc-typewriter-visual';
      wrap.className = 'esc-machine';
      wrap.setAttribute('aria-hidden', 'true');
      var i;
      for (i = 0; i < FRAME_FILES.length; i += 1) {
        var img = document.createElement('img');
        img.className = 'esc-machine-frame' + (i === 0 ? ' esc-machine-active' : '');
        img.alt = '';
        img.draggable = false;
        wrap.appendChild(img);
        frames.push(img);
      }
      document.body.appendChild(wrap);
      if (!framesLoaded) {
        framesLoaded = true;
        detectWebp(function (ok) {
          assignFrameSources(ok ? 'webp' : 'png');
        });
      }
      return wrap;
    }

    function setActiveFrame(idx) {
      if (!frames.length || idx === activeIndex) { return; }
      if (frames[activeIndex]) { frames[activeIndex].classList.remove('esc-machine-active'); }
      if (frames[idx]) { frames[idx].classList.add('esc-machine-active'); }
      activeIndex = idx;
    }

    function reducedMotion() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) {
        return false;
      }
    }

    function layout() {
      var show = isEnabled && activeFocus && columnEl && document.body;
      if (!show) {
        visible = false;
        anchorY = null;
        if (document.body) {
          document.body.removeAttribute('data-esc-machine');
          if (document.body.style && document.body.style.removeProperty) {
            document.body.style.removeProperty('--esc-machine-top');
          }
        }
        return null;
      }
      buildWrap();
      var rect = columnEl.getBoundingClientRect ? columnEl.getBoundingClientRect() : { width: 700, left: 100 };
      var vh = window.innerHeight || 720;
      var vw = window.innerWidth || 1280;
      var style = window.getComputedStyle ? window.getComputedStyle(columnEl) : null;
      var fontSize = style ? (parseFloat(style.fontSize) || 21) : 21;
      var line = style ? (parseFloat(style.lineHeight) || fontSize * 1.7) : fontSize * 1.7;
      var geom = computeGeometry(rect.width || 700, rect.left || 0, vw, vh, line);
      if (!geom) { return null; }

      wrap.style.width = geom.width.toFixed(2) + 'px';
      wrap.style.height = geom.height.toFixed(2) + 'px';
      wrap.style.left = geom.left.toFixed(2) + 'px';
      wrap.style.bottom = geom.bottom.toFixed(2) + 'px';

      anchorY = geom.anchorY;
      visible = true;
      document.body.setAttribute('data-esc-machine', 'on');
      if (document.body.style && document.body.style.setProperty) {
        document.body.style.setProperty('--esc-machine-top', geom.topInset.toFixed(1) + 'px');
      }
      return anchorY;
    }

    function strike(kind) {
      if (!visible || !wrap) { return; }
      if (kind === 'return') {
        window.clearTimeout(idleTimer);
        idleTimer = null;
        setActiveFrame(0);
      } else {
        lastStrikeIndex = pickNextStrike(lastStrikeIndex);
        setActiveFrame(lastStrikeIndex);
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () {
          setActiveFrame(0);
        }, IDLE_TIMEOUT_MS);
      }

      if (reducedMotion()) { return; }
      var spec = kind === 'return' ? CARRIAGE : STRIKE;
      if (typeof wrap.animate === 'function') {
        try { if (animObj) { animObj.cancel(); } } catch (ignore) {}
        try {
          animObj = wrap.animate([
            { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
            { transform: 'translate3d(0,' + spec.lift + 'px,0)', offset: 0.38, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' },
            { transform: 'translate3d(0,0,0)' }
          ], { duration: spec.ms });
          return;
        } catch (ignore) {}
      }
      window.clearTimeout(bounceTimer);
      wrap.style.webkitTransform = 'translate3d(0,' + spec.lift + 'px,0)';
      wrap.style.transform = 'translate3d(0,' + spec.lift + 'px,0)';
      bounceTimer = window.setTimeout(function () {
        if (wrap) {
          wrap.style.webkitTransform = 'translate3d(0,0,0)';
          wrap.style.transform = 'translate3d(0,0,0)';
        }
      }, Math.round(spec.ms * 0.6));
    }

    if (root.Escr.machineSound && root.Escr.machineSound.onStrike) {
      root.Escr.machineSound.onStrike(strike);
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', layout, false);
    }

    return {
      setFocusActive: function (on) {
        activeFocus = !!on;
        if (reflowTimer) { clearTimeout(reflowTimer); reflowTimer = null; }
        var res = layout();
        if (activeFocus && typeof setTimeout === "function") { reflowTimer = setTimeout(function () { reflowTimer = null; layout(); }, 40); }
        return res;
      },
      setEnabled: function (on) {
        isEnabled = !!on;
        try {
          if (storage) { storage.setItem(PREF_KEY, isEnabled ? 'true' : 'false'); }
        } catch (ignore) {}
        return layout();
      },
      isEnabled: function () { return isEnabled; },
      anchorY: function () { return anchorY; },
      layout: layout,
      strike: strike,
      activeFrame: function () { return activeIndex; }
    };
  };
}(typeof window !== 'undefined' ? window : this));
