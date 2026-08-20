import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

for (const width of [1366, 1440, 1920]) {
  test(`Gate 32: geometria de release permanece íntegra em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await waitReady(page)

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect()
      const shell = rect('.paper-shell')
      const left = rect('.left-rail')
      const workspace = rect('.workspace')
      const right = rect('.analysis-panel')
      const editor = rect('.editor.editor-shell.paper')
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        shellLeft: shell?.left ?? -1,
        shellRight: shell ? window.innerWidth - shell.right : -1,
        leftWidth: left?.width ?? 0,
        workspaceWidth: workspace?.width ?? 0,
        rightWidth: right?.width ?? 0,
        editorWidth: editor?.width ?? 0,
      }
    })

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport)
    expect(Math.abs(geometry.shellLeft - geometry.shellRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.leftWidth - geometry.rightWidth)).toBeLessThanOrEqual(1)
    expect(geometry.workspaceWidth).toBeGreaterThan(500)
    expect(geometry.editorWidth).toBeGreaterThan(420)

    await page.screenshot({ path: `test-results/release-${width}.png`, fullPage: true })
  })
}

test('Gate 32: release móvel permanece contido em 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)

  await expect(page.getByRole('button', { name: 'Abrir arquivo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir ferramentas' })).toBeVisible()

  const geometry = await page.evaluate(() => {
    const editor = document.querySelector('.editor.editor-shell.paper')?.getBoundingClientRect()
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      editorLeft: editor?.left ?? -1,
      editorRight: editor ? window.innerWidth - editor.right : -1,
      editorWidth: editor?.width ?? 0,
    }
  })

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport)
  expect(geometry.editorLeft).toBeGreaterThanOrEqual(0)
  expect(geometry.editorRight).toBeGreaterThanOrEqual(0)
  expect(geometry.editorWidth).toBeGreaterThan(250)

  await page.screenshot({ path: 'test-results/release-390.png', fullPage: true })
})
