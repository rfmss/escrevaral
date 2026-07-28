import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

function rgb(value: string): [number, number, number] {
  const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  if (!numbers || numbers.length !== 3) throw new Error(`Cor não reconhecida: ${value}`)
  return numbers as [number, number, number]
}

function contrastRatio(first: [number, number, number], second: [number, number, number]): number {
  const luminance = ([red, green, blue]: [number, number, number]) => {
    const channels = [red, green, blue].map((value) => {
      const normalized = value / 255
      return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

async function elementContrast(page: Page, selector: string): Promise<number> {
  const values = await page.locator(selector).first().evaluate((element) => {
    const styles = getComputedStyle(element)
    let background = styles.backgroundColor
    let parent = element.parentElement

    while ((background === 'rgba(0, 0, 0, 0)' || background === 'transparent') && parent) {
      background = getComputedStyle(parent).backgroundColor
      parent = parent.parentElement
    }

    return { foreground: styles.color, background }
  })

  return contrastRatio(rgb(values.foreground), rgb(values.background))
}

test('tokens e atmosfera Blueprint estão ativos no papel', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const theme = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const body = getComputedStyle(document.body)
    const blueprint = getComputedStyle(document.querySelector('.blueprint')!)

    return {
      ink: root.getPropertyValue('--bp-ink').trim(),
      paper: root.getPropertyValue('--bp-paper').trim(),
      cyan: root.getPropertyValue('--bp-cyan').trim(),
      cyanStrong: root.getPropertyValue('--bp-cyan-strong').trim(),
      orange: root.getPropertyValue('--bp-orange').trim(),
      red: root.getPropertyValue('--bp-red').trim(),
      bodyBackground: body.backgroundImage,
      blueprintBackground: blueprint.backgroundImage,
      blueprintPointerEvents: blueprint.pointerEvents,
    }
  })

  expect(theme).toMatchObject({
    ink: '#161817',
    paper: '#f3eee4',
    cyan: '#86c7df',
    cyanStrong: '#36a7d2',
    orange: '#ff5a19',
    red: '#e31b36',
    blueprintPointerEvents: 'none',
  })
  expect(theme.bodyBackground).toContain('radial-gradient')
  expect(theme.bodyBackground.match(/linear-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  expect(theme.blueprintBackground).toContain('repeating-linear-gradient')
  expect(await elementContrast(page, '.escrevaral-editor')).toBeGreaterThanOrEqual(7)

  await page.screenshot({ path: 'test-results/gate6-75-blueprint-paper.png', fullPage: true })
})

test('modo noite mantém a linguagem Blueprint e contraste alto', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Alternar papel / noite' }).click()
  await expect(page.locator('body')).toHaveClass(/night/)

  const values = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    return {
      canvas: root.getPropertyValue('--bp-canvas').trim(),
      panel: root.getPropertyValue('--bp-panel').trim(),
      text: root.getPropertyValue('--ui-text').trim(),
    }
  })

  expect(values.canvas).toBe('#123442')
  expect(values.panel).toBe('#202628')
  expect(values.text).toBe('#f4f0e9')
  expect(await elementContrast(page, '.escrevaral-editor')).toBeGreaterThanOrEqual(7)
  expect(await elementContrast(page, '.tab:not(.active)')).toBeGreaterThanOrEqual(4.5)

  await page.screenshot({ path: 'test-results/gate6-75-blueprint-night.png', fullPage: true })
})

test('a skin preserva a geometria desktop aprovada', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const geometry = await page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect()
      return { left: rect.left, right: rect.right, width: rect.width, top: rect.top, bottom: rect.bottom }
    }

    return {
      sidebar: box('.sidebar'),
      workspace: box('.workspace'),
      rail: box('.rail'),
      paper: box('.paper'),
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }
  })

  expect(geometry.sidebar.left).toBeCloseTo(0, 0)
  expect(geometry.sidebar.width).toBeCloseTo(248, 0)
  expect(geometry.rail.width).toBeCloseTo(252, 0)
  expect(geometry.rail.right).toBeCloseTo(geometry.viewport, 0)
  expect(geometry.workspace.left).toBeCloseTo(geometry.sidebar.right, 0)
  expect(geometry.workspace.right).toBeCloseTo(geometry.rail.left, 0)
  expect(geometry.paper.left).toBeGreaterThanOrEqual(geometry.workspace.left)
  expect(geometry.paper.right).toBeLessThanOrEqual(geometry.workspace.right)
  expect(geometry.paper.width).toBeGreaterThan(700)
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport)
})

test('camadas Blueprint não bloqueiam os controles existentes', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const centerLayer = await page.evaluate(() => {
    const paper = document.querySelector('.paper')!.getBoundingClientRect()
    const element = document.elementFromPoint(paper.left + paper.width / 2, paper.top + 24)
    return {
      className: element instanceof HTMLElement ? element.className : '',
      blueprintPointerEvents: getComputedStyle(document.querySelector('.blueprint')!).pointerEvents,
    }
  })

  expect(centerLayer.blueprintPointerEvents).toBe('none')
  expect(centerLayer.className).not.toContain('blueprint')

  const search = page.getByRole('searchbox', { name: 'Buscar no arquivo' })
  await search.fill('cena')
  await expect(search).toHaveValue('cena')

  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.type(' blueprint')
  await expect(editor).toContainText('blueprint')
})

test('o filho visual permanece íntegro em todos os breakpoints', async ({ page }) => {
  for (const width of [1440, 1366, 1280, 1024, 820, 430, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 768 })
    await waitReady(page)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

    if (width <= 1040) {
      await expect(page.getByRole('button', { name: 'Abrir arquivo' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Abrir ferramentas' })).toBeVisible()
    }
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await waitReady(page)
  await page.screenshot({ path: 'test-results/gate6-75-blueprint-mobile.png', fullPage: true })
})
