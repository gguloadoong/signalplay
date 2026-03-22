interface ShareData {
  correctCount: number
  totalCount: number
  score: number
  streak: number
  isPerfect: boolean
  rank?: number
}

/**
 * 결과 공유 텍스트 생성
 */
export function generateShareText(data: ShareData): string {
  const emoji = data.isPerfect ? '🎉' : data.correctCount >= 2 ? '🎯' : '📊'
  const lines = [
    `${emoji} 시그널플레이 결과`,
    '',
    `적중 ${data.correctCount}/${data.totalCount} | ${data.score > 0 ? '+' : ''}${data.score}점`,
    data.isPerfect ? '🏆 PERFECT!' : '',
    `🔥 ${data.streak}일 연속 참여`,
    data.rank ? `📈 주간 랭킹 ${data.rank}위` : '',
    '',
    '나도 도전하기 👉 signalplay.vercel.app',
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Web Share API 또는 클립보드 복사
 */
export async function shareResult(data: ShareData): Promise<'shared' | 'copied' | 'failed'> {
  const text = generateShareText(data)

  // Web Share API 지원 시
  if (navigator.share) {
    try {
      await navigator.share({
        title: '시그널플레이 결과',
        text,
      })
      return 'shared'
    } catch {
      // 사용자 취소 또는 미지원
    }
  }

  // 폴백: 클립보드 복사
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
