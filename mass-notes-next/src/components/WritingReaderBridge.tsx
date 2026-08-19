import type { JSONContent } from '@tiptap/core'
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { readLatestLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import { useModalDrawer } from './useModalDrawer'

const SPEEDS = [1, 2, 3, 5] as const
const SPEED_LABELS = ['Ritmo 1 — lento', 'Ritmo 2 — médio', 'Ritmo 3 — rápido', 'Ritmo 4 — acelerado'] as const
const FONT_SIZES = [16, 18, 20, 24] as const
const FONT_LABELS = ['Letra pequena', 'Letra média', 'Letra grande', 'Letra maior'] as const

function safeHref(value: unknown): string | null {
  const href = typeof value === 'string' ? value.trim() : ''
  if (!href) return null
  try {
    const parsed = new URL(href, 'https://escrevaral.local')
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? href : null
  } catch {
    return null
  }
}

function markedText(node: JSONContent, key: string): ReactNode {
  let value: ReactNode = node.text ?? ''
  for (const [index, mark] of (node.marks ?? []).entries()) {
    const markKey = `${key}-mark-${index}`
    if (mark.type === 'bold') value = <strong key={markKey}>{value}</strong>
    if (mark.type === 'italic') value = <em key={markKey}>{value}</em>
    if (mark.type === 'underline') value = <u key={markKey}>{value}</u>
    if (mark.type === 'strike') value = <s key={markKey}>{value}</s>
    if (mark.type === 'link') {
      const href = safeHref(mark.attrs?.href)
      if (href) value = <a key={markKey} href={href} target="_blank" rel="noreferrer">{value}</a>
    }
  }
  return value
}

function inlineNodes(node: JSONContent, key: string): ReactNode[] {
  return (node.content ?? []).map((child, index) => {
    const childKey = `${key}-${index}`
    if (child.type === 'text') return <Fragment key={childKey}>{markedText(child, childKey)}</Fragment>
    if (child.type === 'hardBreak') return <br key={childKey} />
    return <Fragment key={childKey}>{inlineNodes(child, childKey)}</Fragment>
  })
}

function heading(level: number, children: ReactNode[], key: string): ReactNode {
  if (level <= 1) return <h1 key={key}>{children}</h1>
  if (level === 2) return <h2 key={key}>{children}</h2>
  if (level === 3) return <h3 key={key}>{children}</h3>
  if (level === 4) return <h4 key={key}>{children}</h4>
  if (level === 5) return <h5 key={key}>{children}</h5>
  return <h6 key={key}>{children}</h6>
}

function readerNode(node: JSONContent, key: string): ReactNode {
  const children = node.content ?? []
  if (node.type === 'text') return markedText(node, key)
  if (node.type === 'hardBreak') return <br key={key} />
  if (node.type === 'paragraph') return <p key={key}>{inlineNodes(node, key)}</p>
  if (node.type === 'heading') return heading(Number(node.attrs?.level) || 1, inlineNodes(node, key), key)
  if (node.type === 'blockquote') return <blockquote key={key}>{children.map((child, index) => readerNode(child, `${key}-${index}`))}</blockquote>
  if (node.type === 'bulletList') return <ul key={key}>{children.map((child, index) => readerNode(child, `${key}-${index}`))}</ul>
  if (node.type === 'orderedList') return <ol key={key} start={Number(node.attrs?.start) || 1}>{children.map((child, index) => readerNode(child, `${key}-${index}`))}</ol>
  if (node.type === 'listItem') return <li key={key}>{children.map((child, index) => readerNode(child, `${key}-${index}`))}</li>
  if (node.type === 'horizontalRule') return <hr key={key} />
  return <Fragment key={key}>{children.map((child, index) => readerNode(child, `${key}-${index}`))}</Fragment>
}

function ReaderArticle({ content }: { content: JSONContent }) {
  return <>{readerNode(content, 'reader-root')}</>
}

function findModeTrigger(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.topbar .mode button')
}

export function WritingReaderBridge() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<JSONContent | null>(null)
  const [title, setTitle] = useState('Sem título')
  const [playing, setPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [fontIndex, setFontIndex] = useState(1)
  const [ruler, setRuler] = useState(false)
  const [hint, setHint] = useState('')
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const hintTimer = useRef<number | null>(null)
  const panelRef = useModalDrawer<HTMLElement>(open, () => setOpen(false))

  const close = () => setOpen(false)

  const openReader = useCallback(() => {
    const snapshot = readLatestLiveEditorSnapshot()
    const trigger = triggerRef.current
    if (!snapshot?.plainText.trim()) {
      setHint('Escreva algumas linhas para ler como leitor.')
      if (hintTimer.current) window.clearTimeout(hintTimer.current)
      hintTimer.current = window.setTimeout(() => setHint(''), 2_500)
      trigger?.focus()
      return
    }

    setContent(snapshot.content)
    setTitle(document.querySelector<HTMLInputElement>('.reference-document-title')?.value.trim() || 'Sem título')
    setPlaying(false)
    setSpeedIndex(0)
    setFontIndex(1)
    setRuler(false)
    setOpen(true)
  }, [])

  useEffect(() => {
    const bind = () => {
      const trigger = findModeTrigger()
      if (!trigger) return false
      triggerRef.current = trigger
      trigger.disabled = false
      trigger.removeAttribute('aria-disabled')
      trigger.removeAttribute('data-integrity-static')
      const expectedText = open ? 'Leitura' : 'Escrita'
      if (trigger.textContent !== expectedText) trigger.textContent = expectedText
      trigger.setAttribute('aria-label', open ? 'Modo atual: Leitura' : 'Abrir modo Leitura')
      trigger.setAttribute('aria-controls', 'writing-reader-overlay')
      trigger.setAttribute('aria-expanded', String(open))
      trigger.title = 'Alternar entre escrita e leitura limpa'
      return true
    }

    bind()
    const root = document.getElementById('root')
    if (!root) return
    const observer = new MutationObserver(bind)
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [open])

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    trigger.addEventListener('click', openReader)
    return () => trigger.removeEventListener('click', openReader)
  }, [openReader, open])

  useEffect(() => {
    document.body.classList.toggle('writing-reader-open', open)
    if (open) window.requestAnimationFrame(() => { if (canvasRef.current) canvasRef.current.scrollTop = 0 })
    return () => document.body.classList.remove('writing-reader-open')
  }, [open])

  useEffect(() => {
    if (!playing) {
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      return
    }

    let previous = performance.now()
    const step = (now: number) => {
      const canvas = canvasRef.current
      if (!canvas) {
        setPlaying(false)
        return
      }

      const delta = Math.min(64, Math.max(0, now - previous))
      previous = now
      canvas.scrollTop += SPEEDS[speedIndex] * 30 * (delta / 1_000)
      if (canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 2) {
        setPlaying(false)
        return
      }
      frameRef.current = window.requestAnimationFrame(step)
    }

    frameRef.current = window.requestAnimationFrame(step)
    return () => {
      if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [playing, speedIndex])

  useEffect(() => () => {
    if (hintTimer.current) window.clearTimeout(hintTimer.current)
    if (frameRef.current != null) window.cancelAnimationFrame(frameRef.current)
  }, [])

  return createPortal(
    <>
      {hint && <div className="reader-hint-toast is-visible" role="status">{hint}</div>}
      {open && content && (
        <section
          ref={panelRef}
          id="writing-reader-overlay"
          className="writing-reader-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="writing-reader-title"
          tabIndex={-1}
        >
          <header className="writing-reader-header">
            <button data-drawer-initial type="button" onClick={close} aria-label="Voltar à escrita">← Escrita</button>
            <strong id="writing-reader-title">{title}</strong>
            <div className="writing-reader-controls" aria-label="Controles de leitura">
              <button type="button" aria-pressed={playing} onClick={() => setPlaying((value) => !value)}>{playing ? 'Pausar' : 'Rolar'}</button>
              <button type="button" onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)}>{SPEED_LABELS[speedIndex]}</button>
              <button type="button" onClick={() => setFontIndex((value) => (value + 1) % FONT_SIZES.length)}>{FONT_LABELS[fontIndex]}</button>
              <button type="button" aria-pressed={ruler} onClick={() => setRuler((value) => !value)}>{ruler ? 'Régua ligada' : 'Régua'}</button>
            </div>
          </header>
          <div className="writing-reader-body">
            <div ref={canvasRef} className="writing-reader-canvas" data-reader-playing={playing}>
              <article className="writing-reader-article" style={{ fontSize: `${FONT_SIZES[fontIndex]}px` }}>
                <ReaderArticle content={content} />
              </article>
            </div>
            {ruler && <div className="writing-reader-ruler" aria-hidden="true" />}
          </div>
        </section>
      )}
    </>,
    document.body,
  )
}
