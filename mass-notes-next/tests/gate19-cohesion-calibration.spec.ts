import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function openReview(page: Page) {
  if (await page.locator('body').evaluate((body) => body.classList.contains('focus-mode'))) {
    await page.keyboard.press('Escape')
  }
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (!await dialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Pesquisa' }).click()
  }
  await expect(dialog).toBeVisible()
  return dialog
}

test('C4: revisão mostra coesão observável sem fingir medir coerência', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  await editor.fill(
    'O manuscrito chegou cedo. Por isso, o manuscrito entrou na fila de leitura. No entanto, ele voltou ao autor para uma nova revisão.',
  )

  const dialog = await openReview(page)
  await dialog.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(dialog.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })

  const card = dialog.locator('.review-card').filter({ hasText: 'Mapa de coesão observável' })
  await expect(card).toBeVisible()
  await expect(card).toContainText(/conclusão 1/i)
  await expect(card).toContainText(/contraste 1/i)
  await expect(card).toContainText(/Marcadores referenciais: 1/i)
  await expect(card).toContainText(/manuscrito \(1\)/i)
  await expect(card).toContainText(/não mede coerência/i)
})
