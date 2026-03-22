import styles from './FeedPage.module.css'

const MOCK_FEED = [
  {
    id: '1',
    type: 'debate' as const,
    title: '반도체 사이클, 진짜 바닥 찍었나?',
    bullishView: '강세론 AI: DRAM 가격 3개월 연속 상승, HBM 수요 폭발. 하반기 실적 턴어라운드 확실.',
    bearishView: '약세론 AI: 중국 수요 회복 미확인. 재고 소진 속도 둔화 중. 과도한 기대 경계.',
  },
  {
    id: '2',
    type: 'insight' as const,
    title: 'AI 주간 전망',
    content: '이번 주 주목 이벤트: 미국 CPI 발표(수), 한국 GDP 속보치(목). 변동성 확대 구간 예상.',
    category: '매크로',
  },
  {
    id: '3',
    type: 'news' as const,
    title: '한은 총재 "물가 안정세 확인 시 금리 인하 검토"',
    aiComment: 'AI 해석: 시장은 6월 인하를 기대하기 시작할 수 있으나, 조건부 발언이므로 과도한 기대는 경계.',
    source: '한국은행',
  },
  {
    id: '4',
    type: 'debate' as const,
    title: '원달러 환율 1,300원 붕괴 가능성',
    bullishView: '강세론 AI: 미국 금리 인하 기대감 + 한국 수출 호조로 원화 강세 전환.',
    bearishView: '약세론 AI: 지정학 리스크 + 중동 불안으로 안전자산 선호. 달러 강세 지속.',
  },
]

export function FeedPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📰 AI 시그널 피드</h1>
      <p className={styles.subtitle}>AI가 분석한 오늘의 투자 인사이트</p>

      <div className={styles.feed}>
        {MOCK_FEED.map((item) => (
          <div key={item.id} className={styles.card}>
            {item.type === 'debate' && (
              <>
                <span className={styles.tag}>🤖 AI 토론</span>
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
              </>
            )}
            {item.type === 'insight' && (
              <>
                <span className={styles.tag}>🔮 AI 전망</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardContent}>{item.content}</p>
              </>
            )}
            {item.type === 'news' && (
              <>
                <span className={styles.tag}>📰 엄선 뉴스</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.aiComment}>{item.aiComment}</p>
                <span className={styles.source}>{item.source}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
