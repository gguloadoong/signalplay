import type { VercelRequest, VercelResponse } from '@vercel/node'

// 메모리 캐시 (Vercel KV 연결 전)
const crowdData: Record<string, { bullish: number; bearish: number; neutral: number; total: number }> = {}
const votedUsers: Set<string> = new Set()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { questionId, vote, userId } = req.body

  if (!questionId || !vote || !['bullish', 'bearish', 'neutral'].includes(vote)) {
    return res.status(400).json({ error: 'questionId and valid vote required' })
  }

  const userKey = `${userId || 'anon'}:${questionId}`
  if (votedUsers.has(userKey)) {
    return res.status(409).json({ error: '이미 투표했습니다' })
  }
  votedUsers.add(userKey)

  if (!crowdData[questionId]) {
    crowdData[questionId] = { bullish: 0, bearish: 0, neutral: 0, total: 0 }
  }

  const crowd = crowdData[questionId]
  crowd[vote as 'bullish' | 'bearish' | 'neutral']++
  crowd.total++

  const total = crowd.total || 1
  const result = {
    bullish: Math.round((crowd.bullish / total) * 100),
    bearish: Math.round((crowd.bearish / total) * 100),
    neutral: Math.round((crowd.neutral / total) * 100),
    totalVotes: crowd.total,
  }

  return res.status(201).json({ ok: true, crowd: result })
}
