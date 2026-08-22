import { useEffect, useMemo, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import {
  activeProofSession,
  createLocalProofDocument,
  summarizeProof,
  summarizeProofSession,
  type ProofAuthor,
  type ProofRecord,
} from '../engines/proofAdapter'
import { readLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  flushProofRecord,
  getProofRecord,
  startNewProofSession,
  subscribeProofRecord,
} from '../proof/proofRecorder'
import { loadProofAuthor, saveProofAuthor } from '../storage/proofRepository'

type Props = {
  document: EscrevaralDocument
}

function slugifyFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'manuscrito'
}

function downloadJson(value: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function AuthorshipProofPanel({ document }: Props) {
  const [record, setRecord] = useState<ProofRecord | null>(null)
  const [message, setMessage] = useState('Preparando o registro local de autoria…')
  const [author, setAuthor] = useState<ProofAuthor | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [artisticName, setArtisticName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    setRecord(null)
    setMessage('Preparando o registro local de autoria…')
    void getProofRecord(document.id).then((next) => {
      if (!active) return
      setRecord(next)
      setMessage('O registro acompanha somente ritmo e tipos de movimento no editor.')
    }).catch((error) => {
      console.error('[Escrevaral] Registro de autoria não pôde ser aberto.', error)
      if (active) setMessage('O registro de autoria não pôde ser aberto nesta sessão.')
    })
    const unsubscribe = subscribeProofRecord(document.id, (next) => {
      if (active) setRecord(next)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [document.id])

  useEffect(() => {
    let active = true
    void loadProofAuthor().then((next) => {
      if (!active) return
      setAuthor(next)
      setAuthorName(next?.name ?? '')
      setArtisticName(next?.artisticName ?? '')
    })
    return () => { active = false }
  }, [])

  const summary = useMemo(() => record ? summarizeProof(record) : null, [record])
  const activeSession = useMemo(() => record ? activeProofSession(record) : null, [record])
  const pastSessions = useMemo(() => record
    ? record.sessions.filter((session) => session.id !== record.activeSessionId)
    : [], [record])
  const liveText = readLiveEditorSnapshot(document.id)?.plainText ?? document.plainText
  const canExport = Boolean(liveText.trim() && summary && summary.organicEvents > 0)

  const createSession = async () => {
    setBusy(true)
    try {
      const next = await startNewProofSession(document.id)
      setRecord(next)
      setMessage('Nova sessão de autoria iniciada.')
    } catch (error) {
      console.error('[Escrevaral] Nova sessão de autoria não concluída.', error)
      setMessage('Não foi possível iniciar uma nova sessão agora.')
    } finally {
      setBusy(false)
    }
  }

  const saveAuthor = async () => {
    const name = authorName.trim()
    if (!name) {
      setMessage('Informe um nome para registrar a declaração local.')
      return
    }
    const next: ProofAuthor = {
      name,
      artisticName: artisticName.trim(),
      signedAt: new Date().toISOString(),
    }
    await saveProofAuthor(next)
    setAuthor(next)
    setMessage('Assinatura local registrada neste navegador.')
  }

  const removeAuthor = async () => {
    await saveProofAuthor(null)
    setAuthor(null)
    setAuthorName('')
    setArtisticName('')
    setMessage('Assinatura local removida.')
  }

  const exportProof = async () => {
    if (!canExport || !record) return
    setBusy(true)
    setMessage('Gerando a prova local de autoria…')
    try {
      await flushProofRecord(document.id)
      const currentRecord = await getProofRecord(document.id)
      const snapshot = readLiveEditorSnapshot(document.id)
      const currentDocument = snapshot ? { ...document, plainText: snapshot.plainText, content: snapshot.content } : document
      const proof = await createLocalProofDocument(currentRecord, currentDocument, author)
      const session = activeProofSession(currentRecord)
      downloadJson(proof, `${slugifyFilename(document.title)}-${slugifyFilename(session.name)}.prova.esc`)
      setMessage('Arquivo de prova gerado localmente.')
    } catch (error) {
      console.error('[Escrevaral] Prova de autoria não pôde ser exportada.', error)
      setMessage('Não foi possível gerar a prova agora.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="proof-panel" aria-labelledby="proof-panel-title">
      <div className="section-label" id="proof-panel-title">Prova de autoria</div>
      <p className="panel-intro">Registra intervalos e tipos de movimento no editor. Não guarda as teclas nem o conteúdo digitado.</p>

      {summary && activeSession && (
        <div className="proof-summary" aria-label="Resumo da sessão de autoria">
          <div><strong>{summary.organicEvents}</strong><span>toques orgânicos</span></div>
          <div><strong>{summary.cadenceWpm || '—'}</strong><span>cadência estimada</span></div>
          <div><strong>{summary.integrity || '—'}</strong><span>integridade</span></div>
          <div><strong>{record?.sessions.length ?? 1}</strong><span>sessões</span></div>
        </div>
      )}

      <p className="proof-message" role="status">{message}</p>

      <div className="proof-actions">
        <button className="action subtle" type="button" onClick={() => { void createSession() }} disabled={busy}>Nova sessão</button>
        <button className="action primary" type="button" onClick={() => { void exportProof() }} disabled={busy || !canExport}>Baixar .prova.esc</button>
      </div>
      {!canExport && <p className="proof-note">A exportação abre depois que houver texto e pelo menos um intervalo orgânico registrado.</p>}

      {activeSession && activeSession.events.length > 0 && (
        <section className="proof-recent">
          <h4 className="section-label">Movimentos recentes</h4>
          <ul>
            {activeSession.events.slice(-5).reverse().map((event, index) => (
              <li key={`${event.at}-${index}`}>
                <span>{event.keyType.startsWith('structural:') ? event.keyType.replace('structural:', '') : event.organic ? 'toque orgânico' : 'toque fora do intervalo'}</span>
                <small>{event.interval == null ? 'início' : `${event.interval} ms`}{event.wordDelta ? ` · Δ ${event.wordDelta > 0 ? '+' : ''}${event.wordDelta} pal.` : ''}</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pastSessions.length > 0 && (
        <details className="proof-history">
          <summary>Sessões anteriores ({pastSessions.length})</summary>
          <div>
            {pastSessions.map((session) => {
              const sessionSummary = summarizeProofSession(session)
              return (
                <article key={session.id}>
                  <strong>{session.name}</strong>
                  <span>{sessionSummary.organicEvents} toques · {sessionSummary.integrity || 0}% · {sessionSummary.status}</span>
                </article>
              )
            })}
          </div>
        </details>
      )}

      <section className="proof-author" aria-labelledby="proof-author-title">
        <h4 className="section-label" id="proof-author-title">Assinatura local</h4>
        <p className="proof-note">Opcional. O nome entra somente no arquivo de prova que você gerar.</p>
        <input className="search" value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Nome" aria-label="Nome para a declaração de autoria" />
        <input className="search" value={artisticName} onChange={(event) => setArtisticName(event.target.value)} placeholder="Nome artístico (opcional)" aria-label="Nome artístico para a declaração de autoria" />
        <div className="proof-actions">
          <button className="action subtle" type="button" onClick={() => { void saveAuthor() }}>Registrar assinatura</button>
          {author && <button className="action subtle" type="button" onClick={() => { void removeAuthor() }}>Remover assinatura</button>}
        </div>
      </section>
    </section>
  )
}
