import { lazy, Suspense, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWebToast, useBottomSheet } from '@toss/tds-mobile'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { generateVoteShareText, shareText } from '@/lib/utils/share'
import { formatDeadline } from '@/lib/utils/format'
import { saveVote, getVote } from '@/lib/utils/voteHistory'
import { recordVote } from '@/lib/utils/userStats'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { SuccessAnimation } from '@/components/shared/SuccessAnimation'
import { CharacterCard } from '@/components/vote/CharacterCard'
import { CrowdBar } from '@/components/vote/CrowdBar'
import { api } from '@/lib/api/client'
import { MOCK_TODAY_QUESTION, MOCK_CHARACTER_PREDICTIONS, MOCK_CROWD_RESULT } from '@/lib/mockData'
import type { VoteChoice, Question, CharacterPrediction, CrowdResult } from '@/types/vote'
import styles from './VotePage.module.css'

const WeeklyPicksSection = lazy(() =>
  import('@/components/vote/WeeklyPicksSection').then((m) => ({ default: m.WeeklyPicksSection }))
)

const VOTE_OPTIONS: { value: VoteChoice; label: string; emoji: string }[] = [
  { value: 'bullish', label: '올라갈 듯', emoji: '📈' },
  { value: 'neutral', label: '모르겠는데', emoji: '🤷' },
  { value: 'bearish', label: '망할 듯', emoji: '📉' },
]


const FIRST_VOTE_KEY = 'sp_first_vote_explained'

const CATEGORY_COLOR: Record<string, 'blue' | 'green' | 'yellow'> = {
  종목: 'blue',
  지수: 'green',
  매크로: 'yellow',
}

type QuestionData = Question & { characters: CharacterPrediction[]; crowd?: CrowdResult }

export function VotePage() {
  const navigate = useNavigate()
  const [questionData, setQuestionData] = useState<QuestionData | null>(null)
  const [crowd, setCrowd] = useState<CrowdResult>(MOCK_CROWD_RESULT)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState<VoteChoice | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [updates, setUpdates] = useState<{
    midday_comments: Array<{ character: string; name: string; emoji: string; comment: string }> | null
    close_reactions: Array<{ character: string; name: string; emoji: string; comment: string; isCorrect: boolean }> | null
  } | null>(null)
  const [myReactions, setMyReactions] = useState<Record<string, string>>({})
  const { openToast } = useWebToast()
  const { openOneButtonSheet } = useBottomSheet()

  useEffect(() => {
    api.getQuestion().then(({ data }) => {
      const q = data ?? ({ ...MOCK_TODAY_QUESTION, characters: MOCK_CHARACTER_PREDICTIONS } as QuestionData)
      setQuestionData(q)
      const existing = getVote(q.id)
      if (existing) {
        setVoted(existing.choice)
        if (q.crowd) setCrowd(q.crowd)
        api.getUpdates(q.id).then(({ data: upd }) => { if (upd) setUpdates(upd) })
      }
      const saved = localStorage.getItem(`sp_reactions_${q.id}`)
      if (saved) setMyReactions(JSON.parse(saved) as Record<string, string>)
      setLoading(false)
    })
    api.getResult().then(({ data }) => {
      setHasResult(!!data)
    })
  }, [])

  const handleVote = useCallback(async (choice: VoteChoice) => {
    if (voted || !questionData) return
    setVoted(choice)
    setShowSuccess(true)
    saveVote({
      questionId: questionData.id,
      date: questionData.date,
      title: questionData.title,
      choice,
      characterPredictions: questionData.characters.map((c) => ({ character: c.character, prediction: c.prediction })),
    })
    recordVote(questionData.date)
    const { data } = await api.vote({ questionId: questionData.id, vote: choice })
    if (data?.crowd) {
      setCrowd({ ...data.crowd })
    }
    api.getUpdates(questionData.id).then(({ data: upd }) => { if (upd) setUpdates(upd) })
    // 첫 투표 후 앱 설명 바텀시트 (1회만)
    if (!localStorage.getItem(FIRST_VOTE_KEY)) {
      localStorage.setItem(FIRST_VOTE_KEY, 'true')
      openOneButtonSheet({
        header: '🎉 첫 투표 완료!',
        button: '알겠어, 내일 또 올게 👍',
      })
    }
  }, [voted, questionData, openOneButtonSheet])

  const handleAnimationComplete = useCallback(() => {
    setShowSuccess(false)
  }, [])

  const handleReact = useCallback(async (character: string, reaction: string) => {
    if (!questionData) return
    const prev = myReactions[character]
    if (prev === reaction) return // 같은 반응 재클릭 무시

    const updated = { ...myReactions, [character]: reaction }
    setMyReactions(updated)
    localStorage.setItem(`sp_reactions_${questionData.id}`, JSON.stringify(updated))

    // 옵티미스틱 업데이트: 이전 반응 감소 + 새 반응 증가
    setQuestionData((q) => {
      if (!q) return q
      return {
        ...q,
        characters: q.characters.map((c) => {
          if (c.character !== character) return c
          const reactions = { ...(c.emojiReactions ?? {}) }
          if (prev && reactions[prev] && reactions[prev] > 0) {
            reactions[prev] = reactions[prev] - 1
          }
          reactions[reaction] = (reactions[reaction] ?? 0) + 1
          return { ...c, emojiReactions: reactions }
        }),
      }
    })

    await api.react({ questionId: questionData.id, character, reaction, prevReaction: prev })
  }, [questionData, myReactions])

  const handleShare = useCallback(async () => {
    if (!questionData) return
    const text = generateVoteShareText({
      title: questionData.title,
      question: questionData.question,
      crowdBullish: crowd.bullish,
      crowdBearish: crowd.bearish,
      crowdNeutral: crowd.neutral,
      totalVotes: crowd.totalVotes,
      characters: questionData.characters.map((c) => ({
        emoji: c.emoji,
        name: c.name,
        prediction: c.prediction,
      })),
    })
    const result = await shareText(text)
    if (result === 'copied') {
      openToast('복사됨! 카톡에 붙여넣기 고고 📋', { duration: 2000 })
    }
  }, [questionData, crowd, openToast])

  if (loading) {
    return (
      <div className={styles.page}>
        <EmptyState emoji="⏳" title="잠깐만, 오늘 질문 가져오는 중 🏃" description="" />
      </div>
    )
  }

  if (!questionData) {
    return (
      <div className={styles.page}>
        <EmptyState
          emoji="☕"
          title="오늘 질문 아직 안 왔어"
          description="매일 오전 9시에 새 질문 투하됨 ☕"
        />
      </div>
    )
  }

  const characters = questionData.characters

  const disagreeCallout = (() => {
    const bullish = characters.find((c) => c.prediction === 'bullish')
    const bearish = characters.find((c) => c.prediction === 'bearish')
    if (bullish && bearish) return `💡 ${bullish.name}은 호재, ${bearish.name}은 악재를 예측했어요`
    return null
  })()

  return (
    <div className={styles.page}>
      <SuccessAnimation show={showSuccess} onComplete={handleAnimationComplete} />
      {/* Result banner — result_ready 데이터 있을 때만 노출 */}
      {hasResult && (
        <button className={styles.resultBanner} onClick={() => navigate('/result')}>
          <Badge size="xsmall" variant="fill" color="red">NEW</Badge>
          <span className={styles.resultText}>어제 뚜껑 열렸다 👀</span>
          <span aria-hidden="true">→</span>
        </button>
      )}

      {/* Question card */}
      <div className={styles.questionCard}>
        <div className={styles.questionMeta}>
          <Badge
            size="small"
            variant="weak"
            color={CATEGORY_COLOR[questionData.category] ?? 'blue'}
          >
            {questionData.category}
          </Badge>
          <span className={styles.deadline}>{formatDeadline(questionData.deadline)}</span>
        </div>
        <h2 className={styles.questionTitle}>{questionData.title}</h2>
        <p className={styles.questionText}>{questionData.question}</p>
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
            한 표 던짐 ✅ 나는:{' '}
            <b>{VOTE_OPTIONS.find((o) => o.value === voted)?.label}</b>
          </div>
          {voted && (() => {
            const syncCount = characters.filter((c) => c.prediction === voted).length
            const msg = syncCount === 0
              ? '방구석 전문가들은 모두 다른 의견이에요 👀'
              : syncCount === characters.length
              ? '방구석 전문가 전원과 같은 선택이에요! 🎯'
              : `방구석 전문가 ${characters.length}명 중 ${syncCount}명이 같은 선택을 했어요`
            return <p className={styles.syncMsg}>{msg}</p>
          })()}
          <CrowdBar result={crowd} animated />

          {/* 캐릭터 드라마 타임라인 */}
          {updates?.midday_comments && (
            <div className={styles.dramaSection}>
              <p className={styles.dramaLabel}>☀️ 낮 12시 — 전문가들 근황</p>
              <div className={styles.dramaList}>
                {updates.midday_comments.map((c) => (
                  <div key={c.character} className={styles.dramaItem}>
                    <span className={styles.dramaEmoji}>{c.emoji}</span>
                    <div>
                      <span className={styles.dramaName}>{c.name}</span>
                      <p className={styles.dramaComment}>"{c.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {updates?.close_reactions ? (
            <div className={styles.dramaSection}>
              <p className={styles.dramaLabel}>🏁 결과 반응</p>
              <div className={styles.dramaList}>
                {updates.close_reactions.map((c) => (
                  <div key={c.character} className={styles.dramaItem}>
                    <span className={styles.dramaEmoji}>{c.emoji}</span>
                    <div>
                      <span className={styles.dramaName}>{c.name}</span>
                      <span className={styles.dramaResult}>{c.isCorrect ? ' ✅' : ' ❌'}</span>
                      <p className={styles.dramaComment}>"{c.comment}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={styles.resultWait}>🔔 오후 3:30 장 마감 후 결과 공개</p>
          )}

          <Button size="medium" variant="weak" color="primary" onClick={handleShare} className={styles.shareBtn}>
            친구한테 물어봐 💬
          </Button>
        </div>
      )}

      {!voted && (
        <p className={styles.crowdHint}>다들 뭐 찍었는지는 투표 후 공개 👀</p>
      )}

      {/* Character predictions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>우리 집 전문가 5인의 의견 🧐</h3>
        {disagreeCallout && <p className={styles.disagreeCallout}>{disagreeCallout}</p>}
        <div className={styles.characters}>
          {characters.map((pred, i) => (
            <CharacterCard
              key={pred.character}
              prediction={pred}
              defaultExpanded={i === 0}
              voted={!!voted}
              myReaction={myReactions[pred.character]}
              onReact={(reaction) => handleReact(pred.character, reaction)}
            />
          ))}
        </div>
      </section>

      <Suspense>
        <WeeklyPicksSection />
      </Suspense>
      <Disclaimer />
    </div>
  )
}
