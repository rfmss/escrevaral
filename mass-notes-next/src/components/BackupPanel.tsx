import { useRef, useState, type ChangeEvent } from 'react'
import type { EscrevaralDocument } from '../domain/document'

type Props = {
  documentCount: number
  busy: boolean
  message: string
  onCreateBackup: () => void
  onRestore: (file: File) => Promise<void>
}

export function BackupPanel({ documentCount, busy, message, onCreateBackup, onRestore }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [filename, setFilename] = useState('')

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFilename(file.name)
    await onRestore(file)
  }

  return (
    <section className="backup-panel" aria-labelledby="backup-panel-title">
      <h3 id="backup-panel-title" className="sr-only">Cópia de segurança</h3>
      <p className="panel-intro">
        A cópia nativa reúne os {documentCount} {documentCount === 1 ? 'documento' : 'documentos'} da biblioteca em um envelope JSON versionado.
      </p>
      <button className="action" type="button" onClick={onCreateBackup} disabled={busy || documentCount === 0} data-backup-action="create">
        <strong>Baixar cópia nativa</strong>
        <span>Preserva estrutura Tiptap, títulos, estados, tags e metadados.</span>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".json,.esc.json,application/json"
        aria-label="Selecionar cópia nativa"
        onChange={(event) => { void selectFile(event) }}
      />
      <button className="action" type="button" onClick={() => inputRef.current?.click()} disabled={busy} data-backup-action="restore">
        <strong>{busy ? 'Validando cópia…' : 'Restaurar como cópias'}</strong>
        <span>Nada existente é substituído; cada documento recebe novo identificador.</span>
      </button>
      {filename && <p className="backup-filename">Arquivo: {filename}</p>}
      <p className="backup-message" role="status" aria-live="polite">{message}</p>
    </section>
  )
}
