import { normalizeVerbSurface, stripVerbDiacritics } from './normalization'
import type {
  VerbCandidate,
  VerbFormType,
  VerbMood,
  VerbNumber,
  VerbPerson,
  VerbTense,
} from './types'

type Conjugation = 'ar' | 'er' | 'ir'

type Rule = {
  conjugation: Conjugation
  ending: string
  canonicalEnding: string
  formType: VerbFormType
  mood?: VerbMood
  tense?: VerbTense
  person?: VerbPerson
  number?: VerbNumber
}

const PERSONS: Array<{ person: VerbPerson; number: VerbNumber }> = [
  { person: 1, number: 'singular' },
  { person: 2, number: 'singular' },
  { person: 3, number: 'singular' },
  { person: 1, number: 'plural' },
  { person: 2, number: 'plural' },
  { person: 3, number: 'plural' },
]

const RULES: Rule[] = []

function addSeries(
  conjugation: Conjugation,
  mood: VerbMood,
  tense: VerbTense,
  endings: string[],
  formType: VerbFormType = 'finita',
): void {
  endings.forEach((ending, index) => {
    const slot = PERSONS[index]
    if (!slot) return
    RULES.push({ conjugation, ending: stripVerbDiacritics(ending), canonicalEnding: ending, formType, mood, tense, ...slot })
  })
}

function addImperative(
  conjugation: Conjugation,
  tense: 'imperativo afirmativo' | 'imperativo negativo',
  forms: Array<{ ending: string; person: VerbPerson; number: VerbNumber }>,
): void {
  forms.forEach(({ ending, person, number }) => {
    RULES.push({
      conjugation,
      ending: stripVerbDiacritics(ending),
      canonicalEnding: ending,
      formType: 'finita',
      mood: 'imperativo',
      tense,
      person,
      number,
    })
  })
}

const PRESENT = {
  ar: ['o', 'as', 'a', 'amos', 'ais', 'am'],
  er: ['o', 'es', 'e', 'emos', 'eis', 'em'],
  ir: ['o', 'es', 'e', 'imos', 'is', 'em'],
} satisfies Record<Conjugation, string[]>

const PERFECT = {
  ar: ['ei', 'aste', 'ou', 'amos', 'astes', 'aram'],
  er: ['i', 'este', 'eu', 'emos', 'estes', 'eram'],
  ir: ['i', 'iste', 'iu', 'imos', 'istes', 'iram'],
} satisfies Record<Conjugation, string[]>

const IMPERFECT = {
  ar: ['ava', 'avas', 'ava', 'ávamos', 'áveis', 'avam'],
  er: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
  ir: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
} satisfies Record<Conjugation, string[]>

const PLUPERFECT = {
  ar: ['ara', 'aras', 'ara', 'áramos', 'áreis', 'aram'],
  er: ['era', 'eras', 'era', 'êramos', 'êreis', 'eram'],
  ir: ['ira', 'iras', 'ira', 'íramos', 'íreis', 'iram'],
} satisfies Record<Conjugation, string[]>

const FUTURE = {
  ar: ['arei', 'arás', 'ará', 'aremos', 'areis', 'arão'],
  er: ['erei', 'erás', 'erá', 'eremos', 'ereis', 'erão'],
  ir: ['irei', 'irás', 'irá', 'iremos', 'ireis', 'irão'],
} satisfies Record<Conjugation, string[]>

const CONDITIONAL = {
  ar: ['aria', 'arias', 'aria', 'aríamos', 'aríeis', 'ariam'],
  er: ['eria', 'erias', 'eria', 'eríamos', 'eríeis', 'eriam'],
  ir: ['iria', 'irias', 'iria', 'iríamos', 'iríeis', 'iriam'],
} satisfies Record<Conjugation, string[]>

const SUBJUNCTIVE_PRESENT = {
  ar: ['e', 'es', 'e', 'emos', 'eis', 'em'],
  er: ['a', 'as', 'a', 'amos', 'ais', 'am'],
  ir: ['a', 'as', 'a', 'amos', 'ais', 'am'],
} satisfies Record<Conjugation, string[]>

const SUBJUNCTIVE_IMPERFECT = {
  ar: ['asse', 'asses', 'asse', 'ássemos', 'ásseis', 'assem'],
  er: ['esse', 'esses', 'esse', 'êssemos', 'êsseis', 'essem'],
  ir: ['isse', 'isses', 'isse', 'íssemos', 'ísseis', 'issem'],
} satisfies Record<Conjugation, string[]>

const SUBJUNCTIVE_FUTURE = {
  ar: ['ar', 'ares', 'ar', 'armos', 'ardes', 'arem'],
  er: ['er', 'eres', 'er', 'ermos', 'erdes', 'erem'],
  ir: ['ir', 'ires', 'ir', 'irmos', 'irdes', 'irem'],
} satisfies Record<Conjugation, string[]>

for (const conjugation of ['ar', 'er', 'ir'] as const) {
  addSeries(conjugation, 'indicativo', 'presente', PRESENT[conjugation])
  addSeries(conjugation, 'indicativo', 'pretérito perfeito', PERFECT[conjugation])
  addSeries(conjugation, 'indicativo', 'pretérito imperfeito', IMPERFECT[conjugation])
  addSeries(conjugation, 'indicativo', 'pretérito mais-que-perfeito', PLUPERFECT[conjugation])
  addSeries(conjugation, 'indicativo', 'futuro do presente', FUTURE[conjugation])
  addSeries(conjugation, 'indicativo', 'futuro do pretérito', CONDITIONAL[conjugation])
  addSeries(conjugation, 'subjuntivo', 'presente do subjuntivo', SUBJUNCTIVE_PRESENT[conjugation])
  addSeries(conjugation, 'subjuntivo', 'pretérito imperfeito do subjuntivo', SUBJUNCTIVE_IMPERFECT[conjugation])
  addSeries(conjugation, 'subjuntivo', 'futuro do subjuntivo', SUBJUNCTIVE_FUTURE[conjugation])
  addSeries(conjugation, 'subjuntivo', 'infinitivo pessoal', SUBJUNCTIVE_FUTURE[conjugation], 'infinitivo pessoal')
}

addImperative('ar', 'imperativo afirmativo', [
  { ending: 'a', person: 2, number: 'singular' },
  { ending: 'e', person: 3, number: 'singular' },
  { ending: 'emos', person: 1, number: 'plural' },
  { ending: 'ai', person: 2, number: 'plural' },
  { ending: 'em', person: 3, number: 'plural' },
])
addImperative('er', 'imperativo afirmativo', [
  { ending: 'e', person: 2, number: 'singular' },
  { ending: 'a', person: 3, number: 'singular' },
  { ending: 'amos', person: 1, number: 'plural' },
  { ending: 'ei', person: 2, number: 'plural' },
  { ending: 'am', person: 3, number: 'plural' },
])
addImperative('ir', 'imperativo afirmativo', [
  { ending: 'e', person: 2, number: 'singular' },
  { ending: 'a', person: 3, number: 'singular' },
  { ending: 'amos', person: 1, number: 'plural' },
  { ending: 'i', person: 2, number: 'plural' },
  { ending: 'am', person: 3, number: 'plural' },
])

addImperative('ar', 'imperativo negativo', [
  { ending: 'es', person: 2, number: 'singular' },
  { ending: 'e', person: 3, number: 'singular' },
  { ending: 'emos', person: 1, number: 'plural' },
  { ending: 'eis', person: 2, number: 'plural' },
  { ending: 'em', person: 3, number: 'plural' },
])
addImperative('er', 'imperativo negativo', [
  { ending: 'as', person: 2, number: 'singular' },
  { ending: 'a', person: 3, number: 'singular' },
  { ending: 'amos', person: 1, number: 'plural' },
  { ending: 'ais', person: 2, number: 'plural' },
  { ending: 'am', person: 3, number: 'plural' },
])
addImperative('ir', 'imperativo negativo', [
  { ending: 'as', person: 2, number: 'singular' },
  { ending: 'a', person: 3, number: 'singular' },
  { ending: 'amos', person: 1, number: 'plural' },
  { ending: 'ais', person: 2, number: 'plural' },
  { ending: 'am', person: 3, number: 'plural' },
])

for (const conjugation of ['ar', 'er', 'ir'] as const) {
  RULES.push({ conjugation, ending: conjugation, canonicalEnding: conjugation, formType: 'infinitivo' })
  RULES.push({
    conjugation,
    ending: conjugation === 'ar' ? 'ando' : conjugation === 'er' ? 'endo' : 'indo',
    canonicalEnding: conjugation === 'ar' ? 'ando' : conjugation === 'er' ? 'endo' : 'indo',
    formType: 'gerúndio',
  })
  for (const ending of conjugation === 'ar' ? ['ado', 'ada', 'ados', 'adas'] : ['ido', 'ida', 'idos', 'idas']) {
    RULES.push({ conjugation, ending, canonicalEnding: ending, formType: 'particípio' })
  }
}

function expandStemCandidates(stem: string, conjugation: Conjugation): string[] {
  const candidates = new Set([stripVerbDiacritics(stem)])
  const bare = stripVerbDiacritics(stem)
  if (bare.endsWith('qu')) candidates.add(`${bare.slice(0, -2)}c`)
  if (bare.endsWith('gu')) candidates.add(`${bare.slice(0, -2)}g`)
  if (conjugation === 'ar' && bare.endsWith('c')) candidates.add(`${bare.slice(0, -1)}ç`)
  if ((conjugation === 'er' || conjugation === 'ir') && bare.endsWith('ç')) candidates.add(`${bare.slice(0, -1)}c`)
  if ((conjugation === 'er' || conjugation === 'ir') && bare.endsWith('j')) candidates.add(`${bare.slice(0, -1)}g`)
  return [...candidates]
}

function personLabel(person?: VerbPerson, number?: VerbNumber): string {
  if (!person || !number) return ''
  return `${person}ª pessoa do ${number}`
}

function ruleLabel(rule: Rule): string {
  if (rule.formType === 'infinitivo') return 'Infinitivo impessoal'
  if (rule.formType === 'infinitivo pessoal') return `Infinitivo pessoal${personLabel(rule.person, rule.number) ? ` — ${personLabel(rule.person, rule.number)}` : ''}`
  if (rule.formType === 'gerúndio') return 'Gerúndio'
  if (rule.formType === 'particípio') return 'Particípio'
  const base = rule.tense ?? rule.mood ?? 'Forma verbal'
  const person = personLabel(rule.person, rule.number)
  return `${base}${person ? ` — ${person}` : ''}`
}

function candidateKey(candidate: VerbCandidate): string {
  return [candidate.lemma, candidate.formType, candidate.mood, candidate.tense, candidate.person, candidate.number].join('|')
}

export function analyzeRegularVerbForm(value: string): VerbCandidate[] {
  const surface = normalizeVerbSurface(value)
  const bareSurface = stripVerbDiacritics(surface)
  if (!surface || surface.includes(' ') || surface.includes('-')) return []

  const found = new Map<string, VerbCandidate>()
  for (const rule of RULES) {
    if (!bareSurface.endsWith(rule.ending)) continue
    const stemLength = bareSurface.length - rule.ending.length
    if (stemLength < 1) continue
    const originalStem = surface.slice(0, surface.length - rule.canonicalEnding.length)
    const bareStem = bareSurface.slice(0, stemLength)
    if (!bareStem) continue

    for (const lemmaStem of expandStemCandidates(bareStem, rule.conjugation)) {
      const lemma = `${lemmaStem}${rule.conjugation}`
      if (lemma.length < 4) continue
      const candidate: VerbCandidate = {
        lemma,
        canonicalSurface: `${originalStem}${rule.canonicalEnding}`,
        formType: rule.formType,
        mood: rule.mood,
        tense: rule.tense,
        person: rule.person,
        number: rule.number,
        voice: 'ativa',
        source: 'regular',
        label: ruleLabel(rule),
      }
      found.set(candidateKey(candidate), candidate)
    }
  }
  return [...found.values()]
}

export function regularRuleCount(): number {
  return RULES.length
}
