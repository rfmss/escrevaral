import {
  createProofRecord,
  recordProofKey,
  recordProofStructural,
  startProofSession,
  type ProofRecord,
} from '../engines/proofAdapter'
import { loadStoredProof, saveStoredProof } from '../storage/proofRepository'
import type { ProofInputEvent } from './proofEventBridge'

type Listener = (record: ProofRecord) => void

type Runtime = {
  record: ProofRecord | null
  ready: Promise<ProofRecord>
  queue: Promise<void>
  listeners: Set<Listener>
  saveTimer: number | null
  eventsSinceSave: number
}

const runtimes = new Map<string, Runtime>()

function runtimeFor(documentId: string): Runtime {
  const existing = runtimes.get(documentId)
  if (existing) return existing

  const runtime = {} as Runtime
  runtime.record = null
  runtime.listeners = new Set()
  runtime.saveTimer = null
  runtime.eventsSinceSave = 0
  runtime.queue = Promise.resolve()
  runtime.ready = loadStoredProof(documentId)
    .then((stored) => createProofRecord(stored ?? undefined))
    .catch((error) => {
      console.error('[Escrevaral] Registro de autoria não pôde ser lido.', error)
      return createProofRecord()
    })
    .then((record) => {
      runtime.record = record
      emit(runtime)
      return record
    })

  runtimes.set(documentId, runtime)
  return runtime
}

function emit(runtime: Runtime): void {
  if (!runtime.record) return
  const snapshot = structuredClone(runtime.record)
  runtime.listeners.forEach((listener) => listener(snapshot))
}

function scheduleSave(documentId: string, runtime: Runtime): void {
  if (runtime.saveTimer !== null) window.clearTimeout(runtime.saveTimer)
  runtime.saveTimer = window.setTimeout(() => {
    runtime.saveTimer = null
    void flushProofRecord(documentId)
  }, 750)
}

async function persist(documentId: string, runtime: Runtime): Promise<void> {
  if (!runtime.record) return
  await saveStoredProof(documentId, runtime.record)
  runtime.eventsSinceSave = 0
}

export function recordProofInputEvent(input: ProofInputEvent): void {
  const runtime = runtimeFor(input.documentId)
  runtime.queue = runtime.queue.then(async () => {
    const current = runtime.record ?? await runtime.ready
    runtime.record = input.kind === 'key'
      ? recordProofKey(current, input.event, input.timestamp)
      : recordProofStructural(current, input.type, input.wordDelta, input.timestamp)
    runtime.eventsSinceSave += 1
    emit(runtime)

    if (runtime.eventsSinceSave >= 20) {
      if (runtime.saveTimer !== null) {
        window.clearTimeout(runtime.saveTimer)
        runtime.saveTimer = null
      }
      await persist(input.documentId, runtime)
    } else {
      scheduleSave(input.documentId, runtime)
    }
  }).catch((error) => {
    console.error('[Escrevaral] Movimento de autoria não pôde ser registrado.', error)
  })
}

export async function getProofRecord(documentId: string): Promise<ProofRecord> {
  const runtime = runtimeFor(documentId)
  await runtime.queue
  return structuredClone(runtime.record ?? await runtime.ready)
}

export function subscribeProofRecord(documentId: string, listener: Listener): () => void {
  const runtime = runtimeFor(documentId)
  runtime.listeners.add(listener)
  void runtime.ready.then(() => emit(runtime))
  return () => runtime.listeners.delete(listener)
}

export async function startNewProofSession(documentId: string, name?: string): Promise<ProofRecord> {
  const runtime = runtimeFor(documentId)
  runtime.queue = runtime.queue.then(async () => {
    const current = runtime.record ?? await runtime.ready
    runtime.record = startProofSession(current, name)
    emit(runtime)
    await persist(documentId, runtime)
  })
  await runtime.queue
  return structuredClone(runtime.record ?? await runtime.ready)
}

export async function flushProofRecord(documentId: string): Promise<void> {
  const runtime = runtimes.get(documentId)
  if (!runtime) return
  if (runtime.saveTimer !== null) {
    window.clearTimeout(runtime.saveTimer)
    runtime.saveTimer = null
  }
  await runtime.queue
  await runtime.ready
  await persist(documentId, runtime)
}

export async function flushAllProofRecords(): Promise<void> {
  await Promise.all([...runtimes.keys()].map(flushProofRecord))
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushAllProofRecords()
  })
}
