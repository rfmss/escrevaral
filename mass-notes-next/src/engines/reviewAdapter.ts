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
  if (/alta|grave|crítica|critical|high/.test(raw)) return 'alta'
  if (/baixa|leve|info|low/.test(raw)) return 'baixa'
  return 'média'
}

function normalizeIssue(item: unknown, index: number): ReviewIssue {
  if (typeof item === 'string') {
    return { id: `issue-${index}`, title: item, detail: '', severity: 'média' }
  }
  const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
  return {
    id: String(source.id ?? `issue-${index}`),
    title: String(source.title ?? source.label ?? source.nome ?? source.criterio ?? `Observação ${index + 1}`),
    detail: String(source.message ?? source.detail ?? source.description ?? source.descricao ?? source.dica ?? ''),
    severity: normalizeSeverity(source.severity ?? source.level ?? source.prioridade),
  }
}

export async function reviewText(text: string): Promise<ReviewIssue[]> {
  if (!text.trim()) return []
  if (!ensureReviewEngine() || !window.VeredaAnalise) {
    throw new Error('A engine de revisão não está disponível.')
  }

  const result = window.VeredaAnalise.analisar(text)
  const interpreted = window.VeredaAnalise.interpretarResultado?.(result)
  if (Array.isArray(interpreted)) return interpreted.map(normalizeIssue)

  if (interpreted && typeof interpreted === 'object') {
    const candidate = interpreted as Record<string, unknown>
    for (const key of ['alerts', 'alertas', 'issues', 'observacoes']) {
      if (Array.isArray(candidate[key])) return (candidate[key] as unknown[]).map(normalizeIssue)
    }
  }

  return []
}
