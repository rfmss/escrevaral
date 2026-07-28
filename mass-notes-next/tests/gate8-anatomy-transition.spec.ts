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

test('a prancha técnica pertence ao canvas e nunca ao papel autoral', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  const response = await page.request.get('/assets/blueprint/anatomia-livro-render.webp')
  expect(response.ok()).toBe(true)
  const asset = await response.body()
  expect(asset.length).toBeGreaterThan(1_000)
  expect(asset.subarray(0, 4).toString('ascii')).toBe('RIFF')
  expect(asset.subarray(8, 12).toString('ascii')).toBe('WEBP')

  await expect.poll(() => page.evaluate(async () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--anatomy-blueprint-image')
    const match = raw.match(/url\(["']?(.*?)["']?\)/)
    if (!match) return false
    const image = new Image()
    image.src = match[1]
    try {
      await image.decode()
      return image.naturalWidth >= 500 && image.naturalHeight >= 300
    } catch {
      return false
    }
  })).toBe(true)

  const layers = await page.evaluate(() => {
    const canvas = getComputedStyle(document.querySelector('.editor-shell')!, '::before')
    const paper = getComputedStyle(document.querySelector('.paper')!)
    return {
      canvasImage: canvas.backgroundImage,
      canvasPointerEvents: canvas.pointerEvents,
      canvasOpacity: Number(canvas.opacity),
      paperImage: paper.backgroundImage,
    }
  })
  expect(layers.canvasImage).toContain('anatomia-livro-render.webp')
  expect(layers.canvasPointerEvents).toBe('none')
  expect(layers.canvasOpacity).toBeGreaterThan(0)
  expect(layers.canvasOpacity).toBeLessThan(0.75)
  expect(layers.paperImage).not.toContain('anatomia-livro-render.webp')
  await page.screenshot({ path: testInfo.outputPath('gate8-blueprint-background.png'), fullPage: true })
})

test('Ferramentas abre a Anatomia azul e preserva o editor montado', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  const title = page.getByRole('textbox', { name: 'Título do documento' })
  await title.fill('CADERNO PRESERVADO NA ANATOMIA')

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()
  await expect(page.locator('.page-press--anatomia')).toBeVisible()
  await expect(page.locator('.experience-view--editor .paper')).toHaveCount(1)
  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })

  const frame = page.frameLocator('iframe[title="Anatomia interativa de um livro"]')
  await expect(frame.locator('#page-title')).toContainText('Anatomia do Livro', { timeout: 12_000 })
  await expect(frame.locator('.stage-panel')).toBeVisible()
  await expect(frame.locator('#stage')).toBeVisible()
  await expect(frame.locator('#pageFlipBook')).toBeVisible()
  await expect(frame.locator('.anatomia-header')).toBeHidden()
  const sky = await frame.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--sky').trim())
  expect(sky.toLowerCase()).toBe('#a9d4e4')
  await expect(frame.locator('body')).not.toContainText('A Cartografia do Esquecimento')
  await page.screenshot({ path: testInfo.outputPath('gate8-anatomy-host.png'), fullPage: true })

  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.page-press--editor')).toBeVisible()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
  await expect(title).toHaveValue('CADERNO PRESERVADO NA ANATOMIA')
})

test('o HTML público é azul, direto e não contém a versão marrom', async ({ page }) => {
  const response = await page.request.get('/anatomia-do-livro.html')
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(Buffer.byteLength(html)).toBeGreaterThan(5_000)
  expect(html).toContain('Anatomia do Livro — Escrevaral')
  expect(html).toContain('page-flip@2.0.7')
  expect(html).toContain('--sky:#a9d4e4')
  expect(html).toContain('class="stage-panel"')
  expect(html).toContain('id="pageFlipBook"')
  expect(html).not.toContain('--paper:#f1e7d4')
  expect(html).not.toContain('A Cartografia do Esquecimento')
})

test('movimento reduzido mantém a navegação funcional e não prende a cortina', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)
  await openAnatomy(page)
  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 2_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 2_000 })
})

test('Anatomia e retorno não criam overflow horizontal no viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitEditor(page)
  await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
  await openAnatomy(page)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 5_000 })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})
