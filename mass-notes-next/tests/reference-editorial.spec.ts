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

test('estado editorial não depende mais dos controles escondidos do Pulso', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()

  const editorial = page.locator('.reference-editorial-state')
  await expect(editorial).toBeVisible()

  const pulse = page.locator('#panel-pulso')
  await expect(pulse).toHaveCount(1)
  await pulse.evaluate((element) => element.replaceChildren())
  await expect(page.locator('#panel-pulso .chip-row .chip')).toHaveCount(0)
  await expect(page.locator('#panel-pulso .metadata-favorite')).toHaveCount(0)

  const pronto = editorial.getByRole('button', { name: 'Pronto', exact: true })
  const emCorte = editorial.getByRole('button', { name: 'Em corte', exact: true })
  const target = await pronto.getAttribute('aria-pressed') === 'true' ? emCorte : pronto
  await target.click()
  await expect(target).toHaveAttribute('aria-pressed', 'true')

  const favorite = editorial.locator('.reference-editorial-favorite')
  const favoriteBefore = await favorite.getAttribute('aria-pressed') === 'true'
  await favorite.click()
  await expect(favorite).toHaveAttribute('aria-pressed', String(!favoriteBefore))

  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })
})
