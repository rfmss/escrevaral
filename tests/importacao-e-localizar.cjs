/* Testes dos Pacotes 3 e 4: Importador editorial (.docx ZIP+DEFLATE, .md) e Localizar/Substituir — ES5.
 * Executar: node tests/importacao-e-localizar.cjs */
'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const zlib = require('node:zlib');
const scripts = require('./helpers/sources.cjs').scripts();

const context = vm.createContext({
  Escr: {},
  Uint8Array,
  Int32Array,
  DataView,
  TextEncoder,
  TextDecoder
});
context.window = context;

for (const marker of [
  'root.Escr.editorialExport =',
  'root.Escr.editorialImport =',
  'root.Escr.findReplaceCore ='
]) {
  const src = scripts.find(s => s.includes(marker));
  assert.ok(src, 'Módulo ausente: ' + marker);
  vm.runInContext(src, context);
}

const E = context.Escr;

// 1. Testar DEFLATE raw puro ES5 contra zlib.deflateRawSync (com blocos dinâmicos e texto PT-BR acentuado)
const bigSample = 'No meio do caminho tinha uma pedra — ação, coração, órgão, açúcar, café e música brasileira! '.repeat(60);
const rawUtf8 = Buffer.from(bigSample, 'utf8');
const compressed = zlib.deflateRawSync(rawUtf8);
const inflated = E.editorialImport.inflateRaw(new Uint8Array(compressed));
assert.equal(Buffer.from(inflated).toString('utf8'), bigSample);

// 2. Round-trip .docx completo: exportar com editorialExport -> importar com editorialImport
const exported = E.editorialExport.buildDocx({
  title: 'Romance de Teste',
  author: 'Rafa',
  chapters: [
    { title: 'Capítulo 1 — A Chegada', text: 'A chuva caía fina sobre o telhado.\n\nClara abriu o portão sem fazer ruído.' },
    { title: 'Capítulo 2 — A Carta', text: 'Sobre a mesa havia um envelope pardo & lacrado.\n\n“Não esqueça o que combinamos”, dizia o bilhete.' }
  ]
});
assert.ok(exported && exported.bytes && exported.bytes.length > 200);
const importedDocx = E.editorialImport.parseDocxBytes(exported.bytes, 'Romance_de_Teste.docx');
assert.equal(importedDocx.sourceFormat, 'docx');
assert.ok(importedDocx.chapters.length >= 2, 'Deve dividir capítulos por títulos do .docx');
assert.ok(importedDocx.text.includes('A chuva caía fina sobre o telhado.'));
assert.ok(importedDocx.text.includes('envelope pardo & lacrado.'));

// 3. Testar .docx comprimido com DEFLATE (método 8, exatamente como Microsoft Word / LibreOffice geram!)
function makeDeflatedZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const raw = Buffer.from(data, 'utf8');
    const comp = zlib.deflateRawSync(raw);
    const local = Buffer.alloc(30 + nameBuf.length + comp.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8); // DEFLATE!
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    nameBuf.copy(local, 30);
    comp.copy(local, 30 + nameBuf.length);
    locals.push(local);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(8, 10); // DEFLATE!
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);
    offset += local.length;
  }
  const cdBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cdBuf, eocd]));
}

const wordXmlSample =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
  '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Prólogo</w:t></w:r></w:p>' +
  '<w:p><w:r><w:t>Era outono em Recife &amp; o vento trazia cheiro de café.</w:t></w:r></w:p>' +
  '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Capítulo I</w:t></w:r></w:p>' +
  '<w:p><w:r><w:t>Pedro atravessou a ponte.</w:t></w:r></w:p>' +
  '</w:body></w:document>';
const deflatedDocx = makeDeflatedZip([{ name: 'word/document.xml', data: wordXmlSample }]);
const parsedWord = E.editorialImport.parseDocxBytes(deflatedDocx, 'Meu_Livro.docx');
assert.equal(parsedWord.chapters.length, 2);
assert.equal(parsedWord.chapters[0].title, 'Prólogo');
assert.equal(parsedWord.chapters[0].text, 'Era outono em Recife & o vento trazia cheiro de café.');
assert.equal(parsedWord.chapters[1].title, 'Capítulo I');
assert.equal(parsedWord.chapters[1].text, 'Pedro atravessou a ponte.');

// 4. Importação de Markdown com múltiplos capítulos e YAML frontmatter
const mdSample = '---\ntitle: Teste\n---\n\n# Capítulo 1\n**Negrito** e *itálico* com [link](https://example.com).\n\n## Capítulo 2\nSegundo trecho limpo.';
const parsedMd = E.editorialImport.parseMarkdown(mdSample, 'rascunho.md');
assert.equal(parsedMd.chapters.length, 2);
assert.equal(parsedMd.chapters[0].title, 'Capítulo 1');
assert.equal(parsedMd.chapters[0].text, 'Negrito e itálico com link.');
assert.equal(parsedMd.chapters[1].title, 'Capítulo 2');
assert.equal(parsedMd.chapters[1].text, 'Segundo trecho limpo.');

// 5. Localizar e substituir (case-insensitive, case-sensitive, palavra inteira acentuada PT-BR)
const sample = 'Pedro olhou para Pedrinho e disse: pedro nunca desiste de ação e coração.';
const mAll = E.findReplaceCore.findMatches(sample, 'pedro', { caseSensitive: false, wholeWord: false });
assert.equal(mAll.length, 2);
const mCase = E.findReplaceCore.findMatches(sample, 'Pedro', { caseSensitive: true, wholeWord: true });
assert.equal(mCase.length, 1);
assert.equal(mCase[0].start, 0);

const mWord = E.findReplaceCore.findMatches(sample, 'ação', { caseSensitive: false, wholeWord: true });
assert.equal(mWord.length, 1); // não deve casar dentro de "coração"!
assert.equal(sample.slice(mWord[0].start, mWord[0].end), 'ação');

const oneRep = E.findReplaceCore.replaceOne(sample, mCase[0], 'Tomás');
assert.ok(oneRep.startsWith('Tomás olhou para Pedrinho'));

const allRep = E.findReplaceCore.replaceAll(sample, 'pedro', 'Tomás', { caseSensitive: false, wholeWord: true });
assert.equal(allRep.count, 2);
assert.equal(allRep.text, 'Tomás olhou para Pedrinho e disse: Tomás nunca desiste de ação e coração.');

console.log('OK: Importador editorial (.docx ZIP+DEFLATE, .md) e Localizar/Substituir (PT-BR) verificados.');
