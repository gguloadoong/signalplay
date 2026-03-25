import { useState } from 'react'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import type { CharacterPrediction, VoteChoice } from '@/types/vote'
import styles from './CharacterCard.module.css'

const PREDICTION_LABELS: Record<VoteChoice, string> = {
  bullish: '올라갈 듯 📈',
  bearish: '망할 듯 📉',
  neutral: '모르겠는데 🤷',
}

const PREDICTION_COLORS: Record<VoteChoice, 'green' | 'red' | 'yellow'> = {
  bullish: 'green',
  bearish: 'red',
  neutral: 'yellow',
}

interface Props {
  prediction: CharacterPrediction
  isCorrect?: boolean
  showCorrect?: boolean
}

export function CharacterCard({ prediction, isCorrect, showCorrect = false }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`${styles.card} ${styles[prediction.character]}`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={() => setExpanded((v) => !v)}
      onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <span className={`${styles.emoji} tossface`}>{prediction.emoji}</span>
          <div className={styles.nameWrap}>
            <span className={styles.name}>{prediction.name}</span>
            <span className={styles.methodology}>{prediction.methodology}</span>
          </div>
        </div>
        <div className={styles.right}>
          {showCorrect && (
            <span className={styles.correctIcon}>{isCorrect ? '✅' : '❌'}</span>
          )}
          <Badge
            size="small"
            variant="fill"
            color={PREDICTION_COLORS[prediction.prediction]}
          >
            {PREDICTION_LABELS[prediction.prediction]}
          </Badge>
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      <div className={`${styles.reasoningWrap} ${expanded ? styles.expanded : ''}`}>
        <p className={styles.reasoning}>{prediction.reasoning}</p>
      </div>
    </div>
  )
}
