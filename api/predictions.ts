import type { VercelRequest, VercelResponse } from '@vercel/node'

// POST /api/predictions — 예측 제출
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { battleId, predictions } = req.body

    if (!battleId || !predictions || !Array.isArray(predictions)) {
      return res.status(400).json({ error: 'battleId and predictions array required' })
    }

    // 각 예측 검증
    for (const pred of predictions) {
      if (!['bullish', 'bearish', 'neutral'].includes(pred.prediction)) {
        return res.status(400).json({ error: `Invalid prediction: ${pred.prediction}` })
      }
      if (![1, 2, 3].includes(pred.confidence)) {
        return res.status(400).json({ error: `Invalid confidence: ${pred.confidence}` })
      }
    }

    // TODO: 마감 시간 검증
    // TODO: 중복 제출 방지 (KV + DB UNIQUE)
    // TODO: Supabase INSERT
    // TODO: 군중 심리 집계 업데이트 (KV)

    // 군중 심리 목데이터 반환
    const crowdSentiment = predictions.map((_: unknown, i: number) => ({
      signalIndex: i,
      bullish: Math.floor(Math.random() * 40 + 40),
      bearish: Math.floor(Math.random() * 30 + 10),
      neutral: 0,
    }))
    crowdSentiment.forEach((c: { bullish: number; bearish: number; neutral: number }) => {
      c.neutral = 100 - c.bullish - c.bearish
    })

    return res.status(201).json({
      ok: true,
      message: '예측이 제출되었습니다',
      crowdSentiment,
    })
  } catch (error) {
    console.error('Failed to submit predictions:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
