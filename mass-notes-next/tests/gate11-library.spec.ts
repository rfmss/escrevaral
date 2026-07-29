import { expect, test, type Page } from '@playwright/test'

type SeedDocument = {
  id: string
  title: string
  plainText: string
  content: {
    type: 'doc'
    content: Array<{
      type: 'paragraph'
      content?: Array<{ type: 'text'; text: string }>
    }>
  }
  status: 'Rascunho' | 'Em corte' | 'Pronto'
  tags: string[]
  favorite: boolean
  createdAt: number
  updatedAt: number
  revision: number
  legacySourceId: null
}

function makeDocument(
  id: string,
  title: string,
  options: Partial<Omit<SeedDocument, 'id' | 'title' | 'content' | 'plainText'>> & { text?: string } = {},
): SeedDocument {
  const text = options.text ?? `Texto de ${title}`
  return {
    id,
    title,
    plainText: text,
    content: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : undefined,
      }],
    },
    status: options.status ?? 'Rascunho',
    tags: options.tags ?? [],
    favorite: options.favorite ?? false,
    createdAt: options.createdAt ?? Date.now(),
    updatedAt: options.updatedAt ?? Date.now(),
    revision: options.revision ?? 1,
    legacySourceId: null,
  }
}

function standardDocuments(): SeedDocument[] {
  const now = Date.now()
  return [
    makeDocument('active-open', 'Caderno aberto', {
      text: 'Rascunho ativo sobre lembranças do quintal.',
      status: 'Rascunho',
      tags: ['memória'],
      createdAt: now - 6 * 86_400_000,
      updatedAt: now - 5 * 60_000,
    }),
    makeDocument('water-deep', 'Água funda', {
      text: 'Um poema atravessa o mar e volta pela chuva.',
      status: 'Pronto',
      tags: ['Poesia', 'mar'],
      favorite: true,
      createdAt: now - 4 * 86_400_000,
      updatedAt: now - 2 * 3_600_000,
    }),
    makeDocument('living-city', 'Cidade viva', {
      text: 'Ensaio sobre a cidade, suas janelas e calçadas.',
      status: 'Pronto',
      tags: ['ensaio'],
      favorite: true,
      createdAt: now - 1 * 86_400_000,
      updatedAt: now - 1 * 86_400_000,
    }),
    makeDocument('endless-sea', 'Mar sem fim', {
      text: 'Versos de travessia e retorno.',
      status: 'Em corte',
      tags: ['poesia', 'travessia'],
      favorite: true,
      createdAt: now - 2 * 86_400_000,
      updatedAt: now - 30 * 60_000,
    }),
  ]
}

async function waitReady(page: Page) {
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function seedLibrary(page: Page, documents: SeedDocument[], activeId = documents[0].id) {
  await page.goto('/')
  await waitReady(page)
  await page.evaluate(async ({ rows, active }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite')
      const store = tx.objectStore('documents')
      store.clear()
      for (const row of rows) store.put(row)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
    localStorage.setItem('escrevaral-mass-notes-next-active', active)
    localStorage.removeItem('escrevaral-mass-notes-next-recovery')
  }, { rows: documents, active: activeId })
  await page.reload()
  await waitReady(page)
  await expect(page.locator('.note-card')).toHaveCount(documents.length)
}

function statusFilters(page: Page) {
  return page.getByRole('group', { name: 'Filtrar por estado' })
}

function tagFilter(page: Page) {
  return page.getByRole('combobox', { name: 'Filtrar por tag', exact: true })
}

function sortControl(page: Page) {
  return page.getByRole('combobox', { name: 'Ordenar páginas', exact: true })
}

async function visibleTitles(page: Page): Promise<string[]> {
  return page.locator('.note-title-text').allTextContents()
}

test('combina busca, estado, favorito e tag sem trocar a página ativa', async ({ page }) => {
  await seedLibrary(page, standardDocuments())

  await page.getByLabel('Buscar documentos').fill('agua')
  await statusFilters(page).getByRole('button', { name: 'Pronto', exact: true }).click()
  await page.getByRole('button', { name: 'Somente favoritas' }).click()
  await tagFilter(page).selectOption({ label: 'Poesia' })

  await expect(page.locator('.note-card')).toHaveCount(1)
  await expect(page.locator('.note-title-text')).toContainText('Água funda')
  await expect(page.getByText('1 de 4 páginas', { exact: true })).toBeVisible()
  await expect(page.getByText('A página ativa continua aberta, mas está fora deste recorte.')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Caderno aberto')
  await expect(page.locator('.ProseMirror')).toContainText('lembranças do quintal')
})

test('ordena por alteração, criação e título com desempate previsível', async ({ page }) => {
  await seedLibrary(page, standardDocuments())

  expect(await visibleTitles(page)).toEqual(['Caderno aberto', 'Mar sem fim', 'Água funda', 'Cidade viva'])

  await sortControl(page).selectOption('created-desc')
  expect(await visibleTitles(page)).toEqual(['Cidade viva', 'Mar sem fim', 'Água funda', 'Caderno aberto'])

  await sortControl(page).selectOption('title-asc')
  expect(await visibleTitles(page)).toEqual(['Água funda', 'Caderno aberto', 'Cidade viva', 'Mar sem fim'])
})

test('deduplica tags por acento e caixa e combina tag com favoritas', async ({ page }) => {
  await seedLibrary(page, standardDocuments())

  const tagOptions = await tagFilter(page).locator('option').allTextContents()
  expect(tagOptions.filter((option) => option.toLocaleLowerCase('pt-BR') === 'poesia')).toHaveLength(1)

  await tagFilter(page).selectOption({ label: 'Poesia' })
  await expect(page.locator('.note-card')).toHaveCount(2)
  await expect(page.locator('.note-card').filter({ hasText: 'Água funda' }).locator('.note-tags > span').first()).toHaveText('Poesia')
  await expect(page.locator('.note-card').filter({ hasText: 'Mar sem fim' }).locator('.note-tags > span').first()).toHaveText('poesia')

  await page.getByRole('button', { name: 'Somente favoritas' }).click()
  await expect(page.locator('.note-card')).toHaveCount(2)
  await expect(page.getByText('2 de 4 páginas', { exact: true })).toBeVisible()
})

test('estado vazio explica o recorte e limpar filtros restaura a biblioteca', async ({ page }) => {
  await seedLibrary(page, standardDocuments())

  await page.getByLabel('Buscar documentos').fill('texto inexistente')
  await statusFilters(page).getByRole('button', { name: 'Pronto', exact: true }).click()

  await expect(page.locator('.note-card')).toHaveCount(0)
  await expect(page.getByText('Nenhuma página neste recorte.')).toBeVisible()
  await expect(page.getByText('0 de 4 páginas', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Limpar filtros' }).first().click()
  await expect(page.locator('.note-card')).toHaveCount(4)
  await expect(page.getByLabel('Buscar documentos')).toHaveValue('')
  await expect(statusFilters(page).getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('mudar filtros não perde o rascunho ativo nem força troca de documento', async ({ page }) => {
  await seedLibrary(page, standardDocuments())

  await page.getByLabel('Título do documento').fill('Rascunho ainda aberto')
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Trecho que precisa sobreviver à organização da biblioteca.')

  await statusFilters(page).getByRole('button', { name: 'Pronto', exact: true }).click()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Rascunho ainda aberto')
  await expect(editor).toContainText('sobreviver à organização')
  await expect(page.getByText('A página ativa continua aberta, mas está fora deste recorte.')).toBeVisible()

  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.locator('.field-value').filter({ hasText: 'Salvo' })).toBeVisible({ timeout: 10_000 })
  await page.reload()
  await waitReady(page)
  await expect(page.getByLabel('Título do documento')).toHaveValue('Rascunho ainda aberto')
  await expect(page.locator('.ProseMirror')).toContainText('sobreviver à organização')
})

test('biblioteca extensa preserva Unicode e títulos repetidos com ordem estável', async ({ page }) => {
  const now = Date.now()
  const documents = Array.from({ length: 22 }, (_, index) => makeDocument(
    `chapter-${index}`,
    `Capítulo ${String(index + 1).padStart(2, '0')}`,
    {
      tags: [index % 2 ? 'ficção' : 'Brasil'],
      createdAt: now - index * 60_000,
      updatedAt: now - index * 30_000,
    },
  ))
  documents.push(
    makeDocument('orbit-new', 'Órbita', { tags: ['novo'], updatedAt: now - 1_000, createdAt: now - 5_000 }),
    makeDocument('orbit-old', 'Órbita', { tags: ['antigo'], updatedAt: now - 9_000, createdAt: now - 10_000 }),
  )

  await seedLibrary(page, documents, 'chapter-0')
  await expect(page.locator('.note-card')).toHaveCount(24)

  await page.getByLabel('Buscar documentos').fill('orbita')
  await sortControl(page).selectOption('title-asc')
  const repeated = page.locator('.note-card').filter({ hasText: 'Órbita' })
  await expect(repeated).toHaveCount(2)
  await expect(repeated.first().locator('.note-tags')).toContainText('novo')
  await expect(repeated.nth(1).locator('.note-tags')).toContainText('antigo')
})

test('drawer móvel mantém filtros utilizáveis, sem overflow e com foco reversível', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedLibrary(page, standardDocuments())

  const trigger = page.getByRole('button', { name: 'Abrir arquivo' })
  await trigger.click()
  const library = page.getByRole('dialog', { name: 'Arquivo de documentos' })
  await expect(library).toBeVisible()
  await expect(sortControl(page)).toBeVisible()
  await expect(tagFilter(page)).toBeVisible()

  await statusFilters(page).getByRole('button', { name: 'Em corte', exact: true }).click()
  await expect(page.locator('.note-card')).toHaveCount(1)
  await expect(page.locator('.note-title-text')).toContainText('Mar sem fim')

  const geometry = await library.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    return {
      left: rect.left,
      right: rect.right,
      width: rect.width,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      viewport: document.documentElement.clientWidth,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  expect(geometry.left).toBeGreaterThanOrEqual(-1)
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + 1)
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1)

  await page.keyboard.press('Escape')
  await expect(library).not.toBeVisible()
  await expect(trigger).toBeFocused()
})
