import { useEffect, useState } from 'react'
import styles from './WeeklyPicksSection.module.css'

interface Pick {
  ticker: string
  name: string
  trend: '상승' | '하락' | '중립'
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface CharacterPick {
  character: string
  name: string
  emoji: string
  ticker: string
  stockName: string
  reason: string
}

const FALLBACK_PICKS: Pick[] = [
  { ticker: '005930', name: '삼성전자', trend: '상승', summary: 'HBM 수주 증가 기대감. 기관 순매수 지속.', sentiment: 'positive' },
  { ticker: '000660', name: 'SK하이닉스', trend: '상승', summary: 'AI 서버 DRAM 수요 급증. 엔비디아 공급망 핵심.', sentiment: 'positive' },
  { ticker: '035420', name: 'NAVER', trend: '중립', summary: 'AI 광고 사업 성장세. 웹툰 IPO 일정 관심.', sentiment: 'neutral' },
  { ticker: '207940', name: '삼성바이오로직스', trend: '상승', summary: 'CMO 수주 잔고 역대 최대 수준.', sentiment: 'positive' },
  { ticker: '051910', name: 'LG화학', trend: '하락', summary: '배터리 소재 마진 압박 지속.', sentiment: 'negative' },
]

const FALLBACK_CHARACTER_PICKS: CharacterPick[] = [
  { character: 'quant', name: '밸류김', emoji: '💼', ticker: '005930', stockName: '삼성전자', reason: 'PER 10.8배로 섹터 평균 대비 24% 할인. 기관 순매수 5거래일 연속 지속.' },
  { character: 'professor', name: '팩터박', emoji: '📚', ticker: '000660', stockName: 'SK하이닉스', reason: 'Fama-French(1993) Size+Value Factor 동시 충족. Momentum 상위 20% 진입.' },
  { character: 'reporter', name: '뉴스최', emoji: '📺', ticker: '207940', stockName: '삼성바이오로직스', reason: '이번 주 CMO 관련 긍정 기사 비율 81%. 외국인 순매수 전환 3일째.' },
  { character: 'pattern', name: '봉준선', emoji: '📐', ticker: '035420', stockName: 'NAVER', reason: 'RSI 42 — 과매도 탈출 직전. 컵앤핸들 패턴 형성 중.' },
  { character: 'chimp', name: '코인토', emoji: '🎲', ticker: '035720', stockName: '카카오', reason: '오늘 카카오톡 답장이 빠르게 왔어요. 뭔가 좋은 신호인 것 같아요 🎲' },
]

const TREND_EMOJI: Record<string, string> = { 상승: '📈', 하락: '📉', 중립: '➡️' }

type Tab = 'market' | 'expert'

export function WeeklyPicksSection() {
  const [picks, setPicks] = useState<Pick[]>(FALLBACK_PICKS)
  const [characterPicks, setCharacterPicks] = useState<CharacterPick[]>(FALLBACK_CHARACTER_PICKS)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('market')

  useEffect(() => {
    fetch('/api/weekly-picks')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.picks)) setPicks(d.picks)
        if (Array.isArray(d.characterPicks)) setCharacterPicks(d.characterPicks)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>이번 주 주목</span>
        <span className={styles.disclaimer}>투자 자문 아님</span>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === 'market' ? styles.tabActive : ''}`}
          onClick={() => setTab('market')}
        >
          시장 동향
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'expert' ? styles.tabActive : ''}`}
          onClick={() => setTab('expert')}
        >
          전문가 추천픽
        </button>
      </div>

      <div className={styles.scroll}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeleton}`} />
            ))
          : tab === 'market'
            ? picks.map((pick) => (
                <div key={pick.ticker} className={`${styles.card} ${styles[pick.sentiment]}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.ticker}>{pick.ticker}</span>
                    <span className={styles.trend}>{TREND_EMOJI[pick.trend]} {pick.trend}</span>
                  </div>
                  <div className={styles.name}>{pick.name}</div>
                  <p className={styles.summary}>{pick.summary}</p>
                </div>
              ))
            : characterPicks.map((cp) => (
                <div key={cp.character} className={`${styles.card} ${styles.expertCard}`}>
                  <div className={styles.expertHeader}>
                    <span className={styles.expertEmoji}>{cp.emoji}</span>
                    <span className={styles.expertName}>{cp.name}</span>
                  </div>
                  <div className={styles.expertStock}>{cp.stockName}</div>
                  <div className={styles.expertTicker}>{cp.ticker}</div>
                  <p className={styles.summary}>{cp.reason}</p>
                </div>
              ))}
      </div>
    </section>
  )
}
