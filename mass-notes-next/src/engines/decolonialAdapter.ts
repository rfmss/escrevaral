import decolonialDataSource from '../../../decolonial-data.json?raw'
import decolonialSource from '../../../decolonial-engine.js?raw'

export type ContextTerm = {
  id: string
  term: string
  category: string
  categoryLabel: string
  reason: string
  context: string
  alternatives: string[]
  count: number
  contextual: boolean
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

function normalizeEntry(value: unknown, index: number): ContextTerm {
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
    count: number(source.count),
    contextual: Boolean(source.contextual),
  }
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
    .map(normalizeEntry)
    .filter((entry) => entry.term && entry.count > 0)
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, 'pt-BR'))
}