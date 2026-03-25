import type { VoteChoice } from '@/types/vote'

export type CharacterId = 'quant' | 'professor' | 'reporter' | 'pattern' | 'chimp'

export interface CharacterHistory {
  date: string
  question: string
  prediction: VoteChoice
  isCorrect: boolean
  reasoning: string
}

export interface CharacterProfile {
  id: CharacterId
  name: string
  emoji: string
  methodology: string
  shortBio: string
  quote: string
  fullBio: string
  accuracy: { correct: number; total: number; rate: number }
  thisMonth: { correct: number; total: number; rate: number }
  history: CharacterHistory[]
}

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 'quant',
    name: '밸류김',
    emoji: '💼',
    methodology: 'PER/PBR 밸류에이션 + 수급 분석',
    shortBio: 'PER 10 이하 아니면 쳐다도 안 본다',
    quote: '숫자가 거짓말을 하냐. 사람이 거짓말을 하지.',
    fullBio: '삼성증권 애널리스트 출신. 퇴사 후 엑셀 파일 3,000개를 개인 드라이브에 쌓아두고 매일 아침 6시에 일어나 기업 실적을 정리한다. PER, PBR, EV/EBITDA가 맞지 않으면 뉴스도 안 읽는다. "감으로 하는 투자는 도박이고, 수치로 하는 투자는 확률 게임"이 좌우명.',
    accuracy: { correct: 18, total: 25, rate: 72 },
    thisMonth: { correct: 6, total: 8, rate: 75 },
    history: [
      { date: '2026-03-24', question: '파월 발언이 코스피에 호재로 작용했을까?', prediction: 'bullish', isCorrect: true, reasoning: '연준 동결 시 S&P500 평균 +1.4% 상승(최근 5회 기준). 코스피 상관계수 0.72 적용 시 +1.0% 기대.' },
      { date: '2026-03-23', question: 'LG에너지솔루션 수주 발표, 주가 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: 'PBR 2.1배로 섹터 평균 대비 15% 할인. 수주잔고 기준 EV/EBITDA 7.8배, 역대 최저.' },
      { date: '2026-03-22', question: '원/달러 환율 1,400원 돌파, 수출주에 호재?', prediction: 'bullish', isCorrect: false, reasoning: '환율 민감도 분석: 1달러당 10원 상승 시 삼성전자 EPS +2.3% 효과. 단기 호재 판단.' },
      { date: '2026-03-21', question: '코스피 2,700선, 기술적 반등 나올까?', prediction: 'neutral', isCorrect: true, reasoning: 'KOSPI PBR 0.89배, 역사적 저점 구간. 단 금리 불확실성으로 방향성 판단 유보.' },
      { date: '2026-03-20', question: '삼성바이오로직스 CMO 수주 재료, 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: 'ROE 14.2%, PEG Ratio 0.8배. 수주 단가 기준 영업이익 +8% 추정.' },
    ],
  },
  {
    id: 'professor',
    name: '팩터박',
    emoji: '📚',
    methodology: '학술 논문 기반 팩터 투자',
    shortBio: '이건 1993년 Fama가 이미 증명했어',
    quote: '시장은 단기적으로 투표 기계지만, 장기적으로는 저울이다. — 벤저민 그레이엄',
    fullBio: '서울대 경제학 박사과정. SSRN에서 논문 500편 이상을 읽었다. 주식을 시작한 계기는 Fama-French(1992) 논문을 읽다가 "어, 이거 돈이 되네?"를 깨달은 것. 투자 결정 전 반드시 근거 논문 3편 이상을 인용하는 습관이 있다. 가장 싫어하는 말은 "느낌이 좋은데".',
    accuracy: { correct: 16, total: 25, rate: 64 },
    thisMonth: { correct: 5, total: 8, rate: 63 },
    history: [
      { date: '2026-03-24', question: '파월 발언이 코스피에 호재로 작용했을까?', prediction: 'bullish', isCorrect: true, reasoning: '테일러 준칙 기준 현재 금리는 중립 수준 대비 100bp 이상 긴축. 동결 발언은 리스크 프리미엄 축소 신호.' },
      { date: '2026-03-23', question: 'LG에너지솔루션 수주 발표, 주가 호재일까?', prediction: 'neutral', isCorrect: false, reasoning: 'PEAD 모델 기준 수주 뉴스는 이미 주가에 선반영. Momentum Factor 상위 10% 구간으로 단기 되돌림 리스크.' },
      { date: '2026-03-22', question: '원/달러 환율 1,400원 돌파, 수출주에 호재?', prediction: 'neutral', isCorrect: true, reasoning: 'Lustig & Verdelhan(2007) 환율 팩터 연구: 신흥국 통화 약세 시 수출주 단기 효과는 3개월 후 평균화됨.' },
      { date: '2026-03-21', question: '코스피 2,700선, 기술적 반등 나올까?', prediction: 'bullish', isCorrect: false, reasoning: 'Mean Reversion 팩터: PBR 저점에서 12개월 내 회귀 확률 68%. Contrarian 전략 유효 구간.' },
      { date: '2026-03-20', question: '삼성바이오로직스 CMO 수주 재료, 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: 'Quality Factor: ROE 14%, 부채비율 22%, 이익 안정성 상위 5%. Novy-Marx(2013) Gross Profitability 기준 프리미엄 구간.' },
    ],
  },
  {
    id: 'reporter',
    name: '뉴스최',
    emoji: '📺',
    methodology: '뉴스 센티멘트 + 시장 컨센서스',
    shortBio: '속보 뜨기 전에 이미 친 사람',
    quote: '첫 번째 뉴스가 방향을 정하고, 두 번째 뉴스가 크기를 정한다.',
    fullBio: '전직 경제부 기자. 새벽 4시에 블룸버그 알림이 울리면 자다 일어나는 게 반사적으로 몸에 밴 사람이다. 하루 평균 뉴스 200건 모니터링. "시장은 뉴스보다 뉴스에 대한 반응을 먼저 본다"는 철학으로 센티멘트 분석을 즐긴다. 주말에도 노트북 앞에 있다.',
    accuracy: { correct: 17, total: 25, rate: 68 },
    thisMonth: { correct: 5, total: 8, rate: 63 },
    history: [
      { date: '2026-03-24', question: '파월 발언이 코스피에 호재로 작용했을까?', prediction: 'neutral', isCorrect: false, reasoning: '파월 발언 수위가 "데이터 의존"에 그침. Bloomberg 센티멘트 인덱스 변화 미미(+3점). 시장 기대치 미달.' },
      { date: '2026-03-23', question: 'LG에너지솔루션 수주 발표, 주가 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: '수주 관련 긍정 기사 비율 78%. 외국인 순매수 3일 연속. 컨센서스 EPS 추정치 +9% 상향.' },
      { date: '2026-03-22', question: '원/달러 환율 1,400원 돌파, 수출주에 호재?', prediction: 'bullish', isCorrect: false, reasoning: '경제지 헤드라인 긍정 비율 65%. "수출 경쟁력 강화" 키워드 전주 대비 3배 증가.' },
      { date: '2026-03-21', question: '코스피 2,700선, 기술적 반등 나올까?', prediction: 'neutral', isCorrect: true, reasoning: '반등/하락 전망 기사 50:50으로 혼재. 외국인 포지션 뚜렷한 방향성 없음. 관망 우세.' },
      { date: '2026-03-20', question: '삼성바이오로직스 CMO 수주 재료, 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: '수주 계약 단독 보도 후 후속 긍정 기사 12건. 기관 리포트 목표가 상향 2건. 센티멘트 +72점.' },
    ],
  },
  {
    id: 'pattern',
    name: '봉준선',
    emoji: '📐',
    methodology: '기술적 분석 (캔들/지표/패턴)',
    shortBio: '캔들 하나에서 인생의 진리를 읽어내는 사람',
    quote: '차트는 거짓말하지 않는다. 차트를 보는 사람이 거짓말한다.',
    fullBio: '증권사 HTS 단축키를 200개 이상 외우고 있다. 메인 모니터 3개에 차트만 띄워놓고 하루를 보낸다. 골든크로스와 데드크로스가 보이면 심장이 뛴다고 한다. "선은 거짓말하지 않는다"는 믿음으로 15년째 기술적 분석만 고집 중. 주변에서는 "그 선 맨날 틀리는데?"라고 하지만 들은 척도 안 한다.',
    accuracy: { correct: 15, total: 25, rate: 60 },
    thisMonth: { correct: 4, total: 8, rate: 50 },
    history: [
      { date: '2026-03-24', question: '파월 발언이 코스피에 호재로 작용했을까?', prediction: 'bearish', isCorrect: false, reasoning: '코스피 2,780 저항선(20일 이평선 + 피보나치 61.8%). MACD 히스토그램 수축. 과거 파월 발언 후 되돌림 패턴 4/5회.' },
      { date: '2026-03-23', question: 'LG에너지솔루션 수주 발표, 주가 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: '20일선 골든크로스 임박. 볼린저밴드 상단 돌파 시 추가 상승 가능. RSI 58로 과열 아님.' },
      { date: '2026-03-22', question: '원/달러 환율 1,400원 돌파, 수출주에 호재?', prediction: 'neutral', isCorrect: true, reasoning: '삼성전자 일봉 패턴: 지지선 78,000원, 저항선 82,000원. 박스권 내 횡보 가능성. RSI 중립 구간.' },
      { date: '2026-03-21', question: '코스피 2,700선, 기술적 반등 나올까?', prediction: 'bullish', isCorrect: false, reasoning: 'RSI 28 — 과매도 구간 진입. 2,680 강한 지지선(2024년 저점). 단기 기술적 반등 기대.' },
      { date: '2026-03-20', question: '삼성바이오로직스 CMO 수주 재료, 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: '컵앤핸들 패턴 완성 임박. MACD 골든크로스 발생. 거래량 전일 대비 180% 급증.' },
    ],
  },
  {
    id: 'chimp',
    name: '코인토',
    emoji: '🎲',
    methodology: '순수한 감 (근거 없음)',
    shortBio: '동전 던져서 결정, 어쩔 땐 진짜 맞힘',
    quote: '나도 왜 맞는지 모르겠어요 🎲',
    fullBio: '투자 경력 3개월. 처음엔 코인으로 시작했다가 주식으로 왔다. 분석이 뭔지 모르지만 "느낌"만큼은 자신 있다. 실제로 맞출 때가 있어서 본인도 당황한다. 적중률이 밸류김보다 낮지만 가끔 역전한다는 소문이 있다. 동전 던지기, 날씨, 꿈, 점심 메뉴가 주요 투자 지표.',
    accuracy: { correct: 13, total: 25, rate: 52 },
    thisMonth: { correct: 3, total: 8, rate: 38 },
    history: [
      { date: '2026-03-24', question: '파월 발언이 코스피에 호재로 작용했을까?', prediction: 'bullish', isCorrect: true, reasoning: '오늘 점심에 된장찌개를 먹었는데 맛있었어요. 좋은 일이 생길 것 같은 느낌? 🎲' },
      { date: '2026-03-23', question: 'LG에너지솔루션 수주 발표, 주가 호재일까?', prediction: 'bearish', isCorrect: false, reasoning: '어젯밤 꿈에서 주식 차트가 떨어지는 걸 봤어요. 그게 뭔가 의미가... 있지 않을까요? 🎲' },
      { date: '2026-03-22', question: '원/달러 환율 1,400원 돌파, 수출주에 호재?', prediction: 'neutral', isCorrect: true, reasoning: '오늘 지하철에서 아저씨가 경제신문 읽다가 졸았어요. 글쎄요? 🎲' },
      { date: '2026-03-21', question: '코스피 2,700선, 기술적 반등 나올까?', prediction: 'bearish', isCorrect: true, reasoning: '아침에 커피를 두 번 쏟았어요. 뭔가 조심해야 할 것 같은 날이에요 🎲' },
      { date: '2026-03-20', question: '삼성바이오로직스 CMO 수주 재료, 호재일까?', prediction: 'bullish', isCorrect: true, reasoning: '오늘 일어났을 때 기분이 왠지 좋았어요. 바이오 이름도 왠지 긍정적인 느낌? 🎲' },
    ],
  },
]

export function getCharacterById(id: string): CharacterProfile | undefined {
  return CHARACTER_PROFILES.find((c) => c.id === id)
}
