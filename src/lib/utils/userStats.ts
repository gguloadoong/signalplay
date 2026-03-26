import { getHistory, updateVoteResult } from './voteHistory'

const STATS_KEY = 'sp_user_stats'

interface UserStats {
  streak: number
  lastVoteDate: string | null   // 'YYYY-MM-DD'
  correct: number
  total: number
  lastScoredQuestionId: string | null
  totalVotes: number
  correctStreak: number
  maxCorrectStreak: number
  crowdCorrect: number
  crowdTotal: number
  lastCrowdQuestionId: string | null
  contrarianWins: number
  lastContrarianQuestionId: string | null
}

const DEFAULT_STATS: UserStats = {
  streak: 0,
  lastVoteDate: null,
  correct: 0,
  total: 0,
  lastScoredQuestionId: null,
  totalVotes: 0,
  correctStreak: 0,
  maxCorrectStreak: 0,
  crowdCorrect: 0,
  crowdTotal: 0,
  lastCrowdQuestionId: null,
  contrarianWins: 0,
  lastContrarianQuestionId: null,
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

/** 투표 시 호출: 스트릭 + 누적 투표 수 업데이트 */
export function recordVote(date: string): void {
  const stats = getStats()
  if (stats.lastVoteDate === date) return // 오늘 이미 업데이트됨

  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = stats.lastVoteDate === yesterdayStr ? stats.streak + 1 : 1

  saveStats({ ...stats, streak: newStreak, lastVoteDate: date, totalVotes: (stats.totalVotes ?? 0) + 1 })
}

/** ResultPage에서 결과 확인 시 호출: 적중률 + 연속 적중 업데이트 (중복 방지) */
export function recordResult(questionId: string, isCorrect: boolean): void {
  const stats = getStats()
  if (stats.lastScoredQuestionId === questionId) return // 이미 집계됨

  const newCorrectStreak = isCorrect ? (stats.correctStreak ?? 0) + 1 : 0
  saveStats({
    ...stats,
    correct: stats.correct + (isCorrect ? 1 : 0),
    total: stats.total + 1,
    lastScoredQuestionId: questionId,
    correctStreak: newCorrectStreak,
    maxCorrectStreak: Math.max(stats.maxCorrectStreak ?? 0, newCorrectStreak),
  })
  updateVoteResult(questionId, isCorrect)
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

/** ResultPage에서 결과 확인 시 호출: 군중 적중률 추적 (중복 방지) */
export function recordCrowdResult(questionId: string, isCorrect: boolean): void {
  const stats = getStats()
  if (stats.lastCrowdQuestionId === questionId) return
  saveStats({
    ...stats,
    crowdCorrect: (stats.crowdCorrect ?? 0) + (isCorrect ? 1 : 0),
    crowdTotal: (stats.crowdTotal ?? 0) + 1,
    lastCrowdQuestionId: questionId,
  })
}

/** 군중 적중률 (0~100 정수) — 2회 미만이면 null */
export function getCrowdAccuracyPercent(): number | null {
  const { crowdCorrect, crowdTotal } = getStats()
  if ((crowdTotal ?? 0) < 2) return null
  return Math.round(((crowdCorrect ?? 0) / crowdTotal) * 100)
}

/** 군중 다수결과 반대로 투표해 적중 시 호출 (중복 방지) */
export function recordContrarianWin(questionId: string): void {
  const stats = getStats()
  if (stats.lastContrarianQuestionId === questionId) return
  saveStats({
    ...stats,
    contrarianWins: (stats.contrarianWins ?? 0) + 1,
    lastContrarianQuestionId: questionId,
  })
}

const CHARACTER_NAMES: Record<string, { name: string; emoji: string }> = {
  quant:     { name: '밸류김', emoji: '💼' },
  professor: { name: '팩터박', emoji: '📚' },
  reporter:  { name: '뉴스최', emoji: '📺' },
  pattern:   { name: '봉준선', emoji: '📐' },
  chimp:     { name: '코인토', emoji: '🎲' },
}

export interface LevelInfo {
  level: number
  label: string
  emoji: string
  nextAt: number | null  // 다음 레벨까지 필요한 총 투표 수 (Lv.5면 null)
}

const LEVELS: LevelInfo[] = [
  { level: 1, label: '시장 구경꾼',   emoji: '👀', nextAt: 10  },
  { level: 2, label: '초보 분석가',   emoji: '📊', nextAt: 30  },
  { level: 3, label: '시장 감시자',   emoji: '🔭', nextAt: 100 },
  { level: 4, label: '프로 예측가',   emoji: '🎯', nextAt: 365 },
  { level: 5, label: '시그널 마스터', emoji: '🏆', nextAt: null },
]

/** 누적 투표 수 기반 레벨 — 1회 미만이면 null */
export function getLevel(): LevelInfo | null {
  const votes = getStats().totalVotes ?? 0
  if (votes < 1) return null
  if (votes >= 365) return LEVELS[4]
  if (votes >= 100) return LEVELS[3]
  if (votes >= 30)  return LEVELS[2]
  if (votes >= 10)  return LEVELS[1]
  return LEVELS[0]
}

/** 누적 총 투표 수 */
export function getTotalVotes(): number {
  return getStats().totalVotes ?? 0
}

export interface BadgeInfo {
  id: string
  emoji: string
  label: string
}

const BADGE_DEFINITIONS: Array<BadgeInfo & { earned: (s: UserStats) => boolean }> = [
  {
    id: 'correct_streak_3',
    emoji: '🎯',
    label: '예측의 신',
    earned: (s) => (s.maxCorrectStreak ?? 0) >= 3,
  },
  {
    id: 'correct_streak_5',
    emoji: '💎',
    label: '퍼펙트 위크',
    earned: (s) => (s.maxCorrectStreak ?? 0) >= 5,
  },
  {
    id: 'accuracy_70',
    emoji: '📊',
    label: '전문가 킬러',
    earned: (s) => s.total >= 5 && s.correct / s.total >= 0.7,
  },
  {
    id: 'vote_streak_7',
    emoji: '🔥',
    label: '불타는 스트릭',
    earned: (s) => (s.streak ?? 0) >= 7,
  },
  {
    id: 'contrarian_1',
    emoji: '🦅',
    label: '역발상의 고수',
    earned: (s) => (s.contrarianWins ?? 0) >= 1,
  },
]

/** 획득한 배지 목록 */
export function getBadges(): BadgeInfo[] {
  const stats = getStats()
  return BADGE_DEFINITIONS.filter((b) => b.earned(stats)).map(({ id, emoji, label }) => ({ id, emoji, label }))
}

/** 누적 투표 기반 가장 일치하는 캐릭터 — 3회 미만 투표 시 null */
export function getCharacterAlignment(): { character: string; name: string; emoji: string; rate: number } | null {
  const history = getHistory().filter((r) => r.characterPredictions && r.characterPredictions.length > 0)
  if (history.length < 3) return null

  const counts: Record<string, { match: number; total: number }> = {}
  for (const record of history) {
    for (const cp of record.characterPredictions!) {
      if (!counts[cp.character]) counts[cp.character] = { match: 0, total: 0 }
      counts[cp.character].total++
      if (cp.prediction === record.choice) counts[cp.character].match++
    }
  }

  let best: { character: string; rate: number } | null = null
  for (const [char, { match, total }] of Object.entries(counts)) {
    if (total < 3) continue
    const rate = Math.round((match / total) * 100)
    if (!best || rate > best.rate) best = { character: char, rate }
  }

  if (!best) return null
  const meta = CHARACTER_NAMES[best.character]
  return meta ? { character: best.character, name: meta.name, emoji: meta.emoji, rate: best.rate } : null
}

export interface WeeklyStats {
  participated: number  // 이번 주 투표 횟수
  correct: number       // 이번 주 적중 수 (isCorrect === true)
  resolved: number      // 이번 주 결과 확인된 수
}

function statsForRange(fromDaysAgo: number, toDaysAgo: number): WeeklyStats | null {
  const from = new Date(); from.setDate(from.getDate() - fromDaysAgo)
  const to = new Date(); to.setDate(to.getDate() - toDaysAgo)
  const fromStr = from.toISOString().split('T')[0]
  const toStr = to.toISOString().split('T')[0]

  const slice = getHistory().filter((r) => r.date >= fromStr && r.date <= toStr)
  if (slice.length < 2) return null

  return {
    participated: slice.length,
    correct: slice.filter((r) => r.isCorrect === true).length,
    resolved: slice.filter((r) => r.isCorrect !== undefined).length,
  }
}

/** 최근 7일 투표 요약 — 2회 미만이면 null */
export function getWeeklyStats(): WeeklyStats | null {
  return statsForRange(7, 0)
}

/** 7~14일 전 투표 요약 — 직전 주 성적 비교용, 2회 미만이면 null */
export function getPrevWeekStats(): WeeklyStats | null {
  return statsForRange(14, 7)
}
