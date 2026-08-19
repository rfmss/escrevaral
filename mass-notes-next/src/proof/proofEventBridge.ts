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

export function publishProofKey(documentId: string, event: KeyboardEvent): void {
  const snapshot: ProofKeySnapshot = {
    key: event.key,
    isTrusted: event.isTrusted,
  }
  const input: ProofInputEvent = {
    kind: 'key',
    documentId,
    timestamp: Date.now(),
    event: snapshot,
  }
  listeners.forEach((listener) => listener(input))
}

export function publishProofStructural(
  documentId: string,
  type: ProofStructuralType,
  wordDelta = 0,
): void {
  const input: ProofInputEvent = {
    kind: 'structural',
    documentId,
    timestamp: Date.now(),
    type,
    wordDelta,
  }
  listeners.forEach((listener) => listener(input))
}

export function subscribeProofInput(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
