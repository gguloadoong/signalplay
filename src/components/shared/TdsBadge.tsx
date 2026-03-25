import { Badge } from '@toss/tds-mobile'
import type { ReactNode } from 'react'

interface Props {
  size: 'xsmall' | 'small' | 'medium'
  variant?: 'fill' | 'weak'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'elephant'
  children: ReactNode
}

export function TdsBadge({ size, variant = 'fill', color = 'blue', children }: Props) {
  return (
    <Badge size={size} variant={variant} color={color}>
      {children}
    </Badge>
  )
}
