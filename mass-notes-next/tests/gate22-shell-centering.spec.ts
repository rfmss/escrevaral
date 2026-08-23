import { expect, test } from '@playwright/test'

for (const width of [1366, 1440, 1920]) {
  test(`shell canônico fica centralizado em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const shell = page.locator('.paper-shell')
    await expect(shell).toBeVisible()

    const geometry = await shell.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        left: rect.left,
        right: window.innerWidth - rect.right,
        width: rect.width,
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }
    })

    expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(1)
    expect(geometry.width).toBeLessThanOrEqual(geometry.viewport)
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport)
  })
}
