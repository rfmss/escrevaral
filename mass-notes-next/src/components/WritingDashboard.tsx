import { useEffect, useMemo, useState } from 'react'
import { countWords } from '../domain/document'
import { readLatestLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  normalizeWritingGoal,
  readWritingGoal,
  subscribeWritingGoal,
  writeWritingGoal,
} from '../writing/writingGoal'

const FOCUS_DURATION_SECONDS = 25 * 60

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function WritingDashboardFields() {
  const [text, setText] = useState(() => readLatestLiveEditorSnapshot()?.plainText ?? '')
  const [goal, setGoal] = useState(readWritingGoal)
  const [remaining, setRemaining] = useState(FOCUS_DURATION_SECONDS)
  const [running, setRunning] = useState(false)

  useEffect(() => subscribeLiveEditorSnapshot((snapshot) => setText(snapshot.plainText)), [])
  useEffect(() => subscribeWritingGoal(setGoal), [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [running])

  const words = useMemo(() => countWords(text), [text])
  const progress = Math.min(words, goal)
  const progressPercent = goal ? Math.min(100, Math.round((words / goal) * 100)) : 0
  const clock = formatClock(remaining)

  const updateGoal = (value: string) => {
    const next = normalizeWritingGoal(value)
    setGoal(next)
    writeWritingGoal(next)
  }

  const resetFocus = () => {
    setRunning(false)
    setRemaining(FOCUS_DURATION_SECONDS)
  }

  return (
    <div className="writing-dashboard-fields">
      <div className="reg-field writing-metric">
        <span className="field-label">Palavras</span>
        <span className="field-value writing-word-count" data-writing-word-count>{words}</span>
      </div>

      <div className="reg-field writing-goal">
        <label className="field-label" htmlFor="writing-goal-input">Meta</label>
        <div className="writing-goal-row">
          <span className="field-value">{words} /</span>
          <input
            id="writing-goal-input"
            aria-label="Meta de palavras"
            type="number"
            min="1"
            max="100000"
            step="50"
            value={goal}
            onChange={(event) => updateGoal(event.target.value)}
          />
        </div>
        <div
          className="writing-goal-progress"
          data-writing-goal-progress
          role="progressbar"
          aria-label="Progresso da meta de escrita"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="reg-field writing-focus">
        <span className="field-label">Foco</span>
        <div className="writing-focus-row">
          <button
            type="button"
            className="writing-focus-toggle"
            aria-label={running ? 'Pausar foco' : 'Iniciar foco'}
            aria-pressed={running}
            onClick={() => setRunning((current) => !current)}
          >
            <span aria-hidden="true">{running ? 'Ⅱ' : '▶'}</span>
            <time data-focus-clock aria-live="polite">{clock}</time>
          </button>
          <button type="button" className="writing-focus-reset" aria-label="Reiniciar foco" onClick={resetFocus}>↺</button>
        </div>
      </div>
    </div>
  )
}
