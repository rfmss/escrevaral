import { expect, test } from '@playwright/test'

test('Oficina substitui o antigo slot Notas e abre somente ferramentas com domínio real', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  const oficina = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  await expect(oficina).toBeEnabled()
  await expect(oficina).toHaveAttribute('aria-controls', 'text-tools')
  await expect(oficina).toHaveAttribute('aria-expanded', 'false')
  await expect(oficina.locator('small')).toHaveText('Oficina')

  await oficina.click()
  const rail = page.locator('.reference-mobile-legacy #text-tools.rail')
  await expect(rail).toHaveClass(/open/)
  await expect(oficina).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('body')).toHaveClass(/reference-tools-open/)

  await expect(page.getByRole('tab', { name: 'contexto', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'rimalab', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'ferramentas', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Fechar ferramentas' }).click()
  await expect(rail).not.toHaveClass(/open/)
  await expect(oficina).toHaveAttribute('aria-expanded', 'false')
})
