import { useRef, useCallback } from 'react'
import styles from './SuccessAnimation.module.css'

interface Props {
  show: boolean
  onComplete?: () => void
}

export function SuccessAnimation({ show, onComplete }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleAnimationEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onComplete?.()
    }, 1200)
  }, [onComplete])

  if (!show) return null

  return (
    <div className={styles.overlay} role="alert" onAnimationEnd={handleAnimationEnd}>
      <div className={styles.content}>
        <div className={styles.checkmark}>✓</div>
        <p className={styles.text}>예측 완료!</p>
      </div>
    </div>
  )
}
