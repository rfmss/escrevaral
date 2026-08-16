import { useEffect, useState } from 'react'

function findResearchTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Pesquisa') ?? null
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

    const syncState = () => {
      const railOpen = Boolean(document.querySelector('.reference-mobile-legacy #text-tools.rail.open'))
      const researchOpen = document.body.classList.contains('reference-research-open') && railOpen
      trigger.setAttribute('aria-expanded', String(researchOpen))
      if (!railOpen) document.body.classList.remove('reference-research-open')
    }

    const revealResearch = () => {
      document.body.classList.add('reference-research-open')
      trigger.setAttribute('aria-expanded', 'true')

      let attempts = 0
      const settle = () => {
        attempts += 1
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

    const root = document.getElementById('root')
    const observer = root
      ? new MutationObserver(syncState)
      : null
    observer?.observe(root!, { attributes: true, attributeFilter: ['class'], subtree: true })

    return () => {
      trigger.removeEventListener('click', revealResearch)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
      observer?.disconnect()
      document.body.classList.remove('reference-research-open')
    }
  }, [trigger])

  return null
}
