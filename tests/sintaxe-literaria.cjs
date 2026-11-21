/* Executar: node tests/sintaxe-literaria.cjs. Testa construções sintáticas/literárias ampliadas (sintaxe-4-literaria) e contrastes de precisão. */
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

function validateInvariants(text, findings) {
  const nodes = new Map(findings.map(f => [f.nodeId, f]));
  for (const f of findings) {
    for (const s of [f, f.clause, f.head, ...(f.context || []), ...(f.components || [])].filter(Boolean)) {
      assert.equal(text.slice(s.start, s.end), s.snippet, 'posição UTF-16 exata');
    }
    assert.ok(f.start >= f.clause.start && f.end <= f.clause.end, 'termo contido na oração');
    if (f.head) { assert.ok(f.head.start >= f.start && f.head.end <= f.end, 'núcleo contido no termo'); }
    for (const e of f.relations) {
      assert.ok(nodes.has(e.from) && nodes.has(e.to), 'sem vínculos órfãos');
      assert.equal(nodes.get(e.from).clause.start, nodes.get(e.to).clause.start, 'vínculo dentro da mesma oração');
    }
    if (f.parentId.endsWith('-predicado')) {
      const p = nodes.get(f.parentId);
      assert.ok(p && f.start >= p.start && f.end <= p.end, 'termo contido no predicado');
    }
  }
}

/* 1. Casos positivos literários (determinantes, epíteto, especificador de/do/da, bitransitivos, indiretos, adjunto preposicionado, locuções) */
const positives = [
  {
    id: 'LIT-01',
    text: 'Minha mãe escreveu esta carta.',
    roles: { Sujeito: 'Minha mãe', Verbo: 'escreveu', 'Objeto direto': 'esta carta' },
    heads: { Sujeito: 'mãe', 'Objeto direto': 'carta' }
  },
  {
    id: 'LIT-02',
    text: 'A minha casa permaneceu silenciosa.',
    roles: { Sujeito: 'A minha casa', 'Verbo de ligação': 'permaneceu', 'Predicativo do sujeito': 'silenciosa' },
    heads: { Sujeito: 'casa' }
  },
  {
    id: 'LIT-03',
    text: 'Aquele velho escritor leu o novo romance.',
    roles: { Sujeito: 'Aquele velho escritor', Verbo: 'leu', 'Objeto direto': 'o novo romance' },
    heads: { Sujeito: 'escritor', 'Objeto direto': 'romance' }
  },
  {
    id: 'LIT-04',
    text: 'A luz das estrelas brilhou.',
    roles: { Sujeito: 'A luz das estrelas', Verbo: 'brilhou' },
    heads: { Sujeito: 'luz' }
  },
  {
    id: 'LIT-05',
    text: 'A escritora abriu a porta da casa.',
    roles: { Sujeito: 'A escritora', Verbo: 'abriu', 'Objeto direto': 'a porta da casa' },
    heads: { Sujeito: 'escritora', 'Objeto direto': 'porta' }
  },
  {
    id: 'LIT-06',
    text: 'A escritora dedicou o romance à mãe.',
    roles: { Sujeito: 'A escritora', Verbo: 'dedicou', 'Objeto direto': 'o romance', 'Objeto indireto': 'à mãe' },
    heads: { 'Objeto indireto': 'mãe' }
  },
  {
    id: 'LIT-07',
    text: 'João enviou a carta ao amigo.',
    roles: { Sujeito: 'João', Verbo: 'enviou', 'Objeto direto': 'a carta', 'Objeto indireto': 'ao amigo' },
    heads: { 'Objeto indireto': 'amigo' }
  },
  {
    id: 'LIT-08',
    text: 'Eu entreguei o caderno para Maria.',
    roles: { Sujeito: 'Eu', Verbo: 'entreguei', 'Objeto direto': 'o caderno', 'Objeto indireto': 'para Maria' },
    heads: { 'Objeto indireto': 'Maria' }
  },
  {
    id: 'LIT-09',
    text: 'A escritora precisa do silêncio.',
    roles: { Sujeito: 'A escritora', Verbo: 'precisa', 'Objeto indireto': 'do silêncio' },
    heads: { 'Objeto indireto': 'silêncio' }
  },
  {
    id: 'LIT-10',
    text: 'Ela acredita na esperança.',
    roles: { Sujeito: 'Ela', Verbo: 'acredita', 'Objeto indireto': 'na esperança' },
    heads: { 'Objeto indireto': 'esperança' }
  },
  {
    id: 'LIT-11',
    text: 'O menino sonhou com o mar.',
    roles: { Sujeito: 'O menino', Verbo: 'sonhou', 'Objeto indireto': 'com o mar' },
    heads: { 'Objeto indireto': 'mar' }
  },
  {
    id: 'LIT-12',
    text: 'Este caderno pertence à escritora.',
    roles: { Sujeito: 'Este caderno', Verbo: 'pertence', 'Objeto indireto': 'à escritora' },
    heads: { Sujeito: 'caderno', 'Objeto indireto': 'escritora' }
  },
  {
    id: 'LIT-13',
    text: 'A escritora escreveu o poema na janela.',
    roles: { Sujeito: 'A escritora', Verbo: 'escreveu', 'Objeto direto': 'o poema', 'Adjunto adverbial': 'na janela' },
    heads: { 'Adjunto adverbial': 'janela' }
  },
  {
    id: 'LIT-14',
    text: 'O menino caminhou pela estrada.',
    roles: { Sujeito: 'O menino', Verbo: 'caminhou', 'Adjunto adverbial': 'pela estrada' },
    heads: { 'Adjunto adverbial': 'estrada' }
  },
  {
    id: 'LIT-15',
    text: 'A chuva caiu sobre o telhado.',
    roles: { Sujeito: 'A chuva', Verbo: 'caiu', 'Adjunto adverbial': 'sobre o telhado' },
    heads: { 'Adjunto adverbial': 'telhado' }
  },
  {
    id: 'LIT-16',
    text: 'A mulher saiu sem medo.',
    roles: { Sujeito: 'A mulher', Verbo: 'saiu', 'Adjunto adverbial': 'sem medo' },
    heads: { 'Adjunto adverbial': 'medo' }
  },
  {
    id: 'LIT-17',
    text: 'A escritora estava revisando o rascunho na janela.',
    roles: { Sujeito: 'A escritora', 'Locução verbal': 'estava revisando', 'Objeto direto': 'o rascunho', 'Adjunto adverbial': 'na janela' }
  },
  {
    id: 'LIT-18',
    text: 'O sol havia brilhado sobre o mar.',
    roles: { Sujeito: 'O sol', 'Locução verbal': 'havia brilhado', 'Adjunto adverbial': 'sobre o mar' }
  },
  {
    id: 'LIT-19',
    text: 'Nós vamos caminhar pela praia.',
    roles: { Sujeito: 'Nós', 'Locução verbal': 'vamos caminhar', 'Adjunto adverbial': 'pela praia' }
  },
  {
    id: 'LIT-20',
    text: 'O silêncio da noite chegou suavemente.',
    roles: { Sujeito: 'O silêncio da noite', Verbo: 'chegou', 'Adjunto adverbial': 'suavemente' },
    heads: { Sujeito: 'silêncio' }
  }
];

for (const c of positives) {
  const res = vault.analyze('sintaxe', c.text);
  validateInvariants(c.text, res.findings);
  assert.ok(res.findings.length > 0, c.id + ' sem leitura: ' + c.text);
  for (const [role, expected] of Object.entries(c.roles)) {
    const f = res.findings.find(x => (role === 'Verbo' ? ['Núcleo verbal', 'Verbo de ligação'].includes(x.feature) : x.feature === role));
    assert.ok(f, c.id + ' papel ausente (' + role + ') em: ' + c.text);
    assert.equal(f.snippet, expected, c.id + ' trecho incorreto para ' + role);
  }
  if (c.heads) {
    for (const [role, expectedHead] of Object.entries(c.heads)) {
      const f = res.findings.find(x => x.feature === role);
      assert.ok(f && f.head, c.id + ' núcleo ausente para ' + role);
      assert.equal(f.head.snippet, expectedHead, c.id + ' núcleo incorreto para ' + role);
    }
  }
}

/* 2. Contrastes e abstenções obrigatórias (discordâncias, ambiguidade posposta no objeto, homógrafos nus) */
const abstentions = [
  ['CON-01', 'O minha casa brilhou.'],           // artigo + possessivo discordantes em gênero
  ['CON-02', 'Aquele casa caiu.'],                // demonstrativo + nome discordantes
  ['CON-03', 'A luz das estrelas brilharam.'],    // verbo concordando com especificador e não com núcleo
  ['CON-04', 'A escritora dedicou o livro ao mãe.'], // contração discordante em gênero
  ['CON-05', 'O menino é serena.'],               // predicativo discordante em gênero
  ['CON-06', 'Eu comprei a casa nova.'],          // adjetivo posposto no objeto (preservar abstenção)
  ['CON-07', 'Eu gosto do livro.'],               // preservação de REL-N46
  ['CON-08', 'Sonho terminou.'],                  // homógrafo verbo/nome sem determinante
  ['CON-09', 'A escritora escreveu o poema no janela.'] // contração discordante no adjunto
];

for (const [id, text] of abstentions) {
  const res = vault.analyze('sintaxe', text);
  assert.equal(res.findings.length, 0, id + ' deveria abster em: ' + text);
}

console.log('OK: Sintaxe literária (' + positives.length + ' construções literárias + ' + abstentions.length + ' contrastes de precisão) verificada.');
