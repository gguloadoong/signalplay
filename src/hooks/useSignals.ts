import { useState, useEffect } from 'react'
import type { Battle } from '@/types/signal'
import { MOCK_BATTLES } from '@/lib/mockData'

export function useSignals() {
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchSignals() {
      try {
        const res = await fetch('/api/signals')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setBattle(data)
          setLoading(false)
        }
      } catch {
        // API 실패 시 목데이터 폴백
        if (!cancelled) {
          setBattle(MOCK_BATTLES[0])
          setError('API 연결 실패 — 목데이터 표시 중')
          setLoading(false)
        }
      }
    }

    fetchSignals()
    return () => { cancelled = true }
  }, [])

  return { battle, loading, error }
}
