import { expect, test, type Page } from '@playwright/test'
import { punctuationCalibrationC1 } from './fixtures/linguistic-calibration/pt-br-punctuation-c1'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function leaveFocus(page: Page) {
  if (await page.locator('body').evaluate((body) => body.classList.contains('focus-mode'))) {
    await page.keyboard.press('Escape')
    await expect(page.locator('body')).not.toHaveClass(/focus-mode/)
  }
}

async function reviewDialog(page: Page) {
  await leaveFocus(page)
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (!await dialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Pesquisa' }).click()
  }
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('tab', { name: 'revisao', exact: true })).toHaveAttribute('aria-selected', 'true')
  return dialog
}

test('C1: vínculos sintáticos essenciais governam a vírgula normativa', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  const dialog = await reviewDialog(page)

  for (const calibrationCase of punctuationCalibrationC1) {
    await editor.fill(calibrationCase.text)
    const activeDialog = await reviewDialog(page)
    await activeDialog.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
    await expect(activeDialog.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })

    for (const ruleId of calibrationCase.expectRuleIds ?? []) {
      await expect(
        activeDialog.locator('.review-located-card').filter({ hasText: ruleId }),
        `${calibrationCase.id}: ${calibrationCase.note}`,
      ).toBeVisible()
    }

    for (const ruleId of calibrationCase.rejectRuleIds ?? []) {
      await expect(
        activeDialog.locator('.review-located-card').filter({ hasText: ruleId }),
        `${calibrationCase.id}: ${calibrationCase.note}`,
      ).toHaveCount(0)
    }
  }
})
