import { expect, test } from '@playwright/test'

async function waitReady(page: import('@playwright/test').Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

test('Gate 29: shell offline e manifesto ficam locais e versionados', async ({ request }) => {
  const worker = await request.get('/service-worker.js')
  expect(worker.ok()).toBe(true)
  const source = await worker.text()
  expect(source).toContain("const CACHE_PREFIX = 'escrevaral-paper-home-offline-'")
  expect(source).toContain("request.mode === 'navigate'")
  expect(source).toContain("type === 'SKIP_WAITING'")

  const manifest = await request.get('/manifest.webmanifest')
  expect(manifest.ok()).toBe(true)
  const payload = await manifest.json()
  expect(payload.name).toContain('Escrevaral')
  expect(payload.start_url).toBe('./')
  expect(payload.scope).toBe('./')
  expect(payload.display).toBe('standalone')
})

test('Gate 29: lembrete de cópia abre o BackupPanel existente sem duplicar UI', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('escrevaral-offline-page-mark-v1', 'pagina-anterior')
    sessionStorage.setItem('escrevaral-offline-reload-count-v1', '1')
    sessionStorage.removeItem('escrevaral-offline-backup-dismissed-v1')
    localStorage.removeItem('escrevaral-mass-notes-next-last-backup-v1')
  })

  await waitReady(page)
  const nudge = page.locator('.offline-feedback-backup')
  await expect(nudge).toBeVisible()
  await expect(nudge).toContainText('cópia de segurança')
  expect(await page.locator('.backup-panel').count()).toBe(1)

  await nudge.getByRole('button', { name: 'Abrir cópia' }).click()
  await expect(page.locator('.backup-panel')).toBeVisible()
  await expect(page.getByRole('tab', { name: 'ferramentas', exact: true })).toHaveAttribute('aria-selected', 'true')
})

test('Gate 29: exportar a cópia registra a data do último backup', async ({ page }) => {
  await waitReady(page)
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await expect(page.locator('.backup-panel')).toBeVisible()

  const download = page.waitForEvent('download')
  await page.locator('[data-backup-action="create"]').click()
  await download

  const exportedAt = await page.evaluate(() => Number(localStorage.getItem('escrevaral-mass-notes-next-last-backup-v1')))
  expect(exportedAt).toBeGreaterThan(0)
  expect(Date.now() - exportedAt).toBeLessThan(10_000)
})

test('Gate 29: recuperação local informa o usuário e mantém o rascunho', async ({ page }) => {
  await waitReady(page)

  const recoveredText = 'Trecho recuperado depois de uma interrupção.'
  await page.evaluate(async (text) => {
    const request = indexedDB.open('escrevaral-mass-notes-next')
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const transaction = db.transaction('documents', 'readonly')
    const documents = transaction.objectStore('documents')
    const allRequest = documents.getAll()
    const rows = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
      allRequest.onsuccess = () => resolve(allRequest.result as Array<Record<string, unknown>>)
      allRequest.onerror = () => reject(allRequest.error)
    })
    const current = rows.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))[0]
    if (!current) throw new Error('Documento para recuperação não encontrado.')
    const document = {
      ...current,
      plainText: text,
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
      updatedAt: Number(current.updatedAt) + 10_000,
    }
    localStorage.setItem('escrevaral-mass-notes-next-recovery', JSON.stringify({ capturedAt: Date.now(), document }))
    localStorage.setItem('escrevaral-mass-notes-next-active', String(current.id))
    db.close()
  }, recoveredText)

  await page.reload()
  await expect(page.locator('.offline-feedback-recovery')).toContainText('Rascunho local recuperado')
  await expect(page.locator('.ProseMirror')).toContainText(recoveredText)
})
