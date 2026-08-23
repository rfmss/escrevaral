import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

export const SYNTHETIC_LABELS = new Set([
  'subject_recoverable',
  'subject_indeterminate',
  'subject_ambiguous',
  'explicit_subject_control',
  'outside_initial_scope_or_annotation_issue',
])

export const RECOVERY_SCOPES = new Set([
  'same_sentence',
  'previous_sentence',
  'both',
  'none',
  'uncertain',
])

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!argument.startsWith('--')) throw new Error(`Argumento inesperado: ${argument}`)
    const key = argument.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) {
      values[key] = 'true'
      continue
    }
    values[key] = next
    index += 1
  }
  return values
}

function asBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 'yes'
}

function assertOutsideRepository(pathValue, label) {
  const cwd = resolve(process.cwd())
  const candidate = resolve(pathValue)
  if (candidate === cwd || candidate.startsWith(`${cwd}${sep}`)) {
    throw new Error(`${label} deve ficar fora do diretório do repositório: ${candidate}`)
  }
  return candidate
}

function isLoopback(baseUrl) {
  const hostname = new URL(baseUrl).hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function blindId(candidateId) {
  return createHash('sha256').update(String(candidateId)).digest('hex').slice(0, 16)
}

export function buildBlindCase(candidate) {
  const sentence = candidate?.sentence?.text ?? candidate?.sentenceText ?? candidate?.text ?? null
  const previousContext = candidate?.previousContext?.text ?? candidate?.previousContextText ?? null
  const targetForm = candidate?.target?.form ?? candidate?.targetForm ?? null
  if (!sentence || !targetForm) throw new Error('Caso sem sentença ou forma-alvo.')

  return {
    blindId: blindId(candidate.candidateId ?? `${previousContext ?? ''}\n${sentence}\n${targetForm}`),
    previousContext,
    sentence,
    targetForm,
  }
}

function labelsForPrompt(config) {
  return config.labels.map((item) => `- ${item.id}: ${item.definition}`).join('\n')
}

export function buildMessages(profile, blindCase, config) {
  const system = [
    'Você é uma anotadora sintética de pesquisa linguística do Escrevaral.',
    'Você NÃO é uma pessoa humana, não produz gold humano e não substitui validação independente.',
    'Julgue somente o texto fornecido. Não use relações UD, split de corpus, baldes estruturais ou conhecimento do manifesto de seleção.',
    'A fronteira é terceira pessoa do plural, distinguindo sujeito recuperável pelo contexto de sujeito indeterminado.',
    'Ambiguidade honesta é preferível a certeza inventada.',
    profile.instruction,
    '',
    'Rótulos permitidos:',
    labelsForPrompt(config),
    '',
    `Escopos de recuperação permitidos: ${config.recoveryScopes.join(', ')}.`,
    'Responda APENAS com JSON válido, sem markdown, no formato:',
    '{"label":"...","confidence":0.0,"recoveryScope":"...","referent":null,"rationale":"...","flags":[]}',
    'confidence deve estar entre 0 e 1; rationale deve ser curta; referent deve ser null quando não houver referente recuperável seguro.',
  ].join('\n')

  const user = [
    `ID cego: ${blindCase.blindId}`,
    `Contexto anterior: ${blindCase.previousContext ?? '[não fornecido]'}`,
    `Sentença-alvo: ${blindCase.sentence}`,
    `Forma verbal-alvo: ${blindCase.targetForm}`,
  ].join('\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function extractJson(raw) {
  const trimmed = String(raw ?? '').trim().replace(/^```(?:json)?\s*/iu, '').replace(/\s*```$/u, '')
  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first === -1 || last < first) throw new Error('Resposta sem objeto JSON.')
  return JSON.parse(trimmed.slice(first, last + 1))
}

export function validateAnnotation(value) {
  if (!value || typeof value !== 'object') throw new Error('Anotação não é objeto.')
  if (!SYNTHETIC_LABELS.has(value.label)) throw new Error(`Rótulo inválido: ${value.label}`)
  if (!Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) {
    throw new Error('confidence deve estar entre 0 e 1.')
  }
  if (!RECOVERY_SCOPES.has(value.recoveryScope)) throw new Error(`recoveryScope inválido: ${value.recoveryScope}`)
  if (!(value.referent === null || typeof value.referent === 'string')) throw new Error('referent deve ser string ou null.')
  if (typeof value.rationale !== 'string' || value.rationale.trim().length === 0) throw new Error('rationale é obrigatória.')
  if (value.rationale.length > 600) throw new Error('rationale excede 600 caracteres.')
  const flags = Array.isArray(value.flags) ? value.flags.map(String).slice(0, 12) : []

  return {
    label: value.label,
    confidence: Number(value.confidence),
    recoveryScope: value.recoveryScope,
    referent: value.referent === null ? null : value.referent.trim().slice(0, 240),
    rationale: value.rationale.trim(),
    flags,
  }
}

async function callOllama({ baseUrl, model, messages, temperature }) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, format: 'json', options: { temperature } }),
  })
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}.`)
  const data = await response.json()
  return data?.message?.content
}

async function callOpenAICompatible({ baseUrl, model, messages, temperature, apiKey }) {
  const headers = { 'content-type': 'application/json' }
  if (apiKey) headers.authorization = `Bearer ${apiKey}`
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, temperature, response_format: { type: 'json_object' } }),
  })
  if (!response.ok) throw new Error(`Endpoint OpenAI-compatible respondeu ${response.status}; confirme suporte a response_format=json_object.`)
  const data = await response.json()
  return data?.choices?.[0]?.message?.content
}

async function callModel(runtime, profile, messages) {
  const model = profile.model ?? runtime.model
  if (!model) throw new Error(`Modelo não definido para ${profile.id}.`)
  if (runtime.provider === 'ollama') return { model, raw: await callOllama({ ...runtime, model, messages, temperature: profile.temperature ?? 0.1 }) }
  if (runtime.provider === 'openai-compatible') return { model, raw: await callOpenAICompatible({ ...runtime, model, messages, temperature: profile.temperature ?? 0.1 }) }
  throw new Error(`Provider não suportado: ${runtime.provider}`)
}

export function computePanelDecision(judgments, consensusConfig) {
  const valid = judgments.filter((item) => item.annotation && !item.error)
  if (valid.length !== judgments.length || valid.length === 0) {
    return { state: 'needs_review', label: null, unanimous: false, majorityCount: 0, meanConfidence: null, minimumConfidence: null }
  }

  const counts = new Map()
  for (const item of valid) counts.set(item.annotation.label, (counts.get(item.annotation.label) ?? 0) + 1)
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const [topLabel, topCount] = ranked[0]
  const tied = ranked.length > 1 && ranked[1][1] === topCount
  const confidences = valid.map((item) => item.annotation.confidence)
  const unanimous = topCount === valid.length
  const meanConfidence = confidences.reduce((sum, value) => sum + value, 0) / confidences.length
  const minimumConfidence = Math.min(...confidences)

  if (unanimous && minimumConfidence >= consensusConfig.stableSynthetic.minimumConfidencePerAnnotator) {
    return { state: 'stable_synthetic', label: topLabel, unanimous, majorityCount: topCount, meanConfidence, minimumConfidence }
  }
  if (!tied && topCount >= consensusConfig.provisionalSynthetic.minimumMajority && meanConfidence >= consensusConfig.provisionalSynthetic.minimumMeanConfidence) {
    return { state: 'provisional_synthetic', label: topLabel, unanimous, majorityCount: topCount, meanConfidence, minimumConfidence }
  }
  return { state: 'needs_review', label: tied ? null : topLabel, unanimous, majorityCount: topCount, meanConfidence, minimumConfidence }
}

function confusionForPair(cases, leftId, rightId) {
  const matrix = {}
  let compared = 0
  let agreements = 0
  const leftCounts = {}
  const rightCounts = {}

  for (const item of cases) {
    const left = item.judgments.find((entry) => entry.annotatorId === leftId)?.annotation?.label
    const right = item.judgments.find((entry) => entry.annotatorId === rightId)?.annotation?.label
    if (!left || !right) continue
    compared += 1
    if (left === right) agreements += 1
    leftCounts[left] = (leftCounts[left] ?? 0) + 1
    rightCounts[right] = (rightCounts[right] ?? 0) + 1
    matrix[left] ??= {}
    matrix[left][right] = (matrix[left][right] ?? 0) + 1
  }

  if (compared === 0) return { compared: 0, rawAgreement: null, kappa: null, confusion: matrix }
  const rawAgreement = agreements / compared
  let expected = 0
  for (const label of SYNTHETIC_LABELS) expected += ((leftCounts[label] ?? 0) / compared) * ((rightCounts[label] ?? 0) / compared)
  const kappa = expected === 1 ? null : (rawAgreement - expected) / (1 - expected)
  return { compared, rawAgreement, kappa, confusion: matrix }
}

export function computePanelMetrics(cases, profileIds) {
  const pairwise = []
  for (let left = 0; left < profileIds.length; left += 1) {
    for (let right = left + 1; right < profileIds.length; right += 1) {
      pairwise.push({ pair: [profileIds[left], profileIds[right]], ...confusionForPair(cases, profileIds[left], profileIds[right]) })
    }
  }
  const decisions = cases.map((item) => item.decision)
  const count = decisions.length
  const stateCounts = decisions.reduce((acc, item) => {
    acc[item.state] = (acc[item.state] ?? 0) + 1
    return acc
  }, {})
  return {
    cases: count,
    unanimousRate: count === 0 ? null : decisions.filter((item) => item.unanimous).length / count,
    stateCounts,
    pairwise,
  }
}

function loadCases(inputPath) {
  const data = JSON.parse(readFileSync(inputPath, 'utf8'))
  if (Array.isArray(data)) return data
  if (Array.isArray(data.candidates)) return data.candidates
  if (Array.isArray(data.cases)) return data.cases
  throw new Error('Entrada deve ser array, objeto com candidates ou objeto com cases.')
}

function printHelp() {
  console.log(`Uso:\n  node scripts/annotate-subject-synthetic.mjs \\\n    --input /fora/do/repo/pacote.json \\\n    --output /fora/do/repo/anotacoes.json \\\n    --provider ollama|openai-compatible \\\n    --model <modelo> \\\n    [--base-url http://127.0.0.1:11434] \\\n    [--api-key-env OPENAI_API_KEY] \\\n    [--allow-remote true] \\\n    [--limit 16] \\\n    [--dry-run]\n\nPor padrão, execução remota é bloqueada. O corpus e a saída permanecem fora do repositório.`)
}

async function main() {
  if (process.argv.includes('--help')) return printHelp()
  const args = parseArgs(process.argv.slice(2))
  const configPath = resolve(args.config ?? new URL('../docs/linguistics/synthetic/m1-r0-synthetic-panel.json', import.meta.url).pathname)
  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  const inputPath = args.input ? assertOutsideRepository(args.input, 'A entrada privada') : null
  if (!inputPath) throw new Error('--input é obrigatório.')
  const cases = loadCases(inputPath)
  if (cases.length === 0) throw new Error('Pacote de entrada vazio: nenhum caso para anotar.')
  const limit = args.limit ? Number(args.limit) : cases.length
  if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit deve ser inteiro positivo.')

  const runtime = {
    provider: args.provider ?? 'ollama',
    model: args.model ?? null,
    baseUrl: args['base-url'] ?? (args.provider === 'openai-compatible' ? 'http://127.0.0.1:8000' : 'http://127.0.0.1:11434'),
    apiKey: args['api-key-env'] ? process.env[args['api-key-env']] : null,
  }
  if (!isLoopback(runtime.baseUrl) && !asBoolean(args['allow-remote'])) throw new Error('Endpoint remoto bloqueado. Use --allow-remote true conscientemente.')

  const selected = cases.slice(0, limit)
  const firstBlind = buildBlindCase(selected[0])
  if (asBoolean(args['dry-run'])) {
    console.log(JSON.stringify({
      runtime: { provider: runtime.provider, model: runtime.model, baseUrl: runtime.baseUrl },
      blindCase: firstBlind,
      prompts: config.profiles.map((profile) => ({ annotatorId: profile.id, messages: buildMessages(profile, firstBlind, config) })),
    }, null, 2))
    return
  }

  if (!args.output) throw new Error('--output é obrigatório fora do dry-run.')
  const outputPath = assertOutsideRepository(args.output, 'A saída privada')
  const annotatedCases = []

  for (const candidate of selected) {
    const blindCase = buildBlindCase(candidate)
    const judgments = []
    for (const profile of config.profiles) {
      const messages = buildMessages(profile, blindCase, config)
      try {
        const { model, raw } = await callModel(runtime, profile, messages)
        const annotation = validateAnnotation(extractJson(raw))
        judgments.push({ annotatorId: profile.id, model, annotation, error: null })
      } catch (error) {
        judgments.push({ annotatorId: profile.id, model: profile.model ?? runtime.model, annotation: null, error: error instanceof Error ? error.message : String(error) })
      }
    }
    annotatedCases.push({
      candidateId: candidate.candidateId ?? null,
      blindId: blindCase.blindId,
      judgments,
      decision: computePanelDecision(judgments, config.consensus),
    })
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: config.purpose,
    configId: config.id,
    runtime: { provider: runtime.provider, defaultModel: runtime.model, baseUrl: runtime.baseUrl },
    boundaries: config.boundaries,
    counts: { inputCases: cases.length, processedCases: annotatedCases.length, annotatorsPerCase: config.profiles.length },
    metrics: computePanelMetrics(annotatedCases, config.profiles.map((profile) => profile.id)),
    cases: annotatedCases,
  }

  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  console.log(`Pré-banca sintética criada: ${outputPath}`)
  console.log(`Casos processados: ${annotatedCases.length}`)
  console.log(`Estáveis sintéticos: ${report.metrics.stateCounts.stable_synthetic ?? 0}`)
  console.log(`Provisórios sintéticos: ${report.metrics.stateCounts.provisional_synthetic ?? 0}`)
  console.log(`Escalados para revisão: ${report.metrics.stateCounts.needs_review ?? 0}`)
  console.log('Nenhum resultado conta como validação humana ou gold humano.')
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (executedDirectly) {
  main().catch((error) => {
    console.error(`[M1-R0 sintético] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
