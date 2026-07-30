export type PageFormat = 'A4'

export type PageMarginsMm = {
  top: number
  right: number
  bottom: number
  left: number
}

export type PageModel = {
  format: PageFormat
  widthMm: number
  heightMm: number
  marginsMm: PageMarginsMm
  gapPx: {
    regular: number
    compact: number
  }
  minimumRenderedHeightPx: number
}

export type ResolvedPageGeometry = {
  format: PageFormat
  widthMm: number
  heightMm: number
  pageWidth: number
  pageHeight: number
  pageGap: number
  pageCycle: number
  pageMarginTop: number
  pageMarginRight: number
  pageMarginBottom: number
  pageMarginLeft: number
  contentWidth: number
  contentHeight: number
}

export const A4_PAGE_MODEL: PageModel = Object.freeze({
  format: 'A4',
  widthMm: 210,
  heightMm: 297,
  marginsMm: Object.freeze({
    top: 15,
    right: 18,
    bottom: 20,
    left: 18,
  }),
  gapPx: Object.freeze({
    regular: 32,
    compact: 22,
  }),
  minimumRenderedHeightPx: 540,
})

function rounded(value: number): number {
  return Math.max(0, Math.round(value * 10) / 10)
}

export function resolvePageGeometry(
  availableWidth: number,
  model: PageModel = A4_PAGE_MODEL,
): ResolvedPageGeometry {
  const pageWidth = Math.max(1, rounded(availableWidth))
  const aspectRatio = model.heightMm / model.widthMm
  const pageHeight = rounded(Math.max(model.minimumRenderedHeightPx, Math.min(1123, pageWidth * aspectRatio)))
  const pixelsPerMm = pageHeight / model.heightMm
  const pageMarginTop = rounded(model.marginsMm.top * pixelsPerMm)
  const pageMarginRight = rounded(model.marginsMm.right * pixelsPerMm)
  const pageMarginBottom = rounded(model.marginsMm.bottom * pixelsPerMm)
  const pageMarginLeft = rounded(model.marginsMm.left * pixelsPerMm)
  const pageGap = pageWidth < 560 ? model.gapPx.compact : model.gapPx.regular
  const contentWidth = rounded(Math.max(1, pageWidth - pageMarginLeft - pageMarginRight))
  const contentHeight = rounded(Math.max(1, pageHeight - pageMarginTop - pageMarginBottom))

  return {
    format: model.format,
    widthMm: model.widthMm,
    heightMm: model.heightMm,
    pageWidth,
    pageHeight,
    pageGap,
    pageCycle: rounded(pageHeight + pageGap),
    pageMarginTop,
    pageMarginRight,
    pageMarginBottom,
    pageMarginLeft,
    contentWidth,
    contentHeight,
  }
}
