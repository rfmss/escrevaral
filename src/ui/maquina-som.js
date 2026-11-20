(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  /* 8 amostras MP3 mono (24 kHz) masterizadas com timbre quente e volume nivelado — compativel com Android, iPad/iOS, Linux e Desktop */
  var SOUNDS_B64 = {
    key: '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',
    key2: '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',
    key3: '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',
    key4: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAAFQABJSUlJSUlJSUlJSUlJSUlJbW1tbW1tbW1tbW1tbW1tbW2SkpKSkpKSkpKSkpKSkpKStra2tra2tra2tra2tra2trbb29vb29vb29vb29vb29vb2/////////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJALFAAAAAAAABUAS27wKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEACPSkmAHTDAAACpmZma/DgSAaA0AmB8n2JANAaEyEQBIPO2795u9//u4jvd3sEyd+IQyyCHvTCBByBCO0EEPERnu79nk7YgACDggAIIc8mTvPd3faLu9gwggeACGdiAAIFgAIQfwQIYYQjHPJpmAMLT/sncAMLTaCCGWQIHAff8H4gDAkDCz5QH3ghKf3iM/lwQcJw+Iw+UVBFJTf/qAABb/JmTYKMPgvJujEZQgrQb5Wn2hAnyrZy1PMtj/84TEIzEC2rmVj3gAqE2yNiFIBKnIlGeCN5Hm+qICehqpVsCuRivjGlYly6mkh3sqID8yILOmHNqUzM2Y1LiddQVftV4frCHRozxTK5RQ8Ug4xBL+j1fahbDIlOhRNr1ZuxHMX7/Mam/AYquD9oV7OwnXIq2xUOX1CZm2NV7Be4x/vW60/+fMzur/cCkCsesem/beMVrVuo+LPKightIuXKnwIEAG4M+EQVKCn+sBOXVrg4bW0ZS8bDyFEFOY/sn/84TEEiU7qqQH2EAC2TS6zG4lSRKKxucsSi5SXA4CouaHZBEuYXAwG4cCVBN662UkWOORiJeMtrjh0FhkxNVuh5VIM59m6VuI4dbpYh5hiTnUcwvf33HUxt209X3Fdr9XxN//XF+O5NH3F0ro8PMW0yzrxUxCjz4ofxxM501dj41WO5r7uLvgkALGHhS5XzAAvsLAlpihns4WEQQkpUa9IqBGFY0BAIJglVZIpxnCKohEojJC+obOgdb5ovmuwsr/84TEMCfqNowGywysoujqcpCRoS5dC1knKCkgcJYkXVF4TQ0wX+dM45JzkxB48ssaEpO4ScpX8a7tIBgkSxPkAIxMORMJI6kkyitROqPpVbf3qtLvH0ECKYKIJ0LN7wnEjmIeqKCYByQoZBZyHlnCWzQHgVNDRYxM57fuVWBOdu5hkJvoJqj5mCZkBJghokZam85alXrsxBQJdTvT7wqGcSJlmxSAYTNLFwzGNMxQkJLlTQyRIpLNSKiWKT4Ijpn/84TEQyeidngm0ka5tDrNLSokKAt5MzYUCNS9mOMzBYa7NSgYCAhTUSwMSqqzhRPSOKTHBTfxjWH1m6WGFAShRMx+fpI5E7vhQy41iL+MoqDC9twU8b+jfiu/EVoJdlCalN/qngpv8mUMEk6FhkQQCBD9CwHGLmqKMrdN/JeUBoWcJAzExpJ8k6EpOLQSNZi4pS7IxgIJyy1DUju21JvVoaz///ak0ak1JgtL/Jr/5NSUvqtS9gpEJC4CB0jFdrP/84TEVxtqCjAuwYZ0/V9SP9ZFqCMsR7WnnBXLCUgR4qkZ8KpMQU1FMy4xMDEgKGJldGEgMymqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=',
    key5: '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',
    space: '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',
    backspace: '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',
    return: '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'
  };

  var KEY_SAMPLES = ['key', 'key2', 'key3', 'key4', 'key5'];
  var GAIN_BY_KIND = {
    key: 0.60,
    space: 0.62,
    backspace: 0.54,
    'return': 0.58
  };

  var PREF_KEY = 'escrevaral.typewriter.sound.v1';
  var audioCtx = null;
  var decodedBuffers = {};
  var decodingStarted = false;
  var decodeFailed = false;
  var activeVoice = null;
  var lastKeySample = '';
  var lastKeyStrikeAt = 0;
  var lastKeyStrikeKind = '';
  var lastCompLen = 0;
  var isEnabled = false;
  var listeners = [];
  var strikeListeners = [];

  function nowMs() {
    return (typeof Date !== 'undefined' && Date.now) ? Date.now() : (+new Date());
  }

  function getAudioContext() {
    if (!audioCtx) {
      var Ctx = root.AudioContext || root.webkitAudioContext;
      if (Ctx) {
        try { audioCtx = new Ctx({ latencyHint: 'interactive' }); }
        catch (e) { try { audioCtx = new Ctx(); } catch (ignore) {} }
      }
    }
    return audioCtx;
  }

  function base64ToArrayBuffer(b64) {
    var binary = root.atob ? root.atob(b64) : '';
    var bytes = new Uint8Array(binary.length);
    var i;
    for (i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function loadBuffers() {
    if (decodingStarted || decodeFailed) { return; }
    var ctx = getAudioContext();
    if (!ctx || !ctx.decodeAudioData) { decodeFailed = true; return; }
    decodingStarted = true;
    var keys = Object.keys(SOUNDS_B64);
    var failures = 0;
    keys.forEach(function (name) {
      try {
        var ab = base64ToArrayBuffer(SOUNDS_B64[name]);
        var onFail = function () {
          failures += 1;
          if (failures >= keys.length) { decodeFailed = true; }
        };
        var res = ctx.decodeAudioData(ab, function (buf) {
          decodedBuffers[name] = buf;
        }, onFail);
        if (res && typeof res.catch === 'function') {
          res.catch(onFail);
        }
      } catch (e) {
        failures += 1;
        if (failures >= keys.length) { decodeFailed = true; }
      }
    });
  }

  function unlock() {
    if (!isEnabled) { return; }
    var ctx = getAudioContext();
    if (!ctx) { return; }
    if (ctx.state === 'suspended' && ctx.resume) {
      try {
        var p = ctx.resume();
        if (p && typeof p.catch === 'function') { p.catch(function () {}); }
      } catch (ignore) {}
    }
    if (!decodingStarted) { loadBuffers(); }
  }

  function stopVoice(now) {
    if (!activeVoice) { return; }
    try {
      var v = activeVoice;
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value || 0.01, now);
      v.gain.gain.linearRampToValueAtTime(0.0001, now + 0.0055);
      v.source.stop(now + 0.006);
    } catch (ignore) {}
    activeVoice = null;
  }

  function playFallbackClick(ctx, kind, now) {
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = kind === 'return' ? 280 : kind === 'backspace' ? 170 : kind === 'space' ? 210 : (340 + Math.random() * 60);
      gain.gain.setValueAtTime(0.014, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
      var voice = { source: osc, gain: gain };
      activeVoice = voice;
      osc.onended = function () {
        if (activeVoice === voice) { activeVoice = null; }
        try { osc.disconnect(); gain.disconnect(); } catch (ignore) {}
      };
    } catch (ignore) {}
  }

  function pickKeySample(previous) {
    var pool = [];
    var i, name;
    for (i = 0; i < KEY_SAMPLES.length; i += 1) {
      name = KEY_SAMPLES[i];
      if (decodedBuffers[name] && name !== previous) {
        pool.push(name);
      }
    }
    if (!pool.length) {
      for (i = 0; i < KEY_SAMPLES.length; i += 1) {
        name = KEY_SAMPLES[i];
        if (decodedBuffers[name]) { pool.push(name); }
      }
    }
    if (!pool.length) { return 'key'; }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function play(kind) {
    if (!isEnabled) { return; }
    var ctx = getAudioContext();
    if (!ctx) { return; }
    if (ctx.state === 'suspended' && ctx.resume) {
      try {
        var r = ctx.resume();
        if (r && typeof r.catch === 'function') { r.catch(function () {}); }
      } catch (ignore) {}
    }
    var now = ctx.currentTime;
    stopVoice(now);

    var sampleName = kind;
    if (kind === 'key') {
      sampleName = pickKeySample(lastKeySample);
      lastKeySample = sampleName;
    }

    var buffer = decodedBuffers[sampleName] || decodedBuffers.key;
    if (!buffer) {
      loadBuffers();
      playFallbackClick(ctx, kind, now);
      return;
    }

    try {
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.985 + (Math.random() * 0.03);

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'space' ? 2800 : 3400;
      filter.Q.value = 0.707;

      var baseGain = GAIN_BY_KIND[kind] || 0.58;
      var humanGain = baseGain * (0.94 + Math.random() * 0.12);
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(humanGain, now);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);

      var voice = { source: source, gain: gain };
      activeVoice = voice;
      source.onended = function () {
        if (activeVoice === voice) { activeVoice = null; }
        try { source.disconnect(); filter.disconnect(); gain.disconnect(); } catch (ignore) {}
      };
    } catch (ignore) {
      playFallbackClick(ctx, kind, now);
    }
  }

  function notifyStrike(kind, ev) {
    var i;
    for (i = 0; i < strikeListeners.length; i += 1) {
      try { strikeListeners[i](kind, ev); } catch (ignore) {}
    }
  }

  function classifyKey(ev) {
    if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) { return null; }
    if (ev.isComposing && ev.key !== 'Dead') { return null; }
    var key = ev.key || '', code = ev.keyCode;
    if (key === 'Unidentified' || key === 'Process' || code === 229) { return null; }
    if (key === 'Enter' || code === 13) { return 'return'; }
    if (key === ' ' || code === 32) { return 'space'; }
    if (key === 'Backspace' || key === 'Delete' || code === 8 || code === 46) { return 'backspace'; }
    if (key === 'Dead' || key.length === 1 || (!key && code >= 32 && code <= 222)) { return 'key'; }
    return null;
  }

  function classifyInput(ev) {
    if (!ev) { return null; }
    var type = ev.inputType || '';
    var data = typeof ev.data === 'string' ? ev.data : '';

    if (type !== 'insertCompositionText') {
      lastCompLen = 0;
    }

    if (type) {
      if (type.indexOf('Paste') >= 0 || type.indexOf('Drop') >= 0 || type.indexOf('history') === 0 || type === 'insertReplacementText') {
        return null;
      }
      if (type === 'insertLineBreak' || type === 'insertParagraph') {
        return 'return';
      }
      if (type.indexOf('delete') === 0) {
        return 'backspace';
      }
      if (type === 'insertCompositionText') {
        var len = data.length;
        var prev = lastCompLen;
        lastCompLen = len;
        if (len === 0) { return prev > 0 ? 'backspace' : null; }
        if (len < prev) { return 'backspace'; }
        if (len > prev) {
          var tail = data.charAt(len - 1);
          return tail === ' ' ? 'space' : 'key';
        }
        return null;
      }
      if (type === 'insertText') {
        if (!data) { return null; }
        if (data === ' ' || data.charAt(data.length - 1) === ' ') { return 'space'; }
        return 'key';
      }
      return null;
    }

    if (data.length === 1) {
      return data === ' ' ? 'space' : 'key';
    }
    return null;
  }

  function resetComposition() {
    lastCompLen = 0;
  }

  function setEnabled(val, storage, silent) {
    isEnabled = !!val;
    if (storage) {
      try { storage.setItem(PREF_KEY, isEnabled ? 'true' : 'false'); } catch (ignore) {}
    }
    var i;
    for (i = 0; i < listeners.length; i += 1) {
      try { listeners[i](isEnabled); } catch (ignore) {}
    }
    if (isEnabled && !silent) {
      loadBuffers();
      play('key');
    } else if (!isEnabled && audioCtx) {
      stopVoice(audioCtx.currentTime || 0);
    }
  }

  function syncPreference(storage) {
    if (!storage) { return; }
    try {
      var stored = storage.getItem(PREF_KEY);
      if (stored !== null) { isEnabled = stored === 'true'; }
    } catch (ignore) {}
  }

  root.Escr.machineSound = {
    PREF_KEY: PREF_KEY,
    KEY_SAMPLES: KEY_SAMPLES,
    play: play,
    unlock: unlock,
    loadBuffers: loadBuffers,
    pickKeySample: pickKeySample,
    classifyKey: classifyKey,
    classifyInput: classifyInput,
    resetComposition: resetComposition,
    handleKey: function (ev) {
      if (isEnabled) { unlock(); }
      var kind = classifyKey(ev);
      if (!kind) {
        if (ev && (ev.key === 'Unidentified' || ev.key === 'Process' || ev.keyCode === 229)) {
          lastKeyStrikeAt = 0;
          lastKeyStrikeKind = '';
        }
        return null;
      }
      lastKeyStrikeAt = nowMs();
      lastKeyStrikeKind = kind;
      notifyStrike(kind, ev);
      if (isEnabled) { play(kind); }
      return kind;
    },
    handleInput: function (ev) {
      if (isEnabled) { unlock(); }
      var kind = classifyInput(ev);
      if (!kind) { return null; }
      var elapsed = nowMs() - lastKeyStrikeAt;
      if (elapsed >= 0 && elapsed < 80 && (lastKeyStrikeKind === kind || (lastKeyStrikeKind === 'key' && kind === 'space'))) {
        lastKeyStrikeAt = 0;
        lastKeyStrikeKind = '';
        return null;
      }
      notifyStrike(kind, ev);
      if (isEnabled) { play(kind); }
      return kind;
    },
    setEnabled: setEnabled,
    isEnabled: function () { return isEnabled; },
    syncPreference: syncPreference,
    getActiveVoice: function () { return activeVoice; },
    onStrike: function (fn) {
      strikeListeners.push(fn);
      return function () {
        var idx = strikeListeners.indexOf(fn);
        if (idx >= 0) { strikeListeners.splice(idx, 1); }
      };
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var idx = listeners.indexOf(fn);
        if (idx >= 0) { listeners.splice(idx, 1); }
      };
    }
  };
}(typeof window !== 'undefined' ? window : this));
