/* Executar: node tests/academia-e-integracao.cjs */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const rootDir = path.resolve(__dirname, '..');

function makeEl(tag) {
  const listeners = {};
  const attrs = {};
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    hidden: false,
    src: '',
    title: '',
    children: [],
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(c) { el.children.push(c); return c; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    click() { (listeners.click || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {} })); },
    focus() {}
  };
  return el;
}

const docBody = makeEl('body');
const context = vm.createContext({
  Escr: {},
  window: null,
  addEventListener() {},
  document: {
    body: docBody,
    activeElement: null,
    createElement: makeEl,
    addEventListener() {}
  }
});
context.window = context;

vm.runInContext(scripts.find(s => s.includes('root.Escr.mountAcademy =')), context);
const E = context.Escr;

const catalog = E.academy.catalog();
assert.equal(catalog.length, 14);
assert.ok(catalog.some(e => e.id === 'literatura-mundial' && e.module === 'literature'));

// Confirmar que todos os 14 HTMLs existem tanto em academia/ quanto em dist/site/academia/
for (const entry of catalog) {
  assert.ok(fs.existsSync(path.join(rootDir, 'academia', entry.file)), 'Faltando academia/' + entry.file);
  assert.ok(fs.existsSync(path.join(rootDir, 'dist/site/academia', entry.file)), 'Faltando dist/site/academia/' + entry.file);
}

// Confirmar leitor Kindle Oasis (#reader, #oasis-screen, #page-prev, #page-next) em literatura-mundial.html
const litHtml = fs.readFileSync(path.join(rootDir, 'academia/literatura-mundial.html'), 'utf8');
for (const marker of ['id="reader"', 'oasis-screen', 'page-prev', 'page-next']) {
  assert.ok(litHtml.includes(marker), 'literatura-mundial.html sem ' + marker);
}

// Testar abertura do catálogo e guia no modal
const academy = E.mountAcademy();
academy.openList();
assert.equal(academy.isOpen(), true);
const modalNode = docBody.children.find(c => c.id === 'esc-academy-overlay');
assert.ok(modalNode && !modalNode.hidden);

academy.openGuide('literatura-mundial');
function findByTag(node, tag) {
  let out = [];
  if (node.tagName === tag) out.push(node);
  (node.children || []).forEach(c => { out = out.concat(findByTag(c, tag)); });
  return out;
}
const iframes = findByTag(modalNode, 'IFRAME');
assert.equal(iframes.length, 1);
assert.equal(iframes[0].src, 'academia/literatura-mundial.html');

academy.close();
assert.equal(academy.isOpen(), false);

// Testar ponte Academia <-> Oficina (metadados, recomendação por estágio, retomada e ação na barra)
for (const entry of catalog) {
  assert.ok(entry.bridge && entry.bridge.action && entry.bridge.label, 'Guia sem ponte editorial: ' + entry.id);
}

const recBlank = E.academy.recommendForContext({ words: 0, hasTitle: false });
assert.equal(recBlank.stageId, 'blank');
assert.deepEqual(Array.from(recBlank.guides, g => g.id), ['primeiras-linhas', 'bloqueio-criativo']);

const recUntitled = E.academy.recommendForContext({ words: 120, hasTitle: false });
assert.equal(recUntitled.stageId, 'untitled');
assert.deepEqual(Array.from(recUntitled.guides, g => g.id), ['titulo-do-livro', 'primeiras-linhas']);

const recDraft = E.academy.recommendForContext({ words: 320, hasTitle: true });
assert.equal(recDraft.stageId, 'drafting');
assert.deepEqual(Array.from(recDraft.guides, g => g.id), ['bloqueio-criativo', 'literatura-mundial']);

const recRev = E.academy.recommendForContext({ words: 1100, hasTitle: true });
assert.equal(recRev.stageId, 'revising');
assert.deepEqual(Array.from(recRev.guides, g => g.id), ['revisao-manuscrito', 'objeto-livro']);

const recLong = E.academy.recommendForContext({ words: 4200, hasTitle: true });
assert.equal(recLong.stageId, 'manuscript');
assert.deepEqual(Array.from(recLong.guides, g => g.id), ['revisao-manuscrito', 'mapa-lancamento-editorial']);

const memStore = {};
const fakeStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null; },
  setItem(k, v) { memStore[k] = String(v); }
};
const triggeredActions = [];
const bridged = E.mountAcademy({
  storage: fakeStorage,
  getContext: () => ({ words: 1100, hasTitle: true }),
  onAction: (action, entry) => { triggeredActions.push(action + ':' + entry.id); }
});

bridged.openGuide('objeto-livro');
assert.equal(fakeStorage.getItem('escrevaral.academy.last.v1'), 'objeto-livro');
const bridgedModal = docBody.children[docBody.children.length - 1];
const actionBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-action') === 'reader');
assert.equal(actionBtns.length, 1);
actionBtns[0].click();
assert.equal(bridged.isOpen(), false);
assert.deepEqual(triggeredActions, ['reader:objeto-livro']);

// Ao reabrir a lista, mostra sugestões contextuais e o botão de retomada do último guia
bridged.openList();
const resumeBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-resume') === 'objeto-livro');
assert.equal(resumeBtns.length, 1);
const recBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-rec'));
assert.deepEqual(recBtns.map(b => b.getAttribute('data-academy-rec')), ['revisao-manuscrito', 'objeto-livro']);
bridged.close();

console.log('OK: Academia (14 guias + Literatura Mundial + Kindle Oasis + Ponte Academia <-> Oficina) verificada.');
