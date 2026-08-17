import { expect, test } from '@playwright/test'

test('Notas não abre ferramenta cenográfica enquanto o domínio estiver deferido', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  const notas = page.getByRole('button', { name: 'Notas — ainda não disponível' })
  await expect(notas).toBeDisabled()
  await expect(notas).toHaveAttribute('aria-disabled', 'true')
  await expect(page.locator('.reference-mobile-legacy #text-tools.rail.open')).toHaveCount(0)
})
