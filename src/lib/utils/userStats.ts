const STATS_KEY = 'sp_user_stats'

interface UserStats {
  streak: number
  lastVoteDate: string | null   // 'YYYY-MM-DD'
  correct: number
  total: number
  lastScoredQuestionId: string | null
}

const DEFAULT_STATS: UserStats = {
  streak: 0,
  lastVoteDate: null,
  correct: 0,
  total: 0,
  lastScoredQuestionId: null,
}

function getStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch { /* storage full — silent fail */ }
}

/** 투표 시 호출: 스트릭 업데이트 */
export function recordVote(date: string): void {
  const stats = getStats()
  if (stats.lastVoteDate === date) return // 오늘 이미 업데이트됨

  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = stats.lastVoteDate === yesterdayStr ? stats.streak + 1 : 1

  saveStats({ ...stats, streak: newStreak, lastVoteDate: date })
}

/** ResultPage에서 결과 확인 시 호출: 적중률 업데이트 (중복 방지) */
export function recordResult(questionId: string, isCorrect: boolean): void {
  const stats = getStats()
  if (stats.lastScoredQuestionId === questionId) return // 이미 집계됨

  saveStats({
    ...stats,
    correct: stats.correct + (isCorrect ? 1 : 0),
    total: stats.total + 1,
    lastScoredQuestionId: questionId,
  })
}

/** 현재 스트릭 조회 */
export function getStreak(): number {
  return getStats().streak
}

/** 적중률 (0~100 정수) — 투표 기록 없으면 null */
export function getAccuracyPercent(): number | null {
  const { correct, total } = getStats()
  if (total === 0) return null
  return Math.round((correct / total) * 100)
}
