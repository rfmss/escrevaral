import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { readLatestLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import { downloadDocumentExport, type ExportFormat } from '../export/documentExport'
import { getDocument } from '../storage/documentRepository'
import { useModalDrawer } from './useModalDrawer'

const FORMATS: Array<{ format: ExportFormat; label: string; detail: string }> = [
  { format: 'txt', label: 'Texto', detail: '.txt · leitura simples e portátil' },
  { format: 'md', label: 'Markdown', detail: '.md · estrutura preservada para outros editores' },
  { format: 'html', label: 'Página', detail: '.html · documento autônomo para abrir ou imprimir' },
]

function findExportTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Exportar') ?? null
}

export function WritingExportBridge() {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [message, setMessage] = useState('Os arquivos são gerados somente neste navegador.')
  const panelRef = useModalDrawer<HTMLElement>(open, () => setOpen(false))

  useEffect(() => {
    const find = () => {
      const next = findExportTrigger()
      if (next) setTrigger((current) => current === next ? current : next)
      return Boolean(next)
    }

    if (find()) return
    const root = document.getElementById('root')
    if (!root) return

    const observer = new MutationObserver(() => {
      if (find()) observer.disconnect()
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!trigger) return

    const openPanel = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setMessage('Os arquivos são gerados somente neste navegador.')
      setOpen(true)
    }

    trigger.addEventListener('click', openPanel, true)
    trigger.setAttribute('aria-controls', 'writing-export-panel')

    return () => {
      trigger.removeEventListener('click', openPanel, true)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
    }
  }, [trigger])

  useEffect(() => {
    trigger?.setAttribute('aria-expanded', String(open))
  }, [open, trigger])

  const exportCurrent = async (format: ExportFormat) => {
    if (busy) return
    setBusy(format)

    try {
      const live = readLatestLiveEditorSnapshot()
      if (!live) throw new Error('snapshot indisponível')

      const persisted = await getDocument(live.documentId)
      if (!persisted) throw new Error('documento indisponível')

      const liveTitle = document.querySelector<HTMLInputElement>('.reference-document-title')?.value
      const exported = downloadDocumentExport({
        ...persisted,
        title: liveTitle ?? persisted.title,
        content: live.content,
        plainText: live.plainText,
      }, format)

      setMessage(`${exported.filename} gerado localmente.`)
    } catch (error) {
      console.error('[Escrevaral] Exportação não concluída.', error)
      setMessage('Não foi possível gerar o arquivo agora.')
    } finally {
      setBusy(null)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="writing-export-layer">
      <button className="writing-export-overlay" type="button" aria-label="Fechar exportação" onClick={() => setOpen(false)} />
      <section
        ref={panelRef}
        id="writing-export-panel"
        className="writing-export-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="writing-export-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span className="eyebrow">ARQUIVO LOCAL</span>
            <h2 id="writing-export-title">Exportar documento</h2>
          </div>
          <button type="button" className="icon-square" aria-label="Fechar exportação" onClick={() => setOpen(false)}>×</button>
        </header>

        <p className="writing-export-intro">Escolha o formato. O manuscrito não sai do dispositivo.</p>

        <div className="writing-export-options">
          {FORMATS.map(({ format, label, detail }, index) => (
            <button
              key={format}
              data-drawer-initial={index === 0 ? true : undefined}
              data-reference-export-format={format}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => { void exportCurrent(format) }}
            >
              <span className="writing-export-extension">{format.toUpperCase()}</span>
              <span><strong>{label}</strong><small>{detail}</small></span>
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </div>

        <footer>
          <span role="status" aria-live="polite">{message}</span>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
