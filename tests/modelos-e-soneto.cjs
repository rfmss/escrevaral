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
  'root.Escr.versoCore =',
  'root.Escr.mountSonnetAssistant',
  'root.Escr.songCore =',
  'root.Escr.dificuldades ='
]) {
  const found = scripts.find(s => s.includes(marker));
  assert.ok(found, 'Script ausente para marker: ' + marker);
  vm.runInContext(found, context);
}

const E = context.Escr;
assert.equal(E.templates.list().length, 8);

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

// 3b. versoCore: células silábicas, sinalefa clicável e rimas consoantes/toantes
const scanAmor = E.versoCore.scanLine('Amor é fogo que arde sem se ver');
const cellsInfo = E.versoCore.buildSyllableCells(scanAmor);
assert.ok(cellsInfo && cellsInfo.poeticCount === 10);
assert.ok(Array.isArray(cellsInfo.cells) && cellsInfo.cells.length === 10);
assert.ok(cellsInfo.cells.some(c => c.tonic));
const elidableCell = cellsInfo.cells.find(c => c.canToggleElision);
assert.ok(elidableCell && elidableCell.fused === true);
const override = {};
override[elidableCell.elisionKey] = false;
const cellsUnfused = E.versoCore.buildSyllableCells(scanAmor, override);
assert.equal(cellsUnfused.poeticCount, cellsInfo.poeticCount + 1);

const rhymeSets = E.versoCore.findRhymes('vida', 12);
assert.ok(rhymeSets && Array.isArray(rhymeSets.consonant) && Array.isArray(rhymeSets.assonant));
assert.ok(rhymeSets.consonant.length > 0);
assert.ok(rhymeSets.assonant.length > 0);
const toanteCasa = E.versoCore.findRhymes('casa', 12);
assert.ok(toanteCasa && Array.isArray(toanteCasa.assonant) && toanteCasa.assonant.length > 0);

// 4. Modelo 8: Canção / Música (blocos, espelho de cadência, cifras e transposição)
const cancao = E.templates.createProject(books, archive, 'cancao', 'Minha Canção', 'salvia');
const songNote = cancao.notes.find(n => n.role === 'song');
assert.ok(songNote);
assert.equal(songNote.folder, '02 · Letra');
assert.ok(songNote.songSettings && songNote.songSettings.bpm === 92);

const songSample = [
  '[Estrofe 1]',
  'Am7           F7M',
  'Quando a chuva cai na rua vazia',
  'C             G',
  'O teu nome acende o meu coração',
  '',
  '[Refrão]',
  '[Am7] Volta pra perto de mim',
  '[F7M] Deixa a janela se abrir',
  '',
  '[Estrofe 2]',
  'Quando o vento passa pela varanda',
  'A saudade canta nessa canção'
].join('\n');

// Cursor na linha 11 (Estrofe 2) para ativar o Espelho de Cadência contra Estrofe 1
const parsedSong = E.songCore.parseSong(songSample, 11, songNote.songSettings);
assert.equal(parsedSong.sections.length, 3);
assert.equal(parsedSong.sections[0].kind, 'verse');
assert.equal(parsedSong.sections[1].kind, 'chorus');
assert.equal(parsedSong.sections[2].kind, 'verse');
// Linhas exclusivas de cifra ("Am7 F7M", "C G") não devem entrar como versos cantados
assert.equal(parsedSong.sections[0].lines.length, 2);
// Cifras entre colchetes no refrão devem ser removidas da contagem cantada
assert.equal(parsedSong.sections[1].lines[0].text, 'Volta pra perto de mim');
// Espelho de cadência Estrofe 2 vs Estrofe 1 deve comparar linha a linha
assert.ok(parsedSong.mirrorSource && parsedSong.mirrorSource.label === 'Estrofe 1');
assert.equal(parsedSong.mirrorRows.length, 2);
assert.ok(parsedSong.mirrorRows[0].refSyllables > 0 && parsedSong.mirrorRows[0].curSyllables > 0);

const transposed = E.songCore.transposeSongText(songSample, 2);
assert.ok(transposed.includes('Bm7'));
assert.ok(transposed.includes('[Bm7] Volta pra perto de mim'));
assert.ok(transposed.includes('G7M'));

// 5. Guia Usos da Língua (Dicionário de Dificuldades PT-BR)
assert.equal(E.dificuldades.categories.length, 9);
assert.equal(E.dificuldades.list().length, 120);
assert.ok(typeof E.dificuldades.manifesto === 'string' && E.dificuldades.manifesto.includes('adequação de uso'));
const hitOnde = E.dificuldades.lookupWord('aonde');
assert.ok(hitOnde && hitOnde.id === 'onde-aonde');
const hitMal = E.dificuldades.lookupWord('mau');
assert.ok(hitMal && hitMal.id === 'mal-mau');
const craseResults = E.dificuldades.search('crase');
assert.ok(Array.isArray(craseResults) && craseResults.length >= 5);

console.log('OK: 8 modelos, Soneto Visual Ao Vivo, Oficina de Canção/Música e Guia Usos da Língua (120 verbetes PT-BR) verificados.');
