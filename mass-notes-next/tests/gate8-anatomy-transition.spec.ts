import { createHash } from 'node:crypto'
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

test('a prancha azul pertence ao canvas e nunca ao papel autoral', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)

  const assetResponse = await page.request.get('/assets/blueprint/anatomia-livro-render.webp')
  expect(assetResponse.ok()).toBe(true)
  const asset = await assetResponse.body()
  expect(asset.subarray(0, 4).toString('ascii')).toBe('RIFF')
  expect(asset.subarray(8, 12).toString('ascii')).toBe('WEBP')
  expect(asset.length).toBe(43_462)
  expect(createHash('sha256').update(asset).digest('hex')).toBe('9c1fd7429b09df2087f2ac38f0ddf097ed32719ac5dde02877303eaa0c25a028')

  await expect.poll(() => page.evaluate(async () => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--anatomy-blueprint-image')
    const match = raw.match(/url\(["']?(.*?)["']?\)/)
    if (!match) return false
    const image = new Image()
    image.src = match[1]
    try {
      await image.decode()
      return image.naturalWidth === 1_400 && image.naturalHeight === 788
    } catch {
      return false
    }
  })).toBe(true)

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

  expect(layers.assetVariable).toContain('anatomia-livro-render.webp')
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
  await expect(title).toHaveValue('CADERNO PRESERVADO NA ANATOMIA')

  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Abrir Anatomia do Livro' }).click()

  const press = page.locator('.page-press--anatomia')
  await expect(press).toBeVisible()
  await expect(press).toContainText('Anatomia do Livro')
  await expect(page.locator('.experience-view--editor .paper')).toHaveCount(1)
  await expect(page.locator('.anatomy-host')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })

  const frame = page.frameLocator('iframe[title="Anatomia interativa de um livro"]')
  await expect(frame.locator('#page-title')).toContainText(/Anatomia do Livro/i, { timeout: 12_000 })
  await expect(frame.locator('.stage-panel')).toBeVisible()
  await expect(frame.locator('#stage')).toBeVisible()
  await expect(frame.locator('#book')).toBeAttached()
  await expect(frame.locator('#pageFlipBook')).toBeAttached()
  await expect(frame.locator('.anatomia-header')).toBeHidden()
  const sky = await frame.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--sky').trim())
  expect(sky.toLowerCase()).toBe('#a9d4e4')
  await page.screenshot({ path: testInfo.outputPath('gate8-anatomy-host.png'), fullPage: true })

  await page.getByRole('button', { name: 'Voltar à mesa de escrita' }).click()
  await expect(page.locator('.page-press--editor')).toBeVisible()
  await expect(page.locator('.paper')).toBeVisible({ timeout: 5_000 })
  await expect(page.locator('.page-press')).toBeHidden({ timeout: 5_000 })
  await expect(title).toHaveValue('CADERNO PRESERVADO NA ANATOMIA')
})

test('o HTML servido é exatamente a derivação azul aprovada', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitEditor(page)
  await openAnatomy(page)

  const response = await page.request.get('/anatomia-do-livro.html')
  expect(response.ok()).toBe(true)
  const html = await response.text()
  expect(Buffer.byteLength(html)).toBe(208_728)
  expect(createHash('sha256').update(html).digest('hex')).toBe('d618b69aeab6551c5b0815024c8a9b7ec545ffe970776084be5e86b06a344fd8')
  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('Anatomia do Livro — Escrevaral')
  expect(html).toContain('StPageFlip 2.0.7')
  expect(html).toContain('--sky:#a9d4e4')
  expect(html).toContain('class="stage-panel"')
  expect(html).toContain('id="pageFlipBook"')
  expect(html).not.toContain('--paper:#f1e7d4')
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
