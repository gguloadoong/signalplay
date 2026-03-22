import type { BattleType } from '@/types/signal'
import styles from './BattleHeader.module.css'

const BATTLE_LABELS: Record<BattleType, { emoji: string; label: string }> = {
  morning: { emoji: '☀️', label: '오전 배틀' },
  flash: { emoji: '⚡', label: '플래시 배틀' },
  night: { emoji: '🌙', label: '나이트 배틀' },
}

interface Props {
  type: BattleType
  deadline: string
  streak: number
}

export function BattleHeader({ type, deadline, streak }: Props) {
  const { emoji, label } = BATTLE_LABELS[type]
  const deadlineDate = new Date(deadline)
  const hours = deadlineDate.getHours().toString().padStart(2, '0')
  const minutes = deadlineDate.getMinutes().toString().padStart(2, '0')

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <h1 className={styles.title}>
          {emoji} {label}
        </h1>
        {streak > 0 && (
          <div className={styles.streak}>
            🔥 {streak}일 연속
          </div>
        )}
      </div>
      <p className={styles.deadline}>
        마감 {hours}:{minutes} · 결과는 장 마감 후 공개
      </p>
    </header>
  )
}
