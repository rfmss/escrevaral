import { rankVerbCandidates } from './contextResolver'
import { analyzeIrregularVerbForm } from './irregularLexicon'
import { normalizeVerbSurface, verbTokens } from './normalization'
import { analyzeRegularVerbForm } from './regularParadigms'
import { isKnownVerbLemma } from './verbLemmaLexicon'
import type { RankedVerbCandidates } from './contextResolver'
import type { VerbCandidate, VerbSelectionContext } from './types'

export type SimpleVerbLookup = RankedVerbCandidates & {
  registeredIrregular: boolean
}

function irregularNegativeImperatives(
  candidates: VerbCandidate[],
  context: VerbSelectionContext,
): VerbCandidate[] {
  const before = verbTokens(context.before ?? '')
  if (normalizeVerbSurface(before.at(-1) ?? '') !== 'não') return []
  return candidates
    .filter((candidate) => (
      candidate.source === 'irregular'
      && candidate.tense === 'presente do subjuntivo'
      && candidate.person !== 1
      && candidate.person != null
      && candidate.number != null
    ))
    .map((candidate) => ({
      ...candidate,
      mood: 'imperativo' as const,
      tense: 'imperativo negativo' as const,
      label: `imperativo negativo — ${candidate.person}ª pessoa do ${candidate.number}`,
    }))
}

export function analyzeSimpleVerbSurface(
  value: string,
  context: VerbSelectionContext,
  options: { forceVerb?: boolean } = {},
): SimpleVerbLookup {
  const irregular = analyzeIrregularVerbForm(value)
  const regular = analyzeRegularVerbForm(value)
  const knownRegular = regular.filter((candidate) => isKnownVerbLemma(candidate.lemma))
  const regularCandidates = knownRegular.length > 0 ? knownRegular : regular
  const derived = irregularNegativeImperatives(irregular.candidates, context)
  const ranked = rankVerbCandidates(value, [...irregular.candidates, ...derived, ...regularCandidates], context, options)
  return { ...ranked, registeredIrregular: irregular.registered }
}
