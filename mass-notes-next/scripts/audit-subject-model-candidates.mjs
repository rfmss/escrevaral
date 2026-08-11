import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import {
  annotationJsonSchema,
  resolveRotation,
  verifyInstalledModels,
} from './run-subject-synthetic-rotation.mjs'

const panel = JSON.parse(readFileSync(new URL('../docs/linguistics/synthetic/m1-r0-synthetic-panel.json', import.meta.url), 'utf8'))
const registry = JSON.parse(readFileSync(new URL('../docs/linguistics/synthetic/m1-r0-model-candidates.json', import.meta.url), 'utf8'))

assert.equal(registry.state, 'research_candidates_not_baseline')
assert.equal(registry.selectionPolicy.candidateIsNotBaselineByRegistration, true)
assert.equal(registry.selectionPolicy.defaultExecutionLocal, true)
assert.equal(registry.selectionPolicy.remoteExecutionAllowedInThisPlan, false)
assert.equal(registry.selectionPolicy.weightsMayEnterRepository, false)
assert.equal(registry.executionPolicy.provider, 'ollama')
assert.match(registry.executionPolicy.baseUrl, /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/u)
assert.equal(registry.executionPolicy.profileMajorOrder, true)
assert.equal(registry.executionPolicy.structuredJsonSchema, true)
assert.equal(registry.executionPolicy.captureLocalModelDigest, true)
assert.equal(registry.executionPolicy.capturePrivateInputSha256, true)
assert.equal(registry.executionPolicy.sameProfileSeedAcrossModels, true)
assert.equal(registry.executionPolicy.keepPrivateInputOutsideRepository, true)
assert.equal(registry.executionPolicy.keepObservedOutputOutsideRepository, true)
assert.equal(registry.executionPolicy.firstOperationalPilotCases, 4)
assert.equal(registry.executionPolicy.fullPrivatePackageCases, 16)

assert.equal(registry.candidates.length, 3)
assert.equal(new Set(registry.candidates.map((candidate) => candidate.family)).size, 3)
assert.equal(registry.candidates.every((candidate) => candidate.baseline === false), true)
assert.equal(registry.candidates.every((candidate) => candidate.weightsLicense === 'Apache-2.0'), true)
assert.equal(registry.candidates.every((candidate) => candidate.portugueseEvidence?.localPtBrBenchmarkRequired === true), true)
assert.equal(registry.candidates.every((candidate) => Array.isArray(candidate.sources) && candidate.sources.length >= 2), true)
assert.equal(registry.candidates.every((candidate) => /^[0-9a-f]{12}$/u.test(candidate.ollama?.publishedDigestPrefix ?? '')), true)
assert.equal(registry.candidates.every((candidate) => typeof candidate.ollama?.tag === 'string' && candidate.ollama.tag.includes(':')), true)

const profileIds = panel.profiles.map((profile) => profile.id)
const candidateIds = registry.candidates.map((candidate) => candidate.id)
assert.equal(profileIds.length, 3)
assert.equal(registry.rotations.length, 3)
assert.deepEqual(registry.executionPolicy.rotationOrder, registry.rotations.map((rotation) => rotation.id))

const seenByProfile = new Map(profileIds.map((profileId) => [profileId, new Set()]))
for (const rotation of registry.rotations) {
  assert.deepEqual(Object.keys(rotation.assignments).sort(), [...profileIds].sort())
  const roundCandidates = profileIds.map((profileId) => rotation.assignments[profileId])
  assert.equal(new Set(roundCandidates).size, candidateIds.length)
  assert.equal(roundCandidates.every((candidateId) => candidateIds.includes(candidateId)), true)
  for (const profileId of profileIds) seenByProfile.get(profileId).add(rotation.assignments[profileId])
}
for (const profileId of profileIds) {
  assert.deepEqual([...seenByProfile.get(profileId)].sort(), [...candidateIds].sort())
  assert.equal(Number.isInteger(registry.executionPolicy.seedBaseByProfile[profileId]), true)
}

assert.equal(registry.interpretation.candidateRegistrationDoesNotElectBaseline, true)
assert.equal(registry.interpretation.syntheticAgreementIsNotHumanAgreement, true)
assert.equal(registry.interpretation.humanValidationStillRequiredLater, true)
assert.equal(panel.boundaries.countsAsHumanValidation, false)
assert.equal(panel.boundaries.mayCreateHumanGold, false)
assert.equal(panel.boundaries.mayAuthorizeVerified, false)

const resolvedRoundA = resolveRotation(panel, registry, 'round-a')
assert.deepEqual(resolvedRoundA.assignments.map((item) => item.candidate.id), [
  'qwen35-9b',
  'mistral-nemo-12b',
  'granite33-8b',
])
const schema = annotationJsonSchema(panel)
assert.equal(schema.additionalProperties, false)
assert.deepEqual(schema.properties.label.enum.sort(), panel.labels.map((item) => item.id).sort())
assert.deepEqual(schema.properties.recoveryScope.enum.sort(), [...panel.recoveryScopes].sort())

const fakeInstalled = resolvedRoundA.assignments.map(({ candidate }) => ({
  name: candidate.ollama.tag,
  model: candidate.ollama.tag,
  digest: `${candidate.ollama.publishedDigestPrefix}${'0'.repeat(52)}`,
  size: 123,
  details: { quantization_level: candidate.ollama.quantization },
}))
const snapshots = verifyInstalledModels(resolvedRoundA.assignments, fakeInstalled)
assert.equal(snapshots.length, 3)
assert.equal(snapshots.every((item) => item.digest.length === 64), true)
assert.throws(() => verifyInstalledModels(resolvedRoundA.assignments, fakeInstalled.slice(0, 2)), /Modelo ausente/u)

console.log(`M1-R0 modelos sintéticos: ${registry.candidates.length} famílias`)
console.log(`Rotações balanceadas: ${registry.rotations.length}`)
console.log(`Cada perfil vê cada família exatamente uma vez: true`)
console.log(`Piloto operacional: ${registry.executionPolicy.firstOperationalPilotCases} casos`)
console.log(`Pacote privado integral: ${registry.executionPolicy.fullPrivatePackageCases} casos`)
console.log('Baseline eleita: false')
console.log('Auditoria de candidatos aprovada: licença, diversidade, rotação e fronteiras humano/sintético íntegras.')
