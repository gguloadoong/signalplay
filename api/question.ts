import type { VercelRequest, VercelResponse } from '@vercel/node'

// 프롬프트와 메타데이터를 인라인 (Vercel Serverless에서 src/ import 불가)
const CHARACTER_META: Record<string, { name: string; emoji: string; methodology: string }> = {
  quant: { name: '퀀트봇', emoji: '📊', methodology: '기술적 분석' },
  professor: { name: '논문쟁이', emoji: '🎓', methodology: '학술 논문' },
  reporter: { name: '속보왕', emoji: '📰', methodology: '뉴스 센티멘트' },
  pattern: { name: '패턴술사', emoji: '🔮', methodology: '패턴 매칭' },
  chimp: { name: '다트침팬지', emoji: '🐵', methodology: '다트 던지기' },
}

const QUESTION_PROMPT = `당신은 투자 뉴스 편집자입니다. 오늘의 주요 경제/주식 이슈 중에서 투자자들의 의견이 갈릴 만한 질문 1개를 만들어주세요.
좋은 질문: 구체적 종목/이벤트 기반, 호재/악재 의견 갈림, 오늘/이번 주 실제 이벤트.
나쁜 질문: 추상적, 암호화폐 관련.
JSON으로만 응답: {"title":"이슈 제목(15자)","question":"투표 질문(25자, ~일까?)","category":"종목|지수|매크로"}`

const CHARACTER_PROMPT = `당신은 5명의 AI 투자 점쟁이입니다. 질문에 대해 각자 방법론으로 예측합니다.
질문: {QUESTION_TITLE} — {QUESTION_TEXT}
캐릭터: 1.퀀트봇(기술적분석) 2.논문쟁이(학술논문/행동경제학) 3.속보왕(뉴스센티멘트) 4.패턴술사(과거패턴매칭) 5.다트침팬지(랜덤)
규칙: 5명 전원 같은 예측 금지(최소 2명 다른 의견). 근거 1~2문장 필수(침팬지 제외). 매수/매도 추천 금지. 암호화폐 금지.
JSON 배열로만 응답: [{"character":"quant","prediction":"bullish|bearish|neutral","reasoning":"근거"},{"character":"professor",...},{"character":"reporter",...},{"character":"pattern",...},{"character":"chimp","prediction":"...","reasoning":"🎯 다트가 [호재/악재/글쎄]에 꽂혔어요!"}]`

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
