import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState, type Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'
import { A4_PAGE_MODEL, resolvePageGeometry, type ResolvedPageGeometry } from './pageModel'

type PageBreak = {
  pos: number
  height: number
  pageNumber: number
}

type PaginationState = {
  breaks: PageBreak[]
  pageCount: number
}

type BlockMetric = {
  pos: number
  top: number
  bottom: number
}

const paginationKey = new PluginKey<PaginationState>('escrevaral-pagination')
const emptyPagination: PaginationState = { breaks: [], pageCount: 1 }

function rounded(value: number): number {
  return Math.max(0, Math.round(value * 10) / 10)
}

function samePagination(left: PaginationState, right: PaginationState): boolean {
  if (left.pageCount !== right.pageCount || left.breaks.length !== right.breaks.length) return false
  return left.breaks.every((item, index) => {
    const candidate = right.breaks[index]
    return candidate
      && item.pos === candidate.pos
      && item.pageNumber === candidate.pageNumber
      && Math.abs(item.height - candidate.height) < 0.5
  })
}

function mapPagination(transaction: Transaction, current: PaginationState): PaginationState {
  if (!transaction.docChanged || current.breaks.length === 0) return current
  const breaks = current.breaks.flatMap<PageBreak>((item) => {
    const mapped = transaction.mapping.mapResult(item.pos, -1)
    if (mapped.deleted || mapped.pos < 0 || mapped.pos > transaction.doc.content.size) return []
    return [{ ...item, pos: mapped.pos }]
  })
  return { breaks, pageCount: Math.max(1, breaks.length + 1) }
}

function currentPaper(view: EditorView): HTMLElement | null {
  return view.dom.closest('.paper') as HTMLElement | null
}

function currentViewport(view: EditorView): HTMLElement | null {
  return view.dom.closest('.editor-viewport') as HTMLElement | null
}

function applyPaperGeometry(paper: HTMLElement, geometry: ResolvedPageGeometry, pageCount: number): void {
  const documentHeight = pageCount * geometry.pageHeight + Math.max(0, pageCount - 1) * geometry.pageGap
  paper.style.setProperty('--escrevaral-page-width', `${geometry.pageWidth}px`)
  paper.style.setProperty('--escrevaral-page-height', `${geometry.pageHeight}px`)
  paper.style.setProperty('--escrevaral-page-gap', `${geometry.pageGap}px`)
  paper.style.setProperty('--escrevaral-page-cycle', `${geometry.pageCycle}px`)
  paper.style.setProperty('--escrevaral-page-margin-top', `${geometry.pageMarginTop}px`)
  paper.style.setProperty('--escrevaral-page-margin-right', `${geometry.pageMarginRight}px`)
  paper.style.setProperty('--escrevaral-page-margin-bottom', `${geometry.pageMarginBottom}px`)
  paper.style.setProperty('--escrevaral-page-margin-left', `${geometry.pageMarginLeft}px`)
  paper.style.setProperty('--escrevaral-page-content-width', `${geometry.contentWidth}px`)
  paper.style.setProperty('--escrevaral-page-content-height', `${geometry.contentHeight}px`)
  paper.style.setProperty('--escrevaral-document-height', `${documentHeight}px`)
  paper.dataset.pageCount = String(pageCount)
  paper.dataset.pagination = 'block-boundaries'
  paper.dataset.pageFormat = geometry.format
  paper.dataset.pageWidthMm = String(geometry.widthMm)
  paper.dataset.pageHeightMm = String(geometry.heightMm)
  paper.dataset.pageContentWidth = String(geometry.contentWidth)
  paper.dataset.pageContentHeight = String(geometry.contentHeight)
  paper.dataset.pageGap = String(geometry.pageGap)
}

function clearPaperGeometry(paper: HTMLElement | null): void {
  if (!paper) return
  for (const property of [
    '--escrevaral-page-width',
    '--escrevaral-page-height',
    '--escrevaral-page-gap',
    '--escrevaral-page-cycle',
    '--escrevaral-page-margin-top',
    '--escrevaral-page-margin-right',
    '--escrevaral-page-margin-bottom',
    '--escrevaral-page-margin-left',
    '--escrevaral-page-content-width',
    '--escrevaral-page-content-height',
    '--escrevaral-document-height',
  ]) paper.style.removeProperty(property)
  for (const key of [
    'pageCount',
    'pagination',
    'pageFormat',
    'pageWidthMm',
    'pageHeightMm',
    'pageContentWidth',
    'pageContentHeight',
    'pageGap',
  ]) delete paper.dataset[key]
}

function collectBlockMetrics(view: EditorView, paper: HTMLElement, current: PaginationState): BlockMetric[] {
  const paperRect = paper.getBoundingClientRect()
  const children = Array.from(view.dom.children).filter((element): element is HTMLElement =>
    element instanceof HTMLElement && !element.classList.contains('escrevaral-page-break'))

  const positions: number[] = []
  view.state.doc.forEach((_node, offset) => { positions.push(offset) })
  const breaks = [...current.breaks].sort((left, right) => left.pos - right.pos)
  let breakIndex = 0
  let previousExtra = 0

  return positions.flatMap<BlockMetric>((pos, index) => {
    const element = children[index]
    if (!element) return []
    while (breakIndex < breaks.length && breaks[breakIndex].pos <= pos) {
      previousExtra += breaks[breakIndex].height
      breakIndex += 1
    }
    const rect = element.getBoundingClientRect()
    return [{
      pos,
      top: rounded(rect.top - paperRect.top - previousExtra),
      bottom: rounded(rect.bottom - paperRect.top - previousExtra),
    }]
  })
}

function measurePagination(view: EditorView): PaginationState | null {
  const paper = currentPaper(view)
  if (!paper || paper.clientWidth <= 0) return null
  const geometry = resolvePageGeometry(paper.clientWidth, A4_PAGE_MODEL)
  const current = paginationKey.getState(view.state) ?? emptyPagination
  const metrics = collectBlockMetrics(view, paper, current)
  const breaks: PageBreak[] = []
  let accumulatedExtra = 0
  let pageIndex = 0

  for (const metric of metrics) {
    let top = metric.top + accumulatedExtra
    let bottom = metric.bottom + accumulatedExtra
    const pageStart = pageIndex * geometry.pageCycle
    const contentTop = pageIndex === 0 ? 0 : pageStart + geometry.pageMarginTop
    const contentBottom = pageStart + geometry.pageHeight - geometry.pageMarginBottom
    const startsInGap = top >= pageStart + geometry.pageHeight
    const startsBeforeMargin = pageIndex > 0 && top < contentTop
    const overflowsPage = bottom > contentBottom && top > contentTop + 2

    if (startsInGap || startsBeforeMargin || overflowsPage) {
      pageIndex += 1
      const targetTop = pageIndex * geometry.pageCycle + geometry.pageMarginTop
      const height = rounded(Math.max(0, targetTop - top))
      if (height > 0) {
        breaks.push({ pos: metric.pos, height, pageNumber: pageIndex + 1 })
        accumulatedExtra += height
        top += height
        bottom += height
      }
    }
  }

  const measured = { breaks, pageCount: Math.max(1, pageIndex + 1) }
  applyPaperGeometry(paper, geometry, measured.pageCount)
  return measured
}

function keepSelectionInsideViewport(view: EditorView): void {
  if (!view.hasFocus()) return
  const viewport = currentViewport(view)
  if (!viewport || viewport.scrollHeight <= viewport.clientHeight) return

  try {
    const caret = view.coordsAtPos(view.state.selection.head)
    const viewportRect = viewport.getBoundingClientRect()
    const toolbar = viewport.querySelector<HTMLElement>('.editor-toolbar')
    const toolbarHeight = toolbar ? Math.min(72, toolbar.getBoundingClientRect().height) : 0
    const safeTop = viewportRect.top + Math.max(32, toolbarHeight + 18)
    const safeBottom = viewportRect.bottom - 64
    let delta = 0
    if (caret.bottom > safeBottom) delta = caret.bottom - safeBottom
    else if (caret.top < safeTop) delta = caret.top - safeTop
    if (Math.abs(delta) > 1) viewport.scrollTop += delta
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0)
  } catch {
    // A seleção pode estar sendo reconstruída durante uma troca de documento.
  }
}

function followAfterBrowserEvent(view: EditorView, doubleFrame = false): void {
  window.requestAnimationFrame(() => {
    if (doubleFrame) window.requestAnimationFrame(() => keepSelectionInsideViewport(view))
    else keepSelectionInsideViewport(view)
  })
}

function paginationDecorations(state: EditorState): DecorationSet | null {
  const pagination = paginationKey.getState(state)
  if (!pagination?.breaks.length) return null
  return DecorationSet.create(state.doc, pagination.breaks.map((item) =>
    Decoration.widget(item.pos, () => {
      const spacer = document.createElement('div')
      spacer.className = 'escrevaral-page-break'
      spacer.dataset.pageNumber = String(item.pageNumber)
      spacer.setAttribute('contenteditable', 'false')
      spacer.setAttribute('aria-hidden', 'true')
      spacer.style.height = `${item.height}px`
      return spacer
    }, {
      side: -1,
      key: `escrevaral-page-${item.pageNumber}-${item.pos}`,
      ignoreSelection: true,
    })))
}

export const Pagination = Extension.create({
  name: 'escrevaralPagination',

  addProseMirrorPlugins() {
    return [
      new Plugin<PaginationState>({
        key: paginationKey,
        state: {
          init: () => emptyPagination,
          apply: (transaction, current) => {
            const measured = transaction.getMeta(paginationKey) as PaginationState | undefined
            return measured ?? mapPagination(transaction, current)
          },
        },
        props: {
          decorations: paginationDecorations,
          handleKeyDown: (view, event) => {
            if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
              followAfterBrowserEvent(view)
            }
            return false
          },
          handlePaste: (view) => {
            followAfterBrowserEvent(view, true)
            return false
          },
          handleDOMEvents: {
            input: (view) => {
              followAfterBrowserEvent(view)
              return false
            },
          },
        },
        view: (initialView) => {
          let liveView = initialView
          let measureFrame = 0
          let followFrame = 0
          let destroyed = false

          const scheduleFollow = () => {
            if (destroyed) return
            window.cancelAnimationFrame(followFrame)
            followFrame = window.requestAnimationFrame(() => keepSelectionInsideViewport(liveView))
          }

          const scheduleMeasure = () => {
            if (destroyed) return
            window.cancelAnimationFrame(measureFrame)
            measureFrame = window.requestAnimationFrame(() => {
              const measured = measurePagination(liveView)
              if (!measured) return
              const current = paginationKey.getState(liveView.state) ?? emptyPagination
              if (!samePagination(current, measured)) {
                const transaction = liveView.state.tr
                  .setMeta(paginationKey, measured)
                  .setMeta('addToHistory', false)
                liveView.dispatch(transaction)
                return
              }
              scheduleFollow()
            })
          }

          const resizeObserver = new ResizeObserver(scheduleMeasure)
          const paper = currentPaper(liveView)
          const viewport = currentViewport(liveView)
          resizeObserver.observe(liveView.dom)
          if (paper) resizeObserver.observe(paper)
          if (viewport) resizeObserver.observe(viewport)
          scheduleMeasure()

          return {
            update: (updatedView, previousState) => {
              liveView = updatedView
              const previousPagination = paginationKey.getState(previousState)
              const nextPagination = paginationKey.getState(updatedView.state)
              if (previousState.doc !== updatedView.state.doc || previousPagination !== nextPagination) scheduleMeasure()
              if (!previousState.selection.eq(updatedView.state.selection)) scheduleFollow()
            },
            destroy: () => {
              destroyed = true
              resizeObserver.disconnect()
              window.cancelAnimationFrame(measureFrame)
              window.cancelAnimationFrame(followFrame)
              clearPaperGeometry(currentPaper(liveView))
            },
          }
        },
      }),
    ]
  },
})
