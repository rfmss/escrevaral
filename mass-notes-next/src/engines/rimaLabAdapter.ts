import type { JSONContent } from '@tiptap/core'
import rimaLabDataSource from '../../../rimalab-data.json?raw'
import rimaLabSource from '../../../rimalab-engine.js?raw'

export type RimaSoundPattern = {
  sound: string
  words: string[]
}

export type RimaVerseScan = {
  index: number
  verse: string
  totalSyllables: number
  rawSyllables: number
  finalWord: string
  finalTonicity: string
  name: string
  ellisions: string[]
}

export type RimaPair = {
  from: number
  to: number
  wordA: string
  wordB: string
  soundA: string
  soundB: string
  classA: string
  classB: string
  classification: string
}

export type RimaStanza = {
  index: number
  verses: string[]
  scheme: string
  schemeName: string
}

export type RimaFinderResult = {
  word: string
  grammaticalClass: string
  type: 'exata' | 'toante'
}

export type RimaEncyclopediaEntry = {
  title: string
  tags: string[]
  body: string
  sample: string
}

export type RimaProseReading = {
  kind: 'prose'
  note: string
  proseNote: string
  soundPatterns: RimaSoundPattern[]
}

export type RimaVerseReading = {
  kind: 'verse'
  note: string
  verses: string[]
  scans: RimaVerseScan[]
  metrics: number[]
  uniqueMetrics: number[]
  isIsometric: boolean
  rhymes: RimaPair[]
  rhymeScheme: string
  rhymeSchemeName: string
  stanzas: RimaStanza[]
  totalVerses: number
  dominantMetric: number | null
  dominantName: string
}

export type RimaLabReading = RimaProseReading | RimaVerseReading

type LegacyObject = Record<string, unknown>

declare global {
  interface Window {
    VeredaRimaLab?: {
      analyze: (text: string) => unknown
      nameScheme: (scheme: string) => string
      exportAnalysisText: (analysis: unknown, title?: string) => string
      findRhymes: (word: string, limit?: number) => unknown[]
      getEncyclopedia: () => unknown[]
      ensureLoaded: () => Promise<void>
      isLoaded: () => boolean
      hasLoadError: () => boolean
    }
    __escrevaralRimaLabLoaded?: boolean
  }
}

let loadingPromise: Promise<boolean> | null = null

function object(value: unknown): LegacyObject {
  return value && typeof value === 'object' ? value as LegacyObject : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function strings(value: unknown): string[] {
  return array(value).map(text).map((item) => item.trim()).filter(Boolean)
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function positiveInteger(value: unknown): number {
  return Math.max(0, Math.floor(number(value)))
}

function nodeText(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  return (node.content ?? []).map(nodeText).join('')
}

function blockLines(node: JSONContent): string[] {
  if (node.type === 'doc') return (node.content ?? []).flatMap(blockLines)
  if (node.type === 'paragraph' || node.type === 'heading') {
    return nodeText(node).split('\n').map((line) => line.trim())
  }
  if (node.type === 'blockquote') return (node.content ?? []).flatMap(blockLines)
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content ?? []).flatMap(blockLines)
  }
  if (node.type === 'listItem') {
    const parts = (node.content ?? []).flatMap(blockLines).filter(Boolean)
    return [parts.join(' ').trim()]
  }
  if (node.content?.length) return node.content.flatMap(blockLines)
  const value = nodeText(node).trim()
  return value ? [value] : []
}

export function createRimaLabSource(content: JSONContent, fallbackPlainText = ''): string {
  const lines = blockLines(content)
  if (!lines.some((line) => line.trim())) return fallbackPlainText.trim()
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function appendEngineScript(): void {
  if (document.querySelector('script[data-escrevaral-engine="rimalab-engine.js"]')) return
  const script = document.createElement('script')
  script.dataset.escrevaralEngine = 'rimalab-engine.js'
  script.textContent = `${rimaLabSource}\n//# sourceURL=rimalab-engine.js`
  document.head.append(script)
}

async function loadEngineWithLocalData(): Promise<boolean> {
  const originalFetch = window.fetch
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input)
    if (/(^|\/)rimalab-data\.json(?:[?#].*)?$/.test(url)) {
      return Promise.resolve(new Response(rimaLabDataSource, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }))
    }
    return originalFetch.call(window, input, init)
  }) as typeof window.fetch

  try {
    appendEngineScript()
    const engine = window.VeredaRimaLab
    if (!engine) return false
    await engine.ensureLoaded()
    window.__escrevaralRimaLabLoaded = engine.isLoaded() && !engine.hasLoadError()
    return window.__escrevaralRimaLabLoaded
  } finally {
    window.fetch = originalFetch
  }
}

export async function ensureRimaLabEngine(): Promise<boolean> {
  if (window.__escrevaralRimaLabLoaded && window.VeredaRimaLab?.isLoaded()) return true
  if (loadingPromise) return loadingPromise

  loadingPromise = loadEngineWithLocalData()
    .catch((error) => {
      console.error('[Escrevaral] Não foi possível carregar o RimaLab.', error)
      return false
    })
    .finally(() => {
      loadingPromise = null
    })

  return loadingPromise
}

function normalizeSoundPattern(value: unknown): RimaSoundPattern | null {
  const source = object(value)
  const words = strings(source.palavras ?? source.words)
  if (words.length < 2) return null
  return {
    sound: text(source.som ?? source.sound).trim(),
    words,
  }
}

function normalizeScan(value: unknown, verse: string, index: number): RimaVerseScan {
  const source = object(value)
  return {
    index,
    verse,
    totalSyllables: positiveInteger(source.totalSyllables),
    rawSyllables: positiveInteger(source.rawSyllables),
    finalWord: text(source.finalWord).trim(),
    finalTonicity: text(source.finalTonicity).trim(),
    name: text(source.name).trim(),
    ellisions: strings(source.ellisions),
  }
}

function normalizeRhyme(value: unknown): RimaPair | null {
  const source = object(value)
  const wordA = text(source.wordA).trim()
  const wordB = text(source.wordB).trim()
  if (!wordA || !wordB) return null
  return {
    from: positiveInteger(source.from),
    to: positiveInteger(source.to),
    wordA,
    wordB,
    soundA: text(source.soundA).trim(),
    soundB: text(source.soundB).trim(),
    classA: text(source.classA).trim(),
    classB: text(source.classB).trim(),
    classification: text(source.classification).trim() || 'percebida',
  }
}

function normalizeFinderResult(value: unknown): RimaFinderResult | null {
  const source = object(value)
  const word = text(source.word).trim()
  const type = text(source.type).trim()
  if (!word || (type !== 'exata' && type !== 'toante')) return null
  return {
    word,
    grammaticalClass: text(source.cls).trim(),
    type,
  }
}

function normalizeEncyclopediaEntry(value: unknown): RimaEncyclopediaEntry | null {
  const source = object(value)
  const title = text(source.title).trim()
  if (!title) return null
  return {
    title,
    tags: strings(source.tags),
    body: text(source.body).trim(),
    sample: text(source.sample).trim(),
  }
}

function normalizeResult(result: unknown, engine: NonNullable<Window['VeredaRimaLab']>): RimaLabReading {
  const root = object(result)
  const note = text(root.note).trim() || 'A leitura sonora automática é aproximada e pode mudar conforme dicção e intenção.'

  if (Boolean(root.isProse)) {
    return {
      kind: 'prose',
      note,
      proseNote: text(root.proseNote).trim() || 'O texto parece ser prosa. A oficina sonora procura apenas ecos internos.',
      soundPatterns: array(root.rimasInternas)
        .map(normalizeSoundPattern)
        .filter((entry): entry is RimaSoundPattern => entry !== null),
    }
  }

  const verses = strings(root.verses)
  const rhymeScheme = text(root.rhymeScheme).trim()
  const scans = array(root.scans).map((entry, index) => normalizeScan(entry, verses[index] ?? '', index))
  const rhymes = array(root.rhymes)
    .map(normalizeRhyme)
    .filter((entry): entry is RimaPair => entry !== null)
  const stanzas = array(root.stanzas).map((entry, index) => {
    const source = object(entry)
    const scheme = text(source.scheme).trim()
    return {
      index,
      verses: strings(source.verses),
      scheme,
      schemeName: scheme ? text(engine.nameScheme(scheme)).trim() : '',
    }
  })
  const dominantMetricValue = positiveInteger(root.dominantMetric)

  return {
    kind: 'verse',
    note,
    verses,
    scans,
    metrics: array(root.metrics).map(positiveInteger),
    uniqueMetrics: array(root.uniqueMetrics).map(positiveInteger),
    isIsometric: Boolean(root.isIsometric),
    rhymes,
    rhymeScheme,
    rhymeSchemeName: rhymeScheme ? text(engine.nameScheme(rhymeScheme)).trim() : '',
    stanzas,
    totalVerses: positiveInteger(root.totalVerses) || verses.length,
    dominantMetric: dominantMetricValue || null,
    dominantName: text(root.dominantName).trim(),
  }
}

export async function analyzeRimaLab(sourceText: string): Promise<RimaLabReading | null> {
  const clean = sourceText.trim()
  if (!clean) return null
  if (!(await ensureRimaLabEngine()) || !window.VeredaRimaLab) {
    throw new Error('O RimaLab não está disponível.')
  }

  return normalizeResult(window.VeredaRimaLab.analyze(clean), window.VeredaRimaLab)
}

export async function findRimaLabRhymes(word: string, limit = 16): Promise<RimaFinderResult[]> {
  const clean = word.trim()
  if (clean.length < 2) return []
  if (!(await ensureRimaLabEngine()) || !window.VeredaRimaLab) {
    throw new Error('O buscador de rimas não está disponível.')
  }

  return array(window.VeredaRimaLab.findRhymes(clean, limit))
    .map(normalizeFinderResult)
    .filter((entry): entry is RimaFinderResult => entry !== null)
}

export async function getRimaLabEncyclopedia(): Promise<RimaEncyclopediaEntry[]> {
  if (!(await ensureRimaLabEngine()) || !window.VeredaRimaLab) {
    throw new Error('A referência métrica não está disponível.')
  }

  return array(window.VeredaRimaLab.getEncyclopedia())
    .map(normalizeEncyclopediaEntry)
    .filter((entry): entry is RimaEncyclopediaEntry => entry !== null)
}

export async function createRimaLabReport(sourceText: string, title = 'Análise de Rimas'): Promise<string> {
  const clean = sourceText.trim()
  if (!clean) return ''
  if (!(await ensureRimaLabEngine()) || !window.VeredaRimaLab) {
    throw new Error('A exportação do RimaLab não está disponível.')
  }

  const analysis = window.VeredaRimaLab.analyze(clean)
  return window.VeredaRimaLab.exportAnalysisText(analysis, title)
}
