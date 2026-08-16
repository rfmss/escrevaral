import { expect, test } from 'playwright/test'

async function waitReady(page: import('playwright/test').Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function openWorkshop(page: import('playwright/test').Page) {
  const reveal = page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })
  if (await reveal.isVisible().catch(() => false)) await reveal.click()
  await expect(page.locator('body')).toHaveClass(/workshop-open/)
  await expect(page.getByRole('button', { name: 'Voltar à escrita silenciosa' })).toBeVisible()
}

async function expectTitleFits(page: import('playwright/test').Page) {
  const title = page.getByLabel('Título do documento')
  await expect.poll(() => title.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true)
}

test('inicia pela nova casa e mantém a escrita silenciosa reversível', async ({ page }) => {
  await waitReady(page)

  await expect(page.locator('body')).toHaveClass(/writing-rest/)
  await expect(page.locator('body')).toHaveClass(/workshop-open/)
  await expect(page.locator('.ProseMirror')).toBeEditable()
  await expect(page.locator('.sidebar')).toBeVisible()
  await expect(page.locator('.rail')).toBeVisible()
  await expect(page.locator('.editor-toolbar')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Voltar à escrita silenciosa' })).toBeVisible()
  await expectTitleFits(page)

  await page.getByRole('button', { name: 'Voltar à escrita silenciosa' }).click()
  await expect(page.locator('body')).not.toHaveClass(/workshop-open/)
  await expect(page.locator('.sidebar')).toBeHidden()
  await expect(page.locator('.rail')).toBeHidden()
  await expect(page.locator('.editor-toolbar')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })).toBeVisible()

  await openWorkshop(page)
  await expect(page.locator('.sidebar')).toBeVisible()
  await expect(page.locator('.rail')).toBeVisible()
  await page.screenshot({ path: 'test-results/mass-notes-next-desktop.png', fullPage: true })
})

test('ações permanecem na oficina e a marca da nova casa continua identificável', async ({ page }) => {
  await waitReady(page)
  await openWorkshop(page)

  const brand = page.locator('.brand')
  await expect(brand.getByRole('heading', { name: 'Escrevaral' })).toHaveCount(1)
  const mark = await brand.evaluate((node) => ({
    name: getComputedStyle(node, '::before').content,
    tagline: getComputedStyle(node, '::after').content,
  }))
  expect(mark.name).toContain('ESCREVARAL')
  expect(mark.tagline).toContain('ESCRITA COM INTENÇÃO')

  const readButton = page.getByRole('button', { name: 'Ler o texto', exact: true })
  await expect(readButton).toBeVisible()
  await readButton.click()
  await expect(page.getByRole('tab', { name: 'revisao', exact: true })).toHaveAttribute('aria-selected', 'true')
})

test('Enter após T1 cria parágrafo e a junção padrão permanece reversível', async ({ page }) => {
  await waitReady(page)
  await openWorkshop(page)
  await page.keyboard.press('Control+N')
  await page.getByLabel('Título do documento').fill('Estrutura segura')
  await page.getByRole('button', { name: 'T1', exact: true }).click()
  await page.locator('.ProseMirror').pressSequentially('Título principal')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Parágrafo independente')

  const editor = page.locator('.ProseMirror')
  await expect(editor.locator('h1')).toHaveText('Título principal')
  await expect(editor.locator('p').first()).toContainText('Parágrafo independente')

  await page.waitForTimeout(800)
  await page.keyboard.press('Home')
  await page.keyboard.press('Backspace')
  await expect(editor.locator('h1')).toContainText('Título principalParágrafo independente')

  await page.keyboard.press('Control+z')
  await expect(editor.locator('h1')).toHaveText('Título principal')
  await expect(editor.locator('p').first()).toContainText('Parágrafo independente')
})

test('duas abas não sobrescrevem silenciosamente o mesmo documento', async ({ context, page }) => {
  await waitReady(page)
  const second = await context.newPage()
  await waitReady(second)

  await page.getByLabel('Título do documento').fill('Versão da aba A')
  await page.waitForTimeout(100)
  await second.getByLabel('Título do documento').fill('Versão da aba B')
  await expect(second.getByRole('alert')).toContainText('Outra aba também alterou')
  await expect(second.getByText('Nenhuma versão será apagada silenciosamente.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Título do documento')).toHaveValue('Versão da aba A')
})

test('a engine real de revisão continua acessível quando a oficina é convocada', async ({ page }) => {
  await waitReady(page)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Ela entrou para dentro da casa. O coração acelerou, o coração acelerou.')
  await openWorkshop(page)
  await page.getByRole('tab', { name: 'revisao', exact: true }).click()
  await page.getByRole('button', { name: 'Analisar em português brasileiro' }).click()
  await expect(page.getByRole('status')).toHaveText(/observa|Nenhuma|página está vazia/i, { timeout: 15_000 })
})

test('mobile não cria overflow e mantém drawers fecháveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expectTitleFits(page)
  await page.getByRole('button', { name: 'Abrir arquivo' }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/open/)
  await page.keyboard.press('Escape')
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/)
  await page.screenshot({ path: 'test-results/mass-notes-next-mobile.png', fullPage: true })
})
