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
        토스 유저 <b>{totalVotes.toLocaleString()}명</b> 투표
      </div>

      <div
        className={styles.barWrap}
        role="img"
        aria-label={`호재 ${bullish}%, 글쎄 ${neutral}%, 악재 ${bearish}%`}
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
          호재 {bullish}%
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.neutralDot}`} />
          글쎄 {neutral}%
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.bearishDot}`} />
          악재 {bearish}%
        </span>
      </div>
    </div>
  )
}
