import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const EXPECTED_LINE = `"quica":        "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",`
const SOURCE = new URL('../../lexical-engine.js', import.meta.url)

test('E2 mantém uma única declaração de quica na fonte lexical', () => {
  const content = readFileSync(SOURCE, 'utf8')
  const declarations = content
    .split('\n')
    .filter((line) => line.trimStart().startsWith('"quica":'))

  expect(declarations, SOURCE.pathname).toEqual([`    ${EXPECTED_LINE}`])
})
