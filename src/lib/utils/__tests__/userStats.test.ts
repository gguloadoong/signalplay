import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  recordVote,
  recordResult,
  recordCrowdResult,
  recordContrarianWin,
  getStreak,
  getAccuracyPercent,
  getCrowdAccuracyPercent,
  getCharacterAlignment,
  getLevel,
  getTotalVotes,
  getBadges,
  getWeeklyStats,
  getPrevWeekStats,
} from '../userStats'

// localStorage mock
const store: Record<string, string> = {}
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
  })
})

describe('recordVote / getStreak', () => {
  it('첫 투표 streak = 1', () => {
    recordVote('2026-03-25')
    expect(getStreak()).toBe(1)
  })

  it('연속 투표 시 streak 증가', () => {
    recordVote('2026-03-24')
    recordVote('2026-03-25')
    expect(getStreak()).toBe(2)
  })

  it('같은 날 중복 호출 시 streak 불변', () => {
    recordVote('2026-03-25')
    recordVote('2026-03-25')
    expect(getStreak()).toBe(1)
  })

  it('하루 건너뛰면 streak 리셋 → 1', () => {
    recordVote('2026-03-23')
    recordVote('2026-03-25') // 03-24 빠짐
    expect(getStreak()).toBe(1)
  })

  it('3일 연속 후 끊기면 다시 1부터', () => {
    recordVote('2026-03-20')
    recordVote('2026-03-21')
    recordVote('2026-03-22')
    recordVote('2026-03-25') // 이틀 빠짐
    expect(getStreak()).toBe(1)
  })
})

describe('recordResult / getAccuracyPercent', () => {
  it('투표 기록 없을 때 accuracy null', () => {
    expect(getAccuracyPercent()).toBeNull()
  })

  it('정답 1개 → 100%', () => {
    recordResult('q-001', true)
    expect(getAccuracyPercent()).toBe(100)
  })

  it('오답 1개 → 0%', () => {
    recordResult('q-001', false)
    expect(getAccuracyPercent()).toBe(0)
  })

  it('정답 2/3 → 67%', () => {
    recordResult('q-001', true)
    recordResult('q-002', true)
    recordResult('q-003', false)
    expect(getAccuracyPercent()).toBe(67)
  })

  it('같은 questionId 중복 호출 시 집계 불변', () => {
    recordResult('q-001', true)
    recordResult('q-001', true) // 중복
    recordResult('q-001', false) // 중복
    expect(getAccuracyPercent()).toBe(100)
  })

  it('여러 질문 순차 집계', () => {
    recordResult('q-001', true)
    recordResult('q-002', false)
    recordResult('q-003', true)
    recordResult('q-004', true)
    expect(getAccuracyPercent()).toBe(75)
  })
})

describe('getLevel / getTotalVotes', () => {
  it('투표 없으면 null', () => {
    expect(getLevel()).toBeNull()
    expect(getTotalVotes()).toBe(0)
  })

  it('1회 → Lv.1 시장 구경꾼', () => {
    recordVote('2026-03-01')
    expect(getLevel()?.level).toBe(1)
    expect(getLevel()?.label).toBe('시장 구경꾼')
  })

  it('9회 → 여전히 Lv.1', () => {
    store['sp_user_stats'] = JSON.stringify({ streak: 1, lastVoteDate: '2026-01-01', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 9 })
    expect(getLevel()?.level).toBe(1)
    expect(getTotalVotes()).toBe(9)
  })

  it('10회 → Lv.2 초보 분석가', () => {
    store['sp_user_stats'] = JSON.stringify({ streak: 1, lastVoteDate: '2026-01-01', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 10 })
    expect(getLevel()?.level).toBe(2)
    expect(getLevel()?.label).toBe('초보 분석가')
  })

  it('30회 → Lv.3 시장 감시자', () => {
    store['sp_user_stats'] = JSON.stringify({ streak: 1, lastVoteDate: '2026-01-01', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 30 })
    expect(getLevel()?.level).toBe(3)
    expect(getLevel()?.label).toBe('시장 감시자')
  })

  it('100회 → Lv.4 프로 예측가, nextAt=365', () => {
    store['sp_user_stats'] = JSON.stringify({ streak: 1, lastVoteDate: '2026-01-01', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 100 })
    expect(getLevel()?.level).toBe(4)
    expect(getLevel()?.nextAt).toBe(365)
  })

  it('365회 → Lv.5 시그널 마스터, nextAt=null', () => {
    const key = 'sp_user_stats'
    store[key] = JSON.stringify({ streak: 1, lastVoteDate: '2026-01-01', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 365 })
    expect(getLevel()?.level).toBe(5)
    expect(getLevel()?.label).toBe('시그널 마스터')
    expect(getLevel()?.nextAt).toBeNull()
  })
})

describe('getBadges / correctStreak', () => {
  it('기록 없으면 배지 없음', () => {
    expect(getBadges()).toHaveLength(0)
  })

  it('연속 적중 3회 → 예측의 신 배지', () => {
    recordResult('q-1', true)
    recordResult('q-2', true)
    recordResult('q-3', true)
    const badges = getBadges()
    expect(badges.some((b) => b.id === 'correct_streak_3')).toBe(true)
    expect(badges.some((b) => b.label === '예측의 신')).toBe(true)
  })

  it('연속 적중 5회 → 퍼펙트 위크 배지도 획득', () => {
    recordResult('q-1', true)
    recordResult('q-2', true)
    recordResult('q-3', true)
    recordResult('q-4', true)
    recordResult('q-5', true)
    const badges = getBadges()
    expect(badges.some((b) => b.id === 'correct_streak_5')).toBe(true)
    expect(badges.some((b) => b.id === 'correct_streak_3')).toBe(true)
  })

  it('오답으로 correctStreak 리셋 → 배지 없음', () => {
    recordResult('q-1', true)
    recordResult('q-2', true)
    recordResult('q-3', false) // 리셋
    expect(getBadges().some((b) => b.id === 'correct_streak_3')).toBe(false)
  })

  it('maxCorrectStreak는 리셋 후에도 배지 유지', () => {
    recordResult('q-1', true)
    recordResult('q-2', true)
    recordResult('q-3', true) // maxCorrectStreak = 3
    recordResult('q-4', false) // correctStreak 리셋, maxCorrectStreak 유지
    expect(getBadges().some((b) => b.id === 'correct_streak_3')).toBe(true)
  })

  it('적중률 70%+ + 5회 → 전문가 킬러 배지', () => {
    recordResult('q-1', true)
    recordResult('q-2', true)
    recordResult('q-3', true)
    recordResult('q-4', true)
    recordResult('q-5', false) // 4/5 = 80%
    expect(getBadges().some((b) => b.id === 'accuracy_70')).toBe(true)
  })

  it('7일 연속 투표 → 불타는 스트릭 배지', () => {
    store['sp_user_stats'] = JSON.stringify({ streak: 7, lastVoteDate: '2026-03-26', correct: 0, total: 0, lastScoredQuestionId: null, totalVotes: 7, correctStreak: 0, maxCorrectStreak: 0 })
    expect(getBadges().some((b) => b.id === 'vote_streak_7')).toBe(true)
  })
})

describe('getCharacterAlignment', () => {
  const VOTE_KEY = 'sp_vote_history'

  function makeRecord(questionId: string, choice: 'bullish' | 'bearish', quantPred: string) {
    return {
      questionId,
      date: '2026-03-20',
      title: '테스트 질문',
      choice,
      characterPredictions: [
        { character: 'quant', prediction: quantPred },
        { character: 'chimp', prediction: 'neutral' },
      ],
    }
  }

  it('투표 3회 미만이면 null 반환', () => {
    store[VOTE_KEY] = JSON.stringify([
      makeRecord('q-1', 'bullish', 'bullish'),
      makeRecord('q-2', 'bullish', 'bullish'),
    ])
    expect(getCharacterAlignment()).toBeNull()
  })

  it('quant 3회 일치 → quant 반환', () => {
    store[VOTE_KEY] = JSON.stringify([
      makeRecord('q-1', 'bullish', 'bullish'),
      makeRecord('q-2', 'bullish', 'bullish'),
      makeRecord('q-3', 'bullish', 'bullish'),
    ])
    const result = getCharacterAlignment()
    expect(result?.character).toBe('quant')
    expect(result?.rate).toBe(100)
  })

  it('characterPredictions 없는 기록은 집계에서 제외', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: '2026-03-20', title: '테스트', choice: 'bullish' },
      { questionId: 'q-2', date: '2026-03-20', title: '테스트', choice: 'bullish' },
      { questionId: 'q-3', date: '2026-03-20', title: '테스트', choice: 'bullish' },
    ])
    expect(getCharacterAlignment()).toBeNull()
  })
})

describe('getWeeklyStats', () => {
  const VOTE_KEY = 'sp_vote_history'
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
  const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0]

  it('기록 2개 미만이면 null 반환', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: today, title: '테스트', choice: 'bullish' },
    ])
    expect(getWeeklyStats()).toBeNull()
  })

  it('이번 주 2개 참여 → participated=2', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: today, title: '테스트', choice: 'bullish' },
      { questionId: 'q-2', date: yesterday, title: '테스트', choice: 'bearish' },
    ])
    const stats = getWeeklyStats()
    expect(stats?.participated).toBe(2)
  })

  it('isCorrect 집계 — 2적중/3결과', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: today, title: 'T', choice: 'bullish', isCorrect: true },
      { questionId: 'q-2', date: yesterday, title: 'T', choice: 'bearish', isCorrect: false },
      { questionId: 'q-3', date: twoDaysAgo, title: 'T', choice: 'neutral', isCorrect: true },
    ])
    const stats = getWeeklyStats()
    expect(stats?.correct).toBe(2)
    expect(stats?.resolved).toBe(3)
  })

  it('8일 전 기록은 이번 주 집계에서 제외', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: today, title: 'T', choice: 'bullish', isCorrect: true },
      { questionId: 'q-2', date: yesterday, title: 'T', choice: 'bearish', isCorrect: true },
      { questionId: 'q-old', date: eightDaysAgo, title: 'T', choice: 'bullish', isCorrect: true },
    ])
    const stats = getWeeklyStats()
    expect(stats?.participated).toBe(2)
    expect(stats?.correct).toBe(2)
  })
})

describe('recordCrowdResult / getCrowdAccuracyPercent', () => {
  it('2회 미만이면 null 반환', () => {
    recordCrowdResult('q-1', true)
    expect(getCrowdAccuracyPercent()).toBeNull()
  })

  it('2회 이상부터 적중률 계산', () => {
    recordCrowdResult('q-1', true)
    recordCrowdResult('q-2', false)
    expect(getCrowdAccuracyPercent()).toBe(50)
  })

  it('동일 questionId 중복 호출 무시', () => {
    recordCrowdResult('q-1', true)
    recordCrowdResult('q-1', false) // 중복 — 무시
    recordCrowdResult('q-2', true)
    expect(getCrowdAccuracyPercent()).toBe(100)
  })
})

describe('recordContrarianWin / 역발상 배지', () => {
  it('recordContrarianWin 1회 → 🦅 역발상의 고수 배지 획득', () => {
    recordContrarianWin('q-1')
    const badges = getBadges()
    expect(badges.some((b) => b.id === 'contrarian_1')).toBe(true)
  })

  it('동일 questionId 중복 호출 무시', () => {
    recordContrarianWin('q-1')
    recordContrarianWin('q-1') // 중복 — 무시
    const stats = getBadges()
    // contrarianWins=1만 카운트
    expect(stats.filter((b) => b.id === 'contrarian_1').length).toBe(1)
  })

  it('역발상 없으면 배지 미노출', () => {
    const badges = getBadges()
    expect(badges.some((b) => b.id === 'contrarian_1')).toBe(false)
  })
})

describe('getPrevWeekStats', () => {
  const VOTE_KEY = 'sp_vote_history'
  const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0]
  const nineDaysAgo = new Date(Date.now() - 9 * 86400000).toISOString().split('T')[0]
  const fifteenDaysAgo = new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  it('7~14일 전 기록 2개 미만이면 null', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: eightDaysAgo, title: 'T', choice: 'bullish' },
    ])
    expect(getPrevWeekStats()).toBeNull()
  })

  it('7~14일 전 기록 2개 이상 → 집계 반환', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-1', date: eightDaysAgo, title: 'T', choice: 'bullish', isCorrect: true },
      { questionId: 'q-2', date: nineDaysAgo, title: 'T', choice: 'bearish', isCorrect: false },
    ])
    const stats = getPrevWeekStats()
    expect(stats?.participated).toBe(2)
    expect(stats?.correct).toBe(1)
    expect(stats?.resolved).toBe(2)
  })

  it('이번 주 기록은 이전 주 집계에서 제외', () => {
    store[VOTE_KEY] = JSON.stringify([
      { questionId: 'q-today', date: today, title: 'T', choice: 'bullish', isCorrect: true },
      { questionId: 'q-1', date: eightDaysAgo, title: 'T', choice: 'bullish', isCorrect: true },
      { questionId: 'q-2', date: nineDaysAgo, title: 'T', choice: 'bearish', isCorrect: true },
      { questionId: 'q-old', date: fifteenDaysAgo, title: 'T', choice: 'bullish', isCorrect: true },
    ])
    const stats = getPrevWeekStats()
    expect(stats?.participated).toBe(2)
  })
})
