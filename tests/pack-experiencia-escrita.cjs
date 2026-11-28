/* Executar: node tests/pack-experiencia-escrita.cjs. Valida os 4 blocos do Pack Experiência & Escrita. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { Node } = require('../ptbr/teste-painel.js');

const root = path.resolve(__dirname, '..');
const scripts = require('./helpers/sources.cjs').scripts();

/* === BLOCO 1: Modo Leitor (paleta Sálvia, scrollProgress, teclado, botão Imprimir) === */
const readerCtx = vm.createContext({
  Escr: { countManuscript: s => ({ words: (s || '').trim() ? (s || '').trim().split(/\s+/).length : 0 }) },
  window: null,
  document: null,
  setTimeout: () => 1,
  clearTimeout: () => {}
});
readerCtx.window = readerCtx;
const rNodes = {};
function makeDomNode(tag) {
  const listeners = {};
  const attrs = {};
  const node = {
    tagName: String(tag || 'DIV').toUpperCase(),
    id: '', className: '', textContent: '', value: '', hidden: false, style: {},
    scrollTop: 0, scrollHeight: 1000, clientHeight: 200,
    children: [],
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(c) { node.children.push(c); return c; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    emit(ev, payload) { (listeners[ev] || []).forEach(fn => fn.call(node, payload || { preventDefault() {}, stopPropagation() {} })); },
    click() { node.emit('click'); },
    focus() {}
  };
  return node;
}
const readerBody = makeDomNode('body');
const readerDoc = {
  body: readerBody,
  activeElement: null,
  createElement(tag) {
    const n = makeDomNode(tag);
    Object.defineProperty(n, 'innerHTML', {
      set(html) {
        n._html = html;
        const ids = html.match(/id="([^"]+)"/g) || [];
        ids.forEach(m => {
          const id = m.slice(4, -1);
          const child = makeDomNode(id.includes('palette') || id.includes('face') || id.includes('size') || id.includes('leading') || id.includes('break') ? 'select' : 'div');
          child.id = id;
          rNodes[id] = child;
        });
      },
      get() { return n._html || ''; }
    });
    return n;
  },
  createTextNode(txt) { return { nodeType: 3, textContent: String(txt || '') }; },
  getElementById(id) { return rNodes[id] || null; }
};
readerCtx.document = readerDoc;
vm.runInContext(fs.readFileSync(path.join(root, 'src/ui/modo-leitor.js'), 'utf8'), readerCtx);

assert.equal(readerCtx.Escr.readerCore.normalizePrefs({ palette: 'sage' }).palette, 'sage', 'paleta sage aceita');
assert.equal(readerCtx.Escr.readerCore.scrollProgress(0, 1000, 200), 0);
assert.equal(readerCtx.Escr.readerCore.scrollProgress(400, 1000, 200), 50);
assert.equal(readerCtx.Escr.readerCore.scrollProgress(800, 1000, 200), 100);
assert.equal(readerCtx.Escr.readerCore.scrollProgress(0, 180, 200), 100, 'texto curto já exibe 100%');

let printed = 0;
const reader = readerCtx.Escr.mountReaderMode({ storage: null, onPrint: () => { printed += 1; } });
reader.open({ title: 'Caderno', text: 'Um texto literário de teste '.repeat(40) });
assert.ok(rNodes['esc-reader-print'], 'botão Imprimir presente no Modo Leitor');
rNodes['esc-reader-print'].click();
assert.equal(printed, 1, 'botão Imprimir aciona onPrint');
assert.ok(rNodes['esc-reader-stats'].textContent.includes('%'), 'progresso em % aparece na barra do Modo Leitor');
const overlay = readerBody.children[0];
overlay.emit('keydown', { keyCode: 34, target: overlay, preventDefault() {}, stopPropagation() {} });
assert.ok(rNodes['esc-reader-viewport'].scrollTop > 0, 'PageDown avança página no Modo Leitor');
overlay.emit('keydown', { keyCode: 33, target: overlay, preventDefault() {}, stopPropagation() {} });
assert.equal(rNodes['esc-reader-viewport'].scrollTop, 0, 'PageUp volta página no Modo Leitor');
reader.close();

/* === BLOCO 2: Stepper lateral e teclado na Oficina (Sintaxe + Morfologia filtrada) === */
const ctx = vm.createContext({});
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
const E = ctx.Escr;
const vault = E.createVault(E.knowledge);
const doc = new Node('document');
const timers = [];
doc.createElement = tag => { const n = new Node(tag); n.style = {}; return n; };
doc.createElementNS = (ns, tag) => new Node(tag);
Node.prototype.getBoundingClientRect = function () { return { left: 0, top: 0, width: 800, height: 100 }; };
const win = { Escr: E, document: doc, setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'ptbr/leitura-visual.js'), 'utf8'), { window: win });

function all(n, cls) {
  const hit = n.className && n.className.split(/\s+/).includes(cls) ? [n] : [];
  return hit.concat(...(n.childNodes || []).map(c => all(c, cls)));
}

const synText = 'A escritora escreveu o poema.';
const synBox = doc.createElement('div');
const pickedSyn = [];
const synR = E.renderReadingMap(synBox, { snapshot: synText, lens: 'sintaxe', findings: vault.analyze('sintaxe', synText).findings, onSelect: f => pickedSyn.push(f.feature) });
while (timers.length) { timers.shift()(); }
const synNext = all(synBox, 'ptbr-aside-step').find(b => b.attrs['data-aside-step'] === 'next');
const synCounter = all(synBox, 'ptbr-aside-counter')[0];
assert.ok(synNext && synCounter, 'stepper lateral presente na Sintaxe');
assert.equal(synCounter.textContent, '1 / 3');
synNext.click();
assert.equal(synCounter.textContent, '2 / 3');
assert.equal(pickedSyn.at(-1), 'Núcleo verbal', 'stepper avança termo a termo na ordem da frase');
synR.destroy();

const advText = 'Ela caminhou serenamente e falou suavemente depois calmamente.';
const advBox = doc.createElement('div');
const pickedAdv = [];
const advR = E.renderReadingMap(advBox, { snapshot: advText, lens: 'adverbios', findings: vault.analyze('adverbios', advText).findings, onSelect: f => pickedAdv.push(f.snippet) });
const advNext = all(advBox, 'ptbr-aside-step').find(b => b.attrs['data-aside-step'] === 'next');
const advCounter = all(advBox, 'ptbr-aside-counter')[0];
assert.equal(advCounter.textContent, '1 / 3');
advNext.click();
assert.equal(advCounter.textContent, '2 / 3');
assert.equal(pickedAdv.at(-1), 'suavemente');
advR.destroy();

/* === BLOCO 3: Saltos diretos de lente na ponte Academia <-> Oficina === */
const acBody = makeDomNode('body');
const acCtx = vm.createContext({ Escr: {}, window: null, addEventListener() {}, document: { body: acBody, activeElement: null, createElement: makeDomNode, addEventListener() {} } });
acCtx.window = acCtx;
vm.runInContext(fs.readFileSync(path.join(root, 'src/ui/academia.js'), 'utf8'), acCtx);
const jumped = [];
const ac = acCtx.Escr.mountAcademy({ onAction: (act, entry, lensId) => { jumped.push(act + ':' + entry.id + ':' + (lensId || '')); } });
ac.openGuide('revisao-manuscrito');
function findBtns(node) {
  let out = node.tagName === 'BUTTON' ? [node] : [];
  (node.children || []).forEach(c => { out = out.concat(findBtns(c)); });
  return out;
}
const lensBtns = findBtns(acBody.children[0]).filter(b => b.getAttribute('data-academy-lens'));
assert.deepEqual(lensBtns.map(b => b.getAttribute('data-academy-lens')), ['sintaxe', 'ritmo', 'repeticao']);
lensBtns[0].click();
assert.deepEqual(jumped, ['examine-lens:revisao-manuscrito:sintaxe']);

/* === BLOCO 4: Impressão A4 e CSS do Modo Leitor === */
const baseCss = fs.readFileSync(path.join(root, 'src/ui/styles/base.css'), 'utf8');
const readerCss = fs.readFileSync(path.join(root, 'src/ui/styles/modo-leitor.css'), 'utf8');
assert.ok(baseCss.includes('#esc-reader-overlay, #esc-academy-overlay { display: none !important; }'), 'overlays ocultos na impressão');
assert.ok(readerCss.includes('.esc-reader[data-palette="sage"]'), 'paleta Sálvia E-Ink definida no Modo Leitor');
assert.ok(readerCss.includes('.esc-reader-progress-fill'), 'barra de progresso definida no Modo Leitor');

console.log('PACK EXPERIENCIA & ESCRITA OK: Modo Leitor (Sálvia/progresso/teclado/imprimir), stepper lateral na Oficina, saltos Academia->Lentes e impressão A4.');
