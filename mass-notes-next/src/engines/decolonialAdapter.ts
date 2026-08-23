import decolonialDataSource from '../../../decolonial-data.json?raw'
import decolonialSource from '../../../decolonial-engine.js?raw'

export type ContextEntry = {
  id: string
  term: string
  category: string
  categoryLabel: string
  reason: string
  context: string
  alternatives: string[]
  contextual: boolean
}

export type ContextTerm = ContextEntry & {
  count: number
}

export type ContextCategory = {
  id: string
  label: string
  count: number
}

type LegacyEntry = Record<string, unknown>

let loadingPromise: Promise<boolean> | null = null

declare global {
  interface Window {
    VeredaDecolonial?: {
      ensureLoaded: () => Promise<void>
      listCategories: () => unknown
      listEntries: (options?: Record<string, unknown>) => unknown
      detectText: (text: string, options?: Record<string, unknown>) => unknown
      isLoaded: () => boolean
      hasLoadError: () => boolean
    }
    __escrevaralDecolonialLoaded?: boolean
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).map((item) => item.trim()).filter(Boolean) : []
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
}

function normalizeBaseEntry(value: unknown, index: number): ContextEntry {
  const source = value && typeof value === 'object' ? value as LegacyEntry : {}
  const term = text(source.avoid ?? source.term).trim()
  const category = text(source.category).trim() || 'contexto'

  return {
    id: `${category}-${term || index}`.toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, ''),
    term: term || `Termo ${index + 1}`,
    category,
    categoryLabel: text(source.categoryLabel).trim() || category,
    reason: text(source.reason).trim(),
    context: text(source.context).trim(),
    alternatives: strings(source.alternatives),
    contextual: Boolean(source.contextual),
  }
}

function normalizeTerm(value: unknown, index: number): ContextTerm {
  return {
    ...normalizeBaseEntry(value, index),
    count: number(value && typeof value === 'object' ? (value as LegacyEntry).count : 0),
  }
}

function normalizeCategory(value: unknown, index: number): ContextCategory | null {
  const source = value && typeof value === 'object' ? value as LegacyEntry : {}
  const id = text(source.id).trim()
  const label = text(source.label).trim()
  if (!id || !label) return null
  return { id, label, count: number(source.count) }
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
    if (/(^|\/)decolonial-data\.json(?:[?#].*)?$/.test(url)) {
      return Promise.resolve(new Response(decolonialDataSource, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }))
    }
    return originalFetch.call(window, input, init)
  }) as typeof window.fetch

  try {
    if (!document.querySelector('script[data-escrevaral-engine="decolonial-engine.js"]')) {
      const script = document.createElement('script')
      script.dataset.escrevaralEngine = 'decolonial-engine.js'
      script.textContent = `${decolonialSource}\n//# sourceURL=decolonial-engine.js`
      document.head.append(script)
    }

    const engine = window.VeredaDecolonial
    if (!engine) return false

    // A engine inicia uma carga ao ser executada. Mantemos a ponte local ativa
    // também durante esta espera para que chamadas concorrentes usem a mesma base.
    await engine.ensureLoaded()
    await Promise.resolve()

    window.__escrevaralDecolonialLoaded = engine.isLoaded() && !engine.hasLoadError()
    return window.__escrevaralDecolonialLoaded
  } finally {
    window.fetch = originalFetch
  }
}

export async function ensureDecolonialEngine(): Promise<boolean> {
  if (window.__escrevaralDecolonialLoaded && window.VeredaDecolonial?.isLoaded()) return true
  if (loadingPromise) return loadingPromise

  loadingPromise = loadEngineWithLocalData().catch((error) => {
    console.error('[Escrevaral] Não foi possível carregar Termos que pedem contexto.', error)
    return false
  })

  const loaded = await loadingPromise
  if (!loaded) loadingPromise = null
  return loaded
}

export async function detectContextTerms(sourceText: string): Promise<ContextTerm[]> {
  const clean = sourceText.trim()
  if (!clean) return []
  if (!(await ensureDecolonialEngine()) || !window.VeredaDecolonial) {
    throw new Error('A leitura contextual não está disponível.')
  }

  const result = window.VeredaDecolonial.detectText(clean)
  if (!Array.isArray(result)) return []

  return result
    .map(normalizeTerm)
    .filter((entry) => entry.term && entry.count > 0)
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, 'pt-BR'))
}

export async function listContextCategories(): Promise<ContextCategory[]> {
  if (!(await ensureDecolonialEngine()) || !window.VeredaDecolonial) {
    throw new Error('As categorias contextuais não estão disponíveis.')
  }

  const result = window.VeredaDecolonial.listCategories()
  if (!Array.isArray(result)) return []
  return result
    .map(normalizeCategory)
    .filter((entry): entry is ContextCategory => entry !== null)
}

export async function searchContextEntries(query = '', category = 'all'): Promise<ContextEntry[]> {
  if (!(await ensureDecolonialEngine()) || !window.VeredaDecolonial) {
    throw new Error('O vocabulário contextual não está disponível.')
  }

  const result = window.VeredaDecolonial.listEntries({ query, category })
  if (!Array.isArray(result)) return []
  return result.map(normalizeBaseEntry)
}
