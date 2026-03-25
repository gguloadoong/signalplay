import type { CrowdResult } from '@/types/vote'
import styles from './CrowdBar.module.css'

interface Props {
  result: CrowdResult
  animated?: boolean
}

export function CrowdBar({ result, animated = true }: Props) {
  const { bullish, neutral, bearish, totalVotes } = result

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        지금까지 <b>{totalVotes.toLocaleString()}명</b> 참전 ⚔️
      </div>

      <div
        className={styles.barWrap}
        role="img"
        aria-label={`올라갈 듯 ${bullish}%, 모르겠는데 ${neutral}%, 망할 듯 ${bearish}%`}
      >
        <div
          className={`${styles.segment} ${styles.bullish} ${animated ? styles.animated : ''}`}
          style={{ width: `${bullish}%` }}
          aria-hidden="true"
        />
        <div
          className={`${styles.segment} ${styles.neutral} ${animated ? styles.animated : ''}`}
          style={{ width: `${neutral}%` }}
          aria-hidden="true"
        />
        <div
          className={`${styles.segment} ${styles.bearish} ${animated ? styles.animated : ''}`}
          style={{ width: `${bearish}%` }}
          aria-hidden="true"
        />
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.bullishDot}`} />
          📈 {bullish}%
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.neutralDot}`} />
          🤷 {neutral}%
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.bearishDot}`} />
          📉 {bearish}%
        </span>
      </div>
    </div>
  )
}
