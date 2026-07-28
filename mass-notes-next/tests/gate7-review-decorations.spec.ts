import { expect, test, type Page } from '@playwright/test'

type ContractHost = HTMLElement & {
  __escrevaralPositionContract?: {
    snapshot: {
      documentId: string
      contentSignature: string
      text: string
      offsetEncoding: string
    }
  }
}

const BASE_HTML = [
  '<p>🌿 A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.</p>',
  '<p>Ela tentou mas não conseguiu terminar a revisão antes do café.</p>',
  '<p>Depois, releu as páginas com calma, conferiu os títulos e guardou o arquivo para continuar no fim da tarde.</p>',
].join('')

const BASE_TEXT = [
  '🌿 A oficina abriu cedo e cada pessoa trouxe um caderno para trabalhar com atenção.',
  'Ela tentou mas não conseguiu terminar a revisão antes do café.',
  'Depois, releu as páginas com calma, conferiu os títulos e guardou o arquivo para continuar no fim da tarde.',
].join('\n\n')

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect.poll(() => page.locator('.ProseMirror').evaluate((element) =>
    Boolean((element as ContractHost).__escrevaralPositionContract))).toBe(true)
}

async function createDocument(page: Page, title: string, html = BASE_HTML, plain = BASE_TEXT) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
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
  }, { html, plain })
  await expect.poll(() => editor.evaluate((element) =>
    (element as ContractHost).__escrevaralPositionContract?.snapshot.text ?? null)).toBe(plain)
  return editor
}

async function analyze(page: Page) {
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.locator('#panel-revisao .review-message')).toContainText(/trechos? localizados?|Nenhuma observação/, { timeout: 15_000 })
}

async function snapshot(page: Page) {
  return page.locator('.ProseMirror').evaluate((element) => {
    const value = (element as ContractHost).__escrevaralPositionContract?.snapshot
    if (!value) throw new Error('Contrato ausente.')
    return value
  })
}

async function selectedBlockText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const selection = window.getSelection()
    const node = selection?.anchorNode
    const element = node instanceof Element ? node : node?.parentElement
    return element?.closest('p, h1, h2, h3, blockquote')?.textContent ?? ''
  })
}

test('pontuação com posição exata cria decoration sem alterar o documento', async ({ page }) => {
  await waitReady(page)
  await createDocument(page, 'Decoration segura')
  const before = await snapshot(page)

  await analyze(page)

  const decoration = page.locator('[data-review-issue-id*="PONT-49"]').filter({ hasText: 'tentou mas' })
  await expect(decoration).toHaveCount(1)
  await expect(page.locator('.review-located-card')).toContainText('tentou mas')
  await expect(page.getByRole('button', { name: /Ir ao trecho: tentou mas/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /aplicar|substituir|corrigir automaticamente/i })).toHaveCount(0)

  const after = await snapshot(page)
  expect(after.contentSignature).toBe(before.contentSignature)
  expect(after.text).toBe(before.text)
  expect(after.offsetEncoding).toBe('utf-16')
})

test('navegação seleciona o fragmento exato mesmo depois de emoji e hardBreak', async ({ page }) => {
  await waitReady(page)
  const html = [
    '<p>👩🏽‍💻 A equipe abriu o caderno, conferiu cada página e preparou uma leitura atenta.<br>Ela tentou mas não conseguiu encerrar o trabalho antes do almoço.</p>',
    '<p>Depois, voltou ao começo, releu as frases e anotou as decisões para a próxima rodada da oficina.</p>',
  ].join('')
  const plain = [
    '👩🏽‍💻 A equipe abriu o caderno, conferiu cada página e preparou uma leitura atenta.\nEla tentou mas não conseguiu encerrar o trabalho antes do almoço.',
    'Depois, voltou ao começo, releu as frases e anotou as decisões para a próxima rodada da oficina.',
  ].join('\n\n')
  await createDocument(page, 'Unicode antes do alerta', html, plain)
  await analyze(page)

  await page.getByRole('button', { name: /Ir ao trecho: tentou mas/i }).click()
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('tentou mas')
  await expect(page.locator('[data-review-issue-id*="PONT-49"]').filter({ hasText: 'tentou mas' })).toHaveCount(1)
})

test('qualquer edição apaga projeções e exige nova leitura', async ({ page }) => {
  await waitReady(page)
  const editor = await createDocument(page, 'Obsolescência imediata')
  await analyze(page)
  await expect(page.locator('[data-review-issue-id]')).not.toHaveCount(0)

  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' Agora.')

  await expect(page.locator('[data-review-issue-id]')).toHaveCount(0)
  await expect(page.locator('.review-located-card')).toHaveCount(0)
  await expect(page.locator('#panel-revisao .review-message')).toContainText('O texto mudou')
})

test('trocar de documento não transporta decoration nem navegação', async ({ page }) => {
  await waitReady(page)
  await createDocument(page, 'Documento com leitura')
  await analyze(page)
  await expect(page.locator('[data-review-issue-id]')).not.toHaveCount(0)

  await page.keyboard.press('Control+N')
  await expect(page.getByLabel('Título do documento')).toHaveValue('')
  await expect(page.locator('[data-review-issue-id]')).toHaveCount(0)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await expect(page.locator('.review-located-card')).toHaveCount(0)
})

test('fragmentos repetidos mantêm duas posições navegáveis mesmo com decorations sobrepostas', async ({ page }) => {
  await waitReady(page)
  const html = [
    '<p>A primeira equipe abriu o caderno e tentou mas não conseguiu fechar a revisão durante a manhã.</p>',
    '<p>A segunda equipe comparou as páginas, tentou mas não conseguiu terminar antes que a oficina encerrasse.</p>',
    '<p>As duas guardaram as versões, registraram as decisões e combinaram continuar o trabalho na tarde seguinte.</p>',
  ].join('')
  const plain = [
    'A primeira equipe abriu o caderno e tentou mas não conseguiu fechar a revisão durante a manhã.',
    'A segunda equipe comparou as páginas, tentou mas não conseguiu terminar antes que a oficina encerrasse.',
    'As duas guardaram as versões, registraram as decisões e combinaram continuar o trabalho na tarde seguinte.',
  ].join('\n\n')
  await createDocument(page, 'Ocorrências repetidas', html, plain)
  await analyze(page)

  const pont49Cards = page.locator('.review-located-card').filter({ hasText: 'PONT-49' })
  await expect(pont49Cards).toHaveCount(2)
  const jumps = page.getByRole('button', { name: /Ir ao trecho: tentou mas/i })
  await expect(jumps).toHaveCount(2)

  await jumps.nth(0).click()
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('tentou mas')
  await expect.poll(() => selectedBlockText(page)).toContain('A primeira equipe')

  await jumps.nth(1).click()
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('tentou mas')
  await expect.poll(() => selectedBlockText(page)).toContain('A segunda equipe')
})

test('marcas podem ser ocultadas e restauradas sem apagar a leitura', async ({ page }) => {
  await waitReady(page)
  await createDocument(page, 'Controle de marcas')
  const before = await snapshot(page)
  await analyze(page)

  const decoration = page.locator('[data-review-issue-id]').first()
  await expect(decoration).toBeVisible()
  const locatedCards = page.locator('.review-located-card')
  const locatedCount = await locatedCards.count()
  expect(locatedCount).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Ocultar marcas' }).click()
  await expect(page.locator('body')).toHaveClass(/review-marks-hidden/)
  await expect(locatedCards).toHaveCount(locatedCount)
  await expect(page.getByRole('button', { name: 'Mostrar marcas' })).toBeVisible()
  await expect.poll(() => decoration.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, shadow: style.boxShadow }
  })).toEqual({ background: 'rgba(0, 0, 0, 0)', shadow: 'none' })

  await page.getByRole('button', { name: 'Mostrar marcas' }).click()
  await expect(page.locator('body')).not.toHaveClass(/review-marks-hidden/)
  await expect(page.getByRole('button', { name: 'Ocultar marcas' })).toBeVisible()
  await expect.poll(() => decoration.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, shadow: style.boxShadow }
  })).not.toEqual({ background: 'rgba(0, 0, 0, 0)', shadow: 'none' })

  const after = await snapshot(page)
  expect(after.contentSignature).toBe(before.contentSignature)
  expect(after.text).toBe(before.text)
})

test('posição ou fragmento não verificável nunca produz decoration', async ({ page }) => {
  await waitReady(page)
  await createDocument(page, 'Resposta defensiva')

  await page.evaluate(() => {
    const target = window as typeof window & {
      VeredaAnalise?: {
        analisar: (text: string) => unknown
        interpretarResultado?: (result: unknown) => unknown
      }
    }
    if (!target.VeredaAnalise) throw new Error('Engine ausente.')
    target.VeredaAnalise.analisar = () => ({
      norma: {
        pontuacao: {
          issues: [{ ruleId: 'PONT-FAKE', criterio: 'Teste inválido', fragment: 'trecho inexistente', pos: 0, severity: 'alta' }],
        },
      },
    })
    target.VeredaAnalise.interpretarResultado = () => []
  })

  await analyze(page)
  await expect(page.locator('[data-review-issue-id]')).toHaveCount(0)
  await expect(page.locator('.review-located-card')).toHaveCount(0)
})

test('decoration usa a cor reservada de análise e permanece íntegra no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await createDocument(page, 'Revisão móvel')
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await analyze(page)

  const decoration = page.locator('[data-review-issue-id]').first()
  await expect(decoration).toBeVisible()
  const colors = await decoration.evaluate((element) => {
    const style = getComputedStyle(element)
    const body = getComputedStyle(document.body)
    return {
      background: style.backgroundColor,
      shadow: style.boxShadow,
      analysis: body.getPropertyValue('--ui-analysis').trim(),
      selection: body.getPropertyValue('--ui-selection').trim(),
      pointerEvents: style.pointerEvents,
    }
  })
  expect(colors.background).not.toBe('rgba(0, 0, 0, 0)')
  expect(colors.shadow).not.toBe('none')
  expect(colors.analysis).not.toBe(colors.selection)
  expect(colors.pointerEvents).toBe('none')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expect(page.getByRole('button', { name: /Ir ao trecho: tentou mas/i })).toBeVisible()
  await page.screenshot({ path: 'test-results/gate7-review-decoration-mobile.png', fullPage: true })
})
