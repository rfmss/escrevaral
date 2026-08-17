import { expect, test } from '@playwright/test'

test('tipografia canônica é servida localmente sem Google Fonts em runtime', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })

  const remoteFontRequests: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(url)) remoteFontRequests.push(url)
  })

  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  const fontChecks = await page.evaluate(async () => {
    const specs = ['16px Anton', '16px Oswald', '16px Literata']
    await Promise.all(specs.map((spec) => document.fonts.load(spec)))
    return {
      loaded: specs.map((spec) => document.fonts.check(spec)),
      body: getComputedStyle(document.body).fontFamily,
      brand: getComputedStyle(document.querySelector('.brand-name')!).fontFamily,
      topbar: getComputedStyle(document.querySelector('.topbar')!).fontFamily,
      resources: performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((name) => /Anton-Regular|Oswald-wght|Literata-opsz-wght|\.ttf(?:$|\?)/i.test(name)),
      origin: location.origin,
    }
  })

  expect(remoteFontRequests).toEqual([])
  expect(fontChecks.loaded).toEqual([true, true, true])
  expect(fontChecks.body).toContain('Literata')
  expect(fontChecks.brand).toContain('Anton')
  expect(fontChecks.topbar).toContain('Oswald')
  expect(fontChecks.resources.length).toBeGreaterThanOrEqual(3)
  expect(fontChecks.resources.every((url) => url.startsWith(fontChecks.origin))).toBe(true)
})
