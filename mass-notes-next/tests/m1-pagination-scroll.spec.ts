import { expect, test, type Download, type Page } from '@playwright/test'

type ContractHost = HTMLElement & {
  __escrevaralPositionContract?: {
    snapshot: {
      text: string
      contentSignature: string
    }
  }
}

const LONG_PARAGRAPHS = Array.from({ length: 82 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0')
  if (index === 0) return `Bloco ${number}. Melancolia abre o caderno e confirma o MARCO-INICIAL do documento integral.`
  if (index === 38) return `Bloco ${number}. A expressão lista negra aparece aqui para a leitura contextual integral do manuscrito.`
  if (index === 66) return `Bloco ${number}. Ela tentou mas não conseguiu encerrar a revisão antes de atravessar a quinta página.`
  if (index === 81) return `Bloco ${number}. O amor encontrou a dor e deixou uma flor no MARCO-FINAL do documento integral.`
  return `Bloco ${number}. Esta passagem existe para provar continuidade, mudança de página, seleção e acompanhamento do cursor sem deslocar a janela da oficina.`
})

const LONG_TEXT = LONG_PARAGRAPHS.join('\n\n')
const LONG_HTML = LONG_PARAGRAPHS.map((paragraph) => `<p>${paragraph}</p>`).join('')

const RICH_HTML = [
  ...LONG_PARAGRAPHS.slice(0, 24).map((paragraph) => `<p>${paragraph}</p>`),
  '<blockquote><p>Voz preservada dentro de uma citação longa.</p></blockquote>',
  '<ul><li>Primeiro item estrutural</li><li>Segundo item<ul><li>Item aninhado</li></ul></li></ul>',
  '<ol><li>Passo numerado um</li><li>Passo numerado dois</li></ol>',
  ...LONG_PARAGRAPHS.slice(24).map((paragraph) => `<p>${paragraph}</p>`),
].join('')

const RICH_TEXT = [
  ...LONG_PARAGRAPHS.slice(0, 24),
  'Voz preservada dentro de uma citação longa.',
  'Primeiro item estrutural',
  'Segundo item',
  'Item aninhado',
  'Passo numerado um',
  'Passo numerado dois',
  ...LONG_PARAGRAPHS.slice(24),
].join('\n\n')

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.editor-viewport')).toBeVisible()
  await expect(page.locator('.editor-viewport')).toHaveAttribute('data-scroll-owner', 'manuscript')
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function waitContractText(page: Page, expected: string) {
  const editor = page.getByLabel('Texto do documento')
  await expect.poll(() => editor.evaluate((element) =>
    (element as ContractHost).__escrevaralPositionContract?.snapshot.text ?? null), {
    timeout: 20_000,
  }).toBe(expected)
}

async function createCleanDocument(page: Page, title: string) {
  await page.keyboard.press('Control+N')
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function pasteDocument(page: Page, html: string, plain: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await editor.evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', payload.plain)
    transfer.setData('text/html', payload.html)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
  await waitContractText(page, plain)
  return editor
}

async function pasteLongDocument(page: Page, title = 'Caderno de paginação') {
  await createCleanDocument(page, title)
  return pasteDocument(page, LONG_HTML, LONG_TEXT)
}

async function pageCount(page: Page): Promise<number> {
  return page.locator('.paper').evaluate((element) => Number(element.getAttribute('data-page-count') ?? '1'))
}

async function waitFivePages(page: Page) {
  await expect.poll(() => pageCount(page), { timeout: 20_000 }).toBeGreaterThanOrEqual(5)
}

async function layoutGeometry(page: Page) {
  return page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('.app-shell')
    const workspace = document.querySelector<HTMLElement>('.workspace')
    const viewport = document.querySelector<HTMLElement>('.editor-viewport')
    const sidebar = document.querySelector<HTMLElement>('.sidebar')
    const rail = document.querySelector<HTMLElement>('.rail')
    const notes = document.querySelector<HTMLElement>('.notes')
    const railScroll = document.querySelector<HTMLElement>('.rail-scroll')
    if (!shell || !workspace || !viewport || !sidebar || !rail || !notes || !railScroll) throw new Error('Shell incompleta')
    return {
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      windowX: window.scrollX,
      windowY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight,
      documentWidth: document.documentElement.scrollWidth,
      shellHeight: shell.clientHeight,
      workspaceHeight: workspace.clientHeight,
      editorClientHeight: viewport.clientHeight,
      editorScrollHeight: viewport.scrollHeight,
      editorScrollTop: viewport.scrollTop,
      editorOverflowX: getComputedStyle(viewport).overflowX,
      editorOverflowY: getComputedStyle(viewport).overflowY,
      notesOverflowY: getComputedStyle(notes).overflowY,
      railOverflowY: getComputedStyle(railScroll).overflowY,
      notesScrollTop: notes.scrollTop,
      railScrollTop: railScroll.scrollTop,
      sidebarTop: sidebar.getBoundingClientRect().top,
      railTop: rail.getBoundingClientRect().top,
    }
  })
}

async function expectGlobalWindowLocked(page: Page) {
  const values = await layoutGeometry(page)
  expect(values.windowX).toBe(0)
  expect(values.windowY).toBe(0)
  expect(values.documentHeight).toBeLessThanOrEqual(values.viewportHeight + 1)
  expect(values.documentWidth).toBeLessThanOrEqual(values.viewportWidth + 1)
  expect(values.shellHeight).toBeLessThanOrEqual(values.viewportHeight + 1)
}

async function caretInsideViewport(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const selection = window.getSelection()
    const viewport = document.querySelector<HTMLElement>('.editor-viewport')
    if (!selection?.rangeCount || !viewport) return false
    const range = selection.getRangeAt(0).cloneRange()
    const marker = document.createElement('span')
    marker.textContent = '\u200b'
    range.insertNode(marker)
    const caret = marker.getBoundingClientRect()
    const bounds = viewport.getBoundingClientRect()
    marker.remove()
    return caret.bottom <= bounds.bottom - 20 && caret.top >= bounds.top + 20
  })
}

async function selectedRangeInsideViewport(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const selection = window.getSelection()
    const viewport = document.querySelector<HTMLElement>('.editor-viewport')
    if (!selection?.rangeCount || !viewport) return false
    const rect = selection.getRangeAt(0).getBoundingClientRect()
    const bounds = viewport.getBoundingClientRect()
    return rect.bottom <= bounds.bottom - 16 && rect.top >= bounds.top + 16
  })
}

async function expectCaretVisible(page: Page) {
  await expect.poll(() => caretInsideViewport(page)).toBe(true)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
}

async function openRail(page: Page) {
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
}

async function openTab(page: Page, name: string) {
  await openRail(page)
  await page.getByRole('tab', { name, exact: true }).click()
}

async function waitSaved(page: Page) {
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 15_000 })
}

async function readDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

test('01 documento possui pelo menos cinco folhas A4 sem fragmentar o Tiptap', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await waitReady(page)
  await pasteLongDocument(page)
  await waitFivePages(page)

  await expect(page.locator('.ProseMirror')).toHaveCount(1)
  const paper = page.locator('.paper')
  await expect(paper).toHaveAttribute('data-page-format', 'A4')
  await expect(paper).toHaveAttribute('data-page-width-mm', '210')
  await expect(paper).toHaveAttribute('data-page-height-mm', '297')
  await expect(paper).toHaveAttribute('data-pagination', 'block-boundaries')
  const count = await pageCount(page)
  await expect(page.locator('.escrevaral-page-break')).toHaveCount(count - 1)
  await page.screenshot({ path: `test-results/obs01-after-pages-${testInfo.project.name}.png` })
})

test('02 janela fica travada e sem overflow nos quatro viewports aprovados', async ({ page }, testInfo) => {
  const viewports = [
    { width: 1440, height: 560 },
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
    { width: 390, height: 640 },
  ]
  await page.setViewportSize(viewports[0])
  await waitReady(page)
  await pasteLongDocument(page)

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await waitFivePages(page)
    await expectGlobalWindowLocked(page)
    await expect(page.locator('.editor-viewport')).toBeVisible()
    await page.screenshot({ path: `test-results/obs01-after-${viewport.width}x${viewport.height}-${testInfo.project.name}.png` })
  }
})

test('03 editor viewport possui overflow vertical real', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page)
  const geometry = await layoutGeometry(page)
  expect(geometry.editorScrollHeight).toBeGreaterThan(geometry.editorClientHeight + 300)
  expect(geometry.editorOverflowY).toBe('auto')
  expect(geometry.editorOverflowX).toBe('hidden')
})

test('04 roda sobre o manuscrito move somente o editor viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page)
  const viewport = page.locator('.editor-viewport')
  await viewport.evaluate((element) => { element.scrollTop = 0 })
  const before = await layoutGeometry(page)

  await viewport.hover()
  await page.mouse.wheel(0, 820)
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(160)

  const after = await layoutGeometry(page)
  expect(after.windowY).toBe(0)
  expect(after.notesScrollTop).toBe(before.notesScrollTop)
  expect(after.railScrollTop).toBe(before.railScrollTop)
  expect(after.sidebarTop).toBeCloseTo(before.sidebarTop, 0)
  expect(after.railTop).toBeCloseTo(before.railTop, 0)
})

test('05 biblioteca, manuscrito e ferramentas mantêm proprietários de rolagem independentes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 })
  await waitReady(page)
  await pasteLongDocument(page)
  await openTab(page, 'ferramentas')

  const before = await layoutGeometry(page)
  expect(before.notesOverflowY).toBe('auto')
  expect(before.railOverflowY).toBe('auto')
  expect(before.editorOverflowY).toBe('auto')

  const railScroll = page.locator('.rail-scroll')
  await railScroll.evaluate((element) => { element.scrollTop = element.scrollHeight })
  const after = await layoutGeometry(page)
  expect(after.railScrollTop).toBeGreaterThanOrEqual(before.railScrollTop)
  expect(after.editorScrollTop).toBe(before.editorScrollTop)
  expect(after.notesScrollTop).toBe(before.notesScrollTop)
  expect(after.windowY).toBe(0)
})

test('06 cursor permanece visível ao alcançar a quinta página', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  const editor = await pasteLongDocument(page)
  await waitFivePages(page)
  const pageHeight = await page.locator('.paper').evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--escrevaral-page-height')))

  await editor.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText(' CURSOR-QUINTA-PAGINA')
  await expect(editor).toContainText('CURSOR-QUINTA-PAGINA')
  await expect.poll(() => page.locator('.editor-viewport').evaluate((element) => element.scrollTop)).toBeGreaterThan(pageHeight * 3)
  await expectCaretVisible(page)
})

test('07 colagem longa mantém o cursor no editor viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  await createCleanDocument(page, 'Colagem longa')
  const editor = await pasteDocument(page, LONG_HTML, LONG_TEXT)
  await waitFivePages(page)
  await expect(editor).toContainText('MARCO-FINAL')
  await expect.poll(() => page.locator('.editor-viewport').evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  await expectCaretVisible(page)
})

test('08 Ctrl+A seleciona o manuscrito integral através das folhas', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  const editor = await pasteLongDocument(page)
  await editor.click()
  await page.keyboard.press('Control+A')

  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? '')
  expect(selected).toContain('MARCO-INICIAL')
  expect(selected).toContain('MARCO-FINAL')
  expect(selected.length).toBeGreaterThan(LONG_TEXT.length * 0.85)
  expect(selected).not.toContain('Caderno de paginação')
})

test('09 desfazer e refazer atravessam páginas', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  const editor = await pasteLongDocument(page)
  await editor.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText(' MARCADOR-HISTORICO')
  await expect(editor).toContainText('MARCADOR-HISTORICO')
  await page.keyboard.press('Control+z')
  await expect(editor).not.toContainText('MARCADOR-HISTORICO')
  await page.keyboard.press('Control+Shift+z')
  await expect(editor).toContainText('MARCADOR-HISTORICO')
  await expectCaretVisible(page)
})

test('10 listas e citações permanecem no documento paginado', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await createCleanDocument(page, 'Estruturas entre páginas')
  const editor = await pasteDocument(page, RICH_HTML, RICH_TEXT)
  await waitFivePages(page)

  await expect(editor.locator('blockquote')).toHaveCount(1)
  await expect(editor.locator('ul')).toHaveCount(2)
  await expect(editor.locator('ol')).toHaveCount(1)
  await expect(editor.locator('li')).toHaveCount(5)
  await page.locator('.editor-viewport').evaluate((element) => { element.scrollTop = element.scrollHeight })
  await expect(editor.locator('blockquote')).toContainText('Voz preservada')
  const listText = (await editor.locator('li').allTextContents()).join(' | ')
  expect(listText).toContain('Primeiro item estrutural')
  expect(listText).toContain('Segundo item')
  expect(listText).toContain('Item aninhado')
  expect(listText).toContain('Passo numerado um')
  expect(listText).toContain('Passo numerado dois')
})

test('11 drawers móveis continuam acessíveis e sem overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await waitReady(page)
  await pasteLongDocument(page)

  await page.getByRole('button', { name: 'Abrir arquivo' }).click()
  await expect(page.locator('.sidebar.open')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Fechar arquivo' })).toBeFocused()
  await page.getByRole('button', { name: 'Fechar arquivo' }).click()

  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await expect(page.locator('.rail.open')).toBeVisible()
  await expect(page.locator('.rail-scroll')).toHaveAttribute('tabindex', '0')
  await expectGlobalWindowLocked(page)
  await page.keyboard.press('Escape')
  await expect(page.locator('.rail')).not.toHaveClass(/open/)
})

test('12 cinco engines continuam lendo o documento integral', async ({ page }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  const editor = await pasteLongDocument(page, 'Engines em cinco páginas')
  const signature = await editor.evaluate((element) => (element as ContractHost).__escrevaralPositionContract?.snapshot.contentSignature)

  await openTab(page, 'revisao')
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.getByRole('button', { name: /Ir ao trecho: tentou mas/i })).toBeVisible({ timeout: 20_000 })

  await openTab(page, 'voz')
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(page.locator('.voice-reading')).toBeVisible({ timeout: 20_000 })

  await openTab(page, 'contexto')
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
  await expect(page.locator('.context-card')).not.toHaveCount(0, { timeout: 20_000 })

  await openTab(page, 'rimalab')
  await page.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(page.locator('.rima-reading')).toBeVisible({ timeout: 20_000 })

  await openTab(page, 'palavras')
  await page.getByLabel('Palavra ou expressão curta').fill('melancolia')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.locator('.lexical-reading')).toBeVisible({ timeout: 20_000 })

  await expect(editor).toContainText('MARCO-INICIAL')
  await expect(editor).toContainText('MARCO-FINAL')
  await expect.poll(() => editor.evaluate((element) =>
    (element as ContractHost).__escrevaralPositionContract?.snapshot.contentSignature)).toBe(signature)
})

test('13 TXT, Markdown e HTML exportam o documento integral', async ({ page }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page, 'Exportação paginada integral')
  await waitSaved(page)
  await openTab(page, 'ferramentas')

  for (const format of ['txt', 'md', 'html'] as const) {
    const pending = page.waitForEvent('download')
    await page.locator(`[data-export-format="${format}"]`).click()
    const content = await readDownload(await pending)
    expect(content).toContain('MARCO-INICIAL')
    expect(content).toContain('MARCO-FINAL')
    expect(content).toContain('Bloco 67')
  }
})

test('14 navegação gerada pela Revisão move somente o editor viewport', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page, 'Navegação de engine paginada')
  await openTab(page, 'revisao')
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  const jump = page.getByRole('button', { name: /Ir ao trecho: tentou mas/i })
  await expect(jump).toBeVisible({ timeout: 20_000 })
  await jump.click()

  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('tentou mas')
  await expect.poll(() => page.locator('.editor-viewport').evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  await expect.poll(() => selectedRangeInsideViewport(page)).toBe(true)
  await expectGlobalWindowLocked(page)
})

test('15 Enter, setas, Page Up, Page Down e reduced motion preservam cursor e toolbar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  const editor = await pasteLongDocument(page, 'Teclado em páginas')
  await editor.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.press('Enter')
  await page.keyboard.insertText('Linha criada por teclado.')
  await expectCaretVisible(page)

  for (const key of ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']) {
    await page.keyboard.press(key)
    await expectCaretVisible(page)
  }

  const viewport = page.locator('.editor-viewport')
  await expect(viewport).toHaveCSS('scroll-behavior', 'auto')
  const toolbar = page.locator('.editor-toolbar')
  await expect(toolbar).toBeVisible()
  const toolbarInside = await page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>('.editor-toolbar')?.getBoundingClientRect()
    const region = document.querySelector<HTMLElement>('.editor-viewport')?.getBoundingClientRect()
    return Boolean(bar && region && bar.top >= region.top - 2 && bar.bottom <= region.bottom + 2)
  })
  expect(toolbarInside).toBe(true)
  await expect(page.locator('.editor-toolbar button[title="Negrito"]')).toBeVisible()
  await expectGlobalWindowLocked(page)
})
