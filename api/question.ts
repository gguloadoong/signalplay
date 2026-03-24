import type { VercelRequest, VercelResponse } from '@vercel/node'
import { QUESTION_PROMPT, CHARACTER_PROMPT, CHARACTER_META, type CharacterKey } from '../src/lib/prompts'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

let cache: { date: string; data: unknown } | null = null

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

function parseJson(raw: string): unknown {
  const match = raw.match(/[[{][\s\S]*[}\]]/)
  if (!match) return null
  try { return JSON.parse(match[0]) } catch { return null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const today = new Date().toISOString().split('T')[0]
  if (cache?.date === today) return res.status(200).json(cache.data)

  // 1. Generate question
  const qRaw = await callGemini(QUESTION_PROMPT)
  let question = qRaw ? parseJson(qRaw) as { title: string; question: string; category: string } | null : null

  if (!question) {
    question = { title: '삼성전자 실적 발표', question: '이번 분기 실적, 주가에 호재일까?', category: '종목' }
  }

  // 2. Generate character predictions
  const charPrompt = CHARACTER_PROMPT
    .replace('{QUESTION_TITLE}', question.title)
    .replace('{QUESTION_TEXT}', question.question)

  const cRaw = await callGemini(charPrompt)
  let characters = cRaw ? parseJson(cRaw) as Array<{ character: string; prediction: string; reasoning: string }> | null : null

  if (!characters || characters.length < 5) {
    characters = [
      { character: 'quant', prediction: 'bullish', reasoning: 'RSI 과매도 구간 탈출. 20일 이동평균선 골든크로스 임박.' },
      { character: 'professor', prediction: 'bullish', reasoning: 'Bernard & Thomas(1989) PEAD 모델 기준, 실적 서프라이즈 후 60일간 양의 드리프트 예상.' },
      { character: 'reporter', prediction: 'neutral', reasoning: '실적 자체는 호조이나 가이던스 보수적. 뉴스 톤 혼재.' },
      { character: 'pattern', prediction: 'bearish', reasoning: '2024년 동일 시기 실적 서프라이즈 후 2주간 -3.2% 되돌림 발생.' },
      { character: 'chimp', prediction: 'bullish', reasoning: '🎯 다트가 호재에 꽂혔어요! (근거: 없음)' },
    ]
  }

  const enrichedCharacters = characters.map((c) => {
    const key = c.character as CharacterKey
    const meta = CHARACTER_META[key] ?? CHARACTER_META.chimp
    return {
      character: key,
      name: meta.name,
      emoji: meta.emoji,
      methodology: meta.methodology,
      prediction: c.prediction,
      reasoning: c.reasoning,
    }
  })

  const response = {
    id: `q-${today}`,
    date: today,
    title: question.title,
    question: question.question,
    category: question.category,
    characters: enrichedCharacters,
    totalVotes: 0,
    deadline: `${today}T06:30:00Z`,
    isActive: true,
  }

  cache = { date: today, data: response }
  return res.status(200).json(response)
}
