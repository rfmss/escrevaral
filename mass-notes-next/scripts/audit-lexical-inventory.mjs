#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const norm = (v) => String(v ?? '').normalize('NFD').replace(/\p{M}+/gu, '').toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ')
const uniq = (xs) => new Set(xs.map(norm).filter(Boolean)).size

function args() {
  const out = { json: resolve(process.cwd(), 'e2-lexical-inventory.json'), md: resolve(process.cwd(), 'e2-lexical-inventory.md') }
  for (let i = 2; i < process.argv.length; i += 1) {
    if (process.argv[i] === '--json') out.json = resolve(process.cwd(), process.argv[++i])
    else if (process.argv[i] === '--markdown') out.md = resolve(process.cwd(), process.argv[++i])
    else throw new Error(`Argumento desconhecido: ${process.argv[i]}`)
  }
  return out
}

function groups(xs, normalizer = norm) {
  const map = new Map()
  for (const value of xs) {
    const key = normalizer(value)
    if (!key) continue
    map.set(key, [...(map.get(key) ?? []), value])
  }
  return [...map.entries()].filter(([, values]) => values.length > 1).map(([key, values]) => ({ key, values }))
}

function block(source, name) {
  const match = new RegExp(`\\bconst\\s+${name}\\s*=\\s*\\{`).exec(source)
  if (!match) throw new Error(`Bloco ${name} não encontrado`)
  const open = source.indexOf('{', match.index)
  let depth = 0, quote = '', escaped = false, line = false, comment = false
  for (let i = open; i < source.length; i += 1) {
    const c = source[i], n = source[i + 1]
    if (line) { if (c === '\n') line = false; continue }
    if (comment) { if (c === '*' && n === '/') { comment = false; i += 1 }; continue }
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue }
    if (c === '/' && n === '/') { line = true; i += 1; continue }
    if (c === '/' && n === '*') { comment = true; i += 1; continue }
    if ('"\'`'.includes(c)) { quote = c; continue }
    if (c === '{') depth += 1
    if (c === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  throw new Error(`Bloco ${name} não fechado`)
}

function rawKeys(source, name) {
  const found = []
  for (const match of block(source, name).matchAll(/^\s*"((?:\\.|[^"\\])+)"\s*:/gm)) {
    try { found.push(JSON.parse(`"${match[1]}"`)) } catch { found.push(match[1]) }
  }
  return found
}

function exposeLexical(source, lexical, norma) {
  const marker = /\}\)\(window\);\s*$/
  if (!marker.test(source)) throw new Error('Fechamento do lexical-engine.js não encontrado')
  const code = source.replace(marker, '\n  global.__E2__ = { DEFINICOES, POLISSEMIA, ALTERNATIVAS, LOCUCOES };\n})(window);\n')
  const box = { console, setTimeout, clearTimeout }
  box.window = box
  box.globalThis = box
  box.fetch = async (input) => ({ json: async () => String(input).includes('lexical-data') ? lexical : norma })
  vm.runInNewContext(code, box, { filename: 'lexical-engine.js', timeout: 10000 })
  if (!box.__E2__) throw new Error('Instrumentação lexical não expôs os dados')
  return box.__E2__
}

function exposeSynonyms(source) {
  const box = { console }
  box.window = box
  box.globalThis = box
  vm.runInNewContext(source, box, { filename: 'synonym-data.js', timeout: 10000 })
  if (!box.SINONIMOS) throw new Error('synonym-data.js não expôs SINONIMOS')
  return box.SINONIMOS
}

function arrayMetric(value) {
  const items = Array.isArray(value) ? value.map(String) : []
  return { raw: items.length, uniqueExact: new Set(items).size, uniqueNormalized: uniq(items), duplicateNormalizedGroups: groups(items).length }
}

function definitions(data, source) {
  const entries = Object.entries(data)
  const declared = rawKeys(source, 'DEFINICOES')
  const texts = entries.map(([, value]) => String(value).trim())
  return {
    rawDeclarations: declared.length,
    effectiveEntries: entries.length,
    uniqueNormalizedKeys: uniq(entries.map(([key]) => key)),
    overwrittenDuplicateDeclarations: groups(declared, String),
    empty: entries.filter(([, value]) => !String(value).trim()).map(([key]) => key),
    under80Chars: entries.filter(([, value]) => String(value).trim().length < 80).map(([key]) => key),
    duplicateTexts: groups(texts).slice(0, 50),
    technicalAliasKeys: entries.map(([key]) => key).filter((key) => /\d+$/.test(key)),
    averageCharacters: entries.length ? Math.round(texts.reduce((sum, value) => sum + value.length, 0) / entries.length) : 0,
  }
}

function synonyms(data, source) {
  const entries = Object.entries(data)
  const declared = rawKeys(source, 'SINONIMOS')
  const pairs = [], selfReferences = [], repeatedWithinEntry = []
  for (const [key, values] of entries) {
    const list = Array.isArray(values) ? values.map(String) : []
    const repeated = groups(list)
    if (repeated.length) repeatedWithinEntry.push({ key, groups: repeated })
    for (const value of list) {
      pairs.push(`${norm(key)}→${norm(value)}`)
      if (norm(key) === norm(value)) selfReferences.push({ key, value })
    }
  }
  return {
    rawDeclarations: declared.length,
    effectiveEntries: entries.length,
    uniqueNormalizedKeys: uniq(entries.map(([key]) => key)),
    overwrittenDuplicateDeclarations: groups(declared, String),
    alternativesRaw: entries.reduce((sum, [, values]) => sum + (Array.isArray(values) ? values.length : 0), 0),
    directedPairsUniqueNormalized: new Set(pairs).size,
    selfReferences,
    repeatedWithinEntry: repeatedWithinEntry.slice(0, 100),
    emptyEntries: entries.filter(([, values]) => !Array.isArray(values) || !values.length).map(([key]) => key),
  }
}

function contextMetric(data) {
  const entries = Array.isArray(data.entries) ? data.entries : []
  return {
    categories: Object.keys(data.categories ?? {}).length,
    entries: entries.length,
    uniqueNormalizedAvoidTerms: uniq(entries.map((entry) => entry?.avoid)),
    contextualEntries: entries.filter((entry) => entry?.contextual === true).length,
    completeEntries: entries.filter((entry) => entry?.avoid && entry?.category && entry?.reason && Array.isArray(entry?.alternatives) && entry.alternatives.length).length,
    alternativesRaw: entries.reduce((sum, entry) => sum + (Array.isArray(entry?.alternatives) ? entry.alternatives.length : 0), 0),
  }
}

function findings(inv) {
  const out = [], add = (severity, code, summary, examples) => out.push({ severity, code, summary, count: examples.length, examples: examples.slice(0, 20) })
  const d = inv.lexical.definitions, s = inv.lexical.synonyms, p = inv.lexical.polysemy
  if (d.overwrittenDuplicateDeclarations.length) add('P0', 'definitions.duplicate-raw-key', 'Chaves de definição repetidas são sobrescritas silenciosamente.', d.overwrittenDuplicateDeclarations)
  if (s.overwrittenDuplicateDeclarations.length) add('P0', 'synonyms.duplicate-raw-key', 'Chaves de sinônimos repetidas são sobrescritas silenciosamente.', s.overwrittenDuplicateDeclarations)
  if (s.selfReferences.length) add('P1', 'synonyms.self-reference', 'Sinônimos apontam para a própria entrada após normalização.', s.selfReferences)
  if (d.technicalAliasKeys.length) add('P1', 'definitions.technical-alias', 'Aliases técnicos com sufixo numérico aparecem como verbetes.', d.technicalAliasKeys)
  if (d.under80Chars.length) add('P2', 'definitions.short', 'Definições curtas são candidatas a revisão humana, não erros automáticos.', d.under80Chars)
  if (d.duplicateTexts.length) add('P2', 'definitions.duplicate-text', 'Textos de definição equivalentes aparecem em mais de uma chave.', d.duplicateTexts)
  if (p.rulesWithoutAlternativeCard.length) add('P2', 'polysemy.without-alternatives', 'Regras de polissemia não têm cartão explícito de alternativas.', p.rulesWithoutAlternativeCard)
  if (inv.context.completeEntries < inv.context.entries) add('P1', 'context.incomplete', 'Entradas contextuais estão incompletas.', Array(inv.context.entries - inv.context.completeEntries).fill('entrada'))
  return out
}

function report(inv) {
  const b = inv.declaredBaseline, d = inv.lexical.definitions, s = inv.lexical.synonyms, p = inv.lexical.polysemy
  const lines = [
    '# M1 E2 — Inventário lexical reproduzível', '', `Data: ${inv.date}`, '',
    '## Contagens efetivas', '', '| Área | Declarado | Medido |', '|---|---:|---:|',
    `| Entradas de sinônimos | ~${b.synonymEntries} | ${s.effectiveEntries} |`,
    `| Definições | ${b.definitions}+ | ${d.effectiveEntries} |`,
    `| Regras de polissemia | ${b.polysemyRules}+ | ${p.effectiveRules} |`,
    `| Entradas contextuais | ${b.contextEntries}+ | ${inv.context.entries} |`,
    `| Formas regulares no presente | ${b.presentVerbForms} | ${inv.morphology.verbos_pres_reg.raw} |`, '',
    '## Cobertura complementar', '',
    `- sinônimos: ${s.alternativesRaw} alternativas brutas e ${s.directedPairsUniqueNormalized} pares normalizados;`,
    `- definições: ${d.rawDeclarations} declarações e média de ${d.averageCharacters} caracteres;`,
    `- polissemia: ${p.alternativeCards} cartões de alternativas;`,
    `- léxico editorial local: ${inv.lexical.localLexicon.entries} entradas, ${inv.lexical.localLexicon.completeEntries} completas;`,
    `- locuções: ${inv.lexical.locutions.rawExpressions} brutas, ${inv.lexical.locutions.uniqueNormalizedExpressions} únicas;`,
    `- RimaLab: ${inv.rimaLab.encyclopediaEntries} itens de enciclopédia e ${inv.rimaLab.grammarWords} palavras gramaticais.`, '',
    '## Achados mecânicos', '',
  ]
  for (const item of inv.findings) lines.push(`- **${item.severity} — ${item.code}:** ${item.summary} (${item.count})`)
  lines.push('', '## Limites', '', '- Contagem não prova correção ou utilidade.', '- Comprimento de definição é apenas sinal de triagem.', '- A medição não autoriza expansão nem superioridade global.', '')
  return lines.join('\n')
}

async function main() {
  const out = args()
  const loadJson = (name) => readFile(resolve(ROOT, name), 'utf8').then(JSON.parse)
  const [lexical, norma, decolonial, rima, lexicalSource, synonymSource] = await Promise.all([
    loadJson('lexical-data.json'), loadJson('norma-data.json'), loadJson('decolonial-data.json'), loadJson('rimalab-data.json'),
    readFile(resolve(ROOT, 'lexical-engine.js'), 'utf8'), readFile(resolve(ROOT, 'js/data/synonym-data.js'), 'utf8'),
  ])
  const exposed = exposeLexical(lexicalSource, lexical, norma), syn = exposeSynonyms(synonymSource)
  const localEntries = Object.entries(lexical.localLexicon ?? {}), required = ['label', 'className', 'field', 'note']
  const locutions = Object.values(exposed.LOCUCOES).flatMap((value) => Array.isArray(value) ? value : []).map((item) => item?.loc).filter(Boolean)
  const functionCategories = Object.fromEntries(Object.entries(lexical.functionWords ?? {}).map(([key, value]) => [key, arrayMetric(value)]))
  const polyKeys = Object.keys(exposed.POLISSEMIA), altKeys = Object.keys(exposed.ALTERNATIVAS), altSet = new Set(altKeys.map(norm)), polySet = new Set(polyKeys.map(norm))
  const inv = {
    schema: 'escrevaral.m1-e2.lexical-inventory', version: 1, date: new Date().toISOString().slice(0, 10),
    declaredBaseline: { synonymEntries: 1350, definitions: 1020, polysemyRules: 110, contextEntries: 600, presentVerbForms: 2045 },
    lexical: {
      synonyms: synonyms(syn, synonymSource), definitions: definitions(exposed.DEFINICOES, lexicalSource),
      polysemy: { effectiveRules: polyKeys.length, uniqueNormalizedKeys: uniq(polyKeys), alternativeCards: altKeys.length, rulesWithoutAlternativeCard: polyKeys.filter((key) => !altSet.has(norm(key))), alternativeCardsWithoutRule: altKeys.filter((key) => !polySet.has(norm(key))) },
      locutions: { rawExpressions: locutions.length, uniqueNormalizedExpressions: uniq(locutions), duplicateNormalizedGroups: groups(locutions) },
      localLexicon: { entries: localEntries.length, uniqueNormalizedKeys: uniq(localEntries.map(([key]) => key)), completeEntries: localEntries.filter(([, value]) => required.every((field) => String(value?.[field] ?? '').trim())).length },
      functionWords: { categories: functionCategories, rawTotal: Object.values(functionCategories).reduce((sum, item) => sum + item.raw, 0) },
    },
    morphology: Object.fromEntries(['verbos_pres_reg', 'formas_verbais_irr', 'adjetivos_comuns', 'substantivos_ia', '_particípios_irregulares_extra', 'verbos_ligacao_extra'].map((key) => [key, arrayMetric(norma[key])])),
    context: contextMetric(decolonial),
    rimaLab: { encyclopediaEntries: (rima.encyclopedia ?? []).length, completeEncyclopediaEntries: (rima.encyclopedia ?? []).filter((entry) => entry?.title && entry?.body && entry?.sample).length, grammarWords: Object.keys(rima.grammarWords ?? {}).length, grammarWordsUniqueNormalized: uniq(Object.keys(rima.grammarWords ?? {})) },
  }
  inv.findings = findings(inv)
  await mkdir(dirname(out.json), { recursive: true }); await mkdir(dirname(out.md), { recursive: true })
  await writeFile(out.json, `${JSON.stringify(inv, null, 2)}\n`); await writeFile(out.md, `${report(inv)}\n`)
  const counts = inv.findings.reduce((acc, item) => ({ ...acc, [item.severity]: (acc[item.severity] ?? 0) + 1 }), {})
  console.log(`E2_INVENTORY_JSON=${JSON.stringify({ synonymEntries: inv.lexical.synonyms.effectiveEntries, definitions: inv.lexical.definitions.effectiveEntries, polysemyRules: inv.lexical.polysemy.effectiveRules, contextEntries: inv.context.entries, presentVerbForms: inv.morphology.verbos_pres_reg.raw, findings: counts })}`)
  console.log(`Relatório JSON: ${out.json}`); console.log(`Relatório Markdown: ${out.md}`)
}

main().catch((error) => { console.error('[E2] Falha no inventário:', error); process.exitCode = 1 })
