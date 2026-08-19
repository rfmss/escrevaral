import { readFile } from 'node:fs/promises'
import { expect, test, type Download, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

async function bytes(download: Download): Promise<Buffer> {
  const path = await download.path()
  expect(path).not.toBeNull()
  return readFile(path!)
}

test('exportação avançada permanece lazy e gera DOCX, EPUB e Obsidian localmente', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.insertText('Primeiro capítulo.\n\nSegundo parágrafo para a exportação avançada.')
  await page.keyboard.press('Escape')
  await page.getByLabel('Título do documento').fill('Exportação avançada')

  await expect(page.locator('script[data-escrevaral-engine="export-engine.js"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Exportar', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Exportar documento' })
  await expect(panel).toBeVisible()

  const docxPromise = page.waitForEvent('download')
  await panel.locator('[data-reference-export-format="docx"]').click()
  const docx = await docxPromise
  expect(docx.suggestedFilename()).toBe('exportacao-avancada.docx')
  const docxBytes = await bytes(docx)
  expect(docxBytes.subarray(0, 2).toString()).toBe('PK')
  expect(docxBytes.includes(Buffer.from('word/document.xml'))).toBe(true)
  await expect(page.locator('script[data-escrevaral-engine="export-engine.js"]')).toHaveCount(1)

  const epubPromise = page.waitForEvent('download')
  await panel.locator('[data-reference-export-format="epub"]').click()
  const epub = await epubPromise
  expect(epub.suggestedFilename()).toBe('exportacao-avancada.epub')
  const epubBytes = await bytes(epub)
  expect(epubBytes.subarray(0, 2).toString()).toBe('PK')
  expect(epubBytes.includes(Buffer.from('mimetype'))).toBe(true)
  expect(epubBytes.includes(Buffer.from('OEBPS/content.opf'))).toBe(true)

  const obsidianPromise = page.waitForEvent('download')
  await panel.locator('[data-reference-export-format="obsidian"]').click()
  const obsidian = await obsidianPromise
  expect(obsidian.suggestedFilename()).toBe('exportacao-avancada.md')
  const obsidianText = (await bytes(obsidian)).toString('utf8')
  expect(obsidianText).toContain('fonte: "Escrevaral"')
  expect(obsidianText).toContain('Primeiro capítulo.')
})

test('seis formatos cabem no modal sem criar overflow da página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Exportar', exact: true }).click()

  const panel = page.getByRole('dialog', { name: 'Exportar documento' })
  await expect(panel).toBeVisible()
  await expect(panel.locator('[data-reference-export-format]')).toHaveCount(6)

  const sizes = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>('.writing-export-panel')
    const rect = panel?.getBoundingClientRect()
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pageWidth: document.documentElement.scrollWidth,
      top: rect?.top ?? -1,
      bottom: rect?.bottom ?? Number.POSITIVE_INFINITY,
      panelScrollWidth: panel?.scrollWidth ?? 0,
      panelClientWidth: panel?.clientWidth ?? 0,
    }
  })

  expect(sizes.pageWidth).toBeLessThanOrEqual(sizes.viewportWidth)
  expect(sizes.top).toBeGreaterThanOrEqual(0)
  expect(sizes.bottom).toBeLessThanOrEqual(sizes.viewportHeight)
  expect(sizes.panelScrollWidth).toBeLessThanOrEqual(sizes.panelClientWidth)
})
