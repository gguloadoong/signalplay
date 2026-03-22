/**
 * Bedrock SDK 래퍼 — 앱인토스 WebView 환경에서 토스 기능 접근
 *
 * 실제 환경: window.toss 또는 @toss/bedrock SDK 사용
 * 개발 환경: 모킹 (isTossWebView === false)
 */

/** 토스 WebView 환경인지 감지 */
export function isTossWebView(): boolean {
  if (typeof window === 'undefined') return false
  // Bedrock SDK가 주입한 전역 객체 존재 여부로 판단
  return !!(window as unknown as Record<string, unknown>).__toss_bedrock__
}

/** 토스 로그인 */
export async function loginWithToss(): Promise<{
  userId: string
  nickname: string
}> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // const result = await toss.login()
    // return { userId: result.userId, nickname: result.nickname }
    throw new Error('Bedrock SDK not yet integrated')
  }

  // 개발 모킹
  return {
    userId: `mock-user-${Date.now()}`,
    nickname: '테스트유저',
  }
}

/** 토스 리더보드 점수 제출 */
export async function submitLeaderboardScore(score: number): Promise<void> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // await toss.leaderboard.submitScore({ score })
    console.log('[Bedrock] submitScore:', score)
    return
  }

  console.log('[Mock] submitLeaderboardScore:', score)
}

/** 토스 리더보드 조회 */
export async function getLeaderboard(): Promise<
  Array<{ rank: number; name: string; score: number }>
> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // return await toss.leaderboard.getRanking()
    throw new Error('Bedrock SDK not yet integrated')
  }

  // 개발 모킹 — mockData의 랭킹 사용
  const { MOCK_RANKING } = await import('@/lib/mockData')
  return MOCK_RANKING.map((r) => ({
    rank: r.rank,
    name: r.name,
    score: r.score,
  }))
}

/** AdMob 리워드 광고 표시 */
export async function showRewardAd(): Promise<{ completed: boolean }> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // return await toss.ad.showRewardAd()
    throw new Error('Bedrock SDK not yet integrated')
  }

  // 개발 모킹 — 항상 시청 완료
  console.log('[Mock] showRewardAd — 광고 시청 완료')
  return { completed: true }
}

/** AdMob 전면 광고 표시 */
export async function showInterstitialAd(): Promise<void> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // await toss.ad.showInterstitialAd()
    return
  }

  console.log('[Mock] showInterstitialAd')
}

/** 토스 공유 시트 */
export async function shareViaToss(text: string): Promise<void> {
  if (isTossWebView()) {
    // TODO: 실제 Bedrock SDK 호출
    // await toss.share({ text })
    return
  }

  // 폴백: Web Share API
  if (navigator.share) {
    await navigator.share({ text })
  }
}
