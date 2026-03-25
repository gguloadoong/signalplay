import { useNavigate } from 'react-router-dom'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { CharacterCard } from '@/components/vote/CharacterCard'
import { CrowdBar } from '@/components/vote/CrowdBar'
import { getVote } from '@/lib/utils/voteHistory'
import { MOCK_VOTE_RESULT, MOCK_CHARACTER_ACCURACY } from '@/lib/mockData'
import styles from './ResultPage.module.css'

const OUTCOME_LABELS = { bullish: '호재', bearish: '악재', neutral: '글쎄' } as const
const OUTCOME_COLORS = {
  bullish: 'green',
  bearish: 'red',
  neutral: 'yellow',
} as const

export function ResultPage() {
  const navigate = useNavigate()
  const result = MOCK_VOTE_RESULT
  const myVote = result ? getVote(result.questionId) : null

  if (!result) {
    return (
      <div className={styles.page}>
        <EmptyState
          emoji="🔮"
          title="아직 결과가 없어요"
          description="오늘의 투표에 참여하면 내일 결과를 확인할 수 있어요"
          action={{ label: '투표하러 가기', onClick: () => navigate('/') }}
        />
      </div>
    )
  }

  const crowdCorrect = result.crowdResult.bullish >= result.crowdResult.bearish &&
    result.crowdResult.bullish >= result.crowdResult.neutral
      ? result.actualOutcome === 'bullish'
      : result.crowdResult.bearish >= result.crowdResult.neutral
        ? result.actualOutcome === 'bearish'
        : result.actualOutcome === 'neutral'

  const correctCount = result.characters.filter((c) => c.isCorrect).length

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🎯 어제의 결과</h1>

      {/* Question recap */}
      <div className={styles.questionCard}>
        <p className={styles.questionText}>{result.title}</p>
        <div className={styles.outcomeRow}>
          <span className={styles.outcomeLabel}>실제 결과</span>
          <Badge
            size="medium"
            variant="fill"
            color={OUTCOME_COLORS[result.actualOutcome]}
          >
            {OUTCOME_LABELS[result.actualOutcome]}
          </Badge>
        </div>
        {myVote && (
          <div className={styles.outcomeRow}>
            <span className={styles.outcomeLabel}>내 예측</span>
            <Badge
              size="medium"
              variant="weak"
              color={OUTCOME_COLORS[myVote.choice]}
            >
              {OUTCOME_LABELS[myVote.choice]}
              {myVote.choice === result.actualOutcome ? ' ✅' : ' ❌'}
            </Badge>
          </div>
        )}
      </div>

      {/* Crowd result */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>군중의 선택</h3>
          <Badge
            size="small"
            variant="fill"
            color={crowdCorrect ? 'green' : 'red'}
          >
            {crowdCorrect ? '✅ 군중 정답' : '❌ 군중 오답'}
          </Badge>
        </div>
        <CrowdBar result={result.crowdResult} animated={false} />
      </div>

      {/* Character results */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>방구석 전문가 결과</h3>
          <span className={styles.score}>{correctCount}/5 적중</span>
        </div>
        <div className={styles.characters}>
          {result.characters.map((char) => (
            <CharacterCard
              key={char.character}
              prediction={char}
              isCorrect={char.isCorrect}
              showCorrect
            />
          ))}
        </div>
      </div>

      {/* AI comment */}
      <div className={styles.aiComment}>
        <span className={styles.aiLabel}>오늘의 총평</span>
        <p>{result.aiComment}</p>
      </div>

      {/* This month leaderboard */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>이번 달 적중률 순위</h3>
        <div className={styles.leaderboard}>
          {MOCK_CHARACTER_ACCURACY.map((c, i) => (
            <div key={c.character} className={styles.leaderRow}>
              <span className={styles.leaderRank}>{i + 1}</span>
              <span className={styles.leaderEmoji}>{c.emoji}</span>
              <span className={styles.leaderName}>{c.name}</span>
              <div className={styles.leaderBarWrap}>
                <div
                  className={styles.leaderBar}
                  style={{ width: `${c.rate}%` }}
                />
              </div>
              <span className={styles.leaderRate}>{c.rate}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button size="medium" variant="fill" color="primary" onClick={() => navigate('/')}>
          오늘 투표하기 →
        </Button>
      </div>

      <Disclaimer />
    </div>
  )
}
