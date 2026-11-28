/* Executar: node tests/superfoco-maquina.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function makeEl(tag) {
  const attrs = {};
  const classes = new Set();
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    children: [],
    style: {
      vars: {},
      setProperty(k, v) { this.vars[k] = v; },
      removeProperty(k) { delete this.vars[k]; }
    },
    classList: {
      add(c) { classes.add(c); },
      remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); }
    },
    get className() { return Array.from(classes).join(' '); },
    set className(v) { classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach(c => classes.add(c)); },
    setAttribute(k, v) { attrs[k] = String(v); },
    removeAttribute(k) { delete attrs[k]; },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(child) { el.children.push(child); return child; },
    getBoundingClientRect() { return { width: 700, left: 100, top: 60 }; },
    animate() { return { cancel() {} }; }
  };
  return el;
}

let cancelledCalls = 0;
let lowpassFreq = 0;
let idleCallbacks = [];
const context = vm.createContext({
  atob: str => Buffer.from(str, 'base64').toString('binary'),
  Uint8Array,
  window: null,
  AudioContext: function () {
    this.currentTime = 1.0;
    this.state = 'running';
    this.destination = {};
    this.decodeAudioData = (ab, ok) => { if (ok) ok({ duration: 0.05 }); return Promise.resolve({ duration: 0.05 }); };
    this.createOscillator = () => ({ type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {}, disconnect() {} });
    this.createBufferSource = () => ({
      buffer: null,
      playbackRate: { value: 1 },
      connect() {},
      start() {},
      stop() {},
      disconnect() {}
    });
    this.createBiquadFilter = () => ({
      type: '',
      Q: { value: 0 },
      frequency: { set value(v) { lowpassFreq = v; }, get value() { return lowpassFreq; } },
      connect() {},
      disconnect() {}
    });
    this.createGain = () => ({
      gain: {
        value: 0.65,
        cancelScheduledValues() { cancelledCalls += 1; },
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {}
      },
      connect() {},
      disconnect() {}
    });
  },
  document: {
    body: makeEl('body'),
    createElement: makeEl
  },
  setTimeout(fn, ms) { idleCallbacks.push({ fn, ms }); return idleCallbacks.length; },
  clearTimeout() {}
});
context.window = context;

for (const marker of [
  'var SOUNDS_B64 =',
  'root.Escr.mountVisualMachine ='
]) {
  const src = scripts.find(s => s.includes(marker));
  assert.ok(src, 'missing script for ' + marker);
  vm.runInContext(src, context);
}

const E = context.Escr;

// 1. 10 quadros lazy-load com WebP, fallback PNG (Safari antigo/iPad 2012) e fallback SVG no portátil
assert.equal(E.machineCore.FRAME_FILES.length, 10);
assert.equal(E.machineCore.frameUrl(0, 'webp'), 'assets/typewriter/typewriter-machine-idle.webp');
assert.equal(E.machineCore.frameUrl(2, 'png'), 'assets/typewriter/typewriter-machine-strike-2.png');
assert.equal(E.machineCore.frameUrl(9, 'webp'), 'assets/typewriter/typewriter-machine-strike-9.webp');
assert.ok(E.machineCore.makeFallbackSvg(1).startsWith('data:image/svg+xml'));

// 2. Geometria de ancoragem da máquina antiga + suporte a celular/tablet e teclado virtual
const geom = E.machineCore.computeGeometry(680, 300, 1280, 800, 35.7);
assert.ok(geom && geom.anchorY > 0 && geom.rollerTop > geom.anchorY);
const geomPhone = E.machineCore.computeGeometry(350, 20, 390, 420, 32);
assert.ok(geomPhone && geomPhone.width > 390 && geomPhone.shown >= 108 && geomPhone.anchorY >= 76, 'celular com teclado virtual mantém rolo ampliado e âncora visível acima da barra');
const geomTablet = E.machineCore.computeGeometry(700, 34, 768, 1024, 34);
assert.ok(geomTablet && geomTablet.width > 768 && geomTablet.shown >= 132 && geomTablet.rollerTop > geomTablet.anchorY, 'tablet retrato mantém objeto da máquina visível e bem proporcionado');
assert.notEqual(E.machineCore.pickNextStrike(2), 2);
const bag = E.machineCore.createStrikeBag(9);
const cycle1 = new Set();
let prevBag = 0;
for (let i = 0; i < 9; i += 1) {
  const n = bag();
  assert.ok(n >= 1 && n <= 9);
  assert.notEqual(n, prevBag);
  prevBag = n;
  cycle1.add(n);
}
assert.equal(cycle1.size, 9, 'shuffle-bag deve percorrer os 9 quadros de impacto antes de repetir');
assert.notEqual(bag(), prevBag, 'transição de rodada do shuffle-bag não deve repetir o último quadro');

// 3. Máquina visual + Superfoco + retorno ao repouso em 135ms
const col = makeEl('div');
const machine = E.mountVisualMachine({ columnEl: col });
assert.ok(machine.setFocusActive(true) > 0);
assert.equal(context.document.body.getAttribute('data-esc-machine'), 'on');
assert.equal(machine.activeFrame(), 0);

// Batida de tecla comum aciona quadro 1..9 e volta a 0 em 135ms
E.machineSound.setEnabled(false, null, true); // Som desligado, máquina visual ainda escuta
E.machineSound.handleKey({ key: 'a', keyCode: 65 });
assert.ok(machine.activeFrame() >= 1 && machine.activeFrame() <= 9);
const timeout135 = idleCallbacks.find(c => c.ms === 135);
assert.ok(timeout135);
timeout135.fn();
assert.equal(machine.activeFrame(), 0);

// Enter volta imediatamente para idle (0)
E.machineSound.handleKey({ key: 'b', keyCode: 66 });
assert.ok(machine.activeFrame() >= 1);
E.machineSound.handleKey({ key: 'Enter', keyCode: 13 });
assert.equal(machine.activeFrame(), 0);

// 4. Som offline com 5 variações de tecla + roubo de voz (voice stealing) em digitação rápida
assert.deepEqual(Array.from(E.machineSound.KEY_SAMPLES), ['key', 'key2', 'key3', 'key4', 'key5']);
E.machineSound.setEnabled(true, null, false);
for (let i = 0; i < 12; i += 1) {
  assert.notEqual(E.machineSound.pickKeySample('key3'), 'key3', 'não deve repetir a mesma tecla seguida');
}
E.machineSound.handleKey({ key: 'c', keyCode: 67 });
E.machineSound.handleKey({ key: 'd', keyCode: 68 });
assert.ok(cancelledCalls >= 1, 'voice stealing deve cancelar voz anterior sem empilhar áudio');

// 5. Deduplicação no desktop: input imediato após keydown não dispara som duplicado
assert.equal(E.machineSound.handleInput({ inputType: 'insertText', data: 'd' }), null);

// 6. Tablet / Android / teclado virtual (keydown Unidentified/229 -> input dispara som e animação)
assert.equal(E.machineSound.handleKey({ key: 'Unidentified', keyCode: 229 }), null);
assert.equal(E.machineSound.handleInput({ inputType: 'insertText', data: 'x' }), 'key');
assert.equal(E.machineSound.handleInput({ inputType: 'insertText', data: ' ' }), 'space');
// Composição preditiva (Android Gboard / Samsung Keyboard): 'c' -> 'ca' -> 'c'
E.machineSound.resetComposition();
assert.equal(E.machineSound.handleInput({ inputType: 'insertCompositionText', data: 'c' }), 'key');
assert.equal(E.machineSound.handleInput({ inputType: 'insertCompositionText', data: 'ca' }), 'key');
assert.equal(E.machineSound.handleInput({ inputType: 'insertCompositionText', data: 'c' }), 'backspace');
// Colar e desfazer permanecem silenciosos
assert.equal(E.machineSound.handleInput({ inputType: 'insertFromPaste', data: 'texto colado' }), null);
assert.equal(E.machineSound.handleInput({ inputType: 'historyUndo', data: null }), null);

// IME e atalhos não disparam impacto mecânico no keydown
assert.equal(E.machineSound.classifyKey({ ctrlKey: true, key: 's', keyCode: 83 }), null);
assert.equal(E.machineSound.classifyKey({ isComposing: true, key: 'a', keyCode: 65 }), null);
assert.equal(E.machineSound.classifyKey({ key: 'Unidentified', keyCode: 229 }), null);

console.log('OK: Superfoco mecânico, 5 quadros WebP offline, 5 variações MP3, suporte a tablet/IME, recuo amortecido e som com roubo de voz verificados.');
