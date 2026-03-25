import type { Question, CharacterPrediction, CrowdResult, VoteResult } from '@/types/vote'

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

function todayDeadline(hour: number, min: number): string {
  const d = new Date()
  d.setHours(hour, min, 0, 0)
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1)
  return d.toISOString()
}

export const MOCK_TODAY_QUESTION: Question = {
  id: `question-${today}`,
  date: today,
  title: '삼성전자 1분기 실적 발표',
  question: '이번 분기 실적, 삼성전자 주가 올라갈까 내려갈까?',
  category: '종목',
  totalVotes: 4821,
  deadline: todayDeadline(15, 30),
  isActive: true,
}

export const MOCK_CHARACTER_PREDICTIONS: CharacterPrediction[] = [
  {
    character: 'quant',
    name: '엑셀형',
    emoji: '💼',
    prediction: 'bullish',
    reasoning: '현재 PER 11.2배로 반도체 섹터 평균(14.8배) 대비 24% 할인. 최근 3분기 연속 EPS 컨센서스 상향 조정 중이며, 기관 순매수가 5거래일 연속 +800억 이상 유지. 밸류에이션 + 수급 모두 긍정적.',
    methodology: 'PER/PBR 수치 분석',
  },
  {
    character: 'professor',
    name: '도서관형',
    emoji: '📚',
    prediction: 'neutral',
    reasoning: 'Bernard & Thomas(1989) PEAD 모델 기준, 실적 서프라이즈 발생 시 60거래일간 초과 수익이 나타나지만 현재는 이미 주가에 기대치가 반영된 상태. Fama-French Momentum Factor 기준 최근 12개월 수익률이 상위 10%에 진입해 단기 되돌림 확률도 공존.',
    methodology: '학술 이론 적용',
  },
  {
    character: 'reporter',
    name: '뉴스형',
    emoji: '📺',
    prediction: 'bullish',
    reasoning: '최근 7일 국내 주요 언론 센티멘트 스코어 +68점(100점 만점). 외국인 투자자 포지션이 3주 만에 순매도→순매수로 전환. 시장 컨센서스 영업이익 추정치가 발표 2주 전 기준 +12% 상향 조정.',
    methodology: '뉴스 센티멘트',
  },
  {
    character: 'pattern',
    name: '차트형',
    emoji: '📐',
    prediction: 'bearish',
    reasoning: '일봉 기준 RSI 71.3으로 과매수 구간 진입. 직전 3번의 실적 발표일 패턴 분석 결과 기대치 충족 시에도 발표 당일 평균 -1.8% 하락("소문에 사고 뉴스에 팔기"). 현재 저항선 8만 2천원대 돌파 실패 시 단기 조정 가능성.',
    methodology: '기술적 패턴',
  },
  {
    character: 'chimp',
    name: '운형',
    emoji: '🎲',
    prediction: 'neutral',
    reasoning: '오늘 아침 지하철에서 아저씨가 경제신문 읽다가 졸았어요. 나쁘지 않은 신호 아님? 모르겠다 🎲',
    methodology: '순수한 감',
  },
]

export const MOCK_CROWD_RESULT: CrowdResult = {
  bullish: 58,
  bearish: 27,
  neutral: 15,
  totalVotes: 4821,
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
      name: '엑셀형',
      emoji: '💼',
      prediction: 'bullish',
      reasoning: '연준 동결 시 S&P500 평균 +1.4% 상승(최근 5회 기준). 코스피 상관계수 0.72 적용 시 +1.0% 기대. 외국인 선물 포지션도 순매수로 전환.',
      methodology: 'PER/PBR 수치 분석',
      isCorrect: true,
    },
    {
      character: 'professor',
      name: '도서관형',
      emoji: '📚',
      prediction: 'bullish',
      reasoning: '테일러 준칙(Taylor Rule) 기준 현재 금리는 중립 수준(2.5%) 대비 100bp 이상 높은 긴축 구간. 동결 발언은 실질적 완화 신호로, 리스크 프리미엄 축소 → 주가 재평가 기대.',
      methodology: '학술 이론 적용',
      isCorrect: true,
    },
    {
      character: 'reporter',
      name: '뉴스형',
      emoji: '📺',
      prediction: 'neutral',
      reasoning: '파월 발언의 실제 수위가 "인하 검토"가 아닌 "데이터 의존"에 그침. Bloomberg 센티멘트 인덱스 발언 전후 변화 미미(+3점). 시장이 기대한 완화 메시지 미달.',
      methodology: '뉴스 센티멘트',
      isCorrect: false,
    },
    {
      character: 'pattern',
      name: '차트형',
      emoji: '📐',
      prediction: 'bearish',
      reasoning: '코스피 2,780 저항선(20일 이평선 + 피보나치 61.8% 레벨 겹침). 파월 발언 후 5회 중 4회 당일 고점 형성 후 되돌림 패턴. MACD 히스토그램 수축 중.',
      methodology: '기술적 패턴',
      isCorrect: false,
    },
    {
      character: 'chimp',
      name: '운형',
      emoji: '🎲',
      prediction: 'bullish',
      reasoning: '오늘 점심에 된장찌개를 먹었는데 진짜 맛있었음. 이런 날은 주식도 올라가야 정상 아님? 🎲',
      methodology: '순수한 감',
      isCorrect: true,
    },
  ],
  aiComment: '62%가 올라갈 거라 찍었는데 진짜 코스피 +1.1% 올랐음 👏 엑셀형·도서관형 빙고, 운형도 감으로 맞혀버림 🎲🎯',
}

export const MOCK_CHARACTER_ACCURACY = [
  { character: 'quant', name: '엑셀형', emoji: '💼', correct: 18, total: 25, rate: 72 },
  { character: 'reporter', name: '뉴스형', emoji: '📺', correct: 17, total: 25, rate: 68 },
  { character: 'professor', name: '도서관형', emoji: '📚', correct: 16, total: 25, rate: 64 },
  { character: 'pattern', name: '차트형', emoji: '📐', correct: 15, total: 25, rate: 60 },
  { character: 'chimp', name: '운형', emoji: '🎲', correct: 13, total: 25, rate: 52 },
]
