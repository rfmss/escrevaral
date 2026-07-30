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
const invalidRules = provenance.rules.filter((rule) => !allowedStatuses.has(rule.status))
const unverifiableRules = provenance.rules.filter((rule) => rule.status === 'verified' && (!Array.isArray(rule.sources) || rule.sources.length === 0))
const missingRuleFields = provenance.rules.filter((rule) => !rule.id || !rule.phenomenon || !rule.status || !Array.isArray(rule.sources))

const phenomenonCounts = evaluation.cases.reduce((counts, item) => {
  counts[item.phenomenon] = (counts[item.phenomenon] ?? 0) + 1
  return counts
}, {})

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
  },
  provenance: {
    rules: provenance.rules.length,
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
    verifiedWithoutSources: unverifiableRules.map((rule) => rule.id),
    missingRequiredFields: missingRuleFields.map((rule) => rule.id ?? '(sem id)'),
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
console.log(`E2-V regras com proveniência: ${provenance.rules.length}`)

if (violations.length > 0) {
  console.error('Auditoria E2-V falhou:', report.violations)
  process.exit(1)
}

console.log('Auditoria E2-V aprovada: corpora separados e política de proveniência íntegra.')
