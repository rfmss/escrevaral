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

async function analyze(page: Page, text: string) {
  await page.locator('.ProseMirror').fill(text)
  const dialog = await openReview(page)
  await dialog.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(dialog.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })
  return dialog
}

test('C5: crase impossível antes de infinitivo e pronome pessoal é diagnosticada', async ({ page }) => {
  await waitReady(page)

  let dialog = await analyze(page, 'À partir de amanhã, a equipe começa uma nova etapa de revisão do manuscrito brasileiro.')
  await expect(dialog.locator('.review-card').filter({ hasText: 'Não há crase em “a partir de”' })).toBeVisible()

  dialog = await analyze(page, 'Depois da reunião, a editora telefonou à ela para explicar cuidadosamente as mudanças no manuscrito.')
  await expect(dialog.locator('.review-card').filter({ hasText: 'Pronome pessoal não recebe crase' })).toBeVisible()

  dialog = await analyze(page, 'A partir de amanhã, a equipe começa uma nova etapa de revisão e depois telefona a ela.')
  await expect(dialog.locator('.review-card').filter({ hasText: /crase em “a partir de”|Pronome pessoal não recebe crase/i })).toHaveCount(0)
})

test('C5: demonstrativo e indicação de hora não viram falso positivo', async ({ page }) => {
  await waitReady(page)
  const dialog = await analyze(page, 'A revisora chegou àquela editora à uma hora e entregou o original preparado para a leitura final.')
  await expect(dialog.locator('.review-card').filter({ hasText: /crase em “a partir de”|Pronome pessoal não recebe crase/i })).toHaveCount(0)
})
