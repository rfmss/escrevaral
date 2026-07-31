import { expect, test, type Download, type Page } from '@playwright/test'

const ACTIVE_KEY = 'escrevaral-mass-notes-next-active'
const RECOVERY_KEY = 'escrevaral-mass-notes-next-recovery'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function hasPersistedText(page: Page, expected: string): Promise<boolean> {
  return page.evaluate(async ({ activeKey, phrase }) => {
    const activeId = localStorage.getItem(activeKey)
    if (!activeId) return false
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const record = await new Promise<Record<string, unknown> | undefined>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').get(activeId)
      request.onsuccess = () => resolve(request.result as Record<string, unknown> | undefined)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return String(record?.plainText ?? '').includes(phrase)
  }, { activeKey: ACTIVE_KEY, phrase: expected })
}

async function hasRecoveryText(page: Page, expected: string): Promise<boolean> {
  return page.evaluate(({ recoveryKey, phrase }) => {
    try {
      const raw = localStorage.getItem(recoveryKey)
      if (!raw) return false
      const recovery = JSON.parse(raw) as { document?: { plainText?: string } }
      return String(recovery.document?.plainText ?? '').includes(phrase)
    } catch {
      return false
    }
  }, { recoveryKey: RECOVERY_KEY, phrase: expected })
}

async function waitPersistedText(page: Page, expected: string) {
  await expect.poll(() => hasPersistedText(page, expected), {
    timeout: 20_000,
    intervals: [250, 500, 1_000],
  }).toBe(true)
}

async function persistCurrentDraft(page: Page, expected: string) {
  const saveState = page.locator('.field-value').filter({ hasText: /Alterado|Salvando|Salvo/ })
  await expect.poll(async () => {
    if (await hasPersistedText(page, expected)) return 'persisted'
    if (await hasRecoveryText(page, expected)) return 'recovery'
    return (await saveState.textContent())?.trim() ?? ''
  }, {
    timeout: 20_000,
    intervals: [100, 250, 500],
  }).toMatch(/^(persisted|recovery|Alterado|Salvando|Salvo)$/)

  if (await hasPersistedText(page, expected)) return
  await page.keyboard.press('Control+S')
  await expect(saveState.filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 12_000 })
  await waitPersistedText(page, expected)
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
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await editor.evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html, plain })
}

async function openExport(page: Page) {
  await page.getByRole('button', { name: 'Abrir exportação' }).click()
  await expect(page.getByRole('dialog', { name: 'Exportar documento' })).toBeVisible()
}

async function downloadFormat(page: Page, name: RegExp): Promise<Download> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name }).click(),
  ])
  return download
}

async function downloadText(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Download sem stream.')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

const RICH_HTML = [
  '<h1>Oficina &amp; memória</h1>',
  '<p><strong>Texto forte</strong> e <em>texto inclinado</em> com <a href="https://example.com/?a=1&amp;b=2">referência</a>.</p>',
  '<blockquote><p>&lt;guardar&gt; &amp; continuar</p></blockquote>',
  '<ul><li><p>primeiro</p><ul><li><p>interno</p></li></ul></li><li><p>segundo</p></li></ul>',
  '<ol start="3"><li><p>terceiro</p></li></ol>',
  '<p>linha um<br>linha dois</p>',
  '<p>&lt;script&gt;alert("não")&lt;/script&gt;</p>',
].join('')

const RICH_PLAIN = [
  'Oficina & memória',
  'Texto forte e texto inclinado com referência.',
  '<guardar> & continuar',
  'primeiro',
  'interno',
  'segundo',
  'terceiro',
  'linha um',
  'linha dois',
  '<script>alert("não")</script>',
].join('\n')

test('painel de exportação oferece três formatos locais e explica o uso', async ({ page }) => {
  await waitReady(page)
  await openExport(page)

  await expect(page.getByText('O arquivo é gerado no navegador')).toBeVisible()
  await expect(page.getByRole('button', { name: /Markdown/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /HTML/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /TXT/ })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Exportar documento' })).toHaveCount(0)
})

test('Markdown preserva títulos, ênfases, links, citações e listas aninhadas', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Mapa de exportação')
  await pasteRichText(page, RICH_HTML, RICH_PLAIN)
  await persistCurrentDraft(page, 'Oficina & memória')
  await openExport(page)

  const download = await downloadFormat(page, /Baixar Markdown/)
  expect(download.suggestedFilename()).toBe('mapa-de-exportacao.md')
  const text = await downloadText(download)

  expect(text).toContain('# Oficina & memória')
  expect(text).toContain('**Texto forte**')
  expect(text).toContain('*texto inclinado*')
  expect(text).toContain('[referência](https://example.com/?a=1&b=2)')
  expect(text).toContain('> <guardar> & continuar')
  expect(text).toContain('- primeiro')
  expect(text).toContain('  - interno')
  expect(text).toContain('3. terceiro')
  expect(text).toContain('linha um  \nlinha dois')
})

test('HTML é autônomo, semântico, escapado e não publica scripts do manuscrito', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'HTML seguro')
  await pasteRichText(page, RICH_HTML, RICH_PLAIN)
  await persistCurrentDraft(page, 'Oficina & memória')
  await openExport(page)

  const download = await downloadFormat(page, /Baixar HTML/)
  expect(download.suggestedFilename()).toBe('html-seguro.html')
  const text = await downloadText(download)

  expect(text).toContain('<!doctype html>')
  expect(text).toContain('<html lang="pt-BR">')
  expect(text).toContain('<title>HTML seguro</title>')
  expect(text).toContain('<h1>Oficina &amp; memória</h1>')
  expect(text).toContain('<strong>Texto forte</strong>')
  expect(text).toContain('<em>texto inclinado</em>')
  expect(text).toContain('<blockquote>')
  expect(text).toContain('<ul>')
  expect(text).toContain('<ol start="3">')
  expect(text).toContain('&lt;script&gt;alert("não")&lt;/script&gt;')
  expect(text).not.toContain('<script>alert("não")</script>')
})

test('TXT mantém uma leitura portátil com hierarquia, citações e marcadores', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Texto portátil')
  await pasteRichText(page, RICH_HTML, RICH_PLAIN)
  await persistCurrentDraft(page, 'Oficina & memória')
  await openExport(page)

  const download = await downloadFormat(page, /Baixar TXT/)
  expect(download.suggestedFilename()).toBe('texto-portatil.txt')
  const text = await downloadText(download)

  expect(text).toContain('OFICINA & MEMÓRIA')
  expect(text).toContain('Texto forte e texto inclinado com referência (https://example.com/?a=1&b=2).')
  expect(text).toContain('> <guardar> & continuar')
  expect(text).toContain('• primeiro')
  expect(text).toContain('  • interno')
  expect(text).toContain('3. terceiro')
  expect(text).toContain('linha um\nlinha dois')
})

test('página vazia ainda exporta título e metadados válidos', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página vazia')
  await openExport(page)

  const markdown = await downloadText(await downloadFormat(page, /Baixar Markdown/))
  expect(markdown).toContain('# Página vazia')
  expect(markdown).toContain('Estado: Rascunho')

  const html = await downloadText(await downloadFormat(page, /Baixar HTML/))
  expect(html).toContain('<title>Página vazia</title>')
  expect(html).toContain('<h1>Página vazia</h1>')

  const txt = await downloadText(await downloadFormat(page, /Baixar TXT/))
  expect(txt).toContain('PÁGINA VAZIA')
  expect(txt).toContain('Estado: Rascunho')
})
