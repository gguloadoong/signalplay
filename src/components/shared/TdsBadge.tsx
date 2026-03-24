import type { ReactNode } from 'react'
import styles from './TdsBadge.module.css'

interface Props {
  size: 'xsmall' | 'small' | 'medium'
  variant?: 'fill' | 'weak'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'elephant'
  children: ReactNode
}

export function TdsBadge({ size, variant = 'fill', color = 'blue', children }: Props) {
  return (
    <span className={`${styles.badge} ${styles[size]} ${styles[variant]} ${styles[color]}`}>
      {children}
    </span>
  )
}
