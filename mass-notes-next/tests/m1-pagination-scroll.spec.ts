import { expect, test, type Page } from '@playwright/test'

const LONG_TEXT = Array.from({ length: 82 }, (_, index) =>
  `Bloco ${String(index + 1).padStart(2, '0')}. Esta passagem existe para provar a continuidade do manuscrito, a mudança de página e o acompanhamento do cursor sem deslocar a janela da oficina.`,
).join('\n\n')

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function pasteLongDocument(page: Page) {
  await page.keyboard.press('Control+N')
  await page.getByLabel('Título do documento').fill('Caderno de paginação')
  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await editor.evaluate((element, plain) => {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', plain)
    transfer.setData('text/html', plain.split('\n\n').map((paragraph) => `<p>${paragraph}</p>`).join(''))
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, LONG_TEXT)
  await expect(editor).toContainText('Bloco 82')
}

async function layoutGeometry(page: Page) {
  return page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('.app-shell')
    const workspace = document.querySelector<HTMLElement>('.workspace')
    const scroller = document.querySelector<HTMLElement>('.editor-shell')
    const sidebar = document.querySelector<HTMLElement>('.sidebar')
    const rail = document.querySelector<HTMLElement>('.rail')
    if (!shell || !workspace || !scroller || !sidebar || !rail) throw new Error('Shell incompleta')
    return {
      viewportHeight: window.innerHeight,
      windowY: window.scrollY,
      documentHeight: document.documentElement.scrollHeight,
      shellHeight: shell.clientHeight,
      workspaceHeight: workspace.clientHeight,
      scrollerClientHeight: scroller.clientHeight,
      scrollerScrollHeight: scroller.scrollHeight,
      scrollerOverflowY: getComputedStyle(scroller).overflowY,
      sidebarTop: sidebar.getBoundingClientRect().top,
      railTop: rail.getBoundingClientRect().top,
    }
  })
}

async function expectIsolatedScroll(page: Page) {
  const before = await layoutGeometry(page)
  expect(before.shellHeight).toBeLessThanOrEqual(before.viewportHeight + 1)
  expect(before.documentHeight).toBeLessThanOrEqual(before.viewportHeight + 1)
  expect(before.scrollerScrollHeight).toBeGreaterThan(before.scrollerClientHeight + 300)
  expect(['auto', 'scroll']).toContain(before.scrollerOverflowY)

  const scroller = page.locator('.editor-shell')
  await scroller.evaluate((element) => { element.scrollTop = 0 })
  await scroller.hover()
  await page.mouse.wheel(0, 720)
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(120)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  const after = await layoutGeometry(page)
  expect(after.sidebarTop).toBeCloseTo(before.sidebarTop, 0)
  expect(after.railTop).toBeCloseTo(before.railTop, 0)
}

test('tablet mantém a janela imóvel e rola somente o manuscrito', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page)
  await expectIsolatedScroll(page)
})

test('celular mantém a janela imóvel e o manuscrito em viewport próprio', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await waitReady(page)
  await pasteLongDocument(page)
  await expectIsolatedScroll(page)
})

test('desktop apresenta folhas visuais sem fragmentar o Tiptap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await waitReady(page)
  await pasteLongDocument(page)

  await expect(page.locator('.ProseMirror')).toHaveCount(1)
  const paper = page.locator('.paper')
  await expect(paper).toHaveAttribute('data-page-count', /[5-9]|[1-9][0-9]+/)
  await expect(page.locator('.escrevaral-page-break')).toHaveCount(await paper.evaluate((element) => Number(element.getAttribute('data-page-count')) - 1))
})

test('cursor acompanha a escrita no viewport central e histórico atravessa páginas', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  await pasteLongDocument(page)

  const editor = page.getByLabel('Texto do documento')
  const scroller = page.locator('.editor-shell')
  await editor.click()
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText(' MARCADOR-FINAL')

  await expect(editor).toContainText('MARCADOR-FINAL')
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  const caretInside = await page.evaluate(() => {
    const selection = window.getSelection()
    const scrollerElement = document.querySelector<HTMLElement>('.editor-shell')
    if (!selection?.rangeCount || !scrollerElement) return false
    const range = selection.getRangeAt(0).cloneRange()
    const marker = document.createElement('span')
    marker.textContent = '\u200b'
    range.insertNode(marker)
    const caret = marker.getBoundingClientRect()
    const viewport = scrollerElement.getBoundingClientRect()
    marker.remove()
    return caret.bottom <= viewport.bottom - 24 && caret.top >= viewport.top + 24
  })
  expect(caretInside).toBe(true)

  await page.keyboard.press('Control+z')
  await expect(editor).not.toContainText('MARCADOR-FINAL')
  await page.keyboard.press('Control+Shift+z')
  await expect(editor).toContainText('MARCADOR-FINAL')
})
