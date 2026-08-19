import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { readNativeBackupExportedAt } from '../backup/nativeBackup'
import { getDocument, listDocuments } from '../storage/documentRepository'

const RECOVERY_KEY = 'escrevaral-mass-notes-next-recovery'
const PAGE_MARK_KEY = 'escrevaral-offline-page-mark-v1'
const RELOAD_COUNT_KEY = 'escrevaral-offline-reload-count-v1'
const BACKUP_DISMISSED_KEY = 'escrevaral-offline-backup-dismissed-v1'
const BACKUP_WARNING_MS = 7 * 24 * 60 * 60 * 1000

type RecoverySnapshot = {
  document?: {
    id?: string
    revision?: number
    updatedAt?: number
  }
}

function readStorage(storage: Storage, key: string): string | null {
  try { return storage.getItem(key) } catch { return null }
}

function writeStorage(storage: Storage, key: string, value: string): void {
  try { storage.setItem(key, value) } catch { /* Preferências transitórias podem falhar em modo restrito. */ }
}

function registerPageLoad(): number {
  const pageMark = String(performance.timeOrigin)
  if (readStorage(sessionStorage, PAGE_MARK_KEY) === pageMark) {
    return Number(readStorage(sessionStorage, RELOAD_COUNT_KEY) ?? '0') || 0
  }

  writeStorage(sessionStorage, PAGE_MARK_KEY, pageMark)
  const next = (Number(readStorage(sessionStorage, RELOAD_COUNT_KEY) ?? '0') || 0) + 1
  writeStorage(sessionStorage, RELOAD_COUNT_KEY, String(next))
  return next
}

async function hasRecoverableDraft(): Promise<boolean> {
  const raw = readStorage(localStorage, RECOVERY_KEY)
  if (!raw) return false

  try {
    const recovery = JSON.parse(raw) as RecoverySnapshot
    const id = recovery.document?.id
    const revision = recovery.document?.revision
    const updatedAt = recovery.document?.updatedAt
    if (!id || !Number.isInteger(revision) || !Number.isFinite(updatedAt)) return false
    const persisted = await getDocument(id)
    return Boolean(
      persisted
      && revision === persisted.revision
      && Number(updatedAt) > persisted.updatedAt,
    )
  } catch {
    return false
  }
}

function currentSaveIsSafe(): boolean {
  return document.querySelector<HTMLElement>('.statusbar .sync-save')?.textContent?.trim() === 'Salvo'
}

function openExistingBackupPanel(): void {
  document.body.classList.remove('reference-voice-open', 'reference-lexical-open', 'reference-research-open', 'reference-tags-open')
  document.body.classList.add('reference-tools-open')
  document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()
  window.requestAnimationFrame(() => document.getElementById('tab-ferramentas')?.click())
}

export function WritingOfflineBridge() {
  const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(null)
  const [saveSafe, setSaveSafe] = useState(false)
  const [backupNudge, setBackupNudge] = useState(false)
  const [recoveryNotice, setRecoveryNotice] = useState(false)
  const [connectionNotice, setConnectionNotice] = useState('')
  const reloadOnControllerChange = useRef(false)

  useEffect(() => {
    const sync = () => setSaveSafe(currentSaveIsSafe())
    sync()
    const root = document.getElementById('root')
    if (!root) return
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    let recoveryTimer = 0

    void hasRecoverableDraft().then((recoverable) => {
      if (cancelled || !recoverable) return
      setRecoveryNotice(true)
      recoveryTimer = window.setTimeout(() => setRecoveryNotice(false), 8_000)
    })

    const loads = registerPageLoad()
    if (loads >= 2 && readStorage(sessionStorage, BACKUP_DISMISSED_KEY) !== '1') {
      void listDocuments().then((documents) => {
        if (cancelled || !documents.some((item) => item.plainText.trim())) return
        const lastExport = readNativeBackupExportedAt()
        if (!lastExport || Date.now() - lastExport >= BACKUP_WARNING_MS) setBackupNudge(true)
      })
    }

    const onBackupExported = () => setBackupNudge(false)
    window.addEventListener('escrevaral:backup-exported', onBackupExported)

    return () => {
      cancelled = true
      window.clearTimeout(recoveryTimer)
      window.removeEventListener('escrevaral:backup-exported', onBackupExported)
    }
  }, [])

  useEffect(() => {
    let timer = 0
    const showConnection = (message: string, duration: number) => {
      window.clearTimeout(timer)
      setConnectionNotice(message)
      timer = window.setTimeout(() => setConnectionNotice(''), duration)
    }
    const onOffline = () => showConnection('Sem rede — a oficina continua localmente.', 7_000)
    const onOnline = () => showConnection('Conexão voltou. Seu texto continua salvo localmente.', 4_000)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

    let cancelled = false
    let registration: ServiceWorkerRegistration | null = null
    let interval = 0

    const exposeWaitingWorker = (worker: ServiceWorker | null) => {
      if (!cancelled && worker && navigator.serviceWorker.controller) setUpdateWorker(worker)
    }

    const onControllerChange = () => {
      if (reloadOnControllerChange.current) window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`).then((next) => {
      if (cancelled) return
      registration = next
      exposeWaitingWorker(next.waiting)

      next.addEventListener('updatefound', () => {
        const worker = next.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') exposeWaitingWorker(worker)
        })
      })

      void next.update().catch(() => {})
      interval = window.setInterval(() => { void next.update().catch(() => {}) }, 30 * 60 * 1000)
    }).catch((error) => {
      console.error('[Escrevaral] Modo offline não pôde ser ativado.', error)
    })

    return () => {
      cancelled = true
      window.clearInterval(interval)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      registration = null
    }
  }, [])

  const applyUpdate = () => {
    if (!updateWorker || !saveSafe) return
    reloadOnControllerChange.current = true
    updateWorker.postMessage({ type: 'SKIP_WAITING' })
  }

  const dismissBackup = () => {
    writeStorage(sessionStorage, BACKUP_DISMISSED_KEY, '1')
    setBackupNudge(false)
  }

  const openBackup = () => {
    setBackupNudge(false)
    openExistingBackupPanel()
  }

  const bottomNotice = recoveryNotice
    ? { kind: 'recovery', text: 'Rascunho local recuperado após uma interrupção. O salvamento automático foi retomado.' }
    : backupNudge
      ? { kind: 'backup', text: 'Seu acervo está só neste navegador. Vale guardar uma cópia de segurança.' }
      : connectionNotice
        ? { kind: 'connection', text: connectionNotice }
        : null

  if (!updateWorker && !bottomNotice) return null

  return createPortal(
    <>
      {updateWorker && (
        <section className="offline-update-banner" role="alert" aria-live="polite">
          <span aria-hidden="true">↻</span>
          <div>
            <strong>Nova versão pronta.</strong>
            <small>{saveSafe ? 'Seu texto está salvo localmente; pode atualizar.' : 'Aguarde o salvamento terminar antes de atualizar.'}</small>
          </div>
          <button type="button" onClick={applyUpdate} disabled={!saveSafe}>Atualizar</button>
          <button type="button" className="offline-dismiss" aria-label="Fechar aviso de atualização" onClick={() => setUpdateWorker(null)}>×</button>
        </section>
      )}

      {bottomNotice && (
        <section className={`offline-feedback-card offline-feedback-${bottomNotice.kind}`} role="status" aria-live="polite">
          <span aria-hidden="true">●</span>
          <div>{bottomNotice.text}</div>
          {bottomNotice.kind === 'backup' ? (
            <>
              <button type="button" onClick={openBackup}>Abrir cópia</button>
              <button type="button" className="offline-dismiss" aria-label="Fechar lembrete de cópia de segurança" onClick={dismissBackup}>×</button>
            </>
          ) : (
            <button type="button" className="offline-dismiss" aria-label="Fechar aviso" onClick={() => { setRecoveryNotice(false); setConnectionNotice('') }}>×</button>
          )}
        </section>
      )}
    </>,
    document.body,
  )
}
