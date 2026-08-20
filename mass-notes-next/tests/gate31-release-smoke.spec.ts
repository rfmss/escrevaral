import { expect, test } from '@playwright/test'

test('Gate 31: fluxo de entrega escreve, persiste, revisa, consulta e exporta no mesmo documento', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')

  const editor = page.getByLabel('Texto do documento')
  const title = page.getByLabel('Título do documento')
  const manuscript = 'Melancolia atravessa a casa sem pedir licença. A pesquisadora publicou o relatório completo.'

  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(editor).toBeEditable()

  await title.fill('Smoke de entrega')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.insertText(manuscript)
  await page.keyboard.press('Escape')

  await expect(page.locator('.field-value').filter({ hasText: /^Alterado$/ })).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })

  await page.reload()
  await expect(title).toHaveValue('Smoke de entrega')
  await expect(editor).toContainText(manuscript)

  await page.getByRole('button', { name: 'Pesquisa', exact: true }).click()
  const tools = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(tools).toBeVisible()
  await tools.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(tools.getByRole('status')).toHaveText(/observa|Nenhuma/i, { timeout: 15_000 })
  await tools.getByLabel('Fechar ferramentas').click()
  await expect(tools).toBeHidden()

  const lexicalOpen = page.locator('.analysis-panel .reference-lexical-open')
  await expect(lexicalOpen).toBeVisible()
  await lexicalOpen.click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
  const lexicalInput = page.getByLabel('Palavra ou expressão curta')
  await lexicalInput.fill('melancolia')
  await page.getByRole('button', { name: 'Consultar', exact: true }).click()
  await expect(page.locator('.lexical-reading')).toBeVisible()

  const reopenedTools = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (await reopenedTools.isVisible().catch(() => false)) {
    await reopenedTools.getByLabel('Fechar ferramentas').click()
    await expect(reopenedTools).toBeHidden()
  }

  await page.getByRole('button', { name: 'Exportar', exact: true }).click()
  const exportPanel = page.getByRole('dialog', { name: 'Exportar documento' })
  await expect(exportPanel).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await exportPanel.locator('[data-reference-export-format="txt"]').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('smoke-de-entrega.txt')
  expect(await download.path()).not.toBeNull()
})
