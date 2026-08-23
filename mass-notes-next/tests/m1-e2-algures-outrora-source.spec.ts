import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const SOURCE = new URL('../../lexical-engine.js', import.meta.url)

const CASES = [
  { key: 'algures', definition: "Advérbio de lugar: 'em algum lugar', 'em alguma parte'. Indica um lugar que não se sabe ou não se quer nomear diretamente; em sentido estrito, refere-se ao espaço, não ao tempo." },
  { key: 'outrora', definition: "Advérbio de tempo: 'noutro tempo', 'antigamente', 'em tempos passados'. Situa algo em período anterior, sem exigir data precisa; pode produzir tom retrospectivo ou historicizante." },
] as const

for (const lexicalCase of CASES) {
  test(`E2 mantém uma única declaração ativa de ${lexicalCase.key}`, () => {
    const content = readFileSync(SOURCE, 'utf8')
    const declarations = content
      .split('\n')
      .filter((line) => line.trimStart().startsWith(`"${lexicalCase.key}":`))

    expect(declarations, SOURCE.pathname).toHaveLength(1)
    expect(declarations[0]).toContain(JSON.stringify(lexicalCase.definition))
  })
}
