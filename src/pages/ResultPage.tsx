import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { CharacterCard } from '@/components/vote/CharacterCard'
import { CrowdBar } from '@/components/vote/CrowdBar'
import { getVote } from '@/lib/utils/voteHistory'
import { MOCK_VOTE_RESULT, MOCK_CHARACTER_ACCURACY } from '@/lib/mockData'
import { api } from '@/lib/api/client'
import type { VoteResult } from '@/types/vote'
import styles from './ResultPage.module.css'

const OUTCOME_LABELS = { bullish: '올라갔다 📈', bearish: '망했다 📉', neutral: '그냥 그랬다 🤷' } as const
const OUTCOME_COLORS = {
  bullish: 'green',
  bearish: 'red',
  neutral: 'yellow',
} as const

export function ResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<VoteResult | null | undefined>(undefined)

  useEffect(() => {
    api.getResult().then(({ data }) => {
      // data null = API 연결됐지만 결과 없음, undefined = API 실패 → mock 폴백
      setResult(data !== undefined ? data : MOCK_VOTE_RESULT)
    })
  }, [])

  const myVote = result ? getVote(result.questionId) : null

  if (result === undefined) {
    return (
      <div className={styles.page}>
        <EmptyState emoji="⏳" title="뚜껑 여는 중... 🫣" description="" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className={styles.page}>
        <EmptyState
          emoji="🔮"
          title="아직 뚜껑 전이야 🔮"
          description="오늘 한 표 던지면 내일 결과 볼 수 있어"
          action={{ label: '나도 한 표 ✋', onClick: () => navigate('/') }}
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
      <h1 className={styles.title}>뚜껑 열었더니 🎯</h1>

      {/* Question recap */}
      <div className={styles.questionCard}>
        <p className={styles.questionText}>{result.title}</p>
        <div className={styles.outcomeRow}>
          <span className={styles.outcomeLabel}>실제로는</span>
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
            <span className={styles.outcomeLabel}>내가 찍은 건</span>
            <Badge
              size="medium"
              variant="weak"
              color={OUTCOME_COLORS[myVote.choice]}
            >
              {OUTCOME_LABELS[myVote.choice]}
              {myVote.choice === result.actualOutcome ? ' 빙고! 🎯' : ' 아 아깝 😭'}
            </Badge>
          </div>
        )}
      </div>

      {/* Crowd result */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>다들 뭐 찍었나 👥</h3>
          <Badge
            size="small"
            variant="fill"
            color={crowdCorrect ? 'green' : 'red'}
          >
            {crowdCorrect ? '빙고! 🎯' : '다 같이 틀림 😭'}
          </Badge>
        </div>
        <CrowdBar result={result.crowdResult} animated={false} />
      </div>

      {/* Character results */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>우리 집 전문가 성적표 📋</h3>
          <span className={styles.score}>{correctCount}/5 맞힘</span>
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
        <span className={styles.aiLabel}>한줄 정리 🤖</span>
        <p>{result.aiComment}</p>
      </div>

      {/* This month leaderboard */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>이번 달 누가 제일 잘 맞혔냐 🏆</h3>
        <div className={styles.leaderboard}>
          {MOCK_CHARACTER_ACCURACY.map((c, i) => (
            <div key={c.character} className={styles.leaderRow}>
              <span className={styles.leaderRank}>{i + 1}</span>
              <span className={`${styles.leaderEmoji} tossface`}>{c.emoji}</span>
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
          오늘 거 나도 한 표 ✋
        </Button>
      </div>

      <Disclaimer />
    </div>
  )
}
