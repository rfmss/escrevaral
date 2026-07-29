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

type ContextualOverride = {
  className: string
  decision: LexicalDecision
  functionName?: string
  field?: string
  note: string
  syntacticFunction?: string
}

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

const SUBJECT_PRONOUNS = new Set([
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês',
])

const DETERMINERS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas',
])

const PASSIVE_AUXILIARIES = new Set([
  'sou', 'és', 'é', 'somos', 'sois', 'são',
  'fui', 'foi', 'fomos', 'foram',
  'era', 'éramos', 'eram', 'será', 'serão', 'seria', 'seriam',
  'seja', 'sejam', 'fosse', 'fossem', 'sido',
])

const PARTICIPLE_FORMS = new Map<string, string>([
  ['preso', 'prender'], ['presa', 'prender'], ['presos', 'prender'], ['presas', 'prender'],
  ['contido', 'conter'], ['contida', 'conter'], ['contidos', 'conter'], ['contidas', 'conter'],
  ['oculto', 'ocultar'], ['oculta', 'ocultar'], ['ocultos', 'ocultar'], ['ocultas', 'ocultar'],
])

const AMBIGUOUS_PRESENT_FORMS = new Map<string, string>([
  ['canto', 'cantar'],
  ['larga', 'largar'],
  ['estreita', 'estreitar'],
])

const POST_NOMINAL_ADJECTIVES = new Set([
  'larga', 'largo', 'largas', 'largos',
  'estreita', 'estreito', 'estreitas', 'estreitos',
])

const FIXED_EXPRESSIONS = new Map<string, ContextualOverride>([
  ['por enquanto', {
    className: 'Locução adverbial',
    decision: 'classificado',
    functionName: 'Valor temporal',
    field: 'tempo',
    note: 'A expressão inteira situa a ação no tempo; não é a soma isolada de “por” e “enquanto”.',
    syntacticFunction: 'Adjunto adverbial de tempo',
  }],
  ['enquanto isso', {
    className: 'Locução adverbial',
    decision: 'classificado',
    functionName: 'Conector temporal',
    field: 'tempo',
    note: 'A expressão inteira conecta acontecimentos simultâneos ou próximos no discurso.',
    syntacticFunction: 'Adjunto adverbial de tempo',
  }],
])

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

function normalizePreservingDiacritics(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function tokenize(value: string): string[] {
  return normalizePreservingDiacritics(value).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []
}

function findTokenSequence(tokens: string[], queryTokens: string[]): number {
  if (queryTokens.length === 0 || queryTokens.length > tokens.length) return -1
  for (let index = 0; index <= tokens.length - queryTokens.length; index += 1) {
    if (queryTokens.every((token, offset) => tokens[index + offset] === token)) return index
  }
  return -1
}

function contextualOverride(query: string, context: string): ContextualOverride | null {
  const cleanQuery = normalizePreservingDiacritics(query)
  const fixed = FIXED_EXPRESSIONS.get(cleanQuery)
  if (fixed) return fixed

  const contextTokens = tokenize(context)
  const queryTokens = tokenize(cleanQuery)
  const index = findTokenSequence(contextTokens, queryTokens)
  if (index < 0 || queryTokens.length !== 1) return null

  const token = queryTokens[0]
  const previous = contextTokens[index - 1] ?? ''
  const twoBefore = contextTokens[index - 2] ?? ''

  // Acento é informação gramatical, não mero detalhe de busca.
  // “publica” é forma de publicar; “pública” permanece adjetivo na engine base.
  if (token === 'publica') {
    return {
      className: 'Verbo flexionado',
      decision: 'classificado',
      functionName: 'Forma do verbo publicar',
      note: 'Sem acento, “publica” é forma verbal. A forma adjetiva correspondente é “pública”.',
      syntacticFunction: 'Núcleo do predicado verbal',
    }
  }

  const participleLemma = PARTICIPLE_FORMS.get(token)
  if (participleLemma && PASSIVE_AUXILIARIES.has(previous)) {
    return {
      className: 'Verbo no particípio',
      decision: 'provavel',
      functionName: `Particípio do verbo ${participleLemma}`,
      note: `Depois do auxiliar “${previous}”, a leitura mais provável é uma construção de voz passiva.`,
      syntacticFunction: 'Núcleo verbal da voz passiva',
    }
  }

  const verbLemma = AMBIGUOUS_PRESENT_FORMS.get(token)
  if (verbLemma && SUBJECT_PRONOUNS.has(previous)) {
    return {
      className: 'Verbo flexionado',
      decision: 'provavel',
      functionName: `Forma do verbo ${verbLemma}`,
      note: `Depois do pronome sujeito “${previous}”, a leitura verbal é a mais provável neste contexto.`,
      syntacticFunction: 'Núcleo do predicado verbal',
    }
  }

  if (POST_NOMINAL_ADJECTIVES.has(token) && DETERMINERS.has(twoBefore) && previous) {
    return {
      className: 'Adjetivo',
      decision: 'provavel',
      functionName: 'Caracterização nominal',
      note: `Depois do nome “${previous}”, a palavra atua provavelmente como característica desse nome.`,
      syntacticFunction: 'Adjunto adnominal',
    }
  }

  return null
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
  const registered = isRegisteredTerm(cleanWord)
  let decision = text(source.decisao) as LexicalDecision
  if (!['classificado', 'provavel', 'ambiguo', 'indeterminado'].includes(decision)) decision = 'indeterminado'

  // Sem ocorrência e sem registro explícito, a resposta da engine é apenas um
  // fallback morfológico. A interface não o apresenta como verbete existente.
  if (count === 0 && !registered) return null

  let className = text(source.className).trim() || 'Classe não determinada'
  let functionName = text(source.functionName).trim()
  let field = text(source.field).trim()
  let note = text(source.note).trim()
  let syntacticFunction = text(source.funcaoSintatica).trim()

  const contextual = contextualOverride(cleanWord, context)
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
  }
}
