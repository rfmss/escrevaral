const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const index = read("index.html");
const app = read("app.js");
const serviceWorker = read("service-worker.js");
const accessibilityCss = read("css/13-accessibility.css");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function testMainViewsHaveAccessibleNames() {
  const views = ["editor", "biblioteca", "autoria", "arquivo", "academia", "cronograma"];
  for (const view of views) {
    const titleId = `view-title-${view}`;
    const panelPattern = new RegExp(
      `<section[^>]*id="view-${view}"[^>]*aria-labelledby="${titleId}"[^>]*>`
    );
    const headingPattern = new RegExp(`<h1[^>]*id="${titleId}"[^>]*>|<h1[^>]*id='${titleId}'[^>]*>`);
    assert(panelPattern.test(index), `A área ${view} precisa apontar para ${titleId}.`);
    assert(headingPattern.test(index), `A área ${view} precisa de um h1 com id ${titleId}.`);
  }
}

function testKeyboardShortcutReachesMainContent() {
  assert(
    index.includes('class="skip-link" href="#main-content"'),
    "O atalho de teclado para o conteúdo principal está ausente."
  );
  assert(
    /<main[^>]*id="main-content"[^>]*tabindex="-1"/.test(index),
    "O conteúdo principal precisa ser um destino de foco programático."
  );
}

function testViewChangesAreAnnounced() {
  assert(index.includes('id="view-announcer"'), "A região de anúncio das áreas está ausente.");
  assert(app.includes("const VIEW_TITLES"), "Os títulos das áreas precisam estar centralizados.");
  assert(app.includes("updateViewContext(viewName)"), "A navegação precisa atualizar o contexto da página.");
  assert(app.includes("document.title = `${viewTitle} — Escrevaral`"), "O título da aba precisa acompanhar a área.");
}

function testFocusAndMotionPreferencesAreProtected() {
  assert(accessibilityCss.includes(":focus-visible"), "O foco de teclado precisa permanecer visível.");
  assert(
    accessibilityCss.includes("@media (prefers-reduced-motion: reduce)"),
    "A preferência por movimento reduzido precisa ser respeitada globalmente."
  );
}

function testMobileTargetsMeetMinimumSize() {
  assert(
    accessibilityCss.includes("min-width: 44px") && accessibilityCss.includes("min-height: 44px"),
    "Os controles de toque precisam ter pelo menos 44 por 44 pixels."
  );
}

function testButtonsDoNotDefaultToFormSubmission() {
  assert(
    !/<button(?![^>]*\btype=)/i.test(index),
    "Todo botão estático precisa declarar type para evitar envios acidentais."
  );
}

function testNoExternalFontDependency() {
  assert(!index.includes("fonts.googleapis.com"), "Fontes do Google não podem bloquear a primeira pintura.");
  assert(!index.includes("fonts.gstatic.com"), "O produto deve usar as pilhas tipográficas locais.");
}

function testNoTrackingContradictsPrivacyPromise() {
  const combined = `${index}\n${app}`;
  assert(!combined.includes("gc.zgo.at"), "O rastreador GoatCounter ainda está carregado.");
  assert(!combined.includes("goatcounter.count"), "A navegação ainda envia eventos externos.");
}

function testReleaseVersionAndOfflineAssetsStayAligned() {
  const versionMatch = serviceWorker.match(/const ASSET_VERSION = "([^"]+)"/);
  assert(versionMatch, "ASSET_VERSION ausente no service worker.");
  const version = versionMatch[1];
  const indexVersions = [...index.matchAll(/\?v=([^"'&\s>]+)/g)].map((match) => match[1]);
  assert(indexVersions.length > 0, "Nenhuma versão de recurso encontrada no HTML.");
  assert(indexVersions.every((item) => item === version), "HTML e service worker usam versões diferentes.");
  assert(
    serviceWorker.includes("css/13-accessibility.css"),
    "A camada de acessibilidade precisa estar disponível sem internet."
  );
}

const tests = [
  testMainViewsHaveAccessibleNames,
  testKeyboardShortcutReachesMainContent,
  testViewChangesAreAnnounced,
  testFocusAndMotionPreferencesAreProtected,
  testMobileTargetsMeetMinimumSize,
  testButtonsDoNotDefaultToFormSubmission,
  testNoExternalFontDependency,
  testNoTrackingContradictsPrivacyPromise,
  testReleaseVersionAndOfflineAssetsStayAligned,
];

for (const test of tests) {
  test();
  process.stdout.write(`✓ ${test.name}\n`);
}

process.stdout.write(`\n${tests.length} testes da experiência-base passaram.\n`);
