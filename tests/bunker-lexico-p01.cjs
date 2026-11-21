/* Executar: node tests/bunker-lexico-p01.cjs. Testa ponte offline P01 -> Morfologia + cobertura literária da Sintaxe. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();
const rootDir = path.resolve(__dirname, '..');

const ctx = vm.createContext({ setTimeout, clearTimeout });
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
const p01Src = scripts.find(s => s.includes('root.Escr.createLexicoP01 = createService'));
assert.ok(p01Src, 'lexico-p01.js ausente');
vm.runInContext(p01Src, ctx);

const E = ctx.Escr;
const vault = E.createVault(E.knowledge);

/* 1. Loader offline de blocos P01 reais do disco (resources/pt-BR/lexico-ptbr/partes/*.js) */
function loadLocalBucket(id, done) {
  const filePath = path.join(rootDir, 'resources/pt-BR/lexico-ptbr/partes', id + '.js');
  if (!fs.existsSync(filePath)) { done(new Error('missing')); return; }
  const sandbox = { EscrevaralLexicoDados: {} };
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), sandbox);
  done(null, sandbox.EscrevaralLexicoDados[id] || null);
}

const p01 = E.createLexicoP01({ loadPart: loadLocalBucket });
E.getLexicoP01 = () => p01;

/* Escolher palavras reais ausentes do recorte compacto PortiLexicon, mas presentes no P01 (92k formas) */
const probeWords = ['saudade', 'tempestade', 'caderno', 'biblioteca', 'relógio'];
const absentBefore = probeWords.filter(w => E.contextualMorphology.lexicalReadings(w).classes.length === 0);
assert.ok(absentBefore.length >= 3, 'precisamos de palavras fora do PortiLexicon para validar o ganho real do P01');

let warmedCount = -1;
p01.warmWords(absentBefore, count => { warmedCount = count; });
assert.ok(warmedCount >= 3, 'P01 offline deve aquecer pelo menos 3 palavras literárias: ' + warmedCount);

const sampleSentence = 'A ' + absentBefore[0] + ' chegou.';
const morphRes = vault.analyze('morfologia', sampleSentence);
const targetFinding = morphRes.findings.find(f => f.snippet.toLowerCase() === absentBefore[0]);
assert.ok(targetFinding, 'achado da palavra aquecida presente');
assert.notEqual(targetFinding.analysisStatus, 'desconhecido', 'palavra aquecida pelo P01 deixa de ser desconhecida');
assert.ok(targetFinding.candidates.p01 && targetFinding.candidates.classes.length > 0, 'metadados P01 preservados');

p01.clearSession();
assert.equal(p01.peekPos(absentBefore[0]), null, 'clearSession limpa cache por nota');

/* 2. Cobertura literária expandida em Análise Sintática */
const literarySentences = [
  { text: 'A escritora abriu a janela.', roles: { Sujeito: 'A escritora', 'Objeto direto': 'a janela' } },
  { text: 'O escritor escreveu o caderno.', roles: { Sujeito: 'O escritor', 'Objeto direto': 'o caderno' } },
  { text: 'A tempestade terminou.', roles: { Sujeito: 'A tempestade', Verbo: 'terminou' } },
  { text: 'O trem partiu.', roles: { Sujeito: 'O trem', Verbo: 'partiu' } }
];

for (const item of literarySentences) {
  const res = vault.analyze('sintaxe', item.text);
  assert.ok(res.findings.length > 0, 'sintaxe deveria ler: ' + item.text);
  for (const [role, expected] of Object.entries(item.roles)) {
    const f = res.findings.find(x => (role === 'Verbo' ? ['Núcleo verbal', 'Verbo de ligação'].includes(x.feature) : x.feature === role));
    assert.ok(f, 'papel ausente (' + role + ') em: ' + item.text);
    assert.equal(f.snippet, expected, 'trecho incorreto em: ' + item.text);
  }
}

console.log('OK: Bunker offline P01 -> Morfologia (' + warmedCount + ' formas aquecidas + descarte de sessão) e Sintaxe literária expandida.');
