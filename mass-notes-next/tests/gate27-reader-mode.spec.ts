import { expect, test } from '@playwright/test'

async function clearEditor(page: import('@playwright/test').Page) {
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await expect(editor).toHaveText('')
  await page.keyboard.press('Escape')
  return editor
}

test('modo Leitura usa o slot MODO e avisa quando a página está vazia', async ({ page }) => {
  await page.goto('/')
  await clearEditor(page)

  const mode = page.getByRole('button', { name: 'Abrir modo Leitura' })
  await expect(mode).toBeEnabled()
  await expect(mode).toHaveText('Escrita')
  await mode.click()

  await expect(page.getByText('Escreva algumas linhas para ler como leitor.')).toBeVisible()
  await expect(page.locator('#writing-reader-overlay')).toHaveCount(0)
})

test('Leitor preserva texto e oferece fonte, ritmo, régua, autoscroll e retorno por Escape', async ({ page }) => {
  await page.goto('/')
  const editor = await clearEditor(page)
  const manuscript = Array.from({ length: 90 }, (_, index) => `Parágrafo ${index + 1}. Uma frase suficientemente longa para formar uma superfície contínua de leitura.`).join('\n\n')

  await editor.click()
  await page.keyboard.insertText(manuscript)
  await expect(editor).toContainText('Parágrafo 90.')
  await page.keyboard.press('Escape')

  const mode = page.getByRole('button', { name: 'Abrir modo Leitura' })
  await mode.click()
  const reader = page.getByRole('dialog', { name: /Sem título|.+/ })
  await expect(reader).toBeVisible()
  await expect(page.locator('.writing-reader-article')).toContainText('Parágrafo 1.')
  await expect(page.locator('.writing-reader-article')).toContainText('Parágrafo 90.')
  await expect(page.locator('.writing-reader-article')).toHaveCSS('font-size', '18px')
  await expect(page.locator('.topbar .mode button')).toHaveText('Leitura')

  await reader.getByRole('button', { name: 'Letra média', exact: true }).click()
  await expect(reader.getByRole('button', { name: 'Letra grande', exact: true })).toBeVisible()
  await expect(page.locator('.writing-reader-article')).toHaveCSS('font-size', '20px')

  await reader.getByRole('button', { name: 'Ritmo 1 — lento', exact: true }).click()
  await expect(reader.getByRole('button', { name: 'Ritmo 2 — médio', exact: true })).toBeVisible()

  await reader.getByRole('button', { name: 'Régua', exact: true }).click()
  await expect(page.locator('.writing-reader-ruler')).toBeVisible()
  await expect(reader.getByRole('button', { name: 'Régua ligada', exact: true })).toHaveAttribute('aria-pressed', 'true')

  const canvas = page.locator('.writing-reader-canvas')
  const before = await canvas.evaluate((element) => element.scrollTop)
  await reader.getByRole('button', { name: 'Rolar', exact: true }).click()
  await expect(reader.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible()
  await expect.poll(() => canvas.evaluate((element) => element.scrollTop), { timeout: 3_000 }).toBeGreaterThan(before)
  await reader.getByRole('button', { name: 'Pausar', exact: true }).click()

  await page.keyboard.press('Escape')
  await expect(page.locator('#writing-reader-overlay')).toHaveCount(0)
  await expect(page.locator('.topbar .mode button')).toHaveText('Escrita')
  await expect(page.locator('.topbar .mode button')).toBeFocused()
  await expect(editor).toContainText('Parágrafo 90.')
})
