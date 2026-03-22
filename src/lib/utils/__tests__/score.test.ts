import { describe, it, expect } from 'vitest'
import {
  calculateScore,
  calculateBattleResults,
  calculateStreakBonus,
  clampScore,
  calculateAccuracy,
} from '../score'
import type { UserPrediction, Prediction } from '@/types/signal'

describe('calculateScore', () => {
  it('정답 x1 → +10', () => {
    expect(calculateScore('bullish', 1, 'bullish')).toBe(10)
  })

  it('정답 x2 → +20', () => {
    expect(calculateScore('bearish', 2, 'bearish')).toBe(20)
  })

  it('정답 x3 → +30', () => {
    expect(calculateScore('neutral', 3, 'neutral')).toBe(30)
  })

  it('오답 x1 → 0', () => {
    expect(calculateScore('bullish', 1, 'bearish')).toBe(0)
  })

  it('오답 x2 → -5', () => {
    expect(calculateScore('bullish', 2, 'bearish')).toBe(-5)
  })

  it('오답 x3 → -10', () => {
    expect(calculateScore('bullish', 3, 'bearish')).toBe(-10)
  })

  it('neutral 정답도 정확히 계산', () => {
    expect(calculateScore('neutral', 2, 'neutral')).toBe(20)
  })

  it('neutral 오답도 정확히 계산', () => {
    expect(calculateScore('neutral', 3, 'bullish')).toBe(-10)
  })
})

describe('calculateBattleResults', () => {
  const predictions: UserPrediction[] = [
    { signalIndex: 0, prediction: 'bullish', confidence: 3 },
    { signalIndex: 1, prediction: 'bullish', confidence: 2 },
    { signalIndex: 2, prediction: 'bearish', confidence: 1 },
  ]

  it('전부 정답 → PERFECT + 보너스 20점', () => {
    const actuals: Prediction[] = ['bullish', 'bullish', 'bearish']
    const { results, totalScore, isPerfect } = calculateBattleResults(
      predictions, actuals, ['', '', '']
    )
    expect(isPerfect).toBe(true)
    expect(results[0].score).toBe(30)  // x3
    expect(results[1].score).toBe(20)  // x2
    expect(results[2].score).toBe(10)  // x1
    expect(totalScore).toBe(30 + 20 + 10 + 20) // +20 PERFECT
  })

  it('일부 오답 → PERFECT 아님, 보너스 없음', () => {
    const actuals: Prediction[] = ['bullish', 'bearish', 'bearish']
    const { results, totalScore, isPerfect } = calculateBattleResults(
      predictions, actuals, ['', '', '']
    )
    expect(isPerfect).toBe(false)
    expect(results[0].isCorrect).toBe(true)
    expect(results[1].isCorrect).toBe(false)
    expect(results[2].isCorrect).toBe(true)
    expect(totalScore).toBe(30 + (-5) + 10) // 35, PERFECT 없음
  })

  it('전부 오답', () => {
    const actuals: Prediction[] = ['bearish', 'bearish', 'bullish']
    const { totalScore, isPerfect } = calculateBattleResults(
      predictions, actuals, ['c1', 'c2', 'c3']
    )
    expect(isPerfect).toBe(false)
    expect(totalScore).toBe(-10 + (-5) + 0) // -15
  })

  it('resultComment 전파 확인', () => {
    const actuals: Prediction[] = ['bullish', 'bullish', 'bearish']
    const { results } = calculateBattleResults(
      predictions, actuals, ['코스피 상승', '반도체 호조', '중국 PMI']
    )
    expect(results[0].resultComment).toBe('코스피 상승')
    expect(results[2].resultComment).toBe('중국 PMI')
  })
})

describe('calculateStreakBonus', () => {
  it('0일 → 0점', () => {
    expect(calculateStreakBonus(0)).toBe(0)
  })

  it('1일 → 5점', () => {
    expect(calculateStreakBonus(1)).toBe(5)
  })

  it('5일 → 25점', () => {
    expect(calculateStreakBonus(5)).toBe(25)
  })

  it('6일 → 30점 (최대)', () => {
    expect(calculateStreakBonus(6)).toBe(30)
  })

  it('100일 → 30점 (최대 캡)', () => {
    expect(calculateStreakBonus(100)).toBe(30)
  })
})

describe('clampScore', () => {
  it('양수 → 그대로', () => {
    expect(clampScore(50)).toBe(50)
  })

  it('0 → 0', () => {
    expect(clampScore(0)).toBe(0)
  })

  it('음수 → 0으로 클램프', () => {
    expect(clampScore(-15)).toBe(0)
  })
})

describe('calculateAccuracy', () => {
  it('전부 정답 → 100%', () => {
    expect(calculateAccuracy(10, 10)).toBe(100)
  })

  it('전부 오답 → 0%', () => {
    expect(calculateAccuracy(0, 10)).toBe(0)
  })

  it('부분 정답 → 반올림', () => {
    expect(calculateAccuracy(7, 10)).toBe(70)
    expect(calculateAccuracy(2, 3)).toBe(67)
  })

  it('0/0 → 0%', () => {
    expect(calculateAccuracy(0, 0)).toBe(0)
  })
})
