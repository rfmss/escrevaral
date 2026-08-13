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
      if (event.key === 'Escape' && workshopOpen && !document.body.classList.contains('focus-mode')) {
        setWorkshopOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [workshopOpen])

  return (
    <button
      className="writing-workshop-toggle"
      type="button"
      aria-expanded={workshopOpen}
      aria-label={workshopOpen ? 'Voltar à escrita silenciosa' : 'Abrir a oficina do Escrevaral'}
      onClick={() => setWorkshopOpen((value) => !value)}
    >
      {workshopOpen ? 'Escrever' : 'Escrevaral'}
    </button>
  )
}
