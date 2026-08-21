import { useEffect, useState } from 'react'

function findResearchTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Pesquisa') ?? null
}

function findToolsRail(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
}

function openReviewTab(): boolean {
  const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
  const tab = rail?.querySelector<HTMLButtonElement>('#tab-revisao')
  if (!rail || !tab) return false
  if (tab.getAttribute('aria-selected') !== 'true') tab.click()
  return true
}

export function WritingResearchBridge() {
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)

  useEffect(() => {
    const find = () => {
      const next = findResearchTrigger()
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
      const researchOpen = document.body.classList.contains('reference-research-open') && railOpen
      trigger.setAttribute('aria-expanded', String(researchOpen))
      if (!railOpen && document.body.classList.contains('reference-research-open')) {
        document.body.classList.remove('reference-research-open')
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

    const revealResearch = () => {
      document.body.classList.remove('reference-tools-open', 'reference-voice-open', 'reference-lexical-open', 'reference-tags-open')
      trigger.setAttribute('aria-expanded', 'true')

      let attempts = 0
      const settle = () => {
        attempts += 1
        const rail = findToolsRail()
        const railOpen = Boolean(rail?.classList.contains('open'))

        if (!railOpen) {
          if (attempts === 1) document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()
          if (attempts < 6) {
            requestAnimationFrame(settle)
          } else {
            syncState()
          }
          return
        }

        document.body.classList.add('reference-research-open')
        if (openReviewTab() || attempts >= 6) {
          syncState()
          return
        }
        requestAnimationFrame(settle)
      }
      requestAnimationFrame(settle)
    }

    trigger.addEventListener('click', revealResearch)
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
      trigger.removeEventListener('click', revealResearch)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
      railObserver?.disconnect()
      rootObserver?.disconnect()
      bodyObserver.disconnect()
      document.body.classList.remove('reference-research-open')
    }
  }, [trigger])

  return null
}
