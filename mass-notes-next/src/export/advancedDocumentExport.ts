import type { EscrevaralDocument } from '../domain/document'

export type AdvancedExportFormat = 'docx' | 'epub' | 'obsidian'

export type AdvancedDocumentExport = {
  format: AdvancedExportFormat
  filename: string
  mimeType: string
  content: string | Uint8Array
}

type RawModule = { default: string }

type LegacyExportResult = {
  content: unknown
  filename: unknown
  mimeType: unknown
  binary?: unknown
}

declare global {
  interface Window {
    VeredaExport?: {
      exportManuscript: (manuscript: Record<string, unknown>, format: AdvancedExportFormat) => LegacyExportResult
    }
  }
}

let loadingPromise: Promise<boolean> | null = null

function executeClassicScript(source: string, id: string): void {
  if (document.querySelector(`script[data-escrevaral-engine="${id}"]`)) return
  const script = document.createElement('script')
  script.dataset.escrevaralEngine = id
  script.textContent = `${source}\n//# sourceURL=${id}`
  document.head.append(script)
}

async function ensureAdvancedExportEngine(): Promise<boolean> {
  if (window.VeredaExport?.exportManuscript) return true
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const source = await import('../../../export-engine.js?raw') as RawModule
    executeClassicScript(source.default, 'export-engine.js')
    return Boolean(window.VeredaExport?.exportManuscript)
  })().catch((error) => {
    console.error('[Escrevaral] Exportação avançada não pôde ser carregada.', error)
    return false
  }).finally(() => {
    loadingPromise = null
  })

  return loadingPromise
}

function legacyManuscript(document: EscrevaralDocument): Record<string, unknown> {
  return {
    id: document.id,
    title: document.title,
    text: document.plainText,
    status: document.status,
    tags: document.tags,
    kind: document.kind,
    type: document.type,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

function normalizeBinary(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (Array.isArray(value)) return new Uint8Array(value.map((item) => Number(item) || 0))
  throw new Error('A engine retornou um arquivo binário inválido.')
}

export async function createAdvancedDocumentExport(
  document: EscrevaralDocument,
  format: AdvancedExportFormat,
): Promise<AdvancedDocumentExport> {
  if (!(await ensureAdvancedExportEngine()) || !window.VeredaExport) {
    throw new Error('A exportação avançada não está disponível.')
  }

  const result = window.VeredaExport.exportManuscript(legacyManuscript(document), format)
  const filename = String(result.filename ?? '').replace(/^escrevaral\//, '')
  const mimeType = String(result.mimeType ?? '')
  if (!filename || !mimeType) throw new Error('A engine retornou metadados de exportação inválidos.')

  const content = result.binary
    ? normalizeBinary(result.content)
    : String(result.content ?? '')

  return { format, filename, mimeType, content }
}
