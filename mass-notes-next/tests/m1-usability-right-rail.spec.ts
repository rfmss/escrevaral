import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.getByLabel('Texto do documento')).toBeEditable()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
}

async function assertRightRailScrolls(page: Page, mobile: boolean) {
  if (mobile) {
    await page.getByRole('button', { name: 'Abrir ferramentas' }).click()
    await expect(page.getByRole('dialog', { name: 'Ferramentas do texto' })).toBeVisible()
  }

  await page.getByRole('tab', { name: 'pulso', exact: true }).click()
  const scroller = page.locator('.rail-scroll')
  await expect(scroller).toBeVisible()

  const geometry = await scroller.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      overflowY: style.overflowY,
    }
  })

  expect(geometry.clientHeight).toBeGreaterThan(100)
  expect(geometry.scrollHeight).toBeGreaterThan(geometry.clientHeight + 20)
  expect(['auto', 'scroll']).toContain(geometry.overflowY)

  await scroller.evaluate((element) => { element.scrollTop = 0 })
  await scroller.hover()
  await page.mouse.wheel(0, 520)
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(40)

  await expect(scroller).toHaveAttribute('tabindex', '0')
  await scroller.focus()
  await page.keyboard.press('End')
  await expect.poll(() => scroller.evaluate((element) =>
    Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop),
  )).toBeLessThanOrEqual(2)

  await expect(page.getByRole('button', { name: 'Ler o texto' })).toBeInViewport()
}

test('lateral direita rola por roda e teclado no desktop baixo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 })
  await waitReady(page)
  await assertRightRailScrolls(page, false)
})

test('drawer de ferramentas rola por roda e teclado no viewport móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await waitReady(page)
  await assertRightRailScrolls(page, true)
})
