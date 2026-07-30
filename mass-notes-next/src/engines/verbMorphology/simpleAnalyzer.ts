import { rankVerbCandidates } from './contextResolver'
import { analyzeIrregularVerbForm } from './irregularLexicon'
import { analyzeRegularVerbForm } from './regularParadigms'
import type { RankedVerbCandidates } from './contextResolver'
import type { VerbSelectionContext } from './types'

export type SimpleVerbLookup = RankedVerbCandidates & {
  registeredIrregular: boolean
}

export function analyzeSimpleVerbSurface(
  value: string,
  context: VerbSelectionContext,
  options: { forceVerb?: boolean } = {},
): SimpleVerbLookup {
  const irregular = analyzeIrregularVerbForm(value)
  const regular = analyzeRegularVerbForm(value)
  const ranked = rankVerbCandidates(value, [...irregular.candidates, ...regular], context, options)
  return { ...ranked, registeredIrregular: irregular.registered }
}
