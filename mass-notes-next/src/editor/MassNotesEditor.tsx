import type { Editor, JSONContent } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useEffect } from 'react'
import { editorExtensions } from './editorExtensions'
import { publishLexicalSelection } from './lexicalSelectionBridge'
import { type ReviewDecorationSpec } from './reviewDecorations'
import { createEditorPositionContract, type EditorPositionContract } from './textPositionContract'

type EditorSnapshot = {
  content: JSONContent
  plainText: string
}

type PositionContractHost = HTMLElement & {
  __escrevaralPositionContract?: EditorPositionContract
}

export type ReviewNavigationRequest = {
  serial: number
  issueId: string
  from: number
  to: number
}

type Props = {
  documentId: string
  content: JSONContent
  resetKey: number
  reviewDecorations?: ReviewDecorationSpec[]
  reviewNavigation?: ReviewNavigationRequest | null
  onChange: (snapshot: EditorSnapshot) => void
  onPositionContract?: (contract: EditorPositionContract) => void
}

export function MassNotesEditor(props: Props) {
  return <MassNotesEditorInstance key={`${props.documentId}:${props.resetKey}`} {...props} />
}

function MassNotesEditorInstance({
  documentId,
  content,
  reviewDecorations = [],
  reviewNavigation,
  onChange,
  onPositionContract,
}: Props) {
  const publishPositionContract = (current: Editor) => {
    const contract = createEditorPositionContract(current.state.doc, documentId, current.getJSON())
    const host = current.view.dom as PositionContractHost
    host.__escrevaralPositionContract = contract
    onPositionContract?.(contract)
  }

  const publishCurrentLexicalSelection = (current: Editor) => {
    const { from, to, empty } = current.state.selection
    const selected = empty ? '' : current.state.doc.textBetween(from, to, ' ', ' ').trim()
    publishLexicalSelection({
      documentId,
      from,
      to,
      text: selected.length <= 120 ? selected : '',
    })
  }

  const editor = useEditor({
    extensions: editorExtensions,
    content,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'tiptap escrevaral-editor',
        'aria-label': 'Texto do documento',
        spellcheck: 'true',
        lang: 'pt-BR',
      },
    },
    onCreate: ({ editor: current }) => {
      publishPositionContract(current)
      publishCurrentLexicalSelection(current)
    },
    onUpdate: ({ editor: current }) => {
      publishPositionContract(current)
      publishCurrentLexicalSelection(current)
      onChange({ content: current.getJSON(), plainText: current.getText({ blockSeparator: '\n\n' }) })
    },
    onSelectionUpdate: ({ editor: current }) => {
      publishCurrentLexicalSelection(current)
    },
  })

  useEffect(() => {
    if (!editor) return
    if (reviewDecorations.length) editor.commands.setReviewDecorations(reviewDecorations)
    else editor.commands.clearReviewDecorations()
  }, [editor, reviewDecorations])

  useEffect(() => {
    if (!editor || !reviewNavigation) return
    const maximum = editor.state.doc.content.size
    const from = Math.max(0, Math.min(maximum, reviewNavigation.from))
    const to = Math.max(from, Math.min(maximum, reviewNavigation.to))
    if (from === to) return
    editor.chain().focus().setTextSelection({ from, to }).scrollIntoView().run()
  }, [editor, reviewNavigation])

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      underline: current?.isActive('underline') ?? false,
      strike: current?.isActive('strike') ?? false,
      h1: current?.isActive('heading', { level: 1 }) ?? false,
      h2: current?.isActive('heading', { level: 2 }) ?? false,
      h3: current?.isActive('heading', { level: 3 }) ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
      blockquote: current?.isActive('blockquote') ?? false,
      canUndo: current?.can().chain().focus().undo().run() ?? false,
      canRedo: current?.can().chain().focus().redo().run() ?? false,
    }),
  })

  if (!editor) return <div className="editor-loading">Preparando o motor de escrita…</div>

  const addLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const href = window.prompt('Endereço do link', previous ?? 'https://')
    if (href === null) return
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    try {
      const url = new URL(href, window.location.href)
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) throw new Error('Protocolo inválido')
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    } catch {
      window.alert('Use um endereço http, https, mailto ou tel.')
    }
  }

  return (
    <>
      <div className="editor-toolbar" role="toolbar" aria-label="Formatação do texto">
        <div className="toolbar-group" role="group" aria-label="Histórico">
          <button type="button" title="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo} aria-label="Desfazer">↶</button>
          <button type="button" title="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo} aria-label="Refazer">↷</button>
        </div>
        <div className="toolbar-group" role="group" aria-label="Estrutura do texto">
          <button type="button" title="Título de nível 1" className={state.h1 ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>T1</button>
          <button type="button" title="Título de nível 2" className={state.h2 ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>T2</button>
          <button type="button" title="Título de nível 3" className={state.h3 ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>T3</button>
          <button type="button" title="Transformar em citação" className={state.blockquote ? 'active' : ''} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Citação</button>
        </div>
        <div className="toolbar-group" role="group" aria-label="Ênfase">
          <button type="button" title="Negrito" className={state.bold ? 'active' : ''} aria-pressed={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><strong>N</strong></button>
          <button type="button" title="Itálico" className={state.italic ? 'active' : ''} aria-pressed={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
          <button type="button" title="Sublinhado" className={state.underline ? 'active' : ''} aria-pressed={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>S</u></button>
          <button type="button" title="Tachado" className={state.strike ? 'active' : ''} aria-pressed={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><s>T</s></button>
        </div>
        <div className="toolbar-group" role="group" aria-label="Listas e vínculos">
          <button type="button" title="Lista com marcadores" className={state.bulletList ? 'active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
          <button type="button" title="Lista numerada" className={state.orderedList ? 'active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</button>
          <button type="button" title="Adicionar ou editar link" onClick={addLink}>Link</button>
          <button type="button" title="Limpar formatação do bloco e da seleção" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>Limpar</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
