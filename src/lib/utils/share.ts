import type { VoteChoice, CrowdResult } from '@/types/vote'

/**
 * 군중이 예측한 결과(다수 선택)가 실제 결과와 일치하는지 판단
 */
export function isCrowdCorrect(crowd: Pick<CrowdResult, 'bullish' | 'bearish' | 'neutral'>, actual: VoteChoice): boolean {
  if (crowd.bullish >= crowd.bearish && crowd.bullish >= crowd.neutral) {
    return actual === 'bullish'
  }
  if (crowd.bearish >= crowd.neutral) {
    return actual === 'bearish'
  }
  return actual === 'neutral'
}

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
    const counts = { bullish: 0, bearish: 0, neutral: 0 }
    for (const c of data.characters) counts[c.prediction]++
    const top = (Object.entries(counts) as [VoteChoice, number][]).sort((a, b) => b[1] - a[1])[0]
    const [topChoice, topCount] = top
    lines.push(`방구석 전문가 ${topCount}/${data.characters.length}명이 ${CHOICE_LABEL[topChoice]}를 예측했어요`)
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
