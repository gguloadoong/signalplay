import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toPng } from 'html-to-image'
import { showInterstitialAd } from '@/lib/bedrock'
import { useWebToast } from '@toss/tds-mobile'
import { TdsButton as Button } from '@/components/shared/TdsButton'
import { TdsBadge as Badge } from '@/components/shared/TdsBadge'
import { Disclaimer } from '@/components/shared/Disclaimer'
import { EmptyState } from '@/components/shared/EmptyState'
import { CharacterCard } from '@/components/vote/CharacterCard'
import { CrowdBar } from '@/components/vote/CrowdBar'
import { ShareCard } from '@/components/shared/ShareCard'
import { getVote } from '@/lib/utils/voteHistory'
import { recordResult, getStreak, getAccuracyPercent, getCharacterAlignment } from '@/lib/utils/userStats'
import { generateResultShareText, shareText } from '@/lib/utils/share'
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

const AD_SESSION_KEY = 'sp_interstitial_shown'

export function ResultPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<VoteResult | null | undefined>(undefined)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const { openToast } = useWebToast()

  useEffect(() => {
    if (!sessionStorage.getItem(AD_SESSION_KEY)) {
      sessionStorage.setItem(AD_SESSION_KEY, 'true')
      showInterstitialAd()
    }
  }, [])

  useEffect(() => {
    api.getResult().then(({ data }) => {
      // data null = API 연결됐지만 결과 없음, undefined = API 실패 → mock 폴백
      const r = data !== undefined ? data : MOCK_VOTE_RESULT
      setResult(r)
      if (r) {
        const vote = getVote(r.questionId)
        if (vote) recordResult(r.questionId, vote.choice === r.actualOutcome)
      }
    })
  }, [])

  const myVote = result ? getVote(result.questionId) : null

  const handleShare = useCallback(async () => {
    if (!result) return
    const vote = getVote(result.questionId)

    // 이미지 공유 시도
    if (shareCardRef.current && navigator.canShare) {
      try {
        const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2 })
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        const file = new File([blob], 'signalplay-result.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: '시그널플레이 결과' })
          return
        }
      } catch { /* 이미지 공유 실패 시 텍스트로 폴백 */ }
    }

    // 텍스트 폴백
    const crowdWon = result.crowdResult.bullish >= result.crowdResult.bearish &&
      result.crowdResult.bullish >= result.crowdResult.neutral
        ? result.actualOutcome === 'bullish'
        : result.crowdResult.bearish >= result.crowdResult.neutral
          ? result.actualOutcome === 'bearish'
          : result.actualOutcome === 'neutral'
    const text = generateResultShareText({
      title: result.title,
      crowdCorrect: crowdWon,
      characters: result.characters.map((c) => ({ emoji: c.emoji, name: c.name, isCorrect: c.isCorrect })),
      myCorrect: vote ? vote.choice === result.actualOutcome : false,
      streak: getStreak(),
    })
    const res = await shareText(text)
    if (res === 'copied') {
      openToast('클립보드에 복사됨!', { duration: 2000 })
    }
  }, [result])

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

  const isCorrect = myVote?.choice === result.actualOutcome

  return (
    <div className={styles.page}>
      {/* 결과 헤더 — 스크롤 없이 3초 내 적중 여부 확인 */}
      {myVote ? (
        <div className={`${styles.outcomeHeader} ${isCorrect ? styles.outcomeHeaderHit : styles.outcomeHeaderMiss}`}>
          <p className={styles.outcomeHeaderTitle}>{result.title}</p>
          <div className={styles.outcomeHeaderRow}>
            <span>내 예측 <strong>{OUTCOME_LABELS[myVote.choice]}</strong></span>
            <span className={styles.outcomeArrow}>→</span>
            <span>실제 <strong>{OUTCOME_LABELS[result.actualOutcome]}</strong></span>
          </div>
          <p className={styles.outcomeVerdict}>{isCorrect ? '✅ 적중!' : '❌ 빗나감'}</p>
        </div>
      ) : (
        <h1 className={styles.title}>뚜껑 열었더니 🎯</h1>
      )}

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
      </div>

      {/* 내 성적 배지 */}
      {(() => {
        const streak = getStreak()
        const accuracy = getAccuracyPercent()
        const alignment = getCharacterAlignment()
        if (streak === 0 && accuracy === null && alignment === null) return null
        return (
          <div className={styles.statsRow}>
            {streak > 0 && (
              <Badge size="small" variant="weak" color="blue">🔥 {streak}일 연속</Badge>
            )}
            {accuracy !== null && (
              <Badge size="small" variant="weak" color="green">{accuracy}% 적중</Badge>
            )}
            {alignment !== null && (
              <Badge size="small" variant="weak" color="elephant">
                {alignment.emoji} {alignment.name}파 {alignment.rate}%
              </Badge>
            )}
          </div>
        )
      })()}

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

      <div className={styles.actions}>
        <Button size="medium" variant="fill" color="primary" onClick={() => navigate('/')}>
          오늘 투표하기 →
        </Button>
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
              <span className={styles.leaderEmoji}>{c.emoji}</span>
              <span className={styles.leaderName}>{c.name}</span>
              <div className={styles.leaderBarWrap}>
                <div className={styles.leaderBar} style={{ width: `${c.rate}%` }} />
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
        <Button size="medium" variant="weak" color="primary" onClick={handleShare}>
          결과 공유하기
        </Button>
      </div>

      <Disclaimer />

      {/* 공유 이미지 생성용 — 화면 밖에 렌더링 */}
      <div ref={shareCardRef} style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <ShareCard
          result={result}
          myVote={myVote}
          streak={getStreak()}
          accuracyPercent={getAccuracyPercent()}
        />
      </div>
    </div>
  )
}
