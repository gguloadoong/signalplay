import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { MOCK_YESTERDAY_RESULTS, MOCK_YESTERDAY_SIGNALS, MOCK_USER_STATS } from '@/lib/mockData'
import { SCORE_TABLE } from '@/types/signal'
import styles from './ResultPage.module.css'

const LABELS = { bullish: '호재', bearish: '악재', neutral: '영향없음' } as const
const COLORS = {
  bullish: 'var(--color-success)',
  bearish: 'var(--color-danger)',
  neutral: 'var(--color-warning)',
} as const

export function ResultPage() {
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const results = MOCK_YESTERDAY_RESULTS

  const handleReveal = (index: number) => {
    setRevealed((prev) => new Set([...prev, index]))
  }

  const allRevealed = revealed.size === results.length
  const totalScore = results.reduce((acc, r) => acc + r.score, 0)
  const correctCount = results.filter((r) => r.isCorrect).length
  const isPerfect = correctCount === results.length
  const perfectBonus = isPerfect ? SCORE_TABLE.perfectBonus : 0
  const finalScore = totalScore + perfectBonus

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🎯 어제의 결과</h1>
      <p className={styles.subtitle}>카드를 탭하여 결과를 확인하세요</p>

      <div className={styles.cards}>
        {results.map((result, i) => (
          <div
            key={i}
            className={`${styles.card} ${revealed.has(i) ? styles.revealed : styles.hidden}`}
            onClick={() => !revealed.has(i) && handleReveal(i)}
          >
            {!revealed.has(i) ? (
              <div className={styles.hiddenContent}>
                <p className={styles.hiddenTitle}>{MOCK_YESTERDAY_SIGNALS[i]}</p>
                <p className={styles.tapHint}>탭하여 결과 확인 👆</p>
              </div>
            ) : (
              <div className={styles.revealedContent}>
                <div
                  className={styles.resultBadge}
                  style={{ background: result.isCorrect ? '#e8f5e9' : '#ffebee', color: result.isCorrect ? '#2e7d32' : '#c62828' }}
                >
                  {result.isCorrect ? '✅ 정답!' : '❌ 오답'}
                </div>
                <h3 className={styles.resultTitle}>{MOCK_YESTERDAY_SIGNALS[i]}</h3>
                <div className={styles.resultDetail}>
                  <span>
                    내 예측: <b style={{ color: COLORS[result.myPrediction] }}>{LABELS[result.myPrediction]}</b>{' '}
                    <span className={styles.conf}>x{result.myConfidence}</span>
                  </span>
                  <span>
                    실제: <b style={{ color: COLORS[result.actualResult] }}>{LABELS[result.actualResult]}</b>
                  </span>
                </div>
                <p className={styles.comment}>{result.resultComment}</p>
                <div className={styles.scoreRow}>
                  <span className={result.score >= 0 ? styles.plus : styles.minus}>
                    {result.score > 0 ? '+' : ''}{result.score}점
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {allRevealed && (
        <div className={styles.summary}>
          {isPerfect && <div className={styles.perfect}>🎉 PERFECT!</div>}
          <div className={styles.summaryScore}>
            적중 {correctCount}/{results.length} · 총점{' '}
            <b className={finalScore >= 0 ? styles.plus : styles.minus}>
              {finalScore > 0 ? '+' : ''}{finalScore}점
            </b>
            {isPerfect && <span className={styles.bonusTag}>+{SCORE_TABLE.perfectBonus} 보너스</span>}
          </div>
          <div className={styles.summaryStreak}>
            🔥 {MOCK_USER_STATS.currentStreak}일 연속 참여 · 주간 랭킹 {MOCK_USER_STATS.weeklyRank}위
          </div>
          <div className={styles.actions}>
            <button className={styles.shareBtn}>결과 공유하기</button>
            <button className={styles.battleBtn} onClick={() => navigate('/')}>
              오늘의 배틀 →
            </button>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
