/* Executar: node tests/pack-exemplos-humanos.cjs. Valida 48 exemplos educativos (16 lentes x 3) e simulação sem alterar manuscrito. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { setup } = require('../ptbr/teste-painel.js');
const scripts = require('./helpers/sources.cjs').scripts();

const ctx = vm.createContext({});
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../ptbr/leitura-visual.js'), 'utf8'), ctx);
const E = ctx.Escr;
const vault = E.createVault(E.knowledge);

const expectedLenses = [
  'relativas', 'sintaxe', 'morfologia', 'ritmo', 'repeticao', 'dialogo',
  'adverbios', 'rima', 'metrica', 'crase', 'concordancia', 'ortografia',
  'acentuacao', 'pontuacao', 'expressoes', 'decolonial'
];

/* 1. Inicializa o painel (carrega leitura-visual.js + painel.js) e verifica os 48 exemplos no motor real */
const originalText = 'Vamos testar uma frase simples sem relativa.';
const panel = setup(originalText, [], E);
assert.ok(E.lensExamples, 'E.lensExamples exportado');
let total = 0;
for (const lens of expectedLenses) {
  const list = E.lensExamples[lens];
  assert.ok(Array.isArray(list) && list.length === 3, 'lente ' + lens + ' precisa de exatamente 3 exemplos');
  for (const ex of list) {
    assert.ok(ex.theme && ex.text && ex.note, 'exemplo completo em ' + lens);
    const r = vault.analyze(lens, ex.text);
    assert.ok(r.findings.length > 0, 'exemplo precisa gerar análise real em ' + lens + ': ' + ex.text);
    total += 1;
  }
}
assert.equal(total, 48);

function all(n, cls) {
  const hit = n.className && n.className.split(/\s+/).includes(cls) ? [n] : [];
  return hit.concat(...(n.childNodes || []).map(c => all(c, cls)));
}

/* 2. Estado vazio em Relativas exibe 3 exemplos e permite simular análise sem alterar o manuscrito */
panel.panel.hidden = false;
panel.panel.focus();
panel.wheel.childNodes.find(b => b.attrs['data-ptbr-lens'] === 'relativas').click();
panel.flush();

const cards = all(panel.board, 'ptbr-example-card');
assert.equal(cards.length, 3, 'Relativas sem ocorrências exibe 3 cards de exemplo');
const simBtn = all(panel.board, 'ptbr-example-btn')[0];
assert.ok(simBtn, 'botão Simular análise presente');
simBtn.click();
assert.equal(panel.manuscript.value, originalText, 'simulação de exemplo NUNCA altera o manuscrito');
assert.equal(all(panel.board, 'ptbr-example-banner').length, 1, 'faixa de exemplo demonstrativo exibida');
assert.ok(all(panel.board, 'ptbr-syntax-term').length >= 2, 'análise real da relativa renderizada para o exemplo');

/* 3. Voltar ao texto do autor retorna à análise do manuscrito intacto */
const exitBtn = all(panel.board, 'ptbr-example-exit')[0];
assert.ok(exitBtn, 'botão Voltar ao meu texto presente');
exitBtn.click();
panel.flush();
assert.equal(panel.manuscript.value, originalText, 'manuscrito preservado ao voltar');
assert.equal(all(panel.board, 'ptbr-example-card').length, 3, 'volta ao estado do manuscrito atual');

/* 4. Folha completamente vazia também oferece atalhos de exemplo na tela inicial */
const blankPanel = setup('', [], E);
blankPanel.panel.hidden = false;
blankPanel.panel.focus();
const blankBox = all(blankPanel.board, 'ptbr-blank-samples')[0];
assert.ok(blankBox && !blankBox.hidden, 'seção de exemplos visível na folha em branco');
const blankBtn = all(blankBox, 'ptbr-example-btn')[0];
blankBtn.click();
assert.equal(blankPanel.manuscript.value, '', 'folha em branco continua em branco após simular exemplo');
assert.equal(all(blankPanel.board, 'ptbr-example-banner').length, 1, 'exemplo funciona mesmo a partir da folha em branco');

console.log('PACK EXEMPLOS HUMANOS OK: 48 exemplos (16 lentes x 3) verificados no motor real + simulação interativa sem alterar o manuscrito.');
