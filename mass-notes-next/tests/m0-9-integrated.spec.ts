import { expect, test, type Download, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function waitSaved(page: Page) {
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando|Salvo/ })).toBeVisible({ timeout: 5_000 })
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 12_000 })
}

async function createCleanDocument(page: Page, title: string) {
  const before = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(before + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.getByLabel('Texto do documento')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function activeRecord(page: Page): Promise<Record<string, unknown>> {
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
    const record = rows.find((row) => row.id === remembered)
      ?? rows.find((row) => String(row.title ?? '') === activeTitle)
      ?? [...rows].sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt))[0]
    if (!record) throw new Error('Documento ativo não encontrado.')
    return record
  }, title)
}

async function allRecords(page: Page): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(async () => {
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
    return rows
  })
}

async function readDownload(download: Download): Promise<string> {
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
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

function legacyEnvelope(id: string, title: string, text: string) {
  const payload = {
    activeId: id,
    manuscripts: [{ id, title, text, type: 'manuscrito', status: 'Em escrita', tags: ['m0.9'] }],
  }
  return {
    format: 'esc',
    schemaVersion: 1,
    createdWith: '.esc - editor',
    exportedAt: '2026-07-29T12:00:00.000Z',
    checksum: fnv1a(JSON.stringify(stableSort(payload))),
    payload,
  }
}

test('jornada integrada preserva escrita, metadados e retomada após recarga', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Milestone integrado')
  const source = 'A oficina abriu cedo.\n\nCada pessoa trouxe uma página, uma dúvida e tempo para reler.'
  await editor.fill(source)

  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  const pulse = page.locator('#panel-pulso')
  await pulse.getByRole('button', { name: 'Pronto', exact: true }).click()
  await pulse.getByRole('button', { name: 'Marcar como favorita' }).click()
  await pulse.getByLabel('Marcadores da página').fill('milestone, integração, memória')
  await pulse.getByRole('button', { name: 'Salvar marcadores' }).click()
  await waitSaved(page)

  const beforeReload = await activeRecord(page)
  expect(beforeReload.title).toBe('Milestone integrado')
  expect(beforeReload.plainText).toContain('Cada pessoa trouxe uma página')
  expect(beforeReload.status).toBe('Pronto')
  expect(beforeReload.favorite).toBe(true)
  expect(beforeReload.tags).toEqual(['milestone', 'integração', 'memória'])

  await page.reload()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Milestone integrado')
  await expect(page.getByLabel('Texto do documento')).toContainText('Cada pessoa trouxe uma página')
  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  await expect(pulse.getByRole('button', { name: 'Pronto', exact: true })).toHaveClass(/active/)
  await expect(pulse.getByRole('button', { name: 'Página favorita' })).toHaveAttribute('aria-pressed', 'true')
  await expect(pulse.getByRole('button', { name: 'Remover marcador integração' })).toBeVisible()
  await expect(page.locator('.note-card.active')).toContainText('Milestone integrado')
})

test('engines em sequência não alteram manuscrito, revisão ou privacidade de rede', async ({ page }) => {
  test.setTimeout(70_000)
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Oficina de engines')
  const paragraph = 'Melancolia atravessa a casa. Ela tentou mas não conseguiu encerrar a revisão. O narrador quis denegrir a colega e citou uma lista negra. O amor encontrou a dor e deixou uma flor sobre a mesa.'
  const source = Array.from({ length: 8 }, () => paragraph).join('\n\n')
  await editor.fill(source)
  await waitSaved(page)

  const beforeText = await editor.innerText()
  const beforeRecord = await activeRecord(page)
  const leaks: string[] = []
  page.on('request', (request) => {
    const body = request.postData() ?? ''
    let url = request.url()
    try { url = decodeURIComponent(url) } catch { /* URL permanece comparável. */ }
    if (body.includes('denegrir a colega') || url.includes('denegrir a colega')) leaks.push(`${request.method()} ${request.url()}`)
  })

  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.locator('[data-review-issue-id*="PONT-49"]').first()).toBeVisible({ timeout: 15_000 })

  await page.getByRole('tab', { name: 'voz', exact: true }).click()
  await page.getByRole('button', { name: 'Escutar minha voz' }).click()
  await expect(page.locator('.voice-reading')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('tab', { name: 'contexto', exact: true }).click()
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
  await expect(page.locator('.context-card')).not.toHaveCount(0, { timeout: 15_000 })

  await page.getByRole('tab', { name: 'rimalab', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir oficina sonora' }).click()
  await expect(page.locator('.rima-reading')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await page.getByLabel('Palavra ou expressão curta').fill('melancolia')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.locator('.lexical-reading')).toBeVisible({ timeout: 15_000 })

  expect(await editor.innerText()).toBe(beforeText)
  const afterRecord = await activeRecord(page)
  expect(afterRecord.revision).toBe(beforeRecord.revision)
  expect(afterRecord.plainText).toBe(beforeRecord.plainText)
  expect(leaks).toEqual([])
})

test('organizar a biblioteca não altera revisão nem descarta a página ativa', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Página fora do recorte')
  await editor.fill('Este rascunho precisa sobreviver aos filtros e continuar aberto.')
  await waitSaved(page)
  const before = await activeRecord(page)

  await page.getByLabel('Buscar documentos').fill('resultado que não existe')
  await page.getByRole('group', { name: 'Filtrar por estado' }).getByRole('button', { name: 'Pronto', exact: true }).click()

  await expect(page.getByText('A página ativa continua aberta, mas está fora deste recorte.')).toBeVisible()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Página fora do recorte')
  await expect(editor).toContainText('precisa sobreviver aos filtros')
  await page.waitForTimeout(900)
  const after = await activeRecord(page)
  expect(after.revision).toBe(before.revision)
  expect(after.plainText).toBe(before.plainText)

  await page.getByRole('button', { name: 'Limpar filtros' }).first().click()
  await expect(page.locator('.note-card.active')).toContainText('Página fora do recorte')
})

test('drawer integrado permanece navegável em 320 e 390 px', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await waitReady(page)
    const trigger = page.getByRole('button', { name: 'Abrir ferramentas' })
    await trigger.click()
    const rail = page.getByRole('dialog', { name: 'Ferramentas do texto' })
    await expect(rail).toBeVisible()

    for (const tab of ['pulso', 'revisao', 'palavras', 'voz', 'contexto', 'rimalab', 'ferramentas']) {
      await page.getByRole('tab', { name: tab, exact: true }).click()
      await expect(page.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true')
    }

    const geometry = await page.evaluate(() => {
      const railElement = document.querySelector('.rail')
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        railScroll: railElement?.scrollWidth ?? 0,
        railClient: railElement?.clientWidth ?? 0,
      }
    })
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport + 1)
    expect(geometry.railScroll).toBeLessThanOrEqual(geometry.railClient + 1)

    await page.keyboard.press('Escape')
    await expect(rail).not.toBeVisible()
    await expect(trigger).toBeFocused()
  }
})

test('biblioteca com 100 páginas e documento de 100 mil caracteres continua utilizável', async ({ page }) => {
  test.setTimeout(70_000)
  await waitReady(page)
  const longText = 'A escrita precisa permanecer íntegra, pesquisável e local. '.repeat(2_000)
  await page.evaluate(async (text) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const now = Date.now()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('documents', 'readwrite')
      const store = tx.objectStore('documents')
      store.clear()
      for (let index = 0; index < 100; index += 1) {
        const active = index === 0
        const body = active ? text : `Texto da página ${index.toString().padStart(3, '0')}.`
        store.put({
          id: `m09-${index.toString().padStart(3, '0')}`,
          title: active ? 'Documento de resistência' : `Documento ${index.toString().padStart(3, '0')}`,
          plainText: body,
          content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }] },
          status: index % 3 === 0 ? 'Pronto' : index % 3 === 1 ? 'Em corte' : 'Rascunho',
          tags: index % 2 === 0 ? ['escala'] : ['acervo'],
          favorite: index % 5 === 0,
          createdAt: now - index * 1_000,
          updatedAt: now - index * 500,
          revision: 1,
          legacySourceId: null,
        })
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
    localStorage.setItem('escrevaral-mass-notes-next-active', 'm09-000')
    localStorage.removeItem('escrevaral-mass-notes-next-recovery')
  }, longText)

  await page.reload()
  await expect(page.getByLabel('Texto do documento')).toBeEditable({ timeout: 20_000 })
  await expect(page.locator('.note-card')).toHaveCount(100, { timeout: 20_000 })
  await expect(page.getByLabel('Título do documento')).toHaveValue('Documento de resistência')
  expect((await page.getByLabel('Texto do documento').innerText()).length).toBeGreaterThan(100_000)

  await page.getByLabel('Buscar documentos').fill('Documento 099')
  await expect(page.locator('.note-card')).toHaveCount(1)
  await expect(page.locator('.note-title-text')).toHaveText('Documento 099')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.getByText('A página ativa continua aberta, mas está fora deste recorte.')).toBeVisible()
})

test('conflito misto entre manuscrito e metadados preserva as duas versões', async ({ context, page }) => {
  await waitReady(page)
  const second = await context.newPage()
  await waitReady(second)
  const originalTitle = await second.getByLabel('Título do documento').inputValue()

  await second.getByRole('tab', { name: 'pulso', exact: true }).click()
  const favoriteButton = second.getByRole('button', { name: 'Marcar como favorita' })
  await favoriteButton.click({ trial: true })
  await favoriteButton.click()
  await page.getByLabel('Título do documento').evaluate(async (element, title) => {
    const input = element as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (!setter) throw new Error('Setter nativo do título indisponível.')
    setter.call(input, title)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }))
  }, 'Versão textual remota do M0.9')

  const banner = second.getByRole('alert')
  await expect(banner).toContainText('Outra aba também alterou esta página', { timeout: 12_000 })
  await expect(banner).toContainText('Nenhuma versão será apagada silenciosamente')
  await banner.getByRole('button', { name: 'Guardar a minha como cópia' }).click()

  await expect(second.getByLabel('Título do documento')).toHaveValue(`${originalTitle.trim() || 'Sem título'} — conflito`)
  await second.getByRole('tab', { name: 'pulso', exact: true }).click()
  await expect(second.getByRole('button', { name: 'Página favorita' })).toHaveAttribute('aria-pressed', 'true')
  await waitSaved(second)

  await expect(page.getByLabel('Título do documento')).toHaveValue('Versão textual remota do M0.9')
  const records = await allRecords(page)
  expect(records.some((item) => item.title === 'Versão textual remota do M0.9')).toBe(true)
  expect(records.some((item) => item.title === `${originalTitle.trim() || 'Sem título'} — conflito` && item.favorite === true)).toBe(true)
})

test('exportação usa o rascunho atual antes de depender da cópia persistida', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Base anterior')
  await editor.fill('Texto anterior já conhecido.')
  await waitSaved(page)

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  const freshTitle = 'Exportação imediata do rascunho'
  const freshText = 'Esta versão acabou de mudar e precisa entrar no arquivo agora.'
  await page.getByLabel('Título do documento').fill(freshTitle)
  await editor.fill(freshText)
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando/ })).toBeVisible({ timeout: 2_000 })

  const downloadPromise = page.waitForEvent('download')
  await page.locator('[data-export-format="md"]').click()
  const exported = await readDownload(await downloadPromise)
  expect(exported).toContain(`# ${freshTitle}`)
  expect(exported).toContain(freshText)
  await waitSaved(page)
})

test('cópia nativa, restauração e acervo legado convivem na mesma sessão sem substituir a página ativa', async ({ page }) => {
  test.setTimeout(70_000)
  await waitReady(page)
  const activeTitle = await page.getByLabel('Título do documento').inputValue()
  const beforeCount = await page.locator('.note-card').count()
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()

  const backupPromise = page.waitForEvent('download')
  await page.locator('[data-backup-action="create"]').click()
  const nativeText = await readDownload(await backupPromise)
  const nativeEnvelope = JSON.parse(nativeText) as { documents: unknown[] }
  expect(nativeEnvelope.documents.length).toBe(beforeCount)

  await page.getByLabel('Selecionar cópia nativa').setInputFiles({
    name: 'm0-9.esc.json',
    mimeType: 'application/json',
    buffer: Buffer.from(nativeText),
  })
  await expect(page.locator('.backup-message')).toContainText(`${beforeCount} documentos restaurados`)
  await expect(page.locator('.note-card')).toHaveCount(beforeCount * 2)
  await expect(page.getByLabel('Título do documento')).toHaveValue(activeTitle)

  const legacy = legacyEnvelope('m09-legado-combinado', 'Documento legado combinado', 'Texto legado com memória e emoji 🧵.')
  await page.getByLabel('Selecionar acervo esc legado').setInputFiles({
    name: 'm0-9-legado.esc',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(legacy)),
  })
  await expect(page.getByRole('heading', { name: 'Prévia do acervo legado' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.locator('.note-card')).toHaveCount(beforeCount * 2)

  await page.getByLabel('Selecionar acervo esc legado').setInputFiles({
    name: 'm0-9-legado.esc',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(legacy)),
  })
  await page.getByRole('button', { name: 'Importar como novas cópias' }).click()
  await expect(page.locator('.backup-message')).toContainText('1 documento importado')
  await expect(page.locator('.note-card')).toHaveCount(beforeCount * 2 + 1)
  await expect(page.getByLabel('Título do documento')).toHaveValue(activeTitle)

  const records = await allRecords(page)
  expect(records.filter((item) => item.legacySourceId === 'm09-legado-combinado')).toHaveLength(1)
  expect(records.some((item) => item.title === 'Documento legado combinado — importado')).toBe(true)
})
