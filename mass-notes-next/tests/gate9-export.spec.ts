import { expect, test, type Download, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function pasteRichText(page: Page, html: string, plain: string) {
  await page.locator('.ProseMirror').evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
}

async function openExports(page: Page) {
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'ferramentas', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.export-panel')).toBeVisible()
}

async function readDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function exportFormat(page: Page, format: 'txt' | 'md' | 'html') {
  const downloadPromise = page.waitForEvent('download')
  await page.locator(`[data-export-format="${format}"]`).click()
  const download = await downloadPromise
  return {
    filename: download.suggestedFilename(),
    content: await readDownload(download),
  }
}

async function seedStructuredDocument(page: Page) {
  const editor = await createCleanDocument(page, 'Café / Coração: edição nº 2')
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible()

  await pasteRichText(page, `
    <h2>Capítulo &amp; travessia</h2>
    <p><strong>Casa</strong> <em>azul</em>, <u>linha</u> e <s>rasura</s> com
      <a href="https://example.com/caminho?q=1&amp;x=2">ponte</a>.</p>
    <blockquote><p>Voz do quintal.</p></blockquote>
    <ul>
      <li>Primeiro item</li>
      <li>Segundo item<ol><li>Dentro da lista</li></ol></li>
    </ul>
    <p>Emoji 🧵, acento combinante café e palavra brasileira: saudade.</p>
    <p><a href="javascript:window.__exportAttack=true">atalho perigoso</a></p>
    <script>window.__exportAttack=true</script>
  `, 'Capítulo & travessia\nCasa azul, linha e rasura com ponte.\nVoz do quintal.\nPrimeiro item\nSegundo item\nDentro da lista\nEmoji 🧵, acento combinante café e palavra brasileira: saudade.\natalho perigoso')

  await expect(editor.locator('h2')).toHaveText('Capítulo & travessia')
  await expect(editor.locator('li')).toHaveCount(3)
  await expect(editor.locator('script')).toHaveCount(0)
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando/ })).toBeVisible()
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible()
  await openExports(page)
  return editor
}

test('painel de exportação oferece três formatos locais e explica o uso', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Formatos locais')
  await openExports(page)

  await expect(page.locator('[data-export-format]')).toHaveCount(3)
  await expect(page.locator('[data-export-format="txt"]')).toContainText('Texto (.txt)')
  await expect(page.locator('[data-export-format="md"]')).toContainText('Markdown (.md)')
  await expect(page.locator('[data-export-format="html"]')).toContainText('Página (.html)')
  await expect(page.locator('.export-panel')).toContainText(/gerados localmente/i)
})

test('Markdown preserva títulos, ênfases, links, citações e listas aninhadas', async ({ page }) => {
  await waitReady(page)
  await seedStructuredDocument(page)
  const exported = await exportFormat(page, 'md')

  expect(exported.filename).toBe('cafe-coracao-edicao-n-2.md')
  expect(exported.content).toContain('title: "Café / Coração: edição nº 2"')
  expect(exported.content).toContain('# Café / Coração: edição nº 2')
  expect(exported.content).toContain('## Capítulo & travessia')
  expect(exported.content).toContain('**Casa** _azul_')
  expect(exported.content).toContain('<u>linha</u>')
  expect(exported.content).toContain('~~rasura~~')
  expect(exported.content).toContain('[ponte](https://example.com/caminho?q=1&x=2)')
  expect(exported.content).toContain('> Voz do quintal.')
  expect(exported.content).toContain('- Segundo item\n  1. Dentro da lista')
  expect(exported.content).toContain('Emoji 🧵')
  expect(exported.content).not.toContain('javascript:')
})

test('HTML é autônomo, semântico, escapado e não publica scripts do manuscrito', async ({ page }) => {
  await waitReady(page)
  await seedStructuredDocument(page)
  const exported = await exportFormat(page, 'html')

  expect(exported.filename).toBe('cafe-coracao-edicao-n-2.html')
  expect(exported.content).toMatch(/^<!doctype html>/)
  expect(exported.content).toContain('<html lang="pt-BR">')
  expect(exported.content).toContain('<meta charset="utf-8">')
  expect(exported.content).toContain('<h2>Capítulo &amp; travessia</h2>')
  expect(exported.content).toContain('<strong>Casa</strong>')
  expect(exported.content).toContain('<em>azul</em>')
  expect(exported.content).toContain('<blockquote>')
  expect(exported.content).toContain('<ul>')
  expect(exported.content).toContain('<ol>')
  expect(exported.content).toContain('href="https://example.com/caminho?q=1&amp;x=2"')
  expect(exported.content).not.toContain('<script>')
  expect(exported.content).not.toContain('javascript:')
})

test('TXT mantém uma leitura portátil com hierarquia, citações e marcadores', async ({ page }) => {
  await waitReady(page)
  await seedStructuredDocument(page)
  const exported = await exportFormat(page, 'txt')

  expect(exported.filename).toBe('cafe-coracao-edicao-n-2.txt')
  expect(exported.content).toContain('Café / Coração: edição nº 2')
  expect(exported.content).toContain('Situação: Rascunho')
  expect(exported.content).toContain('Capítulo & travessia')
  expect(exported.content).toContain('Casa azul, linha e rasura com ponte <https://example.com/caminho?q=1&x=2>.')
  expect(exported.content).toContain('> Voz do quintal.')
  expect(exported.content).toContain('- Primeiro item')
  expect(exported.content).toContain('- Segundo item\n  1. Dentro da lista')
  expect(exported.content).not.toMatch(/<h2>|<strong>|<script>/)
})

test('página vazia ainda exporta título e metadados válidos', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página em branco')
  await openExports(page)

  await expect(page.locator('.export-panel')).toContainText(/página está vazia/i)
  const markdown = await exportFormat(page, 'md')
  expect(markdown.content).toContain('# Página em branco')
  expect(markdown.content).toContain('situacao: "Rascunho"')

  const html = await exportFormat(page, 'html')
  expect(html.content).toContain('<h1>Página em branco</h1>')
  expect(html.content).toContain('<main>')
})

test('exportar não altera o documento, o título nem o estado de salvamento', async ({ page }) => {
  await waitReady(page)
  const editor = await seedStructuredDocument(page)
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando|Salvo/ })).toBeVisible()

  const before = {
    html: await editor.innerHTML(),
    text: await editor.innerText(),
    title: await page.getByLabel('Título do documento').inputValue(),
    documents: await page.locator('.note-card').count(),
  }
  await exportFormat(page, 'md')

  expect(await editor.innerHTML()).toBe(before.html)
  expect(await editor.innerText()).toBe(before.text)
  expect(await page.getByLabel('Título do documento').inputValue()).toBe(before.title)
  expect(await page.locator('.note-card').count()).toBe(before.documents)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('painel de exportação cabe no drawer móvel sem overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await createCleanDocument(page, 'Exportação móvel')
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()

  const panel = page.locator('.export-panel')
  await expect(panel).toBeVisible()
  const fits = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.left >= 0 && rect.right <= window.innerWidth && document.documentElement.scrollWidth <= window.innerWidth
  })
  expect(fits).toBe(true)
  await expect(page.locator('[data-export-format]')).toHaveCount(3)
})