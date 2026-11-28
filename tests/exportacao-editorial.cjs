/* Executar: node tests/exportacao-editorial.cjs */
'use strict';
const fs = require('node:fs');
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

/* Leitor ZIP mínimo (Store) para auditar assinaturas, CRC-32, nomes e conteúdo */
function parseZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dec = new TextDecoder('utf-8');
  let pos = 0;
  const entries = [];
  while (pos + 4 <= bytes.length && view.getUint32(pos, true) === 0x04034B50) {
    const flags = view.getUint16(pos + 6, true);
    const method = view.getUint16(pos + 8, true);
    const crc = view.getUint32(pos + 14, true);
    const compSize = view.getUint32(pos + 18, true);
    const uncompSize = view.getUint32(pos + 22, true);
    const nameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    const nameStart = pos + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = dec.decode(bytes.subarray(nameStart, nameStart + nameLen));
    const data = bytes.subarray(dataStart, dataStart + compSize);
    entries.push({ name, flags, method, crc, compSize, uncompSize, extraLen, data, text: dec.decode(data) });
    pos = dataStart + compSize;
  }
  const cdStart = pos;
  let cdCount = 0;
  while (pos + 4 <= bytes.length && view.getUint32(pos, true) === 0x02014B50) {
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    pos += 46 + nameLen + extraLen + commentLen;
    cdCount += 1;
  }
  assert.equal(view.getUint32(pos, true), 0x06054B50, 'assinatura End of Central Directory válida');
  assert.equal(view.getUint16(pos + 8, true), entries.length, 'contagem de entradas no EOCD');
  assert.equal(view.getUint16(pos + 10, true), cdCount, 'contagem de entradas no diretório central');
  assert.equal(view.getUint32(pos + 16, true), cdStart, 'offset do diretório central');
  assert.equal(pos + 22, bytes.length, 'tamanho exato do arquivo ZIP sem bytes sobrando');
  return entries;
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
  'root.Escr.printCore =',
  'root.Escr.editorialExport ='
]) {
  const s = scripts.find(src => src.includes(marker));
  assert.ok(s, 'Faltando script no bundle: ' + marker);
  vm.runInContext(s, context);
}

const E = context.Escr;
const exp = E.editorialExport;

// 1. UTF-8 e CRC-32 IEEE 802.3 (vetor padrão "123456789" -> 0xCBF43926)
assert.equal(exp.crc32(exp.utf8Bytes('123456789')), 0xCBF43926, 'CRC-32 IEEE 802.3 exato');
const utf8Sample = exp.utf8Bytes('Ação, coração & 🎼');
assert.equal(new TextDecoder('utf-8').decode(utf8Sample), 'Ação, coração & 🎼', 'UTF-8 preserva acentos PT-BR e pares substitutos');

// 2. Parser de blocos: texto simples + rich HTML (negrito, itálico, citação aninhada, lista, deduplicação H1, prompts)
const richBlocks = exp.parseDocumentBlocks({
  format: 'rich',
  title: 'Capítulo 01',
  text: 'Capítulo 01',
  richHtml: '<h1>Capítulo 01</h1><p>Primeiro <strong>parágrafo</strong> com <em>ênfase</em> e &ldquo;aspas&rdquo;.</p><blockquote><p>Uma citação literária.</p></blockquote><ul><li>Item um</li><li>Item dois</li></ul><hr/><p>Depois da quebra.</p>'
}, { dedupeHeading: true, stripPlaceholders: true }, 'Capítulo 01');

assert.equal(richBlocks[0].type, 'p', 'H1 duplicado removido na abertura');
assert.ok(richBlocks[0].runs.some(r => r.bold && r.text === 'parágrafo'), 'Preserva negrito');
assert.ok(richBlocks[0].runs.some(r => r.italic && r.text === 'ênfase'), 'Preserva itálico');
assert.equal(richBlocks[1].type, 'blockquote', 'Preserva blockquote com <p> interno');
assert.equal(richBlocks[2].type, 'li', 'Preserva lista');
assert.equal(richBlocks[4].type, 'scene-break', 'Converte <hr> em quebra de cena');

// 3. Geração .DOCX (OOXML completo, PT-BR, folha de rosto, dedicatória, sumário, capítulos, colofão, XSS escapado)
const bookCfg = E.printCore.normalizeConfig({
  scope: 'book',
  format: '14x21',
  gutterMm: 2,
  mirrorMargins: true,
  chapterBreak: true,
  runningHead: true,
  pageNumPos: 'bottom-outer',
  frontMatter: true,
  toc: true,
  colophon: true,
  dropCap: true,
  bookTitle: 'O Vento do Sul',
  bookSubtitle: 'Romance',
  authorName: 'Rafa Mass',
  editionNote: 'São Paulo · 2026',
  dedication: 'Para quem escreve em silêncio.'
}, 'livro-ficcao');

const chapters = [
  {
    id: 'ch1', noteId: 'ch1', format: 'plain',
    title: '01. Capítulo 01', displayTitle: 'Capítulo 01',
    text: '# Capítulo 01\n\nPrimeiro parágrafo longo com acentuação: coração, bênção, « aspas do autor » e <script>alert(1)</script>.\n\n« Uma voz, uma ação pequena ou um detalhe do lugar: por onde sua história começa? »\n\n---\n\nSegundo parágrafo da narrativa.'
  },
  {
    id: 'ch2', noteId: 'ch2', format: 'rich',
    title: '02. Capítulo 02', displayTitle: 'Capítulo 02',
    text: 'Capítulo dois em modo formatado com destaque.',
    richHtml: '<p>Capítulo dois em <strong>modo formatado</strong> com <em>destaque</em>.</p><blockquote><p>Epígrafe interna.</p></blockquote>'
  }
];

const fixedDate = new Date('2026-11-27T19:00:00Z');
const docx = exp.buildDocx({ config: bookCfg, chapters, now: fixedDate });
assert.equal(docx.mime, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
assert.equal(docx.filename, 'O-Vento-do-Sul.docx');
assert.ok(ArrayBuffer.isView(docx.bytes) && docx.bytes.length > 2000);

const docxEntries = parseZip(docx.bytes);
const docxByName = Object.fromEntries(docxEntries.map(e => [e.name, e]));
for (const reqPart of [
  '[Content_Types].xml',
  '_rels/.rels',
  'docProps/core.xml',
  'docProps/app.xml',
  'word/document.xml',
  'word/styles.xml',
  'word/settings.xml',
  'word/header1.xml',
  'word/footer1.xml',
  'word/_rels/document.xml.rels'
]) {
  assert.ok(docxByName[reqPart], 'Parte OOXML obrigatória presente: ' + reqPart);
  assert.equal(exp.crc32(docxByName[reqPart].data), docxByName[reqPart].crc, 'CRC-32 íntegro em ' + reqPart);
}
const docXml = docxByName['word/document.xml'].text;
assert.ok(docXml.includes('O Vento do Sul') && docXml.includes('RAFA MASS'), 'Folha de rosto presente no DOCX');
assert.ok(docXml.includes('Para quem escreve em silêncio.'), 'Dedicatória presente no DOCX');
assert.ok(docXml.includes('Sumário'), 'Sumário presente no DOCX');
assert.ok(docXml.includes('« aspas do autor »'), 'Aspas literárias preservadas no DOCX');
assert.ok(!docXml.includes('por onde sua história começa'), 'Placeholder de modelo removido no DOCX');
assert.ok(!docXml.includes('<script>alert(1)</script>') && docXml.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'XML escapado contra injeção no DOCX');
assert.ok(docXml.includes('<w:b/>') && docXml.includes('<w:i/>'), 'Negrito e itálico preservados no DOCX');
assert.ok(docXml.includes('w:val="Quote"'), 'Estilo Quote aplicado ao blockquote no DOCX');
assert.ok(docxByName['word/styles.xml'].text.includes('<w:lang w:val="pt-BR"/>'), 'Idioma pt-BR definido nos estilos DOCX');

// 4. Geração .EPUB (EPUB 3.0 + EPUB 2.0 NCX, mimetype primeiro e sem compressão)
const epub = exp.buildEpub({ config: bookCfg, chapters, now: fixedDate });
assert.equal(epub.mime, 'application/epub+zip');
assert.equal(epub.filename, 'O-Vento-do-Sul.epub');
assert.ok(ArrayBuffer.isView(epub.bytes) && epub.bytes.length > 2000);

const epubEntries = parseZip(epub.bytes);
assert.equal(epubEntries[0].name, 'mimetype', 'EPUB OCF 3.0: mimetype é a primeira entrada');
assert.equal(epubEntries[0].method, 0, 'EPUB OCF 3.0: mimetype sem compressão (Store)');
assert.equal(epubEntries[0].extraLen, 0, 'EPUB OCF 3.0: mimetype sem campo extra');
assert.equal(epubEntries[0].flags, 0, 'EPUB OCF 3.0: mimetype com flags zeradas');
assert.equal(epubEntries[0].text, 'application/epub+zip', 'EPUB OCF 3.0: conteúdo exato de mimetype');

const epubByName = Object.fromEntries(epubEntries.map(e => [e.name, e]));
for (const reqPart of [
  'META-INF/container.xml',
  'OEBPS/styles/book.css',
  'OEBPS/text/titlepage.xhtml',
  'OEBPS/text/dedication.xhtml',
  'OEBPS/text/ch-001.xhtml',
  'OEBPS/text/ch-002.xhtml',
  'OEBPS/text/colophon.xhtml',
  'OEBPS/nav.xhtml',
  'OEBPS/toc.ncx',
  'OEBPS/content.opf'
]) {
  assert.ok(epubByName[reqPart], 'Parte EPUB obrigatória presente: ' + reqPart);
  assert.equal(exp.crc32(epubByName[reqPart].data), epubByName[reqPart].crc, 'CRC-32 íntegro em ' + reqPart);
}
assert.ok(epubByName['OEBPS/content.opf'].text.includes('<dc:language>pt-BR</dc:language>'), 'Idioma pt-BR no OPF');
assert.ok(epubByName['OEBPS/nav.xhtml'].text.includes('text/ch-001.xhtml') && epubByName['OEBPS/nav.xhtml'].text.includes('text/ch-002.xhtml'), 'Sumário EPUB 3 aponta para os capítulos');
assert.ok(epubByName['OEBPS/toc.ncx'].text.includes('text/ch-001.xhtml') && epubByName['OEBPS/toc.ncx'].text.includes('text/ch-002.xhtml'), 'Sumário EPUB 2 NCX aponta para os capítulos');
assert.ok(epubByName['OEBPS/text/ch-001.xhtml'].text.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'Escapa script no XHTML');
assert.ok(epubByName['OEBPS/text/ch-002.xhtml'].text.includes('<strong>modo formatado</strong>'), 'Negrito preservado no EPUB');
assert.ok(epubByName['OEBPS/text/ch-002.xhtml'].text.includes('<blockquote><p>Epígrafe interna.</p></blockquote>'), 'Blockquote preservado no EPUB');

// 5. Integração com Estúdio de Impressão (exportDocx / exportEpub + bloqueio com gabinete trancado)
const store = createStorage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);
const romance = E.templates.createProject(books, archive, 'livro-ficcao', 'O Vento do Sul', 'salvia');
const downloads = [];
const msgs = [];
const studio = E.mountPrintStudio({
  storage: store,
  getCurrentDoc: () => chapters[0],
  getActiveBook: () => romance.book,
  getBookDocs: () => romance.notes,
  download: (contents, mime, name) => { downloads.push({ contents, mime, name }); return true; },
  message: (m) => { msgs.push(m); }
});

bodyEl.setAttribute('data-locked', 'true');
assert.equal(studio.exportDocx(), false, 'Recusa exportar DOCX com gabinete trancado');
assert.equal(studio.exportEpub(), false, 'Recusa exportar EPUB com gabinete trancado');
assert.equal(downloads.length, 0);

bodyEl.setAttribute('data-locked', 'false');
const resDocx = studio.exportDocx();
const resEpub = studio.exportEpub();
assert.ok(resDocx && resDocx.filename.endsWith('.docx'), 'exportDocx gera arquivo .docx pelo Estúdio');
assert.ok(resEpub && resEpub.filename.endsWith('.epub'), 'exportEpub gera arquivo .epub pelo Estúdio');
assert.equal(downloads.length, 2);
assert.ok(ArrayBuffer.isView(downloads[0].contents), 'DOCX enviado como Uint8Array binário');
assert.ok(ArrayBuffer.isView(downloads[1].contents), 'EPUB enviado como Uint8Array binário');
assert.ok(msgs.some(m => m.includes('.docx')) && msgs.some(m => m.includes('.epub')), 'Mensagem de confirmação emitida');

// 6. Botões presentes no template HTML e no Estúdio de Impressão
const tplHtml = fs.readFileSync('src/index.template.html', 'utf8');
assert.ok(tplHtml.includes('id="export-docx"') && tplHtml.includes('id="export-epub"'), 'Botões DOCX/EPUB presentes em Ajustes');
const impSrc = fs.readFileSync('src/ui/impressao.js', 'utf8');
assert.ok(impSrc.includes('id="esc-print-docx-btn"') && impSrc.includes('id="esc-print-epub-btn"'), 'Botões DOCX/EPUB presentes no Estúdio de Impressão');

console.log('OK: Exportação editorial offline (.DOCX OOXML + .EPUB 3.0/NCX), ZIP CRC-32, integração no Estúdio/Ajustes e blindagem verificados.');
