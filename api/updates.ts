import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

/**
 * GET /api/updates?questionId=...
 * 오늘 질문의 캐릭터 장 중 업데이트 반환
 * - midday_comments: 낮 12시 코멘트 (nullable)
 * - close_reactions: 장 마감 후 승패 반응 (nullable)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = getSupabase()
  if (!supabase) return res.status(200).json({ midday_comments: null, close_reactions: null })

  const { questionId } = req.query
  if (!questionId || typeof questionId !== 'string') {
    return res.status(400).json({ error: 'questionId required' })
  }

  const { data, error } = await supabase
    .from('daily_questions')
    .select('midday_comments, close_reactions')
    .eq('id', questionId)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(200).json({ midday_comments: null, close_reactions: null })

  return res.status(200).json({
    midday_comments: data.midday_comments ?? null,
    close_reactions: data.close_reactions ?? null,
  })
}
