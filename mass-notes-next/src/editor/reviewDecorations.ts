import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export type ReviewDecorationSeverity = 'alta' | 'média' | 'baixa'

export type ReviewDecorationSpec = {
  id: string
  from: number
  to: number
  severity: ReviewDecorationSeverity
}

type ReviewDecorationMeta =
  | { type: 'set'; items: ReviewDecorationSpec[] }
  | { type: 'clear' }

const reviewDecorationsKey = new PluginKey<DecorationSet>('escrevaralReviewDecorations')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reviewDecorations: {
      setReviewDecorations: (items: ReviewDecorationSpec[]) => ReturnType
      clearReviewDecorations: () => ReturnType
    }
  }
}

function createDecorationSet(documentNode: Parameters<typeof DecorationSet.create>[0], items: ReviewDecorationSpec[]) {
  const maximum = documentNode.content.size
  const decorations = items
    .filter((item) => Number.isInteger(item.from) && Number.isInteger(item.to) && item.from >= 0 && item.to <= maximum && item.from < item.to)
    .map((item) => Decoration.inline(
      item.from,
      item.to,
      {
        class: `review-decoration severity-${item.severity}`,
        'data-review-issue-id': item.id,
        'aria-hidden': 'true',
      },
      {
        inclusiveStart: false,
        inclusiveEnd: false,
        issueId: item.id,
      },
    ))

  return DecorationSet.create(documentNode, decorations)
}

export const ReviewDecorations = Extension.create({
  name: 'reviewDecorations',

  addCommands() {
    return {
      setReviewDecorations: (items) => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(reviewDecorationsKey, { type: 'set', items } satisfies ReviewDecorationMeta)
        return true
      },
      clearReviewDecorations: () => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(reviewDecorationsKey, { type: 'clear' } satisfies ReviewDecorationMeta)
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: reviewDecorationsKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (transaction, current) => {
            const meta = transaction.getMeta(reviewDecorationsKey) as ReviewDecorationMeta | undefined
            if (meta?.type === 'clear') return DecorationSet.empty
            if (meta?.type === 'set') return createDecorationSet(transaction.doc, meta.items)

            // Uma edição torna todo range linguístico obsoleto. Não tentamos mapear
            // automaticamente uma leitura antiga para um manuscrito novo.
            if (transaction.docChanged) return DecorationSet.empty
            return current.map(transaction.mapping, transaction.doc)
          },
        },
        props: {
          decorations: (state) => reviewDecorationsKey.getState(state) ?? DecorationSet.empty,
        },
      }),
    ]
  },
})
