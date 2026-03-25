import type { VercelRequest, VercelResponse } from '@vercel/node'

// 프롬프트와 메타데이터를 인라인 (Vercel Serverless에서 src/ import 불가)
const CHARACTER_META: Record<string, { name: string; emoji: string; methodology: string }> = {
  quant: { name: '엑셀형', emoji: '💼', methodology: 'PER/PBR 수치 분석' },
  professor: { name: '도서관형', emoji: '📚', methodology: '학술 이론 적용' },
  reporter: { name: '뉴스형', emoji: '📺', methodology: '뉴스 센티멘트' },
  pattern: { name: '차트형', emoji: '📐', methodology: '기술적 패턴' },
  chimp: { name: '운형', emoji: '🎲', methodology: '순수한 감' },
}

const buildQuestionPrompt = (today: string) =>
  `당신은 투자 뉴스 편집자입니다. 오늘(${today}) 실제 발생한 주요 경제/주식 뉴스를 검색하여, 투자자들의 의견이 갈릴 만한 질문 1개를 만들어주세요.
좋은 질문: 오늘 실제 보도된 구체적 종목/이벤트 기반, 호재/악재 의견 갈림.
나쁜 질문: 추상적, 암호화폐 관련, 오래된 이슈.
JSON으로만 응답: {"title":"이슈 제목(15자)","question":"투표 질문(25자, ~일까?)","category":"종목|지수|매크로"}`

const CHARACTER_PROMPT = `당신은 방구석 투자 전문가 5명입니다. 각자의 방식으로 아래 질문을 분석합니다. 실제 주식 전문가 수준의 구체적 인사이트를 제공하세요.

질문: {QUESTION_TITLE} — {QUESTION_TEXT}

각 캐릭터의 역할과 분석 방식:
1. 엑셀형(quant): 스프레드시트에 삶을 건 직장인. PER/PBR/EV/EBITDA 같은 밸류에이션 수치와 최근 N분기 실적 트렌드, 기관 수급 데이터를 근거로 분석. 구체적 수치 반드시 포함.
2. 도서관형(professor): 논문 3000편 읽고 주식 시작한 사람. PEAD(Post-Earnings Announcement Drift), Momentum Factor, Fama-French 3-Factor 등 실제 학술 이론명 인용. 이론이 예측하는 확률적 결과 제시.
3. 뉴스형(reporter): 24시간 경제뉴스만 보는 사람. 최근 주요 언론 키워드 센티멘트 점수화, 시장 컨센서스 vs 실제 발표 괴리, 외국인/기관 포지션 변화 분석.
4. 차트형(pattern): 차트 패턴에서 운명을 보는 사람. Golden Cross/Dead Cross, Head & Shoulders, 볼린저밴드, RSI/MACD 수치, 구체적 지지선·저항선 레벨 언급.
5. 운형(chimp): 그냥 느낌으로 찍는 사람. 오늘 날씨, 아침 기분, 점심 메뉴, 꿈 내용 등 완전히 비논리적인 이유로 예측. 유머러스하게.

규칙:
- 5명 전원 같은 예측 절대 금지 (최소 2명 이상 다른 의견)
- 엑셀형/도서관형/뉴스형/차트형은 2~3문장의 구체적 근거 필수
- 매수/매도 직접 권유 금지. 암호화폐 금지. 투자 자문이 아닌 분석 관점으로.
- 운형은 재밌는 랜덤 이유로만

JSON 배열로만 응답:
[{"character":"quant","prediction":"bullish|bearish|neutral","reasoning":"근거"},{"character":"professor","prediction":"...","reasoning":"..."},{"character":"reporter","prediction":"...","reasoning":"..."},{"character":"pattern","prediction":"...","reasoning":"..."},{"character":"chimp","prediction":"...","reasoning":"오늘 [이유]라서 [예측]인 것 같아요 🎲"}]`

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

let cache: { date: string; data: unknown } | null = null

async function callGemini(prompt: string, useSearch = false): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  try {
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
    }
    if (useSearch) body.tools = [{ google_search: {} }]
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
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

  // 1. Generate question (Google Search Grounding으로 실시간 뉴스 기반)
  const qRaw = await callGemini(buildQuestionPrompt(today), true)
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
    const key = c.character as string
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
