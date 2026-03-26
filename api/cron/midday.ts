import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from '../_supabase'

/**
 * Cron: 매일 03:00 UTC (12:00 KST) 장 중 캐릭터 코멘트 생성
 * vercel.json: "schedule": "0 3 * * *"
 *
 * 흐름:
 * 1. 오늘 질문 조회 (midday_comments가 아직 없는 것)
 * 2. Gemini로 캐릭터별 "지금 이 시점에 한마디" 생성
 * 3. daily_questions.midday_comments 업데이트
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface CharacterPrediction {
  character: string
  name: string
  emoji: string
  prediction: 'bullish' | 'bearish' | 'neutral'
  reasoning: string
}

interface MiddayComment {
  character: string
  name: string
  emoji: string
  comment: string
}

async function generateMiddayComments(
  title: string,
  question: string,
  characters: CharacterPrediction[],
): Promise<MiddayComment[] | null> {
  if (!GEMINI_API_KEY) return null

  const characterList = characters
    .map((c) => `- ${c.emoji} ${c.name}(${c.character}): ${c.prediction === 'bullish' ? '호재' : c.prediction === 'bearish' ? '악재' : '글쎄'} 예측 — "${c.reasoning.slice(0, 80)}"`)
    .join('\n')

  const prompt = `당신은 방구석 투자 전문가 5명입니다. 오늘 오전에 아래 이슈를 예측했고, 지금은 낮 12시입니다.
장이 열린지 3시간이 지났고, 오후 3시 30분에 결과가 나옵니다.

이슈: "${title}" — ${question}

오전 예측:
${characterList}

각 캐릭터가 지금 이 시점에 한마디씩 합니다. 각자의 성격대로, 20자 이내로.
아직 결과는 모릅니다. 긴장감, 자신감, 불안함 등이 섞여있어야 합니다.

밸류김(quant): 숫자 중심, 단호
팩터박(professor): 학문적, 잘난 척
뉴스최(reporter): 속보 중독, 소식통
봉준선(pattern): 신비주의, 차트 집착
코인토(chimp): 순수, 감으로 찍기

JSON 배열로만 응답:
[
  {"character":"quant","name":"밸류김","emoji":"💼","comment":"한마디"},
  {"character":"professor","name":"팩터박","emoji":"📚","comment":"한마디"},
  {"character":"reporter","name":"뉴스최","emoji":"📺","comment":"한마디"},
  {"character":"pattern","name":"봉준선","emoji":"📐","comment":"한마디"},
  {"character":"chimp","name":"코인토","emoji":"🎲","comment":"한마디"}
]`

  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return null

    const parsed = JSON.parse(match[0]) as MiddayComment[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    return parsed
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'Supabase not configured' })
  }

  // 오늘 날짜
  const today = new Date().toISOString().slice(0, 10)

  const { data: question, error } = await supabase
    .from('daily_questions')
    .select('id, title, question, character_predictions')
    .eq('date', today)
    .eq('result_ready', false)
    .is('midday_comments', null)
    .maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!question) return res.status(200).json({ ok: true, skipped: true, reason: 'No pending question' })

  const characters = (question.character_predictions ?? []) as CharacterPrediction[]
  if (characters.length === 0) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'No character predictions' })
  }

  const comments = await generateMiddayComments(
    question.title as string,
    question.question as string,
    characters,
  )

  if (!comments) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'Gemini generation failed' })
  }

  const { error: updateErr } = await supabase
    .from('daily_questions')
    .update({ midday_comments: comments })
    .eq('id', question.id)

  if (updateErr) return res.status(500).json({ error: updateErr.message })

  return res.status(200).json({ ok: true, questionId: question.id, generated: comments.length })
}
