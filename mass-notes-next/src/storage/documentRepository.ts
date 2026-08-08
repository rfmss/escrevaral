import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { createDocument, plainTextToContent, type EscrevaralDocument } from '../domain/document'

const DB_NAME = 'escrevaral-mass-notes-next'
const DB_VERSION = 1
const LEGACY_KEY = 'vereda.manuscripts.v1'

interface EscrevaralDB extends DBSchema {
  documents: {
    key: string
    value: EscrevaralDocument
    indexes: {
      'by-updated': number
      'by-legacy-id': string
    }
  }
}

export class DocumentConflictError extends Error {
  constructor(
    public readonly local: EscrevaralDocument,
    public readonly persisted: EscrevaralDocument,
  ) {
    super('Este documento foi alterado em outra aba.')
    this.name = 'DocumentConflictError'
  }
}

let databasePromise: Promise<IDBPDatabase<EscrevaralDB>> | null = null
let initializationPromise: Promise<void> | null = null

function database(): Promise<IDBPDatabase<EscrevaralDB>> {
  databasePromise ??= openDB<EscrevaralDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('documents', { keyPath: 'id' })
      store.createIndex('by-updated', 'updatedAt')
      store.createIndex('by-legacy-id', 'legacySourceId', { unique: false })
    },
  })
  return databasePromise
}

function seedDocuments(): EscrevaralDocument[] {
  const now = Date.now()
  return [
    createDocument({
      title: 'Antes que as palavras sequem',
      plainText:
        'A corda atravessa o quintal.\n\nNela, uma frase pinga sobre a terra. Outra balança sem vento. Ninguém sabe quem escreveu a terceira — mas ela conhece o nome de quem lê.',
      content: plainTextToContent(
        'A corda atravessa o quintal.\n\nNela, uma frase pinga sobre a terra. Outra balança sem vento. Ninguém sabe quem escreveu a terceira — mas ela conhece o nome de quem lê.',
      ),
      updatedAt: now - 7_800_000,
      createdAt: now - 86_400_000,
    }),
    createDocument({
      title: 'Cena de abertura',
      status: 'Em corte',
      plainText:
        'O elevador parou entre dois andares.\n\n— Ainda estamos subindo? — ela perguntou.\n\nO painel apagou o número e acendeu uma palavra: VOLTE.',
      content: plainTextToContent(
        'O elevador parou entre dois andares.\n\n— Ainda estamos subindo? — ela perguntou.\n\nO painel apagou o número e acendeu uma palavra: VOLTE.',
      ),
      updatedAt: now - 3_600_000,
      createdAt: now - 7_200_000,
    }),
  ]
}

export function initializeRepository(): Promise<void> {
  initializationPromise ??= (async () => {
    const db = await database()
    await importLegacyDocuments(db)
    if ((await db.count('documents')) === 0) {
      const tx = db.transaction('documents', 'readwrite')
      for (const document of seedDocuments()) await tx.store.put(document)
      await tx.done
    }
  })()
  return initializationPromise
}

export async function listDocuments(): Promise<EscrevaralDocument[]> {
  const db = await database()
  const rows = await db.getAllFromIndex('documents', 'by-updated')
  return rows.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getDocument(id: string): Promise<EscrevaralDocument | undefined> {
  return (await database()).get('documents', id)
}

export async function saveDocument(
  input: EscrevaralDocument,
  expectedRevision: number,
): Promise<EscrevaralDocument> {
  const db = await database()
  const tx = db.transaction('documents', 'readwrite')
  const persisted = await tx.store.get(input.id)

  if (persisted && persisted.revision !== expectedRevision) {
    await tx.done
    throw new DocumentConflictError(input, persisted)
  }

  const saved: EscrevaralDocument = {
    ...structuredClone(input),
    updatedAt: Date.now(),
    revision: expectedRevision + 1,
  }
  await tx.store.put(saved)
  await tx.done
  return saved
}

export async function createNewDocument(): Promise<EscrevaralDocument> {
  const document = createDocument()
  return saveDocument(document, 0)
}

export async function duplicateDocument(source: EscrevaralDocument): Promise<EscrevaralDocument> {
  const copy = createDocument({
    ...structuredClone(source),
    id: crypto.randomUUID(),
    title: `${source.title.trim() || 'Sem título'} — cópia`,
    revision: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    legacySourceId: null,
  })
  return saveDocument(copy, 0)
}

export async function saveConflictAsCopy(local: EscrevaralDocument): Promise<EscrevaralDocument> {
  const copy = createDocument({
    ...structuredClone(local),
    id: crypto.randomUUID(),
    title: `${local.title.trim() || 'Sem título'} — conflito`,
    revision: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    legacySourceId: null,
  })
  return saveDocument(copy, 0)
}

export async function restoreDocumentsAsCopies(source: EscrevaralDocument[]): Promise<EscrevaralDocument[]> {
  if (!source.length) return []
  const db = await database()
  const tx = db.transaction('documents', 'readwrite')
  const restored: EscrevaralDocument[] = []
  const startedAt = Date.now()

  for (const [index, document] of source.entries()) {
    const copy = createDocument({
      ...structuredClone(document),
      id: crypto.randomUUID(),
      title: `${document.title.trim() || 'Sem título'} — restaurado`,
      revision: 0,
      createdAt: startedAt + index,
      updatedAt: startedAt + index,
      legacySourceId: null,
    })
    await tx.store.add(copy)
    restored.push(copy)
  }

  await tx.done
  return restored
}

export async function importLegacyDocumentsAsCopies(source: EscrevaralDocument[]): Promise<EscrevaralDocument[]> {
  if (!source.length) return []
  const db = await database()
  const tx = db.transaction('documents', 'readwrite')
  const imported: EscrevaralDocument[] = []
  const startedAt = Date.now()

  for (const [index, document] of source.entries()) {
    if (!document.legacySourceId) {
      tx.abort()
      throw new Error('Importação legada sem identificador de origem.')
    }
    const copy = createDocument({
      ...structuredClone(document),
      id: crypto.randomUUID(),
      title: `${document.title.trim() || 'Sem título'} — importado`,
      revision: 0,
      createdAt: startedAt + index,
      updatedAt: startedAt + index,
      legacySourceId: document.legacySourceId,
    })
    await tx.store.add(copy)
    imported.push(copy)
  }

  await tx.done
  return imported
}

async function importLegacyDocuments(db: IDBPDatabase<EscrevaralDB>): Promise<void> {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(LEGACY_KEY)
  } catch {
    return
  }
  if (!raw) return

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Não marca a migração como concluída. Uma fonte corrigida poderá ser lida depois.
    return
  }

  const source = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { manuscripts?: unknown[] }).manuscripts)
      ? (parsed as { manuscripts: unknown[] }).manuscripts
      : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { documents?: unknown[] }).documents)
        ? (parsed as { documents: unknown[] }).documents
        : []

  if (!source.length) return
  const existing = await db.getAll('documents')
  const importedIds = new Set(existing.map((document) => document.legacySourceId).filter(Boolean))
  const tx = db.transaction('documents', 'readwrite')

  for (const item of source) {
    if (!item || typeof item !== 'object') continue
    const legacy = item as Record<string, unknown>
    const sourceId = String(legacy.id ?? '')
    if (sourceId && importedIds.has(sourceId)) continue
    const text = String(legacy.text ?? legacy.content ?? '')
    const createdAt = Number(legacy.createdAt ?? legacy.created) || Date.now()
    const updatedAt = Number(legacy.updatedAt ?? legacy.updated) || createdAt
    await tx.store.put(
      createDocument({
        title: String(legacy.title ?? legacy.name ?? 'Documento importado'),
        plainText: text,
        content: plainTextToContent(text),
        tags: Array.isArray(legacy.tags) ? legacy.tags.map(String) : [],
        favorite: Boolean(legacy.favorite),
        createdAt,
        updatedAt,
        legacySourceId: sourceId || null,
      }),
    )
  }
  await tx.done
}
