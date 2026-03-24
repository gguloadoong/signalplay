import type { VoteChoice } from '@/types/vote'

const CHOICE_LABEL: Record<VoteChoice, string> = {
  bullish: '📈 호재',
  bearish: '📉 악재',
  neutral: '🤷 글쎄',
}

interface VoteShareData {
  title: string
  question: string
  crowdBullish: number
  crowdBearish: number
  crowdNeutral: number
  totalVotes: number
  characters?: Array<{ emoji: string; name: string; prediction: VoteChoice }>
}

interface ResultShareData {
  title: string
  crowdCorrect: boolean
  characters: Array<{ emoji: string; name: string; isCorrect: boolean }>
  myCorrect: boolean
  streak: number
}

/**
 * 투표 공유 카드 텍스트 — "너는 어떻게 봐?"
 */
export function generateVoteShareText(data: VoteShareData): string {
  const lines = [
    `⚡ 시그널플레이 — 오늘의 질문`,
    '',
    `${data.title}`,
    `${data.question}`,
    '',
    `토스 유저 ${data.totalVotes.toLocaleString()}명 투표:`,
    `${CHOICE_LABEL.bullish} ${data.crowdBullish}% | ${CHOICE_LABEL.neutral} ${data.crowdNeutral}% | ${CHOICE_LABEL.bearish} ${data.crowdBearish}%`,
    '',
  ]

  if (data.characters?.length) {
    lines.push('AI 점쟁이:')
    for (const c of data.characters) {
      lines.push(`${c.emoji} ${c.name}: ${CHOICE_LABEL[c.prediction]}`)
    }
    lines.push('')
  }

  lines.push('너는 어떻게 봐? 👉 signalplay.vercel.app')
  return lines.join('\n')
}

/**
 * 결과 공유 카드 텍스트
 */
export function generateResultShareText(data: ResultShareData): string {
  const lines = [
    `🎯 시그널플레이 — 어제의 결과`,
    '',
    `${data.title}`,
    `군중: ${data.crowdCorrect ? '✅ 적중!' : '❌ 빗나감'}`,
    '',
    'AI 점쟁이 적중:',
  ]

  for (const c of data.characters) {
    lines.push(`${c.emoji} ${c.name}: ${c.isCorrect ? '✅' : '❌'}`)
  }

  lines.push('')
  lines.push(`나: ${data.myCorrect ? '✅ 맞혔다!' : '❌ 다음엔...'} | 🔥 ${data.streak}일 연속`)
  lines.push('')
  lines.push('나도 도전 👉 signalplay.vercel.app')
  return lines.join('\n')
}

/**
 * Web Share API 또는 클립보드 복사
 */
export async function shareText(text: string): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share({ title: '시그널플레이', text })
      return 'shared'
    } catch {
      // 사용자 취소
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
