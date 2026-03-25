const STORAGE_KEY = 'sp_vote_history'
const MAX_AGE_DAYS = 7

export type VoteRecord = {
  questionId: string
  date: string
  title: string
  choice: 'bullish' | 'bearish' | 'neutral'
}

function getHistory(): VoteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const records: VoteRecord[] = JSON.parse(raw)
    const cutoff = Date.now() - MAX_AGE_DAYS * 86400000
    return records.filter((r) => new Date(r.date).getTime() > cutoff)
  } catch {
    return []
  }
}

export function saveVote(record: VoteRecord): void {
  try {
    const history = getHistory().filter((r) => r.questionId !== record.questionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...history]))
  } catch {}
}

export function getVote(questionId: string): VoteRecord | null {
  return getHistory().find((r) => r.questionId === questionId) ?? null
}
