/* Executar: node tests/cartao-sinonimos-p01.cjs */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const rootDir = path.resolve(__dirname, '..');
const lexDir = path.join(rootDir, 'resources/pt-BR/lexico-ptbr');
const manifesto = JSON.parse(fs.readFileSync(path.join(lexDir, 'manifesto.json'), 'utf8'));
assert.equal(manifesto.headwords, 7661);
assert.equal(manifesto.lookupKeys, 92148);
assert.equal(manifesto.dictionaryHeadwords, 7504);
assert.equal(manifesto.synonymHeadwords, 2643);

function makeEl(tag) {
  const attrs = {};
  const listeners = {};
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    hidden: false,
    disabled: false,
    readOnly: false,
    children: [],
    parentNode: null,
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(c) { c.parentNode = el; el.children.push(c); return c; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    contains(t) { let cur = t; while (cur) { if (cur === el) return true; cur = cur.parentNode; } return false; },
    click() { (listeners.click || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {}, target: el })); },
    focus() {}
  };
  return el;
}

const docBody = makeEl('body');
const context = vm.createContext({
  Escr: {},
  document: {
    body: docBody,
    activeElement: null,
    createElement: makeEl,
    addEventListener() {}
  },
  setTimeout(fn) { fn(); return 1; },
  clearTimeout() {}
});
context.window = context;

for (const marker of ['root.Escr.createLexicoP01 =', 'root.Escr.mountWordCard =']) {
  vm.runInContext(scripts.find(s => s.includes(marker)), context);
}

const E = context.Escr;

function loadRealShard(id, cb) {
  try {
    const raw = fs.readFileSync(path.join(lexDir, 'partes', id + '.js'), 'utf8');
    const start = '(function(r){var d=';
    const end = ';if(typeof module===';
    const data = JSON.parse(raw.slice(start.length, raw.lastIndexOf(end)));
    cb(null, data);
  } catch (e) {
    cb(e, null);
  }
}

const p01 = E.createLexicoP01({ loadPart: loadRealShard });

// 1. Verificar busca direta e via flexão nos 64 blocos reais
let casaRes = null;
p01.lookup('casa', r => { casaRes = r; });
assert.equal(casaRes.state, 'found');
assert.ok(casaRes.entries.length >= 1);
assert.ok(casaRes.entries[0].definition.length > 0);
assert.ok(casaRes.entries[0].synonyms.includes('lar'));
assert.ok(casaRes.entries[0].synonyms.length <= 3);

let inflectedRes = null;
p01.lookup('bonitas', r => { inflectedRes = r; }); // flexão -> lema bonito
assert.equal(inflectedRes.state, 'found');
assert.equal(inflectedRes.entries[0].lemma, 'bonito');
assert.ok(inflectedRes.entries[0].synonyms.includes('belo'));

// 2. Testar cartão flutuante, substituição com preservação de maiúscula e Desfazer
const editor = makeEl('textarea');
editor.value = 'Casa branca na colina.';
editor.selectionStart = 0;
editor.selectionEnd = 5; // "Casa " -> seleção aparada para "Casa"
context.document.activeElement = editor;

const card = E.mountWordCard({
  service: p01,
  manuscriptEl: editor,
  onReplace(start, end, word) {
    editor.value = editor.value.slice(0, start) + word + editor.value.slice(end);
  }
});

assert.equal(card.trimWordSelection('casa branca', 0), null, 'seleção multi-palavra não abre cartão');
card.inspectSelection();

const cardNode = docBody.children.find(c => c.id === 'esc-word-card');
assert.ok(cardNode && !cardNode.hidden);

// Clica no primeiro sinônimo ("lar" -> "Lar")
function findButtons(node) {
  let out = [];
  if (node.tagName === 'BUTTON') out.push(node);
  (node.children || []).forEach(c => { out = out.concat(findButtons(c)); });
  return out;
}
const synButtons = findButtons(cardNode).filter(b => b.className && b.className.includes('esc-palavra-word'));
assert.ok(synButtons.length >= 1);
assert.equal(synButtons[0].textContent, 'Lar');
synButtons[0].click();
assert.equal(editor.value, 'Lar branca na colina.');

// Cartão permanece aberto e botão vira Desfazer
const undoBtn = findButtons(cardNode).find(b => b.textContent.startsWith('Desfazer'));
assert.ok(undoBtn);
undoBtn.click();
assert.equal(editor.value, 'Casa branca na colina.');

// 3. Testar cartão flutuante também no modo Formatado leve (contenteditable text node)
const textNode = { nodeType: 3, nodeValue: 'Minha casa querida' };
let richSynced = 0;
const richEl = makeEl('div');
richEl.hidden = false;
richEl.setAttribute('contenteditable', 'true');
richEl.contains = n => n === richEl || n === textNode;
context.document.activeElement = richEl;
context.window.getSelection = () => ({
  rangeCount: 1,
  isCollapsed: false,
  getRangeAt() { return { startContainer: textNode, endContainer: textNode, startOffset: 6, endOffset: 10 }; }
});
const cardRich = E.mountWordCard({
  service: p01,
  manuscriptEl: makeEl('textarea'),
  richEl,
  onRichSync() { richSynced += 1; }
});
cardRich.inspectSelection();
const richCardNode = docBody.children[docBody.children.length - 1];
const richSyn = findButtons(richCardNode).find(b => b.textContent === 'lar');
assert.ok(richSyn);
richSyn.click();
assert.equal(textNode.nodeValue, 'Minha lar querida');
assert.equal(richSynced, 1);

assert.equal(docBody.getAttribute('data-esc-consulta-open'), 'true');
card.openManual('feliz');
assert.ok(findButtons(cardNode).some(b => b.className && b.className.includes('esc-palavra-info-btn')));
console.log('OK: léxico P01 (7.661 verbetes, 92.148 chaves), flexão -> lema e cartão flutuante (simples e formatado) com Desfazer verificados.');
