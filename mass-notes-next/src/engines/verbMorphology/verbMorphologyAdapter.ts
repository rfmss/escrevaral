import { parseCliticVerb, type ParsedCliticVerb } from './cliticParser'
import { analyzeCompoundVerb } from './compoundConstructions'
import { normalizeVerbSurface, stripVerbDiacritics, uniqueStrings } from './normalization'
import { analyzeSimpleVerbSurface } from './simpleAnalyzer'
import type {
  VerbAnalysis,
  VerbCandidate,
  VerbClitic,
  VerbDecision,
  VerbSelectionContext,
} from './types'

const SUBJECT_LABELS: Record<string, string> = {
  '1:singular': 'eu',
  '2:singular': 'tu',
  '3:singular': 'ele/ela/você',
  '1:plural': 'nós',
  '2:plural': 'vós',
  '3:plural': 'eles/elas/vocês',
}

function deriveContext(surface: string, context: VerbSelectionContext): VerbSelectionContext {
  if (context.before != null || context.after != null || !context.fullText) return context
  const source = context.fullText
  const normalizedSource = source.toLocaleLowerCase('pt-BR')
  const index = normalizedSource.indexOf(surface.toLocaleLowerCase('pt-BR'))
  if (index < 0) return context
  return {
    ...context,
    before: source.slice(Math.max(0, index - 180), index),
    after: source.slice(index + surface.length, index + surface.length + 180),
  }
}

function subjectLabel(candidate: VerbCandidate): string {
  if (!candidate.person || !candidate.number) return ''
  return SUBJECT_LABELS[`${candidate.person}:${candidate.number}`] ?? ''
}

function encliticInfinitive(lemma: string, clitics: VerbClitic[]): string {
  const first = clitics[0]
  if (!first) return lemma
  const pronoun = first.base
  if (!['o', 'a', 'os', 'as'].includes(pronoun)) return `${lemma}-${pronoun}`
  const last = lemma.at(-2)
  const stem = lemma.slice(0, -1)
  const accent = last === 'a' ? 'á' : last === 'e' ? 'ê' : last === 'i' ? 'í' : last
  const transformed = pronoun === 'o' ? 'lo' : pronoun === 'a' ? 'la' : pronoun === 'os' ? 'los' : 'las'
  return `${stem.slice(0, -1)}${accent}-${transformed}`
}

function cliticBeforeVerb(clitics: VerbClitic[]): string {
  return clitics.map((item) => item.base.includes('/') ? item.surface : item.base).join(' ')
}

function simpleEquivalents(candidate: VerbCandidate, clitics: VerbClitic[]): string[] {
  if (clitics.length === 0) return []
  const subject = subjectLabel(candidate)
  const pronoun = cliticBeforeVerb(clitics)
  const equivalents: string[] = []

  if (subject) equivalents.push(`${subject} ${pronoun} ${candidate.canonicalSurface}`)
  if (candidate.tense === 'futuro do presente') {
    const infinitive = encliticInfinitive(candidate.lemma, clitics)
    equivalents.push(`${subject || 'o sujeito'} vai ${infinitive}`)
  }
  if (candidate.tense === 'futuro do pretérito') {
    const infinitive = encliticInfinitive(candidate.lemma, clitics)
    equivalents.push(`${subject || 'o sujeito'} iria ${infinitive}`)
  }
  return uniqueStrings(equivalents)
}

function safeRegisteredIrregular(surface: string): VerbAnalysis {
  const primary: VerbCandidate = {
    lemma: 'não determinado',
    canonicalSurface: surface,
    formType: 'finita',
    voice: 'indeterminada',
    source: 'irregular',
    label: 'Forma verbal irregular registrada',
  }
  return {
    surface,
    canonicalForm: surface,
    primary,
    alternatives: [],
    lemmaCandidates: [],
    clitics: [],
    decomposition: [surface],
    orthographicNotes: [],
    equivalents: [],
    decision: 'indeterminado',
    evidence: ['A forma aparece no inventário irregular legado, mas ainda não possui paradigma curado suficiente para uma análise detalhada.'],
    contextNote: 'A engine reconhece o sinal verbal sem inventar lema, tempo ou pessoa.',
  }
}

function decisionWithCandidates(decision: VerbDecision, candidates: VerbCandidate[]): VerbDecision {
  if (candidates.length === 0) return 'indeterminado'
  return decision
}

function contextForClitic(parsed: ParsedCliticVerb, context: VerbSelectionContext): VerbSelectionContext {
  if (parsed.placement !== 'próclise') return context
  const words = parsed.surface.split(' ')
  const prefix = words.slice(0, -2).join(' ').trim()
  if (!prefix) return context
  return {
    ...context,
    before: `${context.before ?? ''} ${prefix}`.trim(),
  }
}

function buildFromClitic(
  surface: string,
  parsed: ParsedCliticVerb,
  context: VerbSelectionContext,
): VerbAnalysis | null {
  const effectiveContext = contextForClitic(parsed, context)
  const lookup = analyzeSimpleVerbSurface(parsed.baseSurface, effectiveContext, { forceVerb: true })
  if (lookup.candidates.length === 0) {
    if (lookup.registeredIrregular) {
      const safe = safeRegisteredIrregular(surface)
      return {
        ...safe,
        canonicalForm: parsed.canonicalForm,
        clitics: parsed.clitics,
        placement: parsed.placement,
        decomposition: parsed.decomposition,
        orthographicNotes: parsed.orthographicNotes,
        inputNote: parsed.inputNote,
        evidence: [...safe.evidence, `O pronome aparece em ${parsed.placement}.`],
      }
    }
    return null
  }

  const primary = lookup.candidates[0]
  const alternatives = lookup.candidates.slice(1)
  return {
    surface,
    canonicalForm: parsed.canonicalForm,
    primary,
    alternatives,
    lemmaCandidates: uniqueStrings(lookup.candidates.map((candidate) => candidate.lemma)),
    clitics: parsed.clitics,
    placement: parsed.placement,
    decomposition: parsed.decomposition,
    orthographicNotes: parsed.orthographicNotes,
    equivalents: simpleEquivalents(primary, parsed.clitics),
    decision: decisionWithCandidates(lookup.decision, lookup.candidates),
    evidence: uniqueStrings([...lookup.evidence, `O pronome aparece em ${parsed.placement}.`]),
    contextNote: lookup.contextNote,
    inputNote: parsed.inputNote,
  }
}

export function analyzeVerbMorphology(
  value: string,
  suppliedContext: Partial<VerbSelectionContext> = {},
): VerbAnalysis | null {
  const surface = normalizeVerbSurface(value)
  if (!surface || surface.length > 160) return null
  const context = deriveContext(surface, {
    text: suppliedContext.text ?? surface,
    before: suppliedContext.before,
    after: suppliedContext.after,
    fullText: suppliedContext.fullText,
  })

  const compounds = analyzeCompoundVerb(surface, context)
  if (compounds.length > 0) {
    const primary = compounds[0]
    const alternatives = compounds.slice(1).map((item) => item.candidate)
    return {
      surface,
      canonicalForm: primary.candidate.canonicalSurface,
      primary: primary.candidate,
      alternatives,
      lemmaCandidates: uniqueStrings(compounds.map((item) => item.candidate.lemma)),
      clitics: [],
      decomposition: primary.decomposition,
      orthographicNotes: [],
      equivalents: primary.equivalents,
      decision: alternatives.length > 0 ? 'ambíguo' : 'classificado',
      evidence: uniqueStrings(compounds.flatMap((item) => item.evidence)),
      contextNote: alternatives.length > 0 ? 'Mais de uma construção verbal permanece possível.' : undefined,
    }
  }

  const parsedClitic = parseCliticVerb(surface)
  if (parsedClitic) return buildFromClitic(surface, parsedClitic, context)

  const lookup = analyzeSimpleVerbSurface(surface, context)
  if (lookup.candidates.length === 0) return lookup.registeredIrregular ? safeRegisteredIrregular(surface) : null

  const primary = lookup.candidates[0]
  const canonicalForm = primary.canonicalSurface
  const inputNote = stripVerbDiacritics(surface) === stripVerbDiacritics(canonicalForm) && surface !== canonicalForm
    ? `Na grafia normativa, esta forma é “${canonicalForm}”.`
    : undefined

  return {
    surface,
    canonicalForm,
    primary,
    alternatives: lookup.candidates.slice(1),
    lemmaCandidates: uniqueStrings(lookup.candidates.map((candidate) => candidate.lemma)),
    clitics: [],
    decomposition: [primary.lemma, canonicalForm],
    orthographicNotes: inputNote ? [`A presença ou ausência de diacrítico pode distinguir classes e formas diferentes: ${canonicalForm}.`] : [],
    equivalents: [],
    decision: decisionWithCandidates(lookup.decision, lookup.candidates),
    evidence: lookup.evidence,
    contextNote: lookup.contextNote,
    inputNote,
  }
}
