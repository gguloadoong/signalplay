import { useState } from 'react'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { showRewardAd } from '@/lib/bedrock'
import type { CharacterPrediction, VoteChoice } from '@/types/vote'
import styles from './CharacterCard.module.css'

const PREDICTION_LABELS: Record<VoteChoice, string> = {
  bullish: '호재',
  bearish: '악재',
  neutral: '글쎄',
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
  const [unlocked, setUnlocked] = useState(false)
  const [adLoading, setAdLoading] = useState(false)

  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (unlocked || adLoading) return
    setAdLoading(true)
    try {
      const result = await showRewardAd()
      if (result.completed) setUnlocked(true)
    } finally {
      setAdLoading(false)
    }
  }

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
          <span className={styles.emoji}>{prediction.emoji}</span>
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
        <div className={`${styles.reasoningContent} ${expanded && !unlocked ? styles.gated : ''}`}>
          <p className={styles.reasoning}>{prediction.reasoning}</p>
          {expanded && !unlocked && <div className={styles.blurOverlay} />}
        </div>

        {expanded && !unlocked && (
          <button
            className={styles.unlockBtn}
            onClick={handleUnlock}
            disabled={adLoading}
            aria-label="광고 시청 후 전체 분석 보기"
          >
            {adLoading ? '광고 로딩 중...' : '🎬 전체 분석 보기'}
          </button>
        )}
      </div>
    </div>
  )
}
