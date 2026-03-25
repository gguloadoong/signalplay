import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

/** 이번 주 월요일 날짜 (캐시 키) */
function getWeekKey(): string {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return monday.toISOString().split('T')[0]
}

let cache: { week: string; data: unknown } | null = null

async function callGeminiSearch(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

function parseJson(raw: string): unknown {
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) return null
  try { return JSON.parse(match[0]) } catch { return null }
}

const FALLBACK_PICKS = [
  { ticker: '005930', name: '삼성전자', trend: '상승', summary: 'HBM 수주 증가 기대감. 2분기 실적 컨센서스 상향 조정 중.', sentiment: 'positive' },
  { ticker: '000660', name: 'SK하이닉스', trend: '상승', summary: 'AI 서버 DRAM 수요 급증. 엔비디아 공급망 핵심 포지션 유지.', sentiment: 'positive' },
  { ticker: '035420', name: 'NAVER', trend: '중립', summary: '국내 AI 광고 사업 성장세. 웹툰 IPO 일정 관심 집중.', sentiment: 'neutral' },
  { ticker: '207940', name: '삼성바이오로직스', trend: '상승', summary: '바이오 위탁생산(CMO) 수주 잔고 역대 최대 수준 유지.', sentiment: 'positive' },
  { ticker: '051910', name: 'LG화학', trend: '하락', summary: '배터리 소재 마진 압박 지속. 전기차 수요 둔화 우려 반영.', sentiment: 'negative' },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const week = getWeekKey()
  if (cache?.week === week) return res.status(200).json(cache.data)

  const today = new Date().toISOString().split('T')[0]
  const prompt = `오늘(${today}) 기준 이번 주 국내 주식 시장에서 주목받고 있는 종목 5개를 실제 최신 뉴스를 검색하여 알려주세요.
각 종목의 이번 주 주요 동향을 2문장으로 요약해주세요. 종목 코드(6자리), 종목명, 주가 방향(상승/하락/중립), 동향 요약, 긍정/부정/중립 구분을 포함하세요.
투자 자문이 아닌 시장 동향 정보 제공 목적입니다. 암호화폐 제외.
JSON 배열로만 응답: [{"ticker":"종목코드","name":"종목명","trend":"상승|하락|중립","summary":"동향 2문장","sentiment":"positive|negative|neutral"}]`

  const raw = await callGeminiSearch(prompt)
  const picks = raw ? parseJson(raw) : null

  const data = {
    week,
    generatedAt: new Date().toISOString(),
    picks: Array.isArray(picks) && picks.length >= 3 ? picks : FALLBACK_PICKS,
    disclaimer: '이 정보는 투자 자문이 아닌 시장 동향 참고용입니다.',
  }

  cache = { week, data }
  return res.status(200).json(data)
}
