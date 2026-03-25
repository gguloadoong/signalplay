/**
 * score.ts + signal.ts 삭제로 줄어드는 24개 테스트를 대체하는 추가 커버리지
 * format / voteHistory / share 유틸의 엣지 케이스 및 누락 케이스를 보완
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { formatScore, formatTimeRemaining, formatDate, formatPercent } from '../format'
import { saveVote, getVote } from '../voteHistory'
import type { VoteRecord } from '../voteHistory'
import { generateVoteShareText, generateResultShareText } from '../share'

// ─── localStorage 모킹 ────────────────────────────────────────────────────────
let store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
}
vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => { store = {} })

// ─── format 추가 케이스 ───────────────────────────────────────────────────────
describe('formatScore (추가)', () => {
  it('큰 양수 → +N', () => {
    expect(formatScore(1000)).toBe('+1000')
  })

  it('-1 → -1', () => {
    expect(formatScore(-1)).toBe('-1')
  })

  it('소수 입력 → 부호 포함 소수', () => {
    expect(formatScore(3.5)).toBe('+3.5')
  })
})

describe('formatTimeRemaining (추가)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('정확히 60분 → 1시간 0분 남음', () => {
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    expect(formatTimeRemaining('2026-03-25T11:00:00Z')).toBe('1시간 0분 남음')
  })

  it('24시간 이상 → 24시간 0분 남음', () => {
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    expect(formatTimeRemaining('2026-03-26T10:00:00Z')).toBe('24시간 0분 남음')
  })

  it('정확히 1분 → 1분 남음', () => {
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    expect(formatTimeRemaining('2026-03-25T10:01:00Z')).toBe('1분 남음')
  })

  it('이미 지난 시간 → 마감', () => {
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'))
    expect(formatTimeRemaining('2026-03-24T09:00:00Z')).toBe('마감')
  })
})

describe('formatDate (추가)', () => {
  it('1월 1일 (수)', () => {
    const result = formatDate('2025-01-01')
    expect(result).toContain('1월')
    expect(result).toContain('1일')
  })

  it('12월 31일', () => {
    const result = formatDate('2025-12-31')
    expect(result).toContain('12월')
    expect(result).toContain('31일')
  })
})

describe('formatPercent (추가)', () => {
  it('100% → 100%', () => {
    expect(formatPercent(100)).toBe('100%')
  })

  it('33.4 → 33% (내림)', () => {
    expect(formatPercent(33.4)).toBe('33%')
  })

  it('33.5 → 34% (반올림)', () => {
    expect(formatPercent(33.5)).toBe('34%')
  })

  it('0.1 → 0%', () => {
    expect(formatPercent(0.1)).toBe('0%')
  })
})

// ─── voteHistory 추가 케이스 ──────────────────────────────────────────────────
const makeRecord = (id: string, choice: VoteRecord['choice'] = 'bullish'): VoteRecord => ({
  questionId: id,
  date: new Date().toISOString().split('T')[0],
  title: `질문 ${id}`,
  choice,
})

describe('voteHistory (추가)', () => {
  it('bullish / bearish / neutral 모두 저장·조회', () => {
    saveVote(makeRecord('q1', 'bullish'))
    saveVote(makeRecord('q2', 'bearish'))
    saveVote(makeRecord('q3', 'neutral'))
    expect(getVote('q1')?.choice).toBe('bullish')
    expect(getVote('q2')?.choice).toBe('bearish')
    expect(getVote('q3')?.choice).toBe('neutral')
  })

  it('존재하지 않는 ID → null', () => {
    saveVote(makeRecord('q1'))
    expect(getVote('qXXX')).toBeNull()
  })

  it('덮어쓰기해도 다른 기록은 유지됨', () => {
    saveVote(makeRecord('q1', 'bullish'))
    saveVote(makeRecord('q2', 'neutral'))
    saveVote({ ...makeRecord('q1'), choice: 'bearish' })
    expect(getVote('q1')?.choice).toBe('bearish')
    expect(getVote('q2')?.choice).toBe('neutral')
  })

  it('localStorage 완전히 비어있으면 null', () => {
    expect(getVote('any')).toBeNull()
  })

  it('title에 특수문자 포함된 기록도 저장·조회', () => {
    const record: VoteRecord = {
      questionId: 'q-special',
      date: new Date().toISOString().split('T')[0],
      title: '삼성전자 "어닝 서프라이즈" 예상?',
      choice: 'bullish',
    }
    saveVote(record)
    expect(getVote('q-special')?.title).toBe('삼성전자 "어닝 서프라이즈" 예상?')
  })
})

// ─── share 추가 케이스 ────────────────────────────────────────────────────────
describe('generateVoteShareText (추가)', () => {
  it('totalVotes 0명 → 0명 포함', () => {
    const text = generateVoteShareText({
      title: '테스트', question: '질문', crowdBullish: 50,
      crowdBearish: 30, crowdNeutral: 20, totalVotes: 0,
    })
    expect(text).toContain('0명')
  })

  it('totalVotes 10000 → 1,000단위 콤마', () => {
    const text = generateVoteShareText({
      title: '테스트', question: '질문', crowdBullish: 50,
      crowdBearish: 30, crowdNeutral: 20, totalVotes: 10000,
    })
    expect(text).toContain('10,000명')
  })

  it('characters 빈 배열 → 방구석 전문가 미포함', () => {
    const text = generateVoteShareText({
      title: '테스트', question: '질문', crowdBullish: 50,
      crowdBearish: 30, crowdNeutral: 20, totalVotes: 100, characters: [],
    })
    expect(text).not.toContain('방구석 전문가')
  })
})

describe('generateResultShareText (추가)', () => {
  it('streak 0일 → 0일 연속 포함', () => {
    const text = generateResultShareText({
      title: '테스트', crowdCorrect: true,
      characters: [{ emoji: '💼', name: '밸류김', isCorrect: true }],
      myCorrect: true, streak: 0,
    })
    expect(text).toContain('0일 연속')
  })

  it('myCorrect false → 다음엔 포함', () => {
    const text = generateResultShareText({
      title: '테스트', crowdCorrect: false,
      characters: [{ emoji: '💼', name: '밸류김', isCorrect: false }],
      myCorrect: false, streak: 0,
    })
    expect(text).toContain('아 아깝 😭')
  })

  it('전원 적중 시 모두 ✅', () => {
    const text = generateResultShareText({
      title: '테스트', crowdCorrect: true,
      characters: [
        { emoji: '💼', name: '밸류김', isCorrect: true },
        { emoji: '📚', name: '팩터박', isCorrect: true },
      ],
      myCorrect: true, streak: 5,
    })
    expect(text.match(/빙고/g)?.length).toBeGreaterThanOrEqual(3)
  })
})
