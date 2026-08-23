import { readFileSync, writeFileSync } from 'node:fs'
import { mineSubjectCandidates, parseConllu } from './mine-subject-candidates.mjs'

const fixtureUrl = new URL('../tests/fixtures/subject-miner-original.conllu', import.meta.url)
const minerUrl = new URL('./mine-subject-candidates.mjs', import.meta.url)
const fixture = readFileSync(fixtureUrl, 'utf8')
const minerSource = readFileSync(minerUrl, 'utf8')
const violations = []

function fail(code, detail) {
  violations.push({ code, detail })
}

function assert(condition, code, detail) {
  if (!condition) fail(code, detail)
}

const forbiddenNetworkPatterns = [
  /\bfetch\s*\(/u,
  /\bXMLHttpRequest\b/u,
  /\bnode:https?\b/u,
  /\bhttps?:\/\//u,
  /\bchild_process\b/u,
]
for (const pattern of forbiddenNetworkPatterns) {
  assert(!pattern.test(minerSource), 'network-or-shell-capability', String(pattern))
}

assert(!/subject-recoverability-evaluation\.json/u.test(minerSource), 'reserved-evaluation-imported', 'miner source')
assert(!/subject_recoverable|subject_indeterminate|subject_ambiguous/u.test(minerSource), 'linguistic-label-hardcoded', 'miner source')
assert(/Split \$\{split\} bloqueado/u.test(minerSource), 'test-split-guard-missing', 'miner source')
assert(/accepted_for_development_mining/u.test(minerSource), 'source-approval-guard-missing', 'miner source')
assert(/deve ficar fora do diretório do repositório/u.test(minerSource), 'repository-boundary-guard-missing', 'miner source')
assert(/flag: 'wx'/u.test(minerSource), 'private-output-overwrite-guard-missing', 'miner source')
assert(/fileOrderTrustedAsDiscourseOrder: false/u.test(minerSource), 'physical-order-trust-not-denied', 'miner source')
assert(/previousContextRequiresSameDocumentConsecutiveId: true/u.test(minerSource), 'trusted-context-contract-missing', 'miner source')

const sentences = parseConllu(fixture)
assert(sentences.length === 7, 'unexpected-sentence-count', sentences.length)
assert(sentences.every((sentence) => sentence.sentId.startsWith('project-dev-')), 'fixture-provenance-missing', 'sent_id')

const report = mineSubjectCandidates(fixture, {
  sourceId: 'project-original-fixture',
  repository: 'rfmss/escrevaral',
  revision: 'fixture-v1',
  split: 'dev',
  license: 'project-original',
})

assert(report.boundaries.networkUsed === false, 'network-boundary-opened', report.boundaries)
assert(report.boundaries.automaticDownload === false, 'download-boundary-opened', report.boundaries)
assert(report.boundaries.linguisticDecisionMade === false, 'decision-boundary-opened', report.boundaries)
assert(report.boundaries.testSplitOpened === false, 'test-split-opened', report.boundaries)
assert(report.boundaries.requiresHumanAnnotation === true, 'human-review-not-required', report.boundaries)
assert(report.boundaries.maySupportVerified === false, 'verified-boundary-opened', report.boundaries)
assert(report.boundaries.fileOrderTrustedAsDiscourseOrder === false, 'physical-order-trusted', report.boundaries)
assert(report.boundaries.previousContextRequiresSameDocumentConsecutiveId === true, 'context-continuity-opened', report.boundaries)
assert(report.counts.sentences === 7, 'report-sentence-count', report.counts.sentences)
assert(report.counts.candidates === 7, 'report-candidate-count', report.counts.candidates)
assert(report.counts.byStructuralBucket.explicit_subject_control === 3, 'explicit-control-count', report.counts.byStructuralBucket)
assert(report.counts.byStructuralBucket.no_direct_subject_candidate === 2, 'no-subject-candidate-count', report.counts.byStructuralBucket)
assert(report.counts.byStructuralBucket.outside_initial_scope === 2, 'outside-scope-count', report.counts.byStructuralBucket)

const ids = report.candidates.map((candidate) => candidate.candidateId)
assert(new Set(ids).size === ids.length, 'duplicate-candidate-id', ids)
assert(report.candidates.every((candidate) => candidate.humanAnnotation.status === 'pending'), 'annotation-status-not-pending', 'all candidates')
assert(report.candidates.every((candidate) => candidate.humanAnnotation.label === null), 'automatic-label-produced', 'all candidates')
assert(report.candidates.every((candidate) => candidate.source.split === 'dev'), 'split-not-preserved', 'all candidates')
assert(report.candidates.every((candidate) => candidate.source.revision === 'fixture-v1'), 'revision-not-preserved', 'all candidates')
assert(report.candidates.every((candidate) => candidate.source.sentId.startsWith('project-dev-')), 'sent-id-not-preserved', 'all candidates')

const contextual = report.candidates.find((candidate) => candidate.source.sentId === 'project-dev-004')
assert(Boolean(contextual), 'contextual-candidate-missing', 'project-dev-004')
assert(contextual?.target.form === 'gritaram', 'contextual-target-wrong', contextual?.target)
assert(contextual?.structuralBucket === 'no_direct_subject_candidate', 'contextual-bucket-wrong', contextual?.structuralBucket)
assert(contextual?.previousContext?.sentId === 'project-dev-003', 'previous-context-id-missing', contextual?.previousContext)
assert(contextual?.previousContext?.continuity === 'same_document_consecutive_sentence_id', 'previous-context-continuity-missing', contextual?.previousContext)
assert(
  contextual?.previousContext?.pluralNominals.map((item) => item.lemma).join('|') === 'guarda|viajante',
  'competing-previous-referents-not-preserved',
  contextual?.previousContext?.pluralNominals,
)

const explicit = report.candidates.find((candidate) => candidate.source.sentId === 'project-dev-001')
assert(explicit?.signals.directSubjects[0]?.lemma === 'sentinela', 'direct-subject-not-preserved', explicit?.signals.directSubjects)

const seCase = report.candidates.find((candidate) => candidate.source.sentId === 'project-dev-005')
assert(seCase?.structuralBucket === 'outside_initial_scope', 'se-case-not-excluded', seCase?.structuralBucket)
assert(seCase?.exclusions.includes('contains_se'), 'se-signal-missing', seCase?.exclusions)
assert(seCase?.exclusions.includes('passive_signal'), 'passive-signal-missing', seCase?.exclusions)

const auxiliary = report.candidates.find((candidate) => candidate.source.sentId === 'project-dev-006')
assert(auxiliary?.target.upos === 'AUX', 'auxiliary-target-missing', auxiliary?.target)
assert(auxiliary?.exclusions.includes('finite_auxiliary'), 'auxiliary-exclusion-missing', auxiliary?.exclusions)
assert(auxiliary?.exclusions.includes('passive_signal'), 'auxiliary-passive-signal-missing', auxiliary?.exclusions)

const continuityFixture = `# sent_id = PROJECT_DOCA_SENT001
# text = As guardiãs fecharam o portão.
1\tAs\to\tDET\t_\tDefinite=Def|Gender=Fem|Number=Plur|PronType=Art\t2\tdet\t_\t_
2\tguardiãs\tguardiã\tNOUN\t_\tGender=Fem|Number=Plur\t3\tnsubj\t_\t_
3\tfecharam\tfechar\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t_\tSpaceAfter=No
4\t.\t.\tPUNCT\t_\t_\t3\tpunct\t_\t_

# sent_id = PROJECT_DOCB_SENT002
# text = Bateram no vidro.
1\tBateram\tbater\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t_\t_
2\tem\tem\tADP\t_\t_\t4\tcase\t_\t_
3\to\to\tDET\t_\tDefinite=Def|Gender=Masc|Number=Sing|PronType=Art\t4\tdet\t_\t_
4\tvidro\tvidro\tNOUN\t_\tGender=Masc|Number=Sing\t1\tobl\t_\tSpaceAfter=No
5\t.\t.\tPUNCT\t_\t_\t1\tpunct\t_\t_

# sent_id = PROJECT_DOCA_SENT002
# text = Depois correram para a torre.
1\tDepois\tdepois\tADV\t_\t_\t2\tadvmod\t_\t_
2\tcorreram\tcorrer\tVERB\t_\tMood=Ind|Number=Plur|Person=3|Tense=Past|VerbForm=Fin\t0\troot\t_\t_
3\tpara\tpara\tADP\t_\t_\t5\tcase\t_\t_
4\ta\to\tDET\t_\tDefinite=Def|Gender=Fem|Number=Sing|PronType=Art\t5\tdet\t_\t_
5\ttorre\ttorre\tNOUN\t_\tGender=Fem|Number=Sing\t2\tobl\t_\tSpaceAfter=No
6\t.\t.\tPUNCT\t_\t_\t2\tpunct\t_\t_
`

const continuityReport = mineSubjectCandidates(continuityFixture, {
  sourceId: 'project-context-order-fixture',
  repository: 'rfmss/escrevaral',
  revision: 'fixture-v1',
  split: 'dev',
  license: 'project-original',
})
const unrelatedPhysicalPrevious = continuityReport.candidates.find((candidate) => candidate.source.sentId === 'PROJECT_DOCB_SENT002')
const sameDocumentPrevious = continuityReport.candidates.find((candidate) => candidate.source.sentId === 'PROJECT_DOCA_SENT002')
assert(unrelatedPhysicalPrevious?.previousContext === null, 'cross-document-physical-context-accepted', unrelatedPhysicalPrevious?.previousContext)
assert(sameDocumentPrevious?.previousContext?.sentId === 'PROJECT_DOCA_SENT001', 'out-of-order-document-context-lost', sameDocumentPrevious?.previousContext)
assert(sameDocumentPrevious?.previousContext?.continuity === 'same_document_consecutive_sentence_id', 'trusted-context-proof-missing', sameDocumentPrevious?.previousContext)
assert(continuityReport.counts.sentencesWithTrustedPreviousContext === 1, 'trusted-sentence-context-count', continuityReport.counts)
assert(continuityReport.counts.candidatesWithTrustedPreviousContext === 1, 'trusted-candidate-context-count', continuityReport.counts)

let testSplitRejected = false
try {
  mineSubjectCandidates(fixture, {
    sourceId: 'project-original-fixture',
    revision: 'fixture-v1',
    split: 'test',
  })
} catch (error) {
  testSplitRejected = /bloqueado/u.test(error instanceof Error ? error.message : String(error))
}
assert(testSplitRejected, 'test-split-not-rejected', 'mineSubjectCandidates')

const safeProjection = report.candidates.map((candidate) => ({
  candidateId: candidate.candidateId,
  structuralBucket: candidate.structuralBucket,
  exclusions: candidate.exclusions,
  sentId: candidate.source.sentId,
  target: candidate.target.form,
  previousContextSentId: candidate.previousContext?.sentId ?? null,
}))

const audit = {
  generatedAt: new Date().toISOString(),
  fixture: {
    origin: 'project_original',
    copied: false,
    sentences: sentences.length,
    physicalOrderTrustedAsDiscourseOrder: false,
  },
  miner: {
    networkCapability: false,
    shellCapability: false,
    automaticDownload: false,
    testSplitAccepted: false,
    automaticLinguisticLabel: false,
    repositoryInputOrOutputAcceptedByCli: false,
    previousContextRequiresSameDocumentConsecutiveId: true,
  },
  report: {
    counts: report.counts,
    boundaries: report.boundaries,
    safeProjection,
  },
  continuityProbe: {
    physicalOrderCrossDocumentRejected: unrelatedPhysicalPrevious?.previousContext === null,
    outOfOrderSameDocumentRecovered: sameDocumentPrevious?.previousContext?.sentId === 'PROJECT_DOCA_SENT001',
    counts: continuityReport.counts,
  },
  violations,
}

writeFileSync('m1-r0-subject-miner-audit.json', `${JSON.stringify(audit, null, 2)}\n`)

console.log(`M1-R0 minerador: ${report.counts.sentences} sentenças originais`)
console.log(`M1-R0 minerador: ${report.counts.candidates} candidatos estruturais`)
console.log(`M1-R0 controles explícitos: ${report.counts.byStructuralBucket.explicit_subject_control}`)
console.log(`M1-R0 sem sujeito direto: ${report.counts.byStructuralBucket.no_direct_subject_candidate}`)
console.log(`M1-R0 fora do escopo inicial: ${report.counts.byStructuralBucket.outside_initial_scope}`)
console.log('M1-R0 ordem física tratada como contexto: false')
console.log('M1-R0 decisão linguística automática: false')
console.log('M1-R0 split test aceito: false')

if (violations.length > 0) {
  console.error('Auditoria do minerador M1-R0 falhou:', violations)
  process.exit(1)
}

console.log('Auditoria do minerador M1-R0 aprovada: parser local, proveniência, continuidade documental e fronteiras não decisórias íntegras.')
