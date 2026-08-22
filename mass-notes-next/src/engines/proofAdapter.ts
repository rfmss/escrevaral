import proofSource from '../../../proof-engine.js?raw'
import type { EscrevaralDocument } from '../domain/document'

export type ProofEvent = {
  at: string
  interval: number | null
  trusted: boolean
  organic: boolean
  keyType: string
  wordDelta?: number
}

export type ProofSession = {
  id: string
  name: string
  startedAt: string
  updatedAt: string
  lastEventAt: number | null
  events: ProofEvent[]
}

export type ProofRecord = {
  activeSessionId: string
  sessions: ProofSession[]
}

export type ProofSummary = {
  startedAt: string
  updatedAt: string
  totalEvents: number
  measuredEvents: number
  organicEvents: number
  rejectedEvents: number
  averageInterval: number
  cadenceWpm: number
  integrity: number
  durationMin: number
  status: string
}

export type ProofAuthor = {
  name: string
  artisticName: string
  signedAt: string
}

export type ProofKeySnapshot = {
  key: string
  isTrusted: boolean
}

export type ProofStructuralType = 'paste' | 'cut' | 'undo' | 'redo'

type LegacyProofDocument = Record<string, unknown>

declare global {
  interface Window {
    VeredaProof?: {
      createRecord: (record?: unknown) => unknown
      createSession: (session?: unknown) => unknown
      createProofDocument: (record: unknown, manuscript: Record<string, unknown>) => Promise<unknown>
      createAuthorshipPackage: (record: unknown, manuscript: Record<string, unknown>) => Promise<unknown>
      getActiveSession: (record: unknown) => unknown
      recordKeyEvent: (record: unknown, event: ProofKeySnapshot, timestamp?: number) => unknown
      recordStructuralEvent: (record: unknown, type: string, wordDelta?: number, timestamp?: number) => unknown
      summarize: (session: unknown) => unknown
      startSession: (record: unknown, name?: string, timestamp?: number) => unknown
    }
    __escrevaralProofLoaded?: boolean
  }
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function number(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeEvent(value: unknown): ProofEvent {
  const source = object(value)
  const interval = source.interval == null ? null : number(source.interval)
  return {
    at: text(source.at),
    interval,
    trusted: source.trusted === true,
    organic: source.organic === true,
    keyType: text(source.keyType),
    wordDelta: source.wordDelta == null ? undefined : number(source.wordDelta),
  }
}

function normalizeSession(value: unknown): ProofSession {
  const source = object(value)
  return {
    id: text(source.id),
    name: text(source.name),
    startedAt: text(source.startedAt),
    updatedAt: text(source.updatedAt),
    lastEventAt: source.lastEventAt == null ? null : number(source.lastEventAt),
    events: array(source.events).map(normalizeEvent),
  }
}

function normalizeRecord(value: unknown): ProofRecord {
  const source = object(value)
  return {
    activeSessionId: text(source.activeSessionId),
    sessions: array(source.sessions).map(normalizeSession),
  }
}

function normalizeSummary(value: unknown): ProofSummary {
  const source = object(value)
  return {
    startedAt: text(source.startedAt),
    updatedAt: text(source.updatedAt),
    totalEvents: Math.max(0, Math.floor(number(source.totalEvents))),
    measuredEvents: Math.max(0, Math.floor(number(source.measuredEvents))),
    organicEvents: Math.max(0, Math.floor(number(source.organicEvents))),
    rejectedEvents: Math.max(0, Math.floor(number(source.rejectedEvents))),
    averageInterval: Math.max(0, Math.floor(number(source.averageInterval))),
    cadenceWpm: Math.max(0, Math.floor(number(source.cadenceWpm))),
    integrity: Math.max(0, Math.min(100, Math.round(number(source.integrity)))),
    durationMin: Math.max(0, Math.floor(number(source.durationMin))),
    status: text(source.status) || 'Aguardando escrita',
  }
}

export function ensureProofEngine(): boolean {
  if (window.__escrevaralProofLoaded && window.VeredaProof) return true
  try {
    if (!document.querySelector('script[data-escrevaral-engine="proof-engine.js"]')) {
      const script = document.createElement('script')
      script.dataset.escrevaralEngine = 'proof-engine.js'
      script.textContent = `${proofSource}\n//# sourceURL=proof-engine.js`
      document.head.append(script)
    }
    window.__escrevaralProofLoaded = Boolean(window.VeredaProof)
    return window.__escrevaralProofLoaded
  } catch (error) {
    console.error('[Escrevaral] Não foi possível carregar a Prova de Autoria.', error)
    return false
  }
}

function engine(): NonNullable<Window['VeredaProof']> {
  if (!ensureProofEngine() || !window.VeredaProof) throw new Error('A Prova de Autoria não está disponível.')
  return window.VeredaProof
}

export function createProofRecord(existing?: unknown): ProofRecord {
  return normalizeRecord(engine().createRecord(existing))
}

export function recordProofKey(record: ProofRecord, event: ProofKeySnapshot, timestamp = Date.now()): ProofRecord {
  return normalizeRecord(engine().recordKeyEvent(record, event, timestamp))
}

export function recordProofStructural(
  record: ProofRecord,
  type: ProofStructuralType,
  wordDelta = 0,
  timestamp = Date.now(),
): ProofRecord {
  return normalizeRecord(engine().recordStructuralEvent(record, type, wordDelta, timestamp))
}

export function startProofSession(record: ProofRecord, name?: string): ProofRecord {
  return normalizeRecord(engine().startSession(record, name))
}

export function summarizeProof(record: ProofRecord): ProofSummary {
  const proofEngine = engine()
  return normalizeSummary(proofEngine.summarize(proofEngine.getActiveSession(record)))
}

export function summarizeProofSession(session: ProofSession): ProofSummary {
  return normalizeSummary(engine().summarize(session))
}

export function activeProofSession(record: ProofRecord): ProofSession {
  return normalizeSession(engine().getActiveSession(record))
}

function manuscriptPayload(document: EscrevaralDocument): Record<string, unknown> {
  return {
    id: document.id,
    title: document.title,
    kind: document.kind || document.type || 'manuscrito',
    text: document.plainText,
  }
}

export async function createLocalProofDocument(
  record: ProofRecord,
  document: EscrevaralDocument,
  author?: ProofAuthor | null,
): Promise<LegacyProofDocument> {
  const proof = object(await engine().createProofDocument(record, manuscriptPayload(document)))
  if (author?.name) {
    const signedAt = author.signedAt || new Date().toISOString()
    const date = new Date(signedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    proof.declaration = {
      author: author.name,
      artisticName: author.artisticName || '',
      signedAt,
      statement: `Este texto foi criado por ${author.name}${author.artisticName ? ` (${author.artisticName})` : ''} e registrado localmente pelo Escrevaral em ${date}.`,
    }
  }
  return proof
}
