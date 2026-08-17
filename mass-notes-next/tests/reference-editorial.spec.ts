import { expect, test } from '@playwright/test'

test('estado editorial e favorito usam o documento real e persistem após reload', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  const editorial = page.locator('.reference-editorial-state')
  await expect(editorial).toBeVisible()

  const emCorte = editorial.getByRole('button', { name: 'Em corte', exact: true })
  await emCorte.click()
  await expect(emCorte).toHaveAttribute('aria-pressed', 'true')

  const favorite = editorial.getByRole('button', { name: 'Marcar documento como favorito' })
  await favorite.click()
  await expect(editorial.getByRole('button', { name: 'Remover documento dos favoritos' })).toHaveAttribute('aria-pressed', 'true')

  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })
  await page.reload()

  const restored = page.locator('.reference-editorial-state')
  await expect(restored.getByRole('button', { name: 'Em corte', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(restored.getByRole('button', { name: 'Remover documento dos favoritos' })).toHaveAttribute('aria-pressed', 'true')
})
