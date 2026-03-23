import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './PageTransition.module.css'

interface Props {
  children: ReactNode
}

export function PageTransition({ children }: Props) {
  const location = useLocation()

  return (
    <div key={location.pathname} className={styles.page}>
      {children}
    </div>
  )
}
