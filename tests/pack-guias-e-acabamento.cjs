/* Executar: node tests/pack-guias-e-acabamento.cjs. Valida foco sem reset, acabamento de seleção e guias acessíveis por lente e classe. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { setup } = require('../ptbr/teste-painel.js');

const root = path.resolve(__dirname, '..');
const scripts = require('./helpers/sources.cjs').scripts();
const ctx = vm.createContext({});
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
vm.runInContext(fs.readFileSync(path.join(root, 'ptbr/leitura-visual.js'), 'utf8'), ctx);
const E = ctx.Escr;

function all(n, cls) {
  const hit = n.className && n.className.split(/\s+/).includes(cls) ? [n] : [];
  return hit.concat(...(n.childNodes || []).map(c => all(c, cls)));
}

/* 1. Focar/clicar dentro do painel enquanto vê resultado ou exemplo NÃO reseta a tela */
const text = 'Uma frase sem advérbio.';
const p = setup(text, [], E);
p.panel.hidden = false;
p.panel.focus();
p.wheel.childNodes.find(b => b.attrs['data-ptbr-lens'] === 'adverbios').click();
p.flush();
assert.equal(all(p.results, 'ptbr-example-card').length, 3);
all(p.results, 'ptbr-example-btn')[0].click();
assert.equal(all(p.board, 'ptbr-example-banner').length, 1, 'modo exemplo aberto');

/* Simular clique em área vazia do painel -> dispara focus em #oficina */
p.panel.focus();
assert.equal(all(p.board, 'ptbr-example-banner').length, 1, 'clicar dentro do painel NÃO sai nem reseta o exemplo');
assert.equal(p.goals.hidden, true, 'não volta à tela inicial ao focar o painel');

/* 2. Todas as 16 lentes têm guia acessível recolhível ("O que é…") */
const allLenses = [
  'morfologia', 'sintaxe', 'relativas', 'adverbios', 'ritmo', 'repeticao',
  'dialogo', 'rima', 'metrica', 'crase', 'concordancia', 'ortografia',
  'acentuacao', 'pontuacao', 'expressoes', 'decolonial'
];
for (const lens of allLenses) {
  assert.ok(E.lensGuides[lens] && E.lensGuides[lens].title && E.lensGuides[lens].summary, 'guia acessível presente para ' + lens);
}

const guideBtn = all(p.board, 'ptbr-guide-toggle')[0];
const guideCard = all(p.board, 'ptbr-guide-card')[0];
assert.ok(guideBtn && guideCard, 'guia renderizado na tela de análise');
assert.equal(guideCard.hidden, true, 'guia começa recolhido para quem já sabe');
guideBtn.click();
assert.equal(guideCard.hidden, false, 'guia abre ao clicar');
assert.ok(guideCard.textContent.toLowerCase().includes('ação'), 'explicação direta e prática de advérbio');

/* 3. Micro-definição automática na lateral em Advérbios, Morfologia e Sintaxe (incluindo subordinadas) */
const advGloss = all(p.board, 'ptbr-term-gloss')[0];
assert.ok(advGloss && !advGloss.hidden && advGloss.textContent.includes('Advérbio:'), 'definição lateral exibida em Advérbios');

const p2 = setup('A escritora escreveu o poema porque a chuva caiu.', [], E);
p2.panel.hidden = false;
p2.panel.focus();
p2.wheel.childNodes.find(b => b.attrs['data-ptbr-lens'] === 'sintaxe').click();
p2.flush();
const conjBtn = all(p2.board, 'ptbr-syntax-term').find(b => b.attrs['aria-label'].includes('Conjunção subordinativa'));
assert.ok(conjBtn, 'conjunção subordinativa encontrada');
conjBtn.click();
const synGloss = all(p2.board, 'ptbr-term-gloss')[0];
assert.ok(synGloss && !synGloss.hidden && synGloss.textContent.includes('Oração subordinada:'), 'definição clara de oração subordinada na lateral');

const p3 = setup('A menina canta.', [], E);
p3.panel.hidden = false;
p3.panel.focus();
p3.wheel.childNodes.find(b => b.attrs['data-ptbr-lens'] === 'morfologia').click();
p3.flush();
const verbWord = all(p3.board, 'ptbr-word').find(b => b.childNodes[0].textContent === 'canta');
verbWord.click();
const morphGloss = all(p3.board, 'ptbr-term-gloss')[0];
assert.ok(morphGloss && !morphGloss.hidden && morphGloss.textContent.includes('Verbo:'), 'definição clara de verbo na lateral');

/* 4. Sem borda dupla amadora em .ptbr-excerpt[aria-pressed="true"] */
const css = fs.readFileSync(path.join(root, 'ptbr/leitura-visual.css'), 'utf8');
assert.ok(css.includes('.ptbr-excerpt[aria-pressed="true"] {') && css.includes('outline:none !important;'), 'seleção sem borda dupla');

console.log('PACK GUIAS & ACABAMENTO OK: clique interno sem reset, seleção limpa sem borda dupla, 16 guias recolhíveis e definições diretas de classes/funções.');
