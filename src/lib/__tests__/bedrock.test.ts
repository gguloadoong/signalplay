import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isTossWebView,
  loginWithToss,
  submitLeaderboardScore,
  showRewardAd,
  showInterstitialAd,
  shareViaToss,
} from '../bedrock'

describe('isTossWebView', () => {
  it('__granite__ 없으면 false 반환', () => {
    expect(isTossWebView()).toBe(false)
  })

  it('__granite__ 있으면 true 반환', () => {
    ;(window as unknown as Record<string, unknown>).__granite__ = {}
    expect(isTossWebView()).toBe(true)
    delete (window as unknown as Record<string, unknown>).__granite__
  })
})

describe('loginWithToss', () => {
  it('userId와 nickname 반환', async () => {
    const result = await loginWithToss()
    expect(result).toHaveProperty('userId')
    expect(result).toHaveProperty('nickname')
    expect(typeof result.userId).toBe('string')
    expect(typeof result.nickname).toBe('string')
  })

  it('userId는 mock- 접두사 포함', async () => {
    const result = await loginWithToss()
    expect(result.userId).toMatch(/^mock-/)
  })
})

describe('submitLeaderboardScore', () => {
  it('항상 SUCCESS 반환', async () => {
    const result = await submitLeaderboardScore(100)
    expect(result).toBe('SUCCESS')
  })

  it('0점도 SUCCESS 반환', async () => {
    const result = await submitLeaderboardScore(0)
    expect(result).toBe('SUCCESS')
  })
})

describe('showRewardAd', () => {
  it('completed: true 반환', async () => {
    const result = await showRewardAd()
    expect(result).toEqual({ completed: true })
  })
})

describe('showInterstitialAd', () => {
  it('void 반환 (예외 없음)', async () => {
    await expect(showInterstitialAd()).resolves.toBeUndefined()
  })
})

describe('shareViaToss', () => {
  const text = '테스트 공유 텍스트'

  beforeEach(() => {
    vi.stubGlobal('navigator', { share: undefined, clipboard: undefined })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigator.share 없고 clipboard 없어도 예외 없음', async () => {
    await expect(shareViaToss(text)).resolves.toBeUndefined()
  })

  it('navigator.share 있으면 share 호출', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share: mockShare, clipboard: undefined })
    await shareViaToss(text)
    expect(mockShare).toHaveBeenCalledWith({ text })
  })

  it('navigator.share 취소(AbortError) 시 clipboard fallback', async () => {
    const mockShare = vi.fn().mockRejectedValue(new DOMException('', 'AbortError'))
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share: mockShare,
      clipboard: { writeText: mockWrite },
    })
    await shareViaToss(text)
    expect(mockWrite).toHaveBeenCalledWith(text)
  })

  it('navigator.share 없으면 clipboard.writeText 호출', async () => {
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share: undefined,
      clipboard: { writeText: mockWrite },
    })
    await shareViaToss(text)
    expect(mockWrite).toHaveBeenCalledWith(text)
  })

  it('clipboard.writeText 실패해도 예외 없음', async () => {
    const mockWrite = vi.fn().mockRejectedValue(new Error('Permission denied'))
    vi.stubGlobal('navigator', {
      share: undefined,
      clipboard: { writeText: mockWrite },
    })
    await expect(shareViaToss(text)).resolves.toBeUndefined()
  })
})
