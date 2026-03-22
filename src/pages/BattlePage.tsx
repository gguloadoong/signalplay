import { useState } from 'react'
import { SignalCard } from '@/components/battle/SignalCard'
import { BattleHeader } from '@/components/battle/BattleHeader'
import { TrackingBanner } from '@/components/battle/TrackingBanner'
import { Disclaimer } from '@/components/shared/Disclaimer'
import type { Battle, Signal, UserPrediction } from '@/types/signal'
import styles from './BattlePage.module.css'

// 목데이터 — 추후 API 연동
const MOCK_BATTLE: Battle = {
  id: 'morning-2026-03-22',
  type: 'morning',
  date: '2026-03-22',
  signals: [
    {
      index: 0,
      title: '연준 금리 동결 시사 발언',
      summary: '파월 의장이 상반기 금리 동결 가능성을 시사. 과거 유사 발언 후 나스닥 평균 +1.2% 상승.',
      category: 'macro',
    },
    {
      index: 1,
      title: '반도체 수출 3개월 연속 증가',
      summary: '산업부 발표, 3월 반도체 수출 전년 대비 +23.4%. DRAM 가격 회복세 뚜렷.',
      category: 'sector',
    },
    {
      index: 2,
      title: '중국 PMI 예상치 하회',
      summary: '3월 제조업 PMI 49.2로 위축 국면 재진입. 시장 예상 50.1 대비 하회.',
      category: 'global',
    },
  ],
  deadline: '2026-03-22T06:30:00Z',
  resultTime: '2026-03-22T06:30:00Z',
  isActive: true,
  isResultReady: false,
}

export function BattlePage() {
  const [predictions, setPredictions] = useState<Map<number, UserPrediction>>(new Map())
  const [submitted, setSubmitted] = useState(false)

  const battle = MOCK_BATTLE

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
    // TODO: POST /api/predictions
  }

  return (
    <div className={styles.page}>
      <BattleHeader type={battle.type} deadline={battle.deadline} streak={6} />

      <TrackingBanner />

      <div className={styles.cards}>
        {battle.signals.map((signal: Signal) => (
          <SignalCard
            key={signal.index}
            signal={signal}
            prediction={predictions.get(signal.index)}
            onPredict={handlePredict}
            disabled={submitted}
            crowdSentiment={{ signalIndex: signal.index, bullish: 68, bearish: 22, neutral: 10 }}
          />
        ))}
      </div>

      {!submitted && (
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
      )}

      {submitted && (
        <div className={styles.submittedBanner}>
          <span>예측 완료!</span> 오늘 15:30에 결과가 공개됩니다
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
