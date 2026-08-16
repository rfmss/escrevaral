import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

test('Metas abre a preferência real e sincroniza o rodapé', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const metas = page.getByRole('button', { name: 'Metas', exact: true })
  await expect(metas).toHaveAttribute('aria-controls', 'writing-goals-panel')
  await metas.click()

  const panel = page.getByRole('dialog', { name: 'Meta diária' })
  await expect(panel).toBeVisible()
  await expect(metas).toHaveAttribute('aria-expanded', 'true')

  const input = page.getByLabel('Meta diária de palavras')
  await expect(input).toHaveValue('1200')
  await input.fill('1500')

  const daily = page.locator('.statusbar .daily')
  await expect(daily).toHaveAttribute('data-writing-goal', '1500')
  await expect(daily).toContainText('/ 1.500 palavras')

  await panel.getByLabel('Fechar metas').click()
  await expect(panel).toBeHidden()
  await expect(metas).toHaveAttribute('aria-expanded', 'false')

  await page.reload()
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.statusbar .daily')).toHaveAttribute('data-writing-goal', '1500')
  await expect(page.locator('.statusbar .daily')).toContainText('/ 1.500 palavras')
})

test('Ctrl+K leva à busca real e a busca continua filtrando documentos reais', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  await page.keyboard.press('Control+K')
  const search = page.locator('.topbar .search input[aria-label="Buscar documentos"]')
  await expect(search).toBeFocused()

  const title = (await page.locator('.left-rail .chapter').first().locator('.chapter-copy b').textContent())?.replace(/^\d{2}\s+—\s+/, '').trim() ?? ''
  expect(title.length).toBeGreaterThan(0)
  await search.fill(title)
  await expect(page.locator('.left-rail .chapter')).toHaveCount(1)
  await expect(page.locator('.left-rail .chapter').first()).toContainText(title)
})
