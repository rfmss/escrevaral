import { expect, test, type Page } from '@playwright/test'

async function waitReady(page: Page) {
  await page.goto('/')
  await expect(page.locator('.paper')).toBeVisible()
  await expect(page.locator('.field-value').filter({ hasText: /Salvo|Alterado/ })).toBeVisible()
  await expect.poll(() => page.locator('.paper').evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1)
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

test('o selo SCR VRL apoia o wordmark e o verniz material preserva a composição', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const visual = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const sidebarElement = document.querySelector<HTMLElement>('.sidebar')!
    const railElement = document.querySelector<HTMLElement>('.rail')!
    const paperElement = document.querySelector<HTMLElement>('.paper')!
    const brandElement = document.querySelector<HTMLElement>('.brand')!
    const eyebrowElement = brandElement.querySelector<HTMLElement>('.eyebrow')!
    const wordmarkElement = brandElement.querySelector<HTMLElement>('h1')!
    const linksElement = brandElement.querySelector<HTMLElement>('.brand-links')!

    const sidebar = getComputedStyle(sidebarElement)
    const rail = getComputedStyle(railElement)
    const paper = getComputedStyle(paperElement)
    const wordmark = getComputedStyle(wordmarkElement)
    const seal = getComputedStyle(brandElement, '::before')
    const sealFrame = getComputedStyle(brandElement, '::after')
    const brandRect = brandElement.getBoundingClientRect()
    const eyebrowRect = eyebrowElement.getBoundingClientRect()
    const wordmarkRect = wordmarkElement.getBoundingClientRect()
    const linksRect = linksElement.getBoundingClientRect()

    return {
      indigo: root.getPropertyValue('--esv-indigo').trim(),
      indigoDeep: root.getPropertyValue('--esv-indigo-deep').trim(),
      sepia: root.getPropertyValue('--esv-sepia').trim(),
      paperToken: root.getPropertyValue('--esv-paper').trim(),
      cream: root.getPropertyValue('--esv-cream').trim(),
      oxide: root.getPropertyValue('--esv-oxide').trim(),
      sidebarBackground: sidebar.backgroundColor,
      sidebarImage: sidebar.backgroundImage,
      railBackground: rail.backgroundColor,
      paperBackground: paper.backgroundColor,
      paperImage: paper.backgroundImage,
      paperSize: paper.backgroundSize,
      paperRepeat: paper.backgroundRepeat,
      sealContent: seal.content,
      sealDisplay: seal.display,
      sealLeft: Number.parseFloat(seal.left),
      sealTop: Number.parseFloat(seal.top),
      sealWidth: Number.parseFloat(seal.width),
      sealHeight: Number.parseFloat(seal.height),
      sealBackground: seal.backgroundColor,
      sealImage: seal.backgroundImage,
      sealColor: seal.color,
      sealBorderWidth: seal.borderTopWidth,
      sealFrameDisplay: sealFrame.display,
      wordmarkText: wordmarkElement.textContent?.trim() ?? '',
      wordmarkVisibility: wordmark.visibility,
      wordmarkOpacity: Number(wordmark.opacity),
      eyebrowLeft: eyebrowRect.left - brandRect.left,
      eyebrowBottom: eyebrowRect.bottom - brandRect.top,
      wordmarkLeft: wordmarkRect.left - brandRect.left,
      wordmarkTop: wordmarkRect.top - brandRect.top,
      wordmarkRight: wordmarkRect.right - brandRect.left,
      wordmarkBottom: wordmarkRect.bottom - brandRect.top,
      linksTop: linksRect.top - brandRect.top,
      linksBottom: linksRect.bottom - brandRect.top,
      brandWidth: brandRect.width,
      brandHeight: brandRect.height,
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }
  })

  expect(visual).toMatchObject({
    indigo: '#202a38',
    indigoDeep: '#182230',
    sepia: '#3a2b1b',
    paperToken: '#f0e4cf',
    cream: '#ead8b9',
    oxide: '#8b4b29',
    sidebarBackground: 'rgb(24, 34, 48)',
    railBackground: 'rgb(24, 34, 48)',
    paperBackground: 'rgb(240, 228, 207)',
    sealDisplay: 'grid',
    sealWidth: 44,
    sealHeight: 44,
    sealBackground: 'rgb(24, 34, 48)',
    sealColor: 'rgb(240, 228, 207)',
    sealBorderWidth: '1px',
    sealFrameDisplay: 'block',
    wordmarkVisibility: 'visible',
    wordmarkOpacity: 1,
  })

  expect(visual.sealContent).toContain('SCR')
  expect(visual.sealContent).toContain('VRL')
  expect(visual.wordmarkText.toLocaleUpperCase('pt-BR')).toBe('ESCREVARAL')
  expect(visual.eyebrowLeft).toBeGreaterThanOrEqual(visual.sealLeft + visual.sealWidth + 10)
  expect(visual.wordmarkLeft).toBeGreaterThanOrEqual(visual.sealLeft + visual.sealWidth + 10)
  expect(visual.wordmarkTop).toBeGreaterThanOrEqual(visual.eyebrowBottom + 6)
  expect(visual.wordmarkBottom).toBeLessThanOrEqual(visual.linksTop - 6)
  expect(visual.wordmarkRight).toBeLessThanOrEqual(visual.brandWidth - 12)
  expect(visual.sealTop + visual.sealHeight).toBeLessThanOrEqual(visual.linksTop)
  expect(visual.linksBottom).toBeLessThanOrEqual(visual.brandHeight - 10)
  expect(visual.sidebarImage).toContain('url(')
  expect(visual.sidebarImage.match(/radial-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  expect(visual.paperImage).toContain('url(')
  expect(visual.paperImage).not.toContain('repeating-linear-gradient')
  expect(visual.paperImage.match(/radial-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
  expect(visual.paperSize).toContain('100% 48px')
  expect(visual.paperRepeat).toContain('repeat-y')
  expect(visual.sealImage).toContain('url(')
  expect(visual.scroll).toBeLessThanOrEqual(visual.viewport)
  expect(await elementContrast(page, '.sidebar .search')).toBeGreaterThanOrEqual(4.5)
  expect(await elementContrast(page, '.rail .tab:not(.active)')).toBeGreaterThanOrEqual(4.5)

  await page.screenshot({ path: 'test-results/gate6-76-escrevaral-verniz.png', fullPage: true })
})
