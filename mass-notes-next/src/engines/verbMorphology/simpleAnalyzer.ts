import { rankVerbCandidates } from './contextResolver'
import { analyzeIrregularVerbForm } from './irregularLexicon'
import { normalizeVerbSurface, stripVerbDiacritics, verbTokens } from './normalization'
import { analyzeRegularVerbForm } from './regularParadigms'
import { isKnownVerbLemma } from './verbLemmaLexicon'
import type { RankedVerbCandidates } from './contextResolver'
import type { VerbCandidate, VerbSelectionContext } from './types'

export type SimpleVerbLookup = RankedVerbCandidates & {
  registeredIrregular: boolean
  exactRegisteredIrregular: boolean
}

const PREPOSITIONS = new Set(['a', 'de', 'em', 'para', 'por', 'sem', 'até', 'após', 'antes'])
const SUBJUNCTIVE_TRIGGERS = new Set(['quando', 'se', 'caso', 'embora', 'quem', 'onde', 'como'])

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

function disambiguatePersonalInfinitive(
  candidates: VerbCandidate[],
  context: VerbSelectionContext,
): VerbCandidate[] {
  const before = verbTokens(context.before ?? '')
  const previous = normalizeVerbSurface(before.at(-1) ?? '')
  const twoBefore = normalizeVerbSurface(before.at(-2) ?? '')
  const hasFutureSubjunctive = candidates.some((candidate) => candidate.tense === 'futuro do subjuntivo')
  const hasPersonalInfinitive = candidates.some((candidate) => candidate.formType === 'infinitivo pessoal')

  let filtered = candidates
  if (hasFutureSubjunctive && hasPersonalInfinitive) {
    if (PREPOSITIONS.has(previous) || PREPOSITIONS.has(twoBefore)) {
      filtered = candidates.filter((candidate) => candidate.tense !== 'futuro do subjuntivo')
    } else if (SUBJUNCTIVE_TRIGGERS.has(previous) || SUBJUNCTIVE_TRIGGERS.has(twoBefore)) {
      filtered = candidates.filter((candidate) => candidate.formType !== 'infinitivo pessoal')
    }
  }

  return filtered.map((candidate) => candidate.formType === 'infinitivo pessoal'
    ? { ...candidate, mood: undefined }
    : candidate)
}

export function analyzeSimpleVerbSurface(
  value: string,
  context: VerbSelectionContext,
  options: { forceVerb?: boolean } = {},
): SimpleVerbLookup {
  const surface = normalizeVerbSurface(value)
  const irregular = analyzeIrregularVerbForm(surface)
  const exactCuratedIrregular = irregular.candidates.some((candidate) => (
    normalizeVerbSurface(candidate.canonicalSurface) === surface
  ))
  const exactRegisteredIrregular = exactCuratedIrregular
    || (irregular.registered && stripVerbDiacritics(surface) === surface)
  const regular = analyzeRegularVerbForm(surface)
  const knownRegular = regular.filter((candidate) => isKnownVerbLemma(candidate.lemma))
  const acceptedRegular = options.forceVerb ? (knownRegular.length > 0 ? knownRegular : regular) : knownRegular
  const regularCandidates = disambiguatePersonalInfinitive(acceptedRegular, context)
  const derived = irregularNegativeImperatives(irregular.candidates, context)
  const ranked = rankVerbCandidates(surface, [...irregular.candidates, ...derived, ...regularCandidates], context, options)
  return {
    ...ranked,
    registeredIrregular: irregular.registered,
    exactRegisteredIrregular,
  }
}
