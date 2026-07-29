import { useRef, useState, type ChangeEvent } from 'react'
import { downloadNativeBackup, NativeBackupValidationError, parseNativeBackup } from '../backup/nativeBackup'
import type { EscrevaralDocument } from '../domain/document'
import { listDocuments, restoreDocumentsAsCopies } from '../storage/documentRepository'

const CHANNEL = 'escrevaral-mass-notes-next-documents'

type Props = {
  document: EscrevaralDocument
}

export function BackupPanel({ document }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [filename, setFilename] = useState('')
  const [message, setMessage] = useState('Nenhuma cópia foi restaurada nesta sessão.')

  const createBackup = async () => {
    setBusy(true)
    try {
      const persisted = await listDocuments()
      const documents = persisted.some((item) => item.id === document.id)
        ? persisted.map((item) => item.id === document.id ? structuredClone(document) : item)
        : [structuredClone(document), ...persisted]
      downloadNativeBackup(documents)
      setMessage(`Cópia criada com ${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}.`)
    } catch (error) {
      console.error('[Escrevaral] Cópia nativa não criada.', error)
      setMessage('Não foi possível criar a cópia agora.')
    } finally {
      setBusy(false)
    }
  }

  const restoreFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFilename(file.name)
    setBusy(true)

    try {
      const envelope = parseNativeBackup(await file.text())
      const restored = await restoreDocumentsAsCopies(envelope.documents)
      const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null
      for (const item of restored) channel?.postMessage({ id: item.id, revision: item.revision })
      channel?.close()
      setMessage(`${restored.length} ${restored.length === 1 ? 'documento restaurado' : 'documentos restaurados'} como novas cópias. Nada existente foi substituído.`)
    } catch (error) {
      console.error('[Escrevaral] Cópia nativa não restaurada.', error)
      setMessage(error instanceof NativeBackupValidationError ? error.message : 'Não foi possível restaurar esta cópia.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="backup-panel" aria-labelledby="backup-panel-title">
      <h3 id="backup-panel-title" className="sr-only">Cópia de segurança</h3>
      <p className="panel-intro">A cópia nativa reúne toda a biblioteca em um envelope JSON versionado e gerado localmente.</p>
      <button className="action" type="button" onClick={() => { void createBackup() }} disabled={busy} data-backup-action="create">
        <strong>Baixar cópia nativa</strong>
        <span>Preserva estrutura Tiptap, títulos, estados, tags e metadados.</span>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".json,.esc.json,application/json"
        aria-label="Selecionar cópia nativa"
        onChange={(event) => { void restoreFile(event) }}
      />
      <button className="action" type="button" onClick={() => inputRef.current?.click()} disabled={busy} data-backup-action="restore">
        <strong>{busy ? 'Processando cópia…' : 'Restaurar como cópias'}</strong>
        <span>Nada existente é substituído; cada documento recebe novo identificador.</span>
      </button>
      {filename && <p className="backup-filename">Arquivo: {filename}</p>}
      <p className="backup-message" role="status" aria-live="polite">{message}</p>
    </section>
  )
}
