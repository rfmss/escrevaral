import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.chapter').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.chapter')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function ensureToolsOpen(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  if (await dialog.isVisible().catch(() => false)) return dialog
  if (await page.locator('body.focus-mode').count()) await page.keyboard.press('Escape')
  const launcher = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  await expect(dialog).toBeVisible()
  return dialog
}

async function openProof(page: Page) {
  const dialog = await ensureToolsOpen(page)
  const tab = dialog.getByRole('tab', { name: 'ferramentas', exact: true })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  const panel = dialog.locator('.proof-panel')
  await expect(panel).toBeVisible()
  return panel
}

async function typeOrganically(page: Page, value: string) {
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.type(value, { delay: 55 })
  await expect(editor).toContainText(value)
}

async function storedProofJson(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-authorship-proof', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const rows = await new Promise<unknown[]>((resolve, reject) => {
      const request = db.transaction('proofs').objectStore('proofs').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return JSON.stringify(rows)
  })
}

test('Autoria começa neutra e não promete prova antes de haver escrita orgânica', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Autoria vazia')
  const panel = await openProof(page)

  await expect(panel).toContainText(/não guarda as teclas nem o conteúdo digitado/i)
  await expect(panel.getByRole('button', { name: 'Baixar .prova.esc' })).toBeDisabled()
  await expect(panel.locator('.proof-summary')).toContainText(/0|—/)
  await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' }).getByRole('tab')).toHaveCount(7)
})

test('digitação real forma cadência e persiste sem texto literal', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Cadência local')
  const secret = 'Frase privada que jamais pode entrar no registro de autoria.'
  await typeOrganically(page, secret)
  const panel = await openProof(page)

  await expect(panel.locator('.proof-summary > div').first().locator('strong')).not.toHaveText('0')
  await expect(panel.getByRole('button', { name: 'Baixar .prova.esc' })).toBeEnabled()

  await expect.poll(() => storedProofJson(page), { timeout: 8_000 }).not.toBe('[]')
  const stored = await storedProofJson(page)
  expect(stored).not.toContain(secret)
  expect(stored).not.toContain('Frase privada')
  expect(stored).toContain('keyType')
})

test('arquivo .prova.esc contém hash e eventos tipados, nunca o manuscrito', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Arquivo de autoria')
  const secret = 'Conteúdo reservado para provar que o arquivo guarda somente evidência indireta e hash.'
  await typeOrganically(page, secret)
  const panel = await openProof(page)

  await panel.getByLabel('Nome para a declaração de autoria').fill('Pessoa Teste')
  await panel.getByLabel('Nome artístico para a declaração de autoria').fill('P. Teste')
  await panel.getByRole('button', { name: 'Registrar assinatura' }).click()
  await expect(panel.getByRole('status')).toContainText(/assinatura local registrada/i)

  const downloadPromise = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'Baixar .prova.esc' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.prova\.esc$/)
  const path = await download.path()
  expect(path).not.toBeNull()
  const raw = await readFile(path!, 'utf8')
  const proof = JSON.parse(raw) as {
    format?: string
    manuscript?: { textHash?: string; wordCount?: number }
    declaration?: { author?: string; artisticName?: string }
    events?: Array<Record<string, unknown>>
  }

  expect(proof.format).toBe('vereda.proof.v2')
  expect(proof.manuscript?.textHash).toMatch(/^[a-f0-9]{64}$|^fallback-/)
  expect(proof.manuscript?.wordCount).toBeGreaterThan(0)
  expect(proof.declaration?.author).toBe('Pessoa Teste')
  expect(proof.declaration?.artisticName).toBe('P. Teste')
  expect(raw).not.toContain(secret)
  expect(proof.events?.length).toBeGreaterThan(1)
  expect(proof.events?.every((event) => !('key' in event) && 'keyType' in event)).toBe(true)
})

test('colar texto gera movimento estrutural com delta de palavras', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Colagem registrada')
  await editor.evaluate((element) => {
    const transfer = new DataTransfer()
    transfer.setData('text/plain', 'bloco colado com cinco palavras novas')
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  })
  await expect(editor).toContainText('bloco colado com cinco palavras novas')

  const panel = await openProof(page)
  await expect(panel.locator('.proof-recent')).toContainText(/paste/i)
  await expect(panel.locator('.proof-recent')).toContainText(/Δ \+6 pal/i)
})

test('nova sessão preserva histórico e zera somente a sessão ativa', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Duas sessões')
  await typeOrganically(page, 'Primeira sessão com cadência humana registrada neste navegador.')
  const panel = await openProof(page)
  await expect(panel.getByRole('button', { name: 'Baixar .prova.esc' })).toBeEnabled()

  await panel.getByRole('button', { name: 'Nova sessão' }).click()
  await expect(panel.getByRole('status')).toContainText(/nova sessão de autoria iniciada/i)
  await expect(panel.locator('.proof-summary > div').nth(3).locator('strong')).toHaveText('2')
  await expect(panel.locator('.proof-history')).toContainText(/Sessões anteriores \(1\)/i)
  await expect(panel.getByRole('button', { name: 'Baixar .prova.esc' })).toBeDisabled()
})

test('Autoria permanece contida no drawer móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' })).toBeVisible()
  const panel = await openProof(page)
  await expect(panel).toBeVisible()

  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.documentElement.scrollWidth,
    rail: document.querySelector('.rail')?.scrollWidth ?? 0,
    railClient: document.querySelector('.rail')?.clientWidth ?? 0,
  }))
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport)
  expect(sizes.rail).toBeLessThanOrEqual(sizes.railClient)
})
