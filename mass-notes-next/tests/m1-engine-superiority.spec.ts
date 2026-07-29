import { expect, test, type Page } from '@playwright/test'
import { ENGINE_SUPERIORITY_CASES } from './fixtures/engine-superiority-corpus'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

async function stabilizeDocument(page: Page, text: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.fill(text)
  await expect(editor).toContainText(text.slice(0, Math.min(text.length, 28)))
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 12_000 })
  return editor
}

async function openWords(page: Page) {
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

for (const item of ENGINE_SUPERIORITY_CASES) {
  test(`corpus lexical ${item.id}: ${item.rationale}`, async ({ page }) => {
    await waitReady(page)
    const editor = await stabilizeDocument(page, item.text)
    const before = await editor.evaluate((element) => element.innerHTML)

    await openWords(page)
    await page.getByLabel('Palavra ou expressão curta').fill(item.query)
    await page.getByRole('button', { name: 'Consultar' }).click()

    await expect(page.getByRole('status')).toContainText(/leitura lexical concluída/i)
    const reading = page.locator('.lexical-reading')
    await expect(reading).toBeVisible()
    await expect(reading.locator('.lexical-heading span')).toHaveText(item.expectedClass)
    await expect(reading.locator('.lexical-decision')).not.toContainText(/indeterminada/i)
    await expect(reading).toContainText(/ocorrências/i)
    await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
    await expect(editor).toBeEditable()
    expect(await editor.evaluate((element) => element.innerHTML)).toBe(before)
  })
}
