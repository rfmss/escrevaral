import { expect, test, type Page } from '@playwright/test'
import { verbCalibrationC2 } from './fixtures/linguistic-calibration/pt-br-verbs-c2'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function reviewDialog(page: Page) {
  if (await page.locator('body').evaluate((body) => body.classList.contains('focus-mode'))) {
    await page.keyboard.press('Escape')
  }
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (!await dialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Pesquisa' }).click()
  }
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('tab', { name: 'revisao', exact: true })).toHaveAttribute('aria-selected', 'true')
  return dialog
}

test('C2: haver/fazer impessoais e existir pessoal obedecem à concordância calibrada', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  await reviewDialog(page)

  for (const calibrationCase of verbCalibrationC2) {
    await editor.fill(calibrationCase.text)
    const dialog = await reviewDialog(page)
    await dialog.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
    await expect(dialog.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })

    if (calibrationCase.expectTitle) {
      await expect(
        dialog.locator('.review-card').filter({ hasText: calibrationCase.expectTitle }),
        `${calibrationCase.id}: ${calibrationCase.note}`,
      ).toBeVisible()
    }

    if (calibrationCase.rejectTitle) {
      await expect(
        dialog.locator('.review-card').filter({ hasText: calibrationCase.rejectTitle }),
        `${calibrationCase.id}: ${calibrationCase.note}`,
      ).toHaveCount(0)
    }
  }
})
