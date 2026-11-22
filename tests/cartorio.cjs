/* Executar: node tests/cartorio.cjs. Testa SHA-256 puro ES5, cadeia de criação, colagens externas e detecção de adulteração. */
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const context = vm.createContext({});
for (const marker of [
  "var prefix = 'escrevaral.astra.v1.doc.'",
  '/* Cartório do Escrevaral:',
  '/* Linhagem local:',
  'E.validPlanner =',
  '/* Universo do caderno:',
  '/* Quadro do caderno:',
  '/* Cadernos: dados ES5'
]) {
  const src = scripts.find(s => s.includes(marker));
  assert.ok(src, 'módulo ausente: ' + marker);
  vm.runInContext(src, context);
}

const E = context.Escr;
const plain = v => JSON.parse(JSON.stringify(v));

/* 1. SHA-256 puro ES5 confere bit a bit com Node crypto (inclusive UTF-8 português e emoji) */
for (const sample of ['', 'abc', 'O escrevaral é uma carta de amor à escrita criativa.', 'ação, coração, cão — 1234567890! ✒️', 'a'.repeat(1000)]) {
  const expected = crypto.createHash('sha256').update(sample, 'utf8').digest('hex');
  assert.equal(E.cartorio.sha256(sample), expected, 'SHA-256 divergiu em: ' + sample.slice(0, 20));
}

class Storage {
  constructor() { this.data = new Map(); }
  get length() { return this.data.size; }
  key(i) { return Array.from(this.data.keys())[i] || null; }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k, v) { this.data.set(k, String(v)); }
  removeItem(k) { this.data.delete(k); }
}

/* 2. Fluxo limpo de criação dentro do Escrevaral (sem colagem externa) */
const store = new Storage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);
const book = books.add('Romance do Bunker');

let doc = E.freshDocument();
doc.projectId = book.id;
doc.project = book.name;
doc.title = 'Capítulo I';
doc.text = 'A chuva caía sobre o telhado de zinco.';
E.cartorio.recordSignal(doc, 'key', 38);
doc = archive.save(doc).document;

assert.ok(doc.cartorio, 'documento gravado recebe selo do Cartório');
assert.equal(doc.cartorio.origin, 'escrevaral');
assert.equal(doc.cartorio.chainLength, 1);
assert.equal(doc.cartorio.keystrokes, 38);
assert.equal(doc.cartorio.externalPastes, 0);

doc.text += ' O escritor acendeu a lâmpada.';
E.cartorio.recordSignal(doc, 'key', 30);
E.cartorio.recordSignal(doc, 'blockedPaste', 1);
doc = archive.save(doc, true).document;

assert.equal(doc.cartorio.chainLength, 2);
assert.equal(doc.cartorio.keystrokes, 68);
assert.equal(doc.cartorio.blockedPastes, 1);
assert.equal(doc.cartorio.trail[1].prev, doc.cartorio.trail[0].hash, 'elos encadeados corretamente');

const docReport = E.cartorio.verifyDocument(doc);
assert.equal(docReport.status, 'verified_clean');

/* 3. Exportação .scrvrl selada + ida e volta determinística + verificação do pacote */
const pack = books.pack(archive.list(true).documents, book.id);
books.validate(pack);
assert.ok(pack.cartorio && E.cartorio.validPackageSeal(pack.cartorio), 'pacote recebe selo SHA-256');

const dst = new Storage();
const dstBooks = E.createNotebooks(dst);
dstBooks.bring(pack);
const round = dstBooks.pack(E.createArchive(dst).list(true).documents, book.id);
assert.deepEqual(plain(round), plain(pack), 'selo do Cartório é 100% determinístico em ida/volta');

const cleanVerdict = E.cartorio.verifyPackage(JSON.stringify(pack));
assert.equal(cleanVerdict.packageIntegrity, 'intact');
assert.equal(cleanVerdict.verdict, 'integro_sem_colagem');
assert.equal(cleanVerdict.totals.externalPastes, 0);
assert.equal(cleanVerdict.totals.blockedPastes, 1);
assert.equal(cleanVerdict.totals.keystrokes, 68);

/* 4. Adulteração de 1 único caractere no texto é detectada imediatamente */
const tamperedText = plain(pack);
tamperedText.documents[0].text = tamperedText.documents[0].text.replace('chuva', 'neve');
const tamperedReport = E.cartorio.verifyPackage(tamperedText);
assert.equal(tamperedReport.packageIntegrity, 'tampered');
assert.equal(tamperedReport.verdict, 'adulterado');
assert.equal(tamperedReport.documents[0].status, 'tampered');

/* 5. Adulteração dos contadores (tentar esconder uma colagem externa) é detectada */
let pastedDoc = E.freshDocument();
pastedDoc.projectId = book.id;
pastedDoc.project = book.name;
pastedDoc.title = 'Ensaio';
pastedDoc.text = 'Trecho colado de fora do Escrevaral.';
E.cartorio.recordSignal(pastedDoc, 'extPaste', 36);
pastedDoc = archive.save(pastedDoc).document;
assert.equal(E.cartorio.verifyDocument(pastedDoc).status, 'verified_with_paste');

const cheatDoc = plain(pastedDoc);
cheatDoc.cartorio.externalPastes = 0;
cheatDoc.cartorio.externalPasteChars = 0;
assert.equal(E.cartorio.verifyDocument(cheatDoc).status, 'tampered', 'alterar contador de colagem quebra o hash');

/* 6. Pacote com mistura de limpo + colagem externa reporta ressalva transparente */
const mixedPack = books.pack(archive.list(true).documents, book.id);
const mixedReport = E.cartorio.verifyPackage(mixedPack);
assert.equal(mixedReport.packageIntegrity, 'intact');
assert.equal(mixedReport.verdict, 'integro_com_ressalvas');
assert.equal(mixedReport.totals.clean, 1);
assert.equal(mixedReport.totals.withPaste, 1);
assert.equal(mixedReport.totals.externalPastes, 1);
assert.equal(mixedReport.totals.externalPasteChars, 36);

/* 7. Texto importado recebe origem 'imported' e certificado em texto contém Camada 1 e Camada 2 */
let importedDoc = E.freshDocument();
importedDoc.title = 'Antigo';
importedDoc.text = 'Texto trazido de arquivo .txt.';
importedDoc.cartorio = E.cartorio.sealDocument(null, importedDoc, 'imported');
assert.equal(E.cartorio.verifyDocument(importedDoc).status, 'verified_imported');

const certText = E.cartorio.formatCertificateText(cleanVerdict, 'romance.scrvrl');
assert.ok(certText.includes('CARTÓRIO DO ESCREVARAL'));
assert.ok(certText.includes(cleanVerdict.packageHash));
assert.ok(certText.includes('Camada 1') && certText.includes('Camada 2'));

/* 8. Impressão do certificado na UI não usa onclick inline (respeita CSP estrita) */
const fs = require('node:fs'), path = require('node:path');
const cartUiSrc = fs.readFileSync(path.join(__dirname, '..', 'src/ui/cartorio.js'), 'utf8');
assert.ok(!cartUiSrc.includes('onclick="window.print()"'), 'cartorio.js não pode usar onclick inline bloqueado pela CSP');
assert.ok(cartUiSrc.includes("getElementById('cert-print-btn')"), 'cartorio.js liga botão de impressão via addEventListener');

console.log('OK: Cartório SHA-256 ES5, cadeia encadeada, colagem externa/bloqueada, determinismo ida/volta, detecção de adulteração e impressão compatível com CSP.');
