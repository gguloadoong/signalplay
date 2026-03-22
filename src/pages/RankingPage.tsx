import styles from './RankingPage.module.css'

const MOCK_RANKING = [
  { rank: 1, name: '시그널마스터', score: 480, accuracy: 82, streak: 14 },
  { rank: 2, name: '불곰사냥꾼', score: 445, accuracy: 78, streak: 11 },
  { rank: 3, name: '예측의신', score: 420, accuracy: 76, streak: 9 },
  { rank: 4, name: '경제덕후', score: 380, accuracy: 72, streak: 8 },
  { rank: 5, name: '투자초보', score: 350, accuracy: 70, streak: 12 },
  { rank: 6, name: '뉴스읽는곰', score: 330, accuracy: 68, streak: 6 },
  { rank: 7, name: '차트분석가', score: 310, accuracy: 66, streak: 5 },
  { rank: 8, name: '나', score: 290, accuracy: 71, streak: 7, isMe: true },
  { rank: 9, name: '시장관찰자', score: 270, accuracy: 64, streak: 4 },
  { rank: 10, name: '데일리체커', score: 250, accuracy: 62, streak: 3 },
]

const MEDAL = ['', '🥇', '🥈', '🥉']

export function RankingPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🏆 주간 랭킹</h1>
      <p className={styles.subtitle}>이번 주 예측왕은 누구?</p>

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
                {user.isMe && <span className={styles.meBadge}>나</span>}
              </span>
              <span className={styles.meta}>
                적중률 {user.accuracy}% · 🔥{user.streak}일
              </span>
            </div>
            <span className={styles.score}>{user.score}점</span>
          </div>
        ))}
      </div>

      {/* 내 순위 sticky */}
      <div className={styles.myRank}>
        <span>내 순위</span>
        <b>8위 (↑4)</b>
        <span>290점 · 적중률 71%</span>
      </div>
    </div>
  )
}
