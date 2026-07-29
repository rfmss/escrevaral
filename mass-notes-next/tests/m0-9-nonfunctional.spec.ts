import { expect, test, type Page } from '@playwright/test'

const ACTIVE_KEY = 'escrevaral-mass-notes-next-active'
const RECOVERY_KEY = 'escrevaral-mass-notes-next-recovery'

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
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const activeId = localStorage.getItem('escrevaral-mass-notes-next-active')
    const rows = await new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').getAll()
      request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>)
      request.onerror = () => reject(request.error)
    })
    db.close()
    const record = rows.find((row) => row.id === activeId)
      ?? [...rows].sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt))[0]
    if (!record) throw new Error('Documento ativo não encontrado.')
    return record
  })
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

function percentile95(values: number[]): number {
  const ordered = [...values].sort((left, right) => left - right)
  return ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)] ?? 0
}

test('seis larguras preservam a oficina, os acionadores e a ausência de overflow bloqueador', async ({ page }, testInfo) => {
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 })
    await waitReady(page)

    const geometry = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth
      const paper = document.querySelector('.paper')?.getBoundingClientRect()
      const title = document.querySelector('.title-input')?.getBoundingClientRect()
      const editor = document.querySelector('.ProseMirror')?.getBoundingClientRect()
      return {
        viewport,
        documentWidth: document.documentElement.scrollWidth,
        paper: paper ? { left: paper.left, right: paper.right, width: paper.width } : null,
        title: title ? { left: title.left, right: title.right, width: title.width } : null,
        editor: editor ? { left: editor.left, right: editor.right, width: editor.width } : null,
      }
    })

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport + 1)
    expect(geometry.paper).not.toBeNull()
    expect(geometry.title?.width ?? 0).toBeGreaterThan(120)
    expect(geometry.editor?.width ?? 0).toBeGreaterThan(120)
    expect(geometry.paper?.left ?? -2).toBeGreaterThanOrEqual(-1)
    expect(geometry.paper?.right ?? geometry.viewport + 2).toBeLessThanOrEqual(geometry.viewport + 1)

    if (width <= 820) {
      const menu = page.getByRole('button', { name: 'Abrir arquivo' })
      const tools = page.getByRole('button', { name: 'Abrir ferramentas' })
      await expect(menu).toBeVisible()
      await expect(tools).toBeVisible()
      const [menuBox, toolsBox] = await Promise.all([menu.boundingBox(), tools.boundingBox()])
      expect(menuBox && toolsBox ? menuBox.x + menuBox.width < toolsBox.x : false).toBe(true)

      await menu.click()
      await expect(page.getByRole('dialog', { name: 'Arquivo de páginas' })).toBeVisible()
      await page.keyboard.press('Escape')
      await tools.click()
      await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' })).toBeVisible()
      await page.keyboard.press('Escape')
    } else {
      await expect(page.locator('.sidebar')).toBeVisible()
      await expect(page.locator('.rail')).toBeVisible()
    }

    await page.screenshot({ path: `test-results/m0-9-uix-${width}-${testInfo.project.name}.png`, fullPage: true })
  }
})

test('layout equivalente a zoom de 200% mantém escrita e drawers alcançáveis', async ({ page }) => {
  // Um viewport CSS de 640×450 representa uma janela física de 1280×900 a 200% de zoom.
  await page.setViewportSize({ width: 640, height: 450 })
  await waitReady(page)

  await expect(page.getByLabel('Título do documento')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)

  await page.getByRole('button', { name: 'Abrir arquivo' }).click()
  const library = page.getByRole('dialog', { name: 'Arquivo de páginas' })
  await expect(library).toBeVisible()
  await expect(library.getByLabel('Buscar documentos')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  const rail = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(rail).toBeVisible()
  await expect(rail.getByRole('tab')).toHaveCount(7)
  await page.keyboard.press('Escape')
})

test('movimento reduzido encurta a transição editorial sem bloquear navegação', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await waitReady(page)
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()

  const started = Date.now()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  const press = page.locator('.page-press')
  await expect(press).toBeVisible()
  const durationMs = await press.evaluate((node) => {
    const raw = getComputedStyle(node).animationDuration.split(',')[0]?.trim() ?? '0s'
    return raw.endsWith('ms') ? Number.parseFloat(raw) : Number.parseFloat(raw) * 1_000
  })
  expect(durationMs).toBeLessThanOrEqual(300)
  await expect(page.getByRole('main', { name: 'Anatomia do Livro' })).toBeVisible({ timeout: 1_000 })
  expect(Date.now() - started).toBeLessThan(1_000)

  const backStarted = Date.now()
  await page.getByRole('button', { name: '← Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 1_000 })
  expect(Date.now() - backStarted).toBeLessThan(1_000)
})

test('jornada completa não envia texto autoral nem abre origem externa', async ({ page }) => {
  test.setTimeout(90_000)
  await waitReady(page)

  const sentinel = 'SENTINELA AUTORAL M0.9 NÃO TRANSMITIR 7F3A'
  const requests: Array<{ method: string; url: string; body: string }> = []
  page.on('request', (request) => {
    requests.push({ method: request.method(), url: request.url(), body: request.postData() ?? '' })
  })

  const editor = await createCleanDocument(page, 'Auditoria integral de rede')
  const source = `${sentinel}. Melancolia atravessa a casa. Ela entrou para dentro da sala, tentou mas não conseguiu encerrar a revisão, usou a expressão lista negra e disse denegrir a colega. O amor encontrou a dor e deixou uma flor sobre a mesa.`
  await editor.fill(source)
  await waitSaved(page)

  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.getByRole('status')).toContainText(/observa|trecho|Nenhuma/i, { timeout: 15_000 })

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

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  await expect(page.getByRole('main', { name: 'Anatomia do Livro' })).toBeVisible({ timeout: 3_000 })
  await page.getByRole('button', { name: '← Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 3_000 })

  const baseOrigin = new URL(page.url()).origin
  const external = requests.filter((request) => {
    try { return new URL(request.url).origin !== baseOrigin } catch { return false }
  })
  const leaked = requests.filter((request) => {
    let url = request.url
    try { url = decodeURIComponent(url) } catch { /* Mantém URL original para comparação. */ }
    return `${url}\n${request.body}`.toLocaleLowerCase('pt-BR').includes(sentinel.toLocaleLowerCase('pt-BR'))
  })

  expect(external).toEqual([])
  expect(leaked).toEqual([])
  expect(await editor.innerText()).toContain(sentinel)
})

test('recuperação emergencial retoma rascunho, converge e limpa o envelope temporário', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Base persistida da recuperação')
  await editor.fill('Texto persistido antes da interrupção.')
  await waitSaved(page)

  const beforeRows = await allRecords(page)
  const before = await activeRecord(page)
  const recoveredTitle = 'Rascunho recuperado após interrupção'
  const recoveredText = 'Este conteúdo existia apenas no envelope emergencial e precisa voltar sem duplicar a página.'

  await page.evaluate(({ activeKey, recoveryKey, title, text }) => {
    const activeId = localStorage.getItem(activeKey)
    if (!activeId) throw new Error('ID ativo ausente.')
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('escrevaral-mass-notes-next', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const get = db.transaction('documents').objectStore('documents').get(activeId)
        get.onerror = () => reject(get.error)
        get.onsuccess = () => {
          const persisted = get.result as Record<string, unknown>
          const recovery = {
            ...persisted,
            title,
            plainText: text,
            content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
            updatedAt: Number(persisted.updatedAt) + 10_000,
          }
          localStorage.setItem(recoveryKey, JSON.stringify({ capturedAt: Date.now(), document: recovery }))
          db.close()
          resolve()
        }
      }
    })
  }, { activeKey: ACTIVE_KEY, recoveryKey: RECOVERY_KEY, title: recoveredTitle, text: recoveredText })

  await page.reload()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.getByLabel('Título do documento')).toHaveValue(recoveredTitle)
  await expect(page.getByLabel('Texto do documento')).toContainText(recoveredText)
  await waitSaved(page)

  const after = await activeRecord(page)
  const afterRows = await allRecords(page)
  expect(after.id).toBe(before.id)
  expect(after.title).toBe(recoveredTitle)
  expect(after.plainText).toContain(recoveredText)
  expect(Number(after.revision)).toBeGreaterThan(Number(before.revision))
  expect(afterRows).toHaveLength(beforeRows.length)
  expect(await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY)).toBeNull()
})

test('sessão prolongada mantém latência, memória, DOM e quantidade de páginas sob controle', async ({ page }) => {
  test.setTimeout(120_000)
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await waitReady(page)
  const editor = await createCleanDocument(page, 'Sessão prolongada M0.9')
  await editor.fill('Ciclo inicial da sessão prolongada.')
  await waitSaved(page)

  const before = await activeRecord(page)
  const initialRows = await allRecords(page)
  const initialDomNodes = await page.locator('*').count()
  const initialHeap = await page.evaluate(() => {
    const performanceWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } }
    return performanceWithMemory.memory?.usedJSHeapSize ?? null
  })
  const durations: number[] = []

  for (let index = 1; index <= 12; index += 1) {
    const started = performance.now()
    await editor.fill(`Ciclo ${index}: a página continua íntegra, local e editável. ${'texto '.repeat(index)}`)
    await waitSaved(page)
    durations.push(performance.now() - started)
  }

  const after = await activeRecord(page)
  const finalRows = await allRecords(page)
  const finalDomNodes = await page.locator('*').count()
  const finalHeap = await page.evaluate(() => {
    const performanceWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } }
    return performanceWithMemory.memory?.usedJSHeapSize ?? null
  })
  const p95 = percentile95(durations)

  console.log('[M0.9 performance]', JSON.stringify({ p95SaveMs: Math.round(p95), initialDomNodes, finalDomNodes, initialHeap, finalHeap }))
  expect(pageErrors).toEqual([])
  expect(finalRows).toHaveLength(initialRows.length)
  expect(Number(after.revision)).toBeGreaterThanOrEqual(Number(before.revision) + 12)
  expect(finalDomNodes).toBeLessThanOrEqual(initialDomNodes + 120)
  expect(p95).toBeLessThan(8_000)
  if (initialHeap !== null && finalHeap !== null) {
    expect(finalHeap - initialHeap).toBeLessThan(64 * 1024 * 1024)
  }
})

test('corpus separado confirma cada engine sem alterar o texto observado', async ({ page }) => {
  test.setTimeout(120_000)
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Corpus consolidado das engines')

  const runWithStableText = async (source: string, action: () => Promise<void>) => {
    await editor.fill(source)
    await waitSaved(page)
    const before = await editor.innerText()
    await action()
    expect(await editor.innerText()).toBe(before)
  }

  await runWithStableText('Ela entrou para dentro da casa. O coração acelerou, o coração acelerou.', async () => {
    await page.getByRole('tab', { name: 'revisao', exact: true }).click()
    await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
    await expect(page.locator('[data-review-issue-id]').first()).toBeVisible({ timeout: 15_000 })
  })

  await runWithStableText('A narradora alterna frases curtas e longas, repete imagens de janela e mantém uma voz próxima, reflexiva e cuidadosa com quem lê.', async () => {
    await page.getByRole('tab', { name: 'voz', exact: true }).click()
    await page.getByRole('button', { name: 'Escutar minha voz' }).click()
    await expect(page.locator('.voice-reading')).toBeVisible({ timeout: 15_000 })
  })

  await runWithStableText('O narrador usou a expressão lista negra e decidiu denegrir a colega durante a reunião.', async () => {
    await page.getByRole('tab', { name: 'contexto', exact: true }).click()
    await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
    await expect(page.locator('.context-card')).not.toHaveCount(0, { timeout: 15_000 })
  })

  await runWithStableText('O amor atravessou a dor e deixou uma flor sobre a mesa, enquanto o rumor percorreu o corredor.', async () => {
    await page.getByRole('tab', { name: 'rimalab', exact: true }).click()
    await page.getByRole('button', { name: 'Abrir oficina sonora' }).click()
    await expect(page.locator('.rima-reading')).toBeVisible({ timeout: 15_000 })
  })

  await runWithStableText('A melancolia atravessou a casa e permaneceu junto à janela.', async () => {
    await page.getByRole('tab', { name: 'palavras', exact: true }).click()
    await page.getByLabel('Palavra ou expressão curta').fill('melancolia')
    await page.getByRole('button', { name: 'Consultar' }).click()
    await expect(page.locator('.lexical-reading')).toBeVisible({ timeout: 15_000 })
  })
})
