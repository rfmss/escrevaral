import { normalizeVerbSurface, stripVerbDiacritics, verbTokens } from './normalization'
import type { VerbClitic, VerbNumber, VerbPlacement } from './types'

export type ParsedCliticVerb = {
  surface: string
  baseSurface: string
  canonicalForm: string
  placement: VerbPlacement
  clitics: VerbClitic[]
  decomposition: string[]
  orthographicNotes: string[]
  inputNote?: string
}

type CliticDefinition = Omit<VerbClitic, 'surface'>

const CLITICS: Record<string, CliticDefinition> = {
  me: { base: 'me', functionName: 'pronome oblíquo de 1ª pessoa do singular' },
  te: { base: 'te', functionName: 'pronome oblíquo de 2ª pessoa do singular' },
  se: { base: 'se', functionName: 'pronome reflexivo, recíproco ou marcador de construção pronominal' },
  nos: { base: 'nos', functionName: 'pronome oblíquo de 1ª pessoa do plural', number: 'plural' },
  vos: { base: 'vos', functionName: 'pronome oblíquo de 2ª pessoa do plural', number: 'plural' },
  lhe: { base: 'lhe', functionName: 'pronome de objeto indireto da 3ª pessoa', number: 'singular' },
  lhes: { base: 'lhes', functionName: 'pronome de objeto indireto da 3ª pessoa', number: 'plural' },
  o: { base: 'o', functionName: 'pronome de objeto direto masculino singular', gender: 'masculino', number: 'singular' },
  a: { base: 'a', functionName: 'pronome de objeto direto feminino singular', gender: 'feminino', number: 'singular' },
  os: { base: 'os', functionName: 'pronome de objeto direto masculino plural', gender: 'masculino', number: 'plural' },
  as: { base: 'as', functionName: 'pronome de objeto direto feminino plural', gender: 'feminino', number: 'plural' },
  lo: { base: 'o', functionName: 'variante de o depois da perda de -r, -s ou -z', gender: 'masculino', number: 'singular' },
  la: { base: 'a', functionName: 'variante de a depois da perda de -r, -s ou -z', gender: 'feminino', number: 'singular' },
  los: { base: 'os', functionName: 'variante de os depois da perda de -r, -s ou -z', gender: 'masculino', number: 'plural' },
  las: { base: 'as', functionName: 'variante de as depois da perda de -r, -s ou -z', gender: 'feminino', number: 'plural' },
  no: { base: 'o', functionName: 'variante de o depois de terminação nasal', gender: 'masculino', number: 'singular' },
  na: { base: 'a', functionName: 'variante de a depois de terminação nasal', gender: 'feminino', number: 'singular' },
  nas: { base: 'as', functionName: 'variante de as depois de terminação nasal', gender: 'feminino', number: 'plural' },
}

const FUTURE_ENDINGS = new Map<string, string>([
  ['ei', 'ei'],
  ['as', 'ás'],
  ['a', 'á'],
  ['emos', 'emos'],
  ['eis', 'eis'],
  ['ao', 'ão'],
])

const CONDITIONAL_ENDINGS = new Map<string, string>([
  ['ia', 'ia'],
  ['ias', 'ias'],
  ['iamos', 'íamos'],
  ['ieis', 'íeis'],
  ['iam', 'iam'],
])

const PROCLISIS_ATTRACTORS = new Set([
  'não', 'nunca', 'jamais', 'ninguém', 'nada', 'nem', 'que', 'quem', 'quando',
  'se', 'como', 'onde', 'porque', 'embora', 'talvez', 'sempre', 'já', 'ainda',
])

function clitic(value: string, previous = ''): VerbClitic | null {
  const key = stripVerbDiacritics(value)
  if (key === 'nos' && /(?:m|ão|õe)s?$/u.test(previous)) {
    return {
      surface: value,
      base: 'os/nos',
      functionName: 'forma ambígua: pode representar os depois de terminação nasal ou o pronome nos',
      gender: 'masculino',
      number: 'plural',
    }
  }
  const definition = CLITICS[key]
  return definition ? { surface: value, ...definition } : null
}

function hasDiacritic(value: string): boolean {
  return value.normalize('NFD') !== value.normalize('NFD').replace(/\p{M}+/gu, '')
}

function accentCliticStem(value: string): { stem: string; conjugation: 'ar' | 'er' | 'ir' | 'pôr' } | null {
  const clean = normalizeVerbSurface(value)
  const bare = stripVerbDiacritics(clean)
  const last = bare.at(-1)
  if (!last || !['a', 'e', 'i', 'o'].includes(last)) return null

  if (last === 'o' && bare === 'po') return { stem: clean.endsWith('ô') ? clean : 'pô', conjugation: 'pôr' }
  const conjugation = last === 'a' ? 'ar' : last === 'e' ? 'er' : 'ir'
  if (hasDiacritic(clean)) return { stem: clean, conjugation }
  const accent = last === 'a' ? 'á' : last === 'e' ? 'ê' : 'í'
  return { stem: `${clean.slice(0, -1)}${accent}`, conjugation }
}

function restoreInfinitive(stem: string, conjugation: 'ar' | 'er' | 'ir' | 'pôr'): string {
  if (conjugation === 'pôr') return 'pôr'
  return `${stripVerbDiacritics(stem.slice(0, -1))}${conjugation}`
}

function parseMesoclisis(surface: string): ParsedCliticVerb | null {
  const parts = surface.split('-').filter(Boolean)
  if (parts.length < 3) return null
  const endingSurface = parts.at(-1) ?? ''
  const endingKey = stripVerbDiacritics(endingSurface)
  const canonicalEnding = FUTURE_ENDINGS.get(endingKey) ?? CONDITIONAL_ENDINGS.get(endingKey)
  if (!canonicalEnding) return null

  const stemSurface = parts[0]
  const parsedStem = accentCliticStem(stemSurface)
  if (!parsedStem) return null
  const cliticParts = parts.slice(1, -1)
  const parsedClitics = cliticParts.map((item) => clitic(item, stemSurface))
  if (parsedClitics.some((item) => !item)) return null

  const infinitive = restoreInfinitive(parsedStem.stem, parsedStem.conjugation)
  const baseSurface = `${infinitive}${canonicalEnding}`
  const canonicalForm = [parsedStem.stem, ...cliticParts.map((item) => stripVerbDiacritics(item)), canonicalEnding].join('-')
  const inputNote = stripVerbDiacritics(surface) === stripVerbDiacritics(canonicalForm) && surface !== canonicalForm
    ? `Na grafia normativa, a forma é ${canonicalForm}.`
    : undefined

  return {
    surface,
    baseSurface,
    canonicalForm,
    placement: 'mesóclise',
    clitics: parsedClitics as VerbClitic[],
    decomposition: [infinitive, ...(parsedClitics as VerbClitic[]).map((item) => item.base), canonicalEnding],
    orthographicNotes: [
      'O pronome foi inserido entre o infinitivo e a desinência de futuro.',
      'Antes de -lo, -la, -los ou -las, o -r do infinitivo é retirado e a vogal tônica recebe acento.',
    ],
    inputNote,
  }
}

function parseEnclisis(surface: string): ParsedCliticVerb | null {
  const parts = surface.split('-').filter(Boolean)
  if (parts.length < 2) return null
  const verbPart = parts[0]
  const parsedClitics = parts.slice(1).map((item) => clitic(item, verbPart))
  if (parsedClitics.some((item) => !item)) return null

  const first = parsedClitics[0] as VerbClitic
  let baseSurface = verbPart
  let canonicalVerbPart = verbPart
  const notes: string[] = []

  if (['lo', 'la', 'los', 'las'].includes(stripVerbDiacritics(first.surface))) {
    const parsedStem = accentCliticStem(verbPart)
    if (parsedStem) {
      baseSurface = restoreInfinitive(parsedStem.stem, parsedStem.conjugation)
      canonicalVerbPart = parsedStem.stem
      notes.push('A forma em -lo/-la/-los/-las resulta da perda de -r, -s ou -z antes do pronome.')
    }
  } else if (['no', 'na', 'nos', 'nas'].includes(stripVerbDiacritics(first.surface))) {
    notes.push('A variante em -n- ocorre depois de forma verbal terminada em som nasal.')
  }

  const canonicalForm = [canonicalVerbPart, ...parts.slice(1).map((item) => stripVerbDiacritics(item))].join('-')
  const inputNote = stripVerbDiacritics(surface) === stripVerbDiacritics(canonicalForm) && surface !== canonicalForm
    ? `Na grafia normativa, a forma é ${canonicalForm}.`
    : undefined

  return {
    surface,
    baseSurface,
    canonicalForm,
    placement: 'ênclise',
    clitics: parsedClitics as VerbClitic[],
    decomposition: [baseSurface, ...(parsedClitics as VerbClitic[]).map((item) => item.base)],
    orthographicNotes: notes,
    inputNote,
  }
}

function parseProclisis(surface: string): ParsedCliticVerb | null {
  const words = normalizeVerbSurface(surface).split(' ')
  if (words.length < 2 || words.length > 5) return null
  const verbPart = words.at(-1) ?? ''
  const cliticIndex = words.length - 2
  const parsedClitic = clitic(words[cliticIndex] ?? '')
  if (!parsedClitic) return null
  const prefix = words.slice(0, cliticIndex)
  if (prefix.length > 0 && !prefix.some((item) => PROCLISIS_ATTRACTORS.has(item))) return null

  return {
    surface,
    baseSurface: verbPart,
    canonicalForm: words.join(' '),
    placement: 'próclise',
    clitics: [parsedClitic],
    decomposition: [parsedClitic.base, verbPart],
    orthographicNotes: prefix.length > 0
      ? [`O elemento “${prefix.at(-1)}” favorece a colocação do pronome antes do verbo.`]
      : ['O pronome aparece antes do verbo.'],
  }
}

export function parseCliticVerb(value: string): ParsedCliticVerb | null {
  const surface = normalizeVerbSurface(value)
  if (!surface) return null
  if (surface.includes(' ')) return parseProclisis(surface)
  if (!surface.includes('-')) return null
  return parseMesoclisis(surface) ?? parseEnclisis(surface)
}

export function cliticBaseNumber(value: string): VerbNumber | undefined {
  return clitic(value)?.number
}

export function isProclisisAttractor(value: string): boolean {
  return PROCLISIS_ATTRACTORS.has(normalizeVerbSurface(value))
}

export function containsClitic(value: string): boolean {
  const tokens = verbTokens(value)
  return tokens.some((token) => Boolean(clitic(token))) || Boolean(parseCliticVerb(value))
}
