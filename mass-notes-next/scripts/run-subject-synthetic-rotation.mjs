import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  buildBlindCase,
  buildMessages,
  computePanelDecision,
  computePanelMetrics,
  validateAnnotation,
} from './annotate-subject-synthetic.mjs'

const DEFAULT_PANEL_CONFIG = new URL('../docs/linguistics/synthetic/m1-r0-synthetic-panel.json', import.meta.url)
const DEFAULT_MODEL_REGISTRY = new URL('../docs/linguistics/synthetic/m1-r0-model-candidates.json', import.meta.url)

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

function sha256Buffer(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sha256File(pathValue) {
  return sha256Buffer(readFileSync(pathValue))
}

function loadJson(pathValue) {
  return JSON.parse(readFileSync(pathValue, 'utf8'))
}

function loadCases(inputPath) {
  const data = loadJson(inputPath)
  if (Array.isArray(data)) return data
  if (Array.isArray(data.candidates)) return data.candidates
  if (Array.isArray(data.cases)) return data.cases
  throw new Error('Entrada deve ser array, objeto com candidates ou objeto com cases.')
}

export function resolveRotation(panelConfig, registry, rotationId) {
  const rotation = registry.rotations.find((item) => item.id === rotationId)
  if (!rotation) throw new Error(`Rotação inexistente: ${rotationId}`)
  const candidateById = new Map(registry.candidates.map((candidate) => [candidate.id, candidate]))
  const assignments = panelConfig.profiles.map((profile) => {
    const candidateId = rotation.assignments[profile.id]
    const candidate = candidateById.get(candidateId)
    if (!candidate) throw new Error(`Rotação ${rotationId} não resolve modelo para ${profile.id}.`)
    return { profile, candidate }
  })
  if (new Set(assignments.map((item) => item.candidate.id)).size !== assignments.length) {
    throw new Error(`Rotação ${rotationId} repete família/modelo dentro da mesma rodada.`)
  }
  return { rotation, assignments }
}

export function annotationJsonSchema(panelConfig) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      label: { type: 'string', enum: panelConfig.labels.map((item) => item.id) },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      recoveryScope: { type: 'string', enum: panelConfig.recoveryScopes },
      referent: { anyOf: [{ type: 'string', maxLength: 240 }, { type: 'null' }] },
      rationale: { type: 'string', minLength: 1, maxLength: 600 },
      flags: { type: 'array', maxItems: 12, items: { type: 'string' } },
    },
    required: ['label', 'confidence', 'recoveryScope', 'referent', 'rationale', 'flags'],
  }
}

function extractJson(raw) {
  const trimmed = String(raw ?? '').trim().replace(/^```(?:json)?\s*/iu, '').replace(/\s*```$/u, '')
  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first === -1 || last < first) throw new Error('Resposta sem objeto JSON.')
  return JSON.parse(trimmed.slice(first, last + 1))
}

async function fetchInstalledModels(baseUrl) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/tags`)
  if (!response.ok) throw new Error(`Ollama /api/tags respondeu ${response.status}.`)
  const data = await response.json()
  if (!Array.isArray(data.models)) throw new Error('Resposta de /api/tags sem models[].')
  return data.models
}

function findInstalledModel(models, tag) {
  return models.find((item) => item.name === tag || item.model === tag) ?? null
}

export function verifyInstalledModels(assignments, installedModels) {
  return assignments.map(({ profile, candidate }) => {
    const local = findInstalledModel(installedModels, candidate.ollama.tag)
    if (!local) {
      throw new Error(`Modelo ausente: ${candidate.ollama.tag}. Instale conscientemente com: ollama pull ${candidate.ollama.tag}`)
    }
    if (candidate.ollama.publishedDigestPrefix && !String(local.digest ?? '').startsWith(candidate.ollama.publishedDigestPrefix)) {
      throw new Error(`Digest local de ${candidate.ollama.tag} diverge do registro publicado; revise o candidato antes de executar.`)
    }
    return {
      annotatorId: profile.id,
      candidateModelId: candidate.id,
      tag: candidate.ollama.tag,
      digest: local.digest ?? null,
      sizeBytes: local.size ?? null,
      details: local.details ?? null,
    }
  })
}

async function callOllama({ baseUrl, model, messages, schema, temperature, seed, keepAlive }) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      think: false,
      format: schema,
      keep_alive: keepAlive,
      options: { temperature, seed },
    }),
  })
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status} para ${model}.`)
  const data = await response.json()
  return {
    raw: data?.message?.content,
    timing: {
      totalDurationNs: data?.total_duration ?? null,
      loadDurationNs: data?.load_duration ?? null,
      promptEvalCount: data?.prompt_eval_count ?? null,
      evalCount: data?.eval_count ?? null,
    },
  }
}

function printHelp() {
  console.log(`Uso:\n  node scripts/run-subject-synthetic-rotation.mjs \\\n    --input /fora/do/repo/pacote.json \\\n    --output /fora/do/repo/round-a.json \\\n    --rotation round-a|round-b|round-c \\\n    [--limit 4] \\\n    [--base-url http://127.0.0.1:11434] \\\n    [--panel-config caminho.json] \\\n    [--model-registry caminho.json] \\\n    [--dry-run]\n\nA v2 aceita apenas Ollama local. Entrada e saída observadas permanecem fora do repositório.`)
}

async function main() {
  if (process.argv.includes('--help')) return printHelp()
  const args = parseArgs(process.argv.slice(2))
  const panelPath = resolve(args['panel-config'] ?? DEFAULT_PANEL_CONFIG.pathname)
  const registryPath = resolve(args['model-registry'] ?? DEFAULT_MODEL_REGISTRY.pathname)
  const panelConfig = loadJson(panelPath)
  const registry = loadJson(registryPath)
  const inputPath = args.input ? assertOutsideRepository(args.input, 'A entrada privada') : null
  if (!inputPath) throw new Error('--input é obrigatório.')
  const rotationId = args.rotation
  if (!rotationId) throw new Error('--rotation é obrigatório.')
  const { rotation, assignments } = resolveRotation(panelConfig, registry, rotationId)

  if (registry.executionPolicy.provider !== 'ollama') throw new Error('Registro v1 deve usar provider ollama.')
  if (registry.selectionPolicy.remoteExecutionAllowedInThisPlan !== false) throw new Error('A tranche v1 deve bloquear execução remota.')
  const baseUrl = args['base-url'] ?? registry.executionPolicy.baseUrl
  if (!isLoopback(baseUrl)) throw new Error('A v2 permite apenas endpoint Ollama local em loopback.')

  const cases = loadCases(inputPath)
  if (cases.length === 0) throw new Error('Pacote de entrada vazio: nenhum caso para anotar.')
  const limit = args.limit ? Number(args.limit) : cases.length
  if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit deve ser inteiro positivo.')
  const selected = cases.slice(0, limit)
  const prepared = selected.map((candidate) => ({ blindCase: buildBlindCase(candidate), judgments: [] }))
  const schema = annotationJsonSchema(panelConfig)

  if (asBoolean(args['dry-run'])) {
    const firstBlind = prepared[0].blindCase
    console.log(JSON.stringify({
      registryId: registry.id,
      rotationId: rotation.id,
      provider: 'ollama',
      baseUrl,
      inputSha256: sha256File(inputPath),
      selectedCases: selected.length,
      assignments: assignments.map(({ profile, candidate }) => ({
        annotatorId: profile.id,
        candidateModelId: candidate.id,
        model: candidate.ollama.tag,
        seedForFirstCase: registry.executionPolicy.seedBaseByProfile[profile.id],
        temperature: profile.temperature,
        messages: buildMessages(profile, firstBlind, panelConfig),
      })),
      schema,
    }, null, 2))
    return
  }

  if (!args.output) throw new Error('--output é obrigatório fora do dry-run.')
  const outputPath = assertOutsideRepository(args.output, 'A saída privada')
  const installedModels = await fetchInstalledModels(baseUrl)
  const modelSnapshots = verifyInstalledModels(assignments, installedModels)
  const snapshotByCandidateId = new Map(modelSnapshots.map((item) => [item.candidateModelId, item]))

  // Ordem deliberadamente profile/model-major: mantém um conjunto de pesos ativo por lote,
  // reduz trocas de memória e separa efeito do perfil do efeito da família de pesos.
  for (const { profile, candidate } of assignments) {
    const snapshot = snapshotByCandidateId.get(candidate.id)
    const seedBase = registry.executionPolicy.seedBaseByProfile[profile.id]
    if (!Number.isInteger(seedBase)) throw new Error(`Seed-base ausente para ${profile.id}.`)

    for (let caseIndex = 0; caseIndex < prepared.length; caseIndex += 1) {
      const item = prepared[caseIndex]
      const seed = seedBase + caseIndex
      const isLastForProfile = caseIndex === prepared.length - 1
      try {
        const response = await callOllama({
          baseUrl,
          model: candidate.ollama.tag,
          messages: buildMessages(profile, item.blindCase, panelConfig),
          schema,
          temperature: profile.temperature,
          seed,
          keepAlive: isLastForProfile && registry.executionPolicy.unloadAfterProfile
            ? 0
            : registry.executionPolicy.keepAliveDuringProfile,
        })
        item.judgments.push({
          annotatorId: profile.id,
          candidateModelId: candidate.id,
          model: candidate.ollama.tag,
          modelDigest: snapshot.digest,
          seed,
          temperature: profile.temperature,
          annotation: validateAnnotation(extractJson(response.raw)),
          timing: response.timing,
          error: null,
        })
      } catch (error) {
        item.judgments.push({
          annotatorId: profile.id,
          candidateModelId: candidate.id,
          model: candidate.ollama.tag,
          modelDigest: snapshot.digest,
          seed,
          temperature: profile.temperature,
          annotation: null,
          timing: null,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  const annotatedCases = prepared.map((item) => ({
    blindId: item.blindCase.blindId,
    judgments: item.judgments,
    decision: computePanelDecision(item.judgments, panelConfig.consensus),
  }))
  const profileIds = panelConfig.profiles.map((profile) => profile.id)
  const report = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    purpose: panelConfig.purpose,
    panelConfigId: panelConfig.id,
    panelConfigSha256: sha256File(panelPath),
    modelRegistryId: registry.id,
    modelRegistrySha256: sha256File(registryPath),
    rotationId: rotation.id,
    inputPackage: {
      sha256: sha256File(inputPath),
      totalCases: cases.length,
      processedCases: annotatedCases.length,
    },
    runtime: {
      provider: 'ollama',
      baseUrl,
      localOnly: true,
      profileMajorOrder: true,
      structuredJsonSchema: true,
      models: modelSnapshots,
    },
    boundaries: panelConfig.boundaries,
    metrics: computePanelMetrics(annotatedCases, profileIds),
    cases: annotatedCases,
  }

  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  console.log(`Pré-banca sintética v2 criada: ${outputPath}`)
  console.log(`Rotação: ${rotation.id}`)
  console.log(`Pacote SHA-256: ${report.inputPackage.sha256}`)
  console.log(`Casos processados: ${annotatedCases.length}`)
  console.log(`Estáveis sintéticos: ${report.metrics.stateCounts.stable_synthetic ?? 0}`)
  console.log(`Provisórios sintéticos: ${report.metrics.stateCounts.provisional_synthetic ?? 0}`)
  console.log(`Escalados para revisão: ${report.metrics.stateCounts.needs_review ?? 0}`)
  console.log('Nenhum resultado conta como validação humana ou gold humano.')
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (executedDirectly) {
  main().catch((error) => {
    console.error(`[M1-R0 rotação sintética] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
