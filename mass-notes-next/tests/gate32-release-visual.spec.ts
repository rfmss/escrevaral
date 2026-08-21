import { expect, test, type Page } from '@playwright/test'

/* ALERTA QA VISUAL -------------------------------------------------------
 * Verde funcional não equivale a release visual. Estados abertos de ferramenta
 * também são parte da casa e precisam permanecer coerentes com o papel claro.
 * Se um rail voltar a parecer um produto dark sobreposto, este gate deve cair.
 */

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper-shell')).toBeVisible()
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
}

for (const width of [1366, 1440, 1920]) {
  test(`Gate 32: geometria de release permanece íntegra em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await waitReady(page)

    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect()
      const shell = rect('.paper-shell')
      const left = rect('.left-rail')
      const workspace = rect('.workspace')
      const right = rect('.analysis-panel')
      const editor = rect('.editor.editor-shell.paper')
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        shellLeft: shell?.left ?? -1,
        shellRight: shell ? window.innerWidth - shell.right : -1,
        leftWidth: left?.width ?? 0,
        workspaceWidth: workspace?.width ?? 0,
        rightWidth: right?.width ?? 0,
        editorWidth: editor?.width ?? 0,
      }
    })

    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport)
    expect(Math.abs(geometry.shellLeft - geometry.shellRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.leftWidth - geometry.rightWidth)).toBeLessThanOrEqual(1)
    expect(geometry.workspaceWidth).toBeGreaterThan(500)
    expect(geometry.editorWidth).toBeGreaterThan(420)

    await page.screenshot({ path: `test-results/release-${width}.png`, fullPage: true })
  })
}

test('Gate 32: desktop baixo preserva espaço útil do manuscrito em 1366x768', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)?.getBoundingClientRect()
    const left = rect('.left-rail')
    const right = rect('.analysis-panel')
    const status = rect('.statusbar')
    const editorContent = document.querySelector<HTMLElement>('.editor .escrevaral-editor')
    return {
      editorPaddingTop: editorContent ? Number.parseFloat(getComputedStyle(editorContent).paddingTop) : 999,
      leftBottom: left?.bottom ?? 999,
      rightBottom: right?.bottom ?? 999,
      statusTop: status?.top ?? -1,
    }
  })

  expect(geometry.editorPaddingTop).toBeLessThanOrEqual(32)
  expect(geometry.leftBottom).toBeLessThanOrEqual(geometry.statusTop + 1)
  expect(geometry.rightBottom).toBeLessThanOrEqual(geometry.statusTop + 1)
})

test('Gate 32: consulta Palavras ocupa a coluna direita sem cobrir o manuscrito', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const trigger = page.getByRole('button', { name: 'Consultar palavras', exact: true })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const rail = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await expect(rail).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-lexical-open/)

  const geometry = await page.evaluate(() => {
    const workspace = document.querySelector('.workspace')?.getBoundingClientRect()
    const shellElement = document.querySelector<HTMLElement>('.paper-shell')
    const shell = shellElement?.getBoundingClientRect()
    const contextualElement = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
    const contextual = contextualElement?.getBoundingClientRect()
    const overlay = document.querySelector<HTMLElement>('.drawer-overlay')
    const tabs = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools .tabs')

    const luminance = (value: string) => {
      const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? []
      if (numbers.length !== 3) return 0
      const [r, g, b] = numbers.map((channel) => {
        const c = channel / 255
        return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)
      })
      return .2126 * r + .7152 * g + .0722 * b
    }

    const shellBackground = shellElement ? getComputedStyle(shellElement).backgroundColor : 'rgb(0, 0, 0)'
    const railBackground = contextualElement ? getComputedStyle(contextualElement).backgroundColor : 'rgb(0, 0, 0)'

    return {
      workspaceWidth: workspace?.width ?? 0,
      workspaceRight: workspace?.right ?? 0,
      railLeft: contextual?.left ?? 0,
      railRight: contextual?.right ?? 0,
      shellRight: shell?.right ?? 0,
      overlayDisplay: overlay ? getComputedStyle(overlay).display : 'none',
      tabsDisplay: tabs ? getComputedStyle(tabs).display : 'none',
      shellLuminance: luminance(shellBackground),
      railLuminance: luminance(railBackground),
    }
  })

  expect(geometry.workspaceWidth).toBeGreaterThanOrEqual(560)
  expect(geometry.railLeft).toBeGreaterThanOrEqual(geometry.workspaceRight - 1)
  expect(Math.abs(geometry.railRight - geometry.shellRight)).toBeLessThanOrEqual(1)
  expect(geometry.overlayDisplay).toBe('none')
  expect(geometry.tabsDisplay).toBe('none')
  expect(
    geometry.railLuminance,
    'ALERTA QA VISUAL: o rail Palavras voltou a uma superfície escura no tema claro',
  ).toBeGreaterThan(.55)
  expect(
    Math.abs(geometry.railLuminance - geometry.shellLuminance),
    'ALERTA QA VISUAL: o rail Palavras deixou de parecer parte da mesma casa de papel',
  ).toBeLessThan(.22)

  await page.screenshot({ path: 'test-results/release-1366-palavras.png', fullPage: true })
})

test('Gate 32: Oficina usa o mesmo rail lateral e mantém a régua de ferramentas', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  await page.getByRole('button', { name: 'Abrir oficina de ferramentas' }).click()
  const rail = page.locator('.reference-mobile-legacy #text-tools.rail.open')
  await expect(rail).toBeVisible()
  await expect(page.locator('body')).toHaveClass(/reference-tools-open/)

  const geometry = await page.evaluate(() => {
    const workspace = document.querySelector('.workspace')?.getBoundingClientRect()
    const contextual = document.querySelector('.reference-mobile-legacy #text-tools.rail.open')?.getBoundingClientRect()
    const tabs = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools .tabs')
    const overlay = document.querySelector<HTMLElement>('.drawer-overlay')
    return {
      workspaceRight: workspace?.right ?? 0,
      railLeft: contextual?.left ?? 0,
      tabsDisplay: tabs ? getComputedStyle(tabs).display : 'none',
      overlayDisplay: overlay ? getComputedStyle(overlay).display : 'none',
    }
  })

  expect(geometry.railLeft).toBeGreaterThanOrEqual(geometry.workspaceRight - 1)
  expect(geometry.tabsDisplay).not.toBe('none')
  expect(geometry.overlayDisplay).toBe('none')

  await page.screenshot({ path: 'test-results/release-1366-oficina.png', fullPage: true })
})

test('Gate 32: release móvel permanece contido em 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)

  await expect(page.getByRole('button', { name: 'Abrir arquivo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir ferramentas' })).toBeVisible()

  const geometry = await page.evaluate(() => {
    const editor = document.querySelector('.editor.editor-shell.paper')?.getBoundingClientRect()
    return {
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      editorLeft: editor?.left ?? -1,
      editorRight: editor ? window.innerWidth - editor.right : -1,
      editorWidth: editor?.width ?? 0,
    }
  })

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport)
  expect(geometry.editorLeft).toBeGreaterThanOrEqual(0)
  expect(geometry.editorRight).toBeGreaterThanOrEqual(0)
  expect(geometry.editorWidth).toBeGreaterThan(250)

  await page.screenshot({ path: 'test-results/release-390.png', fullPage: true })
})
