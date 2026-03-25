import { useState } from 'react'
import styles from './Onboarding.module.css'

const SLIDES = [
  {
    emoji: '⚡',
    title: '오늘 주식 어디로 터질까',
    description: '매일 시장 뉴스 기반 질문 하나\n호재냐 악재냐, 네 생각은?',
  },
  {
    emoji: '🔮',
    title: '우리 집 전문가 5명 의견 들어봐',
    description: '엑셀형·도서관형·뉴스형·차트형·운형\n각자 다른 논리로 방향 잡아줌 🧐',
  },
  {
    emoji: '👥',
    title: '다른 사람들은 뭐 골랐게',
    description: '투표하면 군중 비율 공개됨\n빙고 맞히면 기분이 너무 좋음 🎯',
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
    <div className={styles.overlay}>
      <div className={styles.content}>
        <span className={`${styles.emoji} tossface`}>{slide.emoji}</span>
        <h2 className={styles.title}>{slide.title}</h2>
        <p className={styles.description}>{slide.description}</p>

        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === current ? styles.active : ''}`} />
          ))}
        </div>

        <button
          className={styles.button}
          onClick={() => (isLast ? onComplete() : setCurrent(current + 1))}
        >
          {isLast ? '바로 시작 🚀' : '다음 →'}
        </button>

        {!isLast && (
          <button className={styles.skip} onClick={onComplete}>
            그냥 시작할게
          </button>
        )}
      </div>
    </div>
  )
}
