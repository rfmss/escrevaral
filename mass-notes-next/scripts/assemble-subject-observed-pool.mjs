import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  mineSubjectCandidates,
  parseConllu,
  parseSentencePosition,
} from './mine-subject-candidates.mjs'

const DEFAULT_CONFIG = new URL('../docs/linguistics/synthetic/m1-r0-observed-pool-assembly.json', import.meta.url)
const SOURCE_REGISTRY = new URL('../docs/corpora/m1-r0-subject-corpus-sources.json', import.meta.url)
const PLURAL_NOMINAL_UPOS = new Set(['NOUN', 'PROPN', 'PRON'])

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

function loadJson(pathValue) {
  return JSON.parse(readFileSync(pathValue, 'utf8'))
}

export function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, 'utf8')
  return createHash('sha1').update(header).update(buffer).digest('hex')
}

function positionKey(position) {
  return `${position.documentId}\u0000${position.ordinal}`
}

function pluralNominals(sentence) {
  return sentence.tokens
    .filter((token) => PLURAL_NOMINAL_UPOS.has(token.upos) && token.features.Number === 'Plur')
    .map((token) => ({
      id: token.id,
      form: token.form,
      lemma: token.lemma,
      upos: token.upos,
      deprel: token.deprel,
      head: token.head,
    }))
}

function buildCombinedSentenceIndex(trainSentences, devSentences) {
  const entries = [
    ...trainSentences.map((sentence) => ({ split: 'train', sentence })),
    ...devSentences.map((sentence) => ({ split: 'dev', sentence })),
  ]
  const byPosition = new Map()

  for (const entry of entries) {
    const position = parseSentencePosition(entry.sentence.sentId)
    if (!position) continue
    const key = positionKey(position)
    if (byPosition.has(key)) {
      const previous = byPosition.get(key)
      throw new Error(
        `Posição documental duplicada entre ${previous.split}:${previous.sentence.sentId} e ${entry.split}:${entry.sentence.sentId}.`,
      )
    }
    byPosition.set(key, { ...entry, position })
  }

  return { entries, byPosition }
}

function trustedPreviousEntry(sentence, byPosition) {
  const position = parseSentencePosition(sentence.sentId)
  if (!position || position.ordinal <= 1) return null
  return byPosition.get(positionKey({ ...position, ordinal: position.ordinal - 1 })) ?? null
}

function rehydrateCandidatePreviousContext(candidate, combinedIndex) {
  const targetPosition = parseSentencePosition(candidate.source.sentId)
  if (!targetPosition) {
    return {
      ...candidate,
      previousContext: null,
      signals: { ...candidate.signals, previousPluralNominals: [] },
    }
  }

  const targetEntry = combinedIndex.byPosition.get(positionKey(targetPosition))
  if (!targetEntry) throw new Error(`Sentença-alvo ausente do índice combinado: ${candidate.source.sentId}`)
  if (targetEntry.split !== candidate.source.split) {
    throw new Error(`Split da sentença-alvo diverge para ${candidate.source.sentId}: ${candidate.source.split} vs ${targetEntry.split}.`)
  }

  const previous = trustedPreviousEntry(targetEntry.sentence, combinedIndex.byPosition)
  const previousPluralNominals = previous ? pluralNominals(previous.sentence) : []
  return {
    ...candidate,
    previousContext: previous
      ? {
          sentId: previous.sentence.sentId,
          text: previous.sentence.text,
          pluralNominals: previousPluralNominals,
          continuity: 'same_document_consecutive_sentence_id',
        }
      : null,
    signals: {
      ...candidate.signals,
      previousPluralNominals,
    },
  }
}

function countBy(items, getter) {
  return items.reduce((counts, item) => {
    const key = getter(item)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function sortObjectKeys(object) {
  return Object.fromEntries(Object.entries(object).sort(([left], [right]) => left.localeCompare(right)))
}

function crossSplitContinuity(entries, combinedIndex) {
  const counts = {
    trainTargetPreviousDev: 0,
    devTargetPreviousTrain: 0,
  }
  for (const entry of entries) {
    const previous = trustedPreviousEntry(entry.sentence, combinedIndex.byPosition)
    if (!previous || previous.split === entry.split) continue
    if (entry.split === 'train' && previous.split === 'dev') counts.trainTargetPreviousDev += 1
    if (entry.split === 'dev' && previous.split === 'train') counts.devTargetPreviousTrain += 1
  }
  return counts
}

function allHumanAnnotationsPending(candidates) {
  return candidates.every((candidate) => (
    candidate?.humanAnnotation?.status === 'pending'
    && candidate?.humanAnnotation?.label === null
    && Array.isArray(candidate?.humanAnnotation?.annotators)
    && candidate.humanAnnotation.annotators.length === 0
  ))
}

export function assembleSubjectObservedPool({ trainContent, devContent, source, fingerprints = {} }) {
  if (!source?.id || !source?.revision || !source?.repository || !source?.license) {
    throw new Error('Fonte incompleta para montagem observada.')
  }

  const trainSentences = parseConllu(trainContent)
  const devSentences = parseConllu(devContent)
  const combinedIndex = buildCombinedSentenceIndex(trainSentences, devSentences)

  const commonMetadata = {
    sourceId: source.id,
    repository: source.repository,
    revision: source.revision,
    license: source.license,
  }
  const trainReport = mineSubjectCandidates(trainContent, { ...commonMetadata, split: 'train' })
  const devReport = mineSubjectCandidates(devContent, { ...commonMetadata, split: 'dev' })

  const candidates = [...trainReport.candidates, ...devReport.candidates]
    .map((candidate) => rehydrateCandidatePreviousContext(candidate, combinedIndex))
    .sort((left, right) => left.candidateId.localeCompare(right.candidateId))

  if (!allHumanAnnotationsPending(candidates)) {
    throw new Error('O minerador base deixou anotação humana preenchida; montagem abortada.')
  }

  const sentencesWithTrustedPreviousContext = combinedIndex.entries.filter((entry) => (
    Boolean(trustedPreviousEntry(entry.sentence, combinedIndex.byPosition))
  )).length
  const candidatesWithTrustedPreviousContext = candidates.filter((candidate) => candidate.previousContext).length
  const noDirectTrusted = candidates.filter((candidate) => (
    candidate.structuralBucket === 'no_direct_subject_candidate' && candidate.previousContext
  ))

  return {
    schemaVersion: 1,
    purpose: 'Pool privado observado train+dev com continuidade documental reconstruída; não contém decisão linguística automática.',
    source: {
      sourceId: source.id,
      repository: source.repository,
      revision: source.revision,
      license: source.license,
      splits: ['train', 'dev'],
    },
    inputFingerprints: {
      trainGitBlobSha: fingerprints.trainGitBlobSha ?? null,
      trainSha256: fingerprints.trainSha256 ?? null,
      devGitBlobSha: fingerprints.devGitBlobSha ?? null,
      devSha256: fingerprints.devSha256 ?? null,
      assemblyConfigSha256: fingerprints.assemblyConfigSha256 ?? null,
    },
    boundaries: {
      networkUsedByAssembler: false,
      automaticDownload: false,
      linguisticDecisionMade: false,
      humanAnnotationProduced: false,
      testSplitOpened: false,
      reservedSyntheticEvaluationOpened: false,
      maySupportVerified: false,
      mayAuthorizeProductionSyntax: false,
      physicalFileOrderTrustedAsDiscourseOrder: false,
      previousContextRequiresSameDocumentConsecutiveId: true,
      outputMustStayOutsideRepository: true,
    },
    counts: {
      sentences: trainSentences.length + devSentences.length,
      sentencesBySplit: {
        train: trainSentences.length,
        dev: devSentences.length,
      },
      sentencesWithTrustedPreviousContext,
      candidates: candidates.length,
      candidatesWithTrustedPreviousContext,
      byStructuralBucket: sortObjectKeys(countBy(candidates, (candidate) => candidate.structuralBucket)),
      crossSplitSentenceContinuity: crossSplitContinuity(combinedIndex.entries, combinedIndex),
      noDirectWithTrustedPreviousContext: noDirectTrusted.length,
      noDirectTrustedPreviousByTargetSplit: sortObjectKeys(countBy(noDirectTrusted, (candidate) => candidate.source.split)),
      noDirectTrustedPreviousByTargetDeprel: sortObjectKeys(countBy(noDirectTrusted, (candidate) => candidate.target.deprel)),
    },
    candidates,
  }
}

function assertExactObject(actual, expected, label) {
  const normalizedActual = JSON.stringify(sortObjectKeys(actual))
  const normalizedExpected = JSON.stringify(sortObjectKeys(expected))
  if (normalizedActual !== normalizedExpected) {
    throw new Error(`${label} divergente: esperado ${normalizedExpected}, recebido ${normalizedActual}.`)
  }
}

export function assertExpectedAggregate(report, config) {
  const expected = config.expectedAggregate
  const checks = [
    ['sentences', report.counts.sentences, expected.sentences],
    ['sentencesWithTrustedPreviousContext', report.counts.sentencesWithTrustedPreviousContext, expected.sentencesWithTrustedPreviousContext],
    ['candidates', report.counts.candidates, expected.candidates],
    ['candidatesWithTrustedPreviousContext', report.counts.candidatesWithTrustedPreviousContext, expected.candidatesWithTrustedPreviousContext],
    ['noDirectWithTrustedPreviousContext', report.counts.noDirectWithTrustedPreviousContext, expected.noDirectWithTrustedPreviousContext],
  ]
  for (const [label, actual, wanted] of checks) {
    if (actual !== wanted) throw new Error(`${label}: esperado ${wanted}, recebido ${actual}.`)
  }
  assertExactObject(report.counts.byStructuralBucket, expected.byStructuralBucket, 'byStructuralBucket')
  assertExactObject(report.counts.crossSplitSentenceContinuity, expected.crossSplitSentenceContinuity, 'crossSplitSentenceContinuity')
  assertExactObject(report.counts.noDirectTrustedPreviousByTargetSplit, expected.noDirectTrustedPreviousByTargetSplit, 'noDirectTrustedPreviousByTargetSplit')
  assertExactObject(report.counts.noDirectTrustedPreviousByTargetDeprel, expected.noDirectTrustedPreviousByTargetDeprel, 'noDirectTrustedPreviousByTargetDeprel')
}

function loadApprovedSource(config) {
  const registry = loadJson(SOURCE_REGISTRY)
  const source = registry.sources.find((item) => item.id === config.source.sourceId)
  if (!source) throw new Error(`Fonte não registrada: ${config.source.sourceId}`)
  if (source.status !== 'accepted_for_development_mining') {
    throw new Error(`Fonte não autorizada para desenvolvimento: ${source.id}`)
  }
  if (source.revision !== config.source.revision) {
    throw new Error(`Revisão divergente no registro: ${source.revision} vs ${config.source.revision}.`)
  }
  if (source.repository !== config.source.repository || source.license !== config.source.license) {
    throw new Error('Repositório/licença da configuração divergem do registro de corpora.')
  }
  return source
}

function verifyInput(buffer, split, config) {
  const expected = config.source.files[split]
  const actualBlob = gitBlobSha(buffer)
  if (actualBlob !== expected.gitBlobSha) {
    throw new Error(`${split}: Git blob SHA divergente; esperado ${expected.gitBlobSha}, recebido ${actualBlob}.`)
  }
  const actualSha256 = sha256Buffer(buffer)
  if (expected.sha256 && actualSha256 !== expected.sha256) {
    throw new Error(`${split}: SHA-256 divergente; esperado ${expected.sha256}, recebido ${actualSha256}.`)
  }
  return { gitBlobSha: actualBlob, sha256: actualSha256 }
}

function printHelp() {
  console.log(`Uso:\n  node scripts/assemble-subject-observed-pool.mjs \\\n    --train /fora/do/repo/pt_porttinari-ud-train.conllu \\\n    --dev /fora/do/repo/pt_porttinari-ud-dev.conllu \\\n    --output /fora/do/repo/m1-r0-porttinari-train-dev-pool.json \\\n    [--config caminho.json]\n\nO montador não possui download nem rede. Ele autentica os arquivos locais pela revisão fixada, minera train/dev com o minerador já auditado e reconstrói apenas o predecessor documental global.`)
}

function main() {
  if (process.argv.includes('--help')) return printHelp()
  const args = parseArgs(process.argv.slice(2))
  const missing = ['train', 'dev', 'output'].filter((key) => !args[key])
  if (missing.length > 0) throw new Error(`Argumentos obrigatórios ausentes: ${missing.join(', ')}`)

  const trainPath = assertOutsideRepository(args.train, 'O train observado')
  const devPath = assertOutsideRepository(args.dev, 'O dev observado')
  const outputPath = assertOutsideRepository(args.output, 'O pool observado de saída')
  const configPath = resolve(args.config ?? DEFAULT_CONFIG.pathname)
  const config = loadJson(configPath)
  if (config.state !== 'method_locked_private_output') throw new Error(`Configuração em estado inesperado: ${config.state}`)
  if (config.assemblyPolicy.outputMustStayOutsideRepository !== true || config.assemblyPolicy.testSplitOpened !== false) {
    throw new Error('Fronteiras inválidas na configuração de montagem.')
  }
  const source = loadApprovedSource(config)

  const trainBuffer = readFileSync(trainPath)
  const devBuffer = readFileSync(devPath)
  const trainFingerprint = verifyInput(trainBuffer, 'train', config)
  const devFingerprint = verifyInput(devBuffer, 'dev', config)

  const report = assembleSubjectObservedPool({
    trainContent: trainBuffer.toString('utf8'),
    devContent: devBuffer.toString('utf8'),
    source,
    fingerprints: {
      trainGitBlobSha: trainFingerprint.gitBlobSha,
      trainSha256: trainFingerprint.sha256,
      devGitBlobSha: devFingerprint.gitBlobSha,
      devSha256: devFingerprint.sha256,
      assemblyConfigSha256: sha256Buffer(readFileSync(configPath)),
    },
  })

  if (report.counts.sentencesBySplit.train !== config.source.files.train.expectedSentences) {
    throw new Error(`train: esperado ${config.source.files.train.expectedSentences} sentenças, recebido ${report.counts.sentencesBySplit.train}.`)
  }
  if (report.counts.sentencesBySplit.dev !== config.source.files.dev.expectedSentences) {
    throw new Error(`dev: esperado ${config.source.files.dev.expectedSentences} sentenças, recebido ${report.counts.sentencesBySplit.dev}.`)
  }
  assertExpectedAggregate(report, config)

  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
  console.log(`Pool privado criado: ${outputPath}`)
  console.log(`Sentenças: ${report.counts.sentences}`)
  console.log(`Predecessores documentais exatos: ${report.counts.sentencesWithTrustedPreviousContext}`)
  console.log(`Candidatos estruturais: ${report.counts.candidates}`)
  console.log(`Candidatos com predecessor exato: ${report.counts.candidatesWithTrustedPreviousContext}`)
  console.log(`Sem sujeito direto com predecessor exato: ${report.counts.noDirectWithTrustedPreviousContext}`)
  console.log('test aberto: false')
  console.log('decisão linguística automática: false')
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (executedDirectly) {
  try {
    main()
  } catch (error) {
    console.error(`[M1-R0 montagem observada] ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
