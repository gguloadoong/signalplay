import { useParams, useNavigate } from 'react-router-dom'
import { getCharacterById } from '@/lib/characters'
import { EmptyState } from '@/components/shared/EmptyState'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import styles from './CharacterProfilePage.module.css'

const PREDICTION_LABELS = {
  bullish: { label: '호재', color: '#00c853', bg: '#e8f9ef' },
  bearish: { label: '악재', color: '#f44336', bg: '#fdecea' },
  neutral: { label: '글쎄', color: '#ff9800', bg: '#fff3e0' },
} as const

export function CharacterProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const char = id ? getCharacterById(id) : undefined

  if (!char) {
    return (
      <div className={styles.page}>
        <EmptyState emoji="🔍" title="전문가를 찾을 수 없어요" description="" action={{ label: '전문가 목록으로', onClick: () => navigate('/characters') }} />
      </div>
    )
  }

  const thisMonthRate = char.thisMonth.rate
  const overallRate = char.accuracy.rate

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.headerBar}>
        <Button size="small" variant="weak" color="primary" onClick={() => navigate('/characters')}>
          ‹ 뒤로
        </Button>
      </div>

      {/* 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{char.emoji}</div>
        <h1 className={styles.name}>{char.name}</h1>
        <span className={styles.methodology}>{char.methodology}</span>
        <p className={styles.quote}>"{char.quote}"</p>
      </div>

      {/* 적중률 통계 */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statValue}>{overallRate}%</div>
          <div className={styles.statLabel}>전체 적중률</div>
          <div className={styles.statSub}>{char.accuracy.correct}/{char.accuracy.total}</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statBox}>
          <div className={styles.statValue}>{thisMonthRate}%</div>
          <div className={styles.statLabel}>이번 달</div>
          <div className={styles.statSub}>{char.thisMonth.correct}/{char.thisMonth.total}</div>
        </div>
      </div>

      {/* 이력 소개 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>소개</h2>
        <p className={styles.bio}>{char.fullBio}</p>
      </div>

      {/* 예측 히스토리 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>최근 예측 이력</h2>
        <div className={styles.history}>
          {char.history.map((h, i) => {
            const pred = PREDICTION_LABELS[h.prediction]
            return (
              <div key={i} className={styles.historyItem}>
                <div className={styles.historyTop}>
                  <span className={styles.historyDate}>{h.date}</span>
                  <span
                    className={styles.historyPred}
                    style={{ color: pred.color, background: pred.bg }}
                  >
                    {pred.label}
                  </span>
                  <span className={h.isCorrect ? styles.correct : styles.wrong}>
                    {h.isCorrect ? '✅ 적중' : '❌ 빗나감'}
                  </span>
                </div>
                <p className={styles.historyQ}>{h.question}</p>
                <p className={styles.historyReason}>{h.reasoning}</p>
              </div>
            )
          })}
        </div>
      </div>

      <p className={styles.disclaimer}>예측은 투자 자문이 아닙니다</p>
    </div>
  )
}
