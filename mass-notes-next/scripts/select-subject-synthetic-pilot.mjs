import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_CONFIG = new URL('../docs/linguistics/synthetic/m1-r0-private-pilot-selection.json', import.meta.url)

function parseArgs(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!argument.startsWith('--')) throw new Error(`Argumento inesperado: ${argument}`)
    const key = argument.slice(2)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Valor ausente para --${key}.`)
    values[key] = value
    index += 1
  }
  return values
}

function assertOutsideRepository(pathValue, label) {
  const cwd = resolve(process.cwd())
  const candidate = resolve(pathValue)
  if (candidate === cwd || candidate.startsWith(`${cwd}${sep}`)) {
    throw new Error(`${label} deve ficar fora do diretório do repositório: ${candidate}`)
  }
  return candidate
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sha256File(pathValue) {
  return sha256(readFileSync(pathValue))
}

function selectionHash(salt, candidateId) {
  return sha256(`${salt}\u0000${candidateId}`)
}

function loadJson(pathValue) {
  return JSON.parse(readFileSync(pathValue, 'utf8'))
}

function loadCandidates(pathValue) {
  const data = loadJson(pathValue)
  if (Array.isArray(data)) return data
  if (Array.isArray(data.candidates)) return data.candidates
  if (Array.isArray(data.cases)) return data.cases
  throw new Error(`Coleção privada inválida em ${pathValue}: esperado array, candidates[] ou cases[].`)
}

function assertUniqueCandidateIds(candidates, label) {
  const seen = new Set()
  for (const candidate of candidates) {
    if (!candidate?.candidateId || typeof candidate.candidateId !== 'string') {
      throw new Error(`${label}: caso sem candidateId.`)
    }
    if (seen.has(candidate.candidateId)) throw new Error(`${label}: candidateId duplicado: ${candidate.candidateId}`)
    seen.add(candidate.candidateId)
  }
}

function assertCanonicalSource(candidates, source, label) {
  const allowed = new Set(source.allowedSplits)
  const blocked = new Set(source.blockedSplits)
  for (const candidate of candidates) {
    if (candidate?.source?.sourceId !== source.sourceId) {
      throw new Error(`${label}: fonte divergente em ${candidate?.candidateId ?? '[sem id]'}.`)
    }
    if (candidate?.source?.revision !== source.revision) {
      throw new Error(`${label}: revisão divergente em ${candidate.candidateId}.`)
    }
    const split = candidate?.source?.split
    if (blocked.has(split)) throw new Error(`${label}: split bloqueado ${split} em ${candidate.candidateId}.`)
    if (!allowed.has(split)) throw new Error(`${label}: split não autorizado ${split} em ${candidate.candidateId}.`)
  }
}

function isPendingHumanAnnotation(candidate) {
  return candidate?.humanAnnotation?.status === 'pending'
    && candidate?.humanAnnotation?.label === null
}

function eligibleForSpec(candidate, spec) {
  if (candidate?.structuralBucket !== spec.structuralBucket) return false
  if (spec.requiresTrustedPreviousContext && !candidate?.previousContext) return false
  if (spec.requiredContinuity && candidate?.previousContext?.continuity !== spec.requiredContinuity) return false
  if (spec.requiresNoExclusions && (candidate?.exclusions?.length ?? 0) !== 0) return false
  if (spec.requiresPendingHumanAnnotation && !isPendingHumanAnnotation(candidate)) return false
  return true
}

function countBy(candidates, getter) {
  return candidates.reduce((counts, candidate) => {
    const key = getter(candidate)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function assertExactCounts(actual, expected, label) {
  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = Object.keys(expected).sort()
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    throw new Error(`${label}: estratos/chaves divergentes; esperado ${expectedKeys.join(', ')}, recebido ${actualKeys.join(', ')}.`)
  }
  for (const key of expectedKeys) {
    if (actual[key] !== expected[key]) {
      throw new Error(`${label}: ${key} esperado ${expected[key]}, recebido ${actual[key] ?? 0}.`)
    }
  }
}

function sortedByHash(candidates, salt) {
  return [...candidates].sort((left, right) => {
    const leftHash = selectionHash(salt, left.candidateId)
    const rightHash = selectionHash(salt, right.candidateId)
    return leftHash.localeCompare(rightHash) || left.candidateId.localeCompare(right.candidateId)
  })
}

function selectNoDirect(eligible, config) {
  const quotaEntries = Object.entries(config.fixedStratumQuotas)
  const quotaTotal = quotaEntries.reduce((total, [, quota]) => total + quota, 0)
  if (quotaTotal !== config.sampleSize) {
    throw new Error(`Quotas dos candidatos somam ${quotaTotal}; esperado ${config.sampleSize}.`)
  }

  const selected = []
  for (const [stratum, quota] of quotaEntries) {
    const available = eligible.filter((candidate) => candidate?.target?.deprel === stratum)
    if (available.length < quota) {
      throw new Error(`Estrato ${stratum} possui ${available.length}, abaixo da quota ${quota}.`)
    }
    selected.push(...sortedByHash(available, config.selectionSalt).slice(0, quota))
  }
  return selected
}

function chooseOperationalPilot(selectedNoDirect, selectedControls, ordering) {
  const pilotConfig = ordering.operationalPilot
  const noDirectSorted = sortedByHash(selectedNoDirect, pilotConfig.selectionSalt)
  const pilotNoDirect = []
  const seenStrata = new Set()

  for (const candidate of noDirectSorted) {
    const stratum = candidate?.target?.deprel ?? 'unknown'
    if (pilotConfig.noDirectCasesMustUseDistinctStrata && seenStrata.has(stratum)) continue
    pilotNoDirect.push(candidate)
    seenStrata.add(stratum)
    if (pilotNoDirect.length === pilotConfig.noDirectCases) break
  }
  if (pilotNoDirect.length !== pilotConfig.noDirectCases) {
    throw new Error('Não foi possível montar o piloto operacional com estratos distintos.')
  }

  const pilotControls = sortedByHash(selectedControls, pilotConfig.selectionSalt)
    .slice(0, pilotConfig.explicitControls)
  if (pilotControls.length !== pilotConfig.explicitControls) {
    throw new Error('Controles insuficientes para o piloto operacional.')
  }

  const pilotIds = new Set([...pilotNoDirect, ...pilotControls].map((candidate) => candidate.candidateId))
  const first = sortedByHash([...pilotNoDirect, ...pilotControls], pilotConfig.selectionSalt)
  const remainder = sortedByHash(
    [...selectedNoDirect, ...selectedControls].filter((candidate) => !pilotIds.has(candidate.candidateId)),
    ordering.presentationSalt,
  )
  const ordered = [...first, ...remainder]
  if (ordered.length !== selectedNoDirect.length + selectedControls.length) {
    throw new Error('Falha interna ao construir a ordem privada do pacote.')
  }
  return { ordered, pilotIds }
}

function manifestEntry(candidate, kind, packagePosition, pilotIds, salts) {
  const stratum = candidate?.target?.deprel ?? null
  const selectionSalt = kind === 'no_direct_subject_candidate' ? salts.candidate : salts.control
  return {
    candidateId: candidate.candidateId,
    kind,
    targetSplit: candidate.source.split,
    structuralStratum: stratum,
    selectionHash: selectionHash(selectionSalt, candidate.candidateId),
    presentationHash: selectionHash(salts.presentation, candidate.candidateId),
    packagePosition,
    operationalPilot: pilotIds.has(candidate.candidateId),
  }
}

export function selectPrivatePilot(candidatePool, controlPool, config, fingerprints = {}) {
  assertUniqueCandidateIds(candidatePool, 'Pool de candidatos')
  assertUniqueCandidateIds(controlPool, 'Pool de controles')
  assertCanonicalSource(candidatePool, config.source, 'Pool de candidatos')
  assertCanonicalSource(controlPool, config.source, 'Pool de controles')

  const eligibleNoDirect = candidatePool.filter((candidate) => eligibleForSpec(candidate, config.candidatePool))
  if (eligibleNoDirect.length !== config.candidatePool.expectedEligibleCount) {
    throw new Error(`Pool canônico sem sujeito: esperado ${config.candidatePool.expectedEligibleCount}, recebido ${eligibleNoDirect.length}.`)
  }
  assertExactCounts(
    countBy(eligibleNoDirect, (candidate) => candidate.source.split),
    config.candidatePool.expectedTargetSplitCounts,
    'Distribuição por split do pool canônico',
  )
  assertExactCounts(
    countBy(eligibleNoDirect, (candidate) => candidate.target.deprel),
    config.candidatePool.expectedStratumCounts,
    'Distribuição estrutural do pool canônico',
  )

  const eligibleControls = controlPool.filter((candidate) => eligibleForSpec(candidate, config.controlPool))
  if (eligibleControls.length < config.controlPool.sampleSize) {
    throw new Error(`Controles elegíveis insuficientes: ${eligibleControls.length}; esperado ao menos ${config.controlPool.sampleSize}.`)
  }

  const selectedNoDirect = selectNoDirect(eligibleNoDirect, config.candidatePool)
  const selectedControls = sortedByHash(eligibleControls, config.controlPool.selectionSalt)
    .slice(0, config.controlPool.sampleSize)
  const { ordered, pilotIds } = chooseOperationalPilot(selectedNoDirect, selectedControls, config.ordering)

  if (ordered.length !== config.outputs.selectedPackageSize) {
    throw new Error(`Pacote selecionado possui ${ordered.length}; esperado ${config.outputs.selectedPackageSize}.`)
  }
  if (new Set(ordered.map((candidate) => candidate.candidateId)).size !== ordered.length) {
    throw new Error('Pacote selecionado contém candidateId duplicado.')
  }

  const selectedNoDirectCounts = countBy(selectedNoDirect, (candidate) => candidate.target.deprel)
  assertExactCounts(selectedNoDirectCounts, config.candidatePool.fixedStratumQuotas, 'Quotas selecionadas')

  const packageObject = {
    schemaVersion: 1,
    purpose: 'Pacote privado observado para pré-banca sintética; não contém decisão linguística validada.',
    selectionConfigId: config.id,
    source: {
      sourceId: config.source.sourceId,
      revision: config.source.revision,
    },
    inputFingerprints: {
      candidatePoolSha256: fingerprints.candidatePoolSha256 ?? null,
      controlPoolSha256: fingerprints.controlPoolSha256 ?? null,
      selectionConfigSha256: fingerprints.selectionConfigSha256 ?? null,
    },
    boundaries: {
      mustStayOutsideRepository: true,
      linguisticAnswerUsedForSelection: false,
      modelOutputUsedForSelection: false,
      humanLabelUsedForSelection: false,
      countsAsHumanValidation: false,
      mayCreateHumanGold: false,
      mayAuthorizeVerified: false,
      mayAuthorizeProductionSyntax: false,
      testSplitOpened: false,
    },
    operationalPilotSize: config.ordering.operationalPilot.size,
    candidates: ordered,
  }

  const packageText = `${JSON.stringify(packageObject, null, 2)}\n`
  const packageSha256 = sha256(packageText)
  const kindById = new Map([
    ...selectedNoDirect.map((candidate) => [candidate.candidateId, 'no_direct_subject_candidate']),
    ...selectedControls.map((candidate) => [candidate.candidateId, 'explicit_subject_control']),
  ])
  const manifest = {
    schemaVersion: 1,
    selectionConfigId: config.id,
    inputFingerprints: packageObject.inputFingerprints,
    packageSha256,
    counts: {
      canonicalEligibleNoDirect: eligibleNoDirect.length,
      eligibleControls: eligibleControls.length,
      selectedNoDirect: selectedNoDirect.length,
      selectedControls: selectedControls.length,
      selectedTotal: ordered.length,
      operationalPilot: pilotIds.size,
    },
    selectedNoDirectStrata: selectedNoDirectCounts,
    boundaries: {
      containsObservedText: false,
      mustStayOutsideRepository: true,
      selectionUsesLinguisticAnswer: false,
      syntheticOnly: true,
    },
    selected: ordered.map((candidate, index) => manifestEntry(
      candidate,
      kindById.get(candidate.candidateId),
      index + 1,
      pilotIds,
      {
        candidate: config.candidatePool.selectionSalt,
        control: config.controlPool.selectionSalt,
        presentation: config.ordering.presentationSalt,
      },
    )),
  }
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`

  return {
    packageObject,
    packageText,
    packageSha256,
    manifest,
    manifestText,
  }
}

function printHelp() {
  console.log(`Uso:\n  node scripts/select-subject-synthetic-pilot.mjs \\\n    --candidate-pool /fora/do/repo/pool-observado.json \\\n    [--control-pool /fora/do/repo/pool-com-controles.json] \\\n    --package-output /fora/do/repo/m1-r0-piloto-16.json \\\n    --manifest-output /fora/do/repo/m1-r0-piloto-16-manifest.json \\\n    [--config caminho.json]\n\nSe --control-pool for omitido, o mesmo arquivo de --candidate-pool deve conter controles explícitos elegíveis. Nenhum caso, manifesto ou texto observado é gravado no repositório.`)
}

function main() {
  if (process.argv.includes('--help')) return printHelp()
  const args = parseArgs(process.argv.slice(2))
  const required = ['candidate-pool', 'package-output', 'manifest-output']
  const missing = required.filter((key) => !args[key])
  if (missing.length > 0) throw new Error(`Argumentos obrigatórios ausentes: ${missing.join(', ')}`)

  const candidatePath = assertOutsideRepository(args['candidate-pool'], 'O pool privado de candidatos')
  const controlPath = assertOutsideRepository(args['control-pool'] ?? args['candidate-pool'], 'O pool privado de controles')
  const packagePath = assertOutsideRepository(args['package-output'], 'O pacote privado de saída')
  const manifestPath = assertOutsideRepository(args['manifest-output'], 'O manifesto privado de saída')
  if (packagePath === manifestPath) throw new Error('Pacote e manifesto precisam de caminhos distintos.')

  const configPath = resolve(args.config ?? DEFAULT_CONFIG.pathname)
  const config = loadJson(configPath)
  if (config.state !== 'method_locked_cases_private') throw new Error(`Configuração em estado inesperado: ${config.state}`)
  if (config.outputs.observedPackageMustStayOutsideRepository !== true || config.outputs.selectionManifestMustStayOutsideRepository !== true) {
    throw new Error('A configuração deve manter pacote e manifesto fora do repositório.')
  }
  if (config.boundaries.testSplitOpened !== false || config.boundaries.usesLinguisticAnswerForSelection !== false) {
    throw new Error('Fronteira metodológica inválida na configuração de seleção.')
  }

  const result = selectPrivatePilot(
    loadCandidates(candidatePath),
    loadCandidates(controlPath),
    config,
    {
      candidatePoolSha256: sha256File(candidatePath),
      controlPoolSha256: sha256File(controlPath),
      selectionConfigSha256: sha256File(configPath),
    },
  )

  writeFileSync(packagePath, result.packageText, { flag: 'wx' })
  writeFileSync(manifestPath, result.manifestText, { flag: 'wx' })
  console.log(`Pacote privado criado: ${packagePath}`)
  console.log(`Manifesto privado criado: ${manifestPath}`)
  console.log(`SHA-256 do pacote: ${result.packageSha256}`)
  console.log(`Casos: ${result.manifest.counts.selectedTotal} = ${result.manifest.counts.selectedNoDirect} candidatos + ${result.manifest.counts.selectedControls} controles`)
  console.log(`Piloto operacional inicial: ${result.manifest.counts.operationalPilot} casos`)
  console.log('Seleção usa apenas metadados estruturais, candidateId e hash determinístico; nenhuma resposta linguística participa.')
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (executedDirectly) {
  main().catch((error) => {
    console.error(`[M1-R0 seletor privado] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
