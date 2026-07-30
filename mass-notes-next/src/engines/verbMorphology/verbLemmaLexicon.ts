import lexicalDataSource from '../../../../lexical-data.json?raw'
import lexicalSource from '../../../../lexical-engine.js?raw'
import synonymSource from '../../../../js/data/synonym-data.js?raw'
import { normalizeVerbSurface, stripVerbDiacritics } from './normalization'

const CORE_LEMMAS = [
  'abrir', 'acabar', 'achar', 'ajudar', 'amar', 'analisar', 'andar', 'aprender',
  'buscar', 'cantar', 'carregar', 'chamar', 'chegar', 'chover', 'começar', 'comer',
  'conhecer', 'continuar', 'correr', 'cortar', 'criar', 'deixar', 'dever', 'dormir',
  'escrever', 'esperar', 'estudar', 'falar', 'fechar', 'ficar', 'gostar', 'largar',
  'ler', 'lembrar', 'morar', 'mover', 'nascer', 'olhar', 'ouvir', 'partir', 'passar',
  'pensar', 'perceber', 'perder', 'permanecer', 'precisar', 'procurar', 'publicar',
  'receber', 'resolver', 'responder', 'seguir', 'sentir', 'tentar', 'terminar',
  'trabalhar', 'usar', 'vender', 'viver', 'voltar', 'varrer',
]

function addIfLemma(target: Set<string>, value: unknown): void {
  if (typeof value !== 'string') return
  const clean = stripVerbDiacritics(value)
  if (/^[\p{L}]+(?:ar|er|ir)$/u.test(clean) && clean.length >= 4) target.add(clean)
}

function collectJson(value: unknown, target: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJson(item, target))
    return
  }
  if (!value || typeof value !== 'object') {
    addIfLemma(target, value)
    return
  }
  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    addIfLemma(target, key)
    collectJson(item, target)
  })
}

function collectSourceKeys(source: string, target: Set<string>): void {
  const keyPattern = /["']([^"'\n]+)["']\s*:/g
  for (const match of source.matchAll(keyPattern)) addIfLemma(target, match[1])
}

const KNOWN_LEMMAS = (() => {
  const result = new Set<string>()
  CORE_LEMMAS.forEach((lemma) => result.add(stripVerbDiacritics(lemma)))
  try { collectJson(JSON.parse(lexicalDataSource), result) } catch { /* O adaptador lexical valida a fonte em runtime. */ }
  collectSourceKeys(lexicalSource, result)
  collectSourceKeys(synonymSource, result)
  return result
})()

export function isKnownVerbLemma(value: string): boolean {
  return KNOWN_LEMMAS.has(stripVerbDiacritics(normalizeVerbSurface(value)))
}

export function knownVerbLemmaCount(): number {
  return KNOWN_LEMMAS.size
}
