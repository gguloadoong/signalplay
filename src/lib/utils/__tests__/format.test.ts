import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatScore,
  formatTimeRemaining,
  formatDate,
  formatPercent,
  formatDeadline,
} from '../format'

describe('formatScore', () => {
  it('양수 → +N', () => {
    expect(formatScore(30)).toBe('+30')
  })

  it('0 → 0', () => {
    expect(formatScore(0)).toBe('0')
  })

  it('음수 → -N', () => {
    expect(formatScore(-10)).toBe('-10')
  })
})

describe('formatTimeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('시간+분 남음', () => {
    const now = new Date('2026-03-23T09:00:00Z')
    vi.setSystemTime(now)
    const deadline = '2026-03-23T12:30:00Z'
    expect(formatTimeRemaining(deadline)).toBe('3시간 30분 남음')
  })

  it('분만 남음', () => {
    const now = new Date('2026-03-23T12:15:00Z')
    vi.setSystemTime(now)
    const deadline = '2026-03-23T12:30:00Z'
    expect(formatTimeRemaining(deadline)).toBe('15분 남음')
  })

  it('마감됨', () => {
    const now = new Date('2026-03-23T13:00:00Z')
    vi.setSystemTime(now)
    const deadline = '2026-03-23T12:30:00Z'
    expect(formatTimeRemaining(deadline)).toBe('마감')
  })

  it('1분 미만 → 곧 마감', () => {
    const now = new Date('2026-03-23T12:29:30Z')
    vi.setSystemTime(now)
    const deadline = '2026-03-23T12:30:00Z'
    expect(formatTimeRemaining(deadline)).toBe('곧 마감')
  })
})

describe('formatDate', () => {
  it('날짜 포맷', () => {
    const result = formatDate('2026-03-23')
    expect(result).toContain('3월')
    expect(result).toContain('23일')
  })
})

describe('formatPercent', () => {
  it('정수 → N%', () => {
    expect(formatPercent(72)).toBe('72%')
  })

  it('소수 → 반올림%', () => {
    expect(formatPercent(71.6)).toBe('72%')
  })

  it('0 → 0%', () => {
    expect(formatPercent(0)).toBe('0%')
  })
})

describe('formatDeadline', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('2시간 후 → 2시간 후 마감', () => {
    vi.setSystemTime(new Date('2026-03-26T10:00:00Z'))
    expect(formatDeadline('2026-03-26T12:00:00Z')).toBe('2시간 후 마감')
  })

  it('30분 후 → 30분 후 마감', () => {
    vi.setSystemTime(new Date('2026-03-26T10:00:00Z'))
    expect(formatDeadline('2026-03-26T10:30:00Z')).toBe('30분 후 마감')
  })

  it('이미 지난 시간 → 투표 마감', () => {
    vi.setSystemTime(new Date('2026-03-26T10:00:00Z'))
    expect(formatDeadline('2026-03-26T09:00:00Z')).toBe('투표 마감')
  })
})
