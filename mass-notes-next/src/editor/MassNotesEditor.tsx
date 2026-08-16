import type { Editor, JSONContent } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { useEffect } from 'react'
import { editorExtensions } from './editorExtensions'
import { publishLiveEditorSnapshot } from './editorSnapshotBridge'
import { publishLexicalSelection } from './lexicalSelectionBridge'
import { type ReviewDecorationSpec } from './reviewDecorations'
import { createEditorPositionContract, type EditorPositionContract } from './textPositionContract'

const SYNC_FOCUS_LINE_EVENT = 'escrevaral:sync-focus-line'

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
  const currentSnapshot = (current: Editor): EditorSnapshot => ({
    content: current.getJSON(),
    plainText: current.getText({ blockSeparator: '\n\n' }),
  })

  const publishSnapshot = (current: Editor): EditorSnapshot => {
    const snapshot = currentSnapshot(current)
    publishLiveEditorSnapshot(documentId, snapshot.content, snapshot.plainText)
    return snapshot
  }

  const publishPositionContract = (current: Editor) => {
    const contract = createEditorPositionContract(current.state.doc, documentId, current.getJSON())
    const host = current.view.dom as PositionContractHost
    host.__escrevaralPositionContract = contract
    onPositionContract?.(contract)
  }

  const publishCurrentLexicalSelection = (current: Editor) => {
    const { from, to, empty } = current.state.selection
    const selected = empty ? '' : current.state.doc.textBetween(from, to, ' ', ' ').trim()
    const maximum = current.state.doc.content.size
    const contextRadius = 180
    publishLexicalSelection({
      documentId,
      from,
      to,
      text: selected.length <= 120 ? selected : '',
      before: current.state.doc.textBetween(Math.max(0, from - contextRadius), from, ' ', ' ').trim(),
      after: current.state.doc.textBetween(to, Math.min(maximum, to + contextRadius), ' ', ' ').trim(),
    })
  }

  const syncFocusLine = (current: Editor) => {
    const host = current.view.dom as HTMLElement
    const paragraphs = host.querySelectorAll('p')
    if (!document.body.classList.contains('focus-mode')) {
      paragraphs.forEach((paragraph) => paragraph.classList.remove('focus-line'))
      return
    }

    const { $from } = current.state.selection
    let activeParagraph: HTMLParagraphElement | null = null

    for (let depth = $from.depth; depth > 0 && !activeParagraph; depth -= 1) {
      const node = current.view.nodeDOM($from.before(depth))
      const element = node instanceof Element ? node : node?.parentElement
      if (element instanceof HTMLParagraphElement) activeParagraph = element
      else activeParagraph = element?.closest<HTMLParagraphElement>('p') ?? null
    }

    if (!activeParagraph) {
      const domAtSelection = current.view.domAtPos(current.state.selection.from).node
      const element = domAtSelection instanceof Element ? domAtSelection : domAtSelection.parentElement
      activeParagraph = element?.closest<HTMLParagraphElement>('p') ?? null
    }

    paragraphs.forEach((paragraph) => paragraph.classList.toggle('focus-line', paragraph === activeParagraph))
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
      publishSnapshot(current)
      publishPositionContract(current)
      publishCurrentLexicalSelection(current)
      syncFocusLine(current)
    },
    onUpdate: ({ editor: current }) => {
      publishPositionContract(current)
      publishCurrentLexicalSelection(current)
      syncFocusLine(current)
      onChange(publishSnapshot(current))
    },
    onSelectionUpdate: ({ editor: current }) => {
      publishCurrentLexicalSelection(current)
      syncFocusLine(current)
    },
  })

  useEffect(() => {
    if (!editor) return
    const sync = () => syncFocusLine(editor)
    document.addEventListener(SYNC_FOCUS_LINE_EVENT, sync)
    return () => document.removeEventListener(SYNC_FOCUS_LINE_EVENT, sync)
  }, [editor])

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
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
    }),
  })

  if (!editor) return <div className="editor-loading">Preparando o motor de escrita…</div>

  return (
    <>
      <div className="formatbar editor-toolbar" role="toolbar" aria-label="Formatação do texto">
        <label>
          Estilo
          <button type="button" onClick={() => editor.chain().focus().setParagraph().run()}>
            Parágrafo <span className="chevron" aria-hidden="true" />
          </button>
        </label>
        <label>
          Fonte
          <button type="button" aria-label="Fonte Literata">
            Literata <span className="chevron" aria-hidden="true" />
          </button>
        </label>
        <label>
          Tamanho
          <div className="size"><span>16</span><button type="button" aria-label="Diminuir fonte">−</button><button type="button" aria-label="Aumentar fonte">＋</button></div>
        </label>
        <div className="format-actions">
          <button type="button" title="Negrito" aria-label="N" aria-pressed={state.bold} className={state.bold ? 'active' : ''} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
          <button type="button" title="Itálico" aria-label="I" aria-pressed={state.italic} className={state.italic ? 'active' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
          <button type="button" title="Sublinhado" aria-label="S" aria-pressed={state.underline} className={state.underline ? 'active' : ''} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
          <i className="divider" aria-hidden="true" />
          <button type="button" aria-label="Alinhar à esquerda" disabled><svg className="toolbar-svg" viewBox="0 0 24 24"><path d="M3 5h17M3 9h12M3 13h17M3 17h10" /></svg></button>
          <button type="button" aria-label="Centralizar" disabled><svg className="toolbar-svg" viewBox="0 0 24 24"><path d="M3 5h18M6 9h12M3 13h18M7 17h10" /></svg></button>
          <button type="button" aria-label="Alinhar à direita" disabled><svg className="toolbar-svg" viewBox="0 0 24 24"><path d="M3 5h18M9 9h12M3 13h18M11 17h10" /></svg></button>
          <button type="button" aria-label="Justificar" disabled><svg className="toolbar-svg" viewBox="0 0 24 24"><path d="M3 5h18M3 9h18M3 13h18M3 17h18" /></svg></button>
          <i className="divider" aria-hidden="true" />
          <button type="button" title="Lista com marcadores" aria-label="• Lista" className={state.bulletList ? 'active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()}><svg className="toolbar-svg list-svg" viewBox="0 0 24 24"><circle cx="3.5" cy="5" r="1" /><circle cx="3.5" cy="11" r="1" /><circle cx="3.5" cy="17" r="1" /><path d="M8 5h13M8 11h13M8 17h13" /></svg></button>
          <button type="button" title="Lista numerada" aria-label="1. Lista" className={state.orderedList ? 'active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}><svg className="toolbar-svg list-svg" viewBox="0 0 24 24"><path d="M3 4v3M2 4h1M2 10h3l-3 3h3M2 16h3l-2 1 2 1-3 1M8 5h13M8 11h13M8 17h13" /></svg></button>
          <button type="button" aria-label="Lista de tarefas" disabled><svg className="toolbar-svg list-svg" viewBox="0 0 24 24"><path d="M2 3h4v4H2zM2 9h4v4H2zM2 15h4v4H2zM9 5h12M9 11h12M9 17h12" /></svg></button>
          <button className="expand" type="button" aria-label="Expandir" onClick={() => { void document.documentElement.requestFullscreen?.() }}><svg viewBox="0 0 22 22"><path d="M4 9V4h5M13 18h5v-5M4 4l6 6M18 18l-6-6" /></svg></button>
        </div>
      </div>
      <article className="editor editor-shell paper">
        <EditorContent editor={editor} />
      </article>
    </>
  )
}
