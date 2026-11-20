/* Pomodoro Dock fixo na base da Coluna 1 (50/6 min configuráveis) — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var KEY = 'escrevaral.pomodoro.dock.v1';

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }
  function clamp(n, min, max, fallback) {
    var v = parseInt(n, 10);
    if (!isFinite(v)) { return fallback; }
    return Math.max(min, Math.min(max, v));
  }
  function fmt(sec) {
    var s = Math.max(0, Math.floor(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : String(m)) + ':' + (r < 10 ? '0' + r : String(r));
  }

  function createPomodoroEngine(opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var writeMin = 50;
    var breakMin = 6;
    var phase = 'write'; // 'write' | 'break'
    var running = false;
    var remaining = writeMin * 60;
    var listeners = [];

    try {
      if (storage) {
        var raw = storage.getItem(KEY);
        if (raw) {
          var saved = JSON.parse(raw);
          writeMin = clamp(saved.writeMin, 1, 180, 50);
          breakMin = clamp(saved.breakMin, 1, 60, 6);
          remaining = writeMin * 60;
        }
      }
    } catch (ignore) {}

    function save() {
      if (!storage) { return; }
      try { storage.setItem(KEY, JSON.stringify({ writeMin: writeMin, breakMin: breakMin })); } catch (ignore) {}
    }

    function emit(eventName) {
      var snap = snapshot();
      var i;
      for (i = 0; i < listeners.length; i += 1) {
        try { listeners[i](snap, eventName || 'update'); } catch (ignore) {}
      }
    }

    function snapshot() {
      return {
        phase: phase,
        running: running,
        remaining: remaining,
        formatted: fmt(remaining),
        writeMin: writeMin,
        breakMin: breakMin,
        label: phase === 'write' ? 'Escrita' : 'Pausa'
      };
    }

    function tick() {
      if (!running) { return; }
      remaining -= 1;
      if (remaining <= 0) {
        if (phase === 'write') {
          phase = 'break';
          remaining = breakMin * 60;
          emit('break-start');
        } else {
          phase = 'write';
          remaining = writeMin * 60;
          running = false;
          emit('cycle-complete');
        }
      } else {
        emit('tick');
      }
    }

    return {
      snapshot: snapshot,
      tick: tick,
      start: function () { running = true; emit('start'); },
      pause: function () { running = false; emit('pause'); },
      toggle: function () { running = !running; emit(running ? 'start' : 'pause'); },
      reset: function () {
        running = false;
        phase = 'write';
        remaining = writeMin * 60;
        emit('reset');
      },
      configure: function (wMin, bMin) {
        writeMin = clamp(wMin, 1, 180, writeMin);
        breakMin = clamp(bMin, 1, 60, breakMin);
        save();
        if (!running) {
          remaining = (phase === 'write' ? writeMin : breakMin) * 60;
        }
        emit('config');
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

  root.Escr.pomodoroCore = {
    KEY: KEY,
    formatTime: fmt,
    createEngine: createPomodoroEngine
  };

  root.Escr.mountPomodoroDock = function (opts) {
    opts = opts || {};
    var hostEl = opts.containerEl || (typeof document !== 'undefined' ? document.getElementById('esc-pomodoro-dock') : null);
    var engine = createPomodoroEngine({ storage: opts.storage || null });
    var timerId = null;
    var configOpen = false;

    function startInterval() {
      if (timerId !== null) { return; }
      timerId = window.setInterval(function () { engine.tick(); }, 1000);
    }
    function stopInterval() {
      if (timerId !== null) { window.clearInterval(timerId); timerId = null; }
    }

    function render() {
      if (!hostEl) { return; }
      var s = engine.snapshot();
      hostEl.textContent = '';

      var row = document.createElement('div');
      row.className = 'esc-pomo-row';

      var info = document.createElement('div');
      info.className = 'esc-pomo-info';
      var ph = document.createElement('span');
      ph.className = 'esc-pomo-phase';
      ph.textContent = s.label;
      var tm = document.createElement('strong');
      tm.className = 'esc-pomo-time';
      tm.textContent = s.formatted;
      info.appendChild(ph);
      info.appendChild(tm);
      row.appendChild(info);

      var btns = document.createElement('div');
      btns.className = 'esc-pomo-btns';

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'esc-pomo-btn';
      toggleBtn.textContent = s.running ? 'Pausar' : 'Iniciar';
      toggleBtn.setAttribute('aria-pressed', s.running ? 'true' : 'false');
      on(toggleBtn, 'click', function () { engine.toggle(); });
      btns.appendChild(toggleBtn);

      var resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'esc-pomo-btn';
      resetBtn.title = 'Encerrar e reiniciar ciclo';
      resetBtn.textContent = '\u21BA';
      on(resetBtn, 'click', function () { engine.reset(); });
      btns.appendChild(resetBtn);

      var cfgBtn = document.createElement('button');
      cfgBtn.type = 'button';
      cfgBtn.className = 'esc-pomo-btn';
      cfgBtn.title = 'Ajustar tempos do Pomodoro';
      cfgBtn.setAttribute('aria-expanded', configOpen ? 'true' : 'false');
      cfgBtn.textContent = '\u2699';
      on(cfgBtn, 'click', function () { configOpen = !configOpen; render(); });
      btns.appendChild(cfgBtn);

      row.appendChild(btns);
      hostEl.appendChild(row);

      if (configOpen) {
        var form = document.createElement('form');
        form.className = 'esc-pomo-config';
        var wLbl = document.createElement('label');
        wLbl.textContent = 'Escrita (min)';
        var wInp = document.createElement('input');
        wInp.type = 'number'; wInp.min = '1'; wInp.max = '180'; wInp.value = String(s.writeMin);
        wLbl.appendChild(wInp);

        var bLbl = document.createElement('label');
        bLbl.textContent = 'Pausa (min)';
        var bInp = document.createElement('input');
        bInp.type = 'number'; bInp.min = '1'; bInp.max = '60'; bInp.value = String(s.breakMin);
        bLbl.appendChild(bInp);

        var saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'esc-pomo-save';
        saveBtn.textContent = 'Aplicar';

        on(form, 'submit', function (ev) {
          ev.preventDefault();
          engine.configure(wInp.value, bInp.value);
          configOpen = false;
          render();
        });
        form.appendChild(wLbl);
        form.appendChild(bLbl);
        form.appendChild(saveBtn);
        hostEl.appendChild(form);
      }
    }

    engine.subscribe(function (snap, evName) {
      if (snap.running) { startInterval(); }
      else { stopInterval(); }
      if (evName === 'break-start' && opts.onBreakStart) { opts.onBreakStart(snap); }
      render();
    });

    render();

    return {
      engine: engine,
      render: render,
      destroy: stopInterval
    };
  };
}(typeof window !== 'undefined' ? window : this));
