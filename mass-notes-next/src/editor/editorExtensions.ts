import { Extension } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'

const PreserveParagraphAfterHeading = Extension.create({
  name: 'preserveParagraphAfterHeading',
  priority: 1_000,
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { $from, empty } = this.editor.state.selection
        if (!empty || $from.parentOffset !== 0 || $from.parent.type.name !== 'paragraph') return false
        const parentDepth = $from.depth - 1
        const parent = $from.node(parentDepth)
        const index = $from.index(parentDepth)
        const previous = index > 0 ? parent.child(index - 1) : null
        if (previous?.type.name !== 'heading') return false
        return true
      },
      Delete: () => {
        const { $from, empty } = this.editor.state.selection
        if (!empty || $from.parentOffset !== $from.parent.content.size || $from.parent.type.name !== 'heading') return false
        const parentDepth = $from.depth - 1
        const parent = $from.node(parentDepth)
        const index = $from.index(parentDepth)
        const next = index + 1 < parent.childCount ? parent.child(index + 1) : null
        if (next?.type.name !== 'paragraph') return false
        return true
      },
    }
  },
})

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    },
    codeBlock: false,
    horizontalRule: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === 'heading'
        ? 'Dê um nome a este trecho…'
        : 'A página espera. Ataque primeiro. Escreva em português brasileiro.',
    includeChildren: true,
  }),
  PreserveParagraphAfterHeading,
]
