import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHARACTER_PROFILES } from '@/lib/characters'
import { api } from '@/lib/api/client'
import styles from './CharactersPage.module.css'

const RANK_LABELS = ['🥇', '🥈', '🥉', '4위', '5위']

interface LiveStat {
  character: string
  correct: number
  total: number
  rate: number
}

export function CharactersPage() {
  const navigate = useNavigate()
  const [liveStats, setLiveStats] = useState<LiveStat[]>([])

  useEffect(() => {
    api.getLeaderboard().then(({ data }) => {
      if (data && data.length > 0) setLiveStats(data)
    })
  }, [])

  const merged = CHARACTER_PROFILES.map((char) => {
    const live = liveStats.find((s) => s.character === char.id)
    return {
      ...char,
      accuracy: live
        ? { correct: live.correct, total: live.total, rate: live.rate }
        : char.accuracy,
    }
  })

  const sorted = [...merged].sort((a, b) => b.accuracy.rate - a.accuracy.rate)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>방구석 전문가</h1>
        <p className={styles.subtitle}>각자 다른 이론으로 시장을 분석해요</p>
      </div>

      <div className={styles.list}>
        {sorted.map((char, idx) => (
          <button
            key={char.id}
            className={styles.card}
            onClick={() => navigate(`/characters/${char.id}`)}
          >
            <div className={styles.rank}>{RANK_LABELS[idx]}</div>
            <div className={styles.avatar}>{char.emoji}</div>
            <div className={styles.info}>
              <div className={styles.name}>{char.name}</div>
              <div className={styles.bio}>{char.shortBio}</div>
              <div className={styles.methodology}>{char.methodology}</div>
            </div>
            <div className={styles.stats}>
              <div className={styles.rate}>{char.accuracy.rate}%</div>
              <div className={styles.rateLabel}>적중률</div>
              <div className={styles.record}>
                {char.accuracy.correct}/{char.accuracy.total}
              </div>
            </div>
            <div className={styles.arrow}>›</div>
          </button>
        ))}
      </div>

      <p className={styles.disclaimer}>
        방구석 전문가의 예측은 투자 자문이 아닙니다
      </p>
    </div>
  )
}
