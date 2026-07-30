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
  }).toMatch(/^(persisted|recovery|Alterado|Salvando)$/)

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
  await persistCurrentDraft(page, 'Capítulo & travessia')
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
  const exported = await exportFormat(page, 'txt')
  expect(exported.filename).toBe('pagina-em-branco.txt')
  expect(exported.content).toContain('Página em branco')
  expect(exported.content).toContain('Situação: Rascunho')
})
