/* Executar: node tests/modelos-e-soneto.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(i) { return Array.from(data.keys())[i] || null; },
    getItem(k) { return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { data.set(k, String(v)); },
    removeItem(k) { data.delete(k); }
  };
}

const context = vm.createContext({
  Event: function (t) { this.type = t; }
});
const cofreCount = require('../build/modules.json').cofre.length;
for (let i = 0; i < cofreCount; i += 1) {
  vm.runInContext(scripts[i], context);
}
for (const marker of [
  "var prefix = 'escrevaral.astra.v1.doc.'",
  '/* Cadernos: dados ES5',
  'var PALETTES =',
  'createProjectFromTemplate',
  'root.Escr.mountSonnetAssistant'
]) {
  vm.runInContext(scripts.find(s => s.includes(marker)), context);
}

const E = context.Escr;
assert.equal(E.templates.list().length, 7);

const store = createStorage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);

// 1. Criar projeto ENEM e verificar Nota 1000 protegida
const enem = E.templates.createProject(books, archive, 'redacao-enem', 'Treino Enem', 'areia');
assert.equal(enem.book.color, '#b59f7a');
assert.equal(enem.book.data.template, 'redacao-enem');
const refNote = enem.notes.find(n => n.category === 'reference');
assert.ok(refNote);
assert.equal(refNote.locked, true);
assert.ok(refNote.text.includes('Amanda Teixeira Zampiris'));

// 2. Placeholders seguros vs aspas latinas comuns
const textWithBoth = 'Disse «citação literária comum» antes de « Que imagem, lembrança ou pergunta você quer explorar neste soneto? »';
assert.equal(E.templates.placeholderAt(textWithBoth, 10), null);
const hit = E.templates.placeholderAt(textWithBoth, textWithBoth.length - 5);
assert.ok(hit);
assert.equal(hit.value, '« Que imagem, lembrança ou pergunta você quer explorar neste soneto? »');

const fakeTextarea = {
  value: textWithBoth,
  selectionStart: textWithBoth.length - 5,
  selectionEnd: textWithBoth.length - 5,
  readOnly: false,
  disabled: false,
  focus() {},
  setSelectionRange(a, b) { this.selectionStart = a; this.selectionEnd = b; },
  setRangeText(rep, a, b) { this.value = this.value.slice(0, a) + rep + this.value.slice(b); },
  dispatchEvent() {}
};
assert.equal(E.templates.clearTextareaPlaceholder(fakeTextarea), true);
assert.equal(fakeTextarea.value, 'Disse «citação literária comum» antes de ');

// 3. Projeto Soneto + Análise de métrica e rimas
const soneto = E.templates.createProject(books, archive, 'soneto', 'Meu SonetoTeste', 'salvia');
const poemNote = soneto.notes.find(n => n.role === 'sonnet');
assert.ok(poemNote);
assert.equal(poemNote.folder, '02 · Poema');

const poemText = [
  'Amor é fogo que arde sem se ver',
  'É ferida que dói e não se sente',
  'É um contentamento descontente',
  'É dor que desatina sem doer'
].join('\n');

const settings = E.sonnetCore.normalizeSettings(poemNote.sonnetSettings);
const analysis = E.sonnetCore.analyze(poemText, 3, settings); // 4º verso ("doer") deve rimar com 1º ("ver") em ABBA
assert.equal(analysis.written, 4);
assert.equal(analysis.current.number, 4);
assert.ok(analysis.rhymeReference);
assert.equal(analysis.rhymeReference.number, 1);
assert.equal(analysis.rhymeReference.word, 'ver');

const rhymes = E.sonnetCore.findRhymes('amor');
assert.ok(Array.isArray(rhymes) && rhymes.length > 0);
assert.ok(rhymes.some(w => w === 'flor' || w === 'dor'));

console.log('OK: 7 modelos, referência ENEM protegida, placeholders clicáveis e assistente do soneto verificados.');
