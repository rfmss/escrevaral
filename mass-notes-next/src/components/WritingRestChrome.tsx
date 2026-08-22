import { useEffect, useState } from 'react'

export function WritingRestChrome() {
  const [workshopOpen, setWorkshopOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('writing-rest')
    document.body.classList.toggle('workshop-open', workshopOpen)

    return () => {
      document.body.classList.remove('writing-rest')
      document.body.classList.remove('workshop-open')
    }
  }, [workshopOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      // Escape respeita a pilha de superfícies: um drawer/modal aberto fecha
      // primeiro pelo proprietário (App/RightRail). Este listener roda na fase
      // de captura para observar a camada transitória antes que o handler dono
      // a remova no bubbling. Só um Escape sem camada aberta volta ao repouso.
      const transientSurfaceOpen = Boolean(
        document.querySelector('.drawer-overlay, .sidebar.open, #text-tools.rail.open'),
      )
      if (transientSurfaceOpen) return

      setWorkshopOpen(false)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  const toggleWorkshop = () => {
    setWorkshopOpen((value) => {
      const next = !value

      // No desktop, o chrome da oficina é governado pela classe workshop-open:
      // biblioteca, análise e launchers reaparecem pela própria composição.
      // Acionar os botões móveis aqui criava drawers modais e overlays sobre a
      // interface desktop, interceptando cliques (inclusive a Oficina real).
      if (next && window.matchMedia('(max-width: 820px)').matches) {
        window.requestAnimationFrame(() => {
          const sidebar = document.querySelector<HTMLElement>('.sidebar')
          const rail = document.querySelector<HTMLElement>('#text-tools.rail')
          if (sidebar && !sidebar.classList.contains('open')) {
            document.querySelector<HTMLButtonElement>('.mobile-menu')?.click()
          }
          if (rail && !rail.classList.contains('open')) {
            document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()
          }
        })
      }
      return next
    })
  }

  return (
    <button
      className="writing-workshop-toggle"
      type="button"
      aria-expanded={workshopOpen}
      aria-label={workshopOpen ? 'Voltar à escrita silenciosa' : 'Abrir a oficina do Escrevaral'}
      onClick={toggleWorkshop}
    >
      {workshopOpen ? 'Escrever' : 'Escrevaral'}
    </button>
  )
}
