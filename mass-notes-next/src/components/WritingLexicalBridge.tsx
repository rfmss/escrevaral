import { useEffect } from 'react'

function findLanguageSection(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.analysis-panel .language-section')
}

function ensureLauncher(): HTMLButtonElement | null {
  const section = findLanguageSection()
  if (!section) return null

  let button = section.querySelector<HTMLButtonElement>('.reference-lexical-open')
  if (button) return button

  const launcher = document.createElement('div')
  launcher.className = 'reference-lexical-launcher'
  launcher.innerHTML = `
    <button type="button" class="reference-lexical-open" aria-controls="text-tools" aria-expanded="false">
      Consultar palavras
    </button>
  `
  section.append(launcher)
  button = launcher.querySelector<HTMLButtonElement>('.reference-lexical-open')
  return button
}

function findToolsRail(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
}

function openLexicalTab(): boolean {
  const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
  const tab = rail?.querySelector<HTMLButtonElement>('#tab-palavras')
  if (!rail || !tab) return false
  if (tab.getAttribute('aria-selected') !== 'true') tab.click()
  return tab.getAttribute('aria-selected') === 'true'
}

export function WritingLexicalBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    let railObserver: MutationObserver | null = null
    let rootObserver: MutationObserver | null = null

    const sync = () => {
      const button = ensureLauncher()
      if (!button) return
      const railOpen = Boolean(findToolsRail()?.classList.contains('open'))
      const lexicalOpen = document.body.classList.contains('reference-lexical-open') && railOpen
      button.setAttribute('aria-expanded', String(lexicalOpen))
      if (!railOpen) document.body.classList.remove('reference-lexical-open')
    }

    const installRailObserver = () => {
      if (railObserver) return true
      const rail = findToolsRail()
      if (!rail || !ensureLauncher()) return false
      railObserver = new MutationObserver(sync)
      railObserver.observe(rail, { attributes: true, attributeFilter: ['class'] })
      sync()
      return true
    }

    const reveal = () => {
      document.body.classList.remove('reference-tools-open', 'reference-research-open', 'reference-tags-open', 'reference-voice-open')
      document.body.classList.add('reference-lexical-open')
      document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()

      let attempts = 0
      const settle = () => {
        attempts += 1
        if (openLexicalTab() || attempts >= 12) {
          sync()
          return
        }
        requestAnimationFrame(settle)
      }
      requestAnimationFrame(settle)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('button.reference-lexical-open')) reveal()
    }

    const bodyObserver = new MutationObserver(sync)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    if (!installRailObserver()) {
      rootObserver = new MutationObserver(() => {
        if (installRailObserver()) {
          rootObserver?.disconnect()
          rootObserver = null
        }
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }

    root.addEventListener('click', onClick)
    requestAnimationFrame(sync)

    return () => {
      railObserver?.disconnect()
      rootObserver?.disconnect()
      bodyObserver.disconnect()
      root.removeEventListener('click', onClick)
      document.body.classList.remove('reference-lexical-open')
      document.querySelector('.reference-lexical-launcher')?.remove()
    }
  }, [])

  return null
}
