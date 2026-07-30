const DASHES = /[‐‑‒–—―]/g

export function normalizeVerbSurface(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .replace(DASHES, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripVerbDiacritics(value: string): string {
  return normalizeVerbSurface(value).normalize('NFD').replace(/\p{M}+/gu, '')
}

export function verbTokens(value: string): string[] {
  return normalizeVerbSurface(value).match(/[\p{L}]+(?:-[\p{L}]+)*/gu) ?? []
}

export function lastVerbToken(value: string): string {
  const tokens = verbTokens(value)
  return tokens.at(-1) ?? ''
}

export function firstVerbToken(value: string): string {
  return verbTokens(value)[0] ?? ''
}

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}
