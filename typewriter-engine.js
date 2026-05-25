(function typewriterEngine(global) {
  const STORAGE_KEY = "vereda:typewriter-sound";

  let _ctx = null;
  let _buffers = { type: null, back: null, enter: null };
  let _enabled = localStorage.getItem(STORAGE_KEY) === "on";
  let _loaded = false;
  let _loading = false;

  const _typePool = [];
  const _backPool = [];
  let _enterNode = null;

  const MAX_TYPE = 4;
  const MAX_BACK = 2;

  async function _loadBuffers() {
    if (_loading || _loaded) return;
    _loading = true;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
      const [typeArr, backArr, enterArr] = await Promise.all([
        fetch("./sounds/typewriter.wav").then(r => r.arrayBuffer()),
        fetch("./sounds/backspace.wav").then(r => r.arrayBuffer()),
        fetch("./sounds/Enter.wav").then(r => r.arrayBuffer()),
      ]);
      [_buffers.type, _buffers.back, _buffers.enter] = await Promise.all([
        _ctx.decodeAudioData(typeArr),
        _ctx.decodeAudioData(backArr),
        _ctx.decodeAudioData(enterArr),
      ]);
      _loaded = true;
    } catch {
      _loaded = false;
    }
    _loading = false;
  }

  function _createNode(buffer, volume, pool) {
    if (_ctx.state === "suspended") _ctx.resume();

    const gain = _ctx.createGain();
    gain.gain.value = volume;
    gain.connect(_ctx.destination);

    const node = _ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(gain);
    if (pool) {
      node.onended = () => {
        const i = pool.indexOf(node);
        if (i !== -1) pool.splice(i, 1);
      };
    }
    return node;
  }

  function _playPool(buffer, pool, maxVoices, volume) {
    if (!buffer) return;
    if (pool.length >= maxVoices) {
      const oldest = pool.shift();
      try { oldest.stop(); } catch {}
    }
    const node = _createNode(buffer, volume, pool);
    pool.push(node);
    node.start();
  }

  function _playEnter() {
    if (!_buffers.enter) return;
    if (_enterNode) {
      try { _enterNode.stop(); } catch {}
      _enterNode = null;
    }
    const node = _createNode(_buffers.enter, 0.55, null);
    node.onended = () => { if (_enterNode === node) _enterNode = null; };
    _enterNode = node;
    node.start();
  }

  function playKey(kind) {
    if (!_enabled || !_loaded || !_ctx) return;
    if (kind === "type")  _playPool(_buffers.type, _typePool, MAX_TYPE, 0.65);
    else if (kind === "back")  _playPool(_buffers.back, _backPool, MAX_BACK, 0.60);
    else if (kind === "enter") _playEnter();
  }

  async function enable() {
    _enabled = true;
    localStorage.setItem(STORAGE_KEY, "on");
    await _loadBuffers();
  }

  function disable() {
    _enabled = false;
    localStorage.setItem(STORAGE_KEY, "off");
  }

  async function toggle() {
    if (_enabled) disable();
    else await enable();
    return _enabled;
  }

  function isEnabled() { return _enabled; }

  global.VeredaTypewriter = { playKey, toggle, enable, disable, isEnabled };
})(window);
