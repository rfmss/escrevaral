/* Executar: node tests/impressao-paginacao.cjs */
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

function makeEl(tag) {
  const attrs = {};
  const listeners = {};
  const el = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    value: '',
    checked: false,
    selected: false,
    style: {},
    children: [],
    childNodes: [],
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; },
    appendChild(c) {
      el.children.push(c);
      el.childNodes.push(c);
      if (c && c.id) { nodeRegistry[c.id] = c; }
      return c;
    },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    click() { (listeners.click || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {} })); },
    querySelectorAll() { return []; },
    focus() {}
  };
  return el;
}

const nodeRegistry = {};
const headEl = makeEl('head');
const bodyEl = makeEl('body');
const printSheetEl = makeEl('article');
printSheetEl.id = 'print-sheet';
nodeRegistry['print-sheet'] = printSheetEl;

const context = vm.createContext({
  Event: function (t) { this.type = t; },
  document: {
    head: headEl,
    body: bodyEl,
    activeElement: null,
    getElementById(id) { return nodeRegistry[id] || null; },
    getElementsByTagName(tag) { return tag === 'head' ? [headEl] : []; },
    createElement: makeEl,
    createTextNode(val) { return { nodeType: 3, nodeValue: val }; },
    createDocumentFragment() {
      const f = { nodeType: 11, childNodes: [], firstChild: null, appendChild(c) { f.childNodes.push(c); return c; } };
      return f;
    }
  }
});
context.window = context;

const cofreCount = require('../build/modules.json').cofre.length;
for (let i = 0; i < cofreCount; i += 1) {
  vm.runInContext(scripts[i], context);
}
for (const marker of [
  "var prefix = 'escrevaral.astra.v1.doc.'",
  '/* Cadernos: dados ES5',
  'var PALETTES =',
  'root.Escr.richEditor =',
  'createProjectFromTemplate',
  'root.Escr.printCore ='
]) {
  const s = scripts.find(src => src.includes(marker));
  assert.ok(s, 'Faltando script: ' + marker);
  vm.runInContext(s, context);
}

const E = context.Escr;
const store = createStorage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);

// 1. Adaptação dos 7 modelos: pastas de manuscrito, preset editorial e richHtml inicializado corretamente
assert.equal(E.templates.printPresetFor('livro-ficcao'), 'livro-literario');
assert.equal(E.templates.printPresetFor('livro-nao-ficcao'), 'nao-ficcao');
assert.equal(E.templates.printPresetFor('roteiro'), 'roteiro');
assert.equal(E.templates.printPresetFor('soneto'), 'poesia');
assert.deepEqual(Array.from(E.templates.manuscriptFoldersFor('livro-ficcao')), ['04 · Manuscrito']);
assert.deepEqual(Array.from(E.templates.manuscriptFoldersFor('redacao-enem')), ['02 · Redação']);

const romance = E.templates.createProject(books, archive, 'livro-ficcao', 'O Vento do Sul', 'salvia', null, 'rich');
assert.deepEqual(Array.from(romance.book.data.manuscriptFolders), ['04 · Manuscrito']);
assert.equal(romance.book.data.printPreset, 'livro-literario');
const cap1 = romance.notes.find(n => n.title.includes('Capítulo 01'));
assert.ok(cap1 && cap1.format === 'rich' && cap1.richHtml && cap1.richHtml.includes('<h1>'), 'createProject popula richHtml usando richEditor.plainToSafeHtml');

// 2. Seleção inteligente de manuscrito exclui Estrutura, Personagens, Universo e Revisão
const msDocs = E.printCore.selectManuscriptDocs(romance.book, romance.notes);
assert.equal(msDocs.length, 3, 'Livro de ficção seleciona apenas os 3 capítulos de 04 · Manuscrito');
assert.ok(msDocs.every(d => d.folder === '04 · Manuscrito'));

const enem = E.templates.createProject(books, archive, 'redacao-enem', 'Enem 2026', 'areia');
const enemMs = E.printCore.selectManuscriptDocs(enem.book, enem.notes);
assert.equal(enemMs.length, 1);
assert.equal(enemMs[0].folder, '02 · Redação');
assert.ok(enemMs.every(d => d.category !== 'reference'), 'Referência protegida nunca entra no miolo padrão');

// 3. Ordenação natural de capítulos (Capítulo 2 antes de Capítulo 10) e limpeza de prefixo
const unsorted = [
  { id: 'c10', noteId: 'c10', folder: '04 · Manuscrito', title: '10. Capítulo 10', text: 'Dez.' },
  { id: 'c2', noteId: 'c2', folder: '04 · Manuscrito', title: '02. Capítulo 2', text: 'Dois.' },
  { id: 'c1', noteId: 'c1', folder: '04 · Manuscrito', title: '01. Capítulo 1', text: 'Um.' }
];
const sorted = E.printCore.sortBookDocs(romance.book, unsorted);
assert.deepEqual(sorted.map(d => d.id), ['c1', 'c2', 'c10']);
assert.equal(E.printCore.stripNumericPrefix('06. Capítulo 01'), 'Capítulo 01');

// 4. Omissão segura de prompts de modelo preservando aspas literárias do autor
const mixedText = 'Ela respondeu « nunca mais » antes de sair.\n\n« Uma voz, uma ação pequena ou um detalhe do lugar: por onde sua história começa? »';
const stripped = E.printCore.stripGuidePlaceholders(mixedText);
assert.ok(stripped.includes('« nunca mais »'), 'Preserva aspas latinas literárias escritas pelo autor');
assert.ok(!stripped.includes('por onde sua história começa'), 'Remove prompt conhecido do modelo na projeção de impressão');

// 5. Geração de CSS Paged Media (@page, trim size 140x210mm, lombada espelhada :left/:right, capítulo em página ímpar)
const bookCfg = E.printCore.normalizeConfig({
  scope: 'book',
  format: '14x21',
  gutterMm: 4,
  mirrorMargins: true,
  chapterBreak: true,
  chapterRecto: true,
  frontMatter: true,
  toc: true,
  colophon: true,
  bookTitle: 'O Vento do Sul',
  authorName: 'Rafa Mass',
  dedication: 'Para quem escreve em silêncio.'
}, 'livro-ficcao');

const pageCss = E.printCore.buildPageCss(bookCfg);
assert.ok(pageCss.includes('size: 140mm 210mm;'), 'Define trim size exato 14x21cm');
assert.ok(pageCss.includes('@page :right { margin-left: 26mm; margin-right: 15mm;'), 'Aplica calha interna 22+4=26mm na página ímpar');
assert.ok(pageCss.includes('@page :left { margin-left: 15mm; margin-right: 26mm;'), 'Espelha calha interna 26mm na página par');
assert.ok(pageCss.includes('@page esc-front'), 'Suprime cabeçalho e fólio nos pré-textuais');
assert.ok(pageCss.includes('break-before: right;'), 'Força abertura de capítulo em página ímpar quando ativado');
assert.ok(pageCss.includes('hyphens: auto !important;'), 'Ativa hifenização pt-BR');
assert.ok(pageCss.includes('text-indent: 1.5em !important;'), 'Aplica recuo literário clássico');

// 6. Compilação completa do livro (folha de rosto + dedicatória + sumário + capítulos + colofão + deduplicação de H1 + anti-XSS)
const chapters = [
  {
    id: 'ch1', noteId: 'ch1', format: 'plain',
    title: '06. Capítulo 01', displayTitle: 'Capítulo 01',
    text: '# Capítulo 01\n\nPrimeiro parágrafo longo o suficiente para receber capitular clássica na abertura editorial do livro de ficção.\n\n---\n\nSegundo parágrafo com <script>alert(1)</script> escapado.'
  },
  {
    id: 'ch2', noteId: 'ch2', format: 'plain',
    title: '07. Capítulo 02', displayTitle: 'Capítulo 02',
    text: 'Capítulo dois segue firme pela estrada de terra até o porto.'
  }
];
const compiled = E.printCore.renderPrintSheetHtml({ config: bookCfg, chapters });
assert.ok(compiled.includes('ep-title-page') && compiled.includes('O Vento do Sul') && compiled.includes('Rafa Mass'));
assert.ok(compiled.includes('ep-dedication') && compiled.includes('Para quem escreve em silêncio.'));
assert.ok(compiled.includes('ep-toc') && compiled.includes('Sumário'));
assert.ok(compiled.includes('ep-dropcap'), 'Aplica capitular no primeiro parágrafo longo');
assert.ok(compiled.includes('ep-scene-break'), 'Converte --- em ornamento de quebra de cena');
assert.ok(compiled.includes('ep-colophon'), 'Inclui colofão editorial');
assert.ok(!compiled.includes('<script>alert(1)</script>') && compiled.includes('&lt;script&gt;'), 'Escapa HTML potencialmente perigoso');
assert.equal((compiled.match(/Capítulo 01/g) || []).length, 2, 'Capítulo 01 aparece apenas no Sumário e no cabeçalho do capítulo (sem H1 duplicado)');

// 7. HTML autônomo paginado e estimativa honesta de páginas
const est = E.printCore.estimatePages(chapters, bookCfg);
assert.ok(est.totalPages >= 5, 'Estimativa inclui folha de rosto, dedicatória, sumário, capítulos e colofão');
const standalone = E.printCore.buildStandaloneHtml({ config: bookCfg, chapters });
assert.ok(standalone.startsWith('<!DOCTYPE html>') && standalone.includes('size: 140mm 210mm;'));

// 8. Bloqueio total com gabinete trancado (data-locked="true") no studio montado
const studio = E.mountPrintStudio({
  storage: store,
  getCurrentDoc: () => chapters[0],
  getActiveBook: () => romance.book,
  getBookDocs: () => romance.notes
});
bodyEl.setAttribute('data-locked', 'true');
assert.equal(studio.prepareQuickPrint(), false, 'Recusa montar #print-sheet quando gabinete está trancado');
bodyEl.setAttribute('data-locked', 'false');
assert.equal(studio.prepareQuickPrint(), true, 'Monta #print-sheet normalmente quando gabinete está destrancado');
assert.ok(printSheetEl.innerHTML.includes('Primeiro parágrafo longo'));
studio.finishPrint();
assert.ok(!printSheetEl.innerHTML.includes('Primeiro parágrafo longo'), 'finishPrint limpa #print-sheet após impressão');

console.log('OK: Estúdio de Impressão e Paginação Editorial, adaptação dos 7 modelos, margens espelhadas, trim sizes e segurança verificados.');
