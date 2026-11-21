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
  },
  /* Sujeito composto (concordância plural, hierarquia de pessoa e gênero, 2 núcleos em components) */
  {
    id: 'COMP-01',
    text: 'A menina e o menino cantam.',
    roles: { 'Sujeito composto': 'A menina e o menino', Verbo: 'cantam' },
    components: { 'Sujeito composto': ['menina', 'menino'] }
  },
  {
    id: 'COMP-02',
    text: 'Eu e Maria lemos o livro.',
    roles: { 'Sujeito composto': 'Eu e Maria', Verbo: 'lemos', 'Objeto direto': 'o livro' },
    components: { 'Sujeito composto': ['Eu', 'Maria'] }
  },
  {
    id: 'COMP-03',
    text: 'O vento e a chuva passaram sobre a cidade.',
    roles: { 'Sujeito composto': 'O vento e a chuva', Verbo: 'passaram', 'Adjunto adverbial': 'sobre a cidade' },
    components: { 'Sujeito composto': ['vento', 'chuva'] }
  },
  {
    id: 'COMP-04',
    text: 'A casa e a rua permaneceram silenciosas.',
    roles: { 'Sujeito composto': 'A casa e a rua', 'Verbo de ligação': 'permaneceram', 'Predicativo do sujeito': 'silenciosas' },
    components: { 'Sujeito composto': ['casa', 'rua'] }
  },
  {
    id: 'COMP-05',
    text: 'João e Maria estão atentos.',
    roles: { 'Sujeito composto': 'João e Maria', 'Verbo de ligação': 'estão', 'Predicativo do sujeito': 'atentos' },
    components: { 'Sujeito composto': ['João', 'Maria'] }
  },
  /* Orações coordenadas (aditiva, adversativa com vírgula, alternativa, conclusiva, explicativa + sujeito composto) */
  {
    id: 'COORD-01',
    text: 'Eu canto e ela corre.',
    constructions: 2,
    coordKind: 'aditiva',
    roles: { Sujeito: 'Eu', 'Conjunção coordenativa': 'e' }
  },
  {
    id: 'COORD-02',
    text: 'O dia terminou, mas a escritora permaneceu na janela.',
    constructions: 2,
    coordKind: 'adversativa',
    roles: { Sujeito: 'O dia', 'Conjunção coordenativa': 'mas', 'Adjunto adverbial': 'na janela' }
  },
  {
    id: 'COORD-03',
    text: 'Ela lê o poema ou ele escreve a crônica.',
    constructions: 2,
    coordKind: 'alternativa',
    roles: { 'Objeto direto': 'o poema', 'Conjunção coordenativa': 'ou' }
  },
  {
    id: 'COORD-04',
    text: 'A tempestade chegou, portanto o barco voltou.',
    constructions: 2,
    coordKind: 'conclusiva',
    roles: { Sujeito: 'A tempestade', 'Conjunção coordenativa': 'portanto' }
  },
  {
    id: 'COORD-05',
    text: 'A menina e o menino cantam, porém o vento passou no jardim.',
    constructions: 2,
    coordKind: 'adversativa',
    roles: { 'Sujeito composto': 'A menina e o menino', 'Conjunção coordenativa': 'porém', 'Adjunto adverbial': 'no jardim' }
  },
  /* Voz passiva analítica com agente da passiva explícito */
  {
    id: 'PASS-01',
    text: 'A carta foi escrita pela escritora.',
    roles: { 'Sujeito paciente': 'A carta', 'Locução passiva': 'foi escrita', 'Agente da passiva': 'pela escritora' },
    heads: { 'Sujeito paciente': 'carta', 'Agente da passiva': 'escritora' },
    components: { 'Locução passiva': ['foi', 'escrita'] }
  },
  {
    id: 'PASS-02',
    text: 'Os poemas foram lidos pelo menino na biblioteca.',
    roles: { 'Sujeito paciente': 'Os poemas', 'Locução passiva': 'foram lidos', 'Agente da passiva': 'pelo menino', 'Adjunto adverbial': 'na biblioteca' },
    heads: { 'Sujeito paciente': 'poemas', 'Agente da passiva': 'menino', 'Adjunto adverbial': 'biblioteca' }
  },
  {
    id: 'PASS-03',
    text: 'O livro foi publicado por Maria.',
    roles: { 'Sujeito paciente': 'O livro', 'Locução passiva': 'foi publicado', 'Agente da passiva': 'por Maria' },
    heads: { 'Agente da passiva': 'Maria' }
  },
  {
    id: 'PASS-04',
    text: 'A porta e a janela foram abertas pelo vento.',
    roles: { 'Sujeito paciente composto': 'A porta e a janela', 'Locução passiva': 'foram abertas', 'Agente da passiva': 'pelo vento' },
    components: { 'Sujeito paciente composto': ['porta', 'janela'], 'Locução passiva': ['foram', 'abertas'] }
  },
  /* Orações subordinadas adverbiais (pospostas e antepostas com vírgula obrigatória) */
  {
    id: 'SUB-01',
    text: 'A escritora abriu a janela quando o sol brilhou.',
    constructions: 2,
    subordKind: 'temporal',
    roles: { Sujeito: 'A escritora', 'Conjunção subordinativa': 'quando' }
  },
  {
    id: 'SUB-02',
    text: 'Quando a chuva terminou, o menino saiu.',
    constructions: 2,
    subordKind: 'temporal',
    roles: { 'Conjunção subordinativa': 'Quando', Sujeito: 'a chuva' }
  },
  {
    id: 'SUB-03',
    text: 'O barco voltou porque a tempestade chegou.',
    constructions: 2,
    subordKind: 'causal',
    roles: { Sujeito: 'O barco', 'Conjunção subordinativa': 'porque' }
  },
  {
    id: 'SUB-04',
    text: 'O vento passou no jardim enquanto ela dormia.',
    constructions: 2,
    subordKind: 'temporal',
    roles: { 'Adjunto adverbial': 'no jardim', 'Conjunção subordinativa': 'enquanto' }
  },
  {
    id: 'SUB-05',
    text: 'Se eu canto, ela corre.',
    constructions: 2,
    subordKind: 'condicional',
    roles: { 'Conjunção subordinativa': 'Se', Sujeito: 'eu' }
  },
  /* Orações subordinadas substantivas objetivas diretas (integrantes com "que") */
  {
    id: 'INT-01',
    text: 'A escritora disse que o livro chegou.',
    constructions: 2,
    subordKind: 'integrante',
    roles: { Sujeito: 'A escritora', Verbo: 'disse', 'Conjunção integrante': 'que' }
  },
  {
    id: 'INT-02',
    text: 'O menino descobriu que o vento abriu a porta.',
    constructions: 2,
    subordKind: 'integrante',
    roles: { Sujeito: 'O menino', 'Conjunção integrante': 'que', 'Objeto direto': 'a porta' }
  },
  {
    id: 'INT-03',
    text: 'Ela acredita que a esperança permanece.',
    constructions: 2,
    subordKind: 'integrante',
    roles: { Sujeito: 'Ela', Verbo: 'acredita', 'Conjunção integrante': 'que' }
  },
  /* Sujeito oculto (desinencial) inequívoco de 1ª/2ª pessoa (inclusive em locuções, coordenação e subordinação) */
  {
    id: 'ELIP-01',
    text: 'Li o livro.',
    implicitPronoun: 'eu',
    roles: { Verbo: 'Li', 'Objeto direto': 'o livro' }
  },
  {
    id: 'ELIP-02',
    text: 'Escrevemos o poema na janela.',
    implicitPronoun: 'nós',
    roles: { Verbo: 'Escrevemos', 'Objeto direto': 'o poema', 'Adjunto adverbial': 'na janela' }
  },
  {
    id: 'ELIP-03',
    text: 'Estou lendo a carta.',
    implicitPronoun: 'eu',
    roles: { 'Locução verbal': 'Estou lendo', 'Objeto direto': 'a carta' }
  },
  {
    id: 'ELIP-04',
    text: 'Abri a janela e li a carta.',
    constructions: 2,
    coordKind: 'aditiva',
    implicitPronoun: 'eu',
    roles: { Verbo: 'Abri', 'Conjunção coordenativa': 'e', 'Objeto direto': 'a janela' }
  },
  {
    id: 'ELIP-05',
    text: 'Sei que li o livro.',
    constructions: 2,
    subordKind: 'integrante',
    implicitPronoun: 'eu',
    roles: { Verbo: 'Sei', 'Conjunção integrante': 'que', 'Objeto direto': 'o livro' }
  },
  /* Vocativo (inicial e final, isolado por vírgula) */
  {
    id: 'VOC-01',
    text: 'Maria, escrevi esta carta.',
    implicitPronoun: 'eu',
    roles: { Vocativo: 'Maria', Verbo: 'escrevi', 'Objeto direto': 'esta carta' },
    heads: { Vocativo: 'Maria' }
  },
  {
    id: 'VOC-02',
    text: 'Meu amigo, a tempestade terminou.',
    roles: { Vocativo: 'Meu amigo', Sujeito: 'a tempestade', Verbo: 'terminou' },
    heads: { Vocativo: 'amigo' }
  },
  {
    id: 'VOC-03',
    text: 'Escrevemos este poema, querida mãe.',
    implicitPronoun: 'nós',
    roles: { Vocativo: 'querida mãe', Verbo: 'Escrevemos', 'Objeto direto': 'este poema' },
    heads: { Vocativo: 'mãe' }
  },
  /* Aposto explicativo pós-sujeito entre duas vírgulas */
  {
    id: 'APO-01',
    text: 'Maria, a escritora, leu o poema.',
    roles: { Sujeito: 'Maria', 'Aposto explicativo': 'a escritora', Verbo: 'leu', 'Objeto direto': 'o poema' },
    heads: { Sujeito: 'Maria', 'Aposto explicativo': 'escritora' }
  },
  {
    id: 'APO-02',
    text: 'João, meu amigo, enviou a carta à mãe.',
    roles: { Sujeito: 'João', 'Aposto explicativo': 'meu amigo', Verbo: 'enviou', 'Objeto direto': 'a carta', 'Objeto indireto': 'à mãe' },
    heads: { 'Aposto explicativo': 'amigo' }
  },
  {
    id: 'APO-03',
    text: 'Pedro, o velho leitor, abriu o livro na biblioteca.',
    roles: { Sujeito: 'Pedro', 'Aposto explicativo': 'o velho leitor', Verbo: 'abriu', 'Objeto direto': 'o livro', 'Adjunto adverbial': 'na biblioteca' },
    heads: { 'Aposto explicativo': 'leitor' }
  }
];

for (const c of positives) {
  const res = vault.analyze('sintaxe', c.text);
  validateInvariants(c.text, res.findings);
  assert.ok(res.findings.length > 0, c.id + ' sem leitura: ' + c.text);
  if (c.constructions) {
    assert.equal(res.coverageInfo.constructions, c.constructions, c.id + ' contagem de orações');
  }
  if (c.coordKind) {
    const cf = res.findings.find(x => x.feature === 'Conjunção coordenativa');
    assert.ok(cf, c.id + ' sem conjunção coordenativa');
    assert.equal(cf.coordKind, c.coordKind, c.id + ' tipo de coordenação');
  }
  if (c.subordKind) {
    const sf = res.findings.find(x => x.feature === 'Conjunção subordinativa' || x.feature === 'Conjunção integrante');
    assert.ok(sf, c.id + ' sem conjunção subordinativa/integrante');
    assert.equal(sf.subordKind, c.subordKind, c.id + ' tipo de subordinação');
  }
  if (c.implicitPronoun) {
    const vf = res.findings.find(x => x.implicitSubject);
    assert.ok(vf, c.id + ' sem sujeito oculto desinencial');
    assert.equal(vf.implicitSubject.pronoun, c.implicitPronoun, c.id + ' pronome desinencial');
  }
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
  if (c.components) {
    for (const [role, expectedComps] of Object.entries(c.components)) {
      const f = res.findings.find(x => x.feature === role);
      assert.ok(f && f.components, c.id + ' componentes ausentes para ' + role);
      assert.deepEqual(Array.from(f.components, x => x.snippet), expectedComps, c.id + ' componentes de ' + role);
    }
  }
}

/* 2. Contrastes e abstenções obrigatórias */
const abstentions = [
  ['CON-01', 'O minha casa brilhou.'],
  ['CON-02', 'Aquele casa caiu.'],
  ['CON-03', 'A luz das estrelas brilharam.'],
  ['CON-04', 'A escritora dedicou o livro ao mãe.'],
  ['CON-05', 'O menino é serena.'],
  ['CON-06', 'Eu comprei a casa nova.'],
  ['CON-07', 'Eu gosto do livro.'],
  ['CON-08', 'Sonho terminou.'],
  ['CON-09', 'A escritora escreveu o poema no janela.'],
  ['CON-10', 'A menina e o menino canta.'],
  ['CON-11', 'Eu e Maria cantam.'],
  ['CON-12', 'A menina, e o menino cantam.'],
  ['CON-13', 'A casa e a rua permaneceram silenciosos.'],
  ['CON-14', 'Eu canto, mas.'],
  ['CON-15', 'Eu estou lendo e ela canta.'],
  ['CON-16', 'A carta foi escrita.'],
  ['CON-17', 'O livro foi escrita pela escritora.'],
  ['CON-18', 'A carta está escrita pela escritora.'],
  ['CON-19', 'Quando a chuva terminou o menino saiu.'],
  ['CON-20', 'A menina cantou que o livro chegou.'],
  ['CON-21', 'Eu estou lendo o livro que chegou.'],
  ['CON-22', 'Canto.'],                            // homógrafo isolado (preservar REL-N10)
  ['CON-23', 'Escrevia a carta.'],                 // sincretismo 1ª/3ª sg no imperfeito (eu/ele escrevia)
  ['CON-24', 'Disse que li o livro.'],             // sincretismo 1ª/3ª sg em "disse"
  ['CON-25', 'Eu, canto.'],                        // pronome pessoal não é vocativo (preservar REL-N37)
  ['CON-26', 'Maria, os amigos, leu o livro.']     // aposto plural discordante de sujeito singular
];

for (const [id, text] of abstentions) {
  const res = vault.analyze('sintaxe', text);
  assert.equal(res.findings.length, 0, id + ' deveria abster em: ' + text);
}

/* 3. Limite de saída nunca divide um período composto pela metade */
assert.equal(E.syntaxRelations.analyze('Eu canto e ela corre.', 5).length, 0, 'não dividir coordenação por limite de saída');
assert.equal(E.syntaxRelations.analyze('A escritora disse que o livro chegou.', 5).length, 0, 'não dividir subordinação por limite de saída');

console.log('OK: Sintaxe literária, passiva, coordenação, subordinação, elipse, vocativo e aposto (' + positives.length + ' construções + ' + abstentions.length + ' contrastes de precisão) verificada.');
