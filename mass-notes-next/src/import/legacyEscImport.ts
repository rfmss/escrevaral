import { createDocument, plainTextToContent, type DocumentStatus, type EscrevaralDocument } from '../domain/document'
import { parseLibraryTags } from '../library/libraryQuery'

export type LegacyEscPreviewItem = {
  sourceId: string
  title: string
  type: string
  words: number
  status: DocumentStatus
  tags: string[]
}

export type LegacyEscImportPlan = {
  format: 'esc' | 'vrda'
  schemaVersion: 1
  exportedAt: string | null
  documents: EscrevaralDocument[]
  preview: LegacyEscPreviewItem[]
}

export class LegacyEscValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LegacyEscValidationError'
  }
}

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stableSort(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableSort)
  if (!isRecord(value)) return value
  return Object.keys(value).sort().reduce<JsonRecord>((result, key) => {
    result[key] = stableSort(value[key])
    return result
  }, {})
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function checksum(payload: unknown): string {
  return fnv1a(JSON.stringify(stableSort(payload)))
}

function parseTimestamp(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function mapStatus(value: unknown): DocumentStatus {
  const normalized = String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  if (/pronto|finaliz|publicad|concluid/.test(normalized)) return 'Pronto'
  if (/corte|revis|edicao|editando/.test(normalized)) return 'Em corte'
  return 'Rascunho'
}

function countWords(text: string): number {
  return text.trim() ? (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? []).length : 0
}

function validateManuscript(value: unknown, index: number, seen: Set<string>, importedAt: number): { document: EscrevaralDocument; preview: LegacyEscPreviewItem } {
  if (!isRecord(value)) throw new LegacyEscValidationError(`Item ${index + 1}: manuscrito inválido.`)
  const sourceId = typeof value.id === 'string' ? value.id.trim() : ''
  if (!sourceId) throw new LegacyEscValidationError(`Item ${index + 1}: identificador legado ausente.`)
  if (seen.has(sourceId)) throw new LegacyEscValidationError(`Identificador legado duplicado: ${sourceId}.`)
  seen.add(sourceId)

  const title = String(value.title ?? value.name ?? '').trim() || 'Sem título'
  const textValue = value.text ?? value.content ?? ''
  if (typeof textValue !== 'string') throw new LegacyEscValidationError(`“${title}”: conteúdo textual inválido.`)
  const type = String(value.type ?? 'manuscrito')
  const tags = parseLibraryTags(Array.isArray(value.tags) ? value.tags.map(String).join(',') : String(value.tags ?? ''))
  const status = mapStatus(value.status ?? value.kind)
  const createdAt = parseTimestamp(value.createdAt ?? value.created, importedAt + index)
  const updatedAt = parseTimestamp(value.updatedAt ?? value.updated, createdAt)

  const document = createDocument({
    title,
    plainText: textValue,
    content: plainTextToContent(textValue),
    status,
    tags,
    favorite: Boolean(value.pinned ?? value.favorite),
    createdAt,
    updatedAt,
    revision: 0,
    legacySourceId: sourceId,
  })

  return {
    document,
    preview: { sourceId, title, type, words: countWords(textValue), status, tags },
  }
}

export function parseLegacyEsc(raw: string): LegacyEscImportPlan {
  let envelope: unknown
  try {
    envelope = JSON.parse(raw)
  } catch {
    throw new LegacyEscValidationError('O arquivo .esc não contém JSON válido.')
  }
  if (!isRecord(envelope)) throw new LegacyEscValidationError('A estrutura do arquivo .esc não foi reconhecida.')
  if (envelope.format !== 'esc' && envelope.format !== 'vrda') throw new LegacyEscValidationError('Este arquivo não é um acervo .esc legado válido.')
  if (envelope.schemaVersion !== 1) throw new LegacyEscValidationError(`Versão legada não suportada: ${String(envelope.schemaVersion)}.`)
  if (!isRecord(envelope.payload)) throw new LegacyEscValidationError('O arquivo .esc não possui payload válido.')
  if (typeof envelope.checksum !== 'string' || checksum(envelope.payload) !== envelope.checksum) {
    throw new LegacyEscValidationError('A assinatura do arquivo .esc é inválida.')
  }
  const manuscripts = envelope.payload.manuscripts
  if (!Array.isArray(manuscripts) || manuscripts.length === 0) throw new LegacyEscValidationError('O arquivo .esc não contém manuscritos.')
  if (manuscripts.length > 2_000) throw new LegacyEscValidationError('O arquivo excede o limite auditável de 2.000 itens.')

  const importedAt = Date.now()
  const seen = new Set<string>()
  const converted = manuscripts.map((item, index) => validateManuscript(item, index, seen, importedAt))
  return {
    format: envelope.format,
    schemaVersion: 1,
    exportedAt: typeof envelope.exportedAt === 'string' ? envelope.exportedAt : null,
    documents: converted.map((item) => item.document),
    preview: converted.map((item) => item.preview),
  }
}
