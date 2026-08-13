import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import { MassNotesEditor } from './editor/MassNotesEditor'
import type { TextPositionContract } from './editor/textPositionContract'
import { Library } from './components/Library'
import { RightRail } from './components/RightRail'
import {
  createDocument,
  duplicateDocument,
  getDocument,
  listDocuments,
  removeDocument,
  saveConflictAsCopy,
  saveDocument,
} from './storage/documentRepository'
import type { EscrevaralDocument, DocumentStatus } from './domain/document'
import { createEmptyDocument } from './domain/document'
import { analyzeWithLegacyEngine, type ReviewIssue } from './engines/reviewAdapter'
import { clearReviewReading, getReviewReading, setReviewReading } from './editor/reviewDecorations'
import { downloadDocumentExport, type DocumentExportFormat } from './export/documentExport'

const RECOVERY_KEY = 'escrevaral:mass-notes-next:recovery'
const LAST_DOCUMENT_KEY = 'escrevaral:mass-notes-next:last-document'
const THEME_KEY = 'escrevaral:mass-notes-next:night'
const CHANNEL_NAME = 'escrevaral:mass-notes-next:documents'
const AUTOSAVE_DELAY = 900

type SaveState = 'Salvo' | 'Salvando' | 'Alterado' | 'Conflito' | 'Falha'
type RecoveryEnvelope = {
  savedAt: string
  draft: EscrevaralDocument
}
type PendingSave = {
  document: EscrevaralDocument
  kind: 'manuscript' | 'metadata' | null
}
type EditorSessionState = {
  draft: EscrevaralDocument
  dirty: boolean
  dirtyKind: 'manuscript' | 'metadata' | null
  conflict: ConflictState | null
  positionContract: TextPositionContract | null
  editorResetKey: number
}
type ConflictState = {
  local: EscrevaralDocument
  persisted: EscrevaralDocument
}

const initialContent: JSONContent = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Primeira luz' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Escreva aqui. O manuscrito é seu; a análise só observa quando você pedir.' }] },
  ],
}

function nowIso() {
  return new Date().toISOString()
}

function readLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

function writeLocalStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Persistência principal continua no IndexedDB mesmo se o recovery envelope não couber.
  }
}

function removeLocalStorage(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Nada a fazer: a cópia principal continua no IndexedDB.
  }
}

function manuscriptFieldsChanged(a: EscrevaralDocument, b: EscrevaralDocument) {
  return a.title !== b.title || JSON.stringify(a.content) !== JSON.stringify(b.content)
}

function metadataFieldsChanged(a: EscrevaralDocument, b: EscrevaralDocument) {
  return a.status !== b.status || a.favorite !== b.favorite || JSON.stringify(a.tags) !== JSON.stringify(b.tags)
}

function sameDocument(a: EscrevaralDocument, b: EscrevaralDocument) {
  return !manuscriptFieldsChanged(a, b) && !metadataFieldsChanged(a, b)
}

export default function App() {
  const [documents, setDocuments] = useState<EscrevaralDocument[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EscrevaralDocument | null>(null)
  const [search, setSearch] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('Salvo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [dark, setDark] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [locatedIssues, setLocatedIssues] = useState<Array<ReviewIssue & { from: number; to: number }>>([])
  const [reviewMessage, setReviewMessage] = useState('Aguardando uma leitura.')
  const [reviewNavigation, setReviewNavigation] = useState<{ from: number; to: number; key: number } | null>(null)
  const [conflict, setConflict] = useState<ConflictState | null>(null)
  const [editorResetKey, setEditorResetKey] = useState(0)
  const draftRef = useRef<EscrevaralDocument | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const dirtyRef = useRef(false)
  const dirtyKindRef = useRef<'manuscript' | 'metadata' | null>(null)
  const conflictRef = useRef<ConflictState | null>(null)
  const positionContractRef = useRef<TextPositionContract | null>(null)
  const saveQueueRef = useRef<PendingSave | null>(null)
  const saveLoopRef = useRef<Promise<void> | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const refreshDocuments = useCallback(async () => {
    const next = await listDocuments()
    setDocuments(next)
    return next
  }, [])

  const changeActiveDocument = useCallback((document: EscrevaralDocument) => {
    setActiveId(document.id)
    activeIdRef.current = document.id
    setDraft(document)
    draftRef.current = document
    setConflict(null)
    conflictRef.current = null
    setSaveState('Salvo')
    setEditorResetKey((value) => value + 1)
    setIssues([])
    setLocatedIssues([])
    setReviewNavigation(null)
    setReviewMessage('Aguardando uma leitura.')
    writeLocalStorage(LAST_DOCUMENT_KEY, document.id)
  }, [])

  const bootstrap = useCallback(async () => {
    const recovered = readLocalStorage<RecoveryEnvelope>(RECOVERY_KEY)
    if (recovered?.draft?.id) {
      changeActiveDocument(recovered.draft)
      setSaveState('Alterado')
      dirtyRef.current = true
      dirtyKindRef.current = 'manuscript'
      setDocuments(await listDocuments())
      return
    }

    let collection = await listDocuments()
    if (!collection.length) {
      const first = createEmptyDocument({ title: 'Caderno sem nome', content: initialContent })
      await createDocument(first)
      collection = [first]
    }
    setDocuments(collection)
    const lastId = readLocalStorage<string>(LAST_DOCUMENT_KEY)
    const active = collection.find((item) => item.id === lastId) ?? collection[0]
    changeActiveDocument(active)
  }, [changeActiveDocument])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const nextDark = readLocalStorage<boolean>(THEME_KEY) ?? false
    setDark(nextDark)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('night', dark)
    writeLocalStorage(THEME_KEY, dark)
  }, [dark])

  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode)
  }, [focusMode])

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel
    channel.onmessage = async (event: MessageEvent<{ type: string; documentId?: string }>) => {
      if (event.data.type !== 'saved' || !event.data.documentId) return
      const incomingId = event.data.documentId
      const incoming = await getDocument(incomingId)
      if (!incoming) return
      await refreshDocuments()
      if (incomingId !== activeIdRef.current) return

      const current = draftRef.current
      if (!current) return
      if (!dirtyRef.current && !conflictRef.current) {
        changeActiveDocument(incoming)
        return
      }
      if (sameDocument(current, incoming)) return
      const nextConflict = { local: current, persisted: incoming }
      conflictRef.current = nextConflict
      setConflict(nextConflict)
      setSaveState('Conflito')
    }
    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [changeActiveDocument, refreshDocuments])

  const queueSave = useCallback((pending: PendingSave) => {
    saveQueueRef.current = pending
    if (saveLoopRef.current) return saveLoopRef.current

    const run = async () => {
      while (saveQueueRef.current) {
        const current = saveQueueRef.current
        saveQueueRef.current = null
        setSaveState('Salvando')
        try {
          const saved = await saveDocument(current.document)
          setDraft(saved)
          draftRef.current = saved
          setSaveState('Salvo')
          dirtyRef.current = false
          dirtyKindRef.current = null
          removeLocalStorage(RECOVERY_KEY)
          channelRef.current?.postMessage({ type: 'saved', documentId: saved.id })
          await refreshDocuments()
        } catch (error) {
          saveQueueRef.current = null
          const message = error instanceof Error ? error.message : String(error)
          if (message.includes('Revision conflict')) {
            const persisted = await getDocument(current.document.id)
            if (persisted) {
              const nextConflict = { local: current.document, persisted }
              conflictRef.current = nextConflict
              setConflict(nextConflict)
              setSaveState('Conflito')
              return
            }
          }
          setSaveState('Falha')
        }
      }
    }

    saveLoopRef.current = run().finally(() => {
      saveLoopRef.current = null
    })
    return saveLoopRef.current
  }, [refreshDocuments])

  const persistDraft = useCallback(async () => {
    const current = draftRef.current
    if (!current || conflictRef.current) return
    const next = { ...current, updatedAt: nowIso() }
    await queueSave({ document: next, kind: dirtyKindRef.current })
  }, [queueSave])

  useEffect(() => {
    if (!draft || !dirtyRef.current || conflict) return
    const timer = window.setTimeout(() => { void persistDraft() }, AUTOSAVE_DELAY)
    return () => window.clearTimeout(timer)
  }, [conflict, draft, persistDraft])

  const mutateDraft = useCallback((mutator: (current: EscrevaralDocument) => EscrevaralDocument, kind: 'manuscript' | 'metadata' = 'manuscript') => {
    setDraft((current) => {
      if (!current) return current
      const next = mutator(current)
      draftRef.current = next
      dirtyRef.current = true
      dirtyKindRef.current = kind
      setSaveState('Alterado')
      writeLocalStorage(RECOVERY_KEY, { savedAt: nowIso(), draft: next } satisfies RecoveryEnvelope)
      return next
    })
  }, [])

  const newDocument = useCallback(async () => {
    const first = createEmptyDocument()
    const saved = await createDocument(first)
    await refreshDocuments()
    changeActiveDocument(saved)
  }, [changeActiveDocument, refreshDocuments])

  const selectDocument = useCallback(async (id: string) => {
    if (id === activeIdRef.current) return
    if (dirtyRef.current && draftRef.current && !conflictRef.current) await persistDraft()
    const next = await getDocument(id)
    if (next) changeActiveDocument(next)
  }, [changeActiveDocument, persistDraft])

  const duplicate = useCallback(async () => {
    const current = draftRef.current
    if (!current) return
    const copy = await duplicateDocument(current)
    await refreshDocuments()
    changeActiveDocument(copy)
  }, [changeActiveDocument, refreshDocuments])

  const remove = useCallback(async (id: string) => {
    await removeDocument(id)
    const next = await refreshDocuments()
    if (id === activeIdRef.current) {
      const replacement = next[0] ?? await createDocument(createEmptyDocument())
      changeActiveDocument(replacement)
      if (!next.length) setDocuments([replacement])
    }
  }, [changeActiveDocument, refreshDocuments])

  const reviewDecorations = useMemo(() => getReviewReading(draft.id), [draft?.id, issues, locatedIssues])

  const runReview = useCallback(async () => {
    const current = draftRef.current
    if (!current) return
    setAnalyzing(true)
    setReviewMessage('Lendo o texto em português brasileiro…')
    try {
      const result = await analyzeWithLegacyEngine(current.plainText)
      const contract = positionContractRef.current
      const located = result.issues.flatMap((issue) => {
        if (!contract || issue.start == null || issue.end == null) return []
        const mapped = contract.textRangeToEditorRange(issue.start, issue.end)
        if (!mapped || !mapped.exact) return []
        return [{ ...issue, from: mapped.from, to: mapped.to }]
      })
      setIssues(result.issues)
      setLocatedIssues(located)
      setReviewReading(current.id, located.map((issue) => ({
        from: issue.from,
        to: issue.to,
        className: issue.severity === 'alta' ? 'review-high' : issue.severity === 'média' ? 'review-medium' : 'review-low',
      })))
      setReviewMessage(result.message)
    } catch {
      setIssues([])
      setLocatedIssues([])
      setReviewReading(current.id, [])
      setReviewMessage('Não consegui concluir esta leitura. O manuscrito permaneceu intacto.')
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const clearReviewReading = useCallback((message: string) => {
    const current = draftRef.current
    if (current) clearReviewReading(current.id)
    setIssues([])
    setLocatedIssues([])
    setReviewNavigation(null)
    setReviewMessage(message)
  }, [])

  const navigateReviewIssue = useCallback((issue: ReviewIssue & { from: number; to: number }) => {
    setReviewNavigation({ from: issue.from, to: issue.to, key: Date.now() })
  }, [])

  const exportDocument = useCallback((format: DocumentExportFormat) => {
    const current = draftRef.current
    if (!current) return
    downloadDocumentExport(current, format)
  }, [])

  const loadPersistedConflict = useCallback(() => {
    if (!conflict) return
    const changedManuscript = manuscriptFieldsChanged(conflict.local, conflict.persisted)
    setDraft(conflict.persisted)
    draftRef.current = conflict.persisted
    setDirty(false)
    dirtyRef.current = false
    dirtyKindRef.current = null
    conflictRef.current = null
    setConflict(null)
    setSaveState('Salvo')
    removeLocalStorage(RECOVERY_KEY)
    if (changedManuscript) {
      positionContractRef.current = null
      clearReviewReading('Aguardando uma leitura.')
      setEditorResetKey((value) => value + 1)
    }
  }, [clearReviewReading, conflict])

  const preserveConflictCopy = useCallback(async () => {
    if (!conflict) return
    const copy = await saveConflictAsCopy(conflict.local)
    await refreshDocuments()
    setActiveId(copy.id)
    setDraft(copy)
    draftRef.current = copy
    setDirty(false)
    dirtyRef.current = false
    dirtyKindRef.current = null
    conflictRef.current = null
    setConflict(null)
    setSaveState('Salvo')
    removeLocalStorage(RECOVERY_KEY)
    positionContractRef.current = null
    clearReviewReading('Aguardando uma leitura.')
    setEditorResetKey((value) => value + 1)
  }, [clearReviewReading, conflict, refreshDocuments])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLocaleLowerCase('pt-BR')
      if ((event.ctrlKey || event.metaKey) && key === 's') {
        event.preventDefault()
        void persistDraft()
      }
      if ((event.ctrlKey || event.metaKey) && key === 'n') {
        event.preventDefault()
        void newDocument()
      }
      if (event.altKey && key === 'f') {
        event.preventDefault()
        setFocusMode((value) => !value)
      }
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        setRailOpen(false)
        setFocusMode(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [newDocument, persistDraft])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 821px)')
    const closeTransientDrawers = () => {
      if (media.matches) {
        setSidebarOpen(false)
        setRailOpen(false)
      }
    }
    media.addEventListener('change', closeTransientDrawers)
    return () => media.removeEventListener('change', closeTransientDrawers)
  }, [])

  const pageNumber = useMemo(() => {
    const index = documents.findIndex((item) => item.id === activeId)
    return String(Math.max(1, index + 1)).padStart(3, '0')
  }, [activeId, documents])

  if (!draft) {
    return <main className="boot-screen"><strong>Escrevaral</strong><span>Preparando a oficina de escrita…</span></main>
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="halftone" aria-hidden="true" />
      <button className="mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir arquivo">☰</button>
      <button className="mobile-tools" type="button" onClick={() => setRailOpen(true)} aria-label="Abrir ferramentas">☷</button>

      <main className="app-shell">
        <div className="blueprint" aria-hidden="true" />
        <Library
          documents={documents}
          activeId={activeId}
          search={search}
          open={sidebarOpen}
          onSearch={setSearch}
          onSelect={(id) => { void selectDocument(id) }}
          onNew={() => { void newDocument() }}
          onClose={() => setSidebarOpen(false)}
        />

        <section className="workspace" aria-label="Editor">
          <header className="registration">
            <div className="reg-field"><span className="field-label">Caderno</span><span className="field-value">ESCREVARAL</span></div>
            <div className="reg-field"><span className="field-label">Fundação</span><span className="field-value">TIPTAP / 01</span></div>
            <div className="reg-field"><span className="field-label">Página</span><span className="field-value">{pageNumber}</span></div>
            <div className="reg-field save-field"><span className="field-label">Última tinta</span><span className={`field-value save-${saveState.toLocaleLowerCase('pt-BR')}`} aria-live="polite">{saveState}</span></div>
          </header>

          {conflict && (
            <div className="conflict-banner" role="alert">
              <strong>Outra aba também alterou esta página.</strong>
              <span>Nenhuma versão será apagada silenciosamente.</span>
              <div>
                <button type="button" onClick={loadPersistedConflict}>Carregar outra aba</button>
                <button type="button" onClick={() => { void preserveConflictCopy() }}>Guardar a minha como cópia</button>
              </div>
            </div>
          )}

          <div className="editor-shell">
            <article className="paper">
              <input
                className="title-input"
                value={draft.title}
                maxLength={180}
                placeholder="SEM TÍTULO"
                aria-label="Título do documento"
                onChange={(event) => mutateDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <div className="deck"><span className="status">{draft.status}</span><span className="engine-mark">PT-BR / LOCAL / ESTRUTURADO</span></div>
              <MassNotesEditor
                documentId={draft.id}
                content={draft.content}
                resetKey={editorResetKey}
                reviewDecorations={reviewDecorations}
                reviewNavigation={reviewNavigation}
                onPositionContract={(contract) => { positionContractRef.current = contract }}
                onChange={({ content, plainText }) => mutateDraft((current) => ({ ...current, content, plainText }))}
              />
              <div className="slash" aria-hidden="true" />
            </article>
          </div>
        </section>

        <RightRail
          document={draft}
          open={railOpen}
          analyzing={analyzing}
          issues={issues}
          locatedIssues={locatedIssues}
          reviewMessage={reviewMessage}
          onClose={() => setRailOpen(false)}
          onAnalyze={() => { void runReview() }}
          onNavigateIssue={navigateReviewIssue}
          onStatus={(status: DocumentStatus) => mutateDraft((current) => ({ ...current, status }), 'metadata')}
          onFavorite={(favorite) => mutateDraft((current) => ({ ...current, favorite }), 'metadata')}
          onTags={(tags) => mutateDraft((current) => ({ ...current, tags }), 'metadata')}
          onDuplicate={() => { void duplicate() }}
          onExport={exportDocument}
          onFocus={() => setFocusMode((value) => !value)}
          onTheme={() => setDark((value) => !value)}
        />
      </main>

      {(sidebarOpen || railOpen) && <button className="drawer-overlay" type="button" onClick={() => { setSidebarOpen(false); setRailOpen(false) }} aria-label="Fechar painel" />}
      <button className="impact-button" type="button" onClick={() => { setRailOpen(true); void runReview() }}>Ler o texto</button>
    </>
  )
}
