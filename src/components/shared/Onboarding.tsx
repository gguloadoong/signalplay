import { useState } from 'react'
import styles from './Onboarding.module.css'

const SLIDES = [
  {
    emoji: '⚡',
    title: '마켓 배틀에 오신 걸 환영합니다',
    description: '매일 AI가 분석한 경제 시그널을 확인하고\n호재/악재를 예측하는 게임이에요',
  },
  {
    emoji: '🎯',
    title: '예측하고 결과를 확인하세요',
    description: '확신도를 걸어 점수를 극대화하고\n장 마감 후 결과를 확인해보세요',
  },
  {
    emoji: '🏆',
    title: '랭킹에서 경쟁하세요',
    description: '매주 리셋되는 리더보드에서\n예측왕에 도전해보세요',
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
        <span className={styles.emoji}>{slide.emoji}</span>
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
