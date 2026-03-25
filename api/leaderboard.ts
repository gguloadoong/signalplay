import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

const CHARACTERS = ['quant', 'professor', 'reporter', 'pattern', 'chimp'] as const
const MOCK_LEADERBOARD = [
  { character: 'quant', name: '밸류김', emoji: '💼', correct: 18, total: 25, rate: 72 },
  { character: 'reporter', name: '뉴스최', emoji: '📺', correct: 17, total: 25, rate: 68 },
  { character: 'professor', name: '팩터박', emoji: '📚', correct: 16, total: 25, rate: 64 },
  { character: 'pattern', name: '봉준선', emoji: '📐', correct: 15, total: 25, rate: 60 },
  { character: 'chimp', name: '코인토', emoji: '🎲', correct: 13, total: 25, rate: 52 },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = getSupabase()
  if (!supabase) return res.status(200).json(MOCK_LEADERBOARD)

  // result_ready=true 질문들에서 character_predictions 집계
  const { data, error } = await supabase
    .from('daily_questions')
    .select('character_predictions, actual_outcome')
    .eq('result_ready', true)
    .not('actual_outcome', 'is', null)

  if (error || !data || data.length === 0) {
    return res.status(200).json(MOCK_LEADERBOARD)
  }

  const stats: Record<string, { correct: number; total: number; name: string; emoji: string }> = {}

  for (const row of data) {
    const preds = row.character_predictions as Array<{
      character: string; name: string; emoji: string; prediction: string
    }> | null
    if (!preds) continue

    for (const p of preds) {
      if (!CHARACTERS.includes(p.character as typeof CHARACTERS[number])) continue
      if (!stats[p.character]) {
        stats[p.character] = { correct: 0, total: 0, name: p.name, emoji: p.emoji }
      }
      stats[p.character].total++
      if (p.prediction === row.actual_outcome) {
        stats[p.character].correct++
      }
    }
  }

  const leaderboard = CHARACTERS
    .filter((c) => stats[c])
    .map((c) => ({
      character: c,
      name: stats[c].name,
      emoji: stats[c].emoji,
      correct: stats[c].correct,
      total: stats[c].total,
      rate: stats[c].total > 0 ? Math.round((stats[c].correct / stats[c].total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate)

  return res.status(200).json(leaderboard.length > 0 ? leaderboard : MOCK_LEADERBOARD)
}
