/* QA automatizado de imagens, URLs CSS, Service Worker, Modo Leitura e modo portátil.
 * Executar: node tests/qa-imagens-e-rotas.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function isValidWebp(buf) {
  return buf.length > 16 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';
}

function isValidPng(buf) {
  return buf.length > 16 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

(async function main() {
  // 1. Verificar TODOS os assets declarados no service-worker.js (REQUIRED_ASSETS + BUNKER_ASSETS)
  const swText = read('service-worker.js');
  const reqMatch = /const REQUIRED_ASSETS = (\[[\s\S]*?\]);/.exec(swText);
  const bunkerMatch = /const BUNKER_ASSETS = (\[[\s\S]*?\]);/.exec(swText);
  assert.ok(reqMatch, 'REQUIRED_ASSETS não encontrado em service-worker.js');
  assert.ok(bunkerMatch, 'BUNKER_ASSETS não encontrado em service-worker.js');

  const requiredAssets = JSON.parse(reqMatch[1]).map(a => a.url);
  const bunkerAssets = JSON.parse(bunkerMatch[1]);

  assert.ok(bunkerAssets.includes('./assets/library/reader-biblioteca-nacional.webp'), 'reader-biblioteca-nacional.webp fora do BUNKER_ASSETS');
  assert.ok(bunkerAssets.includes('./assets/library/reader-cinemateca-acervo.webp'), 'reader-cinemateca-acervo.webp fora do BUNKER_ASSETS');

  const allSwAssets = [...requiredAssets, ...bunkerAssets];
  let webpCount = 0;
  for (const rel of allSwAssets) {
    const clean = rel.replace(/^\.\//, '');
    const full = path.join(root, clean);
    assert.ok(fs.existsSync(full), 'Asset ausente no disco: ' + clean);
    const buf = fs.readFileSync(full);
    assert.ok(buf.length > 0, 'Asset vazio no disco: ' + clean);
    if (clean.endsWith('.webp')) {
      assert.ok(isValidWebp(buf), 'WebP inválido ou corrompido: ' + clean);
      webpCount += 1;
    } else if (clean.endsWith('.png')) {
      assert.ok(isValidPng(buf), 'PNG inválido ou corrompido: ' + clean);
    }
  }
  assert.ok(webpCount >= 20, 'Esperava ao menos 20 arquivos WebP no bunker, encontrei ' + webpCount);

  // 2. Verificar que o CSS compilado em assets/<ver>/styles.*.css NÃO possui url() relativa quebrada
  //    e que todos os módulos CSS possuem chaves { } balanceadas (evita quebra silenciosa do módulo seguinte).
  const modsMeta = JSON.parse(read('build/modules.json'));
  for (const styleRel of (modsMeta.styles || [])) {
    const cleanCss = read(styleRel).replace(/\/\*[\s\S]*?\*\//g, '');
    const opens = (cleanCss.match(/\{/g) || []).length;
    const closes = (cleanCss.match(/\}/g) || []).length;
    assert.equal(opens, closes, 'Chaves CSS desbalanceadas em ' + styleRel + ' (' + opens + ' abertas vs ' + closes + ' fechadas)');
  }
  const assetsMeta = JSON.parse(read('build/assets.json'));
  const assetById = id => assetsMeta.assets.find(a => a.id === id);
  const cssRel = assetById('styles').path;
  const cssDir = path.dirname(path.join(root, cssRel));
  const cssText = read(cssRel);
  for (const m of cssText.matchAll(/url\(([^)]+)\)/g)) {
    const raw = m[1].trim().replace(/^["']|["']$/g, '');
    if (raw.startsWith('data:') || raw.startsWith('#') || raw.startsWith('http://') || raw.startsWith('https://')) {
      continue;
    }
    const resolved = path.resolve(cssDir, raw);
    assert.ok(fs.existsSync(resolved), 'URL relativa quebrada em ' + cssRel + ': ' + raw + ' -> ' + resolved);
  }

  // 3. Verificar que academia/*.html aponta apenas para imagens reais existentes
  const acadDir = path.join(root, 'academia');
  for (const f of fs.readdirSync(acadDir).filter(x => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(acadDir, f), 'utf8');
    for (const m of html.matchAll(/(?:src=["']|url\(["']?)([^"')]+?\.(?:webp|png|jpg|jpeg|svg))/gi)) {
      const target = m[1];
      if (target.startsWith('data:') || target.startsWith('http')) { continue; }
      const resolved = path.resolve(acadDir, target);
      assert.ok(fs.existsSync(resolved), 'Imagem quebrada em academia/' + f + ': ' + target);
    }
  }

  // 4. Testar em VM a resolução absoluta de CSS custom properties e <img> real no Modo Leitura (site vs portátil)
  const modoLeitorSrc = read('src/ui/modo-leitor.js');
  const academiaSrc = read('src/ui/academia.js');

  function runModuleInSite(src, href, mode) {
    const props = {};
    const ctx = vm.createContext({
      Escr: {},
      URL,
      location: { href, protocol: href.startsWith('file:') ? 'file:' : 'https:' },
      document: {
        documentElement: { style: { setProperty(k, v) { props[k] = v; } } },
        querySelector(sel) {
          if (sel === 'meta[name="distribution-mode"]') {
            return { getAttribute: () => mode };
          }
          return null;
        }
      }
    });
    vm.runInContext(src, ctx);
    return props;
  }

  const readerPropsGh = runModuleInSite(modoLeitorSrc, 'https://rfmss.github.io/escrevaral/index.html', 'site');
  assert.equal(readerPropsGh['--esc-reader-atelier-art'], 'url("https://rfmss.github.io/escrevaral/assets/library/reader-biblioteca-nacional.webp")');
  assert.equal(readerPropsGh['--esc-reader-readthru-art'], 'url("https://rfmss.github.io/escrevaral/assets/library/reader-cinemateca-acervo.webp")');

  const acadPropsGh = runModuleInSite(academiaSrc, 'https://rfmss.github.io/escrevaral/', 'site');
  assert.equal(acadPropsGh['--esc-rg-hero-art'], 'url("https://rfmss.github.io/escrevaral/assets/library/real-gabinete-hero.webp")');
  assert.equal(acadPropsGh['--esc-rg-book-art'], 'url("https://rfmss.github.io/escrevaral/assets/library/tome-objeto-livro.webp")');

  const readerPropsPortable = runModuleInSite(modoLeitorSrc, 'file:///tmp/escrevaral.html', 'portable');
  assert.equal(readerPropsPortable['--esc-reader-atelier-art'], undefined, 'Portátil não deve injetar URL externa');

  // Conferir que o HTML montado pelo Modo Leitura tem <img> real com src válido
  assert.ok(modoLeitorSrc.includes('id="esc-reader-hero-img"'), 'Modo Leitura deve renderizar <img id="esc-reader-hero-img">');
  assert.ok(modoLeitorSrc.includes("var HERO_ART_LER = 'assets/library/reader-biblioteca-nacional.webp';"));
  assert.ok(modoLeitorSrc.includes("var HERO_ART_ENSAIO = 'assets/library/reader-cinemateca-acervo.webp';"));

  // 5. Subir servidor HTTP local efêmero e verificar HTTP 200 real nas rotas críticas (incluindo novas imagens)
  const server = http.createServer((req, res) => {
    const cleanPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const filePath = path.join(root, cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, ''));
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const urlsToFetch = [
      '/index.html',
      '/' + assetById('cofre').path,
      '/' + assetById('app').path,
      '/' + cssRel,
      '/assets/library/reader-biblioteca-nacional.webp',
      '/assets/library/reader-cinemateca-acervo.webp',
      '/assets/library/real-gabinete-hero.webp',
      '/assets/library/tome-objeto-livro.webp',
      '/assets/library/estante-cafe-bistro.webp',
      '/assets/library/estante-livros-outono.webp',
      '/assets/library/estante-trepadeira-outono.webp'
    ];
    for (const u of urlsToFetch) {
      const resp = await fetch('http://127.0.0.1:' + port + u);
      assert.equal(resp.status, 200, 'HTTP ' + resp.status + ' em ' + u);
      const ab = await resp.arrayBuffer();
      const buf = Buffer.from(ab);
      assert.ok(buf.length > 100, 'Resposta pequena demais em ' + u);
      if (u.endsWith('.webp')) {
        assert.ok(isValidWebp(buf), 'Payload HTTP não é WebP válido em ' + u);
      }
    }
  } finally {
    server.close();
  }

  console.log('QA IMAGENS E ROTAS OK: ' + allSwAssets.length + ' assets SW (' + webpCount + ' WebPs válidos), CSS sem 404 relativo, Modo Leitura com <img> real + resolução absoluta em subpasta e HTTP 200 verificado.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
