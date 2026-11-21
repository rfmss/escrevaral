/* Executar: node tests/pack-linguagem-fase1.cjs. Valida os 5 blocos do Pack Linguagem · Fase 1 (lentes pequenas + relativas). */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const ctx = vm.createContext({});
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
const E = ctx.Escr;
const vault = E.createVault(E.knowledge);

/* === BLOCO 1: dialogo + adverbios === */
const dialogText = '— Bom dia, disse ela.\n– Olá, respondeu ele.\n- Vamos sair cedo.\nA casa-grande ficou quieta.';
const dia = vault.analyze('dialogo', dialogText);
assert.equal(dia.findings.length, 1);
assert.equal(dia.findings[0].metrics.markedLines, 3, 'reconhece —, – e - com espaço, mas ignora palavra hifenizada');
assert.equal(dia.findings[0].metrics.lines, 4);
assert.equal(dia.findings[0].metrics.markers.emDash, 1);
assert.equal(dia.findings[0].metrics.markers.enDash, 1);
assert.equal(dia.findings[0].metrics.markers.hyphen, 1);

const advText = 'Ela caminhou serenamente e observou atentamente a semente.\n\nDepois falou suavemente.';
const adv = vault.analyze('adverbios', advText);
assert.deepEqual(Array.from(adv.findings, f => f.snippet), ['serenamente', 'atentamente', 'suavemente']);
assert.equal(adv.findings[0].metrics.paragraphCount, 2, 'registra concentração de 2 advérbios no 1º parágrafo');
assert.equal(adv.findings[2].metrics.paragraphCount, 1, 'registra 1 advérbio no 2º parágrafo');
assert.ok(!adv.findings.some(f => f.snippet === 'semente'), 'nunca marca falso -mente como semente');

/* === BLOCO 2: ritmo === */
const longSentence = 'A escritora abriu a janela da sala silenciosa quando a chuva de outono finalmente parou sobre os telhados antigos da cidade e deixou entrar o cheiro fresco da terra molhada que lembrava todas as manhãs da sua infância distante.';
const ritText = 'O sol brilhou na manhã. A brisa entrou na sala. O livro abriu na mesa. ' + longSentence;
const rit = vault.analyze('ritmo', ritText);
assert.ok(rit.findings.some(f => f.id === 'PTBR-RIT-001'), 'panorama global preservado');
assert.ok(rit.findings.some(f => f.id === 'PTBR-RIT-002' && f.metrics.words >= 35), 'destaca frase extensa (>= 35 palavras)');
assert.ok(rit.findings.some(f => f.id === 'PTBR-RIT-003' && f.metrics.runLength === 3), 'destaca sequência de 3 frases com extensão muito parecida');

/* === BLOCO 3: metrica + rima === */
assert.deepEqual(Array.from(E.poetry.syllables('silêncio')), ['si', 'lên', 'cio']);
assert.deepEqual(Array.from(E.poetry.syllables('poesia')), ['po', 'e', 'si', 'a']);
assert.deepEqual(Array.from(E.poetry.syllables('coração')), ['co', 'ra', 'ção']);
const metDeca = vault.analyze('metrica', 'No meio do caminho tinha pedra');
assert.equal(metDeca.findings[0].measurements.max, 10);
assert.equal(metDeca.findings[0].measurements.meterName, 'decassílabo');
assert.ok(metDeca.findings[0].message.includes('decassílabo'), 'exibe nome tradicional do metro');

const rhymeText = 'A luz da lua\nNa calma rua\nNa velha casa\nA voz me fala';
const rim = vault.analyze('rima', rhymeText);
assert.ok(rim.findings.some(f => f.id === 'PTBR-RIM-001' && f.rhymeKind === 'consoante' && f.snippet === 'rua'), 'detecta rima consoante lua/rua');
assert.ok(rim.findings.some(f => f.id === 'PTBR-RIM-002' && f.rhymeKind === 'toante' && f.snippet === 'fala'), 'detecta rima toante casa/fala');

/* === BLOCO 4: crase + concordancia === */
const cra = vault.analyze('crase', 'Ela voltou à pé e começou à escrever para à ele. Mas visitou à Maria.');
assert.ok(cra.findings.some(f => f.id === 'PTBR-CRA-003' && f.snippet === 'à pé'), 'sinaliza crase antes de masculino registrado');
assert.ok(cra.findings.some(f => f.id === 'PTBR-CRA-001' && f.snippet === 'à escrever'), 'sinaliza crase antes de infinitivo');
assert.ok(cra.findings.some(f => f.id === 'PTBR-CRA-002' && f.snippet === 'à ele'), 'sinaliza crase antes de pronome pessoal');
assert.ok(!cra.findings.some(f => f.snippet === 'à Maria'), 'respeita nome próprio maiúsculo');

const con = vault.analyze('concordancia', 'Ontem haviam problemas na cidade. Ainda existe motivos no texto. Já faziam dois anos que partimos.');
assert.equal(con.findings.length, 3, 'reconhece haver, existir e fazer precedidos de advérbio/prefixo');
assert.deepEqual(Array.from(con.findings, f => f.reference), ['havia', 'existem', 'fazia']);

/* === BLOCO 5: relativas (que-sujeito, que-objeto direto e onde locativo) === */
const relObj = vault.analyze('relativas', 'A carta que eu escrevi chegou.');
assert.equal(relObj.findings.length, 1);
assert.equal(relObj.findings[0].id, 'PTBR-ORA-002');
assert.equal(relObj.findings[0].relativeFunction, 'objeto direto');
assert.equal(relObj.findings[0].snippet, 'que eu escrevi');

const relLoc = vault.analyze('relativas', 'A cidade onde ela viveu permaneceu.');
assert.equal(relLoc.findings.length, 1);
assert.equal(relLoc.findings[0].id, 'PTBR-ORA-003');
assert.equal(relLoc.findings[0].relativeFunction, 'adjunto adverbial de lugar');
assert.equal(relLoc.findings[0].head.snippet, 'onde');
assert.equal(relLoc.findings[0].snippet, 'onde ela viveu');

// Abstenção obrigatória: antecedente não locativo com "onde"
assert.equal(vault.analyze('relativas', 'O livro onde ela viveu permaneceu.').findings.length, 0, 'abstém onde com antecedente não-lugar');
// Abstenção obrigatória: ambiguidade de ordem (ORA-N16)
assert.equal(vault.analyze('relativas', 'A menina que viu o menino canta.').findings.length, 0, 'preserva abstenção em ambiguidade que-sujeito/objeto');

console.log('OK: Pack Linguagem · Fase 1 (dialogo, adverbios, ritmo, metrica, rima, crase, concordancia e relativas) verificado.');
