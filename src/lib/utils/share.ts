import type { VoteChoice } from '@/types/vote'

const CHOICE_LABEL: Record<VoteChoice, string> = {
  bullish: '📈 올라갈 듯',
  bearish: '📉 망할 듯',
  neutral: '🤷 모르겠는데',
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
    `⚡ 오늘 주식 어디로 터질까`,
    '',
    `${data.title}`,
    `${data.question}`,
    '',
    `${data.totalVotes.toLocaleString()}명 참전:`,
    `${CHOICE_LABEL.bullish} ${data.crowdBullish}% | ${CHOICE_LABEL.neutral} ${data.crowdNeutral}% | ${CHOICE_LABEL.bearish} ${data.crowdBearish}%`,
    '',
  ]

  if (data.characters?.length) {
    lines.push('우리 집 전문가들 의견:')
    for (const c of data.characters) {
      lines.push(`${c.emoji} ${c.name}: ${CHOICE_LABEL[c.prediction]}`)
    }
    lines.push('')
  }

  lines.push('너는 뭐 찍을 거야? 👉 signalplay.vercel.app')
  return lines.join('\n')
}

/**
 * 결과 공유 카드 텍스트
 */
export function generateResultShareText(data: ResultShareData): string {
  const lines = [
    `🎯 뚜껑 열었더니`,
    '',
    `${data.title}`,
    `다들: ${data.crowdCorrect ? '빙고! 🎯' : '다 같이 틀림 😭'}`,
    '',
    '우리 집 전문가 성적:',
  ]

  for (const c of data.characters) {
    lines.push(`${c.emoji} ${c.name}: ${c.isCorrect ? '빙고 🎯' : '아 아깝 😭'}`)
  }

  lines.push('')
  lines.push(`나: ${data.myCorrect ? '맞혔다! 🎉' : '아 아깝 😭'} | 🔥 ${data.streak}일 연속`)
  lines.push('')
  lines.push('너도 해봐 👉 signalplay.vercel.app')
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
