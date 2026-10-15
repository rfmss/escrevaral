'use strict';
// Contemporary-browser smoke test, NEVER emulation of Android 4.4 or iOS 9.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const playwright = require('playwright');
const root = path.resolve(__dirname, '..');
const assert = require('node:assert/strict');
const server = http.createServer((req, res) => {
  const name = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!name.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(name, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    const type = name.endsWith('.manifest') ? 'text/cache-manifest' :
      name.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-cache'}); res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const results = [];
  try {
    for (const engine of ['chromium', 'webkit']) {
      const executablePath = process.env['DICT_' + engine.toUpperCase() + '_EXECUTABLE'];
      let browser;
      try {
        browser = await playwright[engine].launch({headless: true, executablePath});
        const context = await browser.newContext();
        const page = await context.newPage(), errors = [], requests = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('request', r => requests.push(r.url()));
        await page.goto(base + '/demo/index.html');
        await page.waitForFunction(() => document.getElementById('result').textContent === 'found: café');
        const cold = JSON.parse(await page.locator('#evidence').inputValue());
        assert.equal(cold.result.entries[0].form, 'café');
        assert.equal(cold.stats.loads, 1);
        const before = requests.length;
        const hot = await page.evaluate(() => new Promise(resolve => D.lookup('CAFÉ', (error, value) => resolve({error, value}))));
        assert.equal(hot.value.status, 'found'); assert.equal(requests.length, before);
        await page.locator('#word').fill('cafe'); await page.locator('button[type=submit]').click();
        await page.waitForFunction(() => document.getElementById('result').textContent.indexOf('absent-in-fixture') === 0);
        await page.route('**/dist/f/ca.js', route => route.abort());
        await page.locator('#run-test').click();
        await page.waitForFunction(() => document.getElementById('result').textContent.indexOf('E_LOAD') === 0);
        await context.close();
        const local = await browser.newContext(); await local.setOffline(true);
        const filePage = await local.newPage();
        filePage.on('pageerror', e => errors.push(e.message));
        await filePage.goto(pathToFileURL(path.join(root, 'demo/index.html')).href);
        await filePage.waitForFunction(() => document.getElementById('result').textContent === 'found: café');
        const file = JSON.parse(await filePage.locator('#evidence').inputValue());
        assert.equal(file.protocol, 'file:'); assert.equal(file.result.entries[0].form, 'café');
        assert.equal(errors.length, 0); await local.close();
        results.push({engine, version: browser.version(), checksPassed: 5,
          httpLookup: 'pass', cacheNoRequest: 'pass', exactOnly: 'pass', missingFragment: 'pass',
          fileWithOfflineNetwork: 'pass', coldLookupMs: cold.elapsedMs,
          userAgent: cold.userAgent, appCache: 'not-tested', legacyDevice: 'not-tested'});
      } catch (error) {
        results.push({engine, status: 'failed', error: error.message,
          legacyDevice: 'not-tested'});
        process.exitCode = 1;
      } finally { if (browser) await browser.close(); }
    }
    const output = {date: new Date().toISOString(), platform: process.platform, results};
    fs.writeFileSync(path.join(root, 'tests/results.local.json'), JSON.stringify(output, null, 2) + '\n');
    console.log(JSON.stringify(output, null, 2));
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
