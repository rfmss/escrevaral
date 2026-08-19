import { analyzeTextCohesion } from './cohesionSupplement'
import { analyzeCraseCalibration } from './craseSupplement'
import { analyzeNormativeVerbCalibration } from './normativeVerbSupplement'
import {
  calibrateStructuralPunctuation,
  type StructuralSyntaxEngine,
} from './punctuationStructuralSupplement'

export type ReviewIssue = {
  id: string
  title: string
  detail: string
  severity: 'alta' | 'média' | 'baixa'
}

export type LocatedReviewIssue = ReviewIssue & {
  source: 'pontuação'
  ruleId: string
  fragment: string
  textRange: { from: number; to: number }
}

export type ReviewReading = {
  issues: ReviewIssue[]
  locatedIssues: LocatedReviewIssue[]
}

type RawModule = { default: string }

let loadingPromise: Promise<boolean> | null = null

declare global {
  interface Window {
    VeredaAnalise?: {
      analisar: (text: string) => unknown
      interpretarResultado?: (result: unknown) => unknown
    }
    VeredaPunctuation?: {
      analyzeDeep?: (text: string) => Promise<{
        issues: unknown[]
        ruleCount?: number
        resumo?: unknown
      }>
    }
    syntaxEngine?: StructuralSyntaxEngine & {
      init: () => Promise<boolean>
      _isReady?: () => boolean
    }
    __escrevaralReviewLoaded?: boolean
  }
}

function executeClassicScript(source: string, id: string): void {
  if (document.querySelector(`script[data-escrevaral-engine="${id}"]`)) return
  const script = document.createElement('script')
  script.dataset.escrevaralEngine = id
  script.textContent = `${source}\n//# sourceURL=${id}`
  document.head.append(script)
}

async function loadReviewEngine(): Promise<boolean> {
  const [criteria, syntax, punctuation, analysis] = await Promise.all([
    import('../../../js/data/criterios-data.js?raw') as Promise<RawModule>,
    import('../../../syntax-engine.js?raw') as Promise<RawModule>,
    import('../../../punctuation-engine.js?raw') as Promise<RawModule>,
    import('../../../analise-engine.js?raw') as Promise<RawModule>,
  ])

  executeClassicScript(criteria.default, 'criterios-data.js')
  executeClassicScript(syntax.default, 'syntax-engine.js')
  executeClassicScript(punctuation.default, 'punctuation-engine.js')
  executeClassicScript(analysis.default, 'analise-engine.js')

  const syntaxInitialized = await window.syntaxEngine?.init?.() ?? false
  if (!syntaxInitialized) {
    console.warn('[Escrevaral] Syntax engine não inicializada. Análise sintática pode estar incompleta.')
  }

  window.__escrevaralReviewLoaded = Boolean(window.VeredaAnalise?.analisar)
  return window.__escrevaralReviewLoaded
}

export async function ensureReviewEngine(): Promise<boolean> {
  if (window.__escrevaralReviewLoaded && window.VeredaAnalise?.analisar) return true
  if (loadingPromise) return loadingPromise

  loadingPromise = loadReviewEngine()
    .catch((error) => {
      console.error('[Escrevaral] Não foi possível carregar a engine de revisão.', error)
      return false
    })
    .finally(() => {
      loadingPromise = null
    })

  return loadingPromise
}

function normalizeSeverity(value: unknown): ReviewIssue['severity'] {
  const raw = String(value ?? '').toLocaleLowerCase('pt-BR')
  if (/alta|alto|grave|crítica|critical|high/.test(raw)) return 'alta'
  if (/baixa|baixo|leve|info|low/.test(raw)) return 'baixa'
  return 'média'
}

function humanizeIdentifier(value: unknown, fallback: string): string {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw
    .replace(/[-_]+/g, ' ')
    .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase('pt-BR'))
}

function normalizeIssue(item: unknown, index: number): ReviewIssue {
  if (typeof item === 'string') {
    return { id: `issue-${index}`, title: item, detail: '', severity: 'média' }
  }
  const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
  const id = String(source.id ?? `issue-${index}`)
  return {
    id,
    title: String(source.title ?? source.label ?? source.nome ?? source.criterio ?? humanizeIdentifier(source.dim ?? id, `Observação ${index + 1}`)),
    detail: String(source.message ?? source.msg ?? source.detail ?? source.description ?? source.descricao ?? source.dica ?? source.acao ?? ''),
    severity: normalizeSeverity(source.severity ?? source.level ?? source.prioridade ?? source.nivel),
  }
}

function interpretedIssues(interpreted: unknown): ReviewIssue[] {
  if (Array.isArray(interpreted)) return interpreted.map(normalizeIssue)

  if (interpreted && typeof interpreted === 'object') {
    const candidate = interpreted as Record<string, unknown>
    for (const key of ['alerts', 'alertas', 'issues', 'observacoes']) {
      if (Array.isArray(candidate[key])) return (candidate[key] as unknown[]).map(normalizeIssue)
    }
  }

  return []
}

function punctuationItems(result: unknown): unknown[] {
  if (!result || typeof result !== 'object') return []
  const norma = (result as Record<string, unknown>).norma
  if (!norma || typeof norma !== 'object') return []
  const pontuacao = (norma as Record<string, unknown>).pontuacao
  if (!pontuacao || typeof pontuacao !== 'object') return []
  const issues = (pontuacao as Record<string, unknown>).issues
  return Array.isArray(issues) ? issues : []
}

function normalizeLocatedIssue(item: unknown, text: string, index: number): LocatedReviewIssue | null {
  if (!item || typeof item !== 'object') return null
  const source = item as Record<string, unknown>
  const fragment = String(source.fragment ?? '')
  const requestedPosition = Number(source.pos)
  if (!fragment || !Number.isInteger(requestedPosition) || requestedPosition < 0) return null

  let from = requestedPosition
  if (text.slice(from, from + fragment.length) !== fragment) {
    const local = text.slice(requestedPosition, requestedPosition + fragment.length + 4)
    const displacement = local.indexOf(fragment)
    if (displacement < 0 || displacement > 3) return null
    from += displacement
  }

  const to = from + fragment.length
  if (text.slice(from, to) !== fragment) return null

  const ruleId = String(source.ruleId ?? source.id ?? `PONT-${index + 1}`)
  return {
    id: `pontuacao-${ruleId}-${from}-${index}`,
    ruleId,
    source: 'pontuação',
    fragment,
    textRange: { from, to },
    title: String(source.criterio ?? source.categoria ?? humanizeIdentifier(ruleId, 'Pontuação')),
    detail: String(source.acao ?? source.exemplo ?? ''),
    severity: normalizeSeverity(source.severity),
  }
}

function mergeGeneralIssues(base: ReviewIssue[], calibrated: ReviewIssue[]): ReviewIssue[] {
  const seen = new Set(base.map((item) => `${item.title}\u0000${item.detail}`))
  const merged = [...base]

  for (const item of calibrated) {
    const key = `${item.title}\u0000${item.detail}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }

  return merged
}

function cohesionObservation(text: string): ReviewIssue[] {
  const reading = analyzeTextCohesion(text)
  if (reading.sentenceCount < 2) return []

  const relationCounts = new Map<string, number>()
  for (const marker of reading.sequentialMarkers) {
    relationCounts.set(marker.relation, (relationCounts.get(marker.relation) ?? 0) + marker.count)
  }

  const parts: string[] = []
  if (relationCounts.size) {
    parts.push(`Conectores explícitos: ${[...relationCounts.entries()].map(([relation, count]) => `${relation} ${count}`).join(', ')}.`)
  }
  if (reading.referentialMarkers) {
    parts.push(`Marcadores referenciais: ${reading.referentialMarkers}.`)
  }
  if (reading.recurrences.length) {
    parts.push(`Recorrências entre frases: ${reading.recurrences.slice(0, 5).map((item) => `${item.word} (${item.transitions})`).join(', ')}.`)
  }
  if (!parts.length) return []

  parts.push('O mapa descreve ligações formais observáveis; não mede coerência, intenção nem qualidade do texto.')
  return [{
    id: 'C4-COESAO-MAPA',
    title: 'Mapa de coesão observável',
    detail: parts.join(' '),
    severity: 'baixa',
  }]
}

export async function reviewTextDetailed(text: string): Promise<ReviewReading> {
  if (!text.trim()) return { issues: [], locatedIssues: [] }
  if (!(await ensureReviewEngine()) || !window.VeredaAnalise) {
    throw new Error('A engine de revisão não está disponível.')
  }

  const result = window.VeredaAnalise.analisar(text)

  try {
    const deepResult = await window.VeredaPunctuation?.analyzeDeep?.(text)
    if (deepResult?.issues) {
      const calibratedIssues = calibrateStructuralPunctuation(
        text,
        deepResult.issues,
        window.syntaxEngine,
      )

      const resultObj = result as Record<string, unknown>
      const normaObj = resultObj?.norma as Record<string, unknown> | undefined
      if (normaObj) {
        normaObj.pontuacao = {
          issues: calibratedIssues,
          ruleCount: typeof deepResult.ruleCount === 'number' ? deepResult.ruleCount + 2 : undefined,
          resumo: deepResult.resumo,
        }
      }
    }
  } catch (error) {
    console.error('[Escrevaral] Erro na análise sintática profunda. Usando análise básica.', error)
  }

  const interpreted = window.VeredaAnalise.interpretarResultado?.(result)
  const locatedIssues = punctuationItems(result)
    .map((item, index) => normalizeLocatedIssue(item, text, index))
    .filter((item): item is LocatedReviewIssue => Boolean(item))
  const issues = mergeGeneralIssues(
    interpretedIssues(interpreted),
    [
      ...analyzeNormativeVerbCalibration(text),
      ...analyzeCraseCalibration(text),
      ...cohesionObservation(text),
    ],
  )

  return {
    issues,
    locatedIssues,
  }
}

export async function reviewText(text: string): Promise<ReviewIssue[]> {
  return (await reviewTextDetailed(text)).issues
}
