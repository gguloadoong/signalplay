import type { VercelRequest, VercelResponse } from '@vercel/node'

// GET /api/signals — 오늘의 시그널 조회
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // TODO: Supabase에서 조회, KV 캐시 우선
    // 현재는 목데이터 반환
    const signals = {
      id: `morning-${today}`,
      type: 'morning',
      date: today,
      signals: [
        {
          index: 0,
          title: '연준 금리 동결 시사 발언',
          summary: '파월 의장이 상반기 금리 동결 가능성을 시사. 과거 유사 발언 후 나스닥 평균 +1.2% 상승.',
          category: 'macro',
        },
        {
          index: 1,
          title: '반도체 수출 3개월 연속 증가',
          summary: '산업부 발표, 3월 반도체 수출 전년 대비 +23.4%. DRAM 가격 회복세 뚜렷.',
          category: 'sector',
        },
        {
          index: 2,
          title: '중국 PMI 예상치 하회',
          summary: '3월 제조업 PMI 49.2로 위축 국면 재진입. 시장 예상 50.1 대비 하회.',
          category: 'global',
        },
      ],
      deadline: `${today}T06:30:00Z`,
      resultTime: `${today}T06:30:00Z`,
      isActive: true,
      isResultReady: false,
    }

    return res.status(200).json(signals)
  } catch (error) {
    console.error('Failed to fetch signals:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
