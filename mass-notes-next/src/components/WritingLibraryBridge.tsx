import { useEffect } from 'react'

function libraryIsOpen(): boolean {
  return document.querySelector('#document-library')?.classList.contains('open') ?? false
}

function syncLibraryTrigger() {
  const trigger = document.querySelector<HTMLButtonElement>('.left-rail .current-project .project-row button')
  const open = libraryIsOpen()
  if (trigger) {
    trigger.hidden = false
    trigger.tabIndex = 0
    trigger.removeAttribute('aria-hidden')
    trigger.setAttribute('aria-label', open ? 'Biblioteca local aberta' : 'Abrir biblioteca local')
    trigger.setAttribute('aria-controls', 'document-library')
    trigger.setAttribute('aria-expanded', String(open))
  }
  document.body.classList.toggle('reference-library-open', open)
}

export function WritingLibraryBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const openLibrary = () => {
      document.body.classList.remove('reference-research-open', 'reference-tags-open', 'reference-voice-open')
      if (!libraryIsOpen()) document.querySelector<HTMLButtonElement>('.mobile-menu')?.click()
      requestAnimationFrame(syncLibraryTrigger)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.left-rail .current-project .project-row button')) openLibrary()
    }

    const timer = window.setInterval(syncLibraryTrigger, 250)
    root.addEventListener('click', onClick)
    requestAnimationFrame(syncLibraryTrigger)

    return () => {
      window.clearInterval(timer)
      root.removeEventListener('click', onClick)
      document.body.classList.remove('reference-library-open')
    }
  }, [])

  return null
}
