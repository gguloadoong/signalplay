import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const SIGNAL_PROMPT = `당신은 경제/투자 뉴스 분석 전문가입니다.
오늘의 주요 경제 뉴스를 기반으로 투자 시그널 3개를 생성해주세요.

각 시그널은 다음 JSON 형태로 작성하세요:
{
  "title": "시그널 제목 (20자 이내, 핵심 이슈)",
  "summary": "AI 분석 요약 (80자 이내, 시장 영향 분석 포함)",
  "category": "macro | sector | global 중 하나"
}

규칙:
- 실제 최근 경제 이슈를 기반으로 작성
- 암호화폐(비트코인, 이더리움 등) 관련 내용 절대 포함하지 않음
- 특정 종목 매수/매도 추천 절대 하지 않음
- 객관적 사실과 데이터 기반 분석만 포함
- 한국어로 작성
- 3개 시그널의 카테고리가 겹치지 않도록 다양하게 구성

JSON 배열로만 응답하세요. 다른 텍스트 없이 순수 JSON만 반환하세요.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Cron 보안 검증
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // TODO: 오늘 이미 생성했는지 확인 (멱등성)

    // Gemini API 호출
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SIGNAL_PROMPT }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text()
      console.error('Gemini API error:', errorText)
      return res.status(502).json({ error: 'Gemini API failed' })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return res.status(502).json({ error: 'Empty response from Gemini' })
    }

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const signals = JSON.parse(jsonStr)

    if (!Array.isArray(signals) || signals.length !== 3) {
      return res.status(502).json({ error: 'Invalid signal format from Gemini' })
    }

    // 시그널에 인덱스 추가
    const enrichedSignals = signals.map((s: { title: string; summary: string; category: string }, i: number) => ({
      index: i,
      title: s.title,
      summary: s.summary,
      category: s.category,
    }))

    const battle = {
      id: `morning-${today}`,
      type: 'morning',
      date: today,
      signals: enrichedSignals,
      deadline: `${today}T06:30:00Z`,
      resultTime: `${today}T06:30:00Z`,
      isActive: true,
      isResultReady: false,
    }

    // TODO: Supabase INSERT
    // TODO: Vercel KV 캐시 저장

    return res.status(201).json({
      ok: true,
      message: `${today} 시그널 3개 생성 완료`,
      battle,
    })
  } catch (error) {
    console.error('Signal generation failed:', error)
    return res.status(500).json({ error: 'Signal generation failed' })
  }
}
