import { useState, useEffect } from 'react'
import type { BattleResult } from '@/types/signal'
import { MOCK_YESTERDAY_RESULTS, MOCK_YESTERDAY_SIGNALS } from '@/lib/mockData'

interface ResultsData {
  date: string
  results: (BattleResult & { title: string })[]
  totalScore: number
  isPerfect: boolean
  streak: number
  weeklyRank: number
}

export function useResults() {
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchResults() {
      try {
        const res = await fetch('/api/results')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      } catch {
        // 폴백
        if (!cancelled) {
          setData({
            date: new Date().toISOString().split('T')[0],
            results: MOCK_YESTERDAY_RESULTS.map((r, i) => ({ ...r, title: MOCK_YESTERDAY_SIGNALS[i] })),
            totalScore: 40,
            isPerfect: false,
            streak: 7,
            weeklyRank: 8,
          })
          setLoading(false)
        }
      }
    }

    fetchResults()
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}
