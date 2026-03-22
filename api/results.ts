import type { VercelRequest, VercelResponse } from '@vercel/node'

// GET /api/results — 어제 배틀 결과 조회
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // TODO: Supabase에서 어제 시그널 + 내 예측 + 결과 조인
    // 현재는 목데이터 반환
    const results = {
      date: '2026-03-21',
      battleType: 'morning',
      results: [
        {
          signalIndex: 0,
          title: '연준 금리 동결 시사 발언',
          myPrediction: 'bullish',
          myConfidence: 3,
          actualResult: 'bullish',
          isCorrect: true,
          score: 30,
          resultComment: '코스피 +1.2% 상승. 외국인 매수세 유입이 주요 원인.',
        },
        {
          signalIndex: 1,
          title: '반도체 수출 3개월 연속 증가',
          myPrediction: 'bullish',
          myConfidence: 2,
          actualResult: 'bullish',
          isCorrect: true,
          score: 20,
          resultComment: '삼성전자 +2.3%, SK하이닉스 +3.1%. HBM 기대감 반영.',
        },
        {
          signalIndex: 2,
          title: '중국 PMI 예상치 하회',
          myPrediction: 'bearish',
          myConfidence: 3,
          actualResult: 'neutral',
          isCorrect: false,
          score: -10,
          resultComment: '코스피 영향 제한적. 이미 시장에 선반영된 것으로 분석.',
        },
      ],
      totalScore: 40,
      isPerfect: false,
      streak: 7,
      weeklyRank: 8,
      rankChange: 4,
    }

    return res.status(200).json(results)
  } catch (error) {
    console.error('Failed to fetch results:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
