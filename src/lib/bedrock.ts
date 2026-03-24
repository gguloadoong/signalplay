/**
 * 앱인토스 Bedrock SDK 래퍼 — 모킹 전용
 *
 * 실제 토스 WebView 연동은 앱인토스 파트너 등록 후 @apps-in-toss/web-framework 재설치
 */

export function isTossWebView(): boolean {
  try {
    return typeof window !== 'undefined' &&
      !!(window as unknown as Record<string, unknown>).__granite__
  } catch {
    return false
  }
}

export async function loginWithToss(): Promise<{ userId: string; nickname: string }> {
  // TODO: 앱인토스 등록 후 실제 SDK 연동
  return { userId: `mock-${Date.now()}`, nickname: '테스트유저' }
}

export async function submitLeaderboardScore(score: number): Promise<'SUCCESS' | 'FAILED'> {
  console.log('[Mock] submitLeaderboardScore:', score)
  return 'SUCCESS'
}

export async function showRewardAd(): Promise<{ completed: boolean }> {
  console.log('[Mock] showRewardAd — 시청 완료')
  return { completed: true }
}

export async function showInterstitialAd(): Promise<void> {
  console.log('[Mock] showInterstitialAd')
}

export async function shareViaToss(text: string): Promise<void> {
  if (navigator.share) {
    try { await navigator.share({ text }); return } catch { /* 취소 */ }
  }
  try { await navigator.clipboard.writeText(text) } catch { /* 실패 */ }
}
