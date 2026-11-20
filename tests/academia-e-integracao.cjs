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
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    hidden: false,
    src: '',
    title: '',
    children: [],
    setAttribute() {},
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

console.log('OK: Academia (14 guias + Literatura Mundial + Kindle Oasis offline) verificada.');
