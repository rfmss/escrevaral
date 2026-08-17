import { useEffect } from 'react'

function setText(element: Element | null, value: string) {
  if (element && element.textContent !== value) element.textContent = value
}

function setDisabled(button: HTMLButtonElement | null, label?: string) {
  if (!button) return
  button.disabled = true
  button.setAttribute('aria-disabled', 'true')
  button.dataset.integrityStatic = 'true'
  if (label) button.setAttribute('aria-label', label)
}

function syncIntegrity() {
  const modeButton = document.querySelector<HTMLButtonElement>('.topbar .mode button')
  setDisabled(modeButton, 'Modo atual: Escrita')

  const notesButton = document.querySelector<HTMLButtonElement>('.main-actions > button:nth-child(2)')
  setDisabled(notesButton, 'Notas — ainda não disponível')

  const research = document.querySelector<HTMLElement>('.left-rail .research')
  if (research) {
    setText(research.querySelector('.eyebrow'), 'REVISÃO LOCAL')
    research.setAttribute('aria-label', 'Revisão local do documento')
    const rows = Array.from(research.querySelectorAll<HTMLLIElement>('li'))
    rows.forEach((row, index) => {
      row.hidden = index > 0
      if (index === 0) {
        row.classList.add('reference-integrity-research-copy')
        row.setAttribute('aria-label', 'Use Pesquisa para executar a revisão local do documento ativo.')
      }
    })
  }

  const quickBox = document.querySelector<HTMLElement>('.left-rail .quick-box')
  if (quickBox) {
    quickBox.hidden = true
    quickBox.setAttribute('aria-hidden', 'true')
  }

  const distribution = document.querySelector<HTMLElement>('.analysis-panel .distribution-section')
  if (distribution) {
    distribution.hidden = true
    distribution.setAttribute('aria-hidden', 'true')
  }

  const tagsSection = document.querySelector<HTMLElement>('.analysis-panel .tags')
  const realTagsInput = document.querySelector<HTMLInputElement>('.reference-mobile-legacy #document-tags')
  const hasRealTags = Boolean(realTagsInput?.value.trim())
  document.body.classList.toggle('reference-tags-empty', !hasRealTags)
  if (tagsSection) {
    tagsSection.setAttribute('aria-label', hasRealTags ? 'Tags do documento' : 'Tags do documento: nenhuma tag')
  }

  const versions = document.querySelector<HTMLElement>('.analysis-panel .versions')
  if (versions) {
    setText(versions.querySelector('h3'), 'ESTADO LOCAL')
    versions.setAttribute('aria-label', 'Estado local do documento')
    const allVersions = versions.querySelector<HTMLAnchorElement>('.section-title a')
    if (allVersions) {
      allVersions.hidden = true
      allVersions.tabIndex = -1
      allVersions.setAttribute('aria-hidden', 'true')
    }
    const revision = versions.querySelector<HTMLElement>('.version b')
    const match = revision?.textContent?.match(/^v(\d+)\.0$/)
    if (revision && match) revision.textContent = `rev. ${match[1]}`
  }

  const focusValue = document.querySelector<HTMLElement>('.statusbar .focus strong')
  setText(focusValue, document.body.classList.contains('focus-mode') ? 'Ativo' : 'Pronto')

  const languageButton = document.querySelector<HTMLButtonElement>('.statusbar .language button')
  if (languageButton) {
    languageButton.hidden = true
    languageButton.tabIndex = -1
    languageButton.setAttribute('aria-hidden', 'true')
  }

  const fontButton = document.querySelector<HTMLButtonElement>('.formatbar > label:nth-child(2) button')
  setDisabled(fontButton, 'Fonte atual: Literata')

  document.querySelectorAll<HTMLButtonElement>('.formatbar > label:nth-child(3) .size button').forEach((button) => {
    setDisabled(button, 'Tamanho de fonte fixo nesta versão')
  })

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
