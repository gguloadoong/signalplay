import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

// 메모리 폴백 (Supabase 미설정 시 또는 콜드스타트 버퍼)
const memCrowd: Record<string, { bullish: number; bearish: number; neutral: number; total: number }> = {}
const memVoted: Set<string> = new Set()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { questionId, vote, userId } = req.body

  if (!questionId || !vote || !['bullish', 'bearish', 'neutral'].includes(vote)) {
    return res.status(400).json({ error: 'questionId and valid vote required' })
  }

  const supabase = getSupabase()

  if (supabase) {
    // Supabase 경로: user_votes INSERT + daily_questions 집계
    try {
      const userKey = userId || 'anon'

      // 중복 투표 확인
      const { data: existing } = await supabase
        .from('user_votes')
        .select('id')
        .eq('toss_user_id', userKey)
        .eq('question_id', questionId)
        .maybeSingle()

      if (existing) {
        return res.status(409).json({ error: '이미 투표했습니다' })
      }

      // 투표 저장
      await supabase.from('user_votes').insert({
        toss_user_id: userKey,
        question_id: questionId,
        date: new Date().toISOString().split('T')[0],
        choice: vote,
      })

      // 군중 비율 집계
      await supabase.rpc('increment_vote', {
        p_question_id: questionId,
        p_choice: vote,
      })

      // 최신 군중 비율 조회
      const { data: q } = await supabase
        .from('daily_questions')
        .select('crowd_bullish, crowd_bearish, crowd_neutral, total_votes')
        .eq('id', questionId)
        .single()

      const total = q?.total_votes || 1
      return res.status(201).json({
        ok: true,
        crowd: {
          bullish: Math.round(((q?.crowd_bullish ?? 0) / total) * 100),
          bearish: Math.round(((q?.crowd_bearish ?? 0) / total) * 100),
          neutral: Math.round(((q?.crowd_neutral ?? 0) / total) * 100),
          totalVotes: q?.total_votes ?? 1,
        },
      })
    } catch {
      // Supabase 오류 시 메모리 폴백으로 전환
    }
  }

  // 메모리 폴백
  const userKey = `${userId || 'anon'}:${questionId}`
  if (memVoted.has(userKey)) {
    return res.status(409).json({ error: '이미 투표했습니다' })
  }
  memVoted.add(userKey)

  if (!memCrowd[questionId]) {
    memCrowd[questionId] = { bullish: 0, bearish: 0, neutral: 0, total: 0 }
  }
  const crowd = memCrowd[questionId]
  crowd[vote as 'bullish' | 'bearish' | 'neutral']++
  crowd.total++

  const total = crowd.total || 1
  return res.status(201).json({
    ok: true,
    crowd: {
      bullish: Math.round((crowd.bullish / total) * 100),
      bearish: Math.round((crowd.bearish / total) * 100),
      neutral: Math.round((crowd.neutral / total) * 100),
      totalVotes: crowd.total,
    },
  })
}
