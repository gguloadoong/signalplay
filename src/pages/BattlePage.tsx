import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { SignalCard } from '@/components/battle/SignalCard'
import { BattleHeader } from '@/components/battle/BattleHeader'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { SuccessAnimation } from '@/components/shared/SuccessAnimation'
import { SignalCardSkeleton } from '@/components/shared/Skeleton'
import { useGameStore } from '@/stores/gameStore'
import { useSignals } from '@/hooks/useSignals'
import { MOCK_BATTLES, MOCK_CROWD } from '@/lib/mockData'
import type { Signal, UserPrediction, Battle } from '@/types/signal'
import styles from './BattlePage.module.css'

function BattleSection({ battle }: { battle: Battle }) {
  const navigate = useNavigate()
  const { submitPrediction, hasPredicted, getPredictions, stats } = useGameStore()
  const alreadySubmitted = hasPredicted(battle.id)
  const savedEntry = getPredictions(battle.id)

  const [predictions, setPredictions] = useState<Map<number, UserPrediction>>(() => {
    if (savedEntry) {
      const map = new Map<number, UserPrediction>()
      savedEntry.predictions.forEach((p) => map.set(p.signalIndex, p))
      return map
    }
    return new Map()
  })
  const [submitted, setSubmitted] = useState(alreadySubmitted)
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePredict = (pred: UserPrediction) => {
    if (submitted) return
    setPredictions((prev) => {
      const next = new Map(prev)
      next.set(pred.signalIndex, pred)
      return next
    })
  }

  const allPredicted = predictions.size === battle.signals.length

  const handleSubmit = () => {
    if (!allPredicted || submitted) return
    const predsArray = Array.from(predictions.values())
    submitPrediction(battle.id, predsArray)
    setShowSuccess(true)
    setSubmitted(true)
  }

  const battleTypeLabel = {
    morning: '오늘 15:30에 결과가 공개됩니다',
    flash: '약 1~2시간 후 결과 공개',
    night: '내일 오전 9시에 결과가 공개됩니다',
  }

  return (
    <section className={styles.section}>
      <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
      <BattleHeader type={battle.type} deadline={battle.deadline} streak={stats.currentStreak} />

      {battle.type === 'morning' && (
        <button className={styles.resultBanner} onClick={() => navigate('/result')}>
          <Badge size="xsmall" variant="fill" color="red">NEW</Badge>
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
                ? MOCK_CROWD[signal.index] ?? { signalIndex: signal.index, bullish: 55, bearish: 30, neutral: 15 }
                : undefined
            }
          />
        ))}
      </div>

      {!submitted ? (
        <div className={styles.submitArea}>
          <Button
            size="large"
            variant="fill"
            color={allPredicted ? 'primary' : 'light'}
            display="full"
            onClick={handleSubmit}
            disabled={!allPredicted}
          >
            {allPredicted
              ? `예측 제출하기 (${predictions.size}/${battle.signals.length})`
              : `시그널을 예측해주세요 (${predictions.size}/${battle.signals.length})`}
          </Button>
        </div>
      ) : (
        <div className={styles.submittedBanner}>
          <span>예측 완료!</span> {battleTypeLabel[battle.type]}
        </div>
      )}
    </section>
  )
}

export function BattlePage() {
  const { battle: liveBattle, loading } = useSignals()

  // 라이브 시그널 + 플래시 배틀 (목데이터)
  const battles = liveBattle
    ? [liveBattle, ...MOCK_BATTLES.filter((b) => b.type === 'flash')]
    : MOCK_BATTLES

  return (
    <div className={styles.page}>
      {loading ? (
        <div className={styles.cards}>
          <SignalCardSkeleton />
          <SignalCardSkeleton />
          <SignalCardSkeleton />
        </div>
      ) : battles.length === 0 ? (
        <EmptyState
          emoji="⏳"
          title="오늘의 배틀 준비 중"
          description="매일 오전 9시에 새로운 시그널이 도착합니다"
        />
      ) : (
        battles.map((battle) => (
          <BattleSection key={battle.id} battle={battle} />
        ))
      )}
      <Disclaimer />
    </div>
  )
}
