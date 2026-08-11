import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import {
  assembleSubjectObservedPool,
  assertExpectedAggregate,
  gitBlobSha,
  sha256Buffer,
} from './assemble-subject-observed-pool.mjs'
import { mineSubjectCandidates } from './mine-subject-candidates.mjs'

const config = JSON.parse(readFileSync(new URL('../docs/linguistics/synthetic/m1-r0-observed-pool-assembly.json', import.meta.url), 'utf8'))
const sourceRegistry = JSON.parse(readFileSync(new URL('../docs/corpora/m1-r0-subject-corpus-sources.json', import.meta.url), 'utf8'))
const source = sourceRegistry.sources.find((item) => item.id === config.source.sourceId)

assert.ok(source, 'Porttinari precisa existir no registro de corpora.')
assert.equal(source.revision, config.source.revision)
assert.equal(source.repository, config.source.repository)
assert.equal(source.license, config.source.license)
assert.equal(source.status, 'accepted_for_development_mining')
assert.equal(config.state, 'method_locked_private_output')
assert.equal(config.assemblyPolicy.mineEachSplitWithExistingMinerFirst, true)
assert.equal(config.assemblyPolicy.rebuildOnlyPreviousContextAcrossCombinedSentenceIndex, true)
assert.equal(config.assemblyPolicy.physicalFileOrderTrusted, false)
assert.equal(config.assemblyPolicy.automaticLinguisticDecision, false)
assert.equal(config.assemblyPolicy.humanAnnotationMustRemainPending, true)
assert.equal(config.assemblyPolicy.testSplitOpened, false)
assert.equal(config.assemblyPolicy.outputMustStayOutsideRepository, true)
assert.equal(config.boundaries.mayCreateHumanGold, false)
assert.equal(config.boundaries.mayCountAsHumanValidation, false)
assert.equal(config.boundaries.mayAuthorizeVerified, false)
assert.equal(config.boundaries.mayAuthorizeProductionSyntax, false)
assert.equal(config.boundaries.reservedSyntheticEvaluationOpened, false)
assert.equal(config.boundaries.testSplitOpened, false)
assert.equal(config.source.files.train.gitBlobSha, '6dac8d4a5b6bf208dc9146291e7b9014e404bc59')
assert.equal(config.source.files.dev.gitBlobSha, '19e5a75cec5087a7aa92dc112e21e9f9d74bdaa7')
assert.equal(config.source.files.train.expectedSentences, 5893)
assert.equal(config.source.files.dev.expectedSentences, 842)

const TRAIN_B1 = `# sent_id = AUDIT_DOC_B_SENT001
# text = Eles chegaram.
1\tEles\tele\tPRON\t_\tGender=Masc|Number=Plur|Person=3|PronType=Prs\t2\tnsubj\t2:nsubj\t_
2\tchegaram\tchegar\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t0:root\tSpaceAfter=No
3\t.\t.\tPUNCT\t_\t_\t2\tpunct\t2:punct\t_`

const TRAIN_A2 = `# sent_id = AUDIT_DOC_A_SENT002
# text = Chegaram cedo.
1\tChegaram\tchegar\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t0:root\t_
2\tcedo\tcedo\tADV\t_\t_\t1\tadvmod\t1:advmod\tSpaceAfter=No
3\t.\t.\tPUNCT\t_\t_\t1\tpunct\t1:punct\t_`

const DEV_B2 = `# sent_id = AUDIT_DOC_B_SENT002
# text = Voltaram tarde.
1\tVoltaram\tvoltar\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t0:root\t_
2\ttarde\ttarde\tADV\t_\t_\t1\tadvmod\t1:advmod\tSpaceAfter=No
3\t.\t.\tPUNCT\t_\t_\t1\tpunct\t1:punct\t_`

const DEV_A1 = `# sent_id = AUDIT_DOC_A_SENT001
# text = Os músicos saíram.
1\tOs\to\tDET\t_\tDefinite=Def|Gender=Masc|Number=Plur|PronType=Art\t2\tdet\t2:det\t_
2\tmúsicos\tmúsico\tNOUN\t_\tGender=Masc|Number=Plur\t3\tnsubj\t3:nsubj\t_
3\tsaíram\tsair\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t0:root\tSpaceAfter=No
4\t.\t.\tPUNCT\t_\t_\t3\tpunct\t3:punct\t_`

function conllu(...blocks) {
  return `${blocks.join('\n\n')}\n`
}

const trainContent = conllu(TRAIN_B1, TRAIN_A2)
const devContent = conllu(DEV_B2, DEV_A1)
const commonSource = {
  id: source.id,
  repository: source.repository,
  revision: source.revision,
  license: source.license,
}

const assembled = assembleSubjectObservedPool({
  trainContent,
  devContent,
  source: commonSource,
  fingerprints: {
    trainGitBlobSha: 'train-audit-blob',
    trainSha256: 'train-audit-sha256',
    devGitBlobSha: 'dev-audit-blob',
    devSha256: 'dev-audit-sha256',
    assemblyConfigSha256: 'config-audit-sha256',
  },
})

assert.equal(assembled.counts.sentences, 4)
assert.deepEqual(assembled.counts.sentencesBySplit, { train: 2, dev: 2 })
assert.equal(assembled.counts.sentencesWithTrustedPreviousContext, 2)
assert.equal(assembled.counts.candidates, 4)
assert.equal(assembled.counts.candidatesWithTrustedPreviousContext, 2)
assert.deepEqual(assembled.counts.byStructuralBucket, {
  explicit_subject_control: 2,
  no_direct_subject_candidate: 2,
})
assert.deepEqual(assembled.counts.crossSplitSentenceContinuity, {
  trainTargetPreviousDev: 1,
  devTargetPreviousTrain: 1,
})
assert.equal(assembled.counts.noDirectWithTrustedPreviousContext, 2)
assert.deepEqual(assembled.counts.noDirectTrustedPreviousByTargetSplit, { dev: 1, train: 1 })
assert.deepEqual(assembled.counts.noDirectTrustedPreviousByTargetDeprel, { root: 2 })

const byId = new Map(assembled.candidates.map((candidate) => [candidate.candidateId, candidate]))
const trainCrossId = `${source.id}:train:AUDIT_DOC_A_SENT002:1`
const devCrossId = `${source.id}:dev:AUDIT_DOC_B_SENT002:1`
const trainCross = byId.get(trainCrossId)
const devCross = byId.get(devCrossId)
assert.ok(trainCross)
assert.ok(devCross)
assert.equal(trainCross.source.split, 'train')
assert.equal(devCross.source.split, 'dev')
assert.equal(trainCross.previousContext.sentId, 'AUDIT_DOC_A_SENT001')
assert.equal(devCross.previousContext.sentId, 'AUDIT_DOC_B_SENT001')
assert.equal(trainCross.previousContext.continuity, 'same_document_consecutive_sentence_id')
assert.equal(devCross.previousContext.continuity, 'same_document_consecutive_sentence_id')
assert.deepEqual(trainCross.signals.previousPluralNominals.map((item) => item.form), ['músicos'])
assert.deepEqual(devCross.signals.previousPluralNominals.map((item) => item.form), ['Eles'])

const minerMetadata = {
  sourceId: source.id,
  repository: source.repository,
  revision: source.revision,
  license: source.license,
}
const trainMined = mineSubjectCandidates(trainContent, { ...minerMetadata, split: 'train' })
const devMined = mineSubjectCandidates(devContent, { ...minerMetadata, split: 'dev' })
const individuallyMined = new Map(
  [...trainMined.candidates, ...devMined.candidates].map((candidate) => [candidate.candidateId, candidate]),
)
assert.equal(individuallyMined.get(trainCrossId).previousContext, null)
assert.equal(individuallyMined.get(devCrossId).previousContext, null)
for (const candidate of assembled.candidates) {
  const original = individuallyMined.get(candidate.candidateId)
  assert.ok(original, `Candidato montado não existia no minerador-base: ${candidate.candidateId}`)
  assert.equal(candidate.structuralBucket, original.structuralBucket)
  assert.deepEqual(candidate.exclusions, original.exclusions)
  assert.deepEqual(candidate.target, original.target)
  assert.equal(candidate.source.split, original.source.split)
  assert.equal(candidate.humanAnnotation.status, 'pending')
  assert.equal(candidate.humanAnnotation.label, null)
  assert.deepEqual(candidate.humanAnnotation.annotators, [])
}

const reordered = assembleSubjectObservedPool({
  trainContent: conllu(TRAIN_A2, TRAIN_B1),
  devContent: conllu(DEV_A1, DEV_B2),
  source: commonSource,
  fingerprints: assembled.inputFingerprints,
})
assert.deepEqual(
  reordered,
  assembled,
  'A ordem física dos blocos CoNLL-U não pode mudar o pool observado montado.',
)

const syntheticExpectedConfig = {
  expectedAggregate: {
    sentences: 4,
    sentencesWithTrustedPreviousContext: 2,
    candidates: 4,
    candidatesWithTrustedPreviousContext: 2,
    byStructuralBucket: {
      explicit_subject_control: 2,
      no_direct_subject_candidate: 2,
    },
    crossSplitSentenceContinuity: {
      trainTargetPreviousDev: 1,
      devTargetPreviousTrain: 1,
    },
    noDirectWithTrustedPreviousContext: 2,
    noDirectTrustedPreviousByTargetSplit: { train: 1, dev: 1 },
    noDirectTrustedPreviousByTargetDeprel: { root: 2 },
  },
}
assert.doesNotThrow(() => assertExpectedAggregate(assembled, syntheticExpectedConfig))
assert.throws(
  () => assertExpectedAggregate(assembled, {
    expectedAggregate: { ...syntheticExpectedConfig.expectedAggregate, sentences: 5 },
  }),
  /sentences: esperado 5, recebido 4/u,
)

const duplicateDev = devContent.replaceAll('AUDIT_DOC_A_SENT001', 'AUDIT_DOC_B_SENT001')
assert.throws(
  () => assembleSubjectObservedPool({
    trainContent,
    devContent: duplicateDev,
    source: commonSource,
  }),
  /Posição documental duplicada/u,
)

const hello = Buffer.from('hello\n', 'utf8')
assert.equal(gitBlobSha(hello), 'ce013625030ba8dba906f756967f9e9ca394464a')
assert.equal(sha256Buffer(hello), '5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03')

assert.equal(assembled.boundaries.networkUsedByAssembler, false)
assert.equal(assembled.boundaries.automaticDownload, false)
assert.equal(assembled.boundaries.linguisticDecisionMade, false)
assert.equal(assembled.boundaries.humanAnnotationProduced, false)
assert.equal(assembled.boundaries.testSplitOpened, false)
assert.equal(assembled.boundaries.reservedSyntheticEvaluationOpened, false)
assert.equal(assembled.boundaries.maySupportVerified, false)
assert.equal(assembled.boundaries.mayAuthorizeProductionSyntax, false)
assert.equal(assembled.boundaries.physicalFileOrderTrustedAsDiscourseOrder, false)

console.log('M1-R0 montagem observada sintética: 4 sentenças, 4 candidatos')
console.log('Continuidade dev→train reconstruída: true')
console.log('Continuidade train→dev reconstruída: true')
console.log('Ordem física irrelevante: true')
console.log('Classificação do minerador-base preservada: true')
console.log('Anotação humana produzida: false')
console.log('test aberto: false')
console.log('Auditoria da montagem observada aprovada: continuidade cross-split, determinismo, proveniência e fronteiras íntegras.')
