import { analyzeSimpleVerbSurface } from './simpleAnalyzer'
import { normalizeVerbSurface } from './normalization'
import type { VerbCandidate, VerbSelectionContext, VerbTense } from './types'

export type CompoundVerbResult = {
  candidate: VerbCandidate
  decomposition: string[]
  evidence: string[]
  equivalents: string[]
}

function compoundTense(auxiliary: VerbCandidate): VerbTense | undefined {
  switch (auxiliary.tense) {
    case 'presente': return 'pretérito perfeito composto'
    case 'pretérito imperfeito': return 'pretérito mais-que-perfeito composto'
    case 'futuro do presente': return 'futuro do presente composto'
    case 'futuro do pretérito': return 'futuro do pretérito composto'
    default: return undefined
  }
}

function progressiveTense(auxiliary: VerbCandidate): VerbTense | undefined {
  switch (auxiliary.tense) {
    case 'presente': return 'presente progressivo'
    case 'pretérito imperfeito': return 'pretérito imperfeito progressivo'
    default: return undefined
  }
}

function selectLemma(candidates: VerbCandidate[], lemma: string): VerbCandidate | undefined {
  return candidates.find((candidate) => candidate.lemma === lemma && candidate.formType === 'finita')
}

function selectForm(candidates: VerbCandidate[], form: VerbCandidate['formType']): VerbCandidate | undefined {
  return candidates.find((candidate) => candidate.formType === form)
}

function buildCandidate(
  surface: string,
  auxiliary: VerbCandidate,
  main: VerbCandidate,
  tense: VerbTense,
  voice: VerbCandidate['voice'],
  aspect: string,
): VerbCandidate {
  return {
    lemma: main.lemma,
    canonicalSurface: surface,
    formType: 'locução verbal',
    mood: auxiliary.mood,
    tense,
    person: auxiliary.person,
    number: auxiliary.number,
    voice,
    source: 'locução',
    auxiliary: auxiliary.lemma,
    mainVerb: main.lemma,
    aspect,
    label: `${tense}${voice === 'passiva' ? ' — voz passiva' : ''}`,
  }
}

export function analyzeCompoundVerb(
  value: string,
  context: VerbSelectionContext,
): CompoundVerbResult[] {
  const surface = normalizeVerbSurface(value)
  const tokens = surface.split(' ').filter(Boolean)
  if (tokens.length < 2 || tokens.length > 3) return []

  const auxiliaryLookup = analyzeSimpleVerbSurface(tokens[0], context, { forceVerb: true })
  const mainContext: VerbSelectionContext = {
    ...context,
    before: tokens.slice(0, -1).join(' '),
    after: '',
  }
  const mainLookup = analyzeSimpleVerbSurface(tokens.at(-1) ?? '', mainContext, { forceVerb: true })
  const results: CompoundVerbResult[] = []

  if (tokens.length === 3) {
    const middleContext: VerbSelectionContext = {
      ...context,
      before: tokens[0],
      after: tokens[2],
    }
    const middleLookup = analyzeSimpleVerbSurface(tokens[1], middleContext, { forceVerb: true })
    const auxiliary = selectLemma(auxiliaryLookup.candidates, 'ter') ?? selectLemma(auxiliaryLookup.candidates, 'haver')
    const middle = middleLookup.candidates.find((candidate) => candidate.lemma === 'ser' && candidate.formType === 'particípio')
    const main = selectForm(mainLookup.candidates, 'particípio')
    const tense = auxiliary ? compoundTense(auxiliary) : undefined
    if (auxiliary && middle && main && tense) {
      results.push({
        candidate: buildCandidate(surface, auxiliary, main, tense, 'passiva', 'tempo composto em voz passiva'),
        decomposition: [tokens[0], tokens[1], tokens[2]],
        evidence: [
          `“${tokens[0]}” funciona como auxiliar de tempo composto.`,
          `“${tokens[1]}” é particípio de ser e introduz a voz passiva.`,
          `“${tokens[2]}” é o particípio do verbo principal “${main.lemma}”.`,
        ],
        equivalents: [],
      })
    }
    return results
  }

  const auxiliaryCandidates = auxiliaryLookup.candidates.filter((candidate) => candidate.formType === 'finita')
  const mainCandidates = mainLookup.candidates

  for (const auxiliary of auxiliaryCandidates) {
    if (['ter', 'haver'].includes(auxiliary.lemma)) {
      const main = selectForm(mainCandidates, 'particípio')
      const tense = compoundTense(auxiliary)
      if (main && tense) {
        results.push({
          candidate: buildCandidate(surface, auxiliary, main, tense, 'ativa', 'tempo composto'),
          decomposition: [tokens[0], tokens[1]],
          evidence: [
            `“${tokens[0]}” é forma auxiliar de “${auxiliary.lemma}”.`,
            `“${tokens[1]}” é particípio do verbo principal “${main.lemma}”.`,
          ],
          equivalents: [],
        })
      }
    }

    if (auxiliary.lemma === 'ir') {
      const main = selectForm(mainCandidates, 'infinitivo')
      if (main) {
        results.push({
          candidate: buildCandidate(surface, auxiliary, main, 'futuro perifrástico', 'ativa', 'valor prospectivo'),
          decomposition: [tokens[0], tokens[1]],
          evidence: [
            `“${tokens[0]}” é forma do auxiliar ir.`,
            `O infinitivo “${tokens[1]}” apresenta a ação projetada.`,
          ],
          equivalents: [],
        })
      }
    }

    if (auxiliary.lemma === 'estar') {
      const main = selectForm(mainCandidates, 'gerúndio')
      const tense = progressiveTense(auxiliary)
      if (main && tense) {
        results.push({
          candidate: buildCandidate(surface, auxiliary, main, tense, 'ativa', 'aspecto progressivo'),
          decomposition: [tokens[0], tokens[1]],
          evidence: [
            `“${tokens[0]}” é forma do auxiliar estar.`,
            `O gerúndio “${tokens[1]}” apresenta a ação em curso.`,
          ],
          equivalents: [],
        })
      }
    }

    if (auxiliary.lemma === 'ser') {
      const main = selectForm(mainCandidates, 'particípio')
      if (main) {
        results.push({
          candidate: buildCandidate(surface, auxiliary, main, 'construção passiva', 'passiva', 'voz passiva analítica'),
          decomposition: [tokens[0], tokens[1]],
          evidence: [
            `“${tokens[0]}” é forma do auxiliar ser.`,
            `O particípio “${tokens[1]}” apresenta o evento na voz passiva.`,
          ],
          equivalents: [],
        })
      }
    }
  }

  const unique = new Map<string, CompoundVerbResult>()
  results.forEach((result) => unique.set([
    result.candidate.lemma,
    result.candidate.tense,
    result.candidate.person,
    result.candidate.number,
    result.candidate.voice,
  ].join('|'), result))
  return [...unique.values()]
}
