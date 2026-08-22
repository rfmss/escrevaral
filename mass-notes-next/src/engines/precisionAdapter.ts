import precisionSource from '../../../precision-engine.js?raw'
import templatesDataSource from '../../../templates-data.json?raw'

export type PrecisionTemplateOption = {
  id: string
  label: string
  title: string
  oficio: string
  oficioLabel: string
  kind: string
}

export type PrecisionCheck = {
  label: string
  passed: boolean
  score: number
  hint: string
}

export type PrecisionReading = {
  score: number
  status: string
  words: number
  limit: number
  checks: PrecisionCheck[]
  gaps: PrecisionCheck[]
  strengths: PrecisionCheck[]
}

type JsonRecord = Record<string, unknown>

type TemplatesIndex = {
  templates: JsonRecord[]
  oficioLabels: Map<string, string>
}

declare global {
  interface Window {
    VeredaPrecision?: {
      analyze: (template: Record<string, unknown>, text: string) => unknown
    }
    __escrevaralPrecisionLoaded?: boolean
  }
}

function object(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const INDEX: TemplatesIndex = (() => {
  try {
    const root = object(JSON.parse(templatesDataSource))
    const oficioLabels = new Map<string, string>()
    array(root.oficios).forEach((entry) => {
      const source = object(entry)
      const id = text(source.id).trim()
      const label = text(source.label).trim()
      if (id) oficioLabels.set(id, label || id)
    })
    return {
      templates: array(root.templates).map(object),
      oficioLabels,
    }
  } catch {
    return { templates: [], oficioLabels: new Map() }
  }
})()

export function listPrecisionTemplates(): PrecisionTemplateOption[] {
  return INDEX.templates.map((template) => {
    const id = text(template.id).trim()
    const oficio = text(template.oficio).trim()
    return {
      id,
      label: text(template.label).trim() || id,
      title: text(template.title).trim(),
      oficio,
      oficioLabel: INDEX.oficioLabels.get(oficio) || oficio || 'Outros',
      kind: text(template.kind).trim(),
    }
  }).filter((template) => template.id)
}

function getTemplate(templateId: string): JsonRecord | null {
  return INDEX.templates.find((template) => text(template.id) === templateId) ?? null
}

function normalizeCheck(value: unknown): PrecisionCheck | null {
  const source = object(value)
  const label = text(source.label).trim()
  if (!label) return null
  return {
    label,
    passed: source.passed === true,
    score: Math.max(0, Math.min(100, Math.round(number(source.score)))),
    hint: text(source.hint).trim(),
  }
}

function normalizeReading(value: unknown): PrecisionReading {
  const source = object(value)
  const checks = array(source.checks)
    .map(normalizeCheck)
    .filter((entry): entry is PrecisionCheck => entry !== null)

  return {
    score: Math.max(0, Math.min(100, Math.round(number(source.score)))),
    status: text(source.status).trim() || 'Leitura editorial concluída',
    words: Math.max(0, Math.floor(number(source.words))),
    limit: Math.max(0, Math.floor(number(source.limit))),
    checks,
    gaps: checks.filter((check) => !check.passed),
    strengths: checks.filter((check) => check.passed),
  }
}

function ensurePrecisionEngine(): boolean {
  if (window.__escrevaralPrecisionLoaded && window.VeredaPrecision?.analyze) return true
  try {
    if (!document.querySelector('script[data-escrevaral-engine="precision-engine.js"]')) {
      const script = document.createElement('script')
      script.dataset.escrevaralEngine = 'precision-engine.js'
      script.textContent = `${precisionSource}\n//# sourceURL=precision-engine.js`
      document.head.append(script)
    }
    window.__escrevaralPrecisionLoaded = Boolean(window.VeredaPrecision?.analyze)
    return window.__escrevaralPrecisionLoaded
  } catch (error) {
    console.error('[Escrevaral] Não foi possível carregar Aderência ao guia.', error)
    return false
  }
}

export async function analyzePrecision(templateId: string, sourceText: string): Promise<PrecisionReading | null> {
  const cleanText = sourceText.trim()
  const template = getTemplate(templateId)
  if (!cleanText || !template) return null
  if (!ensurePrecisionEngine() || !window.VeredaPrecision) {
    throw new Error('A leitura de aderência ao guia não está disponível.')
  }

  return normalizeReading(window.VeredaPrecision.analyze(template, cleanText))
}
