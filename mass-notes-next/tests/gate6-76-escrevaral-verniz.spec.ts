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

test('o logo oficial fornecido substitui o selo tipográfico sem romper o verniz material', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await waitReady(page)

  const logo = page.locator('.brand-logo')
  const symbolLink = page.locator('link[rel="icon"]')
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute('src', /brand\/escrevaral-logo\.svg$/)
  await expect(symbolLink).toHaveAttribute('href', /brand\/escrevaral-favicon\.svg$/)

  const visual = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const sidebarElement = document.querySelector<HTMLElement>('.sidebar')!
    const railElement = document.querySelector<HTMLElement>('.rail')!
    const paperElement = document.querySelector<HTMLElement>('.paper')!
    const brandElement = document.querySelector<HTMLElement>('.brand')!
    const logoElement = brandElement.querySelector<HTMLImageElement>('.brand-logo')!
    const logoPlateElement = brandElement.querySelector<HTMLElement>('.brand-logo-plate')!
    const eyebrowElement = brandElement.querySelector<HTMLElement>('.eyebrow')!
    const headingElement = brandElement.querySelector<HTMLElement>('h1')!
    const linksElement = brandElement.querySelector<HTMLElement>('.brand-links')!

    const sidebar = getComputedStyle(sidebarElement)
    const rail = getComputedStyle(railElement)
    const paper = getComputedStyle(paperElement)
    const oldSeal = getComputedStyle(brandElement, '::before')
    const oldSealFrame = getComputedStyle(brandElement, '::after')
    const brandRect = brandElement.getBoundingClientRect()
    const logoRect = logoPlateElement.getBoundingClientRect()
    const eyebrowRect = eyebrowElement.getBoundingClientRect()
    const linksRect = linksElement.getBoundingClientRect()
    const heading = getComputedStyle(headingElement)

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
      oldSealDisplay: oldSeal.display,
      oldSealFrameDisplay: oldSealFrame.display,
      headingText: headingElement.textContent?.trim() ?? '',
      headingWidth: Number.parseFloat(heading.width),
      headingHeight: Number.parseFloat(heading.height),
      logoSrc: logoElement.getAttribute('src') ?? '',
      logoNaturalWidth: logoElement.naturalWidth,
      logoNaturalHeight: logoElement.naturalHeight,
      logoLeft: logoRect.left - brandRect.left,
      logoTop: logoRect.top - brandRect.top,
      logoRight: logoRect.right - brandRect.left,
      logoBottom: logoRect.bottom - brandRect.top,
      eyebrowTop: eyebrowRect.top - brandRect.top,
      eyebrowBottom: eyebrowRect.bottom - brandRect.top,
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
    oldSealDisplay: 'none',
    oldSealFrameDisplay: 'none',
    headingText: 'Escrevaral',
    logoNaturalWidth: 300,
    logoNaturalHeight: 180,
  })

  expect(visual.headingWidth).toBeLessThanOrEqual(1)
  expect(visual.headingHeight).toBeLessThanOrEqual(1)
  expect(visual.logoSrc).toContain('brand/escrevaral-logo.svg')
  expect(visual.logoLeft).toBeGreaterThanOrEqual(12)
  expect(visual.logoTop).toBeGreaterThanOrEqual(8)
  expect(visual.logoRight).toBeLessThanOrEqual(visual.brandWidth - 12)
  expect(visual.logoBottom).toBeLessThanOrEqual(visual.eyebrowTop - 6)
  expect(visual.eyebrowBottom).toBeLessThanOrEqual(visual.linksTop - 6)
  expect(visual.linksBottom).toBeLessThanOrEqual(visual.brandHeight - 10)
  expect(visual.sidebarImage).toContain('url(')
  expect(visual.sidebarImage.match(/radial-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  expect(visual.paperImage).toContain('url(')
  expect(visual.paperImage).not.toContain('repeating-linear-gradient')
  expect(visual.paperImage.match(/radial-gradient/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
  expect(visual.paperSize).toContain('100% 48px')
  expect(visual.paperRepeat).toContain('repeat-y')
  expect(visual.scroll).toBeLessThanOrEqual(visual.viewport)
  expect(await elementContrast(page, '.sidebar .search')).toBeGreaterThanOrEqual(4.5)
  expect(await elementContrast(page, '.rail .tab:not(.active)')).toBeGreaterThanOrEqual(4.5)

  await page.screenshot({ path: 'test-results/gate6-76-escrevaral-verniz.png', fullPage: true })
})