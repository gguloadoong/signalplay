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
  getQuestion: () => request<import('@/types/vote').Question & {
    characters: import('@/types/vote').CharacterPrediction[]
    totalVotes: number
    deadline: string
    isActive: boolean
    crowd?: import('@/types/vote').CrowdResult
  }>('/question'),

  vote: (body: { questionId: string; vote: string; userId?: string }) =>
    request<{
      ok: boolean
      crowd: { bullish: number; bearish: number; neutral: number; totalVotes: number }
    }>('/vote', { method: 'POST', body: JSON.stringify(body) }),

  getResult: () => request<import('@/types/vote').VoteResult | null>('/result'),

  getLeaderboard: () => request<Array<{
    character: string; name: string; emoji: string
    correct: number; total: number; rate: number
  }>>('/leaderboard'),

  react: (body: { questionId: string; character: string; reaction: string; prevReaction?: string }) =>
    request<{ reactions: Record<string, number> }>('/react', { method: 'POST', body: JSON.stringify(body) }),

  getUpdates: (questionId: string) => request<{
    midday_comments: Array<{ character: string; name: string; emoji: string; comment: string }> | null
    close_reactions: Array<{ character: string; name: string; emoji: string; comment: string; isCorrect: boolean }> | null
  }>(`/updates?questionId=${questionId}`),
}
