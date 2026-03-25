import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateVoteShareText, generateResultShareText, shareText } from '../share'

describe('generateVoteShareText', () => {
  it('기본 형식으로 텍스트 생성', () => {
    const text = generateVoteShareText({
      title: '삼성전자 실적 발표',
      question: '삼성전자 실적이 호재일까?',
      crowdBullish: 60,
      crowdBearish: 25,
      crowdNeutral: 15,
      totalVotes: 1234,
    })
    expect(text).toContain('시그널플레이')
    expect(text).toContain('삼성전자 실적 발표')
    expect(text).toContain('1,234명')
    expect(text).toContain('60%')
    expect(text).toContain('signalplay.vercel.app')
  })

  it('캐릭터 예측 포함 시 방구석 전문가 요약 포함', () => {
    const text = generateVoteShareText({
      title: '테스트',
      question: '테스트 질문',
      crowdBullish: 50,
      crowdBearish: 30,
      crowdNeutral: 20,
      totalVotes: 500,
      characters: [
        { emoji: '💼', name: '엑셀형', prediction: 'bullish' },
        { emoji: '🎲', name: '운형', prediction: 'bearish' },
      ],
    })
    expect(text).toContain('방구석 전문가')
    expect(text).toContain('1/2')
  })

  it('캐릭터 없을 때 방구석 전문가 섹션 미포함', () => {
    const text = generateVoteShareText({
      title: '테스트',
      question: '테스트',
      crowdBullish: 50,
      crowdBearish: 30,
      crowdNeutral: 20,
      totalVotes: 100,
    })
    expect(text).not.toContain('방구석 전문가')
  })

  it('"AI 점쟁이" 명칭 미포함 확인 (CEO 피드백)', () => {
    const text = generateVoteShareText({
      title: '테스트',
      question: '테스트',
      crowdBullish: 50,
      crowdBearish: 30,
      crowdNeutral: 20,
      totalVotes: 100,
      characters: [{ emoji: '💼', name: '엑셀형', prediction: 'neutral' }],
    })
    expect(text).not.toContain('AI 점쟁이')
  })
})

describe('generateResultShareText', () => {
  const baseData = {
    title: '삼성전자 실적 발표',
    crowdCorrect: true,
    characters: [
      { emoji: '💼', name: '엑셀형', isCorrect: true },
      { emoji: '🎲', name: '운형', isCorrect: false },
    ],
    myCorrect: true,
    streak: 3,
  }

  it('기본 형식으로 텍스트 생성', () => {
    const text = generateResultShareText(baseData)
    expect(text).toContain('시그널플레이')
    expect(text).toContain('삼성전자 실적 발표')
    expect(text).toContain('signalplay.vercel.app')
  })

  it('군중 적중 시 ✅ 표시', () => {
    const text = generateResultShareText(baseData)
    expect(text).toContain('✅ 적중!')
  })

  it('군중 오답 시 ❌ 표시', () => {
    const text = generateResultShareText({ ...baseData, crowdCorrect: false })
    expect(text).toContain('❌ 빗나감')
  })

  it('내 예측 적중 + 연속 일수 포함', () => {
    const text = generateResultShareText(baseData)
    expect(text).toContain('✅ 맞혔다!')
    expect(text).toContain('🔥 3일 연속')
  })

  it('"방구석 전문가" 명칭 사용 확인', () => {
    const text = generateResultShareText(baseData)
    expect(text).toContain('방구석 전문가 적중:')
    expect(text).not.toContain('AI 점쟁이')
  })
})

describe('shareText', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { share: undefined, clipboard: undefined })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigator.share 성공 → shared 반환', async () => {
    vi.stubGlobal('navigator', {
      share: vi.fn().mockResolvedValue(undefined),
      clipboard: undefined,
    })
    const result = await shareText('테스트')
    expect(result).toBe('shared')
  })

  it('navigator.share 취소 → clipboard 성공 → copied 반환', async () => {
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('', 'AbortError')),
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const result = await shareText('테스트')
    expect(result).toBe('copied')
  })

  it('navigator.share 없음 + clipboard 성공 → copied 반환', async () => {
    vi.stubGlobal('navigator', {
      share: undefined,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    const result = await shareText('테스트')
    expect(result).toBe('copied')
  })

  it('navigator.share 없음 + clipboard 실패 → failed 반환', async () => {
    vi.stubGlobal('navigator', {
      share: undefined,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
    })
    const result = await shareText('테스트')
    expect(result).toBe('failed')
  })

  it('navigator.share 없음 + clipboard 없음 → failed 반환', async () => {
    const result = await shareText('테스트')
    expect(result).toBe('failed')
  })
})
