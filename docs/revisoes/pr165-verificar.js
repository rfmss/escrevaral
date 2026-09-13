/* Oficina de revisão, não carregada pelo produto. Sem alteração das engines.
 * Na raiz do checkout: node docs/revisoes/pr165-verificar.js
 * Exit 1 significa bloqueios encontrados; exit 2, falha na própria bancada.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const results = [];
function record(check, passed, evidence) { results.push({ check, passed, evidence }); }
function parseES5() {
  let acorn;
  try { acorn = require('acorn'); } catch (_) {
    const native = process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'];
    if (!native) throw new Error('Acorn indisponível: instalar só na oficina; não contar como aprovação.');
    const mod = { exports: {} };
    new Function('exports', 'module', native)(mod.exports, mod);
    acorn = mod.exports;
  }
  ['lexico-classes', 'analise-literaria'].forEach(name => {
    const file = 'src/core/engines/' + name + '.js';
    try { acorn.parse(fs.readFileSync(path.join(root, file), 'utf8'), { ecmaVersion: 5 }); record('ES5: ' + name, true, file); }
    catch (e) { record('ES5: ' + name, false, { file, error: e.message }); }
  });
}
function validFinding(f, text) {
  return Array.isArray(f.span) && f.span.length === 2 &&
    f.span.every(Number.isInteger) && f.span[0] >= 0 && f.span[1] >= f.span[0] && f.span[1] <= text.length &&
    Number.isInteger(f.severity) && f.severity >= 1 && f.severity <= 3 &&
    typeof f.confidence === 'number' && f.confidence >= 0 && f.confidence <= 1;
}
async function main() {
  parseES5();
  require(path.join(root, 'src/core/contracts.js'));
  require(path.join(root, 'src/core/services/tokenizer.js'));
  require(path.join(root, 'src/data/lexical-data.js'));
  require(path.join(root, 'src/data/lexical-norma-data.js'));
  const Lex = require(path.join(root, 'src/core/engines/lexico-classes.js'));
  const Analise = require(path.join(root, 'src/core/engines/analise-literaria.js'));
  const E = global.Encore, lex = new Lex(), analise = new Analise();
  async function check(engine, snapshot) {
    let returned = false, wasAsync;
    const promise = new Promise(resolve => engine.check(snapshot, f => { wasAsync = returned; resolve(f); }));
    returned = true;
    const findings = await promise;
    return { findings, wasAsync };
  }
  const text = 'A casa caiu. A casa ficou.';
  const tokens = E.core.services.Tokenizer.tokenize(text);
  const ui = await check(lex, new E.contracts.LinguisticSnapshot(text, { probes: tokens }));
  const actualSpans = ui.findings.map(f => f.span);
  const expectedSpans = tokens.map(t => t.span);
  record('Léxico: tokens reais da interface preservam ocorrências', JSON.stringify(actualSpans) === JSON.stringify(expectedSpans), { text, tokens, actual: ui.findings });
  const strings = await check(lex, new E.contracts.LinguisticSnapshot(text, { probes: ['casa', 'casa'] }));
  record('Léxico: Finding segue contracts.js', strings.findings.length === 2 && strings.findings.every(f => validFinding(f, text)), strings.findings);
  record('Léxico: callback assíncrono', ui.wasAsync, 'Snapshot real do tokenizador; Node, não navegador.');
  const corpus = require(path.join(root, 'src/test/fixtures/analise-literaria-corpus.js')).cases;
  const sample = corpus.filter(c => c.id === 'sujeira-vicios')[0];
  const options = { poesia: true };
  const literary = await check(analise, new E.contracts.LinguisticSnapshot(sample.text, options));
  record('Literária: Finding segue contracts.js', literary.findings.length > 0 && literary.findings.every(f => validFinding(f, sample.text)), literary.findings.map(f => ({ severity: f.severity, confidence: f.confidence, span: f.span })));
  const expected = analise.interpretarResultado(analise.analisar(sample.text, options)).map(a => '[' + a.dim + '] ' + a.id + ' — ' + (a.msg || ''));
  const actual = literary.findings.map(f => f.message);
  record('Literária: check preserva snapshot.context', JSON.stringify(actual) === JSON.stringify(expected), { sample: sample.id, context: options, expectedCount: expected.length, actualCount: actual.length, unexpected: actual.filter(s => expected.indexOf(s) === -1) });
  record('Literária: callback assíncrono', literary.wasAsync, 'A chamada é diferida; isso não mede bloqueio durante o processamento.');
  console.log(JSON.stringify({ node: process.version, results }, null, 2));
  process.exitCode = results.some(r => !r.passed) ? 1 : 0;
}
main().catch(e => { console.error(e.stack); process.exitCode = 2; });
