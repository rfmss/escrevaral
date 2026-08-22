import { Placeholder } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import { FocusLineDecoration } from './focusLineDecoration'
import { Pagination } from './paginationExtension'
import { ReviewDecorations } from './reviewDecorations'

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
  Pagination,
  ReviewDecorations,
  FocusLineDecoration,
]
