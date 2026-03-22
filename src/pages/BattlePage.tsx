import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignalCard } from '@/components/battle/SignalCard'
import { BattleHeader } from '@/components/battle/BattleHeader'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { MOCK_BATTLES, MOCK_CROWD, MOCK_USER_STATS } from '@/lib/mockData'
import type { Signal, UserPrediction, Battle } from '@/types/signal'
import styles from './BattlePage.module.css'

function BattleSection({ battle, hasResult }: { battle: Battle; hasResult: boolean }) {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState<Map<number, UserPrediction>>(new Map())
  const [submitted, setSubmitted] = useState(false)

  const handlePredict = (pred: UserPrediction) => {
    setPredictions((prev) => {
      const next = new Map(prev)
      next.set(pred.signalIndex, pred)
      return next
    })
  }

  const allPredicted = predictions.size === battle.signals.length

  const handleSubmit = () => {
    if (!allPredicted) return
    setSubmitted(true)
  }

  return (
    <>
      <BattleHeader
        type={battle.type}
        deadline={battle.deadline}
        streak={MOCK_USER_STATS.currentStreak}
      />

      {hasResult && !submitted && (
        <button className={styles.resultBanner} onClick={() => navigate('/result')}>
          <span className={styles.resultDot} />
          <span className={styles.resultText}>어제 배틀 결과가 나왔어요!</span>
          <span>→</span>
        </button>
      )}

      <div className={styles.cards}>
        {battle.signals.map((signal: Signal) => (
          <SignalCard
            key={signal.index}
            signal={signal}
            prediction={predictions.get(signal.index)}
            onPredict={handlePredict}
            disabled={submitted}
            crowdSentiment={
              submitted
                ? MOCK_CROWD[signal.index] ?? { signalIndex: signal.index, bullish: 60, bearish: 25, neutral: 15 }
                : undefined
            }
          />
        ))}
      </div>

      {!submitted ? (
        <div className={styles.submitArea}>
          <button
            className={`${styles.submitBtn} ${allPredicted ? styles.ready : ''}`}
            onClick={handleSubmit}
            disabled={!allPredicted}
          >
            {allPredicted
              ? `예측 제출하기 (${predictions.size}/${battle.signals.length})`
              : `시그널을 예측해주세요 (${predictions.size}/${battle.signals.length})`}
          </button>
        </div>
      ) : (
        <div className={styles.submittedBanner}>
          <span>예측 완료!</span>{' '}
          {battle.type === 'morning'
            ? '오늘 15:30에 결과가 공개됩니다'
            : battle.type === 'flash'
              ? '약 1~2시간 후 결과 공개'
              : '내일 오전 9시에 결과가 공개됩니다'}
        </div>
      )}
    </>
  )
}

export function BattlePage() {
  return (
    <div className={styles.page}>
      {MOCK_BATTLES.map((battle, i) => (
        <BattleSection key={battle.id} battle={battle} hasResult={i === 0} />
      ))}
      <Disclaimer />
    </div>
  )
}
