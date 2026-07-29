import type { EscrevaralDocument } from '../domain/document'
import type { ExportFormat } from '../export/documentExport'
import { BackupPanel } from './BackupPanel'

const FORMATS: Array<{ format: ExportFormat; label: string; detail: string }> = [
  { format: 'txt', label: 'Texto (.txt)', detail: 'Leitura simples com listas e citações.' },
  { format: 'md', label: 'Markdown (.md)', detail: 'Estrutura portátil para editores de texto.' },
  { format: 'html', label: 'Página (.html)', detail: 'Documento sem dependências, pronto para abrir ou imprimir.' },
]

type Props = {
  document: EscrevaralDocument
  onExport: (format: ExportFormat) => void
}

export function ExportPanel({ document, onExport }: Props) {
  const empty = !document.plainText.trim()

  return (
    <>
      <section className="export-panel" aria-labelledby="export-panel-title">
        <h3 id="export-panel-title" className="sr-only">Exportar documento</h3>
        <p className="panel-intro">
          Os arquivos são gerados localmente a partir da estrutura atual do documento.
          {empty ? ' A página está vazia; o título e os metadados ainda serão preservados.' : ''}
        </p>
        <div className="export-options">
          {FORMATS.map(({ format, label, detail }) => (
            <button
              key={format}
              className="action"
              type="button"
              data-export-format={format}
              onClick={() => onExport(format)}
            >
              <strong>{label}</strong>
              <span>{detail}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="section-label">Cópia de segurança</div>
      <BackupPanel document={document} />
    </>
  )
}
