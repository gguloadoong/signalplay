import { useState } from 'react'
import styles from './Onboarding.module.css'

const SLIDES = [
  {
    emoji: '⚡',
    title: '오늘의 투자 시그널, 예측해보세요',
    description: '실시간 시장 뉴스 기반으로\n매일 새로운 투자 질문을 던져요',
  },
  {
    emoji: '🔮',
    title: '방구석 전문가 5명의 예측을 확인하세요',
    description: '엑셀형·도서관형·뉴스형·차트형·운형\n각자 다른 이론으로 호재/악재를 예측해요',
  },
  {
    emoji: '👥',
    title: '군중과 비교하고, 적중률을 쌓으세요',
    description: '투표 후 군중 비율이 공개돼요\n나는 군중과 같을까, 다를까?',
  },
]

interface Props {
  onComplete: () => void
}

export function Onboarding({ onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]
  const isLast = current === SLIDES.length - 1

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className={styles.content}>
        <span className={styles.emoji} aria-hidden="true">{slide.emoji}</span>
        <h2 id="onboarding-title" className={styles.title}>{slide.title}</h2>
        <p className={styles.description}>{slide.description}</p>

        <div
          className={styles.dots}
          role="status"
          aria-label={`슬라이드 ${current + 1} / ${SLIDES.length}`}
        >
          {SLIDES.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === current ? styles.active : ''}`} />
          ))}
        </div>

        <button
          className={styles.button}
          onClick={() => (isLast ? onComplete() : setCurrent(current + 1))}
        >
          {isLast ? '시작하기' : '다음'}
        </button>

        {!isLast && (
          <button className={styles.skip} onClick={onComplete}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  )
}
