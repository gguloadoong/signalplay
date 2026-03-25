import { Button } from '@toss/tds-mobile'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

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
  ...rest
}: Props) {
  // Cast rest to any to bridge ButtonHTMLAttributes vs framer-motion ButtonProps event types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <Button size={size} variant={variant} color={color} display={display} {...(rest as any)}>
      {children}
    </Button>
  )
}
