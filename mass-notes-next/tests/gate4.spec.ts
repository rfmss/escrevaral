import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function waitSaved(page: Page) {
  await expect(page.locator('.field-value').filter({ hasText: /Alterado|Salvando|Salvo/ })).toBeVisible({ timeout: 5_000 })
  await page.keyboard.press('Control+S')
  await expect(page.locator('.field-value').filter({ hasText: /^Salvo$/ })).toBeVisible({ timeout: 12_000 })
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await expect(page.getByLabel('Título do documento')).toHaveValue('')
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function openContext(page: Page) {
  await page.getByRole('tab', { name: 'contexto', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'contexto', exact: true })).toHaveAttribute('aria-selected', 'true')
}

test('página vazia não recebe falso alerta contextual', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Página sem contexto')
  await openContext(page)
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()

  await expect(page.getByRole('status')).toContainText(/página está vazia/i)
  await expect(page.locator('.context-card')).toHaveCount(0)
})

test('termos são contados e apresentados sem alterar o manuscrito', async ({ page }, testInfo) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Leitura de contexto')
  const source = 'Ele tentou denegrir a colega e repetiu que iria denegrir seu trabalho. Depois citou uma lista negra em um documento antigo.'
  await editor.fill(source)
  await waitSaved(page)
  await openContext(page)
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()

  await expect(page.getByRole('status')).toContainText(/2 termos pedem/i)
  await expect(page.locator('.context-card')).toHaveCount(2)

  const denegrir = page.locator('.context-card').filter({ hasText: 'denegrir' })
  await expect(denegrir).toContainText('2 ocorrências')
  await expect(denegrir).toContainText('Por que observar')
  await expect(denegrir).toContainText('Alternativas possíveis')
  await expect(denegrir).toContainText('difamar')

  const listaNegra = page.locator('.context-card').filter({ hasText: 'lista negra' })
  await expect(listaNegra).toContainText('1 ocorrência')
  await expect(page.locator('.context-disclaimer')).toContainText(/decisão final é de quem escreve/i)
  await expect(page.locator('.context-disclaimer')).toContainText(/nenhuma alternativa é aplicada automaticamente/i)
  await expect(editor).toContainText(source)
  await expect(page.locator('.context-card button')).toHaveCount(0)

  const headingsFit = await page.locator('.context-card h2').evaluateAll((headings) => headings.every((heading) => {
    const style = getComputedStyle(heading)
    return heading.scrollWidth <= heading.clientWidth && style.wordBreak === 'normal'
  }))
  expect(headingsFit).toBe(true)

  await page.screenshot({ path: `test-results/termos-contexto-${testInfo.project.name}.png`, fullPage: true })
})

test('texto sem ocorrências recebe retorno neutro', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Sem termos da base')
  await editor.fill('A menina abriu a janela, ouviu a chuva no quintal e voltou para a mesa com o caderno nas mãos.')
  await waitSaved(page)
  await openContext(page)
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()

  await expect(page.getByRole('status')).toContainText(/nenhum termo da base contextual/i)
  await expect(page.locator('.context-card')).toHaveCount(0)
})

test('resultado contextual é invalidado quando o conteúdo muda', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Contexto em mudança')
  await editor.fill('O relatório usava a expressão lista negra em uma citação antiga.')
  await waitSaved(page)
  await openContext(page)
  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
  await expect(page.locator('.context-card')).toHaveCount(1)

  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' A autora explicou a escolha do narrador.')

  await expect(page.locator('.context-card')).toHaveCount(0)
  await expect(page.getByRole('status')).toContainText(/texto mudou/i)
})

test('falha controlada da engine não quebra o editor', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Falha contextual')
  await editor.fill('O texto menciona uma lista negra.')
  await waitSaved(page)
  await openContext(page)

  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
  await expect(page.locator('.context-card')).toHaveCount(1)

  await page.evaluate(() => {
    const engine = (window as typeof window & { VeredaDecolonial?: { detectText: () => unknown } }).VeredaDecolonial
    if (engine) engine.detectText = () => { throw new Error('falha simulada') }
  })

  await page.getByRole('button', { name: 'Examinar termos no texto' }).click()
  await expect(page.getByRole('status')).toContainText(/não pôde ser concluída/i)
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.type(' O editor segue funcionando.')
  await expect(editor).toContainText('O editor segue funcionando.')
})

test('aba Contexto permanece acessível e sem overflow no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' })).toBeVisible()
  await openContext(page)
  await expect(page.getByText(/não acusa, proíbe nem troca palavras/i)).toBeVisible()

  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.documentElement.scrollWidth,
    rail: document.querySelector('.rail')?.scrollWidth ?? 0,
    railClient: document.querySelector('.rail')?.clientWidth ?? 0,
  }))
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport)
  expect(sizes.rail).toBeLessThanOrEqual(sizes.railClient)
})
