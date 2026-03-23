import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const FEED_PROMPT = `당신은 경제/투자 전문 에디터입니다.
오늘의 주요 경제 이슈를 바탕으로 투자 피드 콘텐츠 4개를 생성해주세요.

형식은 JSON 배열이며, 각 항목은 다음 중 하나의 type을 가집니다:

1. type: "debate" (AI 토론)
   {"id":"debate-1","type":"debate","title":"토론 주제","bullishView":"강세론 AI 의견 (2~3문장)","bearishView":"약세론 AI 의견 (2~3문장)","timestamp":"N시간 전"}

2. type: "insight" (AI 전망)
   {"id":"insight-1","type":"insight","title":"전망 제목","content":"분석 내용 (3~4문장)","category":"매크로|섹터|글로벌","timestamp":"N시간 전"}

3. type: "news" (엄선 뉴스)
   {"id":"news-1","type":"news","title":"뉴스 제목","aiComment":"AI 해석 (2~3문장)","source":"출처","timestamp":"N시간 전"}

규칙:
- debate 2개, insight 1개, news 1개로 구성
- 암호화폐 관련 내용 절대 포함하지 않음
- 특정 종목 매수/매도 추천 절대 하지 않음
- 한국어로 작성
- JSON 배열만 반환 (마크다운 코드블록 없이)`

let cachedFeed: { date: string; data: unknown } | null = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const today = new Date().toISOString().split('T')[0]

  if (cachedFeed?.date === today) {
    return res.status(200).json(cachedFeed.data)
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: FEED_PROMPT }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(20000),
      })

      if (geminiRes.ok) {
        const data = await geminiRes.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          const jsonMatch = rawText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const feed = JSON.parse(jsonMatch[0])
            if (Array.isArray(feed) && feed.length >= 3) {
              cachedFeed = { date: today, data: feed }
              return res.status(200).json(feed)
            }
          }
        }
      }
    } catch (error) {
      console.error('Feed generation failed:', error)
    }
  }

  // 폴백
  return res.status(200).json([
    { id: 'debate-1', type: 'debate', title: '반도체 사이클, 진짜 바닥 찍었나?', bullishView: '강세론 AI: DRAM 가격 3개월 연속 상승, HBM 수요 폭발. 하반기 실적 턴어라운드 확실.', bearishView: '약세론 AI: 중국 수요 회복 미확인. 재고 소진 속도 둔화 중. 과도한 기대 경계.', timestamp: '2시간 전' },
    { id: 'insight-1', type: 'insight', title: 'AI 주간 전망', content: '이번 주 주목 이벤트: 미국 CPI 발표(수), 한국 GDP 속보치(목). 변동성 확대 구간 예상.', category: '매크로', timestamp: '3시간 전' },
    { id: 'news-1', type: 'news', title: '한은 총재 "물가 안정세 확인 시 금리 인하 검토"', aiComment: 'AI 해석: 시장은 6월 인하를 기대하기 시작할 수 있으나, 조건부 발언이므로 과도한 기대는 경계.', source: '한국은행', timestamp: '5시간 전' },
    { id: 'debate-2', type: 'debate', title: '원달러 환율 1,300원 붕괴 가능성', bullishView: '강세론 AI: 미국 금리 인하 기대감 + 한국 수출 호조로 원화 강세 전환 가능.', bearishView: '약세론 AI: 지정학 리스크 + 중동 불안으로 안전자산 선호. 달러 강세 지속 전망.', timestamp: '6시간 전' },
  ])
}
