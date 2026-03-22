/**
 * 점수를 부호 포함 문자열로 포맷
 */
export function formatScore(score: number): string {
  return score > 0 ? `+${score}` : `${score}`
}

/**
 * 남은 시간을 "N시간 M분" 형태로 포맷
 */
export function formatTimeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return '마감'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}시간 ${minutes}분 남음`
  if (minutes > 0) return `${minutes}분 남음`
  return '곧 마감'
}

/**
 * 날짜를 "3월 22일 (토)" 형태로 포맷
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[date.getDay()]
  return `${month}월 ${day}일 (${dayName})`
}

/**
 * 퍼센트 포맷 (소수점 없이)
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
