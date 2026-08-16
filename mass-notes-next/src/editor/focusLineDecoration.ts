import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const focusLineKey = new PluginKey<boolean>('escrevaralFocusLine')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    focusLine: {
      setFocusLineMode: (enabled: boolean) => ReturnType
    }
  }
}

function activeParagraphDecoration(state: EditorState): DecorationSet {
  const { $from } = state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (node.type.name !== 'paragraph') continue

    const from = $from.before(depth)
    const to = from + node.nodeSize
    return DecorationSet.create(state.doc, [Decoration.node(from, to, { class: 'focus-line' })])
  }

  return DecorationSet.empty
}

export const FocusLineDecoration = Extension.create({
  name: 'focusLine',

  addCommands() {
    return {
      setFocusLineMode: (enabled) => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(focusLineKey, enabled)
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<boolean>({
        key: focusLineKey,
        state: {
          init: () => false,
          apply: (transaction, enabled) => {
            const next = transaction.getMeta(focusLineKey) as boolean | undefined
            return typeof next === 'boolean' ? next : enabled
          },
        },
        props: {
          decorations: (state) => focusLineKey.getState(state) ? activeParagraphDecoration(state) : DecorationSet.empty,
        },
      }),
    ]
  },
})
