import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { countWords } from '../domain/document'
import { summarizeProof, type ProofRecord } from '../engines/proofAdapter'
import { readLatestLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import { getProofRecord, subscribeProofRecord } from '../proof/proofRecorder'

export function WritingProofStatusBridge() {
  const initialSnapshot = readLatestLiveEditorSnapshot()
  const [documentId, setDocumentId] = useState(initialSnapshot?.documentId ?? '')
  const [plainText, setPlainText] = useState(initialSnapshot?.plainText ?? '')
  const [record, setRecord] = useState<ProofRecord | null>(null)
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState('')
  const previousEvents = useRef<number | null>(null)
  const messageTimer = useRef<number | null>(null)

  useEffect(() => subscribeLiveEditorSnapshot((snapshot) => {
    setDocumentId(snapshot.documentId)
    setPlainText(snapshot.plainText)
  }), [])

  useEffect(() => {
    if (!documentId) return
    let active = true
    previousEvents.current = null
    setRecord(null)

    void getProofRecord(documentId).then((next) => {
      if (!active) return
      previousEvents.current = summarizeProof(next).totalEvents
      setRecord(next)
    })

    const unsubscribe = subscribeProofRecord(documentId, (next) => {
      if (!active) return
      const totalEvents = summarizeProof(next).totalEvents
      const before = previousEvents.current
      previousEvents.current = totalEvents
      setRecord(next)

      if (before === 0 && totalEvents > 0) {
        setMessage('Sinais de autoria guardados aqui.')
        if (messageTimer.current) window.clearTimeout(messageTimer.current)
        messageTimer.current = window.setTimeout(() => setMessage(''), 3_000)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [documentId])

  useEffect(() => {
    const find = () => {
      const next = document.querySelector<HTMLElement>('.analysis-panel .versions')
      if (next) setHost((current) => current === next ? current : next)
      return Boolean(next)
    }

    if (find()) return
    const root = document.getElementById('root')
    if (!root) return
    const observer = new MutationObserver(() => {
      if (find()) observer.disconnect()
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (messageTimer.current) window.clearTimeout(messageTimer.current)
  }, [])

  const summary = useMemo(() => record ? summarizeProof(record) : null, [record])
  const words = useMemo(() => countWords(plainText), [plainText])
  const visible = Boolean(summary && words >= 50 && summary.totalEvents > 0 && summary.integrity > 0)

  return (
    <>
      {host && visible && summary && createPortal(
        <div className="reference-proof-status" data-level={summary.integrity >= 80 ? 'high' : summary.integrity >= 50 ? 'medium' : 'low'}>
          <span>Autoria local</span>
          <strong>{summary.integrity}%</strong>
          <small>{summary.status}</small>
        </div>,
        host,
      )}
      {message && createPortal(
        <div className="proof-capture-toast" role="status" aria-live="polite">{message}</div>,
        document.body,
      )}
    </>
  )
}
