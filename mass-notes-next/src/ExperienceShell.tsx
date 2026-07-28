import { useCallback, useEffect, useRef, useState } from 'react'
import App from './App'
import { AnatomyPage } from './pages/AnatomyPage'
import { PagePressTransition } from './transitions/PagePressTransition'

type ViewId = 'editor' | 'anatomia'

type PressState = {
  serial: number
  target: ViewId
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => unknown
}

const OPEN_ANATOMY_EVENT = 'escrevaral:open-anatomy'

export function ExperienceShell() {
  const [view, setView] = useState<ViewId>('editor')
  const [press, setPress] = useState<PressState | null>(null)
  const serialRef = useRef(0)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    document.body.classList.toggle('experience-anatomy', view === 'anatomia')
    return () => document.body.classList.remove('experience-anatomy')
  }, [view])

  const navigate = useCallback((target: ViewId) => {
    if (target === view || press) return

    clearTimers()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const swapDelay = reducedMotion ? 70 : 560
    const finishDelay = reducedMotion ? 260 : 1_180
    const serial = ++serialRef.current
    setPress({ serial, target })

    timersRef.current.push(window.setTimeout(() => {
      const update = () => setView(target)
      const transitionDocument = document as ViewTransitionDocument
      if (transitionDocument.startViewTransition) {
        transitionDocument.startViewTransition(update)
      } else {
        update()
      }
    }, swapDelay))

    timersRef.current.push(window.setTimeout(() => {
      setPress((current) => current?.serial === serial ? null : current)
      timersRef.current = []
    }, finishDelay))
  }, [clearTimers, press, view])

  useEffect(() => {
    const openAnatomy = () => navigate('anatomia')
    window.addEventListener(OPEN_ANATOMY_EVENT, openAnatomy)
    return () => window.removeEventListener(OPEN_ANATOMY_EVENT, openAnatomy)
  }, [navigate])

  const anatomyMounted = view === 'anatomia' || press?.target === 'anatomia'

  return (
    <>
      <section className="experience-view experience-view--editor" hidden={view !== 'editor'} aria-hidden={view !== 'editor'}>
        <App />
      </section>

      {anatomyMounted && (
        <section className="experience-view experience-view--anatomia" hidden={view !== 'anatomia'} aria-hidden={view !== 'anatomia'}>
          <AnatomyPage onBack={() => navigate('editor')} />
        </section>
      )}

      {press && <PagePressTransition key={press.serial} target={press.target} />}
    </>
  )
}
