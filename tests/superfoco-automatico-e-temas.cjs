/* Executar: node tests/superfoco-automatico-e-temas.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function makeEl(tag, id) {
  const attrs = {};
  const listeners = {};
  const el = {
    tagName: tag.toUpperCase(),
    id: id || '',
    className: '',
    textContent: '',
    hidden: false,
    readOnly: false,
    disabled: false,
    value: '',
    selectionEnd: 0,
    scrollTop: 0,
    children: [],
    style: { setProperty() {}, removeProperty() {} },
    setAttribute(k, v) { attrs[k] = String(v); },
    removeAttribute(k) { delete attrs[k]; },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(c) { c.parentNode = el; el.children.push(c); return c; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    removeEventListener(ev, fn) { if (listeners[ev]) listeners[ev] = listeners[ev].filter(f => f !== fn); },
    dispatch(ev, e) { (listeners[ev] || []).forEach(fn => fn(e || { target: el })); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    contains(n) { return n === el || el.children.includes(n); }
  };
  return el;
}

const storeMap = {};
const storage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(storeMap, k) ? storeMap[k] : null),
  setItem: (k, v) => { storeMap[k] = String(v); }
};
const docListeners = {};
const timers = [];
const body = makeEl('body');
const manuscript = makeEl('textarea', 'manuscrito');
const switchBtn = makeEl('button', 'esc-superfocus-auto-toggle');
const byIdMap = { 'esc-superfocus-auto-toggle': switchBtn };

const doc = {
  body,
  documentElement: makeEl('html'),
  createElement: tag => makeEl(tag),
  createElementNS: (ns, tag) => makeEl(tag),
  getElementById: id => byIdMap[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener(ev, fn) { (docListeners[ev] = docListeners[ev] || []).push(fn); },
  removeEventListener(ev, fn) { if (docListeners[ev]) docListeners[ev] = docListeners[ev].filter(f => f !== fn); },
  emit(ev, e) { (docListeners[ev] || []).forEach(fn => fn(e)); }
};

const ctx = vm.createContext({
  window: null,
  document: doc,
  setTimeout(fn, ms) { const id = timers.length + 1; timers.push({ id, fn, ms, cleared: false }); return id; },
  clearTimeout(id) { const t = timers.find(x => x.id === id); if (t) t.cleared = true; }
});
ctx.window = ctx;

for (const marker of ['root.Escr.mountSuperfoco =', 'root.Escr.mountThemeChrome =']) {
  const src = scripts.find(s => s.includes(marker));
  assert.ok(src, 'missing ' + marker);
  vm.runInContext(src, ctx);
}

let active = false, openCount = 0, closeReasons = [], sonnetFlag = true;
const sf = ctx.Escr.mountSuperfoco({
  storage,
  manuscriptEl: manuscript,
  clock: ctx,
  isActive: () => active,
  onOpen: () => { active = true; openCount += 1; },
  onClose: why => { active = false; closeReasons.push(why); },
  isSonnetActive: () => sonnetFlag,
  switchBtn
});

// 1. Paste não dispara Superfoco automático
doc.emit('input', { target: manuscript, inputType: 'insertFromPaste', data: 'duas palavras coladas' });
assert.equal(openCount, 0);

// 2. Digitar 2 palavras dispara Superfoco automático + acopla Soneto + abre barra dedicada
for (const ch of 'casa b') {
  doc.emit('input', { target: manuscript, inputType: 'insertText', data: ch });
}
assert.equal(openCount, 1);
assert.equal(active, true);
assert.equal(sf.isAutomaticOpen(), true);
assert.equal(body.getAttribute('data-esc-writing-sonnet'), 'true');
assert.ok(body.children.some(c => c.id === 'esc-writing-bar' && !c.hidden));

// 2b. Digitação em texto simples no Superfoco não disputa scrollTop com o controlador
manuscript.value = 'linha longa que quebra visualmente sem enter\nsegunda linha';
manuscript.selectionEnd = manuscript.value.length;
manuscript.scrollTop = 148;
doc.emit('input', { target: manuscript, inputType: 'insertText', data: 'x' });
doc.emit('selectionchange', { target: doc });
assert.equal(manuscript.scrollTop, 148, 'superfoco.js não deve sobrescrever scrollTop do textarea com estimativa grosseira');

// 3. Enquanto cartão P01 estiver aberto, o timer de 30s NÃO fecha o Superfoco (rearma!)
body.setAttribute('data-esc-consulta-open', 'true');
const idleT1 = timers.filter(t => !t.cleared && t.ms === 30000).pop();
assert.ok(idleT1, 'timer 30s armado');
idleT1.fn();
assert.equal(active, true, 'não fecha com P01 aberto');

// 4. Sem P01 aberto, 30s fecha automaticamente
body.removeAttribute('data-esc-consulta-open');
sf.notifyState(true, 'automatic');
const idleT2 = timers.filter(t => !t.cleared && t.ms === 30000).pop();
idleT2.fn();
assert.equal(active, false);
assert.deepEqual(closeReasons, ['idle']);

// 4b. Regra do Superfoco puro: escrita fluida (Backspace/Enter) permanece; colar/desfazer/Ctrl+A sai para o Modo Nota
active = true;
sf.notifyState(true, 'manual');
doc.emit('input', { target: manuscript, inputType: 'deleteContentBackward', data: null });
doc.emit('input', { target: manuscript, inputType: 'insertLineBreak', data: null });
assert.equal(active, true, 'Backspace e Enter mantêm o Superfoco');
doc.emit('input', { target: manuscript, inputType: 'insertFromPaste', data: 'colado' });
assert.equal(active, false, 'Colar sai do Superfoco para o Modo Nota');
assert.equal(closeReasons[closeReasons.length - 1], 'edit');

active = true;
sf.notifyState(true, 'manual');
doc.emit('keydown', { target: manuscript, ctrlKey: true, keyCode: 65, preventDefault() {} });
assert.equal(active, false, 'Ctrl+A sai do Superfoco para o Modo Nota');
assert.equal(closeReasons[closeReasons.length - 1], 'edit');

// 5. Switch OFF desliga disparo automático e persiste
switchBtn.dispatch('click');
assert.equal(sf.preference.get(), false);
assert.equal(storage.getItem('escrevaral.writing.automatic.v1'), 'false');
for (const ch of 'outra frase') {
  doc.emit('input', { target: manuscript, inputType: 'insertText', data: ch });
}
assert.equal(openCount, 1, 'não abre com switch OFF');

// 6. Dois modos calibrados por neurociência (Papel Sálvia claro <-> Noturno opaco) + Leitura confortável + Piscar E-Ink
const cycleBtn = makeEl('button', 'esc-theme-cycle');
byIdMap['esc-theme-cycle'] = cycleBtn;
const tc = ctx.Escr.mountThemeChrome({ storage });
assert.equal(tc.getTheme(), 'eink');
assert.equal(body.getAttribute('data-esc-theme'), 'eink');
assert.equal(body.getAttribute('data-theme'), 'claro');
assert.equal(cycleBtn.getAttribute('aria-pressed'), 'false');
tc.setTheme('papel');
assert.equal(tc.getTheme(), 'eink', 'temas desconhecidos normalizam para Sálvia claro');
cycleBtn.dispatch('click');
assert.equal(tc.getTheme(), 'noturno', 'botão fixo alterna para Modo Noturno opaco');
assert.equal(body.getAttribute('data-esc-theme'), 'noturno');
assert.equal(body.getAttribute('data-theme'), 'escuro');
assert.equal(cycleBtn.getAttribute('aria-pressed'), 'true');
assert.equal(storage.getItem('escrevaral.theme.v2'), 'noturno');
assert.equal(storage.getItem('escrevaral.astra.theme'), 'escuro');
tc.toggleTheme();
assert.equal(tc.getTheme(), 'eink', 'toggleTheme retorna ao Sálvia claro');
assert.equal(body.getAttribute('data-theme'), 'claro');
tc.setComfortable(true);
assert.equal(body.getAttribute('data-esc-reading'), 'comfortable');
const targetEl = makeEl('div');
tc.flash(targetEl);
assert.equal(targetEl.getAttribute('data-eink-flash'), 'true');

console.log('OK: Superfoco automático (2 palavras + 30s + P01 guard + barra + Soneto acoplado) e modos Sálvia claro / Noturno opaco verificados.');
