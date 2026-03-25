import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Cron: 매일 23:50 UTC (08:50 KST) 질문 사전 생성
 * vercel.json: "schedule": "50 23 * * *"
 * Vercel이 Authorization: Bearer <CRON_SECRET> 헤더를 자동 추가
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron 보안 검증
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers['authorization']
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 배포 URL로 /api/question 호출 → 질문 사전 생성 + Supabase 저장
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000'
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https'
  const baseUrl = `${protocol}://${host}`

  try {
    const response = await fetch(`${baseUrl}/api/question`, {
      signal: AbortSignal.timeout(30000),
    })
    const data = await response.json()
    return res.status(200).json({ ok: true, questionId: (data as { id?: string }).id })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' })
  }
}
