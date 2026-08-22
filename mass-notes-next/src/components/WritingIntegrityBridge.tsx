import { useEffect } from 'react'

const INTEGRITY_SELECTOR = '.analysis-panel .tags, .reference-mobile-legacy #document-tags'

function syncIntegrity() {
  const tagsSection = document.querySelector<HTMLElement>('.analysis-panel .tags')
  const realTagsInput = document.querySelector<HTMLInputElement>('.reference-mobile-legacy #document-tags')
  const hasRealTags = Boolean(realTagsInput?.value.trim())
  document.body.classList.toggle('reference-tags-empty', !hasRealTags)
  if (tagsSection) {
    tagsSection.setAttribute('aria-label', hasRealTags ? 'Tags do documento' : 'Tags do documento: nenhuma tag')
  }

  const analysisToggle = document.querySelector<HTMLButtonElement>('.analysis-panel .analysis-head .icon-square')
  if (analysisToggle) {
    const collapsed = document.body.classList.contains('reference-analysis-collapsed')
    analysisToggle.setAttribute('aria-expanded', String(!collapsed))
    analysisToggle.setAttribute('aria-label', collapsed ? 'Expandir análise' : 'Recolher análise')
  }
}

function touchesIntegrity(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement
  if (!element) return false
  return Boolean(element.closest(INTEGRITY_SELECTOR) || element.querySelector(INTEGRITY_SELECTOR))
}

export function WritingIntegrityBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    let syncFrame = 0
    const queueSync = () => {
      if (syncFrame) return
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0
        syncIntegrity()
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      const analysisToggle = target.closest<HTMLButtonElement>('.analysis-panel .analysis-head .icon-square')
      if (analysisToggle) {
        document.body.classList.toggle('reference-analysis-collapsed')
        syncIntegrity()
        return
      }

      const tagChip = target.closest<HTMLButtonElement>('.analysis-panel .tags > div:last-child > button')
      if (tagChip && !tagChip.classList.contains('add')) {
        event.preventDefault()
        document.querySelector<HTMLButtonElement>('.analysis-panel .tags .section-title .add')?.click()
      }
    }

    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => {
        if (touchesIntegrity(mutation.target)) return true
        return [...mutation.addedNodes, ...mutation.removedNodes].some(touchesIntegrity)
      })
      if (relevant) queueSync()
    })

    observer.observe(root, { childList: true, subtree: true, characterData: true })
    root.addEventListener('click', onClick)
    root.addEventListener('input', queueSync)
    root.addEventListener('change', queueSync)
    queueSync()

    return () => {
      observer.disconnect()
      if (syncFrame) window.cancelAnimationFrame(syncFrame)
      root.removeEventListener('click', onClick)
      root.removeEventListener('input', queueSync)
      root.removeEventListener('change', queueSync)
      document.body.classList.remove('reference-analysis-collapsed', 'reference-tags-empty')
    }
  }, [])

  return null
}
