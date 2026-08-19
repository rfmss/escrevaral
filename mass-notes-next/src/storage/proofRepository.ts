import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ProofAuthor, ProofRecord } from '../engines/proofAdapter'

const DB_NAME = 'escrevaral-authorship-proof'
const DB_VERSION = 1
const AUTHOR_KEY = 'local-author'

type StoredProof = {
  documentId: string
  record: ProofRecord
  updatedAt: number
}

type StoredSetting = {
  key: string
  value: unknown
  updatedAt: number
}

interface ProofDB extends DBSchema {
  proofs: {
    key: string
    value: StoredProof
  }
  settings: {
    key: string
    value: StoredSetting
  }
}

let databasePromise: Promise<IDBPDatabase<ProofDB>> | null = null

function database(): Promise<IDBPDatabase<ProofDB>> {
  databasePromise ??= openDB<ProofDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('proofs')) db.createObjectStore('proofs', { keyPath: 'documentId' })
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' })
    },
  })
  return databasePromise
}

export async function loadStoredProof(documentId: string): Promise<ProofRecord | null> {
  const row = await (await database()).get('proofs', documentId)
  return row?.record ? structuredClone(row.record) : null
}

export async function saveStoredProof(documentId: string, record: ProofRecord): Promise<void> {
  await (await database()).put('proofs', {
    documentId,
    record: structuredClone(record),
    updatedAt: Date.now(),
  })
}

export async function loadProofAuthor(): Promise<ProofAuthor | null> {
  const row = await (await database()).get('settings', AUTHOR_KEY)
  const value = row?.value
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<ProofAuthor>
  const name = typeof source.name === 'string' ? source.name.trim() : ''
  if (!name) return null
  return {
    name,
    artisticName: typeof source.artisticName === 'string' ? source.artisticName.trim() : '',
    signedAt: typeof source.signedAt === 'string' ? source.signedAt : '',
  }
}

export async function saveProofAuthor(author: ProofAuthor | null): Promise<void> {
  const db = await database()
  if (!author) {
    await db.delete('settings', AUTHOR_KEY)
    return
  }
  await db.put('settings', {
    key: AUTHOR_KEY,
    value: structuredClone(author),
    updatedAt: Date.now(),
  })
}
