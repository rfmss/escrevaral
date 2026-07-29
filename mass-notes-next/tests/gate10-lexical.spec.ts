import { expect, test, type Page } from '@playwright/test'

async function openWords(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.locator('#panel-palavras')).toBeVisible()
}

test('busca lexical local apresenta definição e evita classe falsa sem contexto', async ({ page }) => {
  await openWords(page)
  const input = page.getByLabel('Palavra ou expressão curta')
  await input.fill('melancolia')
  await page.getByRole('button', { name: 'Consultar' }).click()

  const reading = page.locator('.lexical-reading')
  await expect(page.getByRole('heading', { name: 'melancolia', exact: false })).toBeVisible()
  await expect(reading).toContainText(/tristeza difusa/i)
  await expect(reading).toContainText('Classe não determinada sem contexto')
  await expect(reading).toContainText('Ocorrências')
})

test('seleção do Tiptap permanece disponível ao abrir Palavras e não altera o manuscrito', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  await expect(editor).toBeEditable()
  await editor.fill('Melancolia atravessa a casa sem pedir licença.')
  await expect(editor).toContainText('Melancolia atravessa')
  const before = await editor.innerText()

  await editor.click()
  await page.keyboard.press('Home')
  for (let index = 0; index < 'Melancolia'.length; index += 1) await page.keyboard.press('Shift+ArrowRight')

  const opener = page.getByRole('button', { name: 'Abrir ferramentas' })
  if (await opener.isVisible()) await opener.click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()

  await expect(page.getByLabel('Palavra ou expressão curta')).toHaveValue(/melancolia/i)
  await expect(page.locator('.lexical-reading')).toBeVisible()
  await expect(editor).toHaveText(before)
})

test('consulta lexical nunca oferece substituição automática', async ({ page }) => {
  await openWords(page)
  await page.getByLabel('Palavra ou expressão curta').fill('canto')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.locator('.lexical-reading')).toBeVisible()
  await expect(page.getByRole('button', { name: /substituir|trocar|aplicar/i })).toHaveCount(0)
})

test('palavra sem leitura local recebe estado seguro', async ({ page }) => {
  await openWords(page)
  await page.getByLabel('Palavra ou expressão curta').fill('zzlexicalinexistente')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.getByRole('status')).toContainText(/não encontrei uma leitura local/i)
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
  expect(sizes.panelWidth).toBeLessThanOrEqual(sizes.railClient)
  expect(sizes.railWidth).toBeLessThanOrEqual(sizes.railClient)
})
