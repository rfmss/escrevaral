import type { JSONContent } from '@tiptap/core'
import { createContentSignature } from './textPositionContract'

export type LiveEditorSnapshot = {
  documentId: string
  content: JSONContent
  plainText: string
  contentSignature: string
}

type Listener = (snapshot: LiveEditorSnapshot) => void

const snapshots = new Map<string, LiveEditorSnapshot>()
const listeners = new Set<Listener>()

export function publishLiveEditorSnapshot(
  documentId: string,
  content: JSONContent,
  plainText: string,
): LiveEditorSnapshot {
  const snapshot: LiveEditorSnapshot = {
    documentId,
    content,
    plainText,
    contentSignature: createContentSignature(content),
  }
  snapshots.set(documentId, snapshot)
  listeners.forEach((listener) => listener(snapshot))
  return snapshot
}

export function readLiveEditorSnapshot(documentId: string): LiveEditorSnapshot | null {
  return snapshots.get(documentId) ?? null
}

export function subscribeLiveEditorSnapshot(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
