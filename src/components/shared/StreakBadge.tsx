import styles from './StreakBadge.module.css'

interface Props {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

const MILESTONES = [
  { days: 30, label: '전설', emoji: '💎' },
  { days: 14, label: '마스터', emoji: '👑' },
  { days: 7, label: '프로', emoji: '🔥' },
  { days: 3, label: '루키', emoji: '⭐' },
]

export function StreakBadge({ streak, size = 'md' }: Props) {
  if (streak <= 0) return null

  const milestone = MILESTONES.find((m) => streak >= m.days) ?? { label: '', emoji: '🔥' }

  return (
    <div className={`${styles.badge} ${styles[size]}`}>
      <span className={styles.fire}>
        {milestone.emoji}
      </span>
      <span className={styles.count}>{streak}일</span>
      {streak >= 3 && <span className={styles.label}>{milestone.label}</span>}
    </div>
  )
}
