import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

test('fila de salvamento não cria conflito contra a própria aba e preserva edição posterior', async ({ page }) => {
  await waitReady(page)
  const title = page.getByLabel('Título do documento')
  await title.fill('Primeira versão da fila')

  await page.evaluate(async () => {
    const dispatchSave = () => window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }))

    dispatchSave()

    const input = document.querySelector<HTMLInputElement>('[aria-label="Título do documento"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (!input || !setter) throw new Error('Título indisponível para a regressão.')
    setter.call(input, 'Segunda versão preservada')
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    dispatchSave()
    dispatchSave()
  })

  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(title).toHaveValue('Segunda versão preservada')

  await page.reload()
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Segunda versão preservada')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
