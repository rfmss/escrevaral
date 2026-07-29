import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function waitSaved(page: Page) {
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando/ })).toBeVisible({ timeout: 5_000 })
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
