import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  recordVote,
  recordResult,
  getStreak,
  getAccuracyPercent,
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
