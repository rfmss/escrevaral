import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await expect(page.getByLabel('Título do documento')).toHaveValue('')
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function settleDocument(page: Page) {
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando|Salvo/ })).toBeVisible()
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 12_000 })
}

async function pasteStructuredText(page: Page, html: string, plain: string) {
  const editor = page.locator('.ProseMirror')
  await editor.evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })

  const finalVisibleLine = plain.split('\n').filter(Boolean).at(-1) ?? plain
  await expect(editor).toContainText(finalVisibleLine)
  await settleDocument(page)
}

async function ensureToolsOpen(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (await dialog.isVisible().catch(() => false)) return
  await page.keyboard.press('Escape')
  const launcher = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(dialog).toBeVisible()
}

async function openRimaLab(page: Page) {
  await ensureToolsOpen(page)
  await page.getByRole('tab', { name: 'rimalab', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'rimalab', exact: true })).toHaveAttribute('aria-selected', 'true')
  return page.locator('.rimalab-panel')
}

test('página vazia não recebe falsa leitura sonora', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página sem som')
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.getByRole('status')).toContainText(/página está vazia/i)
  await expect(panel.locator('.rima-reading')).toHaveCount(0)
})

test('prosa com ecos internos é lida sem alterar o manuscrito', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Ecos na prosa')
  const source = 'O amor atravessou a dor e deixou uma flor sobre a mesa, enquanto a cidade seguia acordada.'
  await editor.fill(source)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.locator('.rima-prose-reading')).toBeVisible()
  await expect(panel.getByRole('status')).toContainText(/padr(?:ão|ões) sonor/i)
  await expect(panel.locator('.rima-pattern').first()).toContainText(/amor|dor|flor/i)
  await expect(panel.locator('.rima-disclaimer')).toContainText(/não uma exigência de rima/i)
  await expect(editor).toContainText(source)
  await expect(panel.locator('.rima-reading button')).toHaveCount(0)
})

test('prosa sem padrão recebe retorno neutro', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Prosa sem eco')
  await editor.fill('Pedra azul sobre chão.')
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.locator('.rima-prose-reading')).toBeVisible()
  await expect(panel.getByRole('status')).toContainText(/não apresentou um padrão sonoro recorrente/i)
})

test('poema rimado apresenta esquema, escansão, pares, som e classe gramatical', async ({ page }, testInfo) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Quadra sonora')
  const html = '<p>No quintal eu vi a flor</p><p>e guardei comigo a dor</p><p>quando a tarde virou mar</p><p>eu voltei para cantar</p>'
  const plain = 'No quintal eu vi a flor\ne guardei comigo a dor\nquando a tarde virou mar\neu voltei para cantar'
  await pasteStructuredText(page, html, plain)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.locator('.rima-verse-reading')).toBeVisible()
  await expect(panel.locator('.rima-summary')).toContainText('4')
  await expect(panel.locator('.rima-scan')).toHaveCount(4)
  await expect(panel.locator('.rima-scheme')).toBeVisible()
  await expect(panel.locator('.rima-pairs')).toContainText(/flor \/ dor|mar \/ cantar/i)
  await expect(panel.locator('.rima-pairs small').first()).toContainText(/\/.+\/.*\/.+\//)
  await expect(panel.locator('.rima-pairs small').first()).toContainText(/substantivo/i)
  await expect(panel.locator('.rima-disclaimer')).toContainText(/aproximação pedagógica/i)
  await expect(panel.getByRole('button', { name: 'Copiar análise' })).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Baixar TXT' })).toBeVisible()
  await expect(editor).toContainText('No quintal eu vi a flor')
  await expect(editor).toContainText('eu voltei para cantar')
  await expect(panel.locator('.rima-reading button')).toHaveCount(0)
  await expect(page.locator('.note-card.active')).toContainText('Quadra sonora')
  await page.screenshot({ path: `test-results/rimalab-${testInfo.project.name}.png`, fullPage: true })
})

test('buscador de rimas legado permanece disponível no painel atual', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  await panel.getByLabel('Palavra para buscar rimas').fill('amor')
  await panel.getByRole('button', { name: 'Buscar no vocabulário' }).click()

  await expect(panel.getByRole('status')).toContainText(/possibilidade|encontrada/i)
  await expect(panel.getByLabel('Resultados do buscador de rimas')).toContainText(/dor|flor/i)
  await expect(panel.getByLabel('Resultados do buscador de rimas')).toContainText(/substantivo/i)
})

test('referência métrica da engine pode ser consultada sem sair do RimaLab', async ({ page }) => {
  await waitReady(page)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir referência' }).click()

  await expect(panel.getByText('Regra de ouro da métrica', { exact: true })).toBeVisible()
  await expect(panel.getByText(/última sílaba tônica/i).first()).toBeVisible()
})

test('bloco vazio preserva duas estrofes distintas', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Duas estrofes')
  const html = '<p>A rua termina no mar</p><p>e a noite começa a cantar</p><p></p><p>O quintal recolhe a flor</p><p>e a casa devolve a dor</p>'
  const plain = 'A rua termina no mar\ne a noite começa a cantar\n\nO quintal recolhe a flor\ne a casa devolve a dor'
  await pasteStructuredText(page, html, plain)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.locator('.rima-verse-reading')).toBeVisible()
  await expect(panel.locator('.rima-stanzas article')).toHaveCount(2)
  await expect(panel.locator('.rima-stanzas article').first()).toContainText(/estrofe 1 · 2 versos/i)
  await expect(panel.locator('.rima-stanzas article').nth(1)).toContainText(/estrofe 2 · 2 versos/i)
})

test('verso livre sem pares recebe mensagem não punitiva', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Verso livre')
  const html = '<p>pedra</p><p>azul</p><p>chão</p><p>fim</p>'
  const plain = 'pedra\nazul\nchão\nfim'
  await pasteStructuredText(page, html, plain)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.locator('.rima-verse-reading')).toBeVisible()
  await expect(panel.locator('.rima-neutral')).toContainText(/verso livre continua sendo verso/i)
})

test('resultado sonoro é invalidado quando o conteúdo muda', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Som em mudança')
  await editor.fill('O amor atravessou a dor e encontrou uma flor.')
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.locator('.rima-reading')).toBeVisible()

  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Depois o narrador mudou o ritmo.')

  await expect(panel.locator('.rima-reading')).toHaveCount(0)
  await expect(panel.getByRole('status')).toContainText(/texto mudou/i)
  await expect(panel.getByRole('button', { name: 'Copiar análise' })).toHaveCount(0)
})

test('falha controlada do RimaLab não quebra editor nem outras ferramentas', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Falha sonora')
  await editor.fill('O amor encontrou a dor e guardou uma flor.')
  await settleDocument(page)
  const panel = await openRimaLab(page)
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(panel.locator('.rima-reading')).toBeVisible()

  await page.evaluate(() => {
    const target = window as typeof window & { VeredaRimaLab?: { analyze: () => unknown } }
    if (target.VeredaRimaLab) target.VeredaRimaLab.analyze = () => { throw new Error('falha simulada') }
  })
  await panel.getByRole('button', { name: 'Abrir oficina sonora' }).click()

  await expect(panel.getByRole('status')).toContainText(/não pôde concluir/i)
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.type(' O editor segue funcionando.')
  await expect(editor).toContainText('O editor segue funcionando.')
  await ensureToolsOpen(page)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await expect(page.getByRole('button', { name: /analisar em português brasileiro/i })).toBeVisible()
})

test('RimaLab permanece acessível e sem overflow no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(dialog).toBeVisible()
  const panel = await openRimaLab(page)
  await expect(panel.getByText(/ausência de rima não é defeito/i)).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(7)

  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.documentElement.scrollWidth,
    rail: document.querySelector('.rail')?.scrollWidth ?? 0,
    railClient: document.querySelector('.rail')?.clientWidth ?? 0,
  }))
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport)
  expect(sizes.rail).toBeLessThanOrEqual(sizes.railClient)
})
