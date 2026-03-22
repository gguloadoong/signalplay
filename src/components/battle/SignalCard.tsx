import { useState } from 'react'
import type { Signal, UserPrediction, Prediction, Confidence, CrowdSentiment } from '@/types/signal'
import styles from './SignalCard.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  macro: '매크로',
  sector: '섹터',
  global: '글로벌',
  breaking: '속보',
}

const PREDICTION_OPTIONS: { value: Prediction; label: string; color: string }[] = [
  { value: 'bullish', label: '호재', color: 'var(--color-success)' },
  { value: 'neutral', label: '영향없음', color: 'var(--color-warning)' },
  { value: 'bearish', label: '악재', color: 'var(--color-danger)' },
]

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
        <span className={styles.category}>{CATEGORY_LABELS[signal.category]}</span>
      </div>

      <h3 className={styles.title}>{signal.title}</h3>
      <p className={styles.summary}>{signal.summary}</p>

      {/* 예측 버튼 */}
      <div className={styles.buttons}>
        {PREDICTION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.predBtn} ${selectedDirection === opt.value ? styles.selected : ''}`}
            style={
              selectedDirection === opt.value
                ? { background: opt.color, color: '#fff', borderColor: opt.color }
                : {}
            }
            onClick={() => handleDirection(opt.value)}
            disabled={disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 확신도 선택 */}
      {selectedDirection && (
        <div className={styles.confidenceArea}>
          <span className={styles.confLabel}>확신도</span>
          <div className={styles.confButtons}>
            {([1, 2, 3] as Confidence[]).map((c) => (
              <button
                key={c}
                className={`${styles.confBtn} ${confidence === c ? styles.confSelected : ''}`}
                onClick={() => handleConfidence(c)}
                disabled={disabled}
              >
                {'🔥'.repeat(c)} x{c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 군중 심리 (예측 후 표시) */}
      {prediction && crowdSentiment && (
        <div className={styles.crowd}>
          <div className={styles.crowdBar}>
            <div
              className={styles.crowdSegment}
              style={{ width: `${crowdSentiment.bullish}%`, background: 'var(--color-success)' }}
            />
            <div
              className={styles.crowdSegment}
              style={{ width: `${crowdSentiment.neutral}%`, background: 'var(--color-warning)' }}
            />
            <div
              className={styles.crowdSegment}
              style={{ width: `${crowdSentiment.bearish}%`, background: 'var(--color-danger)' }}
            />
          </div>
          <div className={styles.crowdLabels}>
            <span style={{ color: 'var(--color-success)' }}>호재 {crowdSentiment.bullish}%</span>
            <span style={{ color: 'var(--color-warning)' }}>중립 {crowdSentiment.neutral}%</span>
            <span style={{ color: 'var(--color-danger)' }}>악재 {crowdSentiment.bearish}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
