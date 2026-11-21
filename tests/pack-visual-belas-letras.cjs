/* Executar: node tests/pack-visual-belas-letras.cjs. Valida os 4 blocos do Pack Visual · Belas Letras. */
'use strict';
const { Node } = require('../ptbr/teste-painel.js');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({});
for (const source of require('./helpers/sources.cjs').scripts()) {
  if (source.includes('root.Escr.mountUtilities')) { break; }
  vm.runInContext(source, ctx);
}
const E = ctx.Escr;
const vault = E.createVault(E.knowledge);

const doc = new Node('document');
const timers = [];
doc.createElement = tag => { const n = new Node(tag); n.style = {}; return n; };
doc.createElementNS = (ns, tag) => new Node(tag);
Node.prototype.getBoundingClientRect = function () {
  if (this.className === 'ptbr-syntax-row' || this.className === 'ptbr-word-row') { return { left: 0, top: 0, width: 1100, height: 120 }; }
  const siblings = (this.parentNode && this.parentNode.childNodes) || [];
  const idx = Math.max(0, siblings.indexOf(this));
  return { left: idx * 140, top: 96, width: 120, height: 54 };
};
const win = {
  Escr: E, document: doc,
  setTimeout: fn => { timers.push(fn); return timers.length; },
  clearTimeout: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'ptbr/leitura-visual.js'), 'utf8'), { window: win });

function all(n, cls) {
  const ownMatch = n.className && n.className.split(/\s+/).includes(cls) ? [n] : [];
  return ownMatch.concat(...(n.childNodes || []).map(c => all(c, cls)));
}
function tags(n, tag) {
  return (n.tagName === tag ? [n] : []).concat(...(n.childNodes || []).map(c => tags(c, tag)));
}
function flush() { while (timers.length) { timers.shift()(); } }

/* === BLOCO 1: Hierarquia visual das funções sintáticas (reduzida, deslocado, clítico, locução aspectual) === */
const redText = 'Ao abrir a porta, encontramos o silêncio.';
const redBox = doc.createElement('div');
const redR = E.renderReadingMap(redBox, { snapshot: redText, lens: 'sintaxe', findings: vault.analyze('sintaxe', redText).findings, onSelect: () => {} });
flush();
const redTerms = all(redBox, 'ptbr-syntax-term');
const redVerb = redTerms.find(b => b.attrs['data-syntax-subrole'] === 'reduzida');
assert.ok(redVerb, 'verbo reduzido marcado com data-syntax-subrole="reduzida"');
assert.ok(all(redBox, 'ptbr-clause-badge').some(el => el.textContent.includes('Oração reduzida')), 'cabeçalho de cláusula exibe selo Oração reduzida');
assert.ok(all(redBox, 'ptbr-clause-badge').some(el => el.textContent.includes('Sujeito oculto')), 'cabeçalho de cláusula exibe selo Sujeito oculto');
redR.destroy();

const richText = 'Na janela, a escritora não lhe contou o segredo ontem.';
const richBox = doc.createElement('div');
const richR = E.renderReadingMap(richBox, { snapshot: richText, lens: 'sintaxe', findings: vault.analyze('sintaxe', richText).findings, onSelect: () => {} });
flush();
const richTerms = all(richBox, 'ptbr-syntax-term');
assert.ok(richTerms.some(b => b.attrs['data-syntax-subrole'] === 'deslocado'), 'adjunto deslocado recebe subrole="deslocado"');
assert.ok(richTerms.some(b => b.attrs['data-syntax-subrole'] === 'clitico'), 'clítico em próclise recebe subrole="clitico"');

/* === BLOCO 2: Arcos SVG para 6 vínculos simultâneos no verbo, altura dinâmica e zero colisão de rótulos === */
const verbBtn = richTerms.find(b => b.attrs['data-syntax-role'] === 'verbo');
assert.ok(verbBtn, 'botão do verbo encontrado');
verbBtn.click();
flush();
const paths = tags(richBox, 'path');
assert.equal(paths.length, 6, 'exibe todos os 6 vínculos do verbo (sujeito, adjunto deslocado, negação, clítico OI, OD, adjunto final)');
const svgEl = tags(richBox, 'svg')[0];
assert.ok(Number(svgEl.attrs.height) > 88, 'altura do SVG expande dinamicamente para acomodar 6 arcos');
const rects = tags(richBox, 'rect').map(r => ({ x1: Number(r.attrs.x), x2: Number(r.attrs.x) + Number(r.attrs.width), y: Number(r.attrs.y) }));
assert.equal(rects.length, 6, 'todos os 6 arcos têm pílula de rótulo');
for (let i = 0; i < rects.length; i++) {
  for (let j = i + 1; j < rects.length; j++) {
    const overlapX = rects[i].x1 < rects[j].x2 && rects[i].x2 > rects[j].x1;
    const overlapY = Math.abs(rects[i].y - rects[j].y) < 18;
    assert.ok(!(overlapX && overlapY), 'nenhuma sobreposição de rótulos SVG entre arcos ' + i + ' e ' + j);
  }
}
richR.destroy();

/* === BLOCO 3: Cards ricos e discretos das Lentes da Fase 1 === */
const diaText = '— Bom dia, disse ela.\n– Olá.\nA rua ficou quieta.';
const diaBox = doc.createElement('div');
E.renderReadingMap(diaBox, { snapshot: diaText, lens: 'dialogo', findings: vault.analyze('dialogo', diaText).findings, onSelect: () => {} }).destroy();
assert.equal(all(diaBox, 'ptbr-proportion-bar').length, 1, 'card de diálogo mostra barra de proporção');
assert.ok(all(diaBox, 'ptbr-metric-chip').some(c => c.textContent.includes('travessão')), 'card de diálogo mostra contagem por travessão');
assert.ok(all(diaBox, 'ptbr-metric-chip').some(c => c.textContent.includes('meia-risca')), 'card de diálogo mostra contagem por meia-risca');

const longSent = 'A escritora abriu a janela da sala silenciosa quando a chuva de outono finalmente parou sobre os telhados antigos da cidade e deixou entrar o cheiro fresco da terra molhada que lembrava todas as manhãs da sua infância distante.';
const ritText = 'O sol brilhou na manhã. A brisa entrou na sala. O livro abriu na mesa. ' + longSent;
const ritBox = doc.createElement('div');
E.renderReadingMap(ritBox, { snapshot: ritText, lens: 'ritmo', findings: vault.analyze('ritmo', ritText).findings, onSelect: () => {} }).destroy();
assert.ok(all(ritBox, 'ptbr-rhyme-badge').some(b => b.textContent === 'PANORAMA'), 'card de ritmo destaca PANORAMA');
assert.ok(all(ritBox, 'ptbr-rhyme-badge').some(b => b.textContent === 'FRASE EXTENSA'), 'card de ritmo destaca FRASE EXTENSA');
assert.ok(all(ritBox, 'ptbr-rhyme-badge').some(b => b.textContent === 'CADÊNCIA REGULAR'), 'card de ritmo destaca CADÊNCIA REGULAR');
assert.ok(all(ritBox, 'ptbr-pulse-bar').length >= 3, 'card de cadência regular mostra barras de pulso por frase');

const rimaText = 'O vento passa na casa\nA lua desce na estrada';
const rimaBox = doc.createElement('div');
E.renderReadingMap(rimaBox, { snapshot: rimaText, lens: 'rima', findings: vault.analyze('rima', rimaText).findings, onSelect: () => {} }).destroy();
assert.ok(all(rimaBox, 'ptbr-metric-chip').some(c => c.textContent === 'toante'), 'card de rima identifica selo toante');

const metText = 'A casa antiga abriu a porta';
const metBox = doc.createElement('div');
E.renderReadingMap(metBox, { snapshot: metText, lens: 'metrica', findings: vault.analyze('metrica', metText).findings, onSelect: () => {} }).destroy();
assert.ok(all(metBox, 'ptbr-metric-chip').some(c => c.textContent.includes('elis')), 'card de métrica indica elisões possíveis');

const advText = 'Ela caminhou serenamente e falou suavemente.';
const advBox = doc.createElement('div');
E.renderReadingMap(advBox, { snapshot: advText, lens: 'adverbios', findings: vault.analyze('adverbios', advText).findings, onSelect: () => {} }).destroy();
assert.ok(all(advBox, 'ptbr-metric-chip').some(c => c.textContent.includes('neste parágrafo')), 'card de advérbios mostra concentração no parágrafo');

const craText = 'Voltou à andar no jardim.';
const craBox = doc.createElement('div');
E.renderReadingMap(craBox, { snapshot: craText, lens: 'crase', findings: vault.analyze('crase', craText).findings, onSelect: () => {} }).destroy();
assert.ok(all(craBox, 'ptbr-ref-chip').some(c => c.textContent.includes('a andar')), 'card de crase mostra chip de referência');

/* === BLOCO 4: Presença das regras Belas Letras + tema escuro no CSS compilado === */
const css = fs.readFileSync(path.join(root, 'ptbr/leitura-visual.css'), 'utf8');
for (const sel of ['ptbr-clause-badge', 'ptbr-syntax-subtag', 'ptbr-proportion-bar', 'ptbr-pulse-bar', 'ptbr-ref-chip', 'data-syntax-subrole="reduzida"', 'body[data-theme="escuro"] #ptbr-dashboard .ptbr-metric-chip']) {
  assert.ok(css.includes(sel), 'regra CSS presente: ' + sel);
}

console.log('PACK VISUAL BELAS LETRAS OK: subpapéis sintáticos, 6 arcos SVG sem colisão, cards de Diálogo/Ritmo/Rima/Métrica/Advérbios/Crase e paridade CSS claro/escuro.');
