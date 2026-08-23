import { expect, test } from '@playwright/test'
import { resolveContextualLexicalReading } from '../src/engines/contextualLexicalResolver'

test('locuções exigem a expressão exata no contexto', () => {
  expect(resolveContextualLexicalReading(
    'por enquanto',
    'Por enquanto, a janela permanece aberta.',
  )?.className).toBe('Locução adverbial')

  expect(resolveContextualLexicalReading(
    'enquanto isso',
    'Enquanto isso, a chuva engrossava.',
  )?.className).toBe('Locução adverbial')

  expect(resolveContextualLexicalReading(
    'por enquanto',
    'A janela permanece aberta durante a manhã.',
  )).toBeNull()
})

test('diacríticos não são descartados na decisão gramatical', () => {
  expect(resolveContextualLexicalReading(
    'publica',
    'A editora publica romances brasileiros.',
  )?.className).toMatch(/verbo/i)

  expect(resolveContextualLexicalReading(
    'pública',
    'A biblioteca pública fecha tarde.',
  )).toBeNull()
})

test('a regra de voz passiva não invade adjetivo nem substantivação', () => {
  expect(resolveContextualLexicalReading(
    'preso',
    'O suspeito foi preso ontem.',
  )?.className).toMatch(/particípio/i)

  expect(resolveContextualLexicalReading(
    'preso',
    'Ele ficou preso na sala.',
  )).toBeNull()

  expect(resolveContextualLexicalReading(
    'presos',
    'Os presos aguardavam no pátio.',
  )).toBeNull()
})

test('sujeito nominal com objeto explícito preserva a leitura verbal', () => {
  const larga = resolveContextualLexicalReading(
    'larga',
    'A menina larga a mochila quando chega em casa.',
  )
  expect(larga?.className).toMatch(/verbo/i)
  expect(larga?.note).toContain('complemento do verbo')

  const estreita = resolveContextualLexicalReading(
    'estreita',
    'O corredor estreita os olhos diante da luz forte.',
  )
  expect(estreita?.className).toMatch(/verbo/i)
  expect(estreita?.note).toContain('complemento do verbo')
})
