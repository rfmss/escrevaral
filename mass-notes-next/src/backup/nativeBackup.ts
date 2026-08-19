import type { JSONContent } from '@tiptap/core'
import { createDocument, type DocumentStatus, type EscrevaralDocument } from '../domain/document'

export const NATIVE_BACKUP_SCHEMA = 'escrevaral.mass-notes-next.backup'
export const NATIVE_BACKUP_VERSION = 1
export const NATIVE_BACKUP_LAST_EXPORT_KEY = 'escrevaral-mass-notes-next-last-backup-v1'

export type NativeBackupEnvelope = {
  schema: typeof NATIVE_BACKUP_SCHEMA
  version: typeof NATIVE_BACKUP_VERSION
  exportedAt: number
  app: 'mass-notes-next'
  documents: EscrevaralDocument[]
}

export class NativeBackupValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NativeBackupValidationError'
  }
}

const STATUSES: DocumentStatus[] = ['Rascunho', 'Em corte', 'Pronto']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isJsonContent(value: unknown): value is JSONContent {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  if (value.content !== undefined && !Array.isArray(value.content)) return false
  if (Array.isArray(value.content) && !value.content.every(isJsonContent)) return false
  if (value.text !== undefined && typeof value.text !== 'string') return false
  if (value.marks !== undefined && !Array.isArray(value.marks)) return false
  if (value.attrs !== undefined && !isRecord(value.attrs)) return false
  return true
}

function validateDocument(value: unknown, index: number): EscrevaralDocument {
  if (!isRecord(value)) throw new NativeBackupValidationError(`Documento ${index + 1}: estrutura inválida.`)
  if (typeof value.id !== 'string' || !value.id.trim()) throw new NativeBackupValidationError(`Documento ${index + 1}: identificador ausente.`)
  if (typeof value.title !== 'string') throw new NativeBackupValidationError(`Documento ${index + 1}: título inválido.`)
  if (!isJsonContent(value.content) || value.content.type !== 'doc') throw new NativeBackupValidationError(`Documento ${index + 1}: conteúdo Tiptap inválido.`)
  if (typeof value.plainText !== 'string') throw new NativeBackupValidationError(`Documento ${index + 1}: texto derivado inválido.`)
  if (!STATUSES.includes(value.status as DocumentStatus)) throw new NativeBackupValidationError(`Documento ${index + 1}: estado inválido.`)
  if (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === 'string')) throw new NativeBackupValidationError(`Documento ${index + 1}: tags inválidas.`)
  if (typeof value.favorite !== 'boolean') throw new NativeBackupValidationError(`Documento ${index + 1}: favorito inválido.`)
  if (!Number.isFinite(value.createdAt) || !Number.isFinite(value.updatedAt) || !Number.isInteger(value.revision) || Number(value.revision) < 0) {
    throw new NativeBackupValidationError(`Documento ${index + 1}: metadados temporais ou revisão inválidos.`)
  }

  return createDocument({
    id: value.id,
    title: value.title,
    content: structuredClone(value.content),
    plainText: value.plainText,
    status: value.status as DocumentStatus,
    tags: [...value.tags],
    favorite: value.favorite,
    createdAt: Number(value.createdAt),
    updatedAt: Number(value.updatedAt),
    revision: Number(value.revision),
    legacySourceId: typeof value.legacySourceId === 'string' ? value.legacySourceId : null,
  })
}

export function createNativeBackup(documents: EscrevaralDocument[]): NativeBackupEnvelope {
  return {
    schema: NATIVE_BACKUP_SCHEMA,
    version: NATIVE_BACKUP_VERSION,
    exportedAt: Date.now(),
    app: 'mass-notes-next',
    documents: documents.map((document) => structuredClone(document)),
  }
}

export function serializeNativeBackup(documents: EscrevaralDocument[]): string {
  return `${JSON.stringify(createNativeBackup(documents), null, 2)}\n`
}

export function parseNativeBackup(raw: string): NativeBackupEnvelope {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new NativeBackupValidationError('O arquivo não contém JSON válido.')
  }

  if (!isRecord(parsed)) throw new NativeBackupValidationError('A estrutura da cópia não foi reconhecida.')
  if (parsed.schema !== NATIVE_BACKUP_SCHEMA) throw new NativeBackupValidationError('Este arquivo não é uma cópia nativa do Mass Notes Next.')
  if (parsed.version !== NATIVE_BACKUP_VERSION) throw new NativeBackupValidationError(`Versão de cópia não suportada: ${String(parsed.version)}.`)
  if (parsed.app !== 'mass-notes-next') throw new NativeBackupValidationError('Origem da cópia não reconhecida.')
  if (!Number.isFinite(parsed.exportedAt)) throw new NativeBackupValidationError('Data de criação da cópia inválida.')
  if (!Array.isArray(parsed.documents) || parsed.documents.length === 0) throw new NativeBackupValidationError('A cópia não contém documentos.')

  const documents = parsed.documents.map(validateDocument)
  const sourceIds = new Set<string>()
  for (const document of documents) {
    if (sourceIds.has(document.id)) throw new NativeBackupValidationError(`Identificador duplicado na cópia: ${document.id}.`)
    sourceIds.add(document.id)
  }

  return {
    schema: NATIVE_BACKUP_SCHEMA,
    version: NATIVE_BACKUP_VERSION,
    exportedAt: Number(parsed.exportedAt),
    app: 'mass-notes-next',
    documents,
  }
}

export function nativeBackupFilename(date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
  return `escrevaral-copia-${stamp}.esc.json`
}

export function readNativeBackupExportedAt(): number | null {
  try {
    const value = Number(window.localStorage.getItem(NATIVE_BACKUP_LAST_EXPORT_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

export function markNativeBackupExported(exportedAt = Date.now()): void {
  try { window.localStorage.setItem(NATIVE_BACKUP_LAST_EXPORT_KEY, String(exportedAt)) } catch { /* O download continua válido sem a preferência. */ }
}

export function downloadNativeBackup(documents: EscrevaralDocument[]): void {
  const blob = new Blob([serializeNativeBackup(documents)], { type: 'application/json;charset=utf-8' })
  const anchor = window.document.createElement('a')
  anchor.href = URL.createObjectURL(blob)
  anchor.download = nativeBackupFilename()
  anchor.click()
  markNativeBackupExported()
  window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1_000)
}
