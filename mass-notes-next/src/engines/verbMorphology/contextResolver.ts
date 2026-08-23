import { normalizeVerbSurface, stripVerbDiacritics, verbTokens } from './normalization'
import type {
  VerbCandidate,
  VerbDecision,
  VerbNumber,
  VerbPerson,
  VerbSelectionContext,
} from './types'

export type RankedVerbCandidates = {
  candidates: VerbCandidate[]
  decision: VerbDecision
  evidence: string[]
  contextNote?: string
}

type SubjectAgreement = { person: VerbPerson; number: VerbNumber }

const SUBJECTS = new Map<string, SubjectAgreement>([
  ['eu', { person: 1, number: 'singular' }],
  ['tu', { person: 2, number: 'singular' }],
  ['ele', { person: 3, number: 'singular' }],
  ['ela', { person: 3, number: 'singular' }],
  ['você', { person: 3, number: 'singular' }],
  ['a gente', { person: 3, number: 'singular' }],
  ['nós', { person: 1, number: 'plural' }],
  ['vós', { person: 2, number: 'plural' }],
  ['eles', { person: 3, number: 'plural' }],
  ['elas', { person: 3, number: 'plural' }],
  ['vocês', { person: 3, number: 'plural' }],
])

const DETERMINERS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'meu', 'minha', 'meus', 'minhas',
  'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas',
])

const DIRECT_OBJECT_MARKERS = new Set([
  ...DETERMINERS,
  'me', 'te', 'se', 'nos', 'vos', 'o', 'a', 'os', 'as', 'lhe', 'lhes',
  'algo', 'isso', 'isto', 'aquilo', 'tudo', 'nada',
])

const PREPOSITIONS = new Set([
  'a', 'ante', 'após', 'até', 'com', 'contra', 'de', 'desde', 'em', 'entre',
  'para', 'perante', 'por', 'sem', 'sob', 'sobre', 'trás',
])

const SUBJUNCTIVE_ATTRACTORS = new Set([
  'que', 'se', 'quando', 'embora', 'caso', 'talvez', 'quem', 'onde', 'como',
  'porque', 'antes', 'até', 'assim',
])

const NOMINAL_SUFFIXES = /(?:ção|são|ções|dade|tude|eza|ez|ismo|ncia|mento|agem|ista|ura|aria|ório)$/u
const FINITE_VERB_HINT = /(?:o|as|a|amos|ais|am|es|e|emos|eis|em|imos|is|ei|aste|ou|aram|i|este|eu|eram|iste|iu|iram|ava|avas|ávamos|áveis|avam|ia|ias|íamos|íeis|iam|asse|asses|ássemos|ásseis|assem|esse|esses|êssemos|êsseis|essem|isse|isses|íssemos|ísseis|issem)$/u

function words(value = ''): string[] {
  return verbTokens(value)
}

function last(values: string[], offset = 1): string {
  return values.at(-offset) ?? ''
}

function first(values: string[], offset = 0): string {
  return values[offset] ?? ''
}

function candidateKey(candidate: VerbCandidate): string {
  return [
    candidate.lemma,
    candidate.canonicalSurface,
    candidate.formType,
    candidate.mood,
    candidate.tense,
    candidate.person,
    candidate.number,
    candidate.voice,
  ].join('|')
}

function agreementMatches(candidate: VerbCandidate, agreement: SubjectAgreement): boolean {
  return candidate.person === agreement.person && candidate.number === agreement.number
}

function explicitSubject(beforeWords: string[]): { token: string; agreement: SubjectAgreement } | null {
  const previous = last(beforeWords)
  const twoWord = `${last(beforeWords, 2)} ${previous}`.trim()
  const compound = SUBJECTS.get(twoWord)
  if (compound) return { token: twoWord, agreement: compound }
  const simple = SUBJECTS.get(previous)
  return simple ? { token: previous, agreement: simple } : null
}

function scoreCandidate(
  surface: string,
  candidate: VerbCandidate,
  context: VerbSelectionContext,
): { score: number; evidence: string[] } {
  const beforeWords = words(context.before)
  const afterWords = words(context.after)
  const previous = last(beforeWords)
  const twoBefore = last(beforeWords, 2)
  const next = first(afterWords)
  const evidence: string[] = []
  let score = 0

  if (candidate.source === 'irregular') {
    score += 45
    evidence.push(`A forma pertence ao paradigma irregular curado de “${candidate.lemma}”.`)
  } else if (candidate.source === 'locução') {
    score += 70
    evidence.push('A sequência corresponde a uma construção verbal composta reconhecida.')
  } else {
    score += 12
    evidence.push(`A terminação corresponde ao paradigma regular de verbos em -${candidate.lemma.slice(-2)}.`)
  }

  if (normalizeVerbSurface(candidate.canonicalSurface) === normalizeVerbSurface(surface)) {
    score += 25
    evidence.push('A grafia coincide com a forma canônica do paradigma.')
  } else if (stripVerbDiacritics(candidate.canonicalSurface) === stripVerbDiacritics(surface)) {
    score -= 8
    evidence.push(`A forma coincide sem diacríticos; a grafia canônica é “${candidate.canonicalSurface}”.`)
  }

  if (candidate.formType !== 'finita') {
    score += 25
    evidence.push(`A terminação caracteriza ${candidate.formType}.`)
  }

  if (candidate.tense && [
    'futuro do presente',
    'futuro do pretérito',
    'pretérito imperfeito do subjuntivo',
  ].includes(candidate.tense)) {
    score += 18
  }

  const subject = explicitSubject(beforeWords)
  if (subject && candidate.person && candidate.number) {
    if (agreementMatches(candidate, subject.agreement)) {
      score += 55
      evidence.push(`O sujeito “${subject.token}” concorda com ${candidate.person}ª pessoa do ${candidate.number}.`)
    } else {
      score -= 70
    }
  }

  const hasVisiblePersonalInflection = normalizeVerbSurface(candidate.canonicalSurface) !== normalizeVerbSurface(candidate.lemma)
  if (
    candidate.formType === 'infinitivo pessoal'
    && hasVisiblePersonalInflection
    && twoBefore === 'é'
    && previous === 'melhor'
  ) {
    score += 35
    evidence.push('A construção avaliativa “é melhor” pode introduzir um infinitivo pessoal flexionado.')
  }

  if (DETERMINERS.has(previous) && candidate.formType === 'finita') {
    score -= 85
    evidence.push(`O determinante “${previous}” imediatamente antes favorece uma leitura nominal.`)
  }

  const nominalSubjectPattern = DETERMINERS.has(twoBefore) && previous && !NOMINAL_SUFFIXES.test(previous)
  if (nominalSubjectPattern && candidate.formType === 'finita') {
    if (candidate.person === 3 && candidate.number === 'singular' && DIRECT_OBJECT_MARKERS.has(next)) {
      score += 35
      evidence.push(`O grupo nominal antes e o possível complemento iniciado por “${next}” favorecem a leitura verbal.`)
    } else if (next && FINITE_VERB_HINT.test(next)) {
      score -= 70
      evidence.push(`A forma “${next}” à direita ocupa provavelmente o núcleo verbal; a palavra selecionada tende a caracterizar o nome anterior.`)
    } else if (candidate.tense === 'presente' || candidate.mood === 'imperativo') {
      score -= 18
      evidence.push('Sem complemento ou outro sinal verbal à direita, a posição pós-nominal permanece ambígua.')
    }
  }

  if (PREPOSITIONS.has(previous) && candidate.formType === 'finita') score -= 35
  if (PREPOSITIONS.has(previous) && ['infinitivo', 'infinitivo pessoal'].includes(candidate.formType)) {
    score += 30
    evidence.push(`A preposição “${previous}” pode introduzir um infinitivo, inclusive pessoal.`)
  }

  if (previous === 'não') {
    if (candidate.tense === 'imperativo negativo') {
      score += 60
      evidence.push('A negação imediatamente anterior favorece o imperativo negativo.')
    } else if (candidate.mood === 'imperativo') {
      score -= 25
    }
  }

  if (SUBJUNCTIVE_ATTRACTORS.has(previous) || SUBJUNCTIVE_ATTRACTORS.has(twoBefore)) {
    if (candidate.mood === 'subjuntivo') {
      score += 32
      evidence.push('O conector próximo favorece uma leitura no subjuntivo.')
    }
  }

  if (next && NOMINAL_SUFFIXES.test(next) && candidate.formType === 'finita') score += 4

  return { score, evidence }
}

export function rankVerbCandidates(
  surface: string,
  candidates: VerbCandidate[],
  context: VerbSelectionContext,
  options: { forceVerb?: boolean } = {},
): RankedVerbCandidates {
  const unique = new Map<string, VerbCandidate>()
  candidates.forEach((candidate) => unique.set(candidateKey(candidate), candidate))

  const scored = [...unique.values()]
    .map((candidate) => ({ candidate, ...scoreCandidate(surface, candidate, context) }))
    .filter((item) => options.forceVerb || item.score >= 5)
    .sort((left, right) => right.score - left.score || left.candidate.label.localeCompare(right.candidate.label, 'pt-BR'))

  if (scored.length === 0) {
    return {
      candidates: [],
      decision: 'indeterminado',
      evidence: ['A forma superficial não recebeu apoio contextual suficiente para uma leitura verbal.'],
      contextNote: 'O recorte disponível favorece outra classe ou não contém contexto suficiente.',
    }
  }

  const topScore = scored[0].score
  const retained = scored.filter((item) => item.score >= topScore - 12).slice(0, 12)
  const top = retained[0]
  const second = retained[1]
  const sameGrammar = second
    && top.candidate.lemma === second.candidate.lemma
    && top.candidate.tense === second.candidate.tense
    && top.candidate.person === second.candidate.person
    && top.candidate.number === second.candidate.number

  let decision: VerbDecision = 'classificado'
  if (topScore < 35) decision = 'provável'
  if (second && !sameGrammar && Math.abs(top.score - second.score) <= 7) decision = 'ambíguo'

  const evidence = [...new Set(retained.flatMap((item) => item.evidence))].slice(0, 8)
  const contextNote = decision === 'ambíguo'
    ? 'Mais de uma análise permanece compatível com a forma e o contexto selecionado.'
    : decision === 'provável'
      ? 'A leitura é provável, mas o contexto não elimina todas as alternativas morfológicas.'
      : undefined

  return {
    candidates: retained.map((item) => item.candidate),
    decision,
    evidence,
    contextNote,
  }
}
