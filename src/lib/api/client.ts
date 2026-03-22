const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      return { error: errorBody.error || `HTTP ${res.status}` }
    }

    const data = await res.json()
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Network error' }
  }
}

export const api = {
  getSignals: () => request<import('@/types/signal').Battle>('/signals'),

  submitPredictions: (
    battleId: string,
    predictions: import('@/types/signal').UserPrediction[],
  ) =>
    request<{ ok: boolean; crowdSentiment: import('@/types/signal').CrowdSentiment[] }>(
      '/predictions',
      {
        method: 'POST',
        body: JSON.stringify({ battleId, predictions }),
      },
    ),

  getResults: () =>
    request<{
      date: string
      results: import('@/types/signal').BattleResult[]
      totalScore: number
      isPerfect: boolean
      streak: number
      weeklyRank: number
    }>('/results'),

  getStats: () => request<import('@/types/signal').UserStats>('/stats'),
}
