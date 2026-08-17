import { expect, test } from '@playwright/test'

test('cenografia sem domínio não nasce mais no DOM canônico', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()

  const mode = page.getByRole('button', { name: 'Modo atual: Escrita' })
  await expect(mode).toBeDisabled()
  await expect(mode).toHaveAttribute('aria-disabled', 'true')

  await expect(page.locator('.left-rail .research')).toHaveCount(0)
  await expect(page.locator('.left-rail .quick-box')).toHaveCount(0)
  await expect(page.locator('.analysis-panel .distribution-section')).toHaveCount(0)

  const localState = page.locator('.analysis-panel .versions')
  await expect(localState.getByRole('heading', { name: 'ESTADO LOCAL' })).toBeVisible()
  await expect(localState.getByRole('link')).toHaveCount(0)
  await expect(localState).toContainText(/rev\. \d+/)

  await expect(page.locator('.statusbar .focus strong')).toHaveText('Pronto')
  await expect(page.locator('.statusbar .focus')).not.toContainText('60 min')
  await expect(page.locator('.statusbar .language button')).toHaveCount(0)

  const shellText = await page.locator('.paper-shell').innerText()
  expect(shellText).not.toContain('ROMANCE DE FICÇÃO')
  expect(shellText).not.toContain('Ver todas')
})
