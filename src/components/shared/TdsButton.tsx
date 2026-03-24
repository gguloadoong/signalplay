import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './TdsButton.module.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large'
  variant?: 'fill' | 'weak'
  color?: 'primary' | 'light' | 'danger'
  display?: 'inline' | 'full'
  children: ReactNode
}

export function TdsButton({
  size = 'medium',
  variant = 'fill',
  color = 'primary',
  display = 'inline',
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      className={`${styles.btn} ${styles[size]} ${styles[variant]} ${styles[color]} ${display === 'full' ? styles.full : ''} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
