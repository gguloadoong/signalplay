import styles from './TrackingBanner.module.css'

export function TrackingBanner() {
  // TODO: 실제 추이 데이터 연동
  return (
    <div className={styles.banner}>
      <span className={styles.dot} />
      <span className={styles.text}>
        어제 예측 결과가 나왔어요!
      </span>
      <span className={styles.arrow}>→</span>
    </div>
  )
}
