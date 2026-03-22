import styles from './Skeleton.module.css'

export function SignalCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.line} ${styles.tag}`} />
      <div className={`${styles.line} ${styles.title}`} />
      <div className={`${styles.line} ${styles.text}`} />
      <div className={`${styles.line} ${styles.text} ${styles.short}`} />
      <div className={styles.buttons}>
        <div className={styles.btn} />
        <div className={styles.btn} />
        <div className={styles.btn} />
      </div>
    </div>
  )
}

export function FeedCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={`${styles.line} ${styles.tag}`} />
      <div className={`${styles.line} ${styles.title}`} />
      <div className={`${styles.line} ${styles.text}`} />
      <div className={`${styles.line} ${styles.text}`} />
      <div className={`${styles.line} ${styles.text} ${styles.short}`} />
    </div>
  )
}
