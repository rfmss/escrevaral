import { expect, test } from '@playwright/test'

test('Espelho de Voz abre a leitura local real somente por ação explícita e projeta o resumo', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('A cidade amanheceu devagar. Eu atravessei a praça e ouvi os sinos. O vento trouxe cheiro de café e chuva. Voltei para casa pensando no que ainda faltava dizer. Escrevi uma frase, risquei outra e continuei.')
  await page.keyboard.press('Escape')

  const launcher = page.locator('.reference-voice-launcher')
  await expect(launcher).toBeVisible()
  await expect(launcher.locator('.reference-voice-summary')).not.toHaveAttribute('data-voice-reading', 'ready')

  const open = launcher.getByRole('button', { name: 'Escutar voz', exact: true })
  await open.click()

  const rail = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await expect(rail).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-voice-open/)
  await expect(rail.locator('#tab-voz')).toHaveAttribute('aria-selected', 'true')
  await expect(rail.locator('#panel-voz')).toBeVisible()
  await expect(rail.locator('.voice-reading')).toHaveCount(0)

  await rail.getByRole('button', { name: 'Escutar minha voz', exact: true }).click()
  await expect(rail.locator('.voice-reading')).toBeVisible()
  await expect(rail.locator('.voice-confidence strong')).toHaveText(/baixa|média|alta/)
  await expect(rail.locator('.voice-disclaimer')).toContainText(/hipótese|diagnóstico|leitura/i)

  await expect.poll(async () => launcher.locator('.reference-voice-summary').getAttribute('data-voice-reading')).toBe('ready')
  await rail.getByLabel('Fechar ferramentas').click()
  await expect(rail).toBeHidden()
  await expect(page.locator('body')).not.toHaveClass(/reference-voice-open/)
  await expect(launcher.locator('.reference-voice-summary')).not.toHaveText('Leitura ainda não executada.')
})
