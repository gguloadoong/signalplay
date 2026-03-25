import { useEffect, useState } from 'react'
import styles from './WeeklyPicksSection.module.css'

interface Pick {
  ticker: string
  name: string
  trend: '상승' | '하락' | '중립'
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

const FALLBACK_PICKS: Pick[] = [
  { ticker: '005930', name: '삼성전자', trend: '상승', summary: 'HBM 수주 증가 기대감. 기관 순매수 지속.', sentiment: 'positive' },
  { ticker: '000660', name: 'SK하이닉스', trend: '상승', summary: 'AI 서버 DRAM 수요 급증. 엔비디아 공급망 핵심.', sentiment: 'positive' },
  { ticker: '035420', name: 'NAVER', trend: '중립', summary: 'AI 광고 사업 성장세. 웹툰 IPO 일정 관심.', sentiment: 'neutral' },
  { ticker: '207940', name: '삼성바이오로직스', trend: '상승', summary: 'CMO 수주 잔고 역대 최대 수준.', sentiment: 'positive' },
  { ticker: '051910', name: 'LG화학', trend: '하락', summary: '배터리 소재 마진 압박 지속.', sentiment: 'negative' },
]

const TREND_EMOJI: Record<string, string> = { 상승: '📈', 하락: '📉', 중립: '➡️' }
const SENTIMENT_COLOR: Record<string, string> = { positive: 'positive', negative: 'negative', neutral: 'neutral' }

export function WeeklyPicksSection() {
  const [picks, setPicks] = useState<Pick[]>(FALLBACK_PICKS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-picks')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.picks)) setPicks(d.picks) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>이번 주 주목 동향</span>
        <span className={styles.disclaimer}>투자 자문 아님</span>
      </div>
      <div className={styles.scroll}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeleton}`} />
            ))
          : picks.map((pick) => (
              <div key={pick.ticker} className={`${styles.card} ${styles[SENTIMENT_COLOR[pick.sentiment]]}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.ticker}>{pick.ticker}</span>
                  <span className={styles.trend}>{TREND_EMOJI[pick.trend]} {pick.trend}</span>
                </div>
                <div className={styles.name}>{pick.name}</div>
                <p className={styles.summary}>{pick.summary}</p>
              </div>
            ))}
      </div>
    </section>
  )
}
