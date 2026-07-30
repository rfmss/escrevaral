import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.editor-viewport')).toBeVisible()
}

async function setText(page: Page, text: string) {
  const editor = page.getByLabel('Texto do documento')
  await editor.fill(text)
  await expect.poll(async () => (await editor.innerText()).trim()).toBe(text.trim())
  return editor
}

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 1440, height: 560 },
]) {
  test(`toolbar compacta ocupa uma linha em ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await waitReady(page)

    const metrics = await page.locator('.editor-toolbar').evaluate((toolbar) => {
      const buttons = [...toolbar.querySelectorAll('button')]
      const tops = buttons.map((button) => Math.round(button.getBoundingClientRect().top))
      const rect = toolbar.getBoundingClientRect()
      return {
        height: rect.height,
        rows: new Set(tops).size,
        scrollWidth: toolbar.scrollWidth,
        clientWidth: toolbar.clientWidth,
      }
    })

    expect(metrics.rows).toBe(1)
    expect(metrics.height).toBeLessThanOrEqual(48)
    expect(metrics.scrollWidth).toBeGreaterThanOrEqual(metrics.clientWidth)
  })
}

test('toolbar permanece colada ao viewport do manuscrito sem mover a janela', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 560 })
  await waitReady(page)
  const paragraph = 'Esta linha existe para comprovar a continuidade da escrita e a estabilidade dos controles.'
  await setText(page, Array.from({ length: 90 }, (_, index) => `${index + 1}. ${paragraph}`).join('\n\n'))

  const viewport = page.locator('.editor-viewport')
  await viewport.evaluate((element) => { element.scrollTop = Math.floor(element.scrollHeight * 0.55) })

  const geometry = await page.evaluate(() => {
    const scroll = document.querySelector<HTMLElement>('.editor-viewport')!
    const toolbar = document.querySelector<HTMLElement>('.editor-toolbar')!
    const scrollRect = scroll.getBoundingClientRect()
    const toolbarRect = toolbar.getBoundingClientRect()
    return {
      windowY: window.scrollY,
      scrollTop: scroll.scrollTop,
      distance: Math.abs(toolbarRect.top - scrollRect.top),
      toolbarBottom: toolbarRect.bottom,
      viewportBottom: scrollRect.bottom,
    }
  })

  expect(geometry.windowY).toBe(0)
  expect(geometry.scrollTop).toBeGreaterThan(0)
  expect(geometry.distance).toBeLessThanOrEqual(3)
  expect(geometry.toolbarBottom).toBeLessThan(geometry.viewportBottom)
})

test('faixa superior prioriza palavras, meta, foco e salvamento', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)
  await setText(page, 'Uma oficina acompanha palavras e preserva o ritmo da pessoa que escreve.')

  const dashboard = page.getByRole('region', { name: 'Painel da sessão de escrita' })
  await expect(dashboard).toBeVisible()
  await expect(dashboard.getByText('Palavras', { exact: true })).toBeVisible()
  await expect(dashboard.getByText('Meta', { exact: true })).toBeVisible()
  await expect(dashboard.getByText('Foco', { exact: true })).toBeVisible()
  await expect(dashboard.getByText('Última tinta', { exact: true })).toBeVisible()
  await expect(page.locator('[data-writing-word-count]')).toHaveText('12')

  const goal = page.getByLabel('Meta de palavras')
  await goal.fill('12')
  await expect(page.locator('[data-writing-goal-progress]')).toHaveAttribute('aria-valuenow', '12')
  await expect(page.locator('[data-writing-goal-progress]')).toHaveAttribute('aria-valuemax', '12')

  const focus = page.getByRole('button', { name: 'Iniciar foco' })
  await focus.click()
  await expect(page.getByRole('button', { name: 'Pausar foco' })).toBeVisible()
  await page.getByRole('button', { name: 'Pausar foco' }).click()
  await page.getByRole('button', { name: 'Reiniciar foco' }).click()
  await expect(page.locator('[data-focus-clock]')).toHaveText('25:00')
})

test('painel operacional cabe no viewport móvel sem rolagem global', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await waitReady(page)
  const dashboard = page.getByRole('region', { name: 'Painel da sessão de escrita' })
  await expect(dashboard).toBeVisible()
  await expect(page.getByLabel('Meta de palavras')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar foco' })).toBeVisible()

  const geometry = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    windowY: window.scrollY,
    dashboardWidth: document.querySelector<HTMLElement>('.writing-dashboard')?.getBoundingClientRect().width ?? 0,
  }))
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport + 1)
  expect(geometry.dashboardWidth).toBeLessThanOrEqual(geometry.viewport + 1)
  expect(geometry.windowY).toBe(0)
})

test('leitura de varre-lo-ei explica futuro do presente e mesóclise', async ({ page }) => {
  await waitReady(page)
  const source = 'Amanhã varre-lo-ei antes que as visitas cheguem.'
  await setText(page, source)

  await page.getByRole('tab', { name: 'palavras', exact: true }).click()
  await page.getByLabel('Palavra ou expressão curta').fill('varre-lo-ei')
  await page.getByRole('button', { name: 'Consultar' }).click()

  const reading = page.locator('.lexical-reading')
  await expect(reading).toBeVisible()
  await expect(reading).toContainText('Futuro do presente do indicativo')
  await expect(reading).toContainText('Mesóclise')
  await expect(reading).toContainText('varrerei')
  await expect(reading).toContainText('varrer + o + ei')
  await expect(reading).toContainText('varrê-lo-ei')
  await expect(reading).toContainText('eu o varrerei')
  await expect(reading).toContainText('eu vou varrê-lo')
  await expect(page.getByLabel('Texto do documento')).toContainText('varre-lo-ei')
})

test('assinatura técnica dá lugar a contato e canais essenciais', async ({ page }) => {
  await waitReady(page)
  const brand = page.locator('.brand')
  await expect(brand).not.toContainText('MOTOR TIPTAP')
  await expect(brand.getByRole('link', { name: 'Contato do desenvolvedor' })).toHaveAttribute('href', 'mailto:rafamass@proton.me')
  await expect(brand.getByRole('link', { name: 'Contato do Escrevaral' })).toHaveAttribute('href', 'mailto:oi@escrevaral.com')
  await expect(brand.getByRole('link', { name: 'Código do Escrevaral no GitHub' })).toHaveAttribute('href', 'https://github.com/rfmss/escrevaral')
  await expect(brand.getByRole('link', { name: 'Escrevaral no Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/escrevaral/')
  await expect(brand.getByRole('link', { name: 'Rafa Mass no X' })).toHaveAttribute('href', 'https://x.com/rafamass')
})
