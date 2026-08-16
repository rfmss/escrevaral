import { useEffect, useState } from 'react'

function findTagsTrigger(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.analysis-panel .tags .section-title .add')
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

    const syncState = () => {
      const railOpen = Boolean(document.querySelector('.reference-mobile-legacy #text-tools.rail.open'))
      const tagsOpen = document.body.classList.contains('reference-tags-open') && railOpen
      trigger.setAttribute('aria-expanded', String(tagsOpen))
      if (!railOpen) document.body.classList.remove('reference-tags-open')
    }

    const revealTags = () => {
      document.body.classList.remove('reference-research-open')
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

    const root = document.getElementById('root')
    const observer = root ? new MutationObserver(syncState) : null
    observer?.observe(root!, { attributes: true, attributeFilter: ['class'], subtree: true })

    return () => {
      trigger.removeEventListener('click', revealTags)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
      observer?.disconnect()
      document.body.classList.remove('reference-tags-open')
    }
  }, [trigger])

  return null
}
