import { useState } from 'react'
import { Disclaimer } from '@/components/shared/Disclaimer'
import styles from './ResultPage.module.css'

const MOCK_RESULTS = [
  {
    title: '연준 금리 동결 시사 발언',
    myPrediction: 'bullish' as const,
    myConfidence: 3 as const,
    actualResult: 'bullish' as const,
    isCorrect: true,
    score: 30,
    resultComment: '코스피 +1.2% 상승. 외국인 매수세 유입이 주요 원인.',
    revealed: false,
  },
  {
    title: '반도체 수출 3개월 연속 증가',
    myPrediction: 'bullish' as const,
    myConfidence: 2 as const,
    actualResult: 'bullish' as const,
    isCorrect: true,
    score: 20,
    resultComment: '삼성전자 +2.3%, SK하이닉스 +3.1%. HBM 기대감 반영.',
    revealed: false,
  },
  {
    title: '중국 PMI 예상치 하회',
    myPrediction: 'bearish' as const,
    myConfidence: 3 as const,
    actualResult: 'neutral' as const,
    isCorrect: false,
    score: -10,
    resultComment: '코스피 영향 제한적. 이미 시장에 선반영된 것으로 분석.',
    revealed: false,
  },
]

const LABELS = {
  bullish: '호재',
  bearish: '악재',
  neutral: '영향없음',
}

const COLORS = {
  bullish: 'var(--color-success)',
  bearish: 'var(--color-danger)',
  neutral: 'var(--color-warning)',
}

export function ResultPage() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const handleReveal = (index: number) => {
    setRevealed((prev) => new Set([...prev, index]))
  }

  const allRevealed = revealed.size === MOCK_RESULTS.length
  const totalScore = MOCK_RESULTS.reduce((acc, r) => acc + r.score, 0)
  const correctCount = MOCK_RESULTS.filter((r) => r.isCorrect).length
  const isPerfect = correctCount === MOCK_RESULTS.length

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🎯 어제의 결과</h1>
      <p className={styles.subtitle}>카드를 탭하여 결과를 확인하세요</p>

      <div className={styles.cards}>
        {MOCK_RESULTS.map((result, i) => (
          <div
            key={i}
            className={`${styles.card} ${revealed.has(i) ? styles.revealed : styles.hidden}`}
            onClick={() => handleReveal(i)}
          >
            {!revealed.has(i) ? (
              <div className={styles.hiddenContent}>
                <p className={styles.hiddenTitle}>{result.title}</p>
                <p className={styles.tapHint}>탭하여 결과 확인 👆</p>
              </div>
            ) : (
              <div className={styles.revealedContent}>
                <div className={styles.resultBadge} style={{ background: result.isCorrect ? '#e8f5e9' : '#ffebee' }}>
                  {result.isCorrect ? '✅ 정답!' : '❌ 오답'}
                </div>
                <h3 className={styles.resultTitle}>{result.title}</h3>
                <div className={styles.resultDetail}>
                  <span>
                    내 예측: <b style={{ color: COLORS[result.myPrediction] }}>{LABELS[result.myPrediction]}</b> (x{result.myConfidence})
                  </span>
                  <span>
                    실제: <b style={{ color: COLORS[result.actualResult] }}>{LABELS[result.actualResult]}</b>
                  </span>
                </div>
                <p className={styles.comment}>{result.resultComment}</p>
                <div className={styles.scoreRow}>
                  <span className={result.score > 0 ? styles.plus : styles.minus}>
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
          <div className={styles.summaryMain}>
            {isPerfect && <div className={styles.perfect}>🎉 PERFECT!</div>}
            <div className={styles.summaryScore}>
              적중 {correctCount}/{MOCK_RESULTS.length} · 총점{' '}
              <b className={totalScore >= 0 ? styles.plus : styles.minus}>
                {totalScore > 0 ? '+' : ''}{totalScore}{isPerfect ? '+20' : ''}점
              </b>
            </div>
            <div className={styles.summaryStreak}>🔥 7일 연속 참여 · 주간 랭킹 8위 (↑4)</div>
          </div>
          <button className={styles.shareBtn}>결과 공유하기</button>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
