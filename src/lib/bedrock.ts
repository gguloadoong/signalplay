/**
 * 앱인토스 Bedrock SDK 래퍼
 *
 * 실제 환경: @apps-in-toss/web-framework 사용
 * 개발 환경: 자동 모킹 (토스 WebView 외부)
 */

/** 토스 WebView 환경인지 감지 */
export function isTossWebView(): boolean {
  try {
    // web-framework는 토스 앱 내부에서만 브릿지가 활성화됨
    return typeof window !== 'undefined' &&
      !!(window as unknown as Record<string, unknown>).__granite__
  } catch {
    return false
  }
}

/** 토스 로그인 — authorizationCode 획득 */
export async function loginWithToss(): Promise<{
  userId: string
  nickname: string
}> {
  if (isTossWebView()) {
    try {
      const { appLogin } = await import('@apps-in-toss/web-framework')
      const { authorizationCode } = await appLogin()
      // authorizationCode를 서버로 보내 유저 정보를 받아와야 함
      // 현재는 코드를 userId로 임시 사용
      return {
        userId: authorizationCode.slice(0, 16),
        nickname: '토스유저',
      }
    } catch (e) {
      console.error('[Bedrock] appLogin failed:', e)
    }
  }

  // 개발 모킹
  return {
    userId: `mock-${Date.now()}`,
    nickname: '테스트유저',
  }
}

/** 토스 게임센터 리더보드 점수 제출 */
export async function submitLeaderboardScore(
  score: number,
): Promise<'SUCCESS' | 'FAILED'> {
  if (isTossWebView()) {
    try {
      const { submitGameCenterLeaderBoardScore } = await import(
        '@apps-in-toss/web-framework'
      )
      const result = await submitGameCenterLeaderBoardScore({
        score: String(score),
      })
      if (result?.statusCode === 'SUCCESS') return 'SUCCESS'
      console.warn('[Bedrock] leaderboard submit:', result?.statusCode)
      return 'FAILED'
    } catch (e) {
      console.error('[Bedrock] submitScore failed:', e)
      return 'FAILED'
    }
  }

  console.log('[Mock] submitLeaderboardScore:', score)
  return 'SUCCESS'
}

/** AdMob 리워드 광고 로드 + 표시 */
export async function showRewardAd(): Promise<{ completed: boolean }> {
  if (isTossWebView()) {
    try {
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework')

      if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
        console.warn('[Bedrock] AdMob not supported')
        return { completed: false }
      }

      return new Promise((resolve) => {
        GoogleAdMob.loadAppsInTossAdMob({
          options: { adGroupId: import.meta.env.VITE_AD_GROUP_ID || '' },
          onEvent: (event) => {
            if (event.type === 'loaded') {
              GoogleAdMob.showAppsInTossAdMob({
                options: { adGroupId: import.meta.env.VITE_AD_GROUP_ID || '' },
                onEvent: (showEvent) => {
                  if (showEvent.type === 'userEarnedReward') resolve({ completed: true })
                  if (showEvent.type === 'dismissed') resolve({ completed: false })
                },
                onError: () => resolve({ completed: false }),
              })
            }
          },
          onError: () => resolve({ completed: false }),
        })
      })
    } catch (e) {
      console.error('[Bedrock] showRewardAd failed:', e)
      return { completed: false }
    }
  }

  console.log('[Mock] showRewardAd — 광고 시청 완료')
  return { completed: true }
}

/** 전면 광고 표시 */
export async function showInterstitialAd(): Promise<void> {
  if (isTossWebView()) {
    try {
      const { loadFullScreenAd, showFullScreenAd } = await import(
        '@apps-in-toss/web-framework'
      )
      loadFullScreenAd({
        onEvent: () => {
          showFullScreenAd({
            onEvent: () => {},
            onError: () => {},
          })
        },
        onError: (e) => console.error('[Bedrock] loadFullScreenAd error:', e),
      })
    } catch (e) {
      console.error('[Bedrock] showInterstitialAd failed:', e)
    }
    return
  }

  console.log('[Mock] showInterstitialAd')
}

/** 토스 공유 */
export async function shareViaToss(text: string): Promise<void> {
  // 토스 앱 내부에서는 Web Share API가 토스 공유 시트로 연결됨
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return
    } catch {
      // 사용자 취소
    }
  }

  // 폴백: 클립보드
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    console.warn('[Bedrock] share failed')
  }
}
