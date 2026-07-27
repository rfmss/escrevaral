import { chromium } from 'playwright';
import fs from 'node:fs';

fs.mkdirSync('audit-artifacts', { recursive: true });

const report = {
  production: 'https://escrevaral.com',
  cache: 'vereda-offline-v967',
  assetVersion: '20260727-atelier-actionbutton-low-risk-v1',
  themes: [],
};

async function check(name, fn) {
  try {
    const detail = await fn();
    return { name, status: 'ok', detail };
  } catch (error) {
    return {
      name,
      status: 'failure',
      error: String(error),
      stack: error?.stack || null,
    };
  }
}

const browser = await chromium.launch({ headless: true });

for (const theme of [
  { name: 'alvorada', dark: false },
  { name: 'vereda', dark: true },
]) {
  const context = await browser.newContext({ acceptDownloads: true });
  await context.addInitScript(({ dark }) => {
    if (dark) localStorage.setItem('vereda:dark-mode', 'on');
    else localStorage.removeItem('vereda:dark-mode');
  }, { dark: theme.dark });

  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  const themeReport = {
    theme: theme.name,
    setup: null,
    checks: [],
    pageErrors,
  };

  themeReport.setup = await check('abrir Ateliê e publicação', async () => {
    await page.goto(`https://escrevaral.com/?audit=${Date.now()}-${theme.name}`, {
      waitUntil: 'networkidle',
      timeout: 90000,
    });

    const resolvedTheme = await page.evaluate(
      () => document.documentElement.dataset.theme || 'alvorada',
    );
    if (theme.dark && resolvedTheme !== 'scriptorium') {
      throw new Error(`Tema esperado scriptorium; recebido ${resolvedTheme}`);
    }
    if (!theme.dark && resolvedTheme === 'scriptorium') {
      throw new Error('Alvorada abriu como scriptorium');
    }

    const visibleEntry = page.locator('[data-view-target="academia"]:visible').first();
    if (await visibleEntry.count()) {
      await visibleEntry.click();
    } else {
      await page.evaluate(() => document.querySelector('[data-view-target="academia"]')?.click());
    }

    await page.locator('[data-view-panel="academia"]').waitFor({
      state: 'visible',
      timeout: 20000,
    });
    await page.locator('[data-action="switch-atelier-publicar"]').click();
    await page.waitForFunction(
      () => document.querySelector('.academy-view')?.dataset.atelierActive === 'publicar',
    );

    return { resolvedTheme };
  });

  if (themeReport.setup.status === 'ok') {
    themeReport.checks.push(await check('Limpar busca', async () => {
      const search = page.locator('[data-rights-search]');
      const clear = page.locator('[data-rights-search-clear]');
      await search.fill('contrato');
      await clear.waitFor({ state: 'visible', timeout: 10000 });

      const attrs = {
        ariaLabel: await clear.getAttribute('aria-label'),
        variant: await clear.getAttribute('data-variant'),
        size: await clear.getAttribute('data-size'),
        iconOnly: await clear.getAttribute('data-icon-only'),
      };
      if (
        attrs.ariaLabel !== 'Limpar busca'
        || attrs.variant !== 'ghost'
        || attrs.size !== 'compact'
        || attrs.iconOnly !== 'true'
      ) {
        throw new Error(`Contrato inesperado: ${JSON.stringify(attrs)}`);
      }

      const box = await clear.boundingBox();
      await clear.click();
      const value = await search.inputValue();
      const hidden = await clear.isHidden();
      if (value !== '' || !hidden) {
        throw new Error(`Após clique: value=${JSON.stringify(value)}, hidden=${hidden}`);
      }

      return {
        attrs,
        renderedHeight: box ? Math.round(box.height) : null,
        value,
        hidden,
      };
    }));

    themeReport.checks.push(await check('Ver cuidados', async () => {
      const track = page.locator('details.academy-publishing-track');
      await track.evaluate((element) => { element.open = true; });

      const button = page.locator('[data-action="scroll-rights"]');
      const variant = await button.getAttribute('data-variant');
      const scrollBefore = await page.evaluate(() => scrollY);
      await button.click();
      await page.waitForTimeout(700);
      const scrollAfter = await page.evaluate(() => scrollY);
      const position = await page.locator('[data-rights-lab]').evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
      });

      if (variant !== 'secondary') {
        throw new Error(`Variante inesperada: ${variant}`);
      }
      if (!(position.bottom > 0 && position.top < position.viewport)) {
        throw new Error(`Direitos não visível: ${JSON.stringify(position)}`);
      }

      return { variant, scrollBefore, scrollAfter, position };
    }));

    themeReport.checks.push(await check('Abrir Anatomia do Livro', async () => {
      const track = page.locator('details.academy-publishing-track');
      await track.evaluate((element) => { element.open = true; });

      const link = page.locator('a.academy-anatomy-btn');
      const attrs = {
        tag: await link.evaluate((element) => element.tagName),
        href: await link.getAttribute('href'),
        target: await link.getAttribute('target'),
        variant: await link.getAttribute('data-variant'),
      };
      if (
        attrs.tag !== 'A'
        || attrs.href !== './anatomia-do-livro.html'
        || attrs.target !== '_blank'
        || attrs.variant !== 'secondary'
      ) {
        throw new Error(`Semântica inesperada: ${JSON.stringify(attrs)}`);
      }

      await link.scrollIntoViewIfNeeded();
      const popupPromise = context.waitForEvent('page', { timeout: 15000 });
      await link.click();
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded', { timeout: 60000 });
      const popupUrl = popup.url();
      await popup.close();
      if (!new URL(popupUrl).pathname.endsWith('/anatomia-do-livro.html')) {
        throw new Error(`URL inesperada: ${popupUrl}`);
      }

      return { attrs, popupUrl };
    }));
  }

  await page.screenshot({
    path: `audit-artifacts/atelier-${theme.name}-v967.png`,
    fullPage: true,
  }).catch(() => {});

  themeReport.pageErrors = pageErrors;
  report.themes.push(themeReport);
  await context.close();
}

await browser.close();
fs.writeFileSync(
  'audit-artifacts/resultado-atelier-v967.json',
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
