import { useRef, useState, type ChangeEvent } from 'react'
import { downloadNativeBackup, NativeBackupValidationError, parseNativeBackup } from '../backup/nativeBackup'
import type { EscrevaralDocument } from '../domain/document'
import { LegacyEscValidationError, parseLegacyEsc, type LegacyEscImportPlan } from '../import/legacyEscImport'
import { importLegacyDocumentsAsCopies, listDocuments, restoreDocumentsAsCopies } from '../storage/documentRepository'

const CHANNEL = 'escrevaral-mass-notes-next-documents'

type Props = {
  document: EscrevaralDocument
}

function announceDocuments(documents: EscrevaralDocument[]): void {
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL) : null
  for (const item of documents) channel?.postMessage({ id: item.id, revision: item.revision, kind: 'metadata' })
  channel?.close()
}

export function BackupPanel({ document }: Props) {
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const legacyInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [filename, setFilename] = useState('')
  const [message, setMessage] = useState('Nenhuma cópia foi restaurada nesta sessão.')
  const [legacyPlan, setLegacyPlan] = useState<LegacyEscImportPlan | null>(null)

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
    setLegacyPlan(null)
    setBusy(true)

    try {
      const envelope = parseNativeBackup(await file.text())
      const restored = await restoreDocumentsAsCopies(envelope.documents)
      announceDocuments(restored)
      setMessage(`${restored.length} ${restored.length === 1 ? 'documento restaurado' : 'documentos restaurados'} como novas cópias. Nada existente foi substituído.`)
    } catch (error) {
      console.error('[Escrevaral] Cópia nativa não restaurada.', error)
      setMessage(error instanceof NativeBackupValidationError ? error.message : 'Não foi possível restaurar esta cópia.')
    } finally {
      setBusy(false)
    }
  }

  const inspectLegacyFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFilename(file.name)
    setLegacyPlan(null)
    setBusy(true)

    try {
      if (!file.name.toLocaleLowerCase('pt-BR').endsWith('.esc')) throw new LegacyEscValidationError('Selecione um arquivo legado com extensão .esc.')
      const plan = parseLegacyEsc(await file.text())
      setLegacyPlan(plan)
      setMessage(`${plan.documents.length} ${plan.documents.length === 1 ? 'item validado' : 'itens validados'}. Confira a prévia antes de importar.`)
    } catch (error) {
      console.error('[Escrevaral] Arquivo .esc legado rejeitado.', error)
      setMessage(error instanceof LegacyEscValidationError ? error.message : 'Não foi possível validar este arquivo .esc.')
    } finally {
      setBusy(false)
    }
  }

  const confirmLegacyImport = async () => {
    if (!legacyPlan) return
    setBusy(true)
    try {
      const imported = await importLegacyDocumentsAsCopies(legacyPlan.documents)
      announceDocuments(imported)
      setLegacyPlan(null)
      setMessage(`${imported.length} ${imported.length === 1 ? 'documento importado' : 'documentos importados'} como novas cópias rastreáveis. Nada existente foi substituído.`)
    } catch (error) {
      console.error('[Escrevaral] Importação legada não concluída.', error)
      setMessage('A importação foi cancelada antes de concluir. Nenhum documento parcial deve permanecer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="backup-panel" aria-labelledby="backup-panel-title">
      <h3 id="backup-panel-title" className="sr-only">Cópia de segurança e importação</h3>
      <p className="panel-intro">A cópia nativa reúne toda a biblioteca em um envelope JSON versionado e gerado localmente.</p>
      <button className="action" type="button" onClick={() => { void createBackup() }} disabled={busy} data-backup-action="create">
        <strong>Baixar cópia nativa</strong>
        <span>Preserva estrutura Tiptap, títulos, estados, tags e metadados.</span>
      </button>
      <input
        ref={nativeInputRef}
        className="sr-only"
        type="file"
        accept=".json,.esc.json,application/json"
        aria-label="Selecionar cópia nativa"
        onChange={(event) => { void restoreFile(event) }}
      />
      <button className="action" type="button" onClick={() => nativeInputRef.current?.click()} disabled={busy} data-backup-action="restore">
        <strong>{busy ? 'Processando arquivo…' : 'Restaurar cópia nativa'}</strong>
        <span>Nada existente é substituído; cada documento recebe novo identificador.</span>
      </button>

      <div className="section-label">Trazer acervo antigo</div>
      <p className="panel-intro">O `.esc` legado é validado e pré-visualizado antes de qualquer gravação.</p>
      <input
        ref={legacyInputRef}
        className="sr-only"
        type="file"
        accept=".esc,application/json"
        aria-label="Selecionar acervo esc legado"
        onChange={(event) => { void inspectLegacyFile(event) }}
      />
      <button className="action" type="button" onClick={() => legacyInputRef.current?.click()} disabled={busy} data-backup-action="legacy-import">
        <strong>Examinar arquivo .esc antigo</strong>
        <span>Confere formato, versão, assinatura, identificadores e conteúdo antes de importar.</span>
      </button>

      {legacyPlan && (
        <section className="legacy-import-preview" aria-labelledby="legacy-import-preview-title">
          <h4 id="legacy-import-preview-title">Prévia do acervo legado</h4>
          <p>{legacyPlan.documents.length} itens · formato {legacyPlan.format} v{legacyPlan.schemaVersion}</p>
          <ul>
            {legacyPlan.preview.slice(0, 5).map((item) => (
              <li key={item.sourceId}>
                <strong>{item.title}</strong>
                <span>{item.type} · {item.words} palavras · {item.status}</span>
              </li>
            ))}
          </ul>
          {legacyPlan.preview.length > 5 && <p>Mais {legacyPlan.preview.length - 5} itens também foram validados.</p>}
          <div className="legacy-import-actions">
            <button type="button" onClick={() => setLegacyPlan(null)} disabled={busy}>Cancelar</button>
            <button type="button" onClick={() => { void confirmLegacyImport() }} disabled={busy}>Importar como novas cópias</button>
          </div>
          <p className="metadata-note">Nenhum documento existente será alterado. Cada cópia mantém o identificador legado apenas como origem auditável.</p>
        </section>
      )}

      {filename && <p className="backup-filename">Arquivo: {filename}</p>}
      <p className="backup-message" role="status" aria-live="polite">{message}</p>
    </section>
  )
}
