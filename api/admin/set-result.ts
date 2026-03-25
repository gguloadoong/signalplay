import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from '../_supabase'

const VALID_OUTCOMES = ['bullish', 'bearish', 'neutral'] as const

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // 관리자 인증
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || req.headers['x-admin-secret'] !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { questionId, outcome } = req.body

  if (!questionId || !outcome || !VALID_OUTCOMES.includes(outcome)) {
    return res.status(400).json({ error: 'questionId and valid outcome required' })
  }

  const supabase = getSupabase()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // 1. 질문 결과 업데이트
  const { error: updateErr } = await supabase
    .from('daily_questions')
    .update({ actual_outcome: outcome, result_ready: true })
    .eq('id', questionId)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  // 2. 해당 질문의 모든 투표 is_correct 일괄 업데이트
  const { error: votesErr } = await supabase
    .from('user_votes')
    .update({ is_correct: false })
    .eq('question_id', questionId)

  if (!votesErr) {
    await supabase
      .from('user_votes')
      .update({ is_correct: true })
      .eq('question_id', questionId)
      .eq('choice', outcome)
  }

  return res.status(200).json({ ok: true, questionId, outcome })
}
