import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
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

function rgb(value: string): [number, number, number] {
  const numbers = value.match(/[\d.]+/g)?.slice(0, 3).map(Number)
  if (!numbers || numbers.length !== 3) throw new Error(`Cor não reconhecida: ${value}`)
  return numbers as [number, number, number]
}

async function contrastAgainstToken(page: Page, selector: string, token: string): Promise<number> {
  const values = await page.locator(selector).first().evaluate((element, tokenName) => {
    const styles = getComputedStyle(element)
    const probe = document.createElement('span')
    probe.style.color = getComputedStyle(document.body).getPropertyValue(tokenName).trim()
    document.body.appendChild(probe)
    const background = getComputedStyle(probe).color
    probe.remove()
    return { foreground: styles.color, background }
  }, token)
  return contrastRatio(rgb(values.foreground), rgb(values.background))
}

test('modo noite mantém textos e controles essenciais legíveis', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await page.getByRole('tab', { name: 'ferramentas', exact: true }).click()
  await page.getByRole('button', { name: 'Alternar papel / noite' }).click()
  await expect(page.locator('body')).toHaveClass(/night/)

  expect(await contrastAgainstToken(page, '.tab:not(.active)', '--ui-panel')).toBeGreaterThanOrEqual(4.5)
  expect(await contrastAgainstToken(page, '.note-card:not(.active) .note-title', '--ui-panel')).toBeGreaterThanOrEqual(4.5)
  expect(await contrastAgainstToken(page, '.action:not(.primary)', '--ui-control')).toBeGreaterThanOrEqual(4.5)
  expect(await contrastAgainstToken(page, '.shortcut', '--ui-panel')).toBeGreaterThanOrEqual(4.5)
  expect(await contrastAgainstToken(page, '.escrevaral-editor', '--ui-panel')).toBeGreaterThanOrEqual(7)

  await page.screenshot({ path: 'test-results/gate6-5-night-desktop.png', fullPage: true })
})

test('toolbar cabe em 1366 sem corte ou rolagem horizontal silenciosa', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const geometry = await page.locator('.editor-toolbar').evaluate((toolbar) => {
    const box = toolbar.getBoundingClientRect()
    const buttons = [...toolbar.querySelectorAll('button')].map((button) => {
      const rect = button.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    })
    return {
      clientWidth: toolbar.clientWidth,
      scrollWidth: toolbar.scrollWidth,
      overflowX: getComputedStyle(toolbar).overflowX,
      allInside: buttons.every((button) => button.left >= box.left - 1 && button.right <= box.right + 1),
    }
  })

  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
  expect(geometry.overflowX).not.toBe('hidden')
  expect(geometry.allInside).toBe(true)

  for (const title of ['Título de nível 1', 'Negrito', 'Lista numerada', 'Adicionar ou editar link', 'Limpar formatação do bloco e da seleção']) {
    await expect(page.locator(`.editor-toolbar button[title="${title}"]`)).toHaveCount(1)
  }
})

test('em 1024 o manuscrito ocupa a tela e os rails funcionam como drawers', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  await waitReady(page)

  await expect(page.getByRole('button', { name: 'Abrir arquivo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abrir ferramentas' })).toBeVisible()

  const initial = await page.locator('.sidebar').evaluate((element) => ({
    position: getComputedStyle(element).position,
    right: element.getBoundingClientRect().right,
  }))
  expect(initial.position).toBe('fixed')
  expect(initial.right).toBeLessThanOrEqual(1)

  await page.getByRole('button', { name: 'Abrir arquivo' }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/open/)
  await expect(page.locator('.sidebar')).toHaveAttribute('role', 'dialog')
  await page.keyboard.press('Escape')
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/)

  const paperWidth = await page.locator('.paper').evaluate((element) => element.getBoundingClientRect().width)
  expect(paperWidth).toBeGreaterThan(760)
})

test('breakpoints não criam overflow horizontal', async ({ page }) => {
  for (const width of [1440, 1366, 1024, 820, 430, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 768 })
    await waitReady(page)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  }
})

test('estados ativo, inativo e desabilitado permanecem distinguíveis', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const undo = page.getByRole('button', { name: 'Desfazer' })
  await expect(undo).toBeDisabled()
  const disabled = await undo.evaluate((element) => ({ color: getComputedStyle(element).color, opacity: getComputedStyle(element).opacity }))
  expect(disabled.opacity).toBe('1')

  const editor = page.locator('.ProseMirror')
  await editor.click()
  await page.keyboard.type('mudança')
  await expect(undo).toBeEnabled()
  const enabledColor = await undo.evaluate((element) => getComputedStyle(element).color)
  expect(enabledColor).not.toBe(disabled.color)

  await page.getByRole('button', { name: 'N', exact: true }).click()
  const active = await page.getByRole('button', { name: 'N', exact: true }).evaluate((element) => ({
    color: getComputedStyle(element).color,
    background: getComputedStyle(element).backgroundColor,
  }))
  expect(active.color).not.toBe(active.background)
})
