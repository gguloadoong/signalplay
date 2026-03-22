import { useState } from 'react'
import { Button, Badge } from '@toss/tds-mobile'
import type { Signal, UserPrediction, Prediction, Confidence, CrowdSentiment } from '@/types/signal'
import styles from './SignalCard.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  macro: '매크로',
  sector: '섹터',
  global: '글로벌',
  breaking: '속보',
}

const PREDICTION_OPTIONS: { value: Prediction; label: string }[] = [
  { value: 'bullish', label: '📈 호재' },
  { value: 'neutral', label: '➡️ 영향없음' },
  { value: 'bearish', label: '📉 악재' },
]

const PRED_COLORS: Record<Prediction, string> = {
  bullish: '#00c853',
  neutral: '#ff9800',
  bearish: '#f44336',
}

interface Props {
  signal: Signal
  prediction?: UserPrediction
  onPredict: (pred: UserPrediction) => void
  disabled: boolean
  crowdSentiment?: CrowdSentiment
}

export function SignalCard({ signal, prediction, onPredict, disabled, crowdSentiment }: Props) {
  const [selectedDirection, setSelectedDirection] = useState<Prediction | null>(
    prediction?.prediction ?? null,
  )
  const [confidence, setConfidence] = useState<Confidence>(prediction?.confidence ?? 1)

  const handleDirection = (dir: Prediction) => {
    if (disabled) return
    setSelectedDirection(dir)
    onPredict({ signalIndex: signal.index, prediction: dir, confidence })
  }

  const handleConfidence = (c: Confidence) => {
    if (disabled || !selectedDirection) return
    setConfidence(c)
    onPredict({ signalIndex: signal.index, prediction: selectedDirection, confidence: c })
  }

  return (
    <div className={`${styles.card} ${prediction ? styles.predicted : ''}`}>
      <div className={styles.header}>
        <Badge size="small" variant="fill" color="blue">{CATEGORY_LABELS[signal.category]}</Badge>
      </div>

      <h3 className={styles.title}>{signal.title}</h3>
      <p className={styles.summary}>{signal.summary}</p>

      <div className={styles.buttons}>
        {PREDICTION_OPTIONS.map((opt) => {
          const isSelected = selectedDirection === opt.value
          return (
            <Button
              key={opt.value}
              size="small"
              variant={isSelected ? 'fill' : 'weak'}
              color={isSelected ? 'primary' : 'light'}
              onClick={() => handleDirection(opt.value)}
              disabled={disabled}
              className={styles.predBtn}
              style={isSelected ? { background: PRED_COLORS[opt.value], borderColor: PRED_COLORS[opt.value] } : {}}
            >
              {opt.label}
            </Button>
          )
        })}
      </div>

      {selectedDirection && (
        <div className={styles.confidenceArea}>
          <span className={styles.confLabel}>확신도</span>
          <div className={styles.confButtons}>
            {([1, 2, 3] as Confidence[]).map((c) => (
              <Button
                key={c}
                size="small"
                variant={confidence === c ? 'fill' : 'weak'}
                color={confidence === c ? 'primary' : 'light'}
                onClick={() => handleConfidence(c)}
                disabled={disabled}
                className={styles.confBtn}
              >
                {'🔥'.repeat(c)} x{c}
              </Button>
            ))}
          </div>
        </div>
      )}

      {prediction && crowdSentiment && (
        <div className={styles.crowd}>
          <div className={styles.crowdBar}>
            <div className={styles.crowdSegment} style={{ width: `${crowdSentiment.bullish}%`, background: PRED_COLORS.bullish }} />
            <div className={styles.crowdSegment} style={{ width: `${crowdSentiment.neutral}%`, background: PRED_COLORS.neutral }} />
            <div className={styles.crowdSegment} style={{ width: `${crowdSentiment.bearish}%`, background: PRED_COLORS.bearish }} />
          </div>
          <div className={styles.crowdLabels}>
            <span style={{ color: PRED_COLORS.bullish }}>호재 {crowdSentiment.bullish}%</span>
            <span style={{ color: PRED_COLORS.neutral }}>중립 {crowdSentiment.neutral}%</span>
            <span style={{ color: PRED_COLORS.bearish }}>악재 {crowdSentiment.bearish}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
