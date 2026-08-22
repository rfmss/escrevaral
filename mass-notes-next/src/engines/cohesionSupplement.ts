export type CohesionRelation =
  | 'adição'
  | 'contraste'
  | 'causa'
  | 'conclusão'
  | 'condição'
  | 'tempo'
  | 'explicação'
  | 'reformulação'

export type CohesionMarker = {
  marker: string
  relation: CohesionRelation
  count: number
}

export type CohesionRecurrence = {
  word: string
  transitions: number
}

export type CohesionReading = {
  sentenceCount: number
  referentialMarkers: number
  sequentialMarkers: CohesionMarker[]
  recurrences: CohesionRecurrence[]
}

const CONNECTORS: Array<{ relation: CohesionRelation; forms: string[] }> = [
  { relation: 'adição', forms: ['além disso', 'também', 'bem como', 'ainda'] },
  { relation: 'contraste', forms: ['no entanto', 'entretanto', 'contudo', 'todavia', 'porém', 'mas'] },
  { relation: 'causa', forms: ['uma vez que', 'visto que', 'já que', 'porque'] },
  { relation: 'conclusão', forms: ['por isso', 'desse modo', 'dessa forma', 'portanto', 'assim', 'logo'] },
  { relation: 'condição', forms: ['desde que', 'contanto que', 'caso', 'se'] },
  { relation: 'tempo', forms: ['ao mesmo tempo', 'depois que', 'antes que', 'enquanto', 'quando'] },
  { relation: 'explicação', forms: ['por exemplo', 'pois'] },
  { relation: 'reformulação', forms: ['ou seja', 'isto é', 'em outras palavras'] },
]

const REFERENTIAL = new Set([
  'ele', 'ela', 'eles', 'elas',
  'este', 'esta', 'estes', 'estas', 'isto',
  'esse', 'essa', 'esses', 'essas', 'isso',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo',
  'seu', 'sua', 'seus', 'suas',
])

const STOPWORDS = new Set([
  'para', 'como', 'mais', 'menos', 'muito', 'muita', 'muitos', 'muitas',
  'sobre', 'entre', 'depois', 'antes', 'quando', 'ainda', 'também', 'porque',
  'isso', 'isto', 'essa', 'esse', 'esta', 'este', 'aquele', 'aquela',
  'pela', 'pelo', 'pelas', 'pelos', 'uma', 'umas', 'uns', 'com', 'sem',
])

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
}

function words(value: string): string[] {
  return normalize(value).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []
}

function sentences(value: string): string[] {
  return value
    .split(/(?<=[.!?…])\s+|\n{2,}/u)
    .map((item) => item.trim())
    .filter(Boolean)
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countForm(text: string, form: string): number {
  const pattern = new RegExp(`(^|[^\\p{L}])${escaped(normalize(form))}(?=$|[^\\p{L}])`, 'gu')
  return [...normalize(text).matchAll(pattern)].length
}

function sequentialMarkers(text: string): CohesionMarker[] {
  return CONNECTORS.flatMap(({ relation, forms }) => forms.flatMap((marker) => {
    const count = countForm(text, marker)
    return count ? [{ marker, relation, count }] : []
  })).sort((a, b) => b.count - a.count || a.marker.localeCompare(b.marker, 'pt-BR'))
}

function countReferentialMarkers(text: string): number {
  return words(text).reduce((total, word) => total + (REFERENTIAL.has(word) ? 1 : 0), 0)
}

function sentenceContentWords(sentence: string): Set<string> {
  return new Set(words(sentence).filter((word) => word.length >= 4 && !STOPWORDS.has(word)))
}

function recurringAcrossAdjacentSentences(text: string): CohesionRecurrence[] {
  const parts = sentences(text)
  const transitions = new Map<string, number>()

  for (let index = 1; index < parts.length; index += 1) {
    const previous = sentenceContentWords(parts[index - 1])
    const current = sentenceContentWords(parts[index])
    for (const word of current) {
      if (!previous.has(word)) continue
      transitions.set(word, (transitions.get(word) ?? 0) + 1)
    }
  }

  return [...transitions.entries()]
    .map(([word, count]) => ({ word, transitions: count }))
    .sort((a, b) => b.transitions - a.transitions || a.word.localeCompare(b.word, 'pt-BR'))
    .slice(0, 8)
}

export function analyzeTextCohesion(text: string): CohesionReading {
  const clean = text.trim()
  if (!clean) {
    return { sentenceCount: 0, referentialMarkers: 0, sequentialMarkers: [], recurrences: [] }
  }

  return {
    sentenceCount: sentences(clean).length,
    referentialMarkers: countReferentialMarkers(clean),
    sequentialMarkers: sequentialMarkers(clean),
    recurrences: recurringAcrossAdjacentSentences(clean),
  }
}
