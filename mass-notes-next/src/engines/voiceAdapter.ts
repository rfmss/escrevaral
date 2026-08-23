import voiceSource from '../../../voice-engine.js?raw'
import { readLatestLiveEditorSnapshot } from '../editor/editorSnapshotBridge'

export type VoiceConfidence = 'baixa' | 'média' | 'alta'

export type VoiceSignal = {
  label: string
  hits: number
  score: number
}

export type VoiceReading = {
  counts: {
    words: number
    uniqueWords: number
    sentences: number
    paragraphs: number
  }
  metrics: {
    ttr: number
    lexicalDensity: number
    avgSentence: number
    sentenceVariation: number
    paragraphAverage: number
  }
  confidence: VoiceConfidence
  confidenceNote: string
  emotional: VoiceSignal[]
  fields: VoiceSignal[]
  voice: {
    gesture: string
    title: string
    description: string
    echoes: string[]
  }
  strengths: string[]
  blindSpots: string[]
  audience: {
    core: string
    secondary: string
    risk: string
  }
  exercises: string[]
  disclaimer: string
}

type LegacyVoiceResult = Record<string, unknown>

declare global {
  interface Window {
    VeredaVoice?: {
      analyze: (text: string, context?: Record<string, unknown>) => unknown
      analyzeComplete?: (text: string) => unknown
    }
    __escrevaralVoiceLoaded?: boolean
  }
}

function executeClassicScript(source: string, id: string): void {
  if (document.querySelector(`script[data-escrevaral-engine="${id}"]`)) return
  const script = document.createElement('script')
  script.dataset.escrevaralEngine = id
  script.textContent = `${source}\n//# sourceURL=${id}`
  document.head.append(script)
}

export function ensureVoiceEngine(): boolean {
  if (window.__escrevaralVoiceLoaded && window.VeredaVoice?.analyze) return true
  try {
    executeClassicScript(voiceSource, 'voice-engine.js')
    window.__escrevaralVoiceLoaded = Boolean(window.VeredaVoice?.analyze)
    return window.__escrevaralVoiceLoaded
  } catch (error) {
    console.error('[Escrevaral] Não foi possível carregar o Espelho de Voz.', error)
    return false
  }
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : []
}

function signals(value: unknown): VoiceSignal[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const source = object(entry)
    return {
      label: text(source.label).trim(),
      hits: Math.max(0, Math.floor(number(source.hits))),
      score: Math.max(0, Math.min(100, Math.round(number(source.score)))),
    }
  }).filter((entry) => entry.label && entry.hits > 0)
}

function normalizeConfidence(value: unknown): VoiceConfidence {
  const raw = text(value).toLocaleLowerCase('pt-BR')
  if (raw === 'alta') return 'alta'
  if (raw === 'média' || raw === 'media') return 'média'
  return 'baixa'
}

function normalizeVoiceResult(result: unknown): VoiceReading {
  const root = object(result) as LegacyVoiceResult
  const counts = object(root.counts)
  const metrics = object(root.metrics)
  const voice = object(root.voice)
  const audience = object(root.audience)
  const confidence = normalizeConfidence(root.confianca ?? root.confidence)

  return {
    counts: {
      words: number(counts.words),
      uniqueWords: number(counts.uniqueWords),
      sentences: number(counts.sentences),
      paragraphs: number(counts.paragraphs),
    },
    metrics: {
      ttr: number(metrics.ttr),
      lexicalDensity: number(metrics.lexicalDensity),
      avgSentence: number(metrics.avgSentence),
      sentenceVariation: number(metrics.sentenceVariation),
      paragraphAverage: number(metrics.paragraphAverage),
    },
    confidence,
    confidenceNote: text(root.confiancaNote ?? root.confidenceNote),
    emotional: signals(root.emotional),
    fields: signals(root.fields),
    voice: {
      gesture: text(voice.gesture) || 'indefinido',
      title: text(voice.title) || 'Voz ainda em formação',
      description: text(voice.description) || 'Ainda não há matéria suficiente para uma leitura de voz.',
      echoes: strings(voice.echoes),
    },
    strengths: strings(root.strengths),
    blindSpots: strings(root.blindSpots),
    audience: {
      core: text(audience.core),
      secondary: text(audience.secondary),
      risk: text(audience.risk),
    },
    exercises: strings(root.exercises),
    disclaimer: text(root.disclaimer) || 'Leitura heurística local: use como hipótese de trabalho, não como diagnóstico definitivo.',
  }
}

export async function analyzeVoice(
  sourceText: string,
  context: Record<string, unknown> = {},
): Promise<VoiceReading | null> {
  const liveText = readLatestLiveEditorSnapshot()?.plainText
  const clean = (liveText ?? sourceText).trim()
  if (!clean) return null
  if (!ensureVoiceEngine() || !window.VeredaVoice) {
    throw new Error('O Espelho de Voz não está disponível.')
  }

  return normalizeVoiceResult(window.VeredaVoice.analyze(clean, context))
}
