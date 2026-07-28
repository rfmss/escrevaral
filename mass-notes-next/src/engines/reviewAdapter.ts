import criteriaSource from '../../../js/data/criterios-data.js?raw'
import syntaxSource from '../../../syntax-engine.js?raw'
import punctuationSource from '../../../punctuation-engine.js?raw'
import analysisSource from '../../../analise-engine.js?raw'

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

declare global {
  interface Window {
    VeredaAnalise?: {
      analisar: (text: string) => unknown
      interpretarResultado?: (result: unknown) => unknown
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

export function ensureReviewEngine(): boolean {
  if (window.__escrevaralReviewLoaded && window.VeredaAnalise?.analisar) return true
  try {
    executeClassicScript(criteriaSource, 'criterios-data.js')
    executeClassicScript(syntaxSource, 'syntax-engine.js')
    executeClassicScript(punctuationSource, 'punctuation-engine.js')
    executeClassicScript(analysisSource, 'analise-engine.js')
    window.__escrevaralReviewLoaded = Boolean(window.VeredaAnalise?.analisar)
    return window.__escrevaralReviewLoaded
  } catch (error) {
    console.error('[Escrevaral] Não foi possível carregar a engine de revisão.', error)
    return false
  }
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

  // Algumas regras removem espaços periféricos do fragmento. Aceitamos apenas
  // um realinhamento local e determinístico; nunca buscamos a primeira ocorrência
  // global, pois isso quebraria textos com fragmentos repetidos.
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

export async function reviewTextDetailed(text: string): Promise<ReviewReading> {
  if (!text.trim()) return { issues: [], locatedIssues: [] }
  if (!ensureReviewEngine() || !window.VeredaAnalise) {
    throw new Error('A engine de revisão não está disponível.')
  }

  const result = window.VeredaAnalise.analisar(text)
  const interpreted = window.VeredaAnalise.interpretarResultado?.(result)
  const locatedIssues = punctuationItems(result)
    .map((item, index) => normalizeLocatedIssue(item, text, index))
    .filter((item): item is LocatedReviewIssue => Boolean(item))

  return {
    issues: interpretedIssues(interpreted),
    locatedIssues,
  }
}

export async function reviewText(text: string): Promise<ReviewIssue[]> {
  return (await reviewTextDetailed(text)).issues
}
