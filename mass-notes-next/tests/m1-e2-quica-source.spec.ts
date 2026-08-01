import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const EXPECTED_LINE = `"quica":        "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",`

const SOURCES = [
  new URL('../../lexical-engine.js', import.meta.url),
  new URL('../src/engines/legacy/lexical-engine.js', import.meta.url),
]

test('E2 mantém uma única declaração idêntica de quica em cada fonte', () => {
  for (const source of SOURCES) {
    const content = readFileSync(source, 'utf8')
    const declarations = content
      .split('\n')
      .filter((line) => line.trimStart().startsWith('"quica":'))

    expect(declarations, source.pathname).toEqual([`    ${EXPECTED_LINE}`])
  }
})
