import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_supabase'

// 프롬프트와 메타데이터를 인라인 (Vercel Serverless에서 src/ import 불가)
const CHARACTER_META: Record<string, { name: string; emoji: string; methodology: string }> = {
  quant: { name: '밸류김', emoji: '💼', methodology: 'PER/PBR 밸류에이션 + 수급 분석' },
  professor: { name: '팩터박', emoji: '📚', methodology: '학술 논문 기반 팩터 투자' },
  reporter: { name: '뉴스최', emoji: '📺', methodology: '뉴스 센티멘트 + 시장 컨센서스' },
  pattern: { name: '봉준선', emoji: '📐', methodology: '기술적 분석 (캔들/지표/패턴)' },
  chimp: { name: '코인토', emoji: '🎲', methodology: '순수한 감 (근거 없음)' },
}

const buildQuestionPrompt = (today: string) =>
  `당신은 투자 뉴스 편집자입니다. 오늘(${today}) 실제 발생한 주요 경제/주식 뉴스를 검색하여, 투자자들의 의견이 갈릴 만한 질문 1개를 만들어주세요.
좋은 질문: 오늘 실제 보도된 구체적 종목/이벤트 기반, 호재/악재 의견 갈림.
나쁜 질문: 추상적, 암호화폐 관련, 오래된 이슈.
JSON으로만 응답: {"title":"이슈 제목(15자)","question":"투표 질문(25자, ~일까?)","category":"종목|지수|매크로"}`

const CHARACTER_PROMPT = `당신은 방구석 투자 전문가 5명입니다. 각자의 방식으로 아래 질문을 분석합니다.

질문: {QUESTION_TITLE} — {QUESTION_TEXT}

각 캐릭터는 아래 지침대로 분석하세요:

1. 밸류김(quant) — 삼성증권 애널리스트 출신 밸류에이션 전문가
   - PER, PBR, EV/EBITDA 추정 수치를 섹터 평균과 비교 (예: "PER 11.2배, 섹터 평균 14.8배 대비 24% 할인")
   - 최근 3분기 EPS 컨센서스 변화 방향 + 기관/외국인 수급 동향 (거래일, 순매수 규모 추정)
   - 결론: 밸류에이션 + 수급이 함께 방향을 가리키는지 판단
   - 말투: 건조하고 단호. "숫자가 말한다" 류

2. 팩터박(professor) — 서울대 경제학 박사과정, 논문 500편 독파
   - 반드시 실제 학술 논문 1편 인용 (저자명+연도+이론명, 예: "Fama-French(1993) Size Factor")
   - 해당 이론이 이 상황에 어떻게 적용되는지 설명 + 이론이 예측하는 확률적 결과 (예: "68% 확률로 12개월 내 회귀")
   - 팩터 간 상충 요소가 있다면 반드시 언급
   - 말투: 학문적, "~연구에 따르면" 류

3. 뉴스최(reporter) — 전직 경제부 기자, 하루 뉴스 200건 모니터링
   - 최근 7일 언론 센티멘트 스코어 추정 (0~100점 척도)
   - 시장 컨센서스 EPS 추정치 변화율 (예: "+9% 상향") + 외국인 포지션 방향 전환 여부
   - 주요 언론 헤드라인 키워드 증감 (예: "부정 키워드 전주 대비 2배 증가")
   - 말투: 빠르고 단편적. "속보처럼" 스타일

4. 봉준선(pattern) — 차트 15년 경력, HTS 단축키 200개 암기
   - RSI 수치 명시 (예: "RSI 71.3 — 과매수 진입") + MACD 히스토그램 방향
   - 구체적 지지선·저항선 가격 레벨 (예: "8만 2천원 저항, 7만 8천원 지지")
   - 과거 유사 패턴 사례 인용 (예: "직전 3회 실적발표일 평균 -1.8%")
   - 말투: 확신에 차 있지만 가끔 틀림. "선은 거짓말 안 해" 류

5. 코인토(chimp) — 투자 경력 3개월, 완전 감으로 운영
   - 아래 에피소드 카테고리 중 하나를 골라 구체적이고 황당한 연결 논리로 예측
     * 숫자 징조: 영수증 금액·버스 번호·엘리베이터 층수에서 종목 번호 연상
     * 꿈/직감: 어젯밤 꿈 내용, 아침에 든 이유 없는 확신, 왠지 모를 불안감
     * 음식/날씨: 점심 메뉴가 주가 색과 같음, 오늘 날씨가 "딱 호재 날씨"
     * 앱/알림: 유튜브 알고리즘이 갑자기 관련 영상 추천, 뉴스 알림 타이밍
     * 반려동물/주변인: 고양이가 쳐다봄, 친구가 모르고 그 종목 얘기함
   - 에피소드 → 예측 연결 논리가 완전히 억지이지만 "이건 분명히 시그널"이라고 확신
   - 자기도 근거 없다는 걸 알지만 이번만큼은 100% 확신하는 척
   - 말투: 순진하고 귀엽게, 흥분된 어조. 문장 끝에 🎲

규칙:
- 5명 전원 동일 예측 절대 금지 (반드시 2명 이상 다른 의견)
- 밸류김/팩터박/뉴스최/봉준선은 2~3문장, 실제 수치 포함 필수
- 매수/매도 직접 권유 금지, 암호화폐 금지, 투자 자문 아님 명시 불필요
- 코인토 reasoning에는 반드시 🎲 포함

JSON 배열로만 응답 (다른 텍스트 없이):
[{"character":"quant","prediction":"bullish|bearish|neutral","reasoning":"..."},{"character":"professor","prediction":"...","reasoning":"..."},{"character":"reporter","prediction":"...","reasoning":"..."},{"character":"pattern","prediction":"...","reasoning":"..."},{"character":"chimp","prediction":"...","reasoning":"오늘 [구체적 일상 에피소드] — 이건 분명히 [예측] 시그널인 것 같아요! 🎲"}]`

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const API_CONFIG = {
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  temperature: 0.8,
  maxOutputTokens: 8192,
  timeoutMs: 15000,
}

let cache: { date: string; data: unknown } | null = null

async function callGemini(prompt: string, useSearch = false): Promise<string | null> {
  if (!GEMINI_API_KEY) return null
  try {
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: API_CONFIG.temperature, maxOutputTokens: API_CONFIG.maxOutputTokens },
    }
    if (useSearch) body.tools = [{ google_search: {} }]
    const res = await fetch(`${API_CONFIG.url}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(API_CONFIG.timeoutMs),
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

  // 0. Supabase 캐시 확인 — 오늘 데이터가 이미 있으면 즉시 반환
  const supabase = getSupabase()
  if (supabase) {
    const { data: existing } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('date', today)
      .single()
    if (existing) {
      const { data: voteData } = await supabase
        .from('user_votes')
        .select('prediction')
        .eq('question_id', existing.id)
      const totalVotes = voteData?.length ?? 0
      const cached = {
        id: existing.id,
        date: existing.date,
        title: existing.title,
        question: existing.question,
        category: existing.category,
        characters: existing.character_predictions ?? [],
        totalVotes,
        deadline: existing.deadline,
        isActive: new Date() < new Date(existing.deadline),
      }
      cache = { date: today, data: cached }
      return res.status(200).json(cached)
    }
  }

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
      { character: 'quant', prediction: 'bullish', reasoning: '현재 PER 10.8배로 섹터 평균(14.2배) 대비 24% 할인. 최근 3분기 EPS 컨센서스 연속 상향 조정 중이며 기관 순매수 5거래일 연속 +700억 이상. 밸류에이션·수급 모두 긍정적.' },
      { character: 'professor', prediction: 'neutral', reasoning: 'Bernard & Thomas(1989) PEAD 모델 기준, 기대치 충분히 반영된 종목의 실적 서프라이즈 효과는 평균 20거래일 이후 소멸. Fama-French Momentum Factor 상위 10% 구간 진입으로 단기 되돌림 확률 공존.' },
      { character: 'reporter', prediction: 'bullish', reasoning: '최근 7일 언론 센티멘트 스코어 +71점. 외국인 포지션 순매도→순매수 전환(3주 만). 컨센서스 EPS 추정치 발표 2주 전 기준 +11% 상향 조정.' },
      { character: 'pattern', prediction: 'bearish', reasoning: 'RSI 72.1 — 과매수 구간 진입. 직전 3회 동일 이벤트 후 발표 당일 평균 -1.8% 되돌림 패턴. MACD 히스토그램 수축 중, 8만 2천원 저항선 돌파 실패 시 단기 조정 가능.' },
      { character: 'chimp', prediction: 'bullish', reasoning: '오늘 아침 편의점 영수증이 7,777원이었어요. 숫자가 네 개 다 똑같으면 무조건 좋은 거 아닌가요? 🎲' },
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

  // Supabase upsert — 환경변수 설정 시 활성화
  if (supabase) {
    await supabase.from('daily_questions').upsert({
      id: response.id,
      date: today,
      title: question.title,
      question: question.question,
      category: question.category,
      deadline: response.deadline,
      character_predictions: enrichedCharacters,
    }, { onConflict: 'date' }).select()
  }

  return res.status(200).json(response)
}
