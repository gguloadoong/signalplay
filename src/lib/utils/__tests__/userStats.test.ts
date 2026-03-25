import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  recordVote,
  recordResult,
  getStreak,
  getAccuracyPercent,
  getCharacterAlignment,
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
