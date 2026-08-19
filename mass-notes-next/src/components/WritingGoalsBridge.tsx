import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { readLatestLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  DEFAULT_WRITING_GOAL,
  readWritingGoal,
  subscribeWritingGoal,
  writeWritingGoal,
} from '../writing/writingGoal'
import { celebrateWritingGoal } from '../writing/writingGoalCelebration'
import { useModalDrawer } from './useModalDrawer'

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

function findGoalsTrigger(): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.main-actions > button'))
    .find((button) => button.querySelector('small')?.textContent?.trim() === 'Metas') ?? null
}

export function WritingGoalsBridge() {
  const [open, setOpen] = useState(false)
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [goal, setGoal] = useState(readWritingGoal)
  const [text, setText] = useState(() => readLatestLiveEditorSnapshot()?.plainText ?? '')
  const panelRef = useModalDrawer<HTMLElement>(open, () => setOpen(false))

  const words = useMemo(() => countWords(text), [text])
  const progress = Math.min(100, Math.round(words / goal * 100))
  const remaining = Math.max(0, goal - words)
  const reached = goal > 0 && words >= goal
  const previousReached = useRef(reached)

  useEffect(() => subscribeLiveEditorSnapshot((snapshot) => setText(snapshot.plainText)), [])
  useEffect(() => subscribeWritingGoal(setGoal), [])

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
    const frame = window.requestAnimationFrame(() => {
      const daily = document.querySelector<HTMLElement>('.statusbar .daily')
      if (!daily) return

      const amount = daily.querySelector<HTMLElement>('strong')
      const bar = daily.querySelector<HTMLElement>('.progress > i')
      const percent = daily.querySelector<HTMLElement>(':scope > b')

      if (amount) amount.innerHTML = `${words.toLocaleString('pt-BR')} <small>/ ${goal.toLocaleString('pt-BR')} palavras</small>`
      if (bar) bar.style.width = `${progress}%`
      if (percent) percent.textContent = `${progress}%`
      daily.dataset.writingGoal = String(goal)
      daily.dataset.goalReached = String(reached)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [goal, progress, reached, words])

  const updateGoal = (value: string) => {
    setGoal(writeWritingGoal(value))
  }

  if (!open) return null

  return createPortal(
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

        <footer>
          <span>A meta fica somente neste navegador.</span>
          <button type="button" onClick={() => setGoal(writeWritingGoal(DEFAULT_WRITING_GOAL))}>Restaurar 1.200</button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
