import lexicalDataSource from '../../../lexical-data.json?raw'
import normaDataSource from '../../../norma-data.json?raw'
import lexicalSource from '../../../lexical-engine.js?raw'

export type LexicalDecision = 'classificado' | 'provavel' | 'ambiguo' | 'indeterminado'

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

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
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
    if (!document.querySelector('script[data-escrevaral-engine="lexical-engine.js"]')) {
      const script = document.createElement('script')
      script.dataset.escrevaralEngine = 'lexical-engine.js'
      script.textContent = `${lexicalSource}\n//# sourceURL=lexical-engine.js`
      document.head.append(script)
    }

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
  let decision = text(source.decisao) as LexicalDecision
  if (!['classificado', 'provavel', 'ambiguo', 'indeterminado'].includes(decision)) decision = 'indeterminado'

  if (count === 0 && decision !== 'classificado' && !definition && alternatives.length === 0) return null

  let className = text(source.className).trim() || 'Classe não determinada'
  let functionName = text(source.functionName).trim()
  let field = text(source.field).trim()
  let note = text(source.note).trim()
  let syntacticFunction = text(source.funcaoSintatica).trim()

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
  }
}
