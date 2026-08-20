import { useEffect } from 'react'

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

export function WritingIntegrityBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

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

    const timer = window.setInterval(syncIntegrity, 250)
    root.addEventListener('click', onClick)
    root.addEventListener('input', syncIntegrity)
    root.addEventListener('change', syncIntegrity)
    requestAnimationFrame(syncIntegrity)

    return () => {
      window.clearInterval(timer)
      root.removeEventListener('click', onClick)
      root.removeEventListener('input', syncIntegrity)
      root.removeEventListener('change', syncIntegrity)
      document.body.classList.remove('reference-analysis-collapsed', 'reference-tags-empty')
    }
  }, [])

  return null
}
