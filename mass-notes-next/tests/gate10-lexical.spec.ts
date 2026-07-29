import { expect, test } from '@playwright/test'

async function openWords(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
}

test('busca lexical local apresenta definição, classe e ocorrência', async ({ page }) => {
  await openWords(page)
  const input = page.getByLabel('Palavra ou expressão curta')
  await input.fill('melancolia')
  await page.getByRole('button', { name: 'Consultar' }).click()
  await expect(page.getByRole('heading', { name: 'melancolia', exact: false })).toBeVisible()
  await expect(page.locator('.lexical-reading')).toContainText('Substantivo')
  await expect(page.locator('.lexical-reading')).toContainText('Ocorrências')
})

test('seleção do Tiptap alimenta Palavras sem alterar o manuscrito', async ({ page }) => {
  await page.goto('/')
  const editor = page.getByLabel('Texto do documento')
  const before = await editor.innerText()
  await editor.evaluate((element) => {
    const node = element.firstChild?.firstChild ?? element.firstChild
    if (!node) return
    const range = document.createRange()
    range.setStart(node, 0)
    range.setEnd(node, Math.min(5, node.textContent?.length ?? 0))
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    element.dispatchEvent(new Event('mouseup', { bubbles: true }))
  })
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await expect(page.getByLabel('Palavra ou expressão curta')).not.toHaveValue('')
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
  await expect(page.getByRole('status')).toBeVisible()
})

test('painel Palavras cabe no drawer móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openWords(page)
  const panel = page.locator('#panel-palavras')
  await expect(panel).toBeVisible()
  const box = await panel.boundingBox()
  expect(box).not.toBeNull()
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(391)
})
