export type LexicalSelectionSnapshot = {
  documentId: string
  from: number
  to: number
  text: string
  before: string
  after: string
}

type Listener = (snapshot: LexicalSelectionSnapshot) => void

let latestSnapshot: LexicalSelectionSnapshot | null = null
const listeners = new Set<Listener>()

export function publishLexicalSelection(snapshot: LexicalSelectionSnapshot): void {
  latestSnapshot = snapshot
  listeners.forEach((listener) => listener(snapshot))
}

export function readLatestLexicalSelection(documentId: string): LexicalSelectionSnapshot | null {
  return latestSnapshot?.documentId === documentId ? latestSnapshot : null
}

export function subscribeLexicalSelection(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
