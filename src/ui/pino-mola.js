/* Fio Dourado / Pino-Mola (Spring Jog-Shuttle) — marca registrada de rolagem elástica por gesto (ES5, 0 dependências). */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var MAX_DRAG = 28;
  var MAX_GESTURE = 18;
  var DEAD_ZONE = 3;

  function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  }

  function hasOverflow(scrollHeight, clientHeight) {
    return (Number(scrollHeight) || 0) > (Number(clientHeight) || 0) + 4;
  }

  /* Curva quadrática suave: puxar pouco rola devagarinho; puxar até o limite corre rápido. */
  function velocityFromOffset(offsetPx) {
    var d = clamp(Number(offsetPx) || 0, -MAX_DRAG, MAX_DRAG);
    var mag = Math.abs(d);
    if (mag <= DEAD_ZONE) { return 0; }
    var norm = (mag - DEAD_ZONE) / (MAX_DRAG - DEAD_ZONE);
    var pxPerFrame = (1.6 + norm * norm * 24);
    return d > 0 ? pxPerFrame : -pxPerFrame;
  }

  /* Deflexão visual do nó dourado ao receber rolagem passiva (rodinha/touch) antes de voltar ao centro. */
  function gestureDeflection(deltaScroll) {
    var d = Number(deltaScroll) || 0;
    if (!d) { return 0; }
    var mag = Math.min(MAX_GESTURE, 5 + Math.sqrt(Math.abs(d)) * 1.45);
    return d > 0 ? Math.round(mag) : -Math.round(mag);
  }

  function progressLabel(scrollTop, scrollHeight, clientHeight) {
    var maxScroll = Math.max(0, (Number(scrollHeight) || 0) - (Number(clientHeight) || 0));
    if (maxScroll <= 0) { return ''; }
    var top = clamp(Number(scrollTop) || 0, 0, maxScroll);
    if (top <= 2) { return 'Topo'; }
    if (top >= maxScroll - 2) { return 'Fim'; }
    return Math.round((top / maxScroll) * 100) + '%';
  }

  root.Escr.pinoMolaCore = {
    MAX_DRAG: MAX_DRAG,
    MAX_GESTURE: MAX_GESTURE,
    hasOverflow: hasOverflow,
    velocityFromOffset: velocityFromOffset,
    gestureDeflection: gestureDeflection,
    progressLabel: progressLabel
  };

  var instances = [];
  var floatingLayer = null;
  var watching = false;
  var refreshTimer = null;

  var UNIVERSAL_SELECTORS = [
    '#navigation .esc-nav-scroll',
    '#esc-sonnet-panel',
    '#esc-song-panel',
    '#desk-inspector',
    '#mesa',
    '#acervo',
    '#oficina',
    '#sobre',
    '#usos-lingua',
    '#lineage-panel',
    '#timeline-list',
    '#start-menu',
    '#esc-academy-overlay .esc-academy-groups',
    '#esc-cartorio-overlay .cart-scroll',
    '#esc-print-controls',
    '#esc-print-preview-wrap',
    '#esc-template-modal .esc-template-body'
  ];

  function ensureFloatingLayer() {
    if (typeof document === 'undefined' || !document.body) { return null; }
    if (floatingLayer && document.body.contains(floatingLayer)) { return floatingLayer; }
    floatingLayer = document.getElementById('esc-pino-floating-layer');
    if (!floatingLayer) {
      floatingLayer = document.createElement('div');
      floatingLayer.id = 'esc-pino-floating-layer';
      floatingLayer.className = 'esc-pino-floating-layer';
      floatingLayer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(floatingLayer);
    }
    return floatingLayer;
  }

  function isWarmSurface(el) {
    if (!el || !el.closest) { return false; }
    return !!(
      el.closest('#esc-reader-overlay') ||
      el.closest('#esc-academy-overlay') ||
      el.closest('#esc-cartorio-overlay') ||
      el.closest('#esc-print-overlay') ||
      el.closest('#oficina') ||
      el.closest('#usos-lingua')
    );
  }

  function buildRailMarkup() {
    return (
      '<button type="button" class="esc-pino-dot is-up" tabindex="-1" title="Subir um passo">' +
        '<svg class="esc-pino-tip-svg" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.8 L10.2 6 L6 10.2 L1.8 6 Z"/></svg>' +
      '</button>' +
      '<div class="esc-pino-track">' +
        '<svg class="esc-pino-thread-svg" viewBox="0 0 28 84" preserveAspectRatio="none" aria-hidden="true">' +
          '<line class="esc-pino-line" x1="14" y1="2" x2="14" y2="82"/>' +
          '<line class="esc-pino-tick" x1="10.5" y1="42" x2="17.5" y2="42"/>' +
        '</svg>' +
        '<div class="esc-pino-handle" title="Arraste para cima ou para baixo para rolar — solte para voltar ao centro">' +
          '<svg class="esc-pino-node-svg" viewBox="0 0 32 32" aria-hidden="true">' +
            '<circle class="esc-pino-arc-outer" cx="16" cy="16" r="13.2"/>' +
            '<circle class="esc-pino-arc-inner" cx="16" cy="16" r="9.0"/>' +
            '<path class="esc-pino-rays" d="M16 1.5 V4.8 M16 27.2 V30.5 M1.5 16 H4.8 M27.2 16 H30.5"/>' +
            '<circle class="esc-pino-ring" cx="16" cy="16" r="5.2"/>' +
            '<path class="esc-pino-core" d="M16 12.2 L19.8 16 L16 19.8 L12.2 16 Z"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="esc-pino-dot is-down" tabindex="-1" title="Descer um passo">' +
        '<svg class="esc-pino-tip-svg" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.8 L10.2 6 L6 10.2 L1.8 6 Z"/></svg>' +
      '</button>' +
      '<span class="esc-pino-readout" hidden></span>'
    );
  }

  function attach(scrollEl, opts) {
    if (!scrollEl || typeof document === 'undefined') { return null; }
    if (scrollEl.getAttribute && scrollEl.getAttribute('data-pino-attached') === 'true') { return null; }
    var cfg = opts && typeof opts === 'object' ? opts : {};
    var isFloating = !cfg.hostEl || !!cfg.floating;
    var hostEl = isFloating ? ensureFloatingLayer() : cfg.hostEl;
    if (!hostEl) { return null; }

    scrollEl.setAttribute('data-pino-attached', 'true');
    if (scrollEl.classList) { scrollEl.classList.add('esc-pino-scroller'); }

    if (!isFloating) {
      /* Garante posicionamento relativo no host sem quebrar position:fixed/absolute existentes */
      try {
        var cs = root.getComputedStyle ? root.getComputedStyle(hostEl) : null;
        if (cs && cs.position === 'static' && hostEl.style) {
          hostEl.style.position = 'relative';
        }
      } catch (ignore) {}
    }

    var rail = document.createElement('div');
    var cls = 'esc-pino-rail' + (cfg.variant ? (' is-' + cfg.variant) : '');
    if (isFloating) { cls += ' is-floating'; }
    if (cfg.warm || isWarmSurface(scrollEl)) { cls += ' is-warm'; }
    rail.className = cls;
    rail.setAttribute('aria-hidden', 'true');
    rail.hidden = true;
    rail.innerHTML = buildRailMarkup();

    hostEl.appendChild(rail);

    var handle = rail.querySelector('.esc-pino-handle');
    var readout = rail.querySelector('.esc-pino-readout');
    var upBtn = rail.querySelector('.esc-pino-dot.is-up');
    var downBtn = rail.querySelector('.esc-pino-dot.is-down');

    var lastScrollTop = scrollEl.scrollTop || 0;
    var springTimer = null;
    var fadeTimer = null;
    var dragging = false;
    var dragStartY = 0;
    var dragOffset = 0;
    var rafId = 0;
    var dead = false;

    function setHandleY(y, instant) {
      if (!handle || !handle.style) { return; }
      if (handle.classList) {
        handle.classList.toggle('is-dragging', !!instant);
      }
      handle.style.transform = 'translate3d(0,' + Math.round(y) + 'px,0)';
    }

    function showReadout() {
      if (!readout) { return; }
      var lbl = progressLabel(scrollEl.scrollTop, scrollEl.scrollHeight, scrollEl.clientHeight);
      if (!lbl) { readout.hidden = true; return; }
      readout.textContent = lbl;
      readout.hidden = false;
      if (rail.classList) { rail.classList.add('is-active'); }
      root.clearTimeout(fadeTimer);
      fadeTimer = root.setTimeout(function () {
        if (!dragging) {
          readout.hidden = true;
          if (rail.classList) { rail.classList.remove('is-active'); }
        }
      }, 950);
    }

    function isElementVisible(el) {
      if (!el || el.hidden) { return false; }
      if (document.body && !document.body.contains(el)) { return false; }
      if (el.getBoundingClientRect) {
        var r = el.getBoundingClientRect();
        if (r.width < 36 || r.height < 64) { return false; }
        var vw = root.innerWidth || 1280;
        var vh = root.innerHeight || 800;
        if (r.bottom <= 4 || r.top >= vh - 4 || r.right <= 4 || r.left >= vw - 4) { return false; }
      }
      try {
        var st = root.getComputedStyle ? root.getComputedStyle(el) : null;
        if (st && (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0')) { return false; }
      } catch (ignore) {}
      return true;
    }

    function syncVisibility() {
      if (dead) { return; }
      if (document.body && !document.body.contains(scrollEl)) {
        inst.destroy();
        return;
      }
      var visible = isElementVisible(scrollEl);
      var canScroll = visible && hasOverflow(scrollEl.scrollHeight, scrollEl.clientHeight);
      if (canScroll && isFloating && scrollEl.getBoundingClientRect) {
        var r = scrollEl.getBoundingClientRect();
        var vw = root.innerWidth || 1280;
        var vh = root.innerHeight || 800;
        var visTop = Math.max(8, r.top);
        var visBot = Math.min(vh - 8, r.bottom);
        if (visBot - visTop < 72) {
          canScroll = false;
        } else {
          var midY = Math.round((visTop + visBot) / 2);
          var leftX = Math.round(Math.min(vw - 28, r.right - 26));
          rail.style.left = Math.max(4, leftX) + 'px';
          rail.style.top = midY + 'px';
          rail.style.right = 'auto';
        }
      }
      rail.hidden = !canScroll;
      if (!canScroll && dragging) { stopDrag(); }
    }

    function onScroll() {
      if (dead) { return; }
      syncVisibility();
      var cur = scrollEl.scrollTop || 0;
      var delta = cur - lastScrollTop;
      lastScrollTop = cur;
      if (rail.hidden) { return; }
      showReadout();
      if (dragging || !delta) { return; }
      var defl = gestureDeflection(delta);
      setHandleY(defl, false);
      root.clearTimeout(springTimer);
      springTimer = root.setTimeout(function () {
        if (!dragging) { setHandleY(0, false); }
      }, 170);
    }

    function tickDrag() {
      if (!dragging || dead) { rafId = 0; return; }
      var v = velocityFromOffset(dragOffset);
      if (v) {
        var maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        var nextTop = clamp((scrollEl.scrollTop || 0) + v, 0, maxScroll);
        scrollEl.scrollTop = nextTop;
        lastScrollTop = nextTop;
        showReadout();
      }
      rafId = root.requestAnimationFrame ? root.requestAnimationFrame(tickDrag) : root.setTimeout(tickDrag, 16);
    }

    function clientYOf(ev) {
      if (ev.touches && ev.touches.length) { return ev.touches[0].clientY; }
      return typeof ev.clientY === 'number' ? ev.clientY : 0;
    }

    function onDragMove(ev) {
      if (!dragging) { return; }
      if (ev.preventDefault) { ev.preventDefault(); }
      dragOffset = clamp(clientYOf(ev) - dragStartY, -MAX_DRAG, MAX_DRAG);
      setHandleY(dragOffset, true);
    }

    function stopDrag() {
      if (!dragging) { return; }
      dragging = false;
      dragOffset = 0;
      if (rafId) {
        if (root.cancelAnimationFrame) { root.cancelAnimationFrame(rafId); }
        else { root.clearTimeout(rafId); }
        rafId = 0;
      }
      setHandleY(0, false);
      document.removeEventListener('mousemove', onDragMove, false);
      document.removeEventListener('mouseup', stopDrag, false);
      document.removeEventListener('touchmove', onDragMove, false);
      document.removeEventListener('touchend', stopDrag, false);
      document.removeEventListener('touchcancel', stopDrag, false);
      showReadout();
    }

    function startDrag(ev) {
      if (dead || rail.hidden) { return; }
      if (ev.preventDefault) { ev.preventDefault(); }
      if (ev.stopPropagation) { ev.stopPropagation(); }
      dragging = true;
      dragStartY = clientYOf(ev);
      dragOffset = 0;
      root.clearTimeout(springTimer);
      setHandleY(0, true);
      if (rail.classList) { rail.classList.add('is-active'); }
      document.addEventListener('mousemove', onDragMove, false);
      document.addEventListener('mouseup', stopDrag, false);
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('touchend', stopDrag, false);
      document.addEventListener('touchcancel', stopDrag, false);
      if (!rafId) {
        rafId = root.requestAnimationFrame ? root.requestAnimationFrame(tickDrag) : root.setTimeout(tickDrag, 16);
      }
    }

    function stepPage(dir) {
      if (dead || rail.hidden) { return; }
      var delta = Math.max(96, Math.round((scrollEl.clientHeight || 300) * 0.55));
      var maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      scrollEl.scrollTop = clamp((scrollEl.scrollTop || 0) + dir * delta, 0, maxScroll);
      setHandleY(dir * 14, false);
      root.clearTimeout(springTimer);
      springTimer = root.setTimeout(function () { if (!dragging) { setHandleY(0, false); } }, 180);
      showReadout();
    }

    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    scrollEl.addEventListener('input', syncVisibility, false);
    handle.addEventListener('mousedown', startDrag, false);
    handle.addEventListener('touchstart', startDrag, { passive: false });
    upBtn.addEventListener('click', function () { stepPage(-1); }, false);
    downBtn.addEventListener('click', function () { stepPage(1); }, false);

    var ro = null;
    if (typeof root.ResizeObserver === 'function') {
      try {
        ro = new root.ResizeObserver(syncVisibility);
        ro.observe(scrollEl);
      } catch (ignore) {}
    }

    var inst = {
      el: scrollEl,
      refresh: syncVisibility,
      destroy: function () {
        if (dead) { return; }
        dead = true;
        stopDrag();
        root.clearTimeout(springTimer);
        root.clearTimeout(fadeTimer);
        if (ro && ro.disconnect) { ro.disconnect(); }
        scrollEl.removeEventListener('scroll', onScroll, false);
        scrollEl.removeEventListener('input', syncVisibility, false);
        if (rail.parentNode) { rail.parentNode.removeChild(rail); }
        scrollEl.removeAttribute('data-pino-attached');
        var idx = instances.indexOf(inst);
        if (idx >= 0) { instances.splice(idx, 1); }
      }
    };
    instances.push(inst);
    root.setTimeout(syncVisibility, 60);
    return inst;
  }

  function scanKnownScrollers() {
    if (typeof document === 'undefined' || !document.querySelectorAll) { return; }
    var i, j, list;
    for (i = 0; i < UNIVERSAL_SELECTORS.length; i += 1) {
      list = document.querySelectorAll(UNIVERSAL_SELECTORS[i]);
      for (j = 0; j < list.length; j += 1) {
        if (list[j] && list[j].getAttribute('data-pino-attached') !== 'true') {
          attach(list[j], { floating: true });
        }
      }
    }
  }

  function refreshAll() {
    scanKnownScrollers();
    for (var i = instances.length - 1; i >= 0; i -= 1) {
      if (instances[i]) { instances[i].refresh(); }
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) { return; }
    refreshTimer = root.setTimeout(function () {
      refreshTimer = null;
      refreshAll();
    }, 80);
  }

  function watchAll() {
    if (watching || typeof document === 'undefined') { return; }
    watching = true;
    scanKnownScrollers();

    /* Qualquer container rolável acionado no app ganha o Fio Dourado na hora */
    document.addEventListener('scroll', function (ev) {
      var target = ev && ev.target;
      if (!target || target === document || target === document.documentElement || target === document.body) { return; }
      if (!target.getAttribute || target.getAttribute('data-pino-attached') === 'true') { return; }
      if (target.closest && target.closest('#esc-pino-floating-layer')) { return; }
      if (!hasOverflow(target.scrollHeight, target.clientHeight)) { return; }
      try {
        var st = root.getComputedStyle ? root.getComputedStyle(target) : null;
        if (st && (st.overflowY === 'auto' || st.overflowY === 'scroll')) {
          attach(target, { floating: true });
        }
      } catch (ignore) {}
    }, true);

    if (typeof root.MutationObserver === 'function' && document.body) {
      try {
        var mo = new root.MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i += 1) {
            var t = mutations[i].target;
            if (t && t.id === 'esc-pino-floating-layer') { continue; }
            if (t && t.closest && t.closest('#esc-pino-floating-layer')) { continue; }
            scheduleRefresh();
            return;
          }
        });
        mo.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['hidden', 'data-view', 'data-panel', 'data-immersion', 'data-theme']
        });
      } catch (ignore) {}
    }
  }

  if (root.addEventListener) {
    root.addEventListener('resize', scheduleRefresh, false);
  }

  root.Escr.pinoMola = {
    attach: attach,
    refreshAll: refreshAll,
    watchAll: watchAll
  };
}(typeof window !== 'undefined' ? window : this));
