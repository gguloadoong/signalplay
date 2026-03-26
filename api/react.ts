import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

const VALID_REACTIONS = ['🔥', '😱', '🤔'] as const
type Reaction = typeof VALID_REACTIONS[number]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { questionId, character, reaction } = req.body as {
    questionId?: string
    character?: string
    reaction?: string
  }

  if (!questionId || !character || !reaction) {
    return res.status(400).json({ error: 'questionId, character, reaction required' })
  }

  if (!VALID_REACTIONS.includes(reaction as Reaction)) {
    return res.status(400).json({ error: 'Invalid reaction' })
  }

  const supabase = getSupabase()
  if (!supabase) return res.status(503).json({ error: 'DB unavailable' })

  // 현재 reactions 조회
  const { data: row } = await supabase
    .from('daily_questions')
    .select('character_reactions')
    .eq('id', questionId)
    .single()

  if (!row) return res.status(404).json({ error: 'Question not found' })

  const allReactions: Record<string, Record<string, number>> = row.character_reactions ?? {}
  const charReactions = { ...(allReactions[character] ?? {}) }
  charReactions[reaction] = (charReactions[reaction] ?? 0) + 1

  const updated = { ...allReactions, [character]: charReactions }

  await supabase
    .from('daily_questions')
    .update({ character_reactions: updated })
    .eq('id', questionId)

  return res.status(200).json({ reactions: charReactions })
}
