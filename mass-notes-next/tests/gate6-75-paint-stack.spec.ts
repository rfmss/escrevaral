import { writeFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('diagnóstico temporário do empilhamento do papel', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Um motor basta para o diagnóstico de pintura.')
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect.poll(() => page.locator('.paper').evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1)

  const report = await page.evaluate(() => {
    const paper = document.querySelector('.paper')!.getBoundingClientRect()
    const x = paper.left + paper.width / 2
    const y = Math.min(paper.bottom - 90, paper.top + 520)
    const stack = document.elementsFromPoint(x, y).map((element) => {
      const style = getComputedStyle(element)
      return {
        tag: element.tagName,
        className: element instanceof HTMLElement ? element.className : '',
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        opacity: style.opacity,
        mixBlendMode: style.mixBlendMode,
        isolation: style.isolation,
        zIndex: style.zIndex,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        pointerEvents: style.pointerEvents,
      }
    })

    return { x, y, stack }
  })

  writeFileSync('test-results/blueprint-paint-stack.json', JSON.stringify(report, null, 2))
  await page.screenshot({ path: 'test-results/blueprint-paint-1-normal.png', fullPage: true })

  await page.evaluate(() => {
    for (const selector of ['.grain', '.halftone']) {
      const element = document.querySelector<HTMLElement>(selector)
      if (element) element.style.display = 'none'
    }
  })
  await page.screenshot({ path: 'test-results/blueprint-paint-2-no-texture.png', fullPage: true })

  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('.blueprint')
    if (element) element.style.display = 'none'
  })
  await page.screenshot({ path: 'test-results/blueprint-paint-3-no-blueprint.png', fullPage: true })

  await page.locator('.paper').evaluate((element) => {
    element.style.background = 'rgb(243, 238, 228)'
  })
  await page.screenshot({ path: 'test-results/blueprint-paint-4-solid-paper.png', fullPage: true })

  expect(report.stack.some((entry) => String(entry.className).includes('paper'))).toBe(true)
})
