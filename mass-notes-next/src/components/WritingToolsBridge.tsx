import { useEffect } from 'react'

function findLauncher(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Notas') ?? null
}

export function WritingToolsBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    let launcher: HTMLButtonElement | null = null
    let railObserver: MutationObserver | null = null
    let rootObserver: MutationObserver | null = null

    const syncOpenState = () => {
      const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
      const open = Boolean(rail?.classList.contains('open'))
      if (!open) document.body.classList.remove('reference-tools-open')
      launcher?.setAttribute('aria-expanded', String(open && document.body.classList.contains('reference-tools-open')))
    }

    const openTools = (event: MouseEvent) => {
      event.preventDefault()
      document.body.classList.remove('reference-voice-open', 'reference-lexical-open', 'reference-research-open', 'reference-tags-open')
      document.body.classList.add('reference-tools-open')
      document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()
      requestAnimationFrame(syncOpenState)
    }

    const install = () => {
      if (launcher) return true
      const next = findLauncher()
      if (!next) return false
      launcher = next
      launcher.disabled = false
      launcher.removeAttribute('aria-disabled')
      launcher.setAttribute('aria-label', 'Abrir oficina de ferramentas')
      launcher.setAttribute('aria-controls', 'text-tools')
      launcher.setAttribute('aria-expanded', 'false')
      const label = launcher.querySelector('small')
      if (label) label.textContent = 'Oficina'
      launcher.addEventListener('click', openTools, true)

      const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
      if (rail) {
        railObserver = new MutationObserver(syncOpenState)
        railObserver.observe(rail, { attributes: true, attributeFilter: ['class'] })
      }
      return true
    }

    if (!install()) {
      rootObserver = new MutationObserver(() => {
        if (install()) {
          rootObserver?.disconnect()
          rootObserver = null
        }
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }

    return () => {
      rootObserver?.disconnect()
      railObserver?.disconnect()
      if (launcher) {
        launcher.removeEventListener('click', openTools, true)
        launcher.disabled = true
        launcher.setAttribute('aria-disabled', 'true')
        launcher.removeAttribute('aria-controls')
        launcher.removeAttribute('aria-expanded')
        launcher.removeAttribute('aria-label')
        const label = launcher.querySelector('small')
        if (label) label.textContent = 'Notas'
      }
      document.body.classList.remove('reference-tools-open')
    }
  }, [])

  return null
}
