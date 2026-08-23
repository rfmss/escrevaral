import lexicalDataSource from '../../../lexical-data.json?raw'
import normaDataSource from '../../../norma-data.json?raw'
import lexicalSource from '../../../lexical-engine.js?raw'
import { getCuratedSynonyms } from './curatedSynonymCorpus'
import { resolveContextualLexicalReading } from './contextualLexicalResolver'
import { readLexicalSynonymNuances, type LexicalSynonymNuance } from './lexicalNuanceSupplement'

export type LexicalDecision = 'classificado' | 'provavel' | 'ambiguo' | 'indeterminado'

export type LexicalContextSnippet = {
  before: string
  match: string
  after: string
}

export type LexicalReading = {
  word: string
  displayWord: string
  className: string
  decision: LexicalDecision
  functionName: string
  field: string
  note: string
  definition: string
  syntacticFunction: string
  count: number
  alternatives: string[]
  synonyms: string[]
  synonymNuances: LexicalSynonymNuance[]
  contextSnippet: LexicalContextSnippet | null
}

type LegacyReading = Record<string, unknown>

let loadingPromise: Promise<boolean> | null = null

declare global {
  interface Window {
    VeredaLexical?: {
      ensureLoaded: () => Promise<void>
      hasLoadError: () => boolean
      analyze: (word: string, text?: string) => unknown
    }
    __escrevaralLexicalLoaded?: boolean
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).map((item) => item.trim()).filter(Boolean) : []
}

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function collectRegisteredTerms(value: unknown, target: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === 'string') {
        const normalized = normalizeForMatch(item)
        if (normalized) target.add(normalized)
      } else {
        collectRegisteredTerms(item, target)
      }
    })
    return
  }

  if (!value || typeof value !== 'object') return
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    const normalizedKey = normalizeForMatch(key)
    if (normalizedKey) target.add(normalizedKey)
    collectRegisteredTerms(item, target)
  })
}

const REGISTERED_TERMS = (() => {
  const result = new Set<string>()
  for (const source of [lexicalDataSource, normaDataSource]) {
    try { collectRegisteredTerms(JSON.parse(source), result) } catch { /* A engine ainda valida a carga em runtime. */ }
  }

  const objectKey = /["']([^"'\n]+)["']\s*:/g
  for (const match of lexicalSource.matchAll(objectKey)) {
    const normalized = normalizeForMatch(match[1])
    if (normalized) result.add(normalized)
  }
  return result
})()

function isRegisteredTerm(value: string): boolean {
  return REGISTERED_TERMS.has(normalizeForMatch(value))
}

function countOccurrences(context: string, query: string): number {
  const haystack = normalizeForMatch(context)
  const needle = normalizeForMatch(query)
  if (!haystack || !needle) return 0

  const source = ` ${haystack} `
  const target = ` ${needle} `
  let count = 0
  let offset = 0
  while (offset < source.length) {
    const index = source.indexOf(target, offset)
    if (index < 0) break
    count += 1
    offset = index + target.length - 1
  }
  return count
}

function createContextSnippet(context: string, query: string): LexicalContextSnippet | null {
  const cleanContext = context.replace(/\s+/g, ' ').trim()
  const cleanQuery = query.trim()
  if (!cleanContext || !cleanQuery) return null

  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = cleanContext.match(new RegExp(escaped, 'iu'))
  if (!match || match.index === undefined) return null

  const from = match.index
  const to = from + match[0].length
  const radius = 72
  const prefixStart = Math.max(0, from - radius)
  const suffixEnd = Math.min(cleanContext.length, to + radius)

  return {
    before: `${prefixStart > 0 ? '…' : ''}${cleanContext.slice(prefixStart, from)}`,
    match: cleanContext.slice(from, to),
    after: `${cleanContext.slice(to, suffixEnd)}${suffixEnd < cleanContext.length ? '…' : ''}`,
  }
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function executeClassicScript(source: string, id: string): void {
  if (document.querySelector(`script[data-escrevaral-engine="${id}"]`)) return
  const script = document.createElement('script')
  script.dataset.escrevaralEngine = id
  script.textContent = `${source}\n//# sourceURL=${id}`
  document.head.append(script)
}

async function loadEngineWithLocalData(): Promise<boolean> {
  const originalFetch = window.fetch
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input)
    if (/(^|\/)lexical-data\.json(?:[?#].*)?$/.test(url)) {
      return Promise.resolve(new Response(lexicalDataSource, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }))
    }
    if (/(^|\/)norma-data\.json(?:[?#].*)?$/.test(url)) {
      return Promise.resolve(new Response(normaDataSource, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }))
    }
    return originalFetch.call(window, input, init)
  }) as typeof window.fetch

  try {
    executeClassicScript(lexicalSource, 'lexical-engine.js')

    const engine = window.VeredaLexical
    if (!engine) return false
    await engine.ensureLoaded()
    await Promise.resolve()
    window.__escrevaralLexicalLoaded = !engine.hasLoadError()
    return window.__escrevaralLexicalLoaded
  } finally {
    window.fetch = originalFetch
  }
}

export async function ensureLexicalEngine(): Promise<boolean> {
  if (window.__escrevaralLexicalLoaded && window.VeredaLexical && !window.VeredaLexical.hasLoadError()) return true
  if (loadingPromise) return loadingPromise
  loadingPromise = loadEngineWithLocalData().catch((error) => {
    console.error('[Escrevaral] Não foi possível carregar Palavras.', error)
    return false
  })
  const loaded = await loadingPromise
  if (!loaded) loadingPromise = null
  return loaded
}

export async function readLexicalWord(word: string, context: string): Promise<LexicalReading | null> {
  const cleanWord = word.trim().replace(/^\s+|\s+$/g, '')
  if (!cleanWord || cleanWord.length > 120) return null
  if (!(await ensureLexicalEngine()) || !window.VeredaLexical) {
    throw new Error('A leitura lexical não está disponível.')
  }

  const value = window.VeredaLexical.analyze(cleanWord, context)
  if (!value || typeof value !== 'object') return null
  const source = value as LegacyReading
  const alternatives = strings(source.alternatives)
  const definition = text(source.definicao).trim()
  const count = countOccurrences(context, cleanWord)
  const registered = isRegisteredTerm(cleanWord)
  const synonyms = getCuratedSynonyms(cleanWord)
  const synonymNuances = readLexicalSynonymNuances(cleanWord, synonyms)
  let decision = text(source.decisao) as LexicalDecision
  if (!['classificado', 'provavel', 'ambiguo', 'indeterminado'].includes(decision)) decision = 'indeterminado'

  if (count === 0 && !registered) return null

  let className = text(source.className).trim() || 'Classe não determinada'
  let functionName = text(source.functionName).trim()
  let field = text(source.field).trim()
  let note = text(source.note).trim()
  let syntacticFunction = text(source.funcaoSintatica).trim()

  const contextual = resolveContextualLexicalReading(cleanWord, context)
  if (contextual) {
    className = contextual.className
    decision = contextual.decision
    functionName = contextual.functionName ?? functionName
    field = contextual.field ?? field
    note = contextual.note
    syntacticFunction = contextual.syntacticFunction ?? syntacticFunction
  }

  if (count === 0 && decision === 'provavel') {
    className = 'Classe não determinada sem contexto'
    decision = 'indeterminado'
    functionName = ''
    field = ''
    syntacticFunction = ''
    note = 'A palavra não aparece no texto atual. A definição local pode ser consultada, mas a classe gramatical depende de uma ocorrência em contexto.'
  }

  return {
    word: text(source.word).trim() || cleanWord.toLocaleLowerCase('pt-BR'),
    displayWord: text(source.displayWord).trim() || cleanWord,
    className,
    decision,
    functionName,
    field,
    note,
    definition,
    syntacticFunction,
    count,
    alternatives,
    synonyms,
    synonymNuances,
    contextSnippet: count > 0 ? createContextSnippet(context, cleanWord) : null,
  }
}