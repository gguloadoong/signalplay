import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = getSupabase()
  if (!supabase) return res.status(200).json(null)

  // 가장 최근 result_ready 질문 조회
  const { data, error } = await supabase
    .from('daily_questions')
    .select('*')
    .eq('result_ready', true)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(200).json(null)

  const total = data.total_votes || 1
  const crowdBullish = Math.round(((data.crowd_bullish ?? 0) / total) * 100)
  const crowdBearish = Math.round(((data.crowd_bearish ?? 0) / total) * 100)
  const crowdNeutral = 100 - crowdBullish - crowdBearish

  // close_reactions 매핑 (캐릭터별 반응 코멘트)
  const reactionsMap: Record<string, string> = {}
  const closeReactions = (data.close_reactions ?? []) as Array<{ character: string; comment: string }>
  for (const r of closeReactions) reactionsMap[r.character] = r.comment

  // 캐릭터별 isCorrect + reaction 병합
  const characters = (data.character_predictions ?? []).map(
    (c: { character: string; name: string; emoji: string; methodology: string; prediction: string; reasoning: string }) => ({
      ...c,
      isCorrect: c.prediction === data.actual_outcome,
      ...(reactionsMap[c.character] ? { reaction: reactionsMap[c.character] } : {}),
    })
  )

  return res.status(200).json({
    questionId: data.id,
    date: data.date,
    title: data.title,
    question: data.question,
    actualOutcome: data.actual_outcome,
    aiComment: data.ai_comment ?? null,
    crowdResult: { bullish: crowdBullish, bearish: crowdBearish, neutral: crowdNeutral },
    characters,
  })
}
