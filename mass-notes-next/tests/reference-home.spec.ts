import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

test('estrutura canônica reproduz a prancha enviada', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  await expect(page.locator('.topbar')).toBeVisible()
  await expect(page.locator('.brand-name')).toContainText('ESCREVARAL')
  await expect(page.locator('.brand-tagline')).toHaveText('ESCRITA COM INTENÇÃO')
  await expect(page.locator('.document-title .eyebrow')).toHaveText('DOCUMENTO')
  await expect(page.locator('.mode .eyebrow')).toHaveText('MODO')
  await expect(page.locator('.mode')).toContainText('Escrita')
  await expect(page.locator('.topbar .search input')).toBeVisible()

  const actions = page.locator('.main-actions > button')
  await expect(actions).toHaveCount(5)
  await expect(actions.nth(0)).toContainText('Metas')
  await expect(actions.nth(1)).toContainText('Notas')
  await expect(actions.nth(2)).toContainText('Pesquisa')
  await expect(actions.nth(3)).toContainText('Exportar')
  await expect(actions.nth(4)).toContainText('Config.')

  await expect(page.locator('.left-rail')).toContainText('PROJETO ATUAL')
  await expect(page.locator('.left-rail')).toContainText('DOCUMENTOS')
  await expect(page.locator('.left-rail')).toContainText('PESQUISA')
  await expect(page.locator('.left-rail')).toContainText('CAIXA RÁPIDA')

  await expect(page.locator('.analysis-panel')).toContainText('ANÁLISE')
  await expect(page.locator('.analysis-panel')).toContainText('CONTAGEM')
  await expect(page.locator('.analysis-panel')).toContainText('DISTRIBUIÇÃO')
  await expect(page.locator('.analysis-panel')).toContainText('LINGUAGEM')
  await expect(page.locator('.analysis-panel')).toContainText('TAGS')
  await expect(page.locator('.analysis-panel')).toContainText('VERSÕES')

  await expect(page.locator('.statusbar')).toContainText('SINCRONIZADO')
  await expect(page.locator('.statusbar')).toContainText('META DIÁRIA')
  await expect(page.locator('.statusbar')).toContainText('FOCO')
  await expect(page.locator('.statusbar')).toContainText('Português (BR)')
})

test('geometria desktop segue exatamente a folha de referência', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const geometry = await page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect()
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
    }
    return {
      shell: box('.paper-shell'),
      topbar: box('.topbar'),
      left: box('.left-rail'),
      workspace: box('.workspace'),
      right: box('.analysis-panel'),
      toolbar: box('.formatbar'),
      footer: box('.statusbar'),
    }
  })

  expect(geometry.shell.left).toBeCloseTo(12, 0)
  expect(geometry.shell.top).toBeCloseTo(10, 0)
  expect(geometry.shell.right).toBeCloseTo(1346, 0)
  expect(geometry.shell.bottom).toBeCloseTo(758, 0)
  expect(geometry.topbar.height).toBeCloseTo(92, 0)
  expect(geometry.left.width).toBeCloseTo(250, 0)
  expect(geometry.right.width).toBeCloseTo(250, 0)
  expect(geometry.toolbar.height).toBeCloseTo(80, 0)
  expect(geometry.footer.height).toBeCloseTo(60, 0)
  expect(geometry.workspace.left).toBeCloseTo(geometry.left.right, 0)
  expect(geometry.workspace.right).toBeCloseTo(geometry.right.left, 0)
})

test('manuscrito permanece limpo e sem grid visual concorrente', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const surface = await page.evaluate(() => {
    const paper = document.querySelector('.editor.editor-shell.paper')!
    const editor = document.querySelector('.escrevaral-editor')!
    const pageBreak = document.querySelector('.escrevaral-page-break')
    return {
      paperImage: getComputedStyle(paper).backgroundImage,
      editorImage: getComputedStyle(editor).backgroundImage,
      beforeDisplay: getComputedStyle(paper, '::before').display,
      afterDisplay: getComputedStyle(paper, '::after').display,
      pageBreakAfter: pageBreak ? getComputedStyle(pageBreak, '::after').display : 'none',
    }
  })

  expect(surface.paperImage).toBe('none')
  expect(surface.editorImage).toBe('none')
  expect(surface.beforeDisplay).toBe('none')
  expect(surface.afterDisplay).toBe('none')
  expect(surface.pageBreakAfter).toBe('none')
})

test('toolbar da referência opera sobre o Tiptap real', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  await expect(page.locator('.formatbar > label')).toHaveCount(3)
  await expect(page.locator('.formatbar > label').nth(0)).toContainText('Estilo')
  await expect(page.locator('.formatbar > label').nth(1)).toContainText('Fonte')
  await expect(page.locator('.formatbar > label').nth(2)).toContainText('Tamanho')

  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Texto da referência')
  await page.keyboard.press('Control+A')
  await page.getByRole('button', { name: 'N', exact: true }).click()
  await expect(editor.locator('strong')).toHaveText('Texto da referência')
  await expect(page.locator('.field-value').filter({ hasText: /^Alterado$/ })).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 8_000 })
})

test('documentos reais alimentam rail, busca e contagem', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const before = await page.locator('.left-rail .chapter').count()
  await page.getByRole('button', { name: 'Novo documento' }).click()
  await expect(page.locator('.left-rail .chapter')).toHaveCount(before + 1)

  await page.getByLabel('Título do documento').fill('Documento de verificação')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.type('um dois três quatro cinco')
  await expect(page.locator('.big-count')).toHaveText('5')

  const search = page.locator('.topbar .search input')
  await search.fill('Documento de verificação')
  await expect(page.locator('.left-rail .chapter')).toHaveCount(1)
  await expect(page.locator('.left-rail .chapter')).toContainText('Documento de verificação')

  await page.screenshot({ path: 'test-results/escrevaral-reference-home.png', fullPage: true })
})
