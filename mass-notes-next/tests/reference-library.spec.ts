import { expect, test } from '@playwright/test'

test('Biblioteca local expõe filtros reais de estado, favorito, tag e ordenação', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()

  await page.getByLabel('Título do documento').fill('Biblioteca A3')

  const editorial = page.locator('.reference-editorial-state')
  await editorial.getByRole('button', { name: 'Em corte', exact: true }).click()
  await editorial.getByRole('button', { name: 'Marcar documento como favorito' }).click()

  await page.getByRole('button', { name: 'Editar tags do documento' }).click()
  const tools = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  const tags = tools.getByLabel('Marcadores da página')
  await tags.fill('biblioteca-a3')
  await tools.getByRole('button', { name: 'Salvar marcadores' }).click()
  await expect(tools.locator('.metadata-message')).toContainText('Marcadores atualizados.')
  await tools.getByLabel('Fechar ferramentas').click()
  await expect(tools).toBeHidden()
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })

  const trigger = page.getByRole('button', { name: 'Abrir biblioteca local' })
  await expect(trigger).toHaveAttribute('aria-controls', 'document-library')
  await trigger.click()

  const library = page.locator('.reference-mobile-legacy #document-library.sidebar.open')
  await expect(library).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-library-open/)
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await library.getByRole('button', { name: 'Em corte', exact: true }).click()
  await library.getByRole('button', { name: 'Somente favoritas' }).click()
  await library.getByLabel('Filtrar por tag').selectOption('biblioteca-a3')
  await library.getByLabel('Ordenar páginas').selectOption('title-asc')

  const active = library.locator('.note-card[aria-current="page"]')
  await expect(active).toBeVisible()
  await expect(active).toContainText('Biblioteca A3')
  await expect(active).toContainText('Em corte')
  await expect(active).toContainText('biblioteca-a3')
  await expect(library.locator('.library-filter-summary')).toContainText(/\d+ de \d+/)

  await library.getByLabel('Fechar arquivo').click()
  await expect(library).toBeHidden()
  await expect(page.locator('body')).not.toHaveClass(/reference-library-open/)
  await expect(page.getByRole('button', { name: 'Abrir biblioteca local' })).toHaveAttribute('aria-expanded', 'false')
})

test('gatilho canônico da Biblioteca não depende mais do botão móvel escondido', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()

  const mobileTrigger = page.locator('.mobile-menu')
  await expect(mobileTrigger).toHaveCount(1)
  await mobileTrigger.evaluate((element) => element.remove())
  await expect(page.locator('.mobile-menu')).toHaveCount(0)

  const trigger = page.getByRole('button', { name: 'Abrir biblioteca local' })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()

  const library = page.locator('.reference-mobile-legacy #document-library.sidebar.open')
  await expect(library).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('body')).toHaveClass(/reference-library-open/)

  await library.getByLabel('Fechar arquivo').click()
  await expect(library).toBeHidden()
  await expect(page.getByRole('button', { name: 'Abrir biblioteca local' })).toHaveAttribute('aria-expanded', 'false')
})
