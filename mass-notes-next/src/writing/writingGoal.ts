export const WRITING_GOAL_KEY = 'escrevaral-mass-notes-next-writing-goal'
export const DEFAULT_WRITING_GOAL = 1_200
export const WRITING_GOAL_EVENT = 'escrevaral:writing-goal-change'

export function normalizeWritingGoal(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_WRITING_GOAL
  return Math.max(1, Math.min(100_000, Math.floor(parsed)))
}

export function readWritingGoal(): number {
  try {
    const stored = localStorage.getItem(WRITING_GOAL_KEY)
    return stored === null ? DEFAULT_WRITING_GOAL : normalizeWritingGoal(stored)
  } catch {
    return DEFAULT_WRITING_GOAL
  }
}

export function writeWritingGoal(value: unknown): number {
  const goal = normalizeWritingGoal(value)
  try { localStorage.setItem(WRITING_GOAL_KEY, String(goal)) } catch { /* Preferência local opcional. */ }
  window.dispatchEvent(new CustomEvent(WRITING_GOAL_EVENT, { detail: { goal } }))
  return goal
}

export function subscribeWritingGoal(listener: (goal: number) => void): () => void {
  const onGoal = (event: Event) => {
    const detail = (event as CustomEvent<{ goal?: number }>).detail
    listener(normalizeWritingGoal(detail?.goal))
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key !== WRITING_GOAL_KEY) return
    listener(event.newValue === null ? DEFAULT_WRITING_GOAL : normalizeWritingGoal(event.newValue))
  }

  window.addEventListener(WRITING_GOAL_EVENT, onGoal)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(WRITING_GOAL_EVENT, onGoal)
    window.removeEventListener('storage', onStorage)
  }
}
