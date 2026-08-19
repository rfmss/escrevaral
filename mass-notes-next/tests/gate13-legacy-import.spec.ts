import { expect, test, type Page } from '@playwright/test'

type LegacyManuscript = {
  id: string
  title: string
  text: string
  type?: string
  status?: string
  kind?: string
  templateId?: string
  tags?: string[] | string
  pinned?: boolean
  createdAt?: string
  updatedAt?: string
}

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function openImport(page: Page) {
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await expect(page.locator('.backup-panel')).toBeVisible()
}

function stableSort(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableSort)
  if (!value || typeof value !== 'object') return value
  return Object.keys(value as Record<string, unknown>).sort().reduce<Record<string, unknown>>((result, key) => {
    result[key] = stableSort((value as Record<string, unknown>)[key])
    return result
  }, {})
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function legacyEnvelope(manuscripts: LegacyManuscript[], overrides: Record<string, unknown> = {}) {
  const payload = { activeId: manuscripts[0]?.id ?? null, manuscripts }
  return {
    format: 'esc',
    schemaVersion: 1,
    createdWith: '.esc - editor',
    exportedAt: '2026-07-20T10:00:00.000Z',
    checksum: fnv1a(JSON.stringify(stableSort(payload))),
    payload,
    ...overrides,
  }
}

async function uploadLegacy(page: Page, value: unknown, name = 'acervo-antigo.esc') {
  await page.getByLabel('Selecionar acervo esc legado').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value)),
  })
}

async function readDocumentByLegacyId(page: Page, legacySourceId: string) {
  return page.evaluate(async (sourceId) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const rows = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').index('by-legacy-id').getAll(sourceId)
      request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return rows
  }, legacySourceId)
}

test('arquivo legado válido é pré-visualizado antes de qualquer gravação', async ({ page }) => {
  await waitReady(page)
  const before = await page.locator('.note-card').count()
  await openImport(page)
  await uploadLegacy(page, legacyEnvelope([
    { id: 'legado-1', title: 'Caderno antigo', text: 'Primeiro parágrafo.\n\nSegundo parágrafo.', type: 'manuscrito' },
    { id: 'legado-2', title: 'Poema guardado', text: 'Chuva no telhado', type: 'poema' },
  ]))

  await expect(page.getByRole('heading', { name: 'Prévia do acervo legado' })).toBeVisible()
  await expect(page.getByText('Caderno antigo', { exact: true })).toBeVisible()
  await expect(page.getByText('Poema guardado', { exact: true })).toBeVisible()
  await expect(page.locator('.note-card')).toHaveCount(before)

  await page.getByRole('button', { name: 'Importar como novas cópias' }).click()
  await expect(page.locator('.backup-message')).toContainText('2 documentos importados')
  await expect(page.locator('.note-card')).toHaveCount(before + 2)
  await expect(page.getByText('Caderno antigo — importado', { exact: true })).toBeVisible()
})

test('conversão preserva texto, contexto editorial, estado, tags, favorito e origem', async ({ page }) => {
  await waitReady(page)
  await openImport(page)
  await uploadLegacy(page, legacyEnvelope([{
    id: 'origem-rastreavel',
    title: 'Texto em revisão',
    text: 'Linha com memória.\n\nOutra linha com emoji 🪶.',
    type: 'crônica',
    kind: 'texto-literário',
    templateId: 'cronica-literaria',
    status: 'Em revisão',
    tags: ['Memória', 'memória', 'crônica'],
    pinned: true,
    createdAt: '2024-02-03T10:00:00.000Z',
  }]))
  await page.getByRole('button', { name: 'Importar como novas cópias' }).click()
  await page.getByText('Texto em revisão — importado', { exact: true }).click()

  await expect(page.locator('.ProseMirror')).toContainText('Outra linha com emoji 🪶.')
  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Página favorita' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Em corte', exact: true }).last()).toHaveClass(/active/)
  await expect(page.getByRole('button', { name: 'Remover marcador Memória' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Remover marcador crônica' })).toBeVisible()

  const rows = await readDocumentByLegacyId(page, 'origem-rastreavel')
  expect(rows).toHaveLength(1)
  expect(rows[0].title).toBe('Texto em revisão — importado')
  expect(rows[0].type).toBe('crônica')
  expect(rows[0].kind).toBe('texto-literário')
  expect(rows[0].templateId).toBe('cronica-literaria')
})

test('cancelar a prévia não altera a biblioteca', async ({ page }) => {
  await waitReady(page)
  const before = await page.locator('.note-card').count()
  await openImport(page)
  await uploadLegacy(page, legacyEnvelope([{ id: 'cancelado', title: 'Não importar', text: 'Rascunho.' }]))
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByRole('heading', { name: 'Prévia do acervo legado' })).toHaveCount(0)
  await expect(page.locator('.note-card')).toHaveCount(before)
  expect(await readDocumentByLegacyId(page, 'cancelado')).toHaveLength(0)
})

test('assinatura inválida e extensão errada são rejeitadas sem gravação', async ({ page }) => {
  await waitReady(page)
  const before = await page.locator('.note-card').count()
  await openImport(page)
  const corrupt = legacyEnvelope([{ id: 'corrompido', title: 'Corrompido', text: 'Texto.' }], { checksum: '00000000' })
  await uploadLegacy(page, corrupt)
  await expect(page.locator('.backup-message')).toContainText('assinatura')
  await expect(page.locator('.note-card')).toHaveCount(before)

  await uploadLegacy(page, legacyEnvelope([{ id: 'extensao', title: 'Extensão', text: 'Texto.' }]), 'arquivo.json')
  await expect(page.locator('.backup-message')).toContainText('extensão .esc')
  await expect(page.locator('.note-card')).toHaveCount(before)
})

test('versão futura e identificadores duplicados invalidam o lote inteiro', async ({ page }) => {
  await waitReady(page)
  const before = await page.locator('.note-card').count()
  await openImport(page)
  await uploadLegacy(page, legacyEnvelope([{ id: 'futuro', title: 'Futuro', text: 'Texto.' }], { schemaVersion: 99 }))
  await expect(page.locator('.backup-message')).toContainText('Versão legada não suportada')

  await uploadLegacy(page, legacyEnvelope([
    { id: 'duplicado', title: 'Primeiro', text: 'Um.' },
    { id: 'duplicado', title: 'Segundo', text: 'Dois.' },
  ]))
  await expect(page.locator('.backup-message')).toContainText('Identificador legado duplicado')
  await expect(page.locator('.note-card')).toHaveCount(before)
  expect(await readDocumentByLegacyId(page, 'duplicado')).toHaveLength(0)
})

test('prévia legada cabe no drawer móvel e continua cancelável', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await openImport(page)
  await uploadLegacy(page, legacyEnvelope([{ id: 'mobile', title: 'Acervo móvel com título comprido para testar quebra segura', text: 'Texto.' }]))

  const preview = page.locator('.legacy-import-preview')
  await expect(preview).toBeVisible()
  const geometry = await preview.evaluate((node) => ({
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
  expect(geometry.overflow).toBeLessThanOrEqual(1)
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(preview).not.toBeVisible()
})
