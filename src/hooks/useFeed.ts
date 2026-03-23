import { useState, useEffect } from 'react'
import { MOCK_FEED } from '@/lib/mockData'
import type { FeedItem } from '@/lib/mockData'

export function useFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchFeed() {
      try {
        const res = await fetch('/api/feed')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setFeed(data as FeedItem[])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setFeed(MOCK_FEED)
          setLoading(false)
        }
      }
    }

    fetchFeed()
    return () => { cancelled = true }
  }, [])

  return { feed, loading }
}
