import { readFileSync, writeFileSync } from 'node:fs'

const sourceRegistry = JSON.parse(readFileSync(new URL('../docs/corpora/m1-r0-subject-corpus-sources.json', import.meta.url), 'utf8'))
const development = JSON.parse(readFileSync(new URL('../tests/fixtures/subject-recoverability-development.json', import.meta.url), 'utf8'))
const evaluation = JSON.parse(readFileSync(new URL('../tests/fixtures/subject-recoverability-evaluation.json', import.meta.url), 'utf8'))
const ruleSource = readFileSync(new URL('../docs/linguistics/rules/m1-r0-subject-boundaries.yaml', import.meta.url), 'utf8')

const violations = []
const requiredLabels = new Set([
  'subject_recoverable',
  'subject_indeterminate',
  'subject_ambiguous',
  'subject_explicit',
])
const requiredGenres = new Set([
  'prosa_ficcional',
  'dialogo',
  'ensaio',
  'jornalismo_simulado',
  'oralidade_simulada',
])
const licensesThatMayCarrySelectedText = new Set([
  'CC BY 4.0',
  'CC BY-SA 4.0',
])

function addViolation(code, detail) {
  violations.push({ code, detail })
}

function normalized(value) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR')
}

function duplicates(values) {
  const seen = new Set()
  const repeated = new Set()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

function countBy(items, selector) {
  return items.reduce((counts, item) => {
    const key = selector(item)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

function inspectSplit(dataset, expectedSplit) {
  if (dataset.split !== expectedSplit) {
    addViolation('invalid-split', `${expectedSplit}: recebido ${dataset.split}`)
  }
  if (dataset.maySupportVerified !== false) {
    addViolation('synthetic-cannot-verify', `${expectedSplit} deve declarar maySupportVerified=false`)
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    addViolation('empty-split', expectedSplit)
    return {
      ids: [],
      texts: [],
      labels: {},
      genres: {},
    }
  }

  const ids = []
  const texts = []
  for (const item of dataset.cases) {
    const missing = [
      'id',
      'genre',
      'register',
      'manuscript',
      'target',
      'rationale',
    ].filter((field) => typeof item[field] !== 'string' || item[field].trim().length === 0)

    if (!item.expected || typeof item.expected.label !== 'string' || typeof item.expected.confidence !== 'string') {
      missing.push('expected.label/confidence')
    }
    if (
      !item.provenance
      || item.provenance.type !== 'project_original'
      || item.provenance.copied !== false
      || typeof item.provenance.rights !== 'string'
      || item.provenance.rights.trim().length === 0
    ) {
      missing.push('provenance')
    }
    if (missing.length > 0) {
      addViolation('malformed-case', `${item.id ?? '(sem id)'}: ${missing.join(', ')}`)
    }

    ids.push(item.id)
    texts.push(normalized(item.manuscript))

    if (!requiredLabels.has(item.expected?.label)) {
      addViolation('unknown-label', `${item.id}: ${item.expected?.label}`)
    }
    if (!requiredGenres.has(item.genre)) {
      addViolation('unknown-genre', `${item.id}: ${item.genre}`)
    }
    if (!normalized(item.manuscript).includes(normalized(item.target))) {
      addViolation('target-not-in-manuscript', item.id)
    }
  }

  for (const id of duplicates(ids)) addViolation('duplicate-id', `${expectedSplit}: ${id}`)
  for (const text of duplicates(texts)) addViolation('duplicate-text', `${expectedSplit}: ${text}`)

  const labels = countBy(dataset.cases, (item) => item.expected?.label ?? '(sem label)')
  const genres = countBy(dataset.cases, (item) => item.genre ?? '(sem gênero)')

  for (const label of requiredLabels) {
    if (!labels[label]) addViolation('missing-label', `${expectedSplit}: ${label}`)
  }
  for (const genre of requiredGenres) {
    if (!genres[genre]) addViolation('missing-genre', `${expectedSplit}: ${genre}`)
  }

  return { ids, texts, labels, genres }
}

if (!sourceRegistry.policy?.developmentAndEvaluationMustRemainSeparate) {
  addViolation('missing-separation-policy', 'registro de fontes')
}
if (sourceRegistry.policy?.currentImplementationState !== 'not_authorized') {
  addViolation('implementation-policy-opened', sourceRegistry.policy?.currentImplementationState)
}

const sourceIds = sourceRegistry.sources.map((source) => source.id)
for (const id of duplicates(sourceIds)) addViolation('duplicate-source-id', id)

for (const source of sourceRegistry.sources) {
  const required = [
    'id',
    'title',
    'languageVariant',
    'version',
    'revision',
    'license',
    'status',
    'intendedRole',
  ].filter((field) => typeof source[field] !== 'string' || source[field].trim().length === 0)

  if (!Array.isArray(source.genres) || source.genres.length === 0) required.push('genres')
  if (!Array.isArray(source.conditions)) required.push('conditions')
  if (!Array.isArray(source.risks)) required.push('risks')
  if (typeof source.includesText !== 'boolean') required.push('includesText')
  if (typeof source.textMayEnterRepository !== 'boolean') required.push('textMayEnterRepository')
  if (required.length > 0) addViolation('malformed-source', `${source.id ?? '(sem id)'}: ${required.join(', ')}`)

  const forbiddenPayloadFields = ['text', 'sentence', 'excerpt', 'content', 'transcript']
    .filter((field) => Object.hasOwn(source, field))
  if (forbiddenPayloadFields.length > 0) {
    addViolation('external-text-in-registry', `${source.id}: ${forbiddenPayloadFields.join(', ')}`)
  }

  if (source.textMayEnterRepository) {
    if (!licensesThatMayCarrySelectedText.has(source.license)) {
      addViolation('license-does-not-authorize-selected-text', `${source.id}: ${source.license}`)
    }
    if (source.status !== 'accepted_for_development_mining') {
      addViolation('text-open-without-accepted-status', `${source.id}: ${source.status}`)
    }
  }

  if (
    /benchmark_only|rejected_for_vendoring|conditional_/u.test(source.status)
    && source.textMayEnterRepository
  ) {
    addViolation('blocked-source-opened', source.id)
  }

  if (
    source.repository?.startsWith('UniversalDependencies/')
    && !/^[0-9a-f]{40}$/u.test(source.revision)
    && source.revision !== 'release-2.18'
  ) {
    addViolation('unpinned-ud-source', `${source.id}: ${source.revision}`)
  }
}

const developmentReport = inspectSplit(development, 'development')
const evaluationReport = inspectSplit(evaluation, 'evaluation_reserved')

const overlappingIds = developmentReport.ids.filter((id) => evaluationReport.ids.includes(id))
const overlappingTexts = developmentReport.texts.filter((text) => evaluationReport.texts.includes(text))
for (const id of overlappingIds) addViolation('development-evaluation-id-overlap', id)
for (const text of overlappingTexts) addViolation('development-evaluation-text-overlap', text)

if (evaluation.sealedUntil !== 'implementation_hypothesis_frozen') {
  addViolation('evaluation-not-sealed', evaluation.sealedUntil)
}
if (evaluation.mustNotBeImportedByDevelopmentRunner !== true) {
  addViolation('evaluation-import-guard-missing', 'mustNotBeImportedByDevelopmentRunner')
}
if (development.mustNotBeImportedByEvaluationRunner !== true) {
  addViolation('development-import-guard-missing', 'mustNotBeImportedByEvaluationRunner')
}

if (!/\bstatus:\s*source_mapped\b/u.test(ruleSource)) {
  addViolation('rule-status-changed', 'esperado source_mapped')
}
if (!/implementation:\s*\n\s*state:\s*not_authorized\b/u.test(ruleSource)) {
  addViolation('syntax-implementation-opened', 'm1-r0-subject-boundaries.yaml')
}
if (!/raw_source_in_repository:\s*false\b/u.test(ruleSource)) {
  addViolation('raw-source-boundary-missing', 'm1-r0-subject-boundaries.yaml')
}

const report = {
  generatedAt: new Date().toISOString(),
  targetPhenomenon: development.targetPhenomenon,
  sources: {
    count: sourceRegistry.sources.length,
    byStatus: countBy(sourceRegistry.sources, (source) => source.status),
    textApprovedForControlledMining: sourceRegistry.sources
      .filter((source) => source.textMayEnterRepository)
      .map((source) => source.id),
  },
  development: {
    count: development.cases.length,
    evidenceLevel: development.evidenceLevel,
    labels: developmentReport.labels,
    genres: developmentReport.genres,
  },
  evaluation: {
    count: evaluation.cases.length,
    evidenceLevel: evaluation.evidenceLevel,
    labels: evaluationReport.labels,
    genres: evaluationReport.genres,
    sealedUntil: evaluation.sealedUntil,
  },
  boundaries: {
    implementation: 'not_authorized',
    syntheticSetsMaySupportVerified: false,
    observedCorpusStillRequired: true,
    humanReviewStillRequired: true,
  },
  violations,
}

writeFileSync('m1-r0-subject-corpus-audit.json', `${JSON.stringify(report, null, 2)}\n`)

console.log(`M1-R0 fontes triadas: ${report.sources.count}`)
console.log(`M1-R0 desenvolvimento sintético: ${report.development.count} casos`)
console.log(`M1-R0 avaliação sintética reservada: ${report.evaluation.count} casos`)
console.log(`M1-R0 fontes abertas para mineração controlada: ${report.sources.textApprovedForControlledMining.length}`)
console.log('M1-R0 implementação sintática: not_authorized')

if (violations.length > 0) {
  console.error('Auditoria M1-R0 falhou:', violations)
  process.exit(1)
}

console.log('Auditoria M1-R0 aprovada: fontes, licenças, separação de conjuntos e bloqueio de implementação íntegros.')
