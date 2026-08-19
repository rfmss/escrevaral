import { expect, test, type Page } from '@playwright/test'

async function revealWords(page: Page) {
  const viewport = page.viewportSize()
  if ((viewport?.width ?? 1280) >= 1100) {
    const canonical = page.locator('.analysis-panel .reference-lexical-open')
    await expect(canonical).toBeVisible()
    await canonical.click()
  } else {
    const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
    await opener.click()
    await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  }
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

async function openWords(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await revealWords(page)
}

test('busca lexical local apresenta definição, sinônimos e evita classe falsa sem contexto', async ({ page }) => {
  await openWords(page)
  const input = page.getByLabel('Palavra ou expressão curta')
  await input.fill('melancolia')
  await page.getByRole('button', { name: 'Consultar', exact: true }).click()

  const reading = page.locator('.lexical-reading')
  await expect(page.getByRole('heading', { name: 'melancolia', exact: false })).toBeVisible()
  await expect(reading).toContainText(/tristeza difusa/i)
  await expect(reading).toContainText('Classe não determinada sem contexto')
  await expect(reading).toContainText('Ocorrências')
  await expect(page.getByRole('heading', { name: 'Sinônimos para consulta' })).toBeVisible()
  await expect(page.locator('.lexical-synonyms')).toContainText(/tristeza suave|nostalgia/i)
  await expect(page.locator('.lexical-synonyms button')).toHaveCount(0)
})

test('seleção do Tiptap preserva contexto destacado e não altera o manuscrito', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  const manuscript = 'Melancolia atravessa a casa sem pedir licença.'

  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  await page.keyboard.insertText(manuscript)
  await expect(editor).toHaveText(manuscript)

  await expect.poll(() => editor.evaluate((element, expected) => {
    const host = element as HTMLElement & {
      __escrevaralPositionContract?: { snapshot?: { text?: string } }
    }
    return host.__escrevaralPositionContract?.snapshot?.text === expected
  }, manuscript), {
    timeout: 8_000,
    intervals: [50, 100, 250],
  }).toBe(true)

  const before = await editor.innerText()
  await editor.click()
  await page.keyboard.press('Control+Home')
  for (let index = 0; index < 'Melancolia'.length; index += 1) await page.keyboard.press('Shift+ArrowRight')
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).toMatch(/melancolia/i)

  // A edição colocou a casa em foco total. Escape restaura a casa sem apagar
  // o snapshot lexical da seleção; só então a ação canônica volta a ser visível.
  await page.keyboard.press('Escape')
  await revealWords(page)

  await expect(page.getByLabel('Palavra ou expressão curta')).toHaveValue(/melancolia/i)
  await expect(page.locator('.lexical-reading')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No trecho' })).toBeVisible()
  await expect(page.locator('.lexical-context')).toContainText(manuscript)
  await expect(page.locator('.lexical-context mark')).toHaveText(/melancolia/i)
  await expect(editor).toHaveText(before)
})

test('consulta lexical nunca oferece substituição automática', async ({ page }) => {
  await openWords(page)
  await page.getByLabel('Palavra ou expressão curta').fill('canto')
  await page.getByRole('button', { name: 'Consultar', exact: true }).click()
  await expect(page.locator('.lexical-reading')).toBeVisible()
  await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
})

test('palavra sem leitura local recebe estado seguro', async ({ page }) => {
  await openWords(page)
  await page.getByLabel('Palavra ou expressão curta').fill('zzlexicalinexistente')
  await page.getByRole('button', { name: 'Consultar', exact: true }).click()
  await expect(page.locator('#panel-palavras .lexical-message')).toContainText(/não encontrei uma leitura local/i)
  await expect(page.locator('.lexical-reading')).toHaveCount(0)
})

test('painel Palavras cabe no drawer móvel sem overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openWords(page)

  const sizes = await page.evaluate(() => {
    const panel = document.querySelector('#panel-palavras')?.getBoundingClientRect()
    const rail = document.querySelector('.rail')
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      panelWidth: panel?.width ?? 0,
      railWidth: rail?.scrollWidth ?? 0,
      railClient: rail?.clientWidth ?? 0,
    }
  })

  expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewport)
  // getBoundingClientRect pode diferir por frações de pixel entre engines.
  expect(sizes.panelWidth).toBeLessThanOrEqual(sizes.railClient + 1)
  expect(sizes.railWidth).toBeLessThanOrEqual(sizes.railClient)
})
