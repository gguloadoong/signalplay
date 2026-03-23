import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const SIGNAL_PROMPT = `당신은 경제/투자 뉴스 분석 전문가입니다.
오늘의 주요 경제 뉴스를 기반으로 투자 시그널 3개를 생성해주세요.

각 시그널은 다음 JSON 형태로 작성하세요:
{"title": "시그널 제목 (20자 이내)", "summary": "AI 분석 요약 (80자 이내, 시장 영향 포함)", "category": "macro 또는 sector 또는 global"}

규칙:
- 실제 최근 경제 이슈를 기반으로 작성
- 암호화폐(비트코인, 이더리움 등) 관련 내용 절대 포함하지 않음
- 특정 종목 매수/매도 추천 절대 하지 않음
- 3개 카테고리가 겹치지 않도록 다양하게 구성
- 한국어로 작성

JSON 배열로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만 반환하세요.`

// 메모리 캐시 (Vercel Serverless는 동일 인스턴스 재사용 시 유지)
let cachedSignals: { date: string; data: unknown } | null = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const today = new Date().toISOString().split('T')[0]

  // 캐시 히트
  if (cachedSignals?.date === today) {
    return res.status(200).json(cachedSignals.data)
  }

  // Gemini로 생성 시도
  if (GEMINI_API_KEY) {
    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SIGNAL_PROMPT }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(15000),
      })

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          // 마크다운 코드블록, 앞뒤 텍스트 제거 → 순수 JSON 추출
          let jsonStr = rawText
          const jsonMatch = rawText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            jsonStr = jsonMatch[0]
          } else {
            jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          }
          const signals_typed = JSON.parse(jsonStr)

          if (Array.isArray(signals_typed) && signals_typed.length === 3) {
            const battle = {
              id: `morning-${today}`,
              type: 'morning',
              date: today,
              signals: signals_typed.map((s: { title: string; summary: string; category: string }, i: number) => ({
                index: i,
                title: s.title,
                summary: s.summary,
                category: s.category,
              })),
              deadline: `${today}T06:30:00Z`,
              resultTime: `${today}T06:30:00Z`,
              isActive: true,
              isResultReady: false,
            }

            cachedSignals = { date: today, data: battle }
            return res.status(200).json(battle)
          }
        }
      }
    } catch (error) {
      console.error('Gemini API failed, falling back to mock:', error)
      console.error('Gemini failed, using fallback')
    }
  }

  // 폴백: 목데이터 (키 없음)
  const fallback = {
    id: `morning-${today}`,
    type: 'morning',
    date: today,
    signals: [
      { index: 0, title: '연준 금리 동결 시사 발언', summary: '파월 의장이 상반기 금리 동결 가능성을 시사. 과거 유사 발언 후 나스닥 평균 +1.2% 상승.', category: 'macro' },
      { index: 1, title: '반도체 수출 3개월 연속 증가', summary: '산업부 발표, 3월 반도체 수출 전년 대비 +23.4%. DRAM 가격 회복세 뚜렷.', category: 'sector' },
      { index: 2, title: '중국 PMI 예상치 하회', summary: '3월 제조업 PMI 49.2로 위축 국면 재진입. 시장 예상 50.1 대비 하회.', category: 'global' },
    ],
    deadline: `${today}T06:30:00Z`,
    resultTime: `${today}T06:30:00Z`,
    isActive: true,
    isResultReady: false,
  }

  return res.status(200).json(fallback)
}
