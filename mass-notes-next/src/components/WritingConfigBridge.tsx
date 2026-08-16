import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalDrawer } from './useModalDrawer'

function findConfigTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Config.') ?? null
}

export function WritingConfigBridge() {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [night, setNight] = useState(() => document.body.classList.contains('night'))
  const bypassTrigger = useRef(false)
  const panelRef = useModalDrawer<HTMLElement>(open, () => setOpen(false))

  useEffect(() => {
    const find = () => {
      const next = findConfigTrigger()
      if (next) setTrigger((current) => current === next ? current : next)
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

  useEffect(() => {
    const syncTheme = () => setNight(document.body.classList.contains('night'))
    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!trigger) return

    const openPanel = (event: MouseEvent) => {
      if (bypassTrigger.current) return
      event.preventDefault()
      event.stopPropagation()
      setOpen(true)
    }

    trigger.addEventListener('click', openPanel, true)
    trigger.setAttribute('aria-controls', 'writing-config-panel')

    return () => {
      trigger.removeEventListener('click', openPanel, true)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
    }
  }, [trigger])

  useEffect(() => {
    trigger?.setAttribute('aria-expanded', String(open))
  }, [open, trigger])

  const toggleTheme = () => {
    if (!trigger) return
    bypassTrigger.current = true
    trigger.click()
    bypassTrigger.current = false
  }

  const activateExistingControl = (selector: string) => {
    setOpen(false)
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(selector)?.click()
    })
  }

  if (!open) return null

  return createPortal(
    <div className="writing-config-layer">
      <button className="writing-config-overlay" type="button" aria-label="Fechar configurações" onClick={() => setOpen(false)} />
      <section
        ref={panelRef}
        id="writing-config-panel"
        className="writing-config-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="writing-config-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span className="eyebrow">AMBIENTE LOCAL</span>
            <h2 id="writing-config-title">Configurações</h2>
          </div>
          <button type="button" className="icon-square" aria-label="Fechar configurações" onClick={() => setOpen(false)}>×</button>
        </header>

        <div className="writing-config-section">
          <span className="writing-config-label">APARÊNCIA</span>
          <button data-drawer-initial type="button" className="writing-config-row" onClick={toggleTheme}>
            <span><strong>{night ? 'Modo noite' : 'Papel'}</strong><small>A aparência fica somente neste navegador.</small></span>
            <b>{night ? 'Usar papel' : 'Usar modo noite'}</b>
          </button>
        </div>

        <div className="writing-config-section">
          <span className="writing-config-label">ESCRITA</span>
          <button type="button" className="writing-config-row" onClick={() => activateExistingControl('.statusbar .focus .play')}>
            <span><strong>Concentração</strong><small>Esconde a casa e mantém o manuscrito em primeiro plano.</small></span>
            <b>Entrar no foco</b>
          </button>
        </div>

        <div className="writing-config-section writing-config-grid">
          <button type="button" onClick={() => activateExistingControl('.statusbar .fullscreen .footer-button')}>
            <span>TELA</span><strong>Tela cheia</strong>
          </button>
          <button type="button" onClick={() => activateExistingControl('.statusbar .book .footer-button')}>
            <span>LIVRO</span><strong>Abrir Anatomia</strong>
          </button>
        </div>

        <footer>
          <span>IDIOMA</span>
          <strong>Português (BR)</strong>
          <small>locale de produto</small>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
