import { expect, test, type Page } from '@playwright/test'

const EXPECTED_DEFINITION = "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual."

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

async function openWords(page: Page) {
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

test('E2 preserva a definição efetiva de quica antes da deduplicação da fonte', async ({ page }) => {
  await waitReady(page)
  const editor = page.getByLabel('Texto do documento')
  await editor.fill('Quiçá a personagem volte amanhã.')
  const before = await editor.evaluate((element) => element.innerHTML)

  await openWords(page)
  await page.getByLabel('Palavra ou expressão curta').fill('quica')
  await page.getByRole('button', { name: 'Consultar' }).click()

  await expect(page.getByRole('status')).toContainText(/leitura lexical concluída/i)
  const reading = page.locator('.lexical-reading')
  await expect(reading).toBeVisible()
  await expect(reading.locator('.lexical-definition')).toHaveText(EXPECTED_DEFINITION)
  await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
  expect(await editor.evaluate((element) => element.innerHTML)).toBe(before)
})
