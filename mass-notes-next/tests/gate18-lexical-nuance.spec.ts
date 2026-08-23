import { expect, test, type Page } from '@playwright/test'
import { lexicalNuanceCalibrationC3 } from './fixtures/linguistic-calibration/pt-br-lexical-c3'

async function revealWords(page: Page) {
  const viewport = page.viewportSize()
  if ((viewport?.width ?? 1280) >= 1100) {
    const canonical = page.locator('.analysis-panel .reference-lexical-open')
    if (!(await canonical.isVisible())) {
      const workshop = page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })
      await expect(workshop).toBeVisible()
      await workshop.click()
    }
    await expect(canonical).toBeVisible()
    await canonical.click()
  } else {
    await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
    await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  }
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

async function prepareText(page: Page) {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.insertText(
    'Ela tentou esquecer o recado antes de sair. O corredor ficou escuro quando a lâmpada apagou. O menino permaneceu sozinho na varanda. O diretor preferiu falar sobre o problema antes da reunião.',
  )
  await page.keyboard.press('Escape')
  await revealWords(page)
}

test('C3: sinônimos próximos exibem matiz contextual sem oferecer substituição automática', async ({ page }) => {
  await prepareText(page)
  const input = page.getByLabel('Palavra ou expressão curta')

  for (const calibrationCase of lexicalNuanceCalibrationC3) {
    await input.fill(calibrationCase.query)
    await page.getByRole('button', { name: 'Consultar', exact: true }).click()
    const nuance = page.locator('.lexical-nuances').filter({ hasText: calibrationCase.candidate })
    await expect(nuance, `${calibrationCase.id}: ${calibrationCase.note}`).toBeVisible()
    await expect(nuance).toContainText(calibrationCase.expected)
    await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
  }
})
