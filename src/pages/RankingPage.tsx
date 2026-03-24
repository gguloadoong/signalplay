import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { MOCK_RANKING, MOCK_USER_STATS } from '@/lib/mockData'
import styles from './RankingPage.module.css'

const MEDAL = ['', '🥇', '🥈', '🥉']

export function RankingPage() {
  const myStats = MOCK_USER_STATS

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🏆 주간 랭킹</h1>
      <p className={styles.subtitle}>이번 주 예측왕은 누구? · 매주 월요일 리셋</p>

      {MOCK_RANKING.length === 0 ? (
        <EmptyState
          emoji="🏆"
          title="아직 랭킹이 없어요"
          description="이번 주 배틀에 참여하면 랭킹에 올라갑니다"
        />
      ) : (
      <div className={styles.list}>
        {MOCK_RANKING.map((user) => (
          <div
            key={user.rank}
            className={`${styles.row} ${user.isMe ? styles.me : ''} ${user.rank <= 3 ? styles.top3 : ''}`}
          >
            <span className={styles.rank}>
              {user.rank <= 3 ? MEDAL[user.rank] : user.rank}
            </span>
            <div className={styles.info}>
              <span className={styles.name}>
                {user.name}
                {user.isMe && (
                  <Badge size="xsmall" variant="fill" color="blue">나</Badge>
                )}
              </span>
              <span className={styles.meta}>
                적중률 {user.accuracy}% · 🔥{user.streak}일
              </span>
            </div>
            <span className={styles.score}>{user.score}점</span>
          </div>
        ))}
      </div>
      )}

      <div className={styles.myRank}>
        <div className={styles.myRankLeft}>
          <span className={styles.myRankLabel}>내 순위</span>
          <b>{myStats.weeklyRank}위</b>
        </div>
        <div className={styles.myRankRight}>
          <span>{myStats.totalScore}점</span>
          <span className={styles.myRankDivider}>·</span>
          <span>적중률 {myStats.accuracy}%</span>
          <span className={styles.myRankDivider}>·</span>
          <span>🔥{myStats.currentStreak}일</span>
        </div>
      </div>
    </div>
  )
}
