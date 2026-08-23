import type { ProofKeySnapshot, ProofStructuralType } from '../engines/proofAdapter'

export type ProofInputEvent =
  | {
      kind: 'key'
      documentId: string
      timestamp: number
      event: ProofKeySnapshot
    }
  | {
      kind: 'structural'
      documentId: string
      timestamp: number
      type: ProofStructuralType
      wordDelta: number
    }

type Listener = (event: ProofInputEvent) => void

const listeners = new Set<Listener>()
let recorderPromise: Promise<typeof import('./proofRecorder')> | null = null

function dispatch(input: ProofInputEvent): void {
  listeners.forEach((listener) => listener(input))
  recorderPromise ??= import('./proofRecorder')
  void recorderPromise.then((recorder) => recorder.recordProofInputEvent(input)).catch((error) => {
    console.error('[Escrevaral] Ponte de autoria não pôde encaminhar o movimento.', error)
  })
}

export function publishProofKey(documentId: string, event: KeyboardEvent): void {
  const snapshot: ProofKeySnapshot = {
    key: event.key,
    isTrusted: event.isTrusted,
  }
  dispatch({
    kind: 'key',
    documentId,
    timestamp: Date.now(),
    event: snapshot,
  })
}

export function publishProofStructural(
  documentId: string,
  type: ProofStructuralType,
  wordDelta = 0,
): void {
  dispatch({
    kind: 'structural',
    documentId,
    timestamp: Date.now(),
    type,
    wordDelta,
  })
}

export function subscribeProofInput(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
