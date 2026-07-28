import { expect, test, type Page } from '@playwright/test'

async function waitEditor(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
  await expect.poll(() => page.locator('.paper').evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1)
}

async function openAnatomy(page: Page) {
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  await expect(page.locator('.page-press--anatomia')).toBeVisible()
  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
}

test('a arte de Anatomia pertence ao canvas e nunca ao papel autoral', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  const layers = await page.evaluate(() => {
    const editorShell = document.querySelector('.editor-shell')!
    const paper = document.querySelector('.paper')!
    const canvas = getComputedStyle(editorShell, '::before')
    const paperStyle = getComputedStyle(paper)

    return {
      canvasImage: canvas.backgroundImage,
      canvasPointerEvents: canvas.pointerEvents,
      canvasOpacity: Number(canvas.opacity),
      paperImage: paperStyle.backgroundImage,
      assetVariable: getComputedStyle(document.documentElement).getPropertyValue('--anatomy-blueprint-image').trim(),
    }
  })

  expect(layers.assetVariable).toContain('anatomia-livro.webp')
  expect(layers.canvasImage).toContain('anatomia-livro.webp')
  expect(layers.canvasPointerEvents).toBe('none')
  expect(layers.canvasOpacity).toBeGreaterThan(0)
  expect(layers.canvasOpacity).toBeLessThan(0.5)
  expect(layers.paperImage).not.toContain('anatomia-livro.webp')
})

test('Ferramentas abre a Anatomia com a Prensa e preserva o editor montado', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  const title = page.getByRole('textbox', { name: 'Título do documento' })
  await title.fill('CADERNO PRESERVADO NA ANATOMIA')
  await expect(title).toHaveValue('CADERNO PRESERVADO NA ANATOMIA')

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()

  const press = page.locator('.page-press--anatomia')
  await expect(press).toBeVisible()
  await expect(press).toContainText('Anatomia do Livro')
  await expect(page.locator('.experience-view--editor .paper')).toHaveCount(1)

  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
  await expect(page.getByTitle('Anatomia interativa de um livro')).toBeVisible()

  const frame = page.frameLocator('iframe[title="Anatomia interativa de um livro"]')
  await expect(frame.locator('body')).toBeVisible({ timeout: 12_000 })
  await expect(frame.locator('body')).toContainText(/Anatomia do Livro/i)

  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.page-press--editor')).toBeVisible()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
  await expect(title).toHaveValue('CADERNO PRESERVADO NA ANATOMIA')
})

test('o HTML de Anatomia é servido como documento independente no iframe', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)
  await openAnatomy(page)

  const response = await page.request.get('/anatomia-do-livro.html')
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('Anatomia do Livro')

  const frame = page.frameLocator('iframe[title="Anatomia interativa de um livro"]')
  await expect(frame.locator('.anatomia-header')).toBeHidden({ timeout: 12_000 })
})

test('movimento reduzido mantém a navegação funcional e não prende a cortina', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 2_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 2_000 })

  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 2_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 2_000 })
})

test('Anatomia e retorno não criam overflow horizontal no viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitEditor(page)

  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 5_000 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})
