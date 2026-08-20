import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const SAVE_HINT_KEY = 'escrevaral-local-save-hint-seen-v1'

function readSeen(): boolean {
  try { return localStorage.getItem(SAVE_HINT_KEY) === '1' } catch { return false }
}

function markSeen(): void {
  try { localStorage.setItem(SAVE_HINT_KEY, '1') } catch { /* O aviso ainda pode funcionar na sessão atual. */ }
}

export function WritingLocalFeedbackBridge() {
  const [hintVisible, setHintVisible] = useState(false)

  useEffect(() => {
    let editor: HTMLElement | null = null
    let timeout = 0

    const onFirstInput = () => {
      if (readSeen()) return
      markSeen()
      setHintVisible(true)
      timeout = window.setTimeout(() => setHintVisible(false), 7_000)
    }

    const bind = () => {
      if (readSeen()) return true
      const next = document.querySelector<HTMLElement>('.ProseMirror')
      if (!next) return false
      if (editor === next) return true
      editor?.removeEventListener('input', onFirstInput)
      editor = next
      editor.addEventListener('input', onFirstInput, { once: true })
      return true
    }

    if (!bind()) {
      const root = document.getElementById('root')
      if (!root) return
      const observer = new MutationObserver(() => {
        if (bind()) observer.disconnect()
      })
      observer.observe(root, { childList: true, subtree: true })
      return () => {
        observer.disconnect()
        editor?.removeEventListener('input', onFirstInput)
        window.clearTimeout(timeout)
      }
    }

    return () => {
      editor?.removeEventListener('input', onFirstInput)
      window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    let labelObserver: MutationObserver | null = null
    let rootObserver: MutationObserver | null = null

    const applyLocalSemantics = () => {
      const sync = document.querySelector<HTMLElement>('.statusbar .sync')
      const label = sync?.querySelector<HTMLElement>('.eyebrow')
      if (!sync || !label) return false

      if (label.textContent?.trim() === 'SINCRONIZADO') {
        label.textContent = 'SALVO LOCALMENTE'
      }
      sync.title = 'O documento é salvo neste navegador. Não há sincronização com nuvem.'
      return true
    }

    const bind = () => {
      const label = document.querySelector<HTMLElement>('.statusbar .sync .eyebrow')
      if (!label || !applyLocalSemantics()) return false
      if (!labelObserver) {
        labelObserver = new MutationObserver(applyLocalSemantics)
        labelObserver.observe(label, { childList: true, characterData: true, subtree: true })
      }
      return true
    }

    if (!bind()) {
      const root = document.getElementById('root')
      if (!root) return
      rootObserver = new MutationObserver(() => {
        if (bind()) {
          rootObserver?.disconnect()
          rootObserver = null
        }
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }

    return () => {
      labelObserver?.disconnect()
      rootObserver?.disconnect()
    }
  }, [])

  if (!hintVisible) return null

  return createPortal(
    <div className="local-save-hint" role="status" aria-live="polite">
      <span className="local-save-hint-mark" aria-hidden="true">●</span>
      <span>Texto salvo aqui, neste navegador. Sem internet, sem nuvem.</span>
      <button type="button" aria-label="Fechar aviso de salvamento local" onClick={() => setHintVisible(false)}>×</button>
    </div>,
    document.body,
  )
}
