import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from '../_supabase'

/**
 * Cron: 매일 07:00 UTC (16:00 KST) 장 마감 후 결과 자동 판정
 * vercel.json: "schedule": "0 7 * * *"
 *
 * 흐름:
 * 1. 오늘 질문 중 result_ready=false인 항목 조회
 * 2. Gemini Search로 종목/이슈 당일 주가 변동률 조회
 * 3. +1% 이상 → bullish, -1% 이하 → bearish, 그 사이 → neutral
 * 4. daily_questions 업데이트 + user_votes is_correct 일괄 업데이트
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

async function fetchOutcomeFromGemini(
  title: string,
  date: string,
): Promise<{ outcome: 'bullish' | 'bearish' | 'neutral'; changePercent: number | null } | null> {
  if (!GEMINI_API_KEY) return null

  const prompt = `오늘(${date}) 다음 투자 이슈의 실제 결과를 검색해서 판정해주세요.

이슈: "${title}"

검색해야 할 것:
- 관련 종목 또는 지수의 오늘 종가 변동률 (%)
- 한국 주식이면 코스피/코스닥 종가 기준
- 없으면 관련 ETF 또는 대표 종목 기준

판정 기준:
- +1.0% 이상 상승 → "bullish"
- -1.0% 이하 하락 → "bearish"
- 그 사이 (-0.99% ~ +0.99%) → "neutral"

JSON으로만 응답:
{"outcome":"bullish|bearish|neutral","changePercent":숫자,"reasoning":"근거 한 줄"}`

  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
      tools: [{ google_search: {} }],
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
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return null

    const parsed = JSON.parse(match[0]) as {
      outcome: 'bullish' | 'bearish' | 'neutral'
      changePercent: number
    }

    if (!['bullish', 'bearish', 'neutral'].includes(parsed.outcome)) return null

    return { outcome: parsed.outcome, changePercent: parsed.changePercent ?? null }
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cron 보안 검증
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'Supabase not configured' })
  }

  // 오늘 날짜 기준으로 처리 대상 질문 조회
  // deadline이 지났고 아직 result_ready=false인 질문
  const now = new Date().toISOString()
  const { data: questions, error } = await supabase
    .from('daily_questions')
    .select('id, date, title')
    .eq('result_ready', false)
    .lt('deadline', now)
    .order('date', { ascending: false })
    .limit(3) // 최대 3일치 소급 처리

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!questions || questions.length === 0) {
    return res.status(200).json({ ok: true, processed: 0, reason: 'No pending questions' })
  }

  const results: Array<{ questionId: string; outcome: string; changePercent: number | null }> = []

  for (const q of questions) {
    const geminiResult = await fetchOutcomeFromGemini(q.title as string, q.date as string)

    if (!geminiResult) {
      console.error(`[set-result] Gemini 판정 실패: questionId=${q.id}, title=${q.title}`)
      continue
    }

    const { outcome, changePercent } = geminiResult

    // 1. daily_questions 업데이트
    const { error: updateErr } = await supabase
      .from('daily_questions')
      .update({ actual_outcome: outcome, result_ready: true })
      .eq('id', q.id)

    if (updateErr) {
      console.error(`[set-result] DB 업데이트 실패: ${updateErr.message}`)
      continue
    }

    // 2. user_votes is_correct 일괄 업데이트
    await supabase.from('user_votes').update({ is_correct: false }).eq('question_id', q.id)

    await supabase
      .from('user_votes')
      .update({ is_correct: true })
      .eq('question_id', q.id)
      .eq('choice', outcome)

    results.push({ questionId: q.id as string, outcome, changePercent })
  }

  return res.status(200).json({ ok: true, processed: results.length, results })
}
