import { expect, test } from '@playwright/test'

test('rail canônico e Biblioteca compartilham a mesma LibraryQuery nos dois sentidos', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  await page.getByLabel('Título do documento').fill('Ownership A3b')
  const editorial = page.locator('.reference-editorial-state')
  await editorial.getByRole('button', { name: 'Em corte', exact: true }).click()
  await editorial.getByRole('button', { name: 'Marcar documento como favorito' }).click()

  await page.getByRole('button', { name: 'Editar tags do documento' }).click()
  const tools = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await tools.getByLabel('Marcadores da página').fill('ownership-a3b')
  await tools.getByRole('button', { name: 'Salvar marcadores' }).click()
  await expect(tools.locator('.metadata-message')).toContainText('Marcadores atualizados.')
  await tools.getByLabel('Fechar ferramentas').click()
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })

  await page.getByRole('button', { name: 'Abrir biblioteca local' }).click()
  let library = page.locator('.reference-mobile-legacy #document-library.sidebar.open')
  await expect(library).toBeVisible()
  await library.getByRole('button', { name: 'Em corte', exact: true }).click()
  await library.getByRole('button', { name: 'Somente favoritas' }).click()
  await library.getByLabel('Filtrar por tag').selectOption('ownership-a3b')
  await library.getByLabel('Fechar arquivo').click()

  const canonicalDocuments = page.locator('.left-rail .chapter')
  await expect(canonicalDocuments).toHaveCount(1)
  await expect(canonicalDocuments.first()).toContainText('Ownership A3b')

  const topSearch = page.locator('.topbar .search input[aria-label="Buscar documentos"]')
  await topSearch.fill('termo-sem-resultado-a3b')
  await expect(canonicalDocuments).toHaveCount(0)

  await page.getByRole('button', { name: 'Abrir biblioteca local' }).click()
  library = page.locator('.reference-mobile-legacy #document-library.sidebar.open')
  await expect(library.locator('#document-search')).toHaveValue('termo-sem-resultado-a3b')
  await expect(library.locator('.empty-library')).toBeVisible()

  await library.getByRole('button', { name: 'Limpar filtros' }).first().click()
  await expect(topSearch).toHaveValue('')
  await expect(library.getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(library.getByRole('button', { name: 'Somente favoritas' })).toHaveAttribute('aria-pressed', 'false')
  await expect(library.getByLabel('Filtrar por tag')).toHaveValue('')
  await expect(canonicalDocuments).not.toHaveCount(0)
})
