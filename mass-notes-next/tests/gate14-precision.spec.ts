import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function openTools(page: Page) {
  const tab = page.getByRole('tab', { name: 'ferramentas', exact: true })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  const panel = page.locator('.precision-panel')
  await expect(panel).toBeVisible()
  return panel
}

async function createCleanDocument(page: Page, title: string) {
  const initialCount = await page.locator('.note-card').count()
  await page.keyboard.press('Control+N')
  await expect(page.locator('.note-card')).toHaveCount(initialCount + 1)
  await page.getByLabel('Título do documento').fill(title)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  return editor
}

async function saveNow(page: Page) {
  await page.keyboard.press('Control+S')
  await expect(page.locator('.sync-save')).toHaveText('Salvo', { timeout: 12_000 })
}

const ROTEIRO_TEXT = Array.from({ length: 8 }, (_, index) =>
  `Cena ${index + 1}. A câmera acompanha a personagem pela sala enquanto a luz muda. Ela abre a porta, observa o corredor, retorna à mesa e decide enfrentar o conflito antes que a noite termine.`
).join('\n\n')

test('Precision fica em Ferramentas sem criar uma oitava aba', async ({ page }) => {
  await waitReady(page)
  const panel = await openTools(page)

  await expect(page.getByRole('tab')).toHaveCount(7)
  await expect(panel.getByText(/estrutura e expectativas do gênero/i)).toBeVisible()
  await expect(panel.getByLabel('Guia do documento')).toHaveValue('')
  await expect(panel.getByRole('button', { name: 'Avaliar aderência ao guia' })).toBeDisabled()
})

test('guia editorial é metadado persistente do documento', async ({ page }) => {
  await waitReady(page)
  await createCleanDocument(page, 'Guia persistente')
  const panel = await openTools(page)
  await panel.getByLabel('Guia do documento').selectOption('roteiro-tv')
  await saveNow(page)

  await page.reload()
  await expect(page.locator('.paper')).toBeVisible()
  const reloaded = await openTools(page)
  await expect(reloaded.getByLabel('Guia do documento')).toHaveValue('roteiro-tv')
  await expect(reloaded).toContainText(/Roteiro/i)
})

test('guia associado não produz avaliação antes de 50 palavras', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Roteiro curto')
  await editor.fill('INT. SALA — NOITE. Ela abre a porta, olha o corredor e volta para a mesa.')
  const panel = await openTools(page)
  await panel.getByLabel('Guia do documento').selectOption('roteiro-tv')

  await expect(panel.getByRole('button', { name: 'Avaliar aderência ao guia' })).toBeDisabled()
  await expect(panel.getByRole('status')).toContainText(/50 palavras/i)
  await expect(panel.locator('.precision-reading')).toHaveCount(0)
})

test('texto suficiente recebe leitura editorial da Precision sem acionar Revisão', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Roteiro em avaliação')
  await editor.fill(ROTEIRO_TEXT)
  const panel = await openTools(page)
  await panel.getByLabel('Guia do documento').selectOption('roteiro-tv')

  expect(await page.locator('script[data-escrevaral-engine="analise-engine.js"]').count()).toBe(0)
  const button = panel.getByRole('button', { name: 'Avaliar aderência ao guia' })
  await expect(button).toBeEnabled()
  await button.click()

  await expect(panel.locator('.precision-reading')).toBeVisible()
  await expect(panel.locator('.precision-reading .metric-value')).toHaveText(/^\d{1,3}$/)
  await expect(panel.locator('.precision-reading .review-card').first()).toBeVisible()
  await expect(panel.getByRole('status')).toContainText(/guia|base|desenvolvimento|cobertos/i)
  expect(await page.locator('script[data-escrevaral-engine="analise-engine.js"]').count()).toBe(0)
})

test('resultado de aderência é invalidado quando o manuscrito muda', async ({ page }) => {
  await waitReady(page)
  const editor = await createCleanDocument(page, 'Precision em mudança')
  await editor.fill(ROTEIRO_TEXT)
  const panel = await openTools(page)
  await panel.getByLabel('Guia do documento').selectOption('roteiro-tv')
  await panel.getByRole('button', { name: 'Avaliar aderência ao guia' }).click()
  await expect(panel.locator('.precision-reading')).toBeVisible()

  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(' A personagem fecha a janela.')

  await expect(panel.locator('.precision-reading')).toHaveCount(0)
  await expect(panel.getByRole('status')).toContainText(/texto mudou/i)
})

test('Precision cabe no drawer móvel e mantém as sete rotas na mesma régua', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' })).toBeVisible()
  const panel = await openTools(page)
  await expect(panel.getByLabel('Guia do documento')).toBeVisible()

  const sizes = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll<HTMLElement>('#text-tools .tab'))
    const tops = tabs.map((tab) => tab.getBoundingClientRect().top)
    return {
      viewport: window.innerWidth,
      body: document.documentElement.scrollWidth,
      rail: document.querySelector('.rail')?.scrollWidth ?? 0,
      railClient: document.querySelector('.rail')?.clientWidth ?? 0,
      tabTopSpread: tops.length ? Math.max(...tops) - Math.min(...tops) : 999,
    }
  })
  expect(sizes.body).toBeLessThanOrEqual(sizes.viewport)
  expect(sizes.rail).toBeLessThanOrEqual(sizes.railClient)
  expect(sizes.tabTopSpread).toBeLessThanOrEqual(1)
})
