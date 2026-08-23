import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { selectPrivatePilot } from './select-subject-synthetic-pilot.mjs'

const config = JSON.parse(readFileSync(new URL('../docs/linguistics/synthetic/m1-r0-private-pilot-selection.json', import.meta.url), 'utf8'))
const sourceRegistry = JSON.parse(readFileSync(new URL('../docs/corpora/m1-r0-subject-corpus-sources.json', import.meta.url), 'utf8'))
const porttinari = sourceRegistry.sources.find((source) => source.id === config.source.sourceId)

assert.ok(porttinari, 'Porttinari precisa existir no registro de corpora.')
assert.equal(porttinari.revision, config.source.revision)
assert.equal(porttinari.status, 'accepted_for_development_mining')
assert.equal(config.state, 'method_locked_cases_private')
assert.equal(config.boundaries.usesLinguisticAnswerForSelection, false)
assert.equal(config.boundaries.usesModelOutputForSelection, false)
assert.equal(config.boundaries.usesHumanLabelForSelection, false)
assert.equal(config.boundaries.mayCreateHumanGold, false)
assert.equal(config.boundaries.mayAuthorizeVerified, false)
assert.equal(config.boundaries.mayAuthorizeProductionSyntax, false)
assert.equal(config.boundaries.testSplitOpened, false)
assert.equal(config.outputs.observedPackageMustStayOutsideRepository, true)
assert.equal(config.outputs.selectionManifestMustStayOutsideRepository, true)
assert.equal(config.outputs.manifestMayContainObservedText, false)
assert.equal(config.candidatePool.expectedEligibleCount, 67)
assert.equal(config.candidatePool.sampleSize, 12)
assert.equal(config.controlPool.sampleSize, 4)
assert.equal(config.outputs.selectedPackageSize, 16)
assert.equal(config.ordering.operationalPilot.size, 4)

const expectedStrata = config.candidatePool.expectedStratumCounts
const expectedSplitCounts = config.candidatePool.expectedTargetSplitCounts
assert.deepEqual(expectedStrata, {
  conj: 32,
  root: 14,
  ccomp: 7,
  advcl: 7,
  'acl:relcl': 5,
  parataxis: 1,
  'ccomp:speech': 1,
})
assert.deepEqual(expectedSplitCounts, { train: 56, dev: 11 })
assert.deepEqual(config.candidatePool.fixedStratumQuotas, {
  conj: 4,
  root: 2,
  ccomp: 2,
  advcl: 1,
  'acl:relcl': 1,
  parataxis: 1,
  'ccomp:speech': 1,
})

function fakeCandidate({ index, split, deprel, bucket = 'no_direct_subject_candidate' }) {
  const sentId = `fake_doc_${String(index).padStart(3, '0')}_SENT2`
  return {
    candidateId: `${config.source.sourceId}:${split}:${sentId}:2`,
    source: {
      sourceId: config.source.sourceId,
      repository: porttinari.repository,
      revision: config.source.revision,
      split,
      license: porttinari.license,
      sentId,
    },
    sentence: {
      text: `Sentença original sintética de auditoria ${index}.`,
      tokenCount: 6,
    },
    previousContext: {
      sentId: `fake_doc_${String(index).padStart(3, '0')}_SENT1`,
      text: `Contexto original sintético de auditoria ${index}.`,
      pluralNominals: [],
      continuity: config.candidatePool.requiredContinuity,
    },
    target: {
      id: 2,
      form: 'chegaram',
      lemma: 'chegar',
      upos: 'VERB',
      head: 0,
      deprel,
      features: { VerbForm: 'Fin', Person: '3', Number: 'Plur' },
    },
    structuralBucket: bucket,
    exclusions: [],
    signals: {
      directSubjects: bucket === 'explicit_subject_control' ? [{ id: 1, form: 'eles', deprel: 'nsubj' }] : [],
      sentencePluralNominals: [],
      previousPluralNominals: [],
      passive: [],
      se: [],
      impersonal: [],
    },
    humanAnnotation: {
      status: 'pending',
      label: null,
      confidence: null,
      referent: null,
      rationale: null,
      annotators: [],
    },
  }
}

const noDirect = []
let index = 1
let remainingTrain = expectedSplitCounts.train
for (const [deprel, count] of Object.entries(expectedStrata)) {
  for (let ordinal = 0; ordinal < count; ordinal += 1) {
    const split = remainingTrain > 0 ? 'train' : 'dev'
    if (remainingTrain > 0) remainingTrain -= 1
    noDirect.push(fakeCandidate({ index, split, deprel }))
    index += 1
  }
}
assert.equal(noDirect.length, 67)
assert.equal(noDirect.filter((candidate) => candidate.source.split === 'train').length, 56)
assert.equal(noDirect.filter((candidate) => candidate.source.split === 'dev').length, 11)

const controls = Array.from({ length: 20 }, (_, controlIndex) => fakeCandidate({
  index: 1000 + controlIndex,
  split: controlIndex < 16 ? 'train' : 'dev',
  deprel: controlIndex % 2 === 0 ? 'root' : 'conj',
  bucket: 'explicit_subject_control',
}))

const fingerprints = {
  candidatePoolSha256: 'a'.repeat(64),
  controlPoolSha256: 'b'.repeat(64),
  selectionConfigSha256: 'c'.repeat(64),
}
const first = selectPrivatePilot(noDirect, controls, config, fingerprints)
const second = selectPrivatePilot(noDirect, controls, config, fingerprints)

assert.deepEqual(
  first.manifest.selected.map((item) => item.candidateId),
  second.manifest.selected.map((item) => item.candidateId),
  'Mesmos IDs e mesma configuração precisam produzir a mesma seleção e ordem.',
)
assert.equal(first.packageSha256, second.packageSha256)
assert.equal(first.manifest.counts.selectedNoDirect, 12)
assert.equal(first.manifest.counts.selectedControls, 4)
assert.equal(first.manifest.counts.selectedTotal, 16)
assert.equal(first.manifest.counts.operationalPilot, 4)
assert.deepEqual(first.manifest.selectedNoDirectStrata, config.candidatePool.fixedStratumQuotas)
assert.equal(first.packageObject.boundaries.countsAsHumanValidation, false)
assert.equal(first.packageObject.boundaries.mayCreateHumanGold, false)
assert.equal(first.packageObject.boundaries.mayAuthorizeProductionSyntax, false)

const pilotEntries = first.manifest.selected.filter((item) => item.operationalPilot)
assert.equal(pilotEntries.length, 4)
assert.equal(pilotEntries.filter((item) => item.kind === 'no_direct_subject_candidate').length, 3)
assert.equal(pilotEntries.filter((item) => item.kind === 'explicit_subject_control').length, 1)
assert.equal(new Set(
  pilotEntries
    .filter((item) => item.kind === 'no_direct_subject_candidate')
    .map((item) => item.structuralStratum),
).size, 3)
assert.deepEqual(first.manifest.selected.slice(0, 4).map((item) => item.operationalPilot), [true, true, true, true])

const manifestSerialized = JSON.stringify(first.manifest)
assert.equal(manifestSerialized.includes('Sentença original sintética'), false)
assert.equal(manifestSerialized.includes('Contexto original sintético'), false)
assert.equal(manifestSerialized.includes('sentence.text'), false)

const textMutated = noDirect.map((candidate) => ({
  ...candidate,
  sentence: { ...candidate.sentence, text: `TEXTO MUTADO ${candidate.candidateId}` },
  previousContext: { ...candidate.previousContext, text: `CONTEXTO MUTADO ${candidate.candidateId}` },
}))
const mutatedResult = selectPrivatePilot(textMutated, controls, config, fingerprints)
assert.deepEqual(
  first.manifest.selected.map((item) => item.candidateId),
  mutatedResult.manifest.selected.map((item) => item.candidateId),
  'Mudar o conteúdo textual sem mudar metadados/IDs não pode mudar a seleção.',
)
assert.notEqual(first.packageSha256, mutatedResult.packageSha256, 'O fingerprint do pacote precisa acusar mudança textual.')

assert.throws(
  () => selectPrivatePilot(noDirect.slice(0, -1), controls, config, fingerprints),
  /esperado 67, recebido 66/u,
)

const testSplitPool = noDirect.map((candidate, candidateIndex) => candidateIndex === 0
  ? { ...candidate, source: { ...candidate.source, split: 'test' } }
  : candidate)
assert.throws(
  () => selectPrivatePilot(testSplitPool, controls, config, fingerprints),
  /split bloqueado test/u,
)

const labeledPool = noDirect.map((candidate, candidateIndex) => candidateIndex === 0
  ? { ...candidate, humanAnnotation: { ...candidate.humanAnnotation, status: 'done', label: 'subject_recoverable' } }
  : candidate)
assert.throws(
  () => selectPrivatePilot(labeledPool, controls, config, fingerprints),
  /esperado 67, recebido 66/u,
)

console.log(`M1-R0 pool canônico exigido: ${config.candidatePool.expectedEligibleCount} candidatos`) 
console.log(`Amostra privada: ${config.candidatePool.sampleSize} candidatos + ${config.controlPool.sampleSize} controles`)
console.log(`Estratos cobertos: ${Object.keys(config.candidatePool.fixedStratumQuotas).length}/${Object.keys(config.candidatePool.expectedStratumCounts).length}`)
console.log(`Piloto operacional: ${config.ordering.operationalPilot.noDirectCases} candidatos de estratos distintos + ${config.ordering.operationalPilot.explicitControls} controle`)
console.log('Seleção depende do texto: false')
console.log('Manifesto contém texto observado: false')
console.log('Auditoria do seletor aprovada: pool, quotas, determinismo, cegamento e bloqueio de test/gold íntegros.')
