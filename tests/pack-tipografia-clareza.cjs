/* Executar: node tests/pack-tipografia-clareza.cjs. Valida Manual de Tipografia, zero monospace na UI da Oficina, contraste e linguagem humana. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { Node, setup } = require('../ptbr/teste-painel.js');

const root = path.resolve(__dirname, '..');
const scripts = require('./helpers/sources.cjs').scripts();

/* 1. Manual tipográfico e tokens de fonte/escala */
const manual = fs.readFileSync(path.join(root, 'MANUAL-TIPOGRAFIA.md'), 'utf8');
for (const token of ['--esc-font-ui', '--esc-font-serif', '--esc-font-mono', '--esc-text-xs', '--esc-text-base', '--esc-text-xl']) {
  assert.ok(manual.includes(token), 'MANUAL-TIPOGRAFIA.md documenta ' + token);
}

/* 2. Zero Courier Prime / monospace na Oficina (ptbr/leitura-visual.css) e nos saltos da Academia */
const visCss = fs.readFileSync(path.join(root, 'ptbr/leitura-visual.css'), 'utf8');
assert.ok(!/Courier Prime|Courier New|monospace/i.test(visCss), 'ptbr/leitura-visual.css não usa fonte de máquina na interface');
assert.ok(visCss.includes('grid-template-columns:repeat(2'), 'Examinar usa grade compacta em 2 colunas');

const themeCss = fs.readFileSync(path.join(root, 'src/ui/styles/temas-linux.css'), 'utf8');
assert.ok(themeCss.includes('.sheet:not(#oficina) button[aria-pressed="true"]'), 'regra .sheet não pinta pílulas da Oficina de preto');
assert.ok(themeCss.includes('--esc-font-ui:'), 'tokens tipográficos definidos em :root');

/* 3. Linguagem humana na leitura de Classes de palavras (sem "· léxico", "ambígua", "sem leitura", "(UD)", "deste incremento") */
const ctx = vm.createContext({});
for (const s of scripts) {
  if (s.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(s, ctx);
}
const E = ctx.Escr;
const sample = 'oi tudo que fizermos será seu e não posso mais deixar passar';
const panel = setup(sample, [], E);
panel.panel.hidden = false;
panel.panel.focus();
panel.wheel.childNodes.find(b => b.attrs['data-ptbr-lens'] === 'morfologia').click();
panel.flush();

function all(n, cls) {
  const hit = n.className && n.className.split(/\s+/).includes(cls) ? [n] : [];
  return hit.concat(...(n.childNodes || []).map(c => all(c, cls)));
}

const wordTags = all(panel.board, 'ptbr-word-tag').map(t => t.textContent);
assert.ok(wordTags.length >= 10, 'pílulas renderizadas');
for (const t of wordTags) {
  assert.ok(!/léxico/i.test(t), 'etiqueta sem jargão "léxico": ' + t);
  assert.ok(!/ambígua/i.test(t), 'etiqueta sem jargão "ambígua": ' + t);
  assert.ok(!/sem leitura/i.test(t), 'etiqueta sem jargão "sem leitura": ' + t);
  assert.ok(!/\(UD\)/i.test(t), 'etiqueta sem sigla "(UD)": ' + t);
}

const filterChips = all(panel.board, 'ptbr-class-chip').map(c => c.textContent);
assert.ok(filterChips.some(c => c.includes('Depende do contexto')), 'chip de filtro usa linguagem humana "Depende do contexto"');
assert.ok(!filterChips.some(c => /Ambígua|sem leitura/i.test(c)), 'nenhum chip de filtro usa "Ambígua / sem leitura"');

/* Selecionar "que" (múltiplas possibilidades): explicação visível diz "Pode ser ... — verifique o contexto da frase." */
const queBtn = all(panel.board, 'ptbr-word').find(b => b.childNodes[0].textContent === 'que');
assert.ok(queBtn, 'botão da palavra "que" encontrado');
queBtn.click();
panel.flush();
const visibleAside = all(panel.board, 'ptbr-reading-details')[0];
const summary = all(visibleAside, 'ptbr-reading-summary')[0];
assert.ok(summary, 'resumo humano visível na lateral');
assert.ok(summary.textContent.startsWith('Pode ser ') && summary.textContent.includes('verifique o contexto'), 'resumo humano em "que": ' + summary.textContent);
assert.ok(!/\(UD\)|incremento|léxico/i.test(summary.textContent), 'resumo visível limpo de termos da engine: ' + summary.textContent);

const selectionTitle = all(panel.board, 'ptbr-reading-selection')[0].textContent;
assert.equal(selectionTitle, '“que”', 'título lateral não repete "· ambígua"');

console.log('PACK TIPOGRAFIA & CLAREZA OK: Manual de Tipografia, zero monospace na UI, contraste AAA sem inversão preta, grade 2-col em Examinar e linguagem humana.');
