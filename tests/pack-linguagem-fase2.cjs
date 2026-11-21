/* Executar: node tests/pack-linguagem-fase2.cjs. Valida os 4 blocos do Pack Linguagem · Fase 2 (Sintaxe literária + P01). */
'use strict';
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

function loadLocalBucket(id, done) {
  const filePath = path.join(rootDir, 'resources/pt-BR/lexico-ptbr/partes', id + '.js');
  if (!fs.existsSync(filePath)) { done(new Error('missing')); return; }
  const sandbox = { EscrevaralLexicoDados: {} };
  vm.runInNewContext(fs.readFileSync(filePath, 'utf8'), sandbox);
  done(null, sandbox.EscrevaralLexicoDados[id] || null);
}

const p01 = E.createLexicoP01({ loadPart: loadLocalBucket });
E.getLexicoP01 = () => p01;

function validate(text, findings) {
  const nodes = new Map(findings.map(f => [f.nodeId, f]));
  assert.equal(nodes.size, findings.length, 'nodeId único em: ' + text);
  for (const f of findings) {
    for (const s of [f, f.clause, f.head, ...(f.context || []), ...(f.components || [])].filter(Boolean)) {
      assert.equal(text.slice(s.start, s.end), s.snippet, 'slice UTF-16 exato em: ' + text);
    }
    assert.ok(f.start >= f.clause.start && f.end <= f.clause.end, 'dentro da cláusula em: ' + text);
    if (f.head) {
      assert.ok(f.head.start >= f.start && f.head.end <= f.end, 'núcleo dentro do grupo em: ' + text);
    }
    for (const e of f.relations) {
      assert.ok(nodes.has(e.from) && nodes.has(e.to), 'sem vínculo órfão em: ' + text);
      assert.equal(nodes.get(e.from).clause.start, nodes.get(e.to).clause.start, 'sem vínculo entre orações em: ' + text);
    }
    if (f.parentId && f.parentId.endsWith('-predicado')) {
      const p = nodes.get(f.parentId);
      assert.ok(p && f.start >= p.start && f.end <= p.end, 'termo contido no predicado em: ' + text);
    }
  }
}

/* === BLOCO 1A: Adjunto adverbial deslocado (anteposto, isolado por vírgula) === */
const frontedCases = [
  { text: 'Na janela, a escritora escreveu o poema.', adj: 'Na janela', head: 'janela', subj: 'a escritora', obj: 'o poema' },
  { text: 'Ontem, caminhamos pela praia.', adj: 'Ontem', head: 'Ontem', trailingAdj: 'pela praia' },
  { text: 'Sem medo, abrimos a porta.', adj: 'Sem medo', head: 'medo', obj: 'a porta' }
];
for (const c of frontedCases) {
  const r = vault.analyze('sintaxe', c.text);
  validate(c.text, r.findings);
  assert.equal(r.coverageInfo.constructions, 1, '1 oração em: ' + c.text);
  const fAdj = r.findings.find(f => f.nodeId.endsWith('-adjunto-ini'));
  assert.ok(fAdj && fAdj.feature === 'Adjunto adverbial', 'adjunto inicial em: ' + c.text);
  assert.equal(fAdj.snippet, c.adj);
  assert.equal(fAdj.head.snippet, c.head);
  assert.ok(!fAdj.parentId.endsWith('-predicado'), 'adjunto deslocado não força contenção no predicado');
  if (c.subj) { assert.equal(r.findings.find(f => f.feature === 'Sujeito').snippet, c.subj); }
  if (c.obj) { assert.equal(r.findings.find(f => f.feature === 'Objeto direto').snippet, c.obj); }
  if (c.trailingAdj) {
    const tAdj = r.findings.find(f => f.nodeId.endsWith('-adjunto'));
    assert.ok(tAdj && tAdj.snippet === c.trailingAdj, 'preserva adjunto final junto com adjunto inicial');
  }
}

/* === BLOCO 1B: Perífrases aspectuais literárias === */
const aspectCases = [
  { text: 'A chuva começou a cair.', group: 'começou a cair', kind: 'incoativa', main: 'cair' },
  { text: 'Voltei a escrever o romance.', group: 'Voltei a escrever', kind: 'reiterativa', main: 'escrever' },
  { text: 'A escritora continuou a revisar o texto.', group: 'continuou a revisar', kind: 'continuativa', main: 'revisar' },
  { text: 'A chuva parou de cair.', group: 'parou de cair', kind: 'cessativa', main: 'cair' },
  { text: 'Eu acabei de ler a carta.', group: 'acabei de ler', kind: 'terminativa', main: 'ler' }
];
for (const c of aspectCases) {
  const r = vault.analyze('sintaxe', c.text);
  validate(c.text, r.findings);
  assert.equal(r.coverageInfo.constructions, 1, 'locução aspectual = 1 oração em: ' + c.text);
  assert.equal(r.coverageInfo.verbGroups, 1, 'locução contabilizada em: ' + c.text);
  const loc = r.findings.find(f => f.feature === 'Locução verbal');
  assert.ok(loc, 'achado Locução verbal em: ' + c.text);
  assert.equal(loc.snippet, c.group);
  assert.equal(loc.groupKind, c.kind);
  assert.equal(loc.head.snippet, c.main);
  assert.equal(loc.components.length, 3, 'Auxiliar + Preposição + Principal em: ' + c.text);
}

/* === BLOCO 2: Clíticos pronominais literários em próclise (me, te, nos, lhe, lhes) === */
const cliticCases = [
  { text: 'Ela me contou o segredo.', oi: 'me', od: 'o segredo' },
  { text: 'Eu lhe entreguei a carta.', oi: 'lhe', od: 'a carta' },
  { text: 'O vento nos trouxe a chuva.', oi: 'nos', od: 'a chuva' },
  { text: 'Eu não lhe entreguei a carta.', oi: 'lhe', od: 'a carta', neg: 'não' },
  { text: 'Não te esqueci.', od: 'te', neg: 'Não', implicit: 'eu' },
  { text: 'A escritora me observou.', od: 'me' },
  { text: 'O menino lhe obedeceu.', oi: 'lhe' }
];
for (const c of cliticCases) {
  const r = vault.analyze('sintaxe', c.text);
  validate(c.text, r.findings);
  assert.equal(r.coverageInfo.constructions, 1, '1 oração com clítico em: ' + c.text);
  if (c.oi) { assert.equal(r.findings.find(f => f.feature === 'Objeto indireto').snippet, c.oi, 'OI em: ' + c.text); }
  if (c.od) { assert.equal(r.findings.find(f => f.feature === 'Objeto direto').snippet, c.od, 'OD em: ' + c.text); }
  if (c.neg) { assert.equal(r.findings.find(f => f.feature === 'Negação').snippet, c.neg, 'Negação em: ' + c.text); }
  if (c.implicit) { assert.equal(r.findings.find(f => f.feature === 'Núcleo verbal').implicitSubject.pronoun, c.implicit); }
}
/* Abstenções preservadas em clíticos */
for (const abst of ['Eu o leio.', 'Eu não o leio.', 'Eu me observo.', 'Nós nos encontramos.', 'Ela me contou.']) {
  const r = vault.analyze('sintaxe', abst);
  assert.equal(r.findings.length, 0, 'abstenção preservada em: ' + abst);
}

/* === BLOCO 3: Orações reduzidas literárias (gerúndio e ao + infinitivo) === */
const reducedCases = [
  { text: 'Abrindo a janela, a escritora observou a chuva.', kind: 'gerúndio', verb: 'Abrindo', obj: 'a janela' },
  { text: 'Ao abrir a porta, encontramos o silêncio.', kind: 'infinitivo', verb: 'Ao abrir', obj: 'a porta', hasComponents: true },
  { text: 'Caminhando pela praia, observamos o horizonte.', kind: 'gerúndio', verb: 'Caminhando', adj: 'pela praia' },
  { text: 'A escritora observou a chuva, abrindo a janela.', kind: 'gerúndio', verb: 'abrindo', obj: 'a janela' },
  { text: 'Encontramos o silêncio, ao ler a carta.', kind: 'infinitivo', verb: 'ao ler', obj: 'a carta', hasComponents: true }
];
for (const c of reducedCases) {
  const r = vault.analyze('sintaxe', c.text);
  validate(c.text, r.findings);
  assert.equal(r.coverageInfo.constructions, 2, 'período com reduzida + principal = 2 orações em: ' + c.text);
  const rv = r.findings.find(f => f.id === 'PTBR-REL-015');
  assert.ok(rv, 'achado PTBR-REL-015 presente em: ' + c.text);
  assert.equal(rv.reducedKind, c.kind);
  assert.equal(rv.snippet, c.verb);
  if (c.hasComponents) { assert.equal(rv.components.length, 2, 'Preposição + Infinitivo em: ' + c.text); }
  if (c.obj) {
    assert.ok(r.findings.some(f => f.clause.start === rv.clause.start && f.feature === 'Objeto direto' && f.snippet === c.obj), 'OD dentro da reduzida em: ' + c.text);
  }
  if (c.adj) {
    assert.ok(r.findings.some(f => f.clause.start === rv.clause.start && f.feature === 'Adjunto adverbial' && f.snippet === c.adj), 'Adjunto dentro da reduzida em: ' + c.text);
  }
}
/* Sem vírgula separando a reduzida: abstenção */
assert.equal(vault.analyze('sintaxe', 'Abrindo a janela a escritora observou a chuva.').findings.length, 0);

/* === BLOCO 4: Ponte Bunker offline P01 (92 mil formas) -> Motor Sintático === */
const nounProbes = ['melodia', 'violino', 'mariposa', 'catedral', 'bússola'];
const adjProbes = ['valioso', 'silenciosa', 'eterno', 'serena'];
const freshNouns = nounProbes.filter(w => E.syntaxLexicon.nounReadings(w).length === 0);
const freshAdjs = adjProbes.filter(w => !E.syntaxLexicon.adjectiveReading(w) && E.grammarData.classes.adjetivo.indexOf(w) < 0);
assert.ok(freshNouns.length >= 2, 'precisamos de substantivos literários ausentes do léxico fixo');

let warmed = 0;
p01.warmWords(freshNouns.concat(freshAdjs), count => { warmed = count; });
assert.ok(warmed >= 2, 'P01 offline aqueceu palavras literárias: ' + warmed);

const p01Noun = freshNouns.find(w => {
  const pos = p01.peekPos(w);
  return pos && pos.classes.length === 1 && pos.classes[0] === 'substantivo';
});
assert.ok(p01Noun, 'substantivo inequívoco encontrado no P01 offline');
const p01Det = p01Noun.endsWith('a') ? 'A' : 'O';
const p01Sent = p01Det + ' ' + p01Noun + ' chegou.';
const p01Res = vault.analyze('sintaxe', p01Sent);
validate(p01Sent, p01Res.findings);
assert.equal(p01Res.coverageInfo.constructions, 1, 'Sintaxe lê substantivo literário via P01 sob determinante: ' + p01Sent);
assert.equal(p01Res.findings.find(f => f.feature === 'Sujeito').head.snippet, p01Noun);

/* Substantivo P01 SEM determinante continua em abstenção por segurança */
const bareSent = p01Noun.charAt(0).toUpperCase() + p01Noun.slice(1) + ' chegou.';
assert.equal(vault.analyze('sintaxe', bareSent).findings.length, 0, 'P01 exige determinante na Sintaxe');

/* Adjetivo literário do P01 em concordância com substantivo */
const p01Adj = freshAdjs.find(w => {
  const pos = p01.peekPos(w);
  return pos && pos.classes.length === 1 && pos.classes[0] === 'adjetivo';
});
if (p01Adj) {
  const isFem = /a$/.test(p01Adj);
  const adjSent = (isFem ? 'A casa é ' : 'O livro é ') + p01Adj + '.';
  const adjRes = vault.analyze('sintaxe', adjSent);
  validate(adjSent, adjRes.findings);
  assert.equal(adjRes.findings.find(f => f.feature === 'Predicativo do sujeito').snippet, p01Adj);
}

/* Concordância estrita em substantivos do léxico fixo NÃO é enfraquecida pelo P01 */
p01.warmWords(['livro', 'menina'], () => {});
assert.equal(vault.analyze('sintaxe', 'O menina canta.').findings.length, 0, 'P01 nunca quebra concordância de gênero do léxico fixo');

p01.clearSession();
assert.equal(vault.analyze('sintaxe', p01Sent).findings.length, 0, 'após clearSession, P01 volta ao recorte base');

console.log('PACK LINGUAGEM FASE 2 OK: adjunto deslocado, perífrases aspectuais, clíticos em próclise, orações reduzidas (gerúndio/ao+infinitivo) e ponte offline P01 -> Sintaxe (' + p01Noun + ').');
