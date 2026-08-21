import { useEffect, useState } from 'react'

function findTagsTrigger(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.analysis-panel .tags .section-title .add')
}

function findToolsRail(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
}

function openRealTagsEditor(): boolean {
  const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
  const pulseTab = rail?.querySelector<HTMLButtonElement>('#tab-pulso')
  const input = rail?.querySelector<HTMLInputElement>('#document-tags')
  if (!rail || !pulseTab || !input) return false

  if (pulseTab.getAttribute('aria-selected') !== 'true') pulseTab.click()
  requestAnimationFrame(() => input.focus())
  return true
}

export function WritingTagsBridge() {
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)

  useEffect(() => {
    const find = () => {
      const next = findTagsTrigger()
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
    if (!trigger) return

    let railObserver: MutationObserver | null = null
    let rootObserver: MutationObserver | null = null

    const syncState = () => {
      const railOpen = Boolean(findToolsRail()?.classList.contains('open'))
      const tagsOpen = document.body.classList.contains('reference-tags-open') && railOpen
      trigger.setAttribute('aria-expanded', String(tagsOpen))
      if (!railOpen && document.body.classList.contains('reference-tags-open')) {
        document.body.classList.remove('reference-tags-open')
      }
    }

    const installRailObserver = () => {
      if (railObserver) return true
      const rail = findToolsRail()
      if (!rail) return false
      railObserver = new MutationObserver(syncState)
      railObserver.observe(rail, { attributes: true, attributeFilter: ['class'] })
      return true
    }

    const revealTags = () => {
      document.body.classList.remove('reference-tools-open', 'reference-research-open', 'reference-voice-open', 'reference-lexical-open')
      document.body.classList.add('reference-tags-open')
      trigger.setAttribute('aria-expanded', 'true')

      document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()

      let attempts = 0
      const settle = () => {
        attempts += 1
        if (openRealTagsEditor() || attempts >= 8) {
          syncState()
          return
        }
        requestAnimationFrame(settle)
      }
      requestAnimationFrame(settle)
    }

    trigger.addEventListener('click', revealTags)
    trigger.setAttribute('aria-label', 'Editar tags do documento')
    trigger.setAttribute('aria-controls', 'text-tools')
    trigger.setAttribute('aria-expanded', 'false')

    const bodyObserver = new MutationObserver(syncState)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    if (!installRailObserver()) {
      const root = document.getElementById('root')
      if (root) {
        rootObserver = new MutationObserver(() => {
          if (installRailObserver()) {
            rootObserver?.disconnect()
            rootObserver = null
          }
        })
        rootObserver.observe(root, { childList: true, subtree: true })
      }
    }

    syncState()

    return () => {
      trigger.removeEventListener('click', revealTags)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
      railObserver?.disconnect()
      rootObserver?.disconnect()
      bodyObserver.disconnect()
      document.body.classList.remove('reference-tags-open')
    }
  }, [trigger])

  return null
}
