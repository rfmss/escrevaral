import { displayTitle, type DocumentStatus, type EscrevaralDocument } from '../domain/document'

export type LibraryStatusFilter = 'all' | DocumentStatus
export type LibrarySort = 'updated-desc' | 'created-desc' | 'title-asc'

export type LibraryQuery = {
  search: string
  status: LibraryStatusFilter
  favoritesOnly: boolean
  tag: string
  sort: LibrarySort
}

export const DEFAULT_LIBRARY_QUERY: LibraryQuery = {
  search: '',
  status: 'all',
  favoritesOnly: false,
  tag: '',
  sort: 'updated-desc',
}

export function normalizeLibraryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

function compareTitles(a: EscrevaralDocument, b: EscrevaralDocument): number {
  const byTitle = displayTitle(a).localeCompare(displayTitle(b), 'pt-BR', {
    sensitivity: 'base',
    numeric: true,
  })
  if (byTitle !== 0) return byTitle
  if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt
  return a.id.localeCompare(b.id)
}

function includesTag(document: EscrevaralDocument, selectedTag: string): boolean {
  const normalizedTag = normalizeLibraryText(selectedTag)
  if (!normalizedTag) return true
  return document.tags.some((tag) => normalizeLibraryText(tag) === normalizedTag)
}

function matchesSearch(document: EscrevaralDocument, search: string): boolean {
  const query = normalizeLibraryText(search)
  if (!query) return true
  const haystack = normalizeLibraryText(
    `${displayTitle(document)} ${document.plainText} ${document.tags.join(' ')} ${document.status}`,
  )
  return haystack.includes(query)
}

export function queryLibraryDocuments(
  documents: EscrevaralDocument[],
  query: LibraryQuery,
): EscrevaralDocument[] {
  const filtered = documents.filter((document) => (
    matchesSearch(document, query.search)
    && (query.status === 'all' || document.status === query.status)
    && (!query.favoritesOnly || document.favorite)
    && includesTag(document, query.tag)
  ))

  return [...filtered].sort((a, b) => {
    if (query.sort === 'title-asc') return compareTitles(a, b)
    if (query.sort === 'created-desc') {
      if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt
      return compareTitles(a, b)
    }
    if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt
    return compareTitles(a, b)
  })
}

export function collectLibraryTags(documents: EscrevaralDocument[]): string[] {
  const byNormalizedTag = new Map<string, string>()
  for (const document of documents) {
    for (const rawTag of document.tags) {
      const tag = rawTag.trim()
      const normalized = normalizeLibraryText(tag)
      if (!normalized || byNormalizedTag.has(normalized)) continue
      byNormalizedTag.set(normalized, tag)
    }
  }
  return [...byNormalizedTag.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
}

export function hasActiveLibraryFilters(query: LibraryQuery): boolean {
  return Boolean(
    normalizeLibraryText(query.search)
    || query.status !== 'all'
    || query.favoritesOnly
    || query.tag
    || query.sort !== 'updated-desc',
  )
}

export function parseLibraryTags(value: string): string[] {
  const seen = new Set<string>()
  const parsed: string[] = []
  for (const rawTag of value.split(',')) {
    const tag = rawTag.trim().replace(/\s+/g, ' ').slice(0, 32)
    const normalized = normalizeLibraryText(tag)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    parsed.push(tag)
    if (parsed.length === 8) break
  }
  return parsed
}
