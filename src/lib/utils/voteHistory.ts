const STORAGE_KEY = 'sp_vote_history'
const MAX_AGE_DAYS = 90

export type VoteRecord = {
  questionId: string
  date: string
  title: string
  choice: 'bullish' | 'bearish' | 'neutral'
  characterPredictions?: Array<{ character: string; prediction: string }>
  isCorrect?: boolean  // 결과 확인 후 업데이트
}

export function getHistory(): VoteRecord[] {
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
  } catch { /* localStorage 쓰기 실패 무시 (private/full storage) */ }
}

export function getVote(questionId: string): VoteRecord | null {
  return getHistory().find((r) => r.questionId === questionId) ?? null
}

/** 결과 확인 시 호출: 해당 기록에 isCorrect 업데이트 */
export function updateVoteResult(questionId: string, isCorrect: boolean): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const records: VoteRecord[] = JSON.parse(raw)
    const updated = records.map((r) =>
      r.questionId === questionId && r.isCorrect === undefined
        ? { ...r, isCorrect }
        : r
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch { /* silent fail */ }
}
