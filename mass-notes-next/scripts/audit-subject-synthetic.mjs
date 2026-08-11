import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import {
  buildBlindCase,
  computePanelDecision,
  computePanelMetrics,
  validateAnnotation,
} from './annotate-subject-synthetic.mjs'

const config = JSON.parse(readFileSync(new URL('../docs/linguistics/synthetic/m1-r0-synthetic-panel.json', import.meta.url), 'utf8'))

const originalCandidate = {
  candidateId: 'ud-portuguese-porttinari-2.18:train:documento_SENT10:3',
  source: { split: 'train', revision: 'segredo-estrutural' },
  sentence: { text: 'Depois, chegaram cedo ao encontro.' },
  previousContext: { text: 'As pesquisadoras deixaram o laboratório ao amanhecer.' },
  target: { form: 'chegaram', deprel: 'root', features: { Person: '3', Number: 'Plur' } },
  structuralBucket: 'no_direct_subject_candidate',
  signals: { previousPluralNominals: ['pesquisadoras'] },
}

const blind = buildBlindCase(originalCandidate)
const serializedBlind = JSON.stringify(blind)
for (const forbidden of ['Porttinari', ':train:', 'deprel', 'structuralBucket', 'signals', 'segredo-estrutural']) {
  assert.equal(serializedBlind.includes(forbidden), false, `Payload cego vazou ${forbidden}`)
}
assert.equal(blind.sentence, 'Depois, chegaram cedo ao encontro.')
assert.equal(blind.previousContext, 'As pesquisadoras deixaram o laboratório ao amanhecer.')
assert.equal(blind.targetForm, 'chegaram')

const annotation = validateAnnotation({
  label: 'subject_recoverable',
  confidence: 0.91,
  recoveryScope: 'previous_sentence',
  referent: 'as pesquisadoras',
  rationale: 'O plural da sentença anterior oferece antecedente discursivo direto.',
  flags: [],
})
assert.equal(annotation.label, 'subject_recoverable')

const stable = computePanelDecision([
  { annotation: { ...annotation, confidence: 0.91 } },
  { annotation: { ...annotation, confidence: 0.88 } },
  { annotation: { ...annotation, confidence: 0.84 } },
], config.consensus)
assert.equal(stable.state, 'stable_synthetic')

const provisional = computePanelDecision([
  { annotation: { ...annotation, confidence: 0.81 } },
  { annotation: { ...annotation, confidence: 0.79 } },
  { annotation: { ...annotation, label: 'subject_ambiguous', confidence: 0.70 } },
], config.consensus)
assert.equal(provisional.state, 'provisional_synthetic')

const review = computePanelDecision([
  { annotation: { ...annotation, label: 'subject_recoverable', confidence: 0.70 } },
  { annotation: { ...annotation, label: 'subject_indeterminate', confidence: 0.70 } },
  { annotation: { ...annotation, label: 'subject_ambiguous', confidence: 0.70 } },
], config.consensus)
assert.equal(review.state, 'needs_review')

const profileIds = config.profiles.map((profile) => profile.id)
const makeCase = (labels) => ({
  judgments: profileIds.map((annotatorId, index) => ({
    annotatorId,
    annotation: { ...annotation, label: labels[index], confidence: 0.9 },
  })),
  decision: computePanelDecision(profileIds.map((_, index) => ({
    annotation: { ...annotation, label: labels[index], confidence: 0.9 },
  })), config.consensus),
})
const metrics = computePanelMetrics([
  makeCase(['subject_recoverable', 'subject_recoverable', 'subject_recoverable']),
  makeCase(['subject_indeterminate', 'subject_indeterminate', 'subject_ambiguous']),
  makeCase(['explicit_subject_control', 'explicit_subject_control', 'explicit_subject_control']),
  makeCase(['subject_ambiguous', 'subject_ambiguous', 'subject_indeterminate']),
], profileIds)
assert.equal(metrics.cases, 4)
assert.equal(metrics.pairwise.length, 3)
assert.equal(metrics.pairwise.every((pair) => pair.compared === 4), true)

assert.equal(config.boundaries.countsAsHumanValidation, false)
assert.equal(config.boundaries.mayCreateHumanGold, false)
assert.equal(config.boundaries.mayAuthorizeVerified, false)
assert.equal(config.boundaries.remoteExecutionRequiresExplicitOptIn, true)
assert.equal(config.profiles.length, 3)

console.log(`M1-R0 pré-banca sintética: ${config.profiles.length} perfis`)
console.log(`Rótulos contratados: ${config.labels.length}`)
console.log('Payload estrutural ocultado: true')
console.log(`Gold humano produzido: ${config.boundaries.mayCreateHumanGold}`)
console.log(`Validação humana produzida: ${config.boundaries.countsAsHumanValidation}`)
console.log('Auditoria da pré-banca sintética aprovada: cegamento, consenso e fronteira humano/sintético íntegros.')
