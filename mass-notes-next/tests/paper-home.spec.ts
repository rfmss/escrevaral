import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function contrast(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((element) => {
    const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const luminance = (values: number[]) => {
      const channels = values.map((value) => {
        const normalized = value / 255
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
    }

    const foreground = parse(getComputedStyle(element).color)
    let background = getComputedStyle(element).backgroundColor
    let parent = element.parentElement
    while ((background === 'rgba(0, 0, 0, 0)' || background === 'transparent') && parent) {
      background = getComputedStyle(parent).backgroundColor
      parent = parent.parentElement
    }
    const fg = luminance(foreground)
    const bg = luminance(parse(background))
    return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
  })
}

test('a casa replica a moldura e as proporções-base aprovadas no desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect()
    const shell = rect('.app-shell')
    const sidebar = rect('.sidebar')
    const rail = rect('.rail')
    const toolbar = rect('.editor-toolbar')
    return {
      shell: { left: shell.left, top: shell.top, right: shell.right, bottom: shell.bottom, width: shell.width, height: shell.height },
      sidebar: { width: sidebar.width },
      rail: { width: rail.width },
      toolbar: { height: toolbar.height },
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
    }
  })

  expect(geometry.shell.left).toBeCloseTo(12, 0)
  expect(geometry.shell.top).toBeCloseTo(10, 0)
  expect(geometry.shell.right).toBeCloseTo(geometry.viewport.width - 20, 0)
  expect(geometry.shell.bottom).toBeCloseTo(geometry.viewport.height - 10, 0)
  expect(geometry.sidebar.width).toBeCloseTo(250, 0)
  expect(geometry.rail.width).toBeCloseTo(250, 0)
  expect(geometry.toolbar.height).toBeCloseTo(80, 0)
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport.width)
})

test('toolbar real do Tiptap ocupa uma única faixa e preserva estados distinguíveis', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const toolbar = page.locator('.editor-toolbar')
  const metrics = await toolbar.evaluate((element) => {
    const buttons = [...element.querySelectorAll('button')].map((button) => button.getBoundingClientRect())
    const top = Math.min(...buttons.map((button) => button.top))
    const bottom = Math.max(...buttons.map((button) => button.bottom))
    return {
      height: element.getBoundingClientRect().height,
      verticalSpread: bottom - top,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }
  })
  expect(metrics.height).toBeCloseTo(80, 0)
  expect(metrics.verticalSpread).toBeLessThanOrEqual(32)
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)

  const undo = page.getByRole('button', { name: 'Desfazer' })
  await expect(undo).toBeDisabled()
  const disabledColor = await undo.evaluate((element) => getComputedStyle(element).color)
  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.type('estado real')
  await expect(undo).toBeEnabled()
  const enabledColor = await undo.evaluate((element) => getComputedStyle(element).color)
  expect(enabledColor).not.toBe(disabledColor)
})

test('modo noite mantém texto e navegação legíveis na nova casa', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Alternar papel / noite' }).click()
  await expect(page.locator('body')).toHaveClass(/night/)

  expect(await contrast(page, '.escrevaral-editor')).toBeGreaterThanOrEqual(7)
  expect(await contrast(page, '.tab:not(.active)')).toBeGreaterThanOrEqual(4.5)
  expect(await contrast(page, '.note-card:not(.active) .note-title')).toBeGreaterThanOrEqual(4.5)
})

test('a casa abre por padrão e a escrita silenciosa continua reversível', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await expect(page.locator('body')).toHaveClass(/workshop-open/)
  await expect(page.locator('.sidebar')).toBeVisible()
  await expect(page.locator('.rail')).toBeVisible()
  await expect(page.locator('.editor-toolbar')).toBeVisible()

  await page.getByRole('button', { name: 'Voltar à escrita silenciosa' }).click()
  await expect(page.locator('body')).not.toHaveClass(/workshop-open/)
  await expect(page.locator('.sidebar')).toBeHidden()
  await expect(page.locator('.rail')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' })).toBeVisible()

  await page.getByRole('button', { name: 'Abrir a oficina do Escrevaral' }).click()
  await expect(page.locator('body')).toHaveClass(/workshop-open/)
  await expect(page.locator('.sidebar')).toBeVisible()
})

test('tablet mantém o shell estabilizado, sem adotar a geometria desktop à força', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)
  await expect(page.getByRole('button', { name: 'Abrir arquivo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir ferramentas' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await expect(page.locator('.ProseMirror')).toBeEditable()
})
