/* Executar: node tests/academia-e-integracao.cjs */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const rootDir = path.resolve(__dirname, '..');

function makeEl(tag) {
  const listeners = {};
  const attrs = {};
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    hidden: false,
    src: '',
    title: '',
    children: [],
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    appendChild(c) { el.children.push(c); return c; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    click() { (listeners.click || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {} })); },
    focus() {}
  };
  return el;
}

const docBody = makeEl('body');
const context = vm.createContext({
  Escr: {},
  window: null,
  addEventListener() {},
  document: {
    body: docBody,
    activeElement: null,
    createElement: makeEl,
    addEventListener() {}
  }
});
context.window = context;

vm.runInContext(scripts.find(s => s.includes('root.Escr.mountAcademy =')), context);
const E = context.Escr;

const catalog = E.academy.catalog();
assert.equal(catalog.length, 14);
assert.ok(catalog.some(e => e.id === 'literatura-mundial' && e.module === 'literature'));

// Confirmar que todos os 14 HTMLs existem em academia/, que scripts/build.cjs inclui 'academia' e,
// quando dist/site/ estiver montado localmente, que todos os 14 HTMLs foram copiados para dist/site/academia/.
const buildSrc = fs.readFileSync(path.join(rootDir, 'scripts/build.cjs'), 'utf8');
assert.ok(buildSrc.includes("'academia'"), 'scripts/build.cjs não copia academia/ para dist/site/');
const hasDistSite = fs.existsSync(path.join(rootDir, 'dist/site'));
for (const entry of catalog) {
  assert.ok(fs.existsSync(path.join(rootDir, 'academia', entry.file)), 'Faltando academia/' + entry.file);
  if (hasDistSite) {
    assert.ok(fs.existsSync(path.join(rootDir, 'dist/site/academia', entry.file)), 'Faltando dist/site/academia/' + entry.file);
  }
}

// Confirmar leitor Kindle Oasis (#reader, #oasis-screen, #page-prev, #page-next) em literatura-mundial.html
const litHtml = fs.readFileSync(path.join(rootDir, 'academia/literatura-mundial.html'), 'utf8');
for (const marker of ['id="reader"', 'oasis-screen', 'page-prev', 'page-next']) {
  assert.ok(litHtml.includes(marker), 'literatura-mundial.html sem ' + marker);
}

// Testar abertura do catálogo e guia no modal
const academy = E.mountAcademy();
academy.openList();
assert.equal(academy.isOpen(), true);
const modalNode = docBody.children.find(c => c.id === 'esc-academy-overlay');
assert.ok(modalNode && !modalNode.hidden);

academy.openGuide('literatura-mundial');
function findByTag(node, tag) {
  let out = [];
  if (node.tagName === tag) out.push(node);
  (node.children || []).forEach(c => { out = out.concat(findByTag(c, tag)); });
  return out;
}
const iframes = findByTag(modalNode, 'IFRAME');
assert.equal(iframes.length, 1);
assert.equal(iframes[0].src, 'academia/literatura-mundial.html');

academy.close();
assert.equal(academy.isOpen(), false);

// Testar ponte Academia <-> Oficina (metadados, recomendação por estágio, retomada e ação na barra)
for (const entry of catalog) {
  assert.ok(entry.bridge && entry.bridge.action && entry.bridge.label, 'Guia sem ponte editorial: ' + entry.id);
}

const recBlank = E.academy.recommendForContext({ words: 0, hasTitle: false });
assert.equal(recBlank.stageId, 'blank');
assert.deepEqual(Array.from(recBlank.guides, g => g.id), ['primeiras-linhas', 'bloqueio-criativo']);

const recUntitled = E.academy.recommendForContext({ words: 120, hasTitle: false });
assert.equal(recUntitled.stageId, 'untitled');
assert.deepEqual(Array.from(recUntitled.guides, g => g.id), ['titulo-do-livro', 'primeiras-linhas']);

const recDraft = E.academy.recommendForContext({ words: 320, hasTitle: true });
assert.equal(recDraft.stageId, 'drafting');
assert.deepEqual(Array.from(recDraft.guides, g => g.id), ['bloqueio-criativo', 'literatura-mundial']);

const recRev = E.academy.recommendForContext({ words: 1100, hasTitle: true });
assert.equal(recRev.stageId, 'revising');
assert.deepEqual(Array.from(recRev.guides, g => g.id), ['revisao-manuscrito', 'objeto-livro']);

const recLong = E.academy.recommendForContext({ words: 4200, hasTitle: true });
assert.equal(recLong.stageId, 'manuscript');
assert.deepEqual(Array.from(recLong.guides, g => g.id), ['revisao-manuscrito', 'mapa-lancamento-editorial']);

const memStore = {};
const fakeStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null; },
  setItem(k, v) { memStore[k] = String(v); }
};
const triggeredActions = [];
const bridged = E.mountAcademy({
  storage: fakeStorage,
  getContext: () => ({ words: 1100, hasTitle: true }),
  onAction: (action, entry) => { triggeredActions.push(action + ':' + entry.id); }
});

bridged.openGuide('objeto-livro');
assert.equal(fakeStorage.getItem('escrevaral.academy.last.v1'), 'objeto-livro');
const bridgedModal = docBody.children[docBody.children.length - 1];
const actionBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-action') === 'reader');
assert.equal(actionBtns.length, 1);
actionBtns[0].click();
assert.equal(bridged.isOpen(), false);
assert.deepEqual(triggeredActions, ['reader:objeto-livro']);

// Ao reabrir a lista, mostra sugestões contextuais e o botão de retomada do último guia
bridged.openList();
const resumeBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-resume') === 'objeto-livro');
assert.equal(resumeBtns.length, 1);
const recBtns = findByTag(bridgedModal, 'BUTTON').filter(b => b.getAttribute('data-academy-rec'));
assert.deepEqual(recBtns.map(b => b.getAttribute('data-academy-rec')), ['revisao-manuscrito', 'objeto-livro']);

// Validar vitrine Real Gabinete: 2 camadas parallax ultraleves (zero partículas em loop) + 2 tomos + 12 capítulos = 14 guias
function findByClass(node, cls) {
  let out = (node.className && node.className.split(/\s+/).includes(cls)) ? [node] : [];
  (node.children || []).forEach(c => { out = out.concat(findByClass(c, cls)); });
  return out;
}
assert.equal(findByClass(bridgedModal, 'esc-ac-layer').length, 2, 'hero leve com exatamente 2 camadas SVG de parallax');
assert.equal(findByClass(bridgedModal, 'esc-ac-mote').length, 0, 'zero partículas animadas em loop para economizar RAM/CPU');
assert.equal(findByClass(bridgedModal, 'esc-ac-art-img').length, 1, 'ilustração panorâmica Real Gabinete no hero');
assert.equal(findByClass(bridgedModal, 'esc-academy-tome').length, 2, '2 tomos em destaque (Objeto livro e Literatura mundial)');
assert.equal(findByClass(bridgedModal, 'esc-academy-tome-art').length, 2, '2 ilustrações pintadas nos tomos em destaque');
assert.equal(findByClass(bridgedModal, 'esc-academy-item').length, 12, '12 guias editoriais com numeração romana');

// Garantir assets da biblioteca Real Gabinete em WebP + inclusão no build + estética fosca sem gradientes puros
for (const imgName of ['real-gabinete-hero.webp', 'tome-objeto-livro.webp', 'tome-literatura-mundial.webp', 'banner-criacao.webp', 'banner-oficio.webp', 'banner-publicacao.webp']) {
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/library', imgName)), 'Faltando assets/library/' + imgName);
}
assert.ok(buildSrc.includes("'assets/library'"), 'scripts/build.cjs copia assets/library para dist/site/');
const academiaCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/academia.css'), 'utf8');
const realGabineteCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/real-gabinete.css'), 'utf8');
const temasLinuxCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/temas-linux.css'), 'utf8');
const modoLeitorCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/modo-leitor.css'), 'utf8');
const cartorioCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/cartorio.css'), 'utf8');
const embeddedCss = fs.readFileSync(path.join(rootDir, 'academia/embedded.css'), 'utf8');
assert.ok(!/linear-gradient|radial-gradient/i.test(academiaCss), 'academia.css não deve usar gradientes puros');
assert.ok(!/linear-gradient|radial-gradient/i.test(realGabineteCss), 'real-gabinete.css não deve usar gradientes puros');
assert.ok(academiaCss.includes('--esc-ac-chalk-light') && academiaCss.includes('--esc-ac-chalk-dark'), 'academia.css deve aplicar textura granulada de giz/papel');
assert.ok(academiaCss.includes('#cfc3ae') && !academiaCss.includes('#efe4cd'), 'academia.css calibrada em #cfc3ae sem salto de brilho');
assert.ok(realGabineteCss.includes('#cfc3ae') && !realGabineteCss.includes('#efe6d5'), 'real-gabinete.css calibrada em #cfc3ae e preservando E-Ink no espaço de trabalho');
assert.ok(!realGabineteCss.includes('#writing-space'), 'real-gabinete.css não deve alterar o espaço de trabalho E-Ink Sálvia');
assert.ok(temasLinuxCss.includes('body[data-view="workspace"][data-immersion="true"] #writing-space .focus-mask'), 'temas-linux.css corrige .focus-mask no Superfoco sem degrau lateral');
assert.ok(modoLeitorCss.includes('--reader-paper: #cfc3ae'), 'modo-leitor.css calibrado em pergaminho Real Gabinete #cfc3ae');
assert.ok(!/#fffdf9|#f8f5ef/i.test(cartorioCss), 'cartorio.css sem caixas brancas estouradas');
assert.ok(embeddedCss.includes('--paper:#cfc3ae') && !embeddedCss.includes('#fafbfc'), 'academia/embedded.css calibrado em #cfc3ae');
assert.ok(litHtml.includes('--paper:#cfc3ae'), 'literatura-mundial.html linha do tempo em pergaminho #cfc3ae');
assert.ok(litHtml.includes('--oasis-paper:#c4cfc2'), 'literatura-mundial.html preserva leitor Kindle Oasis 100% em E-Ink Sálvia #c4cfc2');
assert.ok(litHtml.includes('button.oasis-key:hover:not(:disabled)'), 'literatura-mundial.html protege destaque hover E-Ink nos botões do Kindle Oasis');
assert.ok(realGabineteCss.includes('#oficina select'), 'real-gabinete.css estiliza selects/inputs dentro de #oficina em pergaminho (sem verde vazado)');
assert.ok(realGabineteCss.includes('@keyframes escMagicSweep') && realGabineteCss.includes('clip-path: inset(0 100% 0 0)'), 'real-gabinete.css revela Academia e Literatura em 3 etapas no hover (quieto em repouso)');
assert.ok(temasLinuxCss.includes('#items-column #esc-items-list > .esc-item-card') && temasLinuxCss.includes('border-radius: 0 !important'), 'temas-linux.css mantém notas retas ponta a ponta na coluna do meio');
assert.ok(fs.existsSync(path.join(rootDir, 'MANUAL-MOTION.md')), 'MANUAL-MOTION.md documenta a regra das áreas nobres e 3 etapas');
const academiaJs = fs.readFileSync(path.join(rootDir, 'src/ui/academia.js'), 'utf8');
assert.ok(academiaJs.includes("var paper = isDark ? '#211a14' : '#cfc3ae'"), 'academia.js envia paleta Real Gabinete claro (#cfc3ae) e Nogueira Opaca noturna (#211a14) aos iframes');
assert.ok(litHtml.includes('--oasis-paper:#1d221d'), 'literatura-mundial.html calibra Kindle Oasis noturno em Ardósia Sálvia Opaca #1d221d');
assert.ok(temasLinuxCss.includes('--esc-bg: #1d221d') && temasLinuxCss.includes('--esc-manuscript: #d8dfd4'), 'temas-linux.css define Modo Noturno opaco calibrado sem preto/branco puro');
assert.ok(temasLinuxCss.includes('rotateY(-24deg)') && temasLinuxCss.includes('#gabinete .original-box .box-lid'), 'temas-linux.css anima abertura rígida do caderno e da gaveta na Estante estilo AFK Journey');
assert.ok(temasLinuxCss.includes('.esc-drawer-mini') && temasLinuxCss.includes('.esc-notebook-mini') && temasLinuxCss.includes('#location-path #path-original::before'), 'temas-linux.css provê miniaturas espaciais no breadcrumb e no interior de gavetas/cadernos');
assert.ok(temasLinuxCss.includes('.esc-cafe-diorama') && temasLinuxCss.includes('.esc-cafe-scene-br'), 'temas-linux.css inclui o diorama parisiense responsivo da Estante');
assert.equal((temasLinuxCss.match(/DIORAMA PARISIENSE NA ESTANTE/g) || []).length, 1, 'temas-linux.css define o bloco do diorama parisiense uma única vez');
const builtIndexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert.ok(builtIndexHtml.includes('id="esc-cafe-diorama"') && builtIndexHtml.includes('assets/library/estante-cafe-bistro.webp') && builtIndexHtml.includes('assets/library/estante-livros-outono.webp') && builtIndexHtml.includes('assets/library/estante-trepadeira-outono.webp'), 'index.html gerado inclui o diorama AFK Journey em WebP local na Estante');
for (const dioramaArt of ['estante-cafe-bistro.webp', 'estante-livros-outono.webp', 'estante-trepadeira-outono.webp']) {
  assert.ok(fs.existsSync(path.join(rootDir, 'assets/library', dioramaArt)), 'assets/library/' + dioramaArt + ' presente para uso offline');
}
const builtPortableHtml = fs.readFileSync(path.join(rootDir, 'escrevaral.html'), 'utf8');
assert.ok(!builtPortableHtml.includes('assets/library/estante-cafe-bistro.webp'), 'escrevaral.html portátil omite <img> externas do diorama para zero ícone quebrado offline');
const controladorSrc = fs.readFileSync(path.join(rootDir, 'src/editor/controlador.js'), 'utf8');
assert.ok(controladorSrc.includes('function purgeEntrySafe(') && controladorSrc.includes('function silenceSound('), 'controlador.js protege exclusão direta sem textos órfãos e silencia som sem sobrescrever preferência');
const tresColCss = fs.readFileSync(path.join(rootDir, 'src/ui/styles/tres-colunas.css'), 'utf8');
assert.ok(tresColCss.includes('body[data-view="gabinete"] .esc-mobile-bar'), 'tres-colunas.css oculta barra mobile na Estante e no Superfoco');
assert.ok(realGabineteCss.includes('.ptbr-word:not([data-word-class-norm])'), 'real-gabinete.css preserva cores de Morfologia e Sintaxe no Modo Noturno');
const autopubHtml = fs.readFileSync(path.join(rootDir, 'academia/autopublicacao-independente.html'), 'utf8');
assert.ok(autopubHtml.includes('AFK-REAL-GABINETE-ORNAMENTS-START'), 'autopublicacao-independente.html com ornamentos AFK x Real Gabinete');
for (const entry of catalog) {
  const html = fs.readFileSync(path.join(rootDir, 'academia', entry.file), 'utf8');
  assert.ok(html.includes('#cfc3ae'), 'academia/' + entry.file + ' calibrado em #cfc3ae');
  assert.ok(!html.includes('--paper:#fafbfc'), 'academia/' + entry.file + ' sem --paper branco antigo');
  if (entry.id !== 'objeto-livro' && entry.id !== 'literatura-mundial') {
    assert.ok(html.includes('AFK-REAL-GABINETE-ORNAMENTS-START') && html.includes("img-src 'self' data:;"), 'academia/' + entry.file + ' com ornamentos AFK e banner WebP local');
    assert.ok(!html.includes('@media(prefers-color-scheme:dark)'), 'academia/' + entry.file + ' não deve forçar fundo escuro sobre texto escuro em SO dark');
  }
}
const swSrc = fs.readFileSync(path.join(rootDir, 'service-worker.js'), 'utf8');
assert.ok(!swSrc.includes('RUNTIME_CACHE = "scrvrl-runtime-v1"'), 'service-worker.js versiona RUNTIME_CACHE por geração');
assert.ok(swSrc.includes("name.startsWith('scrvrl-runtime-')"), 'service-worker.js limpa caches runtime antigos na ativação');
assert.ok(swSrc.includes('./academia/literatura-mundial.html'), 'service-worker.js pré-cacheia guias da Academia no modo bunker');
const manifestJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.webmanifest'), 'utf8'));
assert.equal(manifestJson.theme_color, '#c4cfc2', 'manifest theme_color calibrado em E-Ink Sálvia');
assert.equal(manifestJson.background_color, '#c4cfc2', 'manifest background_color calibrado em E-Ink Sálvia');
bridged.close();

console.log('OK: Academia, Real Gabinete calibrado (#cfc3ae) e separação Trabalho (E-Ink Sálvia) vs Estudo (Real Gabinete) verificados.');
