import type { VoteResult } from '@/types/vote'
import type { VoteRecord } from '@/lib/utils/voteHistory'

interface Props {
  result: VoteResult
  myVote: VoteRecord | null
  streak: number
  accuracyPercent: number | null
}

const OUTCOME_LABELS = { bullish: '올라갔다 📈', bearish: '망했다 📉', neutral: '그냥 그랬다 🤷' } as const

export function ShareCard({ result, myVote, streak, accuracyPercent }: Props) {
  const isCorrect = myVote?.choice === result.actualOutcome
  const correctCount = result.characters.filter((c) => c.isCorrect).length

  return (
    <div style={{
      width: 340,
      background: '#ffffff',
      borderRadius: 20,
      padding: '24px 20px',
      fontFamily: "'Toss Product Sans', -apple-system, sans-serif",
      color: '#191f28',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#3182f6' }}>시그널플레이</span>
        <span style={{ fontSize: 12, color: '#8b95a1', marginLeft: 'auto' }}>오늘의 결과</span>
      </div>

      {/* Question */}
      <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 12, color: '#191f28' }}>
        {result.title}
      </p>

      {/* Outcome */}
      <div style={{
        background: '#f4f5f7',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#6b7684' }}>실제로는</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#191f28' }}>
          {OUTCOME_LABELS[result.actualOutcome]}
        </span>
      </div>

      {/* My result */}
      {myVote && (
        <div style={{
          background: isCorrect ? '#e8f8ee' : '#fef0f0',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: isCorrect ? '#1a7a40' : '#a83232' }}>내 예측</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: isCorrect ? '#1a7a40' : '#a83232' }}>
            {isCorrect ? '✅ 적중!' : '❌ 빗나감'}
          </span>
        </div>
      )}

      {/* Character score */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {result.characters.map((c) => (
          <div key={c.character} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: c.isCorrect ? '#e8f8ee' : '#f4f5f7',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
          }}>
            <span>{c.emoji}</span>
            <span style={{ color: c.isCorrect ? '#1a7a40' : '#6b7684' }}>{c.isCorrect ? '✓' : '✗'}</span>
          </div>
        ))}
        <span style={{ fontSize: 12, color: '#6b7684', alignSelf: 'center' }}>
          {correctCount}/5 적중
        </span>
      </div>

      {/* Stats */}
      {(streak > 0 || accuracyPercent !== null) && (
        <div style={{ display: 'flex', gap: 6 }}>
          {streak > 0 && (
            <span style={{
              fontSize: 11, background: '#e8f0ff', color: '#3182f6',
              borderRadius: 6, padding: '3px 8px', fontWeight: 600,
            }}>🔥 {streak}일 연속</span>
          )}
          {accuracyPercent !== null && (
            <span style={{
              fontSize: 11, background: '#e8f8ee', color: '#1a7a40',
              borderRadius: 6, padding: '3px 8px', fontWeight: 600,
            }}>{accuracyPercent}% 적중률</span>
          )}
        </div>
      )}
    </div>
  )
}
