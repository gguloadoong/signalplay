import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  recordVote,
  recordResult,
  getStreak,
  getAccuracyPercent,
  getCharacterAlignment,
  getLevel,
  getTotalVotes,
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
