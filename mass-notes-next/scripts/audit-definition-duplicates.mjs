#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function parseArgs() {
  const result = {
    json: resolve(process.cwd(), 'e2-definition-duplicates.json'),
    markdown: resolve(process.cwd(), 'e2-definition-duplicates.md'),
  }
  for (let index = 2; index < process.argv.length; index += 1) {
    const item = process.argv[index]
    if (item === '--json') result.json = resolve(process.cwd(), process.argv[++index])
    else if (item === '--markdown') result.markdown = resolve(process.cwd(), process.argv[++index])
    else throw new Error(`Argumento desconhecido: ${item}`)
  }
  return result
}

function objectRange(source, name) {
  const declaration = new RegExp(`\\bconst\\s+${name}\\s*=\\s*\\{`).exec(source)
  if (!declaration) throw new Error(`Bloco ${name} não encontrado`)
  const open = source.indexOf('{', declaration.index)
  let depth = 0
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = open; index < source.length; index += 1) {
    const current = source[index]
    const next = source[index + 1]
    if (lineComment) {
      if (current === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (current === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (escaped) escaped = false
      else if (current === '\\') escaped = true
      else if (current === quote) quote = ''
      continue
    }
    if (current === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (current === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    if ('"\'`'.includes(current)) {
      quote = current
      continue
    }
    if (current === '{') depth += 1
    if (current === '}' && --depth === 0) return { start: open + 1, end: index }
  }
  throw new Error(`Bloco ${name} não fechado`)
}

function decode(raw) {
  try {
    return JSON.parse(`"${raw}"`)
  } catch {
    return raw
  }
}

function normalizedText(value) {
  return String(value)
    .normalize('NFC')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim()
}

function preview(value, limit = 180) {
  const clean = String(value).replace(/\s+/g, ' ').trim()
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1)}…`
}

function parseDefinitions(source) {
  const range = objectRange(source, 'DEFINICOES')
  const body = source.slice(range.start, range.end)
  const keyPattern = /^\s*"((?:\\.|[^"\\])+)"\s*:/gm
  const entryPattern = /^\s*"((?:\\.|[^"\\])+)"\s*:\s*"((?:\\.|[^"\\])*)"\s*,?\s*(?:\/\/.*)?$/gm
  const rawKeyCount = [...body.matchAll(keyPattern)].length
  const entries = []

  for (const match of body.matchAll(entryPattern)) {
    const absoluteIndex = range.start + match.index
    entries.push({
      key: decode(match[1]),
      value: decode(match[2]),
      line: source.slice(0, absoluteIndex).split('\n').length,
    })
  }

  if (entries.length !== rawKeyCount) {
    throw new Error(`Parser de DEFINICOES leu ${entries.length}/${rawKeyCount} propriedades; medição recusada.`)
  }
  return entries
}

function classify(entries) {
  const grouped = new Map()
  for (const entry of entries) grouped.set(entry.key, [...(grouped.get(entry.key) ?? []), entry])

  const duplicateGroups = []
  for (const [key, occurrences] of grouped) {
    if (occurrences.length < 2) continue
    const exactTexts = new Set(occurrences.map((item) => item.value))
    const normalizedTexts = new Set(occurrences.map((item) => normalizedText(item.value)))
    const classification = exactTexts.size === 1
      ? 'identica'
      : normalizedTexts.size === 1
        ? 'equivalente-normalizada'
        : 'conflitante'
    const retained = occurrences.at(-1)
    duplicateGroups.push({
      key,
      classification,
      occurrences: occurrences.map((item, index) => ({
        line: item.line,
        retained: index === occurrences.length - 1,
        characters: item.value.length,
        text: item.value,
        preview: preview(item.value),
      })),
      discardedDeclarations: occurrences.length - 1,
      retainedLine: retained.line,
      retainedText: retained.value,
    })
  }

  const counts = {
    rawDeclarations: entries.length,
    effectiveKeys: new Set(entries.map((item) => item.key)).size,
    duplicateGroups: duplicateGroups.length,
    overwrittenDeclarations: duplicateGroups.reduce((sum, item) => sum + item.discardedDeclarations, 0),
    identicalGroups: duplicateGroups.filter((item) => item.classification === 'identica').length,
    normalizedEquivalentGroups: duplicateGroups.filter((item) => item.classification === 'equivalente-normalizada').length,
    conflictingGroups: duplicateGroups.filter((item) => item.classification === 'conflitante').length,
  }
  return { counts, duplicateGroups }
}

function markdown(result) {
  const { counts, duplicateGroups } = result
  const lines = [
    '# M1 E2 — Duplicatas de definições',
    '',
    `Data: ${result.date}`,
    '',
    '## Resumo',
    '',
    `- declarações brutas: ${counts.rawDeclarations};`,
    `- chaves efetivas: ${counts.effectiveKeys};`,
    `- grupos repetidos: ${counts.duplicateGroups};`,
    `- declarações sobrescritas: ${counts.overwrittenDeclarations};`,
    `- grupos idênticos: ${counts.identicalGroups};`,
    `- grupos equivalentes após normalização: ${counts.normalizedEquivalentGroups};`,
    `- grupos conflitantes: ${counts.conflictingGroups}.`,
    '',
    '## Ordem de revisão',
    '',
    'As ocorrências estão na ordem do arquivo. A última é a definição efetivamente retida pelo JavaScript.',
    '',
  ]

  const order = ['conflitante', 'equivalente-normalizada', 'identica']
  for (const classification of order) {
    const items = duplicateGroups.filter((item) => item.classification === classification)
    if (!items.length) continue
    lines.push(`## ${classification}`, '')
    for (const item of items) {
      lines.push(`### \`${item.key}\``, '')
      for (const occurrence of item.occurrences) {
        lines.push(`- linha ${occurrence.line}${occurrence.retained ? ' — **retida**' : ' — descartada'}: ${occurrence.preview}`)
      }
      lines.push('')
    }
  }

  lines.push('## Limite', '', 'O relatório não escolhe automaticamente qual redação é melhor. Conflitos exigem revisão linguística humana antes da consolidação.', '')
  return lines.join('\n')
}

async function main() {
  const output = parseArgs()
  const source = await readFile(resolve(ROOT, 'lexical-engine.js'), 'utf8')
  const result = {
    schema: 'escrevaral.m1-e2.definition-duplicates',
    version: 1,
    date: new Date().toISOString().slice(0, 10),
    ...classify(parseDefinitions(source)),
  }
  await mkdir(dirname(output.json), { recursive: true })
  await mkdir(dirname(output.markdown), { recursive: true })
  await writeFile(output.json, `${JSON.stringify(result, null, 2)}\n`)
  await writeFile(output.markdown, `${markdown(result)}\n`)
  console.log(`E2_DEFINITION_DUPLICATES_JSON=${JSON.stringify(result.counts)}`)
  console.log(`Relatório JSON: ${output.json}`)
  console.log(`Relatório Markdown: ${output.markdown}`)
}

main().catch((error) => {
  console.error('[E2] Falha na classificação de definições duplicadas:', error)
  process.exitCode = 1
})
