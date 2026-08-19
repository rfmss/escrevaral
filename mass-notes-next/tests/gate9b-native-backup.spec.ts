import { expect, test, type Download, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function openBackup(page: Page) {
  await page.getByRole('button', { name: 'Abrir oficina de ferramentas' }).click()
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await expect(page.locator('.backup-panel')).toBeVisible()
}

async function readDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

function nativeDocument(id: string, title: string) {
  return {
    id,
    title,
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Capítulo restaurado' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Texto preservado com acento, emoji 🧵 e saudade.' }] },
      ],
    },
    plainText: 'Capítulo restaurado\n\nTexto preservado com acento, emoji 🧵 e saudade.',
    status: 'Em corte',
    tags: ['romance', 'teste'],
    favorite: true,
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_100_000,
    revision: 7,
    legacySourceId: null,
  }
}

function envelope(documents: ReturnType<typeof nativeDocument>[]) {
  return {
    schema: 'escrevaral.mass-notes-next.backup',
    version: 1,
    exportedAt: 1_800_000_000_000,
    app: 'mass-notes-next',
    documents,
  }
}

test('cópia nativa exporta envelope versionado com toda a biblioteca', async ({ page }) => {
  await waitReady(page)
  await page.getByLabel('Título do documento').fill('Título ainda no rascunho')
  await openBackup(page)

  const downloadPromise = page.waitForEvent('download')
  await page.locator('[data-backup-action="create"]').click()
  const download = await downloadPromise
  const parsed = JSON.parse(await readDownload(download))

  expect(download.suggestedFilename()).toMatch(/^escrevaral-copia-.*\.esc\.json$/)
  expect(parsed.schema).toBe('escrevaral.mass-notes-next.backup')
  expect(parsed.version).toBe(1)
  expect(parsed.app).toBe('mass-notes-next')
  expect(parsed.documents.length).toBeGreaterThanOrEqual(2)
  expect(parsed.documents.some((item: { title?: string }) => item.title === 'Título ainda no rascunho')).toBe(true)
})

test('restauração válida cria novas cópias sem substituir a biblioteca atual', async ({ page }) => {
  await waitReady(page)
  const beforeCount = await page.locator('.note-card').count()
  const currentTitle = await page.getByLabel('Título do documento').inputValue()
  await openBackup(page)

  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'biblioteca.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(envelope([
      nativeDocument('origem-a', 'Documento A'),
      nativeDocument('origem-b', 'Documento B'),
    ]))),
  })

  await expect(page.locator('.backup-message')).toContainText('2 documentos restaurados')
  await expect(page.locator('.note-card')).toHaveCount(beforeCount + 2)
  await expect(page.getByText('Documento A — restaurado', { exact: true })).toBeVisible()
  await expect(page.getByText('Documento B — restaurado', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toHaveValue(currentTitle)
})

test('documento restaurado preserva estrutura Tiptap e metadados editoriais', async ({ page }) => {
  await waitReady(page)
  await openBackup(page)
  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'estrutura.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(envelope([nativeDocument('origem-estrutura', 'Estrutura nativa')]))),
  })

  await expect(page.getByText('Estrutura nativa — restaurado', { exact: true })).toBeVisible()
  await page.getByText('Estrutura nativa — restaurado', { exact: true }).click()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Estrutura nativa — restaurado')
  await expect(page.locator('.ProseMirror h2')).toHaveText('Capítulo restaurado')
  await expect(page.locator('.ProseMirror')).toContainText('emoji 🧵 e saudade')
  await expect(page.getByText('Em corte', { exact: true }).first()).toBeVisible()
})

test('arquivo inválido é rejeitado antes de qualquer gravação', async ({ page }) => {
  await waitReady(page)
  const beforeCount = await page.locator('.note-card').count()
  await openBackup(page)

  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'corrompido.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schema":"escrevaral.mass-notes-next.backup","version":1,"documents":[{"id":"quebrado"}]}'),
  })

  await expect(page.locator('.backup-message')).toContainText(/origem|data|documento/i)
  await expect(page.locator('.note-card')).toHaveCount(beforeCount)
})

test('versão futura e identificadores duplicados são recusados', async ({ page }) => {
  await waitReady(page)
  const beforeCount = await page.locator('.note-card').count()
  await openBackup(page)

  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'futuro.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ ...envelope([nativeDocument('a', 'A')]), version: 99 })),
  })
  await expect(page.locator('.backup-message')).toContainText('Versão de cópia não suportada')

  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'duplicado.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(envelope([
      nativeDocument('mesmo-id', 'Primeiro'),
      nativeDocument('mesmo-id', 'Segundo'),
    ]))),
  })
  await expect(page.locator('.backup-message')).toContainText('Identificador duplicado')
  await expect(page.locator('.note-card')).toHaveCount(beforeCount)
})

test('painel de backup permanece utilizável no drawer móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()

  const panel = page.locator('.backup-panel')
  await expect(panel).toBeVisible()
  const fits = await panel.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return rect.left >= 0 && rect.right <= window.innerWidth && document.documentElement.scrollWidth <= window.innerWidth
  })
  expect(fits).toBe(true)
  await expect(page.locator('[data-backup-action]')).toHaveCount(3)
})
