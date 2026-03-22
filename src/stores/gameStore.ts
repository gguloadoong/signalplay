import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPrediction, UserStats, BattleResult } from '@/types/signal'

interface PredictionEntry {
  battleId: string
  predictions: UserPrediction[]
  submittedAt: string
}

interface GameState {
  // 유저 정보
  userId: string | null
  nickname: string
  stats: UserStats

  // 예측 데이터 (배틀별)
  submittedPredictions: Record<string, PredictionEntry>

  // 결과 확인 여부
  revealedResults: Record<string, Set<number>>

  // 액션
  setUser: (userId: string, nickname: string) => void
  submitPrediction: (battleId: string, predictions: UserPrediction[]) => void
  getPredictions: (battleId: string) => PredictionEntry | undefined
  hasPredicted: (battleId: string) => boolean
  revealResult: (battleId: string, index: number) => void
  isResultRevealed: (battleId: string, index: number) => boolean
  updateStats: (results: BattleResult[], isPerfect: boolean, streakBonus: number) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userId: null,
      nickname: '게스트',
      stats: {
        totalScore: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalPlays: 0,
        weeklyRank: undefined,
        accuracy: 0,
      },

      submittedPredictions: {},
      revealedResults: {},

      setUser: (userId, nickname) => set({ userId, nickname }),

      submitPrediction: (battleId, predictions) =>
        set((state) => ({
          submittedPredictions: {
            ...state.submittedPredictions,
            [battleId]: {
              battleId,
              predictions,
              submittedAt: new Date().toISOString(),
            },
          },
        })),

      getPredictions: (battleId) => get().submittedPredictions[battleId],

      hasPredicted: (battleId) => !!get().submittedPredictions[battleId],

      revealResult: (battleId, index) =>
        set((state) => {
          const current = state.revealedResults[battleId]
          const updated = new Set(current ?? [])
          updated.add(index)
          return {
            revealedResults: {
              ...state.revealedResults,
              [battleId]: updated,
            },
          }
        }),

      isResultRevealed: (battleId, index) => {
        const revealed = get().revealedResults[battleId]
        return revealed ? revealed.has(index) : false
      },

      updateStats: (results, isPerfect, streakBonus) =>
        set((state) => {
          const correctCount = results.filter((r) => r.isCorrect).length
          const totalPredictions = state.stats.totalPlays * 3 + results.length
          const totalCorrect = Math.round(
            (state.stats.accuracy / 100) * state.stats.totalPlays * 3 + correctCount
          )
          const baseScore = results.reduce((acc, r) => acc + r.score, 0)
          const perfectBonus = isPerfect ? 20 : 0
          const newTotalScore = Math.max(
            0,
            state.stats.totalScore + baseScore + perfectBonus + streakBonus
          )

          return {
            stats: {
              ...state.stats,
              totalScore: newTotalScore,
              totalPlays: state.stats.totalPlays + 1,
              currentStreak: state.stats.currentStreak + 1,
              maxStreak: Math.max(state.stats.maxStreak, state.stats.currentStreak + 1),
              accuracy: totalPredictions > 0
                ? Math.round((totalCorrect / totalPredictions) * 100)
                : 0,
            },
          }
        }),
    }),
    {
      name: 'signalplay-game',
      partialize: (state) => ({
        userId: state.userId,
        nickname: state.nickname,
        stats: state.stats,
        submittedPredictions: state.submittedPredictions,
      }),
    }
  )
)
