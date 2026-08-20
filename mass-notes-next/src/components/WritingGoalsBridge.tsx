import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { countWords } from '../domain/document'
import { readLatestLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  DEFAULT_WRITING_GOAL,
  readWritingGoal,
  subscribeWritingGoal,
  writeWritingGoal,
} from '../writing/writingGoal'
import { burstWritingConfetti, celebrateWritingGoal } from '../writing/writingGoalCelebration'
import {
  formatWritingSessionTime,
  readWritingSessionRounds,
  recordWritingSessionRound,
  WRITING_SESSION_COMPLETED_EVENT,
  WRITING_SESSION_MINUTES,
  WRITING_SESSION_SECONDS,
  writingSessionCompletionMessage,
} from '../writing/writingPomodoro'
import { useModalDrawer } from './useModalDrawer'

function findGoalsTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Metas') ?? null
}

export function WritingGoalsBridge() {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [goal, setGoal] = useState(readWritingGoal)
  const [text, setText] = useState(() => readLatestLiveEditorSnapshot()?.plainText ?? '')
  const [sessionSeconds, setSessionSeconds] = useState(WRITING_SESSION_SECONDS)
  const [sessionActive, setSessionActive] = useState(false)
  const [rounds, setRounds] = useState(readWritingSessionRounds)
  const [sessionMessage, setSessionMessage] = useState('')
  const panelRef = useModalDrawer<HTMLElement>(open, () => setOpen(false))
  const sessionDeadline = useRef<number | null>(null)
  const sessionMessageTimer = useRef<number | null>(null)

  const words = useMemo(() => countWords(text), [text])
  const progress = Math.min(100, Math.round(words / goal * 100))
  const remaining = Math.max(0, goal - words)
  const reached = goal > 0 && words >= goal
  const previousReached = useRef(reached)

  useEffect(() => subscribeLiveEditorSnapshot((snapshot) => setText(snapshot.plainText)), [])
  useEffect(() => subscribeWritingGoal(setGoal), [])
  useEffect(() => () => {
    if (sessionMessageTimer.current) window.clearTimeout(sessionMessageTimer.current)
  }, [])

  useEffect(() => {
    const find = () => {
      const next = findGoalsTrigger()
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
    const onClick = () => setOpen(true)
    trigger.addEventListener('click', onClick)
    trigger.setAttribute('aria-controls', 'writing-goals-panel')
    return () => {
      trigger.removeEventListener('click', onClick)
      trigger.removeAttribute('aria-controls')
      trigger.removeAttribute('aria-expanded')
    }
  }, [trigger])

  useEffect(() => {
    trigger?.setAttribute('aria-expanded', String(open))
  }, [open, trigger])

  useEffect(() => {
    if (reached && !previousReached.current) {
      celebrateWritingGoal(words, goal)
    }
    previousReached.current = reached
  }, [goal, reached, words])

  useEffect(() => {
    if (!sessionActive || sessionDeadline.current == null) return

    const finishSession = () => {
      sessionDeadline.current = null
      setSessionActive(false)
      setSessionSeconds(WRITING_SESSION_SECONDS)
      const nextRounds = recordWritingSessionRound()
      setRounds(nextRounds)
      const message = writingSessionCompletionMessage(nextRounds.length)
      setSessionMessage(message)
      window.dispatchEvent(new CustomEvent(WRITING_SESSION_COMPLETED_EVENT, {
        detail: { total: nextRounds.length, mins: WRITING_SESSION_MINUTES },
      }))
      burstWritingConfetti('session')
      if (sessionMessageTimer.current) window.clearTimeout(sessionMessageTimer.current)
      sessionMessageTimer.current = window.setTimeout(() => setSessionMessage(''), 4_000)
    }

    const tick = () => {
      const deadline = sessionDeadline.current
      if (deadline == null) return
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSessionSeconds(next)
      if (next <= 0) finishSession()
    }

    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [sessionActive])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const daily = document.querySelector<HTMLElement>('.statusbar .daily')
      if (!daily) return

      const amount = daily.querySelector<HTMLElement>('strong')
      const bar = daily.querySelector<HTMLElement>('.progress > i')
      const percent = daily.querySelector<HTMLElement>(':scope > b')

      if (amount) amount.innerHTML = `${words.toLocaleString('pt-BR')} <small>/ ${goal.toLocaleString('pt-BR')} palavras</small>`
      if (bar) bar.style.width = `${progress}%`
      if (percent) {
        percent.textContent = reached ? 'META ✓' : `${progress}%`
        percent.setAttribute('aria-label', reached ? 'Meta diária alcançada' : `${progress}% da meta diária`)
      }
      daily.dataset.writingGoal = String(goal)
      daily.dataset.goalReached = String(reached)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [goal, progress, reached, words])

  const updateGoal = (value: string) => {
    setGoal(writeWritingGoal(value))
  }

  const startOrPauseSession = () => {
    if (sessionActive) {
      const deadline = sessionDeadline.current
      if (deadline != null) setSessionSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
      sessionDeadline.current = null
      setSessionActive(false)
      return
    }

    const seconds = sessionSeconds > 0 ? sessionSeconds : WRITING_SESSION_SECONDS
    sessionDeadline.current = Date.now() + seconds * 1000
    setSessionActive(true)
    setSessionMessage('')
  }

  const resetSession = () => {
    sessionDeadline.current = null
    setSessionActive(false)
    setSessionSeconds(WRITING_SESSION_SECONDS)
    setSessionMessage('')
  }

  const layer = open ? (
    <div className="writing-goal-layer">
      <button className="writing-goal-overlay" type="button" aria-label="Fechar metas" onClick={() => setOpen(false)} />
      <section
        ref={panelRef}
        id="writing-goals-panel"
        className="writing-goal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="writing-goals-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span className="eyebrow">SESSÃO DE ESCRITA</span>
            <h2 id="writing-goals-title">Meta diária</h2>
          </div>
          <button type="button" className="icon-square" aria-label="Fechar metas" onClick={() => setOpen(false)}>×</button>
        </header>

        <div className="writing-goal-readout">
          <strong>{words.toLocaleString('pt-BR')}</strong>
          <span>de {goal.toLocaleString('pt-BR')} palavras</span>
        </div>

        <div
          className="writing-goal-meter"
          role="progressbar"
          aria-label="Progresso da meta diária"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(words, goal)}
        >
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="writing-goal-summary">
          <strong>{progress}%</strong>
          <span>{remaining > 0 ? `faltam ${remaining.toLocaleString('pt-BR')}` : 'meta alcançada'}</span>
        </div>

        <label className="writing-goal-input">
          <span>PALAVRAS POR DIA</span>
          <input
            data-drawer-initial
            type="number"
            min="1"
            max="100000"
            step="50"
            value={goal}
            aria-label="Meta diária de palavras"
            onChange={(event) => updateGoal(event.target.value)}
          />
        </label>

        <section className="writing-session-timer" aria-labelledby="writing-session-title">
          <div className="writing-session-copy">
            <span id="writing-session-title">TEMPORIZADOR DE ESCRITA</span>
            <small>{WRITING_SESSION_MINUTES} min · {rounds.length} {rounds.length === 1 ? 'rodada concluída' : 'rodadas concluídas'}</small>
          </div>
          <strong data-writing-session-display>{formatWritingSessionTime(sessionSeconds)}</strong>
          <div className="writing-session-actions">
            <button type="button" aria-pressed={sessionActive} onClick={startOrPauseSession}>
              {sessionActive ? 'Pausar' : sessionSeconds === WRITING_SESSION_SECONDS ? 'Começar' : 'Continuar'}
            </button>
            <button type="button" onClick={resetSession} disabled={!sessionActive && sessionSeconds === WRITING_SESSION_SECONDS}>Reiniciar</button>
          </div>
        </section>

        <footer>
          <span>Meta e rodadas ficam somente neste navegador.</span>
          <button type="button" onClick={() => setGoal(writeWritingGoal(DEFAULT_WRITING_GOAL))}>Restaurar 1.200</button>
        </footer>
      </section>
    </div>
  ) : null

  return createPortal(
    <>
      {layer}
      {sessionMessage && (
        <div className="pomodoro-done-toast is-visible" role="status" aria-live="polite">
          {sessionMessage}
        </div>
      )}
    </>,
    document.body,
  )
}
