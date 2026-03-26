import { useState } from 'react'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { showRewardAd } from '@/lib/bedrock'
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

type CharacterType = CharacterPrediction['character']

const CHARACTER_REACTIONS: Record<CharacterType, { correct: string; wrong: string }> = {
  quant:     { correct: '모델 예측 신뢰구간 내 결과입니다. 데이터는 거짓말 안 해요.', wrong: '통계적 이상치 발생. 샘플 범위 재검토가 필요합니다.' },
  professor: { correct: '실증 데이터가 이론을 지지했습니다. Fama(1970) 시장 효율성 가설 부합.', wrong: '흥미로운 반례입니다. 논문 한 편 더 읽어봐야겠어요.' },
  reporter:  { correct: '속보! 센티멘트 분석 적중! 시장은 역시 분위기를 먹고 살아요 📢', wrong: '이런, 헤드라인이 시장을 못 따라갔네요. 다음 속보 기다려주세요 📢' },
  pattern:   { correct: '골든크로스처럼 완벽한 신호였어요. 차트는 역시 진리입니다 📐', wrong: '데드크로스... 이번엔 패턴이 속았네요. 더 긴 기간을 봐야 했어요.' },
  chimp:     { correct: 'ㅋㅋ 맞혔다!! 역시 운이 실력이에요 🎲🎉', wrong: '에이~ 이번엔 운이 없었나봐요. 다음엔 주사위 다시 굴려볼게요 🎲' },
}

interface Props {
  prediction: CharacterPrediction
  isCorrect?: boolean
  showCorrect?: boolean
  defaultExpanded?: boolean
}

export function CharacterCard({ prediction, isCorrect, showCorrect = false, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
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
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded((v) => !v)}
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

      {!expanded && prediction.reasoning && (
        <p className={styles.preview}>
          {prediction.reasoning.length > 40
            ? `${prediction.reasoning.slice(0, 40)}...`
            : prediction.reasoning}
        </p>
      )}

      {expanded && (
        <div className={`${styles.reasoningWrap} ${styles.expanded}`}>
          <div className={`${styles.reasoningContent} ${!unlocked ? styles.gated : ''}`}>
            <p className={styles.reasoning}>{prediction.reasoning}</p>
            {!unlocked && <div className={styles.blurOverlay} />}
          </div>

          {!unlocked && (
            <Button
              size="medium"
              variant="weak"
              color="primary"
              display="full"
              onClick={handleUnlock}
              disabled={adLoading}
              aria-label="광고 시청 후 전체 분석 보기"
            >
              {adLoading ? '광고 로딩 중...' : '🎬 전체 분석 보기'}
            </Button>
          )}

          {unlocked && showCorrect && isCorrect !== undefined && (
            <p className={`${styles.reaction} ${isCorrect ? styles.reactionCorrect : styles.reactionWrong}`}>
              {prediction.reaction ?? (isCorrect
                ? CHARACTER_REACTIONS[prediction.character].correct
                : CHARACTER_REACTIONS[prediction.character].wrong)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
