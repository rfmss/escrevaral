/* Pino-Mola (Spring Jog-Shuttle) — indicador e alavanca elástica de rolagem por gesto (ES5, 0 dependências). */
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

  /* Deflexão visual do pino ao receber rolagem passiva (rodinha/touch) antes de voltar ao centro. */
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

  function attach(scrollEl, opts) {
    if (!scrollEl || typeof document === 'undefined') { return null; }
    if (scrollEl.getAttribute && scrollEl.getAttribute('data-pino-attached') === 'true') { return null; }
    var cfg = opts && typeof opts === 'object' ? opts : {};
    var hostEl = cfg.hostEl || scrollEl.parentNode;
    if (!hostEl) { return null; }

    scrollEl.setAttribute('data-pino-attached', 'true');
    if (scrollEl.classList) { scrollEl.classList.add('esc-pino-scroller'); }

    /* Garante posicionamento relativo no host sem quebrar position:fixed/absolute existentes */
    try {
      var cs = root.getComputedStyle ? root.getComputedStyle(hostEl) : null;
      if (cs && cs.position === 'static' && hostEl.style) {
        hostEl.style.position = 'relative';
      }
    } catch (ignore) {}

    var rail = document.createElement('div');
    rail.className = 'esc-pino-rail' + (cfg.variant ? (' is-' + cfg.variant) : '');
    rail.setAttribute('aria-hidden', 'true');
    rail.hidden = true;
    rail.innerHTML =
      '<button type="button" class="esc-pino-dot is-up" tabindex="-1" title="Subir um passo">·</button>' +
      '<div class="esc-pino-track">' +
        '<div class="esc-pino-handle" title="Arraste para cima ou para baixo para rolar — solte para voltar ao centro">' +
          '<span class="esc-pino-grip"></span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="esc-pino-dot is-down" tabindex="-1" title="Descer um passo">·</button>' +
      '<span class="esc-pino-readout" hidden></span>';

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

    function syncVisibility() {
      if (dead) { return; }
      var hiddenParent = !!(scrollEl.hidden || (scrollEl.offsetParent === null && (!scrollEl.getClientRects || !scrollEl.getClientRects().length)));
      var canScroll = !hiddenParent && hasOverflow(scrollEl.scrollHeight, scrollEl.clientHeight);
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
      refresh: syncVisibility,
      destroy: function () {
        dead = true;
        stopDrag();
        root.clearTimeout(springTimer);
        root.clearTimeout(fadeTimer);
        if (ro && ro.disconnect) { ro.disconnect(); }
        scrollEl.removeEventListener('scroll', onScroll, false);
        scrollEl.removeEventListener('input', syncVisibility, false);
        if (rail.parentNode) { rail.parentNode.removeChild(rail); }
        scrollEl.removeAttribute('data-pino-attached');
      }
    };
    instances.push(inst);
    root.setTimeout(syncVisibility, 60);
    return inst;
  }

  function refreshAll() {
    for (var i = 0; i < instances.length; i += 1) {
      instances[i].refresh();
    }
  }

  if (root.addEventListener) {
    root.addEventListener('resize', refreshAll, false);
  }

  root.Escr.pinoMola = {
    attach: attach,
    refreshAll: refreshAll
  };
}(typeof window !== 'undefined' ? window : this));
