import { expect, test } from '@playwright/test'

test('revisão só carrega os motores locais quando Pesquisa é solicitada', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.paper-shell')).toBeVisible()

  const engineScripts = [
    'criterios-data.js',
    'syntax-engine.js',
    'punctuation-engine.js',
    'analise-engine.js',
  ]

  const before = await page.evaluate((ids) => ({
    loaded: Boolean(window.__escrevaralReviewLoaded),
    scripts: ids.map((id) => Boolean(document.querySelector(`script[data-escrevaral-engine="${id}"]`))),
  }), engineScripts)

  expect(before.loaded).toBe(false)
  expect(before.scripts).toEqual([false, false, false, false])

  await page.getByRole('button', { name: 'Pesquisa' }).click()

  await expect.poll(async () => page.evaluate((ids) => ({
    loaded: Boolean(window.__escrevaralReviewLoaded),
    scripts: ids.map((id) => Boolean(document.querySelector(`script[data-escrevaral-engine="${id}"]`))),
  }), engineScripts)).toEqual({
    loaded: true,
    scripts: [true, true, true, true],
  })

  await expect(page.locator('#tab-revisao')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#panel-revisao')).toBeVisible()
})
