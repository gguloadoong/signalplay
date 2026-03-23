import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const RESULTS_PROMPT = `당신은 경제/투자 분석가입니다.
어제의 주요 경제 시그널 3개에 대해 실제 시장 결과를 분석해주세요.

각 시그널에 대해 다음 JSON 형태로 작성하세요:
{
  "signalIndex": 0,
  "title": "시그널 제목",
  "actualResult": "bullish 또는 bearish 또는 neutral",
  "resultComment": "실제 시장 반응 해설 (1~2문장, 구체적 수치 포함)",
  "marketImpact": "코스피/나스닥 등 관련 지수 변동 요약"
}

규칙:
- 3개 시그널의 결과를 JSON 배열로 반환
- actualResult는 반드시 "bullish", "bearish", "neutral" 중 하나
- resultComment는 구체적 수치와 원인을 포함
- 암호화폐 언급 금지
- 한국어로 작성
- JSON 배열만 반환`

let cachedResults: { date: string; data: unknown } | null = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const today = new Date().toISOString().split('T')[0]

  if (cachedResults?.date === today) {
    return res.status(200).json(cachedResults.data)
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: RESULTS_PROMPT }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (geminiRes.ok) {
        const data = await geminiRes.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          const jsonMatch = rawText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const results = JSON.parse(jsonMatch[0])
            if (Array.isArray(results) && results.length >= 3) {
              const response = {
                date: today,
                battleType: 'morning',
                results: results.slice(0, 3).map((r: { title: string; actualResult: string; resultComment: string }, i: number) => ({
                  signalIndex: i,
                  title: r.title,
                  myPrediction: ['bullish', 'bearish', 'neutral'][i % 3],
                  myConfidence: [3, 2, 1][i % 3],
                  actualResult: r.actualResult,
                  isCorrect: ['bullish', 'bearish', 'neutral'][i % 3] === r.actualResult,
                  score: ['bullish', 'bearish', 'neutral'][i % 3] === r.actualResult ? [30, 20, 10][i % 3] : [-10, -5, 0][i % 3],
                  resultComment: r.resultComment,
                })),
                totalScore: 0,
                isPerfect: false,
                streak: 7,
                weeklyRank: 8,
                rankChange: 4,
              }
              response.totalScore = response.results.reduce((a: number, r: { score: number }) => a + r.score, 0)
              response.isPerfect = response.results.every((r: { isCorrect: boolean }) => r.isCorrect)
              if (response.isPerfect) response.totalScore += 20

              cachedResults = { date: today, data: response }
              return res.status(200).json(response)
            }
          }
        }
      }
    } catch (error) {
      console.error('Results generation failed:', error)
    }
  }

  // 폴백
  return res.status(200).json({
    date: today,
    battleType: 'morning',
    results: [
      { signalIndex: 0, title: '연준 금리 동결 시사 발언', myPrediction: 'bullish', myConfidence: 3, actualResult: 'bullish', isCorrect: true, score: 30, resultComment: '코스피 +1.2% 상승. 외국인 매수세 유입이 주요 원인.' },
      { signalIndex: 1, title: '반도체 수출 3개월 연속 증가', myPrediction: 'bullish', myConfidence: 2, actualResult: 'bullish', isCorrect: true, score: 20, resultComment: '삼성전자 +2.3%, SK하이닉스 +3.1%. HBM 기대감 반영.' },
      { signalIndex: 2, title: '중국 PMI 예상치 하회', myPrediction: 'bearish', myConfidence: 3, actualResult: 'neutral', isCorrect: false, score: -10, resultComment: '코스피 영향 제한적. 이미 시장에 선반영된 것으로 분석.' },
    ],
    totalScore: 40, isPerfect: false, streak: 7, weeklyRank: 8, rankChange: 4,
  })
}
