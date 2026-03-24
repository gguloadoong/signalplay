import type { Battle, BattleResult, CrowdSentiment, UserStats } from '@/types/signal'
import type { Question, CharacterPrediction, CrowdResult, VoteResult } from '@/types/vote'

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

/** 오늘 15:30 KST를 UTC로 (마감 시간) */
function todayDeadline(hour: number, min: number): string {
  const d = new Date()
  d.setHours(hour, min, 0, 0)
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
  return d.toISOString()
}

// ─── Legacy battle mock data (kept for backward compat) ───────────────────────

export const MOCK_BATTLES: Battle[] = [
  {
    id: `morning-${today}`,
    type: 'morning',
    date: today,
    signals: [
      {
        index: 0,
        title: '연준 금리 동결 시사 발언',
        summary: '파월 의장이 상반기 금리 동결 가능성을 시사. 과거 유사 발언 후 나스닥 평균 +1.2% 상승.',
        category: 'macro',
      },
      {
        index: 1,
        title: '반도체 수출 3개월 연속 증가',
        summary: '산업부 발표, 3월 반도체 수출 전년 대비 +23.4%. DRAM 가격 회복세 뚜렷.',
        category: 'sector',
      },
      {
        index: 2,
        title: '중국 PMI 예상치 하회',
        summary: '3월 제조업 PMI 49.2로 위축 국면 재진입. 시장 예상 50.1 대비 하회.',
        category: 'global',
      },
    ],
    deadline: todayDeadline(15, 30),
    resultTime: todayDeadline(15, 30),
    isActive: true,
    isResultReady: false,
  },
  {
    id: `flash-${today}-1`,
    type: 'flash',
    date: today,
    signals: [
      {
        index: 0,
        title: '한은 기준금리 동결 발표',
        summary: '시장 예상대로 동결. 총재 "물가 안정세 확인 시 인하 검토" 발언에 주목.',
        category: 'macro',
      },
    ],
    deadline: todayDeadline(13, 0),
    resultTime: todayDeadline(14, 30),
    isActive: true,
    isResultReady: false,
  },
]

export const MOCK_YESTERDAY_RESULTS: BattleResult[] = [
  {
    signalIndex: 0,
    myPrediction: 'bullish',
    myConfidence: 3,
    actualResult: 'bullish',
    isCorrect: true,
    score: 30,
    resultComment: '코스피 +1.2% 상승. 외국인 매수세 유입이 주요 원인.',
  },
  {
    signalIndex: 1,
    myPrediction: 'bullish',
    myConfidence: 2,
    actualResult: 'bullish',
    isCorrect: true,
    score: 20,
    resultComment: '삼성전자 +2.3%, SK하이닉스 +3.1%. HBM 기대감 반영.',
  },
  {
    signalIndex: 2,
    myPrediction: 'bearish',
    myConfidence: 3,
    actualResult: 'neutral',
    isCorrect: false,
    score: -10,
    resultComment: '코스피 영향 제한적. 이미 시장에 선반영된 것으로 분석.',
  },
]

export const MOCK_YESTERDAY_SIGNALS = [
  '연준 금리 동결 시사 발언',
  '반도체 수출 3개월 연속 증가',
  '중국 PMI 예상치 하회',
]

export const MOCK_CROWD: CrowdSentiment[] = [
  { signalIndex: 0, bullish: 68, bearish: 22, neutral: 10 },
  { signalIndex: 1, bullish: 74, bearish: 12, neutral: 14 },
  { signalIndex: 2, bullish: 15, bearish: 63, neutral: 22 },
]

export const MOCK_USER_STATS: UserStats = {
  totalScore: 290,
  currentStreak: 7,
  maxStreak: 14,
  totalPlays: 21,
  weeklyRank: 8,
  accuracy: 71,
}

export const MOCK_RANKING = [
  { rank: 1, name: '시그널마스터', score: 480, accuracy: 82, streak: 14 },
  { rank: 2, name: '불곰사냥꾼', score: 445, accuracy: 78, streak: 11 },
  { rank: 3, name: '예측의신', score: 420, accuracy: 76, streak: 9 },
  { rank: 4, name: '경제덕후', score: 380, accuracy: 72, streak: 8 },
  { rank: 5, name: '투자초보탈출', score: 350, accuracy: 70, streak: 12 },
  { rank: 6, name: '뉴스읽는곰', score: 330, accuracy: 68, streak: 6 },
  { rank: 7, name: '차트분석가', score: 310, accuracy: 66, streak: 5 },
  { rank: 8, name: '나', score: 290, accuracy: 71, streak: 7, isMe: true },
  { rank: 9, name: '시장관찰자', score: 270, accuracy: 64, streak: 4 },
  { rank: 10, name: '데일리체커', score: 250, accuracy: 62, streak: 3 },
]

export const MOCK_FEED = [
  {
    id: 'debate-1',
    type: 'debate' as const,
    title: '반도체 사이클, 진짜 바닥 찍었나?',
    bullishView: '강세론 AI: DRAM 가격 3개월 연속 상승, HBM 수요 폭발. 하반기 실적 턴어라운드 확실.',
    bearishView: '약세론 AI: 중국 수요 회복 미확인. 재고 소진 속도 둔화 중. 과도한 기대 경계.',
    timestamp: '2시간 전',
  },
  {
    id: 'insight-1',
    type: 'insight' as const,
    title: 'AI 주간 전망',
    content: '이번 주 주목 이벤트: 미국 CPI 발표(수), 한국 GDP 속보치(목). 변동성 확대 구간 예상. 코스피 2,750~2,850 박스권 전망.',
    category: '매크로',
    timestamp: '3시간 전',
  },
  {
    id: 'news-1',
    type: 'news' as const,
    title: '한은 총재 "물가 안정세 확인 시 금리 인하 검토"',
    aiComment: 'AI 해석: 시장은 6월 인하를 기대하기 시작할 수 있으나, 조건부 발언이므로 과도한 기대는 경계. 채권 시장 반응 주목.',
    source: '한국은행',
    timestamp: '5시간 전',
  },
  {
    id: 'debate-2',
    type: 'debate' as const,
    title: '원달러 환율 1,300원 붕괴 가능성',
    bullishView: '강세론 AI: 미국 금리 인하 기대감 + 한국 수출 호조로 원화 강세 전환 가능.',
    bearishView: '약세론 AI: 지정학 리스크 + 중동 불안으로 안전자산 선호. 달러 강세 지속 전망.',
    timestamp: '6시간 전',
  },
  {
    id: 'news-2',
    type: 'news' as const,
    title: '테슬라 1분기 실적 예상치 상회, 시간외 +8%',
    aiComment: 'AI 해석: 에너지 사업 성장이 자동차 판매 부진을 상쇄. 국내 2차전지 관련주에 간접 수혜 기대되나, 이미 선반영 가능성도 존재.',
    source: 'Reuters',
    timestamp: '8시간 전',
  },
  {
    id: 'insight-2',
    type: 'insight' as const,
    title: '섹터 로테이션 시그널 감지',
    content: '최근 5거래일 기관 순매수 흐름: 반도체(+2,100억) → 바이오(-800억) → 금융(+450억). AI 기반 분석 결과, 반도체→금융 로테이션 초기 신호.',
    category: '섹터',
    timestamp: '10시간 전',
  },
]

export type FeedItem = (typeof MOCK_FEED)[number]

// ─── Vote mock data ────────────────────────────────────────────────────────────

export const MOCK_TODAY_QUESTION: Question = {
  id: `question-${today}`,
  date: today,
  title: '삼성전자 1분기 실적 발표',
  question: '이번 분기 실적, 삼성전자 주가에 호재일까?',
  category: '종목',
  totalVotes: 4821,
  deadline: todayDeadline(15, 30),
  isActive: true,
}

export const MOCK_CHARACTER_PREDICTIONS: CharacterPrediction[] = [
  {
    character: 'quant',
    name: '퀀트봇',
    emoji: '📊',
    prediction: 'bullish',
    reasoning: '최근 3개월 EPS 상향 조정 빈도가 역대 최고 수준. 기관 순매수 신호 지속.',
    methodology: '기술적 분석',
  },
  {
    character: 'professor',
    name: '논문쟁이',
    emoji: '🎓',
    prediction: 'neutral',
    reasoning: '반도체 사이클 논문 기준 현재는 중간 회복 국면. 큰 방향 전환은 2분기 이후.',
    methodology: '학술 논문',
  },
  {
    character: 'reporter',
    name: '속보왕',
    emoji: '📰',
    prediction: 'bullish',
    reasoning: '업계 소식통 3곳 모두 HBM 수주 증가 전망. 공식 발표 전 선반영 가능성.',
    methodology: '뉴스 센티멘트',
  },
  {
    character: 'pattern',
    name: '패턴술사',
    emoji: '🔮',
    prediction: 'bearish',
    reasoning: '과거 5년 실적 발표 당일 패턴: 기대치 충족해도 -1~2% "소문에 사고 뉴스에 팔기".',
    methodology: '패턴 매칭',
  },
  {
    character: 'chimp',
    name: '다트침팬지',
    emoji: '🐵',
    prediction: 'neutral',
    reasoning: '🎯 다트가 글쎄에 꽂혔어요! (근거: 없음)',
    methodology: '다트 던지기',
  },
]

export const MOCK_CROWD_RESULT: CrowdResult = {
  bullish: 58,
  bearish: 27,
  neutral: 15,
  totalVotes: 4821,
}

export const MOCK_YESTERDAY_QUESTION: Question = {
  id: `question-${yesterday}`,
  date: yesterday,
  title: '연준 파월 의장 발언',
  question: '파월 발언이 코스피에 호재로 작용했을까?',
  category: '매크로',
  totalVotes: 6203,
  deadline: new Date(Date.now() - 86400000).toISOString(),
  isActive: false,
}

export const MOCK_VOTE_RESULT: VoteResult = {
  questionId: `question-${yesterday}`,
  title: '파월 발언이 코스피에 호재로 작용했을까?',
  actualOutcome: 'bullish',
  crowdResult: {
    bullish: 62,
    bearish: 25,
    neutral: 13,
    totalVotes: 6203,
  },
  characters: [
    {
      character: 'quant',
      name: '퀀트봇',
      emoji: '📊',
      prediction: 'bullish',
      reasoning: '금리 동결 시 역사적으로 나스닥·코스피 동반 상승.',
      methodology: '기술적 분석',
      isCorrect: true,
    },
    {
      character: 'professor',
      name: '논문쟁이',
      emoji: '🎓',
      prediction: 'bullish',
      reasoning: '테일러 준칙 모델상 현재 금리는 중립 수준 이상. 동결 발언은 완화 신호.',
      methodology: '학술 논문',
      isCorrect: true,
    },
    {
      character: 'reporter',
      name: '속보왕',
      emoji: '📰',
      prediction: 'neutral',
      reasoning: '발언 수위가 예상보다 덜 완화적. 시장 반응 제한적일 것.',
      methodology: '뉴스 센티멘트',
      isCorrect: false,
    },
    {
      character: 'pattern',
      name: '패턴술사',
      emoji: '🔮',
      prediction: 'bearish',
      reasoning: '파월 발언 후 단기 차익실현 패턴 반복.',
      methodology: '패턴 매칭',
      isCorrect: false,
    },
    {
      character: 'chimp',
      name: '다트침팬지',
      emoji: '🐵',
      prediction: 'bullish',
      reasoning: '🎯 다트가 호재에 꽂혔어요! (근거: 없음)',
      methodology: '다트 던지기',
      isCorrect: true,
    },
  ],
  aiComment: '군중의 62%가 호재를 예상했고 실제로도 코스피 +1.1% 상승했습니다. 퀀트봇과 논문쟁이가 정확하게 맞혔네요. 침팬지도 이번엔 운 좋게 적중!',
}

export const MOCK_CHARACTER_ACCURACY = [
  { character: 'quant', name: '퀀트봇', emoji: '📊', correct: 18, total: 25, rate: 72 },
  { character: 'reporter', name: '속보왕', emoji: '📰', correct: 17, total: 25, rate: 68 },
  { character: 'professor', name: '논문쟁이', emoji: '🎓', correct: 16, total: 25, rate: 64 },
  { character: 'pattern', name: '패턴술사', emoji: '🔮', correct: 15, total: 25, rate: 60 },
  { character: 'chimp', name: '다트침팬지', emoji: '🐵', correct: 13, total: 25, rate: 52 },
]
