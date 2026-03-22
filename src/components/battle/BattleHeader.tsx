import { useState, useEffect } from 'react'
import type { BattleType } from '@/types/signal'
import styles from './BattleHeader.module.css'

const BATTLE_LABELS: Record<BattleType, { emoji: string; label: string; resultInfo: string }> = {
  morning: { emoji: '☀️', label: '오전 배틀', resultInfo: '장 마감 후 공개' },
  flash: { emoji: '⚡', label: '플래시 배틀', resultInfo: '1~2시간 후 공개' },
  night: { emoji: '🌙', label: '나이트 배틀', resultInfo: '내일 오전 공개' },
}

function useCountdown(deadline: string) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining('마감')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(h > 0 ? `${h}시간 ${m}분` : `${m}분 ${s}초`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [deadline])

  return remaining
}

interface Props {
  type: BattleType
  deadline: string
  streak: number
}

export function BattleHeader({ type, deadline, streak }: Props) {
  const { emoji, label, resultInfo } = BATTLE_LABELS[type]
  const countdown = useCountdown(deadline)

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <h1 className={styles.title}>
          {emoji} {label}
        </h1>
        {streak > 0 && (
          <div className={styles.streak}>🔥 {streak}일</div>
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.countdown}>
          ⏱ {countdown}
        </span>
        <span className={styles.divider}>·</span>
        <span className={styles.resultInfo}>{resultInfo}</span>
      </div>
    </header>
  )
}
