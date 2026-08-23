import { expect, test, type Page } from '@playwright/test'

const REVIEW_HTML = [
  '<p>🌿 A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.</p>',
  '<p>Ela tentou mas não conseguiu terminar a revisão antes do café.</p>',
  '<p>Depois, releu as páginas com calma, conferiu os títulos e guardou o arquivo para continuar no fim da tarde.</p>',
].join('')

const REVIEW_TEXT = [
  '🌿 A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.',
  'Ela tentou mas não conseguiu terminar a revisão antes do café.',
  'Depois, releu as páginas com calma, conferiu os títulos e guardou o arquivo para continuar no fim da tarde.',
].join('\n\n')

async function openDesktopTools(page: Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width <= 820) return

  const metadata = page.locator('.metadata-editor')
  if (await metadata.isVisible()) return

  const workshop = page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })
  if (await workshop.isVisible()) await workshop.click()

  const trigger = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  if (await trigger.isVisible()) await trigger.click()

  await expect(metadata).toBeVisible()
}

async function openDesktopLibrary(page: Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width <= 820) return

  const library = page.getByRole('dialog', { name: 'Arquivo de documentos' })
  if (await library.isVisible()) return

  const trigger = page.getByRole('button', { name: 'Abrir biblioteca local' })
  await expect(trigger).toBeVisible()
  await trigger.click()
  await expect(library).toBeVisible()
}

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  const viewport = page.viewportSize()
  if (!viewport || viewport.width > 820) {
    await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
  }
  await openDesktopTools(page)
}

async function waitSaved(page: Page) {
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando/ })).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.field-value').filter({ hasText: 'Salvo' })).toBeVisible({ timeout: 10_000 })
}

async function activeDocumentId(page: Page): Promise<string> {
  const title = await page.getByLabel('Título do documento').inputValue()
  return page.evaluate(async (activeTitle) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const rows = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').getAll()
      request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>)
      request.onerror = () => reject(request.error)
    })
    db.close()

    const remembered = localStorage.getItem('escrevaral-mass-notes-next-active')
    const byRemembered = remembered ? rows.find((row) => row.id === remembered) : undefined
    const byTitle = rows.find((row) => String(row.title ?? '') === activeTitle)
    const fallback = [...rows].sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt))[0]
    const id = byRemembered?.id ?? byTitle?.id ?? fallback?.id
    if (typeof id !== 'string' || !id) throw new Error('Documento ativo ausente.')
    return id
  }, title)
}

async function activeRecord(page: Page) {
  const id = await activeDocumentId(page)
  return page.evaluate(async (documentId) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const row = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').get(documentId)
      request.onsuccess = () => resolve(request.result as Record<string, unknown>)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return row
  }, id)
}

async function publishRemoteMetadata(page: Page, changes: { favorite?: boolean; tags?: string[]; status?: string }) {
  const id = await activeDocumentId(page)
  await page.evaluate(async ({ documentId, patch }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const current = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').get(documentId)
      request.onsuccess = () => resolve(request.result as Record<string, unknown>)
      request.onerror = () => reject(request.error)
    })
    const next = {
      ...current,
      ...patch,
      updatedAt: Date.now(),
      revision: Number(current.revision) + 1,
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite')
      tx.objectStore('documents').put(next)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
    const channel = new BroadcastChannel('escrevaral-mass-notes-next-documents')
    channel.postMessage({ id: documentId, revision: next.revision, kind: 'metadata' })
    channel.close()
  }, { documentId: id, patch: changes })
}

async function prepareReview(page: Page) {
  await page.getByLabel('Título do documento').fill('Metadados sem apagar leitura')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await editor.evaluate((element, payload) => {
    const transfer = new DataTransfer()
    transfer.setData('text/html', payload.html)
    transfer.setData('text/plain', payload.plain)
    const event = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: transfer })
    element.dispatchEvent(event)
  }, { html: REVIEW_HTML, plain: REVIEW_TEXT })
  await waitSaved(page)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.locator('[data-review-issue-id*="PONT-49"]').filter({ hasText: 'tentou mas' })).toHaveCount(1, { timeout: 15_000 })
}

test('favorito usa a mesma revisão, autosave e filtro da biblioteca', async ({ page }) => {
  await waitReady(page)
  const title = await page.getByLabel('Título do documento').inputValue()
  const before = await activeRecord(page)

  await page.getByRole('button', { name: 'Marcar como favorita' }).click()
  await expect(page.getByRole('button', { name: 'Página favorita' })).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => Number((await activeRecord(page)).revision), { timeout: 10_000 }).toBe(Number(before.revision) + 1)
  await expect(page.locator('.field-value').filter({ hasText: 'Salvo' })).toBeVisible()

  const after = await activeRecord(page)
  expect(after.favorite).toBe(true)

  await page.reload()
  await openDesktopTools(page)
  await expect(page.getByRole('button', { name: 'Página favorita' })).toBeVisible()
  await openDesktopLibrary(page)
  await page.getByRole('button', { name: 'Somente favoritas' }).click()
  await expect(page.locator('.note-title-text')).toContainText(title || 'Sem título')
})

test('marcadores são aplicados atomicamente, deduplicados e persistidos', async ({ page }) => {
  await waitReady(page)
  const input = page.getByLabel('Marcadores da página')
  await input.fill('Poesia, poesia, MEMÓRIA, memória, ensaio')
  await page.getByRole('button', { name: 'Salvar marcadores' }).click()

  await expect(page.locator('.metadata-tag-list button')).toHaveCount(3)
  await expect(input).toHaveValue('Poesia, MEMÓRIA, ensaio')
  await waitSaved(page)

  await page.reload()
  await openDesktopTools(page)
  await expect(page.getByLabel('Marcadores da página')).toHaveValue('Poesia, MEMÓRIA, ensaio')
  await openDesktopLibrary(page)
  const options = await page.getByRole('combobox', { name: 'Filtrar por tag' }).locator('option').allTextContents()
  expect(options.filter((item) => item.toLocaleLowerCase('pt-BR') === 'poesia')).toHaveLength(1)
  expect(options.filter((item) => item.toLocaleLowerCase('pt-BR') === 'memória')).toHaveLength(1)
})

test('limites de marcadores e remoção unitária permanecem previsíveis', async ({ page }) => {
  await waitReady(page)
  const tags = [
    'um-marcador-com-mais-de-trinta-e-dois-caracteres',
    'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  ]
  await page.getByLabel('Marcadores da página').fill(tags.join(', '))
  await page.getByRole('button', { name: 'Salvar marcadores' }).click()
  await expect(page.locator('.metadata-tag-list button')).toHaveCount(8)

  const first = await page.locator('.metadata-tag-list button').first().locator('span').first().textContent()
  expect(first?.length).toBe(32)
  await page.getByRole('button', { name: 'Remover marcador dois' }).click()
  await expect(page.locator('.metadata-tag-list button')).toHaveCount(7)
  await waitSaved(page)

  await page.reload()
  await openDesktopTools(page)
  await expect(page.locator('.metadata-tag-list button')).toHaveCount(7)
  await expect(page.getByRole('button', { name: 'Remover marcador dois' })).toHaveCount(0)
})

test('estado, favorito e tags não apagam uma leitura linguística válida', async ({ page }) => {
  await waitReady(page)
  await prepareReview(page)
  const decoration = page.locator('[data-review-issue-id*="PONT-49"]').filter({ hasText: 'tentou mas' })

  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  const pulse = page.locator('#panel-pulso')
  await pulse.getByRole('button', { name: 'Pronto', exact: true }).click()
  await pulse.getByRole('button', { name: 'Marcar como favorita' }).click()
  await pulse.getByLabel('Marcadores da página').fill('revisado, oficina')
  await pulse.getByRole('button', { name: 'Salvar marcadores' }).click()

  await expect(decoration).toHaveCount(1)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await expect(page.locator('.review-located-card')).toContainText('tentou mas')
  await expect(page.locator('#panel-revisao .review-message')).not.toContainText('O texto mudou')
  await waitSaved(page)
})

test('metadado remoto limpo atualiza a página sem desmontar editor ou decorations', async ({ page }) => {
  await waitReady(page)
  await prepareReview(page)
  const editor = page.locator('.ProseMirror')
  const htmlBefore = await editor.innerHTML()

  await publishRemoteMetadata(page, { favorite: true, tags: ['remoto'], status: 'Pronto' })
  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  const pulse = page.locator('#panel-pulso')
  await expect(pulse.getByRole('button', { name: 'Página favorita' })).toBeVisible()
  await expect(pulse.getByRole('button', { name: 'Remover marcador remoto' })).toBeVisible()
  await expect(pulse.getByRole('button', { name: 'Pronto', exact: true })).toHaveClass(/active/)
  expect(await editor.innerHTML()).toBe(htmlBefore)
  await expect(page.locator('[data-review-issue-id*="PONT-49"]').filter({ hasText: 'tentou mas' })).toHaveCount(1)
})

test('conflito de metadados nunca faz merge silencioso e pode virar cópia', async ({ page }) => {
  await waitReady(page)
  const originalTitle = await page.getByLabel('Título do documento').inputValue()

  await page.getByRole('button', { name: 'Marcar como favorita' }).click()
  await publishRemoteMetadata(page, { tags: ['outra-aba'], status: 'Em corte' })

  const banner = page.getByRole('alert')
  await expect(banner).toContainText('Outra aba também alterou esta página')
  await banner.getByRole('button', { name: 'Guardar a minha como cópia' }).click()

  await expect(page.getByLabel('Título do documento')).toHaveValue(`${originalTitle || 'Sem título'} — conflito`)
  await expect(page.getByRole('button', { name: 'Página favorita' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remover marcador outra-aba' })).toHaveCount(0)
  await expect(page.locator('.field-value').filter({ hasText: 'Salvo' })).toBeVisible({ timeout: 10_000 })
})

test('editor de metadados cabe no drawer móvel e mantém foco reversível', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  const trigger = page.getByRole('button', { name: 'Abrir ferramentas' })
  await trigger.click()
  const rail = page.getByRole('dialog', { name: 'Ferramentas do texto' })

  await expect(page.getByRole('button', { name: 'Marcar como favorita' })).toBeVisible()
  await expect(page.getByLabel('Marcadores da página')).toBeVisible()
  await page.getByLabel('Marcadores da página').fill('mobile, seguro')
  await page.getByRole('button', { name: 'Salvar marcadores' }).click()
  await expect(page.locator('.metadata-tag-list button')).toHaveCount(2)

  const geometry = await rail.evaluate((node) => ({
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1)

  await page.keyboard.press('Escape')
  await expect(rail).not.toBeVisible()
  await expect(trigger).toBeFocused()
})
