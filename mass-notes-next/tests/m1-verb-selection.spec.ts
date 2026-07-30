import { expect, test, type Page } from '@playwright/test'

function normalized(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

async function waitWords(page: Page) {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  return editor
}

async function setText(page: Page, manuscript: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.fill(manuscript)
  await expect.poll(async () => normalized(await editor.innerText())).toBe(normalized(manuscript))
  return editor
}

async function selectWithKeyboard(page: Page, movement: string[], length: number) {
  for (const key of movement) await page.keyboard.press(key)
  for (let index = 0; index < length; index += 1) await page.keyboard.press('Shift+ArrowRight')
}

test('a ocorrência selecionada governa a leitura quando a forma se repete', async ({ page }) => {
  const editor = await waitWords(page)
  const manuscript = 'O canto da sala é escuro.\n\nEu canto toda manhã.'
  await setText(page, manuscript)
  const htmlBefore = await editor.innerHTML()

  await editor.click()
  await selectWithKeyboard(page, ['Control+Home', 'ArrowRight', 'ArrowRight'], 5)
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('canto')
  await expect(page.getByLabel('Palavra ou expressão curta')).toHaveValue('canto')
  await expect(page.locator('[data-verb-analysis]')).toHaveCount(0)

  await editor.click()
  await selectWithKeyboard(page, ['Control+End', 'Home', 'ArrowRight', 'ArrowRight', 'ArrowRight'], 5)
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('canto')

  const card = page.locator('[data-verb-analysis]')
  await expect(card).toBeVisible()
  await expect(card).toContainText('cantar')
  await expect(card).toContainText('Presente do indicativo')
  await expect(card).toContainText('1ª pessoa do singular')
  expect(await editor.innerHTML()).toBe(htmlBefore)
})

test('análise verbal não altera o HTML autoral', async ({ page }) => {
  const editor = await waitWords(page)
  await setText(page, 'Amanhã carregá-lo-ia até a varanda.')
  const before = await editor.innerHTML()
  await page.getByLabel('Palavra ou expressão curta').fill('carregá-lo-ia')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.locator('[data-verb-analysis]')).toContainText('Futuro do pretérito do indicativo')
  expect(await editor.innerHTML()).toBe(before)
})
