import { readFileSync, writeFileSync } from 'node:fs'

const corpusSource = readFileSync(new URL('../tests/fixtures/verb-morphology-corpus.ts', import.meta.url), 'utf8')
const evaluation = JSON.parse(readFileSync(new URL('../tests/fixtures/verb-morphology-evaluation.json', import.meta.url), 'utf8'))
const provenance = JSON.parse(readFileSync(new URL('../docs/linguistics/verb-provenance.json', import.meta.url), 'utf8'))

const developmentIds = [...corpusSource.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1])
const evaluationIds = evaluation.cases.map((item) => item.id)
const duplicatedDevelopmentIds = developmentIds.filter((id, index) => developmentIds.indexOf(id) !== index)
const duplicatedEvaluationIds = evaluationIds.filter((id, index) => evaluationIds.indexOf(id) !== index)
const overlap = developmentIds.filter((id) => evaluationIds.includes(id))

const allowedStatuses = new Set(provenance.policy.allowedStatuses)
const requiredRuleFields = provenance.policy.requiredRuleFields ?? [
  'id',
  'phenomenon',
  'implementation',
  'status',
  'scope',
  'tradition',
  'usage',
  'divergences',
  'sources',
  'licenseOrTerms',
]
const requiredSourceFields = provenance.policy.requiredSourceFields ?? [
  'id',
  'kind',
  'citation',
  'locator',
  'supports',
  'licenseOrTerms',
]
const placeholderPatterns = provenance.policy.placeholderPatterns ?? ['a documentar', 'pendente', 'não registrado']
const placeholderRegex = new RegExp(placeholderPatterns.join('|'), 'iu')

function fieldIsMissing(rule, field) {
  const value = rule[field]
  if (Array.isArray(value)) return false
  return typeof value !== 'string' || value.trim().length === 0
}

function sourceFieldIsMissing(source, field) {
  const value = source?.[field]
  return typeof value !== 'string' || value.trim().length === 0 || placeholderRegex.test(value)
}

function verifiedFieldIsIncomplete(rule, field) {
  const value = rule[field]
  if (field === 'sources') return !Array.isArray(value) || value.length === 0
  if (field === 'divergences') return !Array.isArray(value)
  if (field === 'implementation') return !Array.isArray(value)
  return typeof value !== 'string' || value.trim().length === 0 || placeholderRegex.test(value)
}

const invalidRules = provenance.rules.filter((rule) => !allowedStatuses.has(rule.status))
const missingRuleFields = provenance.rules
  .map((rule) => ({
    id: rule.id ?? '(sem id)',
    fields: requiredRuleFields.filter((field) => fieldIsMissing(rule, field)),
  }))
  .filter((item) => item.fields.length > 0)
const malformedSources = provenance.rules.flatMap((rule) => (
  (rule.sources ?? []).map((source, index) => ({
    ruleId: rule.id ?? '(sem id)',
    sourceId: source?.id ?? `fonte-${index + 1}`,
    fields: requiredSourceFields.filter((field) => sourceFieldIsMissing(source, field)),
  }))
)).filter((item) => item.fields.length > 0)
const verifiedWithoutEvidence = provenance.rules
  .filter((rule) => rule.status === 'verified')
  .map((rule) => ({
    id: rule.id,
    fields: requiredRuleFields.filter((field) => verifiedFieldIsIncomplete(rule, field)),
  }))
  .filter((item) => item.fields.length > 0)
const verifiedWithoutPassingEvaluation = provenance.rules
  .filter((rule) => rule.status === 'verified')
  .filter((rule) => (
    !rule.evaluation
    || rule.evaluation.failed !== 0
    || rule.evaluation.passed !== rule.evaluation.executions
    || rule.evaluation.precision !== 1
    || rule.evaluation.recall !== 1
  ))
  .map((rule) => rule.id)

const invalidEvaluationCases = evaluation.cases
  .map((item) => {
    const missing = []
    if (!item.id) missing.push('id')
    if (!item.phenomenon) missing.push('phenomenon')
    if (!item.manuscript) missing.push('manuscript')
    if (!item.query) missing.push('query')
    if (typeof item.shouldFind !== 'boolean') missing.push('shouldFind')
    if (!Array.isArray(item.includes)) missing.push('includes')
    if (!Array.isArray(item.excludes)) missing.push('excludes')
    if ('targetExpected' in item && typeof item.targetExpected !== 'boolean') missing.push('targetExpected')
    if ('targetExpected' in item && !item.targetLabel) missing.push('targetLabel')
    return { id: item.id ?? '(sem id)', fields: missing }
  })
  .filter((item) => item.fields.length > 0)

const phenomenonCounts = evaluation.cases.reduce((counts, item) => {
  counts[item.phenomenon] = (counts[item.phenomenon] ?? 0) + 1
  return counts
}, {})

const personalInfinitiveCases = evaluation.cases.filter((item) => item.phenomenon === 'infinitivo-pessoal')
const personalInfinitivePolarity = {
  positive: personalInfinitiveCases.filter((item) => item.targetExpected === true).length,
  negative: personalInfinitiveCases.filter((item) => item.targetExpected === false).length,
}
const missingPersonalInfinitivePolarity = []
if (personalInfinitivePolarity.positive === 0) missingPersonalInfinitivePolarity.push('positive')
if (personalInfinitivePolarity.negative === 0) missingPersonalInfinitivePolarity.push('negative')

const report = {
  generatedAt: new Date().toISOString(),
  developmentCorpus: {
    count: developmentIds.length,
    uniqueCount: new Set(developmentIds).size,
  },
  evaluationCorpus: {
    count: evaluationIds.length,
    uniqueCount: new Set(evaluationIds).size,
    byPhenomenon: phenomenonCounts,
    targetTranche: evaluation.targetTranche ?? null,
    personalInfinitivePolarity,
  },
  provenance: {
    rules: provenance.rules.length,
    sources: provenance.rules.reduce((count, rule) => count + (rule.sources?.length ?? 0), 0),
    byStatus: provenance.rules.reduce((counts, rule) => {
      counts[rule.status] = (counts[rule.status] ?? 0) + 1
      return counts
    }, {}),
  },
  violations: {
    duplicatedDevelopmentIds,
    duplicatedEvaluationIds,
    overlap,
    invalidRuleIds: invalidRules.map((rule) => rule.id),
    missingRuleFields,
    malformedSources,
    verifiedWithoutEvidence,
    verifiedWithoutPassingEvaluation,
    invalidEvaluationCases,
    missingPersonalInfinitivePolarity,
  },
}

writeFileSync('e2-v-evidence-audit.json', `${JSON.stringify(report, null, 2)}\n`)

const violations = Object.values(report.violations).flat()
if (developmentIds.length === 0) violations.push('development-corpus-empty')
if (evaluationIds.length === 0) violations.push('evaluation-corpus-empty')
if (provenance.rules.length === 0) violations.push('provenance-empty')

console.log(`E2-V desenvolvimento: ${developmentIds.length} casos`)
console.log(`E2-V avaliação separada: ${evaluationIds.length} casos`)
console.log(`E2-V fenômenos adversariais: ${Object.keys(phenomenonCounts).length}`)
console.log(`E2-V infinitivo pessoal: ${personalInfinitivePolarity.positive} positivos e ${personalInfinitivePolarity.negative} negativos`)
console.log(`E2-V regras com proveniência: ${provenance.rules.length}`)
console.log(`E2-V fontes registradas: ${report.provenance.sources}`)

if (violations.length > 0) {
  console.error('Auditoria E2-V falhou:', report.violations)
  process.exit(1)
}

console.log('Auditoria E2-V aprovada: corpora separados, polaridade, fontes e política de proveniência íntegras.')
