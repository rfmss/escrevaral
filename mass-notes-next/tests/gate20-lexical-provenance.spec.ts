import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const adapterUrl = new URL('../src/engines/lexicalAdapter.ts', import.meta.url)
const corpusUrl = new URL('../src/engines/curatedSynonymCorpus.ts', import.meta.url)

test('Palavras não carrega o corpus legado derivado de obra de referência', async () => {
  const adapter = await readFile(adapterUrl, 'utf8')
  expect(adapter).not.toContain('synonym-data.js')
  expect(adapter).not.toContain('getSynonyms')
  expect(adapter).not.toContain('SINONIMOS')
  expect(adapter).toContain('getCuratedSynonyms')
})

test('corpus distribuído pela casa nova é autoral e não carrega atribuição de extração', async () => {
  const corpus = await readFile(corpusUrl, 'utf8')
  expect(corpus).toContain('Corpus autoral do Escrevaral')
  expect(corpus).not.toMatch(/Nascentes|Dicionário de Sinônimos|extraído do|transcrito de/i)
})
