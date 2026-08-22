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
      if (event.key === 'Escape') setWorkshopOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleWorkshop = () => {
    setWorkshopOpen((value) => {
      const next = !value
      if (next) {
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
