import { readFile } from 'node:fs/promises'
import { expect, test, type Download, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function downloadedText(download: Download): Promise<string> {
  const path = await download.path()
  expect(path).not.toBeNull()
  return readFile(path!, 'utf8')
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

test('Exportar abre escolhas reais e gera TXT, Markdown e HTML a partir do texto vivo', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  await page.getByLabel('Título do documento').fill('Exportação canônica')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Trecho vivo para exportação.')
  await page.keyboard.press('Escape')

  const downloads: Download[] = []
  page.on('download', (download) => downloads.push(download))

  const exportar = page.getByRole('button', { name: 'Exportar', exact: true })
  await expect(exportar).toHaveAttribute('aria-controls', 'writing-export-panel')
  await exportar.click()

  const panel = page.getByRole('dialog', { name: 'Exportar documento' })
  await expect(panel).toBeVisible()
  await expect(exportar).toHaveAttribute('aria-expanded', 'true')
  await page.waitForTimeout(150)
  expect(downloads).toHaveLength(0)

  const formats = [
    { format: 'txt', extension: '.txt' },
    { format: 'md', extension: '.md' },
    { format: 'html', extension: '.html' },
  ] as const

  for (const { format, extension } of formats) {
    const downloadPromise = page.waitForEvent('download')
    await panel.locator(`[data-reference-export-format="${format}"]`).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`exportacao-canonica${extension}`)
    const content = await downloadedText(download)
    expect(content).toContain('Trecho vivo para exportação.')
  }

  expect(downloads).toHaveLength(3)
  await panel.getByLabel('Fechar exportação').click()
  await expect(panel).toBeHidden()
  await expect(exportar).toHaveAttribute('aria-expanded', 'false')
})

test('Config abre destinos reais sem alternar o tema por acidente', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const config = page.getByRole('button', { name: 'Config.', exact: true })
  await expect(config).toHaveAttribute('aria-controls', 'writing-config-panel')
  await expect(page.locator('body')).not.toHaveClass(/night/)
  await config.click()

  const panel = page.getByRole('dialog', { name: 'Configurações' })
  await expect(panel).toBeVisible()
  await expect(config).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('body')).not.toHaveClass(/night/)
  await expect(panel).toContainText('Português (BR)')

  await panel.getByRole('button', { name: /Usar modo noite/ }).click()
  await expect(page.locator('body')).toHaveClass(/night/)
  await panel.getByRole('button', { name: /Usar papel/ }).click()
  await expect(page.locator('body')).not.toHaveClass(/night/)

  await panel.getByRole('button', { name: /Entrar no foco/ }).click()
  await expect(panel).toBeHidden()
  await expect(page.locator('body')).toHaveClass(/focus-mode/)
  await page.keyboard.press('Escape')
  await expect(page.locator('body')).not.toHaveClass(/focus-mode/)
})

test('Pesquisa abre a revisão local real e entra diretamente no recorte de revisão', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const pesquisa = page.getByRole('button', { name: 'Pesquisa', exact: true })
  await expect(pesquisa).toHaveAttribute('aria-controls', 'text-tools')
  await expect(pesquisa).toHaveAttribute('aria-expanded', 'false')
  await pesquisa.click()

  const rail = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await expect(rail).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-research-open/)
  await expect(pesquisa).toHaveAttribute('aria-expanded', 'true')
  await expect(rail.locator('#tab-revisao')).toHaveAttribute('aria-selected', 'true')
  await expect(rail.locator('#panel-revisao')).toBeVisible()

  await expect.poll(async () => (await rail.locator('.review-message').textContent())?.trim() ?? '')
    .not.toBe('Aguardando uma leitura.')

  await rail.getByLabel('Fechar ferramentas').click()
  await expect(rail).toBeHidden()
  await expect(page.locator('body')).not.toHaveClass(/reference-research-open/)
  await expect(pesquisa).toHaveAttribute('aria-expanded', 'false')
})

test('Tags abre o editor real, salva no documento e reaparece após recarregar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const trigger = page.getByRole('button', { name: 'Editar tags do documento' })
  await expect(trigger).toHaveAttribute('aria-controls', 'text-tools')
  await trigger.click()

  const rail = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await expect(rail).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-tags-open/)
  await expect(rail.locator('#tab-pulso')).toHaveAttribute('aria-selected', 'true')

  const input = rail.getByLabel('Marcadores da página')
  await expect(input).toBeFocused()
  await input.fill('memória, gate-tag, memória')
  await rail.getByRole('button', { name: 'Salvar marcadores' }).click()
  await expect(rail.locator('.metadata-message')).toContainText('Marcadores atualizados.')
  await expect(page.locator('.analysis-panel .tags')).toContainText('# gate-tag')

  await expect(page.locator('.field-value').filter({ hasText: 'Salvo' })).toBeVisible({ timeout: 5000 })
  await rail.getByLabel('Fechar ferramentas').click()
  await expect(rail).toBeHidden()
  await page.reload()
  await expect(page.locator('.analysis-panel .tags')).toContainText('# gate-tag')
})
