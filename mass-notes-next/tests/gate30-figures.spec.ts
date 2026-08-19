import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.locator('.ProseMirror')).toBeEditable()
}

async function writeText(page: Page, text: string) {
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await editor.fill(text)
  await expect(editor).toContainText(text.slice(0, Math.min(40, text.length)))
  return editor
}

async function openFigures(page: Page) {
  await page.keyboard.press('Escape')
  const launcher = page.getByRole('button', { name: 'Abrir oficina de ferramentas' })
  await expect(launcher).toBeVisible()
  await launcher.click()
  const dialog = page.getByRole('dialog', { name: 'Ferramentas do texto' })
  await expect(dialog).toBeVisible()
  await page.getByRole('tab', { name: 'voz', exact: true }).click()
  const figures = page.getByRole('region', { name: 'Figuras de linguagem' })
  await expect(figures).toBeVisible()
  return figures
}

test('Gate 30: mapa retórico encontra padrões em várias escalas sem corrigir o texto', async ({ page }) => {
  await waitReady(page)
  const source = 'Eu guardo a casa quando a noite chega. Eu guardo a rua quando a noite chega. A cidade dorme e a janela espera e a porta chama e o corredor escuta. Ele resolveu subir para cima devagar, entre o dia e a noite, enquanto a luz disputava espaço com a sombra.'
  const editor = await writeText(page, source)
  const figures = await openFigures(page)

  await figures.getByRole('button', { name: 'Mapear figuras de linguagem' }).click()

  await expect(figures).toContainText('Anáfora')
  await expect(figures).toContainText('Epífora')
  await expect(figures).toContainText('Paralelismo sintático')
  await expect(figures).toContainText('Polissíndeto')
  await expect(figures).toContainText('Pleonasmo / redundância')
  await expect(figures).toContainText('Antítese')
  await expect(figures).toContainText('Personificação possível')
  await expect(editor).toContainText(source)
  await expect(figures.locator('.review-located-card button')).toHaveCount(0)
})

test('Gate 30: som e enumeração são lidos como recursos, não como erro', async ({ page }) => {
  await waitReady(page)
  await writeText(page, 'Bruna borda bilhetes breves, busca barcos brancos, balança bandeiras, brinca baixo.')
  const figures = await openFigures(page)

  await figures.getByRole('button', { name: 'Mapear figuras de linguagem' }).click()

  await expect(figures).toContainText('Aliteração')
  await expect(figures).toContainText('Enumeração assindética')
  await expect(figures).toContainText(/textura sonora|acelerar o texto/i)
})

test('Gate 30: leitura semântica incerta permanece explicitamente limitada', async ({ page }) => {
  await waitReady(page)
  await writeText(page, 'A tarde ficou quieta na varanda. Uma cadeira vazia permaneceu ao lado da mesa.')
  const figures = await openFigures(page)

  await expect(figures.locator('.figures-disclaimer')).toContainText('Metáfora, metonímia e ironia não são declaradas por regra')
})

test('Gate 30: resultado é invalidado quando o manuscrito muda', async ({ page }) => {
  await waitReady(page)
  const editor = await writeText(page, 'Eu espero a chuva. Eu espero a noite. Eu espero o dia chegar devagar.')
  const figures = await openFigures(page)
  await figures.getByRole('button', { name: 'Mapear figuras de linguagem' }).click()
  await expect(figures.locator('.figures-reading')).toBeVisible()

  await editor.click()
  await editor.fill('Agora a página tomou outro caminho e abandonou a repetição anterior.')

  await expect(figures.locator('.figures-reading')).toHaveCount(0)
  await expect(figures.locator('.figures-message')).toContainText(/texto mudou/i)
})
