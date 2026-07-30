import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState, type Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view'

type PageBreak = {
  pos: number
  height: number
  pageNumber: number
}

type PaginationState = {
  breaks: PageBreak[]
  pageCount: number
}

type PageGeometry = {
  pageHeight: number
  pageGap: number
  pageMarginTop: number
  pageMarginBottom: number
  pageCycle: number
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

function pageGeometry(paper: HTMLElement): PageGeometry {
  const compact = paper.clientWidth < 560
  const pageHeight = Math.round(Math.max(compact ? 720 : 900, Math.min(1123, paper.clientWidth * 1.4142)))
  const pageGap = compact ? 22 : 32
  const pageMarginTop = compact ? 36 : 58
  const pageMarginBottom = compact ? 52 : 72
  return {
    pageHeight,
    pageGap,
    pageMarginTop,
    pageMarginBottom,
    pageCycle: pageHeight + pageGap,
  }
}

function currentPaper(view: EditorView): HTMLElement | null {
  return view.dom.closest('.paper') as HTMLElement | null
}

function applyPaperGeometry(paper: HTMLElement, geometry: PageGeometry, pageCount: number): void {
  const documentHeight = pageCount * geometry.pageHeight + Math.max(0, pageCount - 1) * geometry.pageGap
  paper.style.setProperty('--escrevaral-page-height', `${geometry.pageHeight}px`)
  paper.style.setProperty('--escrevaral-page-gap', `${geometry.pageGap}px`)
  paper.style.setProperty('--escrevaral-page-cycle', `${geometry.pageCycle}px`)
  paper.style.setProperty('--escrevaral-page-margin-top', `${geometry.pageMarginTop}px`)
  paper.style.setProperty('--escrevaral-page-margin-bottom', `${geometry.pageMarginBottom}px`)
  paper.style.setProperty('--escrevaral-document-height', `${documentHeight}px`)
  paper.dataset.pageCount = String(pageCount)
  paper.dataset.pagination = 'block-boundaries'
}

function clearPaperGeometry(paper: HTMLElement | null): void {
  if (!paper) return
  for (const property of [
    '--escrevaral-page-height',
    '--escrevaral-page-gap',
    '--escrevaral-page-cycle',
    '--escrevaral-page-margin-top',
    '--escrevaral-page-margin-bottom',
    '--escrevaral-document-height',
  ]) paper.style.removeProperty(property)
  delete paper.dataset.pageCount
  delete paper.dataset.pagination
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
  const geometry = pageGeometry(paper)
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
  const scroller = view.dom.closest('.editor-shell') as HTMLElement | null
  if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return

  try {
    const caret = view.coordsAtPos(view.state.selection.head)
    const viewport = scroller.getBoundingClientRect()
    const toolbar = scroller.querySelector<HTMLElement>('.editor-toolbar')
    const toolbarHeight = toolbar ? Math.min(72, toolbar.getBoundingClientRect().height) : 0
    const safeTop = viewport.top + Math.max(32, toolbarHeight + 18)
    const safeBottom = viewport.bottom - 64
    let delta = 0
    if (caret.bottom > safeBottom) delta = caret.bottom - safeBottom
    else if (caret.top < safeTop) delta = caret.top - safeTop
    if (Math.abs(delta) > 1) scroller.scrollTop += delta
  } catch {
    // A seleção pode estar sendo reconstruída durante uma troca de documento.
  }
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
          resizeObserver.observe(liveView.dom)
          if (paper) resizeObserver.observe(paper)
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
