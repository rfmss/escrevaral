import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Library } from './components/Library'
import { RightRail } from './components/RightRail'
import { type DocumentStatus, type EscrevaralDocument, type SaveState } from './domain/document'
import { MassNotesEditor, type ReviewNavigationRequest } from './editor/MassNotesEditor'
import type { ReviewDecorationSpec } from './editor/reviewDecorations'
import type { EditorPositionContract } from './editor/textPositionContract'
import {
  reviewTextDetailed,
  type LocatedReviewIssue,
  type ReviewIssue,
} from './engines/reviewAdapter'
import { downloadDocumentExport, type ExportFormat } from './export/documentExport'
import { DEFAULT_LIBRARY_QUERY, queryLibraryDocuments, type LibraryQuery } from './library/libraryQuery'
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
const THEME_KEY = 'escrevaral-paper-home-theme-v1'
const CHANNEL = 'escrevaral-mass-notes-next-documents'

type ConflictState = {
  local: EscrevaralDocument
  persisted: EscrevaralDocument
}

type DraftMutationKind = 'manuscript' | 'metadata'

type DocumentChannelMessage = {
  id?: string
  revision?: number
  kind?: DraftMutationKind
}

type LocatedReviewPresentation = LocatedReviewIssue & {
  positionRange: { from: number; to: number }
}

function manuscriptFieldsChanged(left: EscrevaralDocument, right: EscrevaralDocument): boolean {
  return left.title !== right.title
    || left.plainText !== right.plainText
    || JSON.stringify(left.content) !== JSON.stringify(right.content)
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
  const [libraryQuery, setLibraryQuery] = useState<LibraryQuery>(() => ({ ...DEFAULT_LIBRARY_QUERY }))
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
  const dirtyKindRef = useRef<DraftMutationKind | null>(null)
  const conflictRef = useRef<ConflictState | null>(null)
  const mutationSerialRef = useRef(0)
  const savePromiseRef = useRef<Promise<boolean> | null>(null)
  const saveRequestedRef = useRef(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const analysisToken = useRef(0)
  const navigationSerial = useRef(0)
  const positionContractRef = useRef<EditorPositionContract | null>(null)

  useEffect(() => { draftRef.current = draft }, [draft])
  useEffect(() => { dirtyRef.current = dirty }, [dirty])
  useEffect(() => { conflictRef.current = conflict }, [conflict])

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
        dirtyKindRef.current = recovered ? 'manuscript' : null
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
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#202628' : '#f3efe4')
  }, [dark])

  useEffect(() => {
    document.body.classList.toggle('focus-mode', focusMode)
  }, [focusMode])

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    const channel = new BroadcastChannel(CHANNEL)
    channelRef.current = channel
    channel.onmessage = async (event: MessageEvent<DocumentChannelMessage>) => {
      const id = event.data?.id
      if (!id) return
      const current = draftRef.current
      const persisted = await getDocument(id)
      if (!persisted) return
      await refreshDocuments()
      if (!current || id !== current.id || persisted.revision <= current.revision) return
      if (dirtyRef.current) {
        const nextConflict = { local: structuredClone(current), persisted }
        conflictRef.current = nextConflict
        setConflict(nextConflict)
        setSaveState('Conflito')
      } else {
        const kind = event.data?.kind ?? (manuscriptFieldsChanged(current, persisted) ? 'manuscript' : 'metadata')
        setDraft(persisted)
        draftRef.current = persisted
        dirtyKindRef.current = null
        if (kind === 'manuscript') {
          positionContractRef.current = null
          clearReviewReading('O documento mudou em outra aba. Faça uma nova leitura quando quiser.')
          setEditorResetKey((value) => value + 1)
        }
        setSaveState('Salvo')
      }
    }
    return () => channel.close()
  }, [clearReviewReading, refreshDocuments])

  const persistDraft = useCallback(async (): Promise<boolean> => {
    saveRequestedRef.current = true
    if (savePromiseRef.current) return savePromiseRef.current

    const runQueue = async (): Promise<boolean> => {
      while (saveRequestedRef.current) {
        saveRequestedRef.current = false
        if (conflictRef.current) return false

        const current = draftRef.current
        if (!current || !dirtyRef.current) continue

        const snapshot = structuredClone(current)
        const mutationSerial = mutationSerialRef.current
        const mutationKind = dirtyKindRef.current ?? 'manuscript'
        setSaveState('Salvando')

        try {
          const saved = await saveDocument(snapshot, snapshot.revision)
          const latest = draftRef.current
          const changedDuringSave = mutationSerialRef.current !== mutationSerial

          if (latest && latest.id === saved.id && changedDuringSave) {
            const rebased = { ...latest, revision: saved.revision }
            setDraft(rebased)
            draftRef.current = rebased
            setDirty(true)
            dirtyRef.current = true
            setSaveState('Alterado')
            saveRequestedRef.current = true
          } else if (latest?.id === saved.id) {
            setDraft(saved)
            draftRef.current = saved
            setDirty(false)
            dirtyRef.current = false
            dirtyKindRef.current = null
            setSaveState('Salvo')
            removeLocalStorage(RECOVERY_KEY)
          }

          channelRef.current?.postMessage({ id: saved.id, revision: saved.revision, kind: mutationKind } satisfies DocumentChannelMessage)
          await refreshDocuments()
        } catch (error) {
          if (error instanceof DocumentConflictError) {
            const nextConflict = { local: error.local, persisted: error.persisted }
            conflictRef.current = nextConflict
            setConflict(nextConflict)
            setSaveState('Conflito')
            return false
          }
          console.error('[Escrevaral] Falha ao salvar.', error)
          setSaveState('Falha')
          return false
        }
      }
      return !conflictRef.current
    }

    const task = runQueue()
    savePromiseRef.current = task
    try {
      return await task
    } finally {
      if (savePromiseRef.current === task) savePromiseRef.current = null
    }
  }, [refreshDocuments])

  useEffect(() => {
    if (!dirty || !draft || conflict) return
    writeLocalStorage(RECOVERY_KEY, JSON.stringify({ capturedAt: Date.now(), document: draft }))
    const timer = window.setTimeout(() => { void persistDraft() }, 650)
    return () => window.clearTimeout(timer)
  }, [dirty, draft, conflict, persistDraft])

  const mutateDraft = useCallback((
    updater: (current: EscrevaralDocument) => EscrevaralDocument,
    kind: DraftMutationKind = 'manuscript',
  ) => {
    mutationSerialRef.current += 1
    setDraft((current) => {
      if (!current) return current
      const next = updater(current)
      next.updatedAt = Date.now()
      draftRef.current = next
      return next
    })
    dirtyKindRef.current = dirtyKindRef.current === 'manuscript' || kind === 'manuscript' ? 'manuscript' : 'metadata'
    setDirty(true)
    dirtyRef.current = true
    setSaveState('Alterado')
    if (kind === 'manuscript') clearReviewReading('O texto mudou. Faça uma nova leitura quando quiser.')
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
    dirtyRef.current = false
    dirtyKindRef.current = null
    conflictRef.current = null
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
    dirtyRef.current = false
    dirtyKindRef.current = null
    conflictRef.current = null
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
    dirtyRef.current = false
    dirtyKindRef.current = null
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
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.search input')?.focus()
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

  const countWords = (text: string) => text.trim() ? (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? []).length : 0
  const words = countWords(draft.plainText)
  const characters = draft.plainText.length
  const sentenceCount = draft.plainText.split(/[.!?…]+/).map((value) => value.trim()).filter(Boolean).length
  const averageSentence = sentenceCount ? Math.round(words / sentenceCount) : 0
  const readingSeconds = Math.max(0, Math.round(words / 220 * 60))
  const readMinutes = Math.floor(readingSeconds / 60)
  const readSeconds = String(readingSeconds % 60).padStart(2, '0')
  const pages = Math.max(1, Math.ceil(words / 290))
  const filteredDocuments = queryLibraryDocuments(documents, libraryQuery)
  const projectWords = documents.reduce((sum, item) => sum + countWords(item.plainText), 0)
  const dailyGoal = 1200
  const dailyProgress = Math.min(100, Math.round(words / dailyGoal * 100))
  const documentNumber = pageNumber.slice(-2)
  const formatDate = (timestamp: number) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(timestamp)
  const formatDateTime = (timestamp: number) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(timestamp)

  const openAnatomy = () => window.dispatchEvent(new CustomEvent('escrevaral:open-anatomy'))
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }

  return (
    <>
      <button className="mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir arquivo">☰</button>
      <button className="mobile-tools" type="button" onClick={() => setRailOpen(true)} aria-label="Abrir ferramentas">☷</button>

      <main className={`paper-shell ${focusMode ? 'focus-mode' : ''}`}>
        <div className="paper-wear" aria-hidden="true" />

        <header className="topbar">
          <div className="brand blueprint-corners">
            <div className="brand-name"><span>ESCREVA</span><b>RAL</b></div>
            <div className="brand-tagline">ESCRITA COM INTENÇÃO</div>
          </div>
          <div className="document-title">
            <span className="eyebrow">DOCUMENTO</span>
            <div>
              <span className="document-number">{documentNumber} —</span>
              <input
                className="reference-document-title"
                value={draft.title}
                maxLength={180}
                placeholder="Sem título"
                aria-label="Título do documento"
                onChange={(event) => mutateDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <button className="icon-square edit" type="button" aria-label="Editar título" onClick={() => document.querySelector<HTMLInputElement>('.reference-document-title')?.focus()}>
                <svg viewBox="0 0 22 22"><path d="m5 15 1-4L14.5 2.5l3 3L9 14zM5 15l4-1M13 4l3 3M4 18h14" /></svg>
              </button>
            </div>
          </div>
          <div className="mode">
            <span className="eyebrow">MODO</span>
            <button type="button">Escrita <span className="chevron" aria-hidden="true" /></button>
          </div>
          <label className="search"><span className="search-icon" /><input placeholder="Buscar" value={libraryQuery.search} onChange={(event) => setLibraryQuery((current) => ({ ...current, search: event.target.value }))} aria-label="Buscar documentos" /><kbd>CTRL + K</kbd></label>
          <nav className="main-actions" aria-label="Ações principais">
            <button type="button"><svg className="ui-icon target-svg" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="10.5" /><circle cx="16" cy="16" r="3" /><path d="M16 1v9M16 22v9M1 16h9M22 16h9" /></svg><small>Metas</small></button>
            <button type="button" onClick={() => setRailOpen(true)}><svg className="ui-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M8 5.5h17v22H8zM11 3.5h11v4H11zM12 11h9M12 15h9M12 19h9M12 23h7" /></svg><small>Notas</small></button>
            <button type="button" onClick={() => { setRailOpen(true); void runReview() }}><svg className="ui-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="13.5" cy="13.5" r="9.5" /><path d="m20.5 20.5 8 8" /></svg><small>Pesquisa</small></button>
            <button type="button" onClick={() => exportDocument('html')}><svg className="ui-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 18v10h22V18M16 23V3M10 9l6-6 6 6" /></svg><small>Exportar</small></button>
            <button type="button" onClick={() => setDark((value) => !value)}><svg className="ui-icon gear-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="m13.2 3-.8 3.2-2.5 1.1L7 5.6 4.6 8l1.7 2.9-1.1 2.5-3.2.8v3.4l3.2.8 1.1 2.6-1.7 2.8L7 26.2l2.9-1.7 2.5 1.1.8 3.2h3.4l.8-3.2 2.6-1.1 2.8 1.7 2.4-2.4-1.7-2.8 1.1-2.6 3.2-.8v-3.4l-3.2-.8-1.1-2.5L25.2 8l-2.4-2.4L20 7.3l-2.6-1.1-.8-3.2z" /><circle cx="14.9" cy="15.9" r="4.7" /></svg><small>Config.</small></button>
          </nav>
        </header>

        <aside className="left-rail">
          <div className="rail-code code-one">PAPER FRAMEWORK 01.4</div>
          <section className="current-project">
            <span className="eyebrow">PROJETO ATUAL</span>
            <div className="project-row"><strong>ROMANCE DE FICÇÃO</strong><button className="icon-square" type="button" aria-label="Abrir projeto"><span className="chevron" aria-hidden="true" /></button></div>
            <small>{projectWords.toLocaleString('pt-BR')} palavras</small>
          </section>
          <section className="documents">
            <div className="section-title"><span className="eyebrow">DOCUMENTOS</span><button className="icon-square add" type="button" onClick={() => { void newDocument() }} aria-label="Novo documento">＋</button></div>
            {filteredDocuments.map((item, index) => (
              <button className={`chapter ${item.id === activeId ? 'active' : ''}`} type="button" key={item.id} onClick={() => { void selectDocument(item.id) }}>
                <span className={`doc-symbol ${item.id === activeId ? 'round' : ''}`} />
                <span className="chapter-copy"><b>{String(index + 1).padStart(2, '0')} — {item.title.trim() || 'Sem título'}</b><small>{countWords(item.plainText).toLocaleString('pt-BR')} palavras</small></span>
                <time>{formatDate(item.updatedAt)}</time>
              </button>
            ))}
          </section>
          <section className="research">
            <span className="eyebrow">PESQUISA</span>
            <ul>
              <li><span className="folder" />Personagens <b>9</b></li>
              <li><span className="folder" />Locações <b>14</b></li>
              <li><span className="folder" />Referências <b>23</b></li>
              <li><span className="folder" />Inspiração <b>7</b></li>
              <li><span className="trash" />Lixeira <b>3</b></li>
            </ul>
          </section>
          <div className="rail-code code-two">BUILD 2529G</div>
          <div className="rail-code code-three">PAPER STOCK 2529G/M²</div>
          <section className="quick-box">
            <div><span className="eyebrow">CAIXA RÁPIDA</span><p>Arraste notas, imagens<br />ou trechos para salvar<br />aqui.</p></div>
            <div className="dropzone">↗<br /><span>⌟</span></div>
          </section>
        </aside>

        <section className="workspace" aria-label="Editor">
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
          <MassNotesEditor
            documentId={draft.id}
            content={draft.content}
            resetKey={editorResetKey}
            reviewDecorations={reviewDecorations}
            reviewNavigation={reviewNavigation}
            onPositionContract={(contract) => { positionContractRef.current = contract }}
            onChange={({ content, plainText }) => mutateDraft((current) => ({ ...current, content, plainText }))}
          />
        </section>

        <aside className="analysis-panel">
          <div className="analysis-head"><span className="eyebrow orange">ANÁLISE</span><button className="icon-square" type="button" aria-label="Recolher análise"><span className="chevron" aria-hidden="true" /></button></div>
          <section className="count">
            <h3>CONTAGEM</h3><strong className="big-count">{words.toLocaleString('pt-BR')}</strong><b>palavras</b>
            <div className="stats"><div><strong>{characters.toLocaleString('pt-BR')}</strong><small>caracteres</small></div><div><strong>{readMinutes}:{readSeconds}</strong><small>tempo de leitura</small></div><div><strong>{pages}</strong><small>páginas</small></div></div>
          </section>
          <section className="distribution-section"><h3 className="blue">DISTRIBUIÇÃO</h3>
            <div className="distribution"><div><span>Diálogos</span><i><b style={{ width: '18%' }} /></i><strong>18%</strong></div><div><span>Descrição</span><i><b style={{ width: '41%' }} /></i><strong>41%</strong></div><div><span>Narração</span><i><b style={{ width: '41%' }} /></i><strong>41%</strong></div></div>
          </section>
          <section className="language-section"><h3 className="blue">LINGUAGEM</h3>
            <dl><dt>Frases</dt><dd>{sentenceCount}</dd><dt>Média por frase</dt><dd>{averageSentence} palavras</dd><dt>Complexidade</dt><dd>—</dd><dt>Voz predominante</dt><dd>—</dd><dt>Tempo verbal</dt><dd>—</dd></dl>
          </section>
          <section className="reference-editorial-state" aria-labelledby="reference-editorial-state-title">
            <div className="reference-editorial-heading">
              <h3 id="reference-editorial-state-title">ESTADO EDITORIAL</h3>
              <button
                className={`reference-editorial-favorite ${draft.favorite ? 'active' : ''}`}
                type="button"
                aria-pressed={draft.favorite}
                aria-label={draft.favorite ? 'Remover documento dos favoritos' : 'Marcar documento como favorito'}
                onClick={() => mutateDraft((current) => ({ ...current, favorite: !current.favorite }), 'metadata')}
              >
                {draft.favorite ? '★' : '☆'}
              </button>
            </div>
            <div className="reference-editorial-status" role="group" aria-label="Estado editorial do documento">
              {(['Rascunho', 'Em corte', 'Pronto'] as DocumentStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  data-editorial-status={status}
                  className={draft.status === status ? 'active' : ''}
                  aria-pressed={draft.status === status}
                  onClick={() => mutateDraft((current) => ({ ...current, status }), 'metadata')}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>
          <section className="tags"><div className="section-title"><h3 className="blue">TAGS</h3><button className="icon-square add" type="button">＋</button></div><div>{(draft.tags.length ? draft.tags : ['mistério', 'retorno', 'cidade', 'passado', 'segredos']).slice(0, 5).map((tag) => <button type="button" key={tag}># {tag}</button>)}</div></section>
          <section className="versions"><div className="section-title"><h3 className="blue">VERSÕES</h3><a href="#" onClick={(event) => event.preventDefault()}>Ver todas</a></div><div className="version"><b>v{Math.max(1, draft.revision + 1)}.0</b><time>{formatDateTime(draft.updatedAt)}</time><em>Atual</em></div><div className="version"><b>local</b><time>IndexedDB</time></div></section>
        </aside>

        <footer className="statusbar">
          <div className="regmark"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="7" /><path d="M16 2v8M16 22v8M2 16h8M22 16h8" /></svg></div>
          <div className="sync"><span className="eyebrow">{saveState === 'Salvo' ? 'SINCRONIZADO' : saveState.toLocaleUpperCase('pt-BR')}</span><i className={saveState === 'Falha' || saveState === 'Conflito' ? 'sync-error' : ''} /><span className={`sync-save field-value save-${saveState.toLocaleLowerCase('pt-BR')}`} aria-live="polite">{saveState}</span><time>{formatDateTime(draft.updatedAt)}</time></div>
          <div className="daily"><span className="eyebrow">META DIÁRIA</span><strong>{words.toLocaleString('pt-BR')} <small>/ {dailyGoal.toLocaleString('pt-BR')} palavras</small></strong><div className="progress"><i style={{ width: `${dailyProgress}%` }} /></div><b>{dailyProgress}%</b></div>
          <div className="focus"><span className="eyebrow">FOCO</span><strong>60 min</strong><button className="play" type="button" onClick={() => setFocusMode((value) => !value)}>{focusMode ? 'Ⅱ' : '▶'}</button></div>
          <div className="language"><span>IDIOMA<strong>Português (BR)</strong></span><button type="button" aria-label="Selecionar idioma"><span className="chevron" aria-hidden="true" /></button></div>
          <div className="book"><button type="button" className="footer-button" aria-label="Abrir Anatomia do Livro" onClick={openAnatomy}><svg className="footer-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 6.5c5-1.5 9-.2 13 3v18c-4-3.2-8-4.4-13-3zM29 6.5c-5-1.5-9-.2-13 3v18c4-3.2 8-4.4 13-3zM8 10v9M24 10v9" /></svg></button></div>
          <div className="fullscreen"><button type="button" className="footer-button" aria-label="Tela cheia" onClick={toggleFullscreen}><svg className="footer-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 12V3h9M20 3h9v9M29 20v9h-9M12 29H3v-9M4 4l9 9M28 4l-9 9M28 28l-9-9M4 28l9-9" /></svg></button></div>
        </footer>
      </main>

      <div className="reference-mobile-legacy">
        <Library
          documents={documents}
          activeId={activeId}
          query={libraryQuery}
          open={sidebarOpen}
          onQueryChange={setLibraryQuery}
          onSelect={(id) => { void selectDocument(id) }}
          onNew={() => { void newDocument() }}
          onClose={() => setSidebarOpen(false)}
        />
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
      </div>

      {(sidebarOpen || railOpen) && <button className="drawer-overlay" type="button" onClick={() => { setSidebarOpen(false); setRailOpen(false) }} aria-label="Fechar painel" />}
    </>
  )
}