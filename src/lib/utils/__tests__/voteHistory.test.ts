import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveVote, getVote } from '../voteHistory'
import type { VoteRecord } from '../voteHistory'

const STORAGE_KEY = 'sp_vote_history'

let store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
}
vi.stubGlobal('localStorage', localStorageMock)

const mockRecord: VoteRecord = {
  questionId: 'q-2026-03-25',
  date: '2026-03-25',
  title: '삼성전자 실적 발표',
  choice: 'bullish',
}

beforeEach(() => {
  store = {}
})

describe('saveVote', () => {
  it('투표 저장 후 getVote로 조회 가능', () => {
    saveVote(mockRecord)
    expect(getVote(mockRecord.questionId)).toEqual(mockRecord)
  })

  it('동일 questionId 중복 저장 시 최신 기록으로 덮어씀', () => {
    saveVote(mockRecord)
    const updated: VoteRecord = { ...mockRecord, choice: 'bearish' }
    saveVote(updated)
    expect(getVote(mockRecord.questionId)?.choice).toBe('bearish')
  })

  it('여러 질문 기록을 각각 저장하고 조회', () => {
    const record2: VoteRecord = { ...mockRecord, questionId: 'q-2', title: '두 번째 질문', choice: 'neutral' }
    saveVote(mockRecord)
    saveVote(record2)
    expect(getVote('q-2')?.choice).toBe('neutral')
    expect(getVote(mockRecord.questionId)?.choice).toBe('bullish')
  })
})

describe('getVote', () => {
  it('기록 없으면 null 반환', () => {
    expect(getVote('nonexistent')).toBeNull()
  })

  it('7일 이내 기록은 반환', () => {
    saveVote(mockRecord)
    expect(getVote(mockRecord.questionId)).not.toBeNull()
  })

  it('7일 이상 지난 기록은 null 반환', () => {
    const oldDate = new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0]
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify([{ ...mockRecord, date: oldDate }]))
    expect(getVote(mockRecord.questionId)).toBeNull()
  })

  it('localStorage 손상 시 null 반환 (에러 무시)', () => {
    localStorageMock.setItem(STORAGE_KEY, 'invalid-json')
    expect(getVote('any')).toBeNull()
  })
})
