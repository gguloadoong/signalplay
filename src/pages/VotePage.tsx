import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { generateVoteShareText, shareText } from '@/lib/utils/share'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { CharacterCard } from '@/components/vote/CharacterCard'
import { CrowdBar } from '@/components/vote/CrowdBar'
import { WeeklyPicksSection } from '@/components/vote/WeeklyPicksSection'
import { MOCK_TODAY_QUESTION, MOCK_CHARACTER_PREDICTIONS, MOCK_CROWD_RESULT } from '@/lib/mockData'
import type { VoteChoice } from '@/types/vote'
import styles from './VotePage.module.css'

const VOTE_OPTIONS: { value: VoteChoice; label: string; emoji: string }[] = [
  { value: 'bullish', label: '호재', emoji: '📈' },
  { value: 'neutral', label: '글쎄', emoji: '🤔' },
  { value: 'bearish', label: '악재', emoji: '📉' },
]

const CATEGORY_COLOR: Record<string, 'blue' | 'green' | 'yellow'> = {
  종목: 'blue',
  지수: 'green',
  매크로: 'yellow',
}

export function VotePage() {
  const navigate = useNavigate()
  const question = MOCK_TODAY_QUESTION
  const [voted, setVoted] = useState<VoteChoice | null>(null)
  const [shareMsg, setShareMsg] = useState('')

  const handleVote = (choice: VoteChoice) => {
    if (voted) return
    setVoted(choice)
  }

  const handleShare = useCallback(async () => {
    const text = generateVoteShareText({
      title: question.title,
      question: question.question,
      crowdBullish: MOCK_CROWD_RESULT.bullish,
      crowdBearish: MOCK_CROWD_RESULT.bearish,
      crowdNeutral: MOCK_CROWD_RESULT.neutral,
      totalVotes: MOCK_CROWD_RESULT.totalVotes,
      characters: MOCK_CHARACTER_PREDICTIONS.map((c) => ({
        emoji: c.emoji,
        name: c.name,
        prediction: c.prediction,
      })),
    })
    const result = await shareText(text)
    if (result === 'copied') {
      setShareMsg('클립보드에 복사됨!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }, [question])

  if (!question) {
    return (
      <div className={styles.page}>
        <EmptyState
          emoji="⏳"
          title="오늘의 질문 준비 중"
          description="매일 오전 9시에 새로운 질문이 도착합니다"
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Result banner */}
      <button className={styles.resultBanner} onClick={() => navigate('/result')}>
        <Badge size="xsmall" variant="fill" color="red">NEW</Badge>
        <span className={styles.resultText}>어제 질문 결과가 나왔어요!</span>
        <span>→</span>
      </button>

      {/* Question card */}
      <div className={styles.questionCard}>
        <div className={styles.questionMeta}>
          <Badge
            size="small"
            variant="weak"
            color={CATEGORY_COLOR[question.category] ?? 'blue'}
          >
            {question.category}
          </Badge>
          <span className={styles.deadline}>
            {new Date(question.deadline) > new Date() ? '투표 진행 중' : '투표 마감'}
          </span>
        </div>
        <h2 className={styles.questionTitle}>{question.title}</h2>
        <p className={styles.questionText}>{question.question}</p>
      </div>

      {/* Vote buttons */}
      {!voted ? (
        <div className={styles.voteButtons}>
          {VOTE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="large"
              variant="weak"
              color="primary"
              display="full"
              onClick={() => handleVote(opt.value)}
              className={styles.voteBtn}
            >
              <span className={styles.voteBtnEmoji}>{opt.emoji}</span>
              {opt.label}
            </Button>
          ))}
        </div>
      ) : (
        <div className={styles.votedSection}>
          <div className={styles.votedBadge}>
            투표 완료 — 내 선택:{' '}
            <b>{VOTE_OPTIONS.find((o) => o.value === voted)?.label}</b>
          </div>
          <CrowdBar result={MOCK_CROWD_RESULT} animated />
          <Button size="medium" variant="weak" color="primary" onClick={handleShare} className={styles.shareBtn}>
            공유하기 — "너는 어떻게 봐?"
          </Button>
        </div>
      )}

      {!voted && (
        <p className={styles.crowdHint}>군중 비율은 투표 후 공개됩니다</p>
      )}

      {/* Character predictions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>AI 점쟁이들의 예측</h3>
        <div className={styles.characters}>
          {MOCK_CHARACTER_PREDICTIONS.map((pred) => (
            <CharacterCard key={pred.character} prediction={pred} />
          ))}
        </div>
      </section>

      <WeeklyPicksSection />
      {shareMsg && <div className={styles.toast}>{shareMsg}</div>}
      <Disclaimer />
    </div>
  )
}
