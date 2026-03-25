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

const FALLBACK_CHARACTER_PICKS = [
  { character: 'quant', name: '밸류김', emoji: '💼', ticker: '005930', stockName: '삼성전자', reason: 'PER 10.8배로 섹터 평균 대비 24% 할인. 기관 순매수 5거래일 연속 지속.' },
  { character: 'professor', name: '팩터박', emoji: '📚', ticker: '000660', stockName: 'SK하이닉스', reason: 'Fama-French(1993) Size+Value Factor 동시 충족. Momentum 상위 20% 진입.' },
  { character: 'reporter', name: '뉴스최', emoji: '📺', ticker: '207940', stockName: '삼성바이오로직스', reason: '이번 주 CMO 관련 긍정 기사 비율 81%. 외국인 순매수 전환 3일째.' },
  { character: 'pattern', name: '봉준선', emoji: '📐', ticker: '035420', stockName: 'NAVER', reason: 'RSI 42 — 과매도 탈출 직전. 20일선 지지 확인, 컵앤핸들 패턴 형성 중.' },
  { character: 'chimp', name: '코인토', emoji: '🎲', ticker: '035720', stockName: '카카오', reason: '오늘 카카오톡 답장이 빠르게 왔어요. 뭔가 좋은 신호인 것 같아요 🎲' },
]

const CHARACTER_PICKS_PROMPT = (today: string) =>
  `오늘(${today}) 기준, 방구석 투자 전문가 5명이 각자의 방식으로 이번 주 가장 주목하는 국내 주식 1종목씩 추천합니다.

각 캐릭터의 추천 방식:
- 밸류김(quant): 이번 주 PER/PBR이 저평가된 종목 — 수치 근거 한 문장
- 팩터박(professor): 이번 주 학술 팩터(가치/모멘텀/퀄리티) 신호가 강한 종목 — 이론명 포함
- 뉴스최(reporter): 이번 주 긍정 뉴스 센티멘트가 급상승한 종목 — 센티멘트 수치 포함
- 봉준선(pattern): 이번 주 기술적 매수 신호가 나타난 종목 — RSI/MACD/패턴 포함
- 코인토(chimp): 이번 주 완전 감으로 찍은 종목 — 황당한 일상 에피소드 이유 포함 🎲

규칙: 5명이 서로 다른 종목 추천. 투자 자문 아님. 암호화폐 제외.
JSON 배열로만 응답:
[{"character":"quant","name":"밸류김","emoji":"💼","ticker":"종목코드6자리","stockName":"종목명","reason":"추천 이유 한 문장"},...]`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const week = getWeekKey()
  if (cache?.week === week) return res.status(200).json(cache.data)

  const today = new Date().toISOString().split('T')[0]

  // 두 Gemini 호출 병렬 실행
  const [picksRaw, charPicksRaw] = await Promise.all([
    callGeminiSearch(
      `오늘(${today}) 기준 이번 주 국내 주식 시장에서 주목받고 있는 종목 5개를 실제 최신 뉴스를 검색하여 알려주세요.
각 종목의 이번 주 주요 동향을 2문장으로 요약해주세요. 투자 자문이 아닌 시장 동향 정보 제공 목적입니다. 암호화폐 제외.
JSON 배열로만 응답: [{"ticker":"종목코드","name":"종목명","trend":"상승|하락|중립","summary":"동향 2문장","sentiment":"positive|negative|neutral"}]`
    ),
    callGeminiSearch(CHARACTER_PICKS_PROMPT(today)),
  ])

  const picks = picksRaw ? parseJson(picksRaw) : null
  const charPicks = charPicksRaw ? parseJson(charPicksRaw) : null

  const data = {
    week,
    generatedAt: new Date().toISOString(),
    picks: Array.isArray(picks) && picks.length >= 3 ? picks : FALLBACK_PICKS,
    characterPicks: Array.isArray(charPicks) && charPicks.length >= 5 ? charPicks : FALLBACK_CHARACTER_PICKS,
    disclaimer: '이 정보는 투자 자문이 아닌 시장 동향 참고용입니다.',
  }

  cache = { week, data }
  return res.status(200).json(data)
}
