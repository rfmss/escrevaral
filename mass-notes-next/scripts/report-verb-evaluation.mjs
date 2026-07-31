import { readFileSync, writeFileSync } from 'node:fs'

const evaluation = JSON.parse(readFileSync(new URL('../tests/fixtures/verb-morphology-evaluation.json', import.meta.url), 'utf8'))
const playwright = JSON.parse(readFileSync('e2-v-adversarial-results.json', 'utf8'))

function collectSpecs(suites, output = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) output.push(spec)
    collectSpecs(suite.suites, output)
  }
  return output
}

function lastResult(test) {
  const results = test.results ?? []
  return results.at(-1) ?? null
}

function summarizeError(result) {
  const messages = [
    ...(result?.errors ?? []).map((error) => error.message),
    result?.error?.message,
  ].filter(Boolean)
  return messages.join('\n').slice(0, 1200)
}

function createBucket() {
  return {
    total: 0,
    passed: 0,
    failed: 0,
    targetContracts: 0,
    truePositive: 0,
    trueNegative: 0,
    falsePositive: 0,
    falseNegative: 0,
  }
}

function apply(bucket, entry) {
  bucket.total += 1
  if (entry.passed) bucket.passed += 1
  else bucket.failed += 1

  if (typeof entry.targetExpected !== 'boolean') return
  bucket.targetContracts += 1
  if (entry.targetExpected && entry.passed) bucket.truePositive += 1
  if (!entry.targetExpected && entry.passed) bucket.trueNegative += 1
  if (!entry.targetExpected && !entry.passed) bucket.falsePositive += 1
  if (entry.targetExpected && !entry.passed) bucket.falseNegative += 1
}

function ratio(numerator, denominator) {
  return denominator === 0 ? null : Number((numerator / denominator).toFixed(4))
}

function finalize(bucket) {
  return {
    ...bucket,
    passRate: ratio(bucket.passed, bucket.total),
    precision: ratio(bucket.truePositive, bucket.truePositive + bucket.falsePositive),
    recall: ratio(bucket.truePositive, bucket.truePositive + bucket.falseNegative),
    targetAccuracy: ratio(
      bucket.truePositive + bucket.trueNegative,
      bucket.targetContracts,
    ),
  }
}

const entries = []
const unmatchedSpecs = []

for (const spec of collectSpecs(playwright.suites)) {
  const item = evaluation.cases.find((candidate) => spec.title.includes(candidate.id))
  if (!item) {
    unmatchedSpecs.push(spec.title)
    continue
  }

  for (const test of spec.tests ?? []) {
    const result = lastResult(test)
    const status = result?.status ?? test.status ?? 'unknown'
    entries.push({
      id: item.id,
      phenomenon: item.phenomenon,
      project: test.projectName || 'unknown',
      status,
      passed: status === 'passed',
      targetExpected: item.targetExpected,
      targetLabel: item.targetLabel ?? null,
      error: summarizeError(result),
    })
  }
}

const overall = createBucket()
const byProject = {}
const byPhenomenon = {}

for (const entry of entries) {
  byProject[entry.project] ??= createBucket()
  byPhenomenon[entry.phenomenon] ??= createBucket()
  apply(overall, entry)
  apply(byProject[entry.project], entry)
  apply(byPhenomenon[entry.phenomenon], entry)
}

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    evaluationSchemaVersion: evaluation.schemaVersion,
    targetTranche: evaluation.targetTranche ?? null,
    cases: evaluation.cases.length,
    executions: entries.length,
  },
  overall: finalize(overall),
  byProject: Object.fromEntries(Object.entries(byProject).map(([key, value]) => [key, finalize(value)])),
  byPhenomenon: Object.fromEntries(Object.entries(byPhenomenon).map(([key, value]) => [key, finalize(value)])),
  failures: entries.filter((entry) => !entry.passed),
  unmatchedSpecs,
}

writeFileSync('e2-v-evaluation-summary.json', `${JSON.stringify(report, null, 2)}\n`)

const percent = (value) => value === null ? '—' : `${(value * 100).toFixed(1)}%`
const rows = Object.entries(report.byProject)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([project, item]) => `| ${project} | ${item.total} | ${item.passed} | ${item.failed} | ${item.truePositive} | ${item.trueNegative} | ${item.falsePositive} | ${item.falseNegative} | ${percent(item.precision)} | ${percent(item.recall)} |`)
  .join('\n')

const phenomenonRows = Object.entries(report.byPhenomenon)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([phenomenon, item]) => `| ${phenomenon} | ${item.total} | ${item.passed} | ${item.failed} | ${percent(item.passRate)} | ${percent(item.precision)} | ${percent(item.recall)} |`)
  .join('\n')

const failureLines = report.failures.length === 0
  ? '- Nenhuma falha observada.'
  : report.failures.map((item) => `- \`${item.project}\` · \`${item.id}\` · ${item.targetExpected === true ? 'contrato positivo' : item.targetExpected === false ? 'contrato negativo' : 'contrato geral'} · status \`${item.status}\`${item.error ? ` — ${item.error.split('\n')[0]}` : ''}`).join('\n')

const markdown = `# Avaliação E2-V separada

Gerado em: ${report.generatedAt}

- tranche-alvo: \`${report.source.targetTranche ?? 'não declarada'}\`;
- casos: **${report.source.cases}**;
- execuções observadas: **${report.source.executions}**;
- taxa geral de aprovação: **${percent(report.overall.passRate)}**;
- precisão contratual do alvo: **${percent(report.overall.precision)}**;
- revocação contratual do alvo: **${percent(report.overall.recall)}**;
- acurácia contratual do alvo: **${percent(report.overall.targetAccuracy)}**.

## Por navegador

| Projeto | Total | Passou | Falhou | VP | VN | FP | FN | Precisão | Revocação |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows || '| — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |'}

## Por fenômeno

| Fenômeno | Total | Passou | Falhou | Aprovação | Precisão | Revocação |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${phenomenonRows || '| — | 0 | 0 | 0 | — | — | — |'}

## Erros observados

${failureLines}

## Limite metodológico

VP, VN, FP e FN são calculados apenas para casos que declaram \`targetExpected\`. Uma falha positiva pode representar ausência da análise-alvo ou erro de pessoa/modo; o detalhe permanece no relatório Playwright e não deve ser reduzido a uma alegação linguística sem inspeção.
`

writeFileSync('e2-v-evaluation-summary.md', markdown)
console.log(markdown)
