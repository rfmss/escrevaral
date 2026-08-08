export type VerbFormationSupplement = {
  canonicalForm: string
  tense: string
  construction: string
  baseFuture: string
  decomposition: string
  orthographicAdjustment: string
  equivalents: string[]
  inputNote?: string
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[‐‑‒–—―]/g, '-')
    .trim()
}

export function readVerbFormationSupplement(value: string): VerbFormationSupplement | null {
  const normalized = normalize(value)
  if (normalized !== 'varre-lo-ei') return null

  const inputNote = value.trim().toLocaleLowerCase('pt-BR') === 'varrê-lo-ei'
    ? undefined
    : 'Na grafia normativa, esta forma recebe acento circunflexo: varrê-lo-ei.'

  return {
    canonicalForm: 'varrê-lo-ei',
    tense: 'Futuro do presente do indicativo',
    construction: 'Mesóclise',
    baseFuture: 'varrerei',
    decomposition: 'varrer + o + ei',
    orthographicAdjustment: 'Ao ligar o infinitivo terminado em -r ao pronome o, retira-se o -r, o pronome assume a forma -lo e a vogal tônica recebe acento: varrê-lo-ei.',
    equivalents: ['eu o varrerei', 'eu vou varrê-lo'],
    inputNote,
  }
}
