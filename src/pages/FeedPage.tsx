import { useState } from 'react'
import { MOCK_FEED } from '@/lib/mockData'
import type { FeedItem } from '@/lib/mockData'
import styles from './FeedPage.module.css'

type FeedFilter = 'all' | 'debate' | 'insight' | 'news'

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'debate', label: '🤖 AI 토론' },
  { value: 'insight', label: '🔮 전망' },
  { value: 'news', label: '📰 뉴스' },
]

function DebateCard({ item }: { item: FeedItem & { type: 'debate' } }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tag}>🤖 AI 토론</span>
        <span className={styles.time}>{item.timestamp}</span>
      </div>
      <h3 className={styles.cardTitle}>{item.title}</h3>
      <div className={styles.debate}>
        <div className={styles.bull}>
          <span className={styles.debateLabel}>📈 강세론</span>
          <p>{item.bullishView}</p>
        </div>
        <div className={styles.bear}>
          <span className={styles.debateLabel}>📉 약세론</span>
          <p>{item.bearishView}</p>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ item }: { item: FeedItem & { type: 'insight' } }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tagPurple}>🔮 AI 전망</span>
        <span className={styles.time}>{item.timestamp}</span>
      </div>
      <h3 className={styles.cardTitle}>{item.title}</h3>
      <p className={styles.cardContent}>{item.content}</p>
      <span className={styles.categoryChip}>{item.category}</span>
    </div>
  )
}

function NewsCard({ item }: { item: FeedItem & { type: 'news' } }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.tagGreen}>📰 엄선 뉴스</span>
        <span className={styles.time}>{item.timestamp}</span>
      </div>
      <h3 className={styles.cardTitle}>{item.title}</h3>
      <div className={styles.aiComment}>
        <span className={styles.aiLabel}>AI 해석</span>
        <p>{item.aiComment}</p>
      </div>
      <span className={styles.source}>{item.source}</span>
    </div>
  )
}

export function FeedPage() {
  const [filter, setFilter] = useState<FeedFilter>('all')
  const filtered = filter === 'all' ? MOCK_FEED : MOCK_FEED.filter((item) => item.type === filter)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📰 AI 시그널 피드</h1>
      <p className={styles.subtitle}>AI가 분석한 오늘의 투자 인사이트</p>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.feed}>
        {filtered.map((item) => {
          switch (item.type) {
            case 'debate':
              return <DebateCard key={item.id} item={item} />
            case 'insight':
              return <InsightCard key={item.id} item={item} />
            case 'news':
              return <NewsCard key={item.id} item={item} />
          }
        })}
      </div>
    </div>
  )
}
