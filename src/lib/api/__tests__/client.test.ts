import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function mockError(status: number, body: unknown = {}) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('api.getQuestion', () => {
  it('성공 시 data 반환', async () => {
    const question = { id: 'q-2026-03-25', title: '삼성전자 실적', category: '종목' }
    mockOk(question)
    const result = await api.getQuestion()
    expect(result.data).toEqual(question)
    expect(result.error).toBeUndefined()
  })

  it('HTTP 에러 시 error 반환', async () => {
    mockError(500, { error: 'Internal Server Error' })
    const result = await api.getQuestion()
    expect(result.error).toBe('Internal Server Error')
    expect(result.data).toBeUndefined()
  })

  it('네트워크 에러 시 error 반환', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await api.getQuestion()
    expect(result.error).toBe('Network error')
  })
})

describe('api.vote', () => {
  it('성공 시 군중 비율 반환', async () => {
    const crowd = { bullish: 60, bearish: 25, neutral: 15, totalVotes: 1234 }
    mockOk({ ok: true, crowd })
    const result = await api.vote({ questionId: 'q-2026-03-25', vote: 'bullish' })
    expect(result.data?.crowd).toEqual(crowd)
    expect(result.error).toBeUndefined()
  })

  it('POST 메서드로 호출', async () => {
    mockOk({ ok: true, crowd: { bullish: 50, bearish: 30, neutral: 20, totalVotes: 100 } })
    await api.vote({ questionId: 'q-test', vote: 'bearish', userId: 'user-1' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/vote'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('HTTP 에러 시 error 반환', async () => {
    mockError(400, { error: '이미 투표함' })
    const result = await api.vote({ questionId: 'q-test', vote: 'bullish' })
    expect(result.error).toBe('이미 투표함')
  })
})

describe('api.getResult', () => {
  it('결과 있을 때 data 반환', async () => {
    const voteResult = { questionId: 'q-2026-03-24', outcome: 'bullish', crowdCorrect: true }
    mockOk(voteResult)
    const result = await api.getResult()
    expect(result.data).toEqual(voteResult)
  })

  it('결과 없을 때 null data 반환', async () => {
    mockOk(null)
    const result = await api.getResult()
    expect(result.data).toBeNull()
    expect(result.error).toBeUndefined()
  })

  it('에러 시 error 반환', async () => {
    mockError(503, {})
    const result = await api.getResult()
    expect(result.error).toBe('HTTP 503')
  })
})
