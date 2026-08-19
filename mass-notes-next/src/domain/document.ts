import type { JSONContent } from '@tiptap/core'

export type DocumentStatus = 'Rascunho' | 'Em corte' | 'Pronto'

export type EscrevaralDocument = {
  id: string
  title: string
  content: JSONContent
  plainText: string
  status: DocumentStatus
  tags: string[]
  favorite: boolean
  createdAt: number
  updatedAt: number
  revision: number
  legacySourceId?: string | null
  type?: string | null
  kind?: string | null
  templateId?: string | null
}

export type SaveState = 'Carregando' | 'Alterado' | 'Salvando' | 'Salvo' | 'Conflito' | 'Falha'

export const EMPTY_CONTENT: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

export function createDocument(overrides: Partial<EscrevaralDocument> = {}): EscrevaralDocument {
  const timestamp = Date.now()
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? '',
    content: overrides.content ?? structuredClone(EMPTY_CONTENT),
    plainText: overrides.plainText ?? '',
    status: overrides.status ?? 'Rascunho',
    tags: overrides.tags ?? [],
    favorite: overrides.favorite ?? false,
    createdAt: overrides.createdAt ?? timestamp,
    updatedAt: overrides.updatedAt ?? timestamp,
    revision: overrides.revision ?? 0,
    legacySourceId: overrides.legacySourceId ?? null,
    type: overrides.type ?? null,
    kind: overrides.kind ?? null,
    templateId: overrides.templateId ?? null,
  }
}

export function displayTitle(document: EscrevaralDocument): string {
  return document.title.trim() || 'Sem título'
}

export function countWords(text: string): number {
  return text.trim() ? (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? []).length : 0
}

export function averageSentenceLength(text: string): number {
  const sentences = text
    .split(/[.!?…]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  if (!sentences.length) return 0
  return Math.round(countWords(text) / sentences.length)
}

export function plainTextToContent(text: string): JSONContent {
  const paragraphs = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())

  return {
    type: 'doc',
    content: paragraphs.length
      ? paragraphs.map((paragraph) => ({
          type: 'paragraph',
          content: paragraph
            ? [{ type: 'text', text: paragraph.replace(/\n/g, ' ') }]
            : undefined,
        }))
      : [{ type: 'paragraph' }],
  }
}
