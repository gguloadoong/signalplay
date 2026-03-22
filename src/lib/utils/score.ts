import type { Prediction, Confidence, UserPrediction, BattleResult } from '@/types/signal'
import { SCORE_TABLE } from '@/types/signal'

/**
 * 개별 예측의 점수를 계산
 */
export function calculateScore(
  prediction: Prediction,
  confidence: Confidence,
  actualResult: Prediction,
): number {
  const isCorrect = prediction === actualResult
  return isCorrect
    ? SCORE_TABLE.correct[confidence]
    : SCORE_TABLE.wrong[confidence]
}

/**
 * 배틀 전체 결과 계산 (PERFECT 보너스 포함)
 */
export function calculateBattleResults(
  predictions: UserPrediction[],
  actualResults: Prediction[],
  resultComments: string[],
): { results: BattleResult[]; totalScore: number; isPerfect: boolean } {
  const results: BattleResult[] = predictions.map((pred, i) => {
    const actual = actualResults[i]
    const isCorrect = pred.prediction === actual
    const score = calculateScore(pred.prediction, pred.confidence, actual)

    return {
      signalIndex: pred.signalIndex,
      myPrediction: pred.prediction,
      myConfidence: pred.confidence,
      actualResult: actual,
      isCorrect,
      score,
      resultComment: resultComments[i] ?? '',
    }
  })

  const isPerfect = results.every((r) => r.isCorrect)
  const baseScore = results.reduce((acc, r) => acc + r.score, 0)
  const totalScore = baseScore + (isPerfect ? SCORE_TABLE.perfectBonus : 0)

  return { results, totalScore, isPerfect }
}

/**
 * 스트릭 보너스 계산
 */
export function calculateStreakBonus(consecutiveDays: number): number {
  return SCORE_TABLE.streakBonus(consecutiveDays)
}

/**
 * 총점이 음수가 되지 않도록 보장
 */
export function clampScore(score: number): number {
  return Math.max(0, score)
}

/**
 * 적중률 계산
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}
