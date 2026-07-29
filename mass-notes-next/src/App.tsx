import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Library } from './components/Library'
import { RightRail } from './components/RightRail'
import { type DocumentStatus, type EscrevaralDocument, type SaveState } from './domain/document'
import { MassNotesEditor, type ReviewNavigationRequest } from './editor/MassNotesEditor'
import type { ReviewDecorationSpec } from './editor/reviewDecorations'
import type { EditorPositionContract } from './editor/textPositionContract'
import {
  ensureReviewEngine,
  reviewTextDetailed,
  type LocatedReviewIssue,
  type ReviewIssue,
} from './engines/reviewAdapter'
import { downloadDocumentExport, type ExportFormat } from './export/documentExport'
import {
  createNewDocument,
  DocumentConflictError,
  duplicateDocument,
  getDocument,
  initializeRepository,
  listDocuments,
  saveConflictAsCopy,
  saveDocument,
} from './storage/documentRepository'

const ACTIVE_KEY = 'escrevaral-mass-notes-next-active'
const RECOVERY_KEY = 'escrevaral-mass-notes-next-recovery'
const THEME_KEY = 'escrevaral-mass-notes-next-theme'
const CHANNEL = 'escrevaral-mass-notes-next-documents'

type ConflictState = {
  local: EscrevaralDocument
  persisted: EscrevaralDocument
}

type LocatedReviewPresentation = LocatedReviewIssue & {
  positionRange: { from: number; to: number }
}

function readLocalStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function writeLocalStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* O IndexedDB continua sendo a fonte do documento. */ }
}

function removeLocalStorage(key: string): void {
  try { localStorage.removeItem(key) } catch { /* Nada a remover em modo restrito. */ }
}

export default function App() {
  const [documents, setDocuments] = useState<EscrevaralDocument[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EscrevaralDocument | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('Carregando')
  const [search, setSearch] = useState('')
  const [dirty, setDirty] = useState(false)
  const [conflict, setConflict] = useState<ConflictState | null>(null)
  const [issues, setIssues] = useState<ReviewIssue[]>([])
  const [locatedIssues, setLocatedIssues] = useState<LocatedReviewPresentation[]>([])
  const [reviewDecorations, setReviewDecorations] = useState<ReviewDecorationSpec[]>([])
  const [reviewNavigation, setReviewNavigation] = useState<ReviewNavigationRequest | null>(null)
  const [reviewMessage, setReviewMessage] = useState('Aguardando uma leitura.')
  const [analyzing, setAnalyzing] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [dark, setDark] = useState(() => readLocalStorage(THEME_KEY) === 'night')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [railOpen, setRailOpen] = useState(false)
  const [editorResetKey, setEditorResetKey] = useState(0)

  const draftRef = useRef<EscrevaralDocument | null>(null)
  const dirtyRef = useRef(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const analysisToken = useRef(0)
  const navigationSerial = useRef(0)
  const positionContractRef = useRef<EditorPositionContract | null>(null)

  useEffect(() => { draftRef.current = draft }, [draft])
  useEffect(() => { dirtyRef.current = dirty }, [dirty])

  const clearReviewReading = useCallback((message: string) => {
    analysisToken.current += 1
    setAnalyzing(false)
    setIssues([])
    setLocatedIssues([])
    setReviewDecorations([])
    setReviewNavigation(null)
    setReviewMessage(message)
  }, [])

  const refreshDocuments = useCallback(async () => {
    const rows = await listDocuments()
    setDocuments(rows)
    return rows
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      await initializeRepository()
      ensureReviewEngine()
      const rows = await refreshDocuments()
      if (cancelled) return
      const remembered = readLocalStorage(ACTIVE_KEY)
      const initial = rows.find((item) => item.id === remembered) ?? rows[0]
      let candidate = initial
      let recovered = false

      try {
        const recovery = JSON.parse(readLocalStorage(RECOVERY_KEY) ?? 'null') as { document?: EscrevaralDocument } | null
        if (
          recovery?.document?.id &&
          recovery.document.id === initial?.id &&
          recovery.document.revision === initial.revision &&
          recovery.document.updatedAt > initial.updatedAt
        ) {
          candidate = recovery.document
          recovered = true
        }
      } catch {
        removeLocalStorage(RECOVERY_KEY)
      }

      if (candidate) {
        setActiveId(candidate.id)
        setDraft(structuredClone(candidate))
        setDirty(recovered)
        setSaveState(recovered ? 'Alterado' : 'Salvo')
      }
    }
    boot().catch((error) => {
      console.error('[Escrevaral] Falha ao iniciar.', error)
      setSaveState('Falha')
    })
    return () => { cancelled = true }
  }, [refreshDocuments])

  useEffect(() => {
    document.body.classList.toggle('night', dark)
    writeLocalStorage(THEME_KEY, dark ? 'night' : 'paper')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#123442' : '#86c7df')
  }, [dark])

  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode)
  }, [focusMode])

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL)
    channelRef.current = channel
    channel.onmessage = async (event: MessageEvent<{ id?: string; revision?: number }>) => {
      const id = event.data?.id
      if (!id) return
      const persisted = await getDocument(id)
      if (!persisted) return
      await refreshDocuments()
      if (id !== draftRef.current?.id || persisted.revision <= draftRef.current.revision) return
      if (dirtyRef.current) {
        setConflict({ local: structuredClone(draftRef.current), persisted })
        setSaveState('Conflito')
      } else {
        setDraft(persisted)
        positionContractRef.current = null
        clearReviewReading('O documento mudou em outra aba. Faça uma nova leitura quando quiser.')
        setEditorResetKey((value) => value + 1)
        setSaveState('Salvo')
      }
    }
    return () => channel.close()
  }, [clearReviewReading, refreshDocuments])

  const persistDraft = useCallback(async (): Promise<boolean> => {
    const current = draftRef.current
    if (!current || !dirtyRef.current || conflict) return !conflict
    setSaveState('Salvando')
    try {
      const saved = await saveDocument(current, current.revision)
      setDraft(saved)
      draftRef.current = saved
      setDirty(false)
      dirtyRef.current = false
      setSaveState('Salvo')
      removeLocalStorage(RECOVERY_KEY)
      channelRef.current?.postMessage({ id: saved.id, revision: saved.revision })
      await refreshDocuments()
      return true
    } catch (error) {
      if (error instanceof DocumentConflictError) {
        setConflict({ local: error.local, persisted: error.persisted })
        setSaveState('Conflito')
        return false
      }
      console.error('[Escrevaral] Falha ao salvar.', error)
      setSaveState('Falha')
      return false
    }
  }, [conflict, refreshDocuments])

  useEffect(() => {
    if (!dirty || !draft || conflict) return
    writeLocalStorage(RECOVERY_KEY, JSON.stringify({ capturedAt: Date.now(), document: draft }))
    const timer = window.setTimeout(() => { void persistDraft() }, 650)
    return () => window.clearTimeout(timer)
  }, [dirty, draft, conflict, persistDraft])

  const mutateDraft = useCallback((updater: (current: EscrevaralDocument) => EscrevaralDocument) => {
    setDraft((current) => {
      if (!current) return current
      const next = updater(current)
      next.updatedAt = Date.now()
      draftRef.current = next
      return next
    })
    setDirty(true)
    dirtyRef.current = true
    setSaveState('Alterado')
    clearReviewReading('O texto mudou. Faça uma nova leitura quando quiser.')
  }, [clearReviewReading])

  const selectDocument = useCallback(async (id: string) => {
    if (id === activeId) {
      setSidebarOpen(false)
      return
    }
    if (!(await persistDraft())) return
    const selected = documents.find((item) => item.id === id) ?? await getDocument(id)
    if (!selected) return
    setActiveId(id)
    writeLocalStorage(ACTIVE_KEY, id)
    setDraft(structuredClone(selected))
    setDirty(false)
    setConflict(null)
    positionContractRef.current = null
    clearReviewReading('Aguardando uma leitura.')
    setEditorResetKey((value) => value + 1)
    setSidebarOpen(false)
  }, [activeId, clearReviewReading, documents, persistDraft])

  const newDocument = useCallback(async () => {
    if (!(await persistDraft())) return
    const created = await createNewDocument()
    await refreshDocuments()
    setActiveId(created.id)
    writeLocalStorage(ACTIVE_KEY, created.id)
    setDraft(created)
    setDirty(false)
    setConflict(null)
    positionContractRef.current = null
    clearReviewReading('Aguardando uma leitura.')
    setEditorResetKey((value) => value + 1)
    setSidebarOpen(false)
  }, [clearReviewReading, persistDraft, refreshDocuments])

  const duplicate = useCallback(async () => {
    const current = draftRef.current
    if (!current || !(await persistDraft())) return
    const copy = await duplicateDocument(current)
    await refreshDocuments()
    setActiveId(copy.id)
    setDraft(copy)
    setDirty(false)
    positionContractRef.current = null
    clearReviewReading('Aguardando uma leitura.')
    setEditorResetKey((value) => value + 1)
    setRailOpen(false)
  }, [clearReviewReading, persistDraft, refreshDocuments])

  const runReview = useCallback(async () => {
    const current = draftRef.current
    const contract = positionContractRef.current
    if (!current) return
    if (!contract || contract.snapshot.documentId !== current.id) {
      setReviewMessage('O mapa estrutural ainda está sendo preparado. Tente novamente em um instante.')
      return
    }

    const token = ++analysisToken.current
    const documentId = current.id
    const contentSignature = contract.snapshot.contentSignature
    const text = contract.snapshot.text
    setAnalyzing(true)
    setReviewMessage('A engine está lendo o rascunho localmente…')

    try {
      const result = await reviewTextDetailed(text)
      const liveContract = positionContractRef.current
      if (
        token !== analysisToken.current ||
        draftRef.current?.id !== documentId ||
        !liveContract ||
        liveContract.snapshot.documentId !== documentId ||
        liveContract.snapshot.contentSignature !== contentSignature
      ) return

      const mapped = result.locatedIssues.flatMap<LocatedReviewPresentation>((issue) => {
        const positionRange = liveContract.textRangeToPositionRange(issue.textRange)
        if (positionRange.collapsed || positionRange.from === positionRange.to) return []
        return [{ ...issue, positionRange: { from: positionRange.from, to: positionRange.to } }]
      })

      setIssues(result.issues)
      setLocatedIssues(mapped)
      setReviewDecorations(mapped.map((issue) => ({
        id: issue.id,
        from: issue.positionRange.from,
        to: issue.positionRange.to,
        severity: issue.severity,
      })))
      setReviewNavigation(null)

      if (!text.trim()) {
        setReviewMessage('A página está vazia.')
      } else if (result.issues.length || mapped.length) {
        const observations = result.issues.length
        const located = mapped.length
        setReviewMessage(
          `${observations} ${observations === 1 ? 'observação geral' : 'observações gerais'}; ${located} ${located === 1 ? 'trecho localizado' : 'trechos localizados'}.`,
        )
      } else {
        setReviewMessage('Nenhuma observação relevante neste recorte.')
      }
    } catch (error) {
      console.error('[Escrevaral] Revisão não concluída.', error)
      setIssues([])
      setLocatedIssues([])
      setReviewDecorations([])
      setReviewMessage('A revisão não pôde ser concluída agora.')
    } finally {
      if (token === analysisToken.current) setAnalyzing(false)
    }
  }, [])

  const navigateReviewIssue = useCallback((issue: LocatedReviewPresentation) => {
    navigationSerial.current += 1
    setReviewNavigation({
      serial: navigationSerial.current,
      issueId: issue.id,
      from: issue.positionRange.from,
      to: issue.positionRange.to,
    })
  }, [])

  const exportDocument = useCallback((format: ExportFormat) => {
    const current = draftRef.current
    if (!current) return
    downloadDocumentExport(current, format)
  }, [])

  const loadPersistedConflict = useCallback(() => {
    if (!conflict) return
    setDraft(conflict.persisted)
    draftRef.current = conflict.persisted
    setDirty(false)
    dirtyRef.current = false
    setConflict(null)
    setSaveState('Salvo')
    removeLocalStorage(RECOVERY_KEY)
    positionContractRef.current = null
    clearReviewReading('Aguardando uma leitura.')
    setEditorResetKey((value) => value + 1)
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
            <div className="reg-field"><span className="field-label">Última tinta</span><span className={`field-value save-${saveState.toLocaleLowerCase('pt-BR')}`} aria-live="polite">{saveState}</span></div>
          </header>

          {conflict && (
            <div className="conflict-banner" role="alert">
              <strong>Outra aba também escreveu nesta página.</strong>
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
          onStatus={(status: DocumentStatus) => mutateDraft((current) => ({ ...current, status }))}
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
