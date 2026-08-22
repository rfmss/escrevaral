export const WRITING_SESSION_MINUTES = 25
export const WRITING_SESSION_SECONDS = WRITING_SESSION_MINUTES * 60
export const WRITING_SESSION_ROUNDS_KEY = 'vereda:timer-rounds'
export const WRITING_SESSION_COMPLETED_EVENT = 'escrevaral:writing-session-completed'

export type WritingSessionRound = {
  completedAt: string
  mins: number
}

function validRound(value: unknown): value is WritingSessionRound {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<WritingSessionRound>
  return typeof candidate.completedAt === 'string'
    && Number.isFinite(candidate.mins)
    && Number(candidate.mins) > 0
}

export function readWritingSessionRounds(): WritingSessionRound[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(WRITING_SESSION_ROUNDS_KEY) ?? '[]') as unknown
    return Array.isArray(parsed) ? parsed.filter(validRound).slice(-200) : []
  } catch {
    return []
  }
}

export function recordWritingSessionRound(): WritingSessionRound[] {
  const rounds = readWritingSessionRounds()
  rounds.push({ completedAt: new Date().toISOString(), mins: WRITING_SESSION_MINUTES })
  const bounded = rounds.slice(-200)
  try { localStorage.setItem(WRITING_SESSION_ROUNDS_KEY, JSON.stringify(bounded)) } catch { /* A rodada ainda vale nesta sessão. */ }
  return bounded
}

export function writingSessionCompletionMessage(total: number): string {
  return total === 1
    ? 'Primeira rodada concluída. Boa escrita.'
    : `${total}ª rodada concluída. Continue assim.`
}

export function formatWritingSessionTime(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds))
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const remainder = String(safe % 60).padStart(2, '0')
  return `${minutes}:${remainder}`
}
