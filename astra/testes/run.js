'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var root = path.resolve(__dirname, '..'), passed = 0;
function test(name, fn) { try { fn(); passed += 1; } catch (e) { console.error('FALHOU: ' + name); throw e; } }
function source(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
var runtimeFiles = Array.from(source('index.html').matchAll(/<script src="([^"]+)"><\/script>/g), function (m) { return m[1]; });
function context() { var ctx = {}; vm.createContext(ctx); runtimeFiles.filter(function (f) { return f !== 'superficie/ponte.js'; }).forEach(function (file) { vm.runInContext(source(file), ctx); }); return ctx; }
function plain(x) { return JSON.parse(JSON.stringify(x)); }
function Storage() { this.data = {}; this.fail = false; this.beforeSet = null; }
Storage.prototype.getItem = function (key) { return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null; };
Storage.prototype.setItem = function (key, value) { if (this.fail) { var e = new Error('Sem espaço'); e.name = 'QuotaExceededError'; throw e; } if (this.beforeSet) { this.beforeSet(key, value); } this.data[key] = String(value); };
Storage.prototype.removeItem = function (key) { delete this.data[key]; };
Storage.prototype.key = function (i) { return Object.keys(this.data)[i] || null; };
Object.defineProperty(Storage.prototype, 'length', { get: function () { return Object.keys(this.data).length; } });
var ctx = context(), E = ctx.Escr, vault = E.createVault(E.knowledge), corpus = JSON.parse(source('testes/corpus-ouro.json'));
corpus.forEach(function (entry) {
  test(entry.id + ' — ' + entry.category, function () {
    var result = vault.analyze(entry.lens, entry.text);
    var actual = result.findings.map(function (f) { return { id: f.id, snippet: f.snippet, start: f.start, end: f.end, confidence: f.confidence }; });
    assert.deepStrictEqual(plain(actual), entry.expected);
    assert.strictEqual(JSON.stringify(result), JSON.stringify(vault.analyze(entry.lens, entry.text)));
    result.findings.forEach(function (f) { assert.ok(f.evidence.observation && f.evidence.interpretation && f.evidence.ambiguity && f.evidence.limit && f.evidence.source.title); });
  });
});
test('Todas as regras têm testes positivos e negativos', function () {
  E.knowledge.rules.forEach(function (rule) {
    assert.ok(corpus.some(function (entry) { return entry.expected.some(function (f) { return f.id === rule.id; }); }));
    assert.ok(corpus.some(function (entry) { return entry.lens === rule.lens && !entry.expected.length && entry.category === 'correto'; }));
  });
});
test('Extensão sem DOM ou mudança da interface', function () {
  var v = E.createVault(E.knowledge); v.register({ id: 'experimental', analyze: function () { return []; } });
  assert.strictEqual(v.analyze('experimental', 'Uma folha.').findings.length, 0);
  assert.throws(function () { v.register({ id: 'experimental', analyze: function () { return []; } }); });
});
test('Contrato rejeita uma lente quebrada e libera a próxima', function () {
  var v = E.createVault(E.knowledge); v.register({ id: 'quebrada', analyze: function () { return [{}]; } });
  assert.throws(function () { v.analyze('quebrada', 'texto'); });
  assert.strictEqual(v.analyze('ortografia', 'uma excessão').findings.length, 1);
});
test('Somente uma lente por chamada', function () {
  assert.strictEqual(vault.analyze('acentuacao', 'uma excessão,, voce').findings.length, 1);
  assert.strictEqual(vault.analyze('pontuacao', 'uma excessão,, voce').findings.length, 1);
});
test('Contrato rejeita NaN nos offsets e feature ausente', function () {
  [function (f) { f.start = NaN; }, function (f) { delete f.feature; }].forEach(function (mutate) {
    var v = E.createVault(E.knowledge), f = plain(v.analyze('ortografia', 'excessão').findings[0]);
    f.lens = 'invalida'; mutate(f); v.register({ id: 'invalida', analyze: function () { return [f]; } });
    assert.throws(function () { v.analyze('invalida', 'excessão'); });
  });
});
test('Reentrância é bloqueada', function () {
  var v = E.createVault(E.knowledge); v.register({ id: 'recursiva', analyze: function () { return v.analyze('ortografia', 'texto'); } });
  assert.throws(function () { v.analyze('recursiva', 'texto'); }, /Já existe/);
});
test('Entradas inválidas e limites explícitos', function () {
  assert.throws(function () { vault.analyze('inexistente', 'texto'); });
  assert.throws(function () { vault.analyze('ortografia', null); });
  assert.throws(function () { vault.analyze('ortografia', new Array(200002).join('a')); }, /200 mil/);
  var r = vault.analyze('ortografia', new Array(121).join('uma excessão ')); assert.strictEqual(r.findings.length, 100); assert.ok(r.limited);
});
test('Cofre não altera a entrada nem depende de APIs do navegador', function () {
  var before = JSON.stringify(E.knowledge), input = '😀 uma excessão';
  vault.analyze('ortografia', input); assert.strictEqual(input, '😀 uma excessão'); assert.strictEqual(JSON.stringify(E.knowledge), before);
  ['maquina/cofre.js', 'conhecimento/base.js'].forEach(function (file) { assert.ok(!/document\.|localStorage|fetch\(|XMLHttpRequest|navigator\./.test(source(file))); });
});
test('Gravar, reabrir e preservar chaves legadas', function () {
  var s = new Storage(), a = E.createArchive(s), d = E.freshDocument(); s.setItem('legacy-manuscript', 'intacto'); d.text = 'Minha folha';
  var saved = a.save(d).document; assert.strictEqual(a.get(saved.id).text, d.text); assert.strictEqual(a.list().documents.length, 1);
  saved.text = 'Minha folha revisada'; var second = a.save(saved).document;
  assert.strictEqual(a.list().documents.length, 1); assert.strictEqual(a.get(second.id).text, saved.text); assert.strictEqual(s.getItem('legacy-manuscript'), 'intacto');
});
test('Quota não destrói a versão guardada', function () {
  var s = new Storage(), a = E.createArchive(s), d = a.save(E.freshDocument()).document; s.fail = true; d.text = 'Nova escrita';
  assert.throws(function () { a.save(d); }); assert.strictEqual(a.get(d.id).text, '');
});
test('Abas defasadas preservam as duas versões', function () {
  var s = new Storage(), a = E.createArchive(s), d = a.save(E.freshDocument()).document, other = plain(d);
  d.text = 'A'; a.save(d); other.text = 'B'; assert.ok(a.save(other).conflict);
  assert.deepStrictEqual(plain(a.list().documents.map(function (x) { return x.text; }).sort()), ['A', 'B']);
});
test('Gravações intercaladas preservam as duas versões', function () {
  var s = new Storage(), a = E.createArchive(s), d = a.save(E.freshDocument()).document, other = plain(d);
  d.text = 'Primeira aba'; other.text = 'Segunda aba';
  s.beforeSet = function () { s.beforeSet = null; a.save(other); }; a.save(d);
  assert.strictEqual(a.list().documents.length, 2);
});
test('Registros corrompidos são preservados e reportados', function () {
  var s = new Storage(), a = E.createArchive(s); s.setItem('escrevaral.astra.v1.doc.ruim', '{');
  a.save(E.freshDocument()); assert.strictEqual(a.list().unreadable, 1); assert.strictEqual(s.getItem('escrevaral.astra.v1.doc.ruim'), '{');
  assert.throws(function () { a.save({ id: '../intruso' }); });
});
test('Sem expansão de armazenamento a cada tecla guardada', function () {
  var s = new Storage(), a = E.createArchive(s), d = E.freshDocument();
  for (var i = 0; i < 500; i += 1) { d.text += 'a'; d = a.save(d).document; }
  assert.strictEqual(s.length, 1); assert.strictEqual(a.list().documents[0].text.length, 500);
});
test('Runtime aceita sintaxe ECMAScript 5', function () {
  var acorn;
  try { acorn = require('acorn'); } catch (e) {
    var native = process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'];
    if (!native) { throw new Error('Para auditar ES5, instale acorn apenas na oficina de testes.'); }
    var mod = { exports: {} }; new Function('exports', 'module', native)(mod.exports, mod); acorn = mod.exports;
  }
  runtimeFiles.forEach(function (file) { acorn.parse(source(file), { ecmaVersion: 5 }); });
});
test('HTML aponta somente para recursos locais existentes', function () {
  var html = source('index.html'), regex = /(?:src|href)="([^"]+)"/g, match;
  while ((match = regex.exec(html))) { if (match[1].charAt(0) !== '#') { assert.ok(!/^https?:/.test(match[1])); assert.ok(fs.existsSync(path.join(root, match[1])), match[1]); } }
  assert.ok(/connect-src 'none'/.test(html));
});
test('Mesa portátil completa, sem script ou folha de estilo externos', function () {
  var html = source('escrevaral.html'); assert.ok(!/<script\s+src=|<link\s+rel="stylesheet"/.test(html));
  var regex = /<script>([\s\S]*?)<\/script>/g, match, scripts = [];
  while ((match = regex.exec(html))) { scripts.push(match[1]); new vm.Script(match[1]); }
  assert.strictEqual(scripts.length, runtimeFiles.length);
  var isolated = {}; vm.createContext(isolated); scripts.slice(0, -1).forEach(function (js) { vm.runInContext(js, isolated); });
  assert.strictEqual(isolated.Escr.createVault(isolated.Escr.knowledge).analyze('ortografia', 'uma excessão').findings.length, 1);
  [['decolonial', 'cabelo ruim'], ['expressoes', 'subir para cima'], ['rima', 'amor\nflor'], ['metrica', 'o amor'], ['morfologia', 'Eu leio'], ['sintaxe', 'A escritora leu o livro ontem.']].forEach(function (entry) {
    assert.strictEqual(JSON.stringify(isolated.Escr.createVault(isolated.Escr.knowledge).analyze(entry[0], entry[1])), JSON.stringify(vault.analyze(entry[0], entry[1])));
  });
});
var runSurface = require('./superficie.js');
runSurface({ test: test, source: source, Storage: Storage, vm: vm, assert: assert });
require('./transplante.js')({ test: test, source: source, assert: assert, E: E, vault: vault, context: context });
require('./poesia.js')({ test: test, source: source, assert: assert, E: E, vault: vault });
require('./gramatica.js')({ test: test, source: source, assert: assert, E: E, vault: vault });
console.log(JSON.stringify({ passed: passed, corpusCases: corpus.length, transplantCases: JSON.parse(source('testes/corpus-transplante.json')).length, literaryCases: corpus.filter(function (e) { return e.category === 'literatura'; }).length, failures: 0, runtime: process.version, physicalLegacyDevice: 'não testado', browserRendering: 'não testado' }, null, 2));
