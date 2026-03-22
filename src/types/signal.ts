export type Prediction = 'bullish' | 'bearish' | 'neutral'
export type Confidence = 1 | 2 | 3
export type BattleType = 'morning' | 'flash' | 'night'
export type SignalCategory = 'macro' | 'sector' | 'global' | 'breaking'

export interface Signal {
  index: number
  title: string
  summary: string
  category: SignalCategory
  sourceUrl?: string
  /** 실제 결과 (결과 공개 후) */
  actualResult?: Prediction
  /** AI 한줄 해설 (결과 공개 후) */
  resultComment?: string
}

export interface Battle {
  id: string
  type: BattleType
  date: string
  signals: Signal[]
  /** 예측 마감 시간 (ISO string) */
  deadline: string
  /** 결과 공개 시간 (ISO string) */
  resultTime: string
  isActive: boolean
  isResultReady: boolean
}

export interface UserPrediction {
  signalIndex: number
  prediction: Prediction
  confidence: Confidence
}

export interface BattleResult {
  signalIndex: number
  myPrediction: Prediction
  myConfidence: Confidence
  actualResult: Prediction
  isCorrect: boolean
  score: number
  resultComment: string
}

export interface CrowdSentiment {
  signalIndex: number
  bullish: number
  bearish: number
  neutral: number
}

export interface UserStats {
  totalScore: number
  currentStreak: number
  maxStreak: number
  totalPlays: number
  weeklyRank?: number
  accuracy: number
}

/** 점수 계산 */
export const SCORE_TABLE = {
  correct: { 1: 10, 2: 20, 3: 30 },
  wrong: { 1: 0, 2: -5, 3: -10 },
  perfectBonus: 20,
  streakBonus: (days: number) => Math.min(days * 5, 30),
} as const
