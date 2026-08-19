import { expect, test } from '@playwright/test'

async function createBlankDocument(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  const before = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(before + 1)
  return page.getByLabel('Texto do documento')
}

test('primeiro movimento informa captura local e chip só aparece depois de 50 palavras', async ({ page }) => {
  const editor = await createBlankDocument(page)
  await editor.click()

  await page.keyboard.pressSequentially('u', { delay: 35 })
  await expect(page.getByText('Sinais de autoria guardados aqui.')).toBeVisible()

  await page.keyboard.pressSequentially('m um um um um um um um um um', { delay: 35 })
  await page.keyboard.press('Escape')
  await expect(page.locator('.reference-proof-status')).toHaveCount(0)

  await editor.click()
  await page.keyboard.pressSequentially(` ${Array.from({ length: 40 }, () => 'um').join(' ')}`, { delay: 35 })
  await page.keyboard.press('Escape')

  const status = page.locator('.analysis-panel .reference-proof-status')
  await expect(status).toBeVisible()
  await expect(status).toContainText('Autoria local')
  await expect(status.locator('strong')).toHaveText(/^\d+%$/)
  await expect(status.locator('strong')).not.toHaveText('0%')
  await expect(status.locator('small')).toHaveText(/Sólida|Em formação|Aguardando escrita/)
})
