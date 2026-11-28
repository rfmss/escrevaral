/* Executar: node tests/modo-leitor-e-formatacao.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function makeTextNode(val) {
  return { nodeType: 3, nodeValue: val, parentNode: null, nextSibling: null };
}
function makeEl(tag) {
  const el = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    childNodes: [],
    children: [],
    parentNode: null,
    nextSibling: null,
    get firstChild() { return this.childNodes[0] || null; },
    appendChild(child) {
      if (child.nodeType === 11) {
        child.childNodes.slice().forEach(c => el.appendChild(c));
        return child;
      }
      if (this.childNodes.length) {
        this.childNodes[this.childNodes.length - 1].nextSibling = child;
      }
      child.parentNode = this;
      child.nextSibling = null;
      this.childNodes.push(child);
      if (child.nodeType === 1) { this.children.push(child); }
      return child;
    },
    _innerHTML: '',
    get innerHTML() { return this._innerHTML; },
    set innerHTML(v) { this._innerHTML = v; }
  };
  return el;
}

const lastRange = { startContainer: null, startOffset: 0, endContainer: null, endOffset: 0,
  setStart(n, o) { this.startContainer = n; this.startOffset = o; },
  setEnd(n, o) { this.endContainer = n; this.endOffset = o; }
};

const context = vm.createContext({
  Escr: {},
  document: {
    createElement: makeEl,
    createTextNode: makeTextNode,
    createDocumentFragment() { return { nodeType: 11, childNodes: [], firstChild: null, appendChild(c) { this.childNodes.push(c); return c; } }; },
    createRange() { return lastRange; }
  }
});

for (const marker of [
  'root.Escr.countManuscript =',
  'root.Escr.richEditor =',
  'root.Escr.readerCore ='
]) {
  const src = scripts.find(s => s.includes(marker));
  assert.ok(src, 'missing script for ' + marker);
  vm.runInContext(src, context);
}

const E = context.Escr;

// 1. plainToSafeHtml preserva - travessão literário e escapa tags
const rawPlain = '- Bom dia, disse ela.\n\nParágrafo com <script>alert(1)</script>';
const html = E.richEditor.plainToSafeHtml(rawPlain);
assert.ok(html.includes('<p>- Bom dia, disse ela.</p>'));
assert.ok(!html.includes('<script>alert(1)</script>'));
assert.ok(html.includes('&lt;script&gt;'));

// 2. Sanitização remove elementos perigosos na árvore DOM
const dirtyRoot = makeEl('div');
const p1 = makeEl('p');
p1.appendChild(makeTextNode('Primeiro trecho '));
const strong = makeEl('strong');
strong.appendChild(makeTextNode('importante'));
p1.appendChild(strong);
const p2 = makeEl('p');
p2.appendChild(makeTextNode('Segundo bloco'));
dirtyRoot.appendChild(p1);
dirtyRoot.appendChild(p2);

const proj = E.richEditor.projectDomToPlain(dirtyRoot);
assert.equal(proj.text, 'Primeiro trecho importante\nSegundo bloco');

// 3. Mapeamento UTF-16 de volta ao nó DOM exato
const mapped = E.richEditor.mapPlainRangeToDom(dirtyRoot, 16, 26); // "importante"
assert.equal(mapped.startContainer.nodeValue, 'importante');
assert.equal(mapped.startOffset, 0);
assert.equal(mapped.endOffset, 10);

// 4. Preferências e cálculo de tempo no Modo Leitura (inclui Papel Algodão + clima ilustrado)
const prefs = E.readerCore.normalizePrefs({ palette: 'night', face: 'sans', size: 40, breakMin: 25 });
assert.equal(prefs.palette, 'night');
assert.equal(prefs.face, 'sans');
assert.equal(prefs.size, 32); // clamp 17..32
assert.equal(prefs.breakMin, 25);
assert.equal(prefs.showScene, true);

const prefsCotton = E.readerCore.normalizePrefs({ palette: 'cotton', showScene: false });
assert.equal(prefsCotton.palette, 'cotton');
assert.equal(prefsCotton.showScene, false);

// 4b. Parser de Roteiro / Ensaio (Read-Thru): roteiro estruturado e prosa com diálogo
const scriptSample = 'INT. SALA DE ENSAIO - NOITE\n\nJACK\n(baixo)\nSo we got the brain.\n\nANDREW\nNext pick.\n\nJACK\nFinally!';
const parsedScript = E.readerCore.parseReadThru(scriptSample);
assert.equal(parsedScript.isScript, true);
assert.deepEqual(Array.from(parsedScript.characters), ['JACK', 'ANDREW']);
assert.equal(parsedScript.steps.length, 3);
assert.equal(parsedScript.blocks.filter(b => b.kind === 'dialogue' && b.speaker === 'JACK').length, 2);

const proseSample = 'A sala ficou quieta.\n— Vamos começar agora?\n— Claro, respondeu ela.';
const parsedProse = E.readerCore.parseReadThru(proseSample);
assert.equal(parsedProse.isScript, false);
assert.equal(parsedProse.hasDialogues, true);
assert.equal(parsedProse.steps.length, 3);

const stats = E.readerCore.readingMinutes(Array(420).fill('palavra').join(' '));
assert.equal(stats.words, 420);
assert.equal(stats.minutes, 2);

// 5. Integridade da impressão: bloqueio quando trancado, HTML vivo no modo formatado e parágrafos no texto simples
const fs = require('node:fs');
const path = require('node:path');
const rootDir = path.resolve(__dirname, '..');
const ctrlSrc = fs.readFileSync(path.join(rootDir, 'src/editor/controlador.js'), 'utf8');
const baseCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/base.css'), 'utf8');
const temasCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/temas-linux.css'), 'utf8');
assert.ok(ctrlSrc.includes("getAttribute('data-locked') === 'true'") && ctrlSrc.includes('richUI.html()'), 'preparePrint protege gabinete trancado e lê HTML vivo no modo formatado');
assert.ok(ctrlSrc.includes("ptText.className = 'is-plain'") && ctrlSrc.includes("document.createElement('p')"), 'preparePrint divide texto simples em parágrafos <p> para órfãs/viúvas corretas');
assert.ok(baseCss.includes('body[data-locked="true"] > #print-sheet { display: none !important; }'), 'base.css impede impressão quando gabinete está trancado');
assert.ok(baseCss.includes('#print-title[hidden] { display: none !important; }'), 'base.css oculta título vazio na impressão');
assert.ok(!/@media\s+print\b/.test(temasCss), 'temas-linux.css não contém @media print aninhado morto dentro de @media screen');

console.log('OK: formatação leve com projeção UTF-16 exata, modo leitura editorial e integridade de impressão verificados.');
