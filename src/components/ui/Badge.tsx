import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color = 'bg-accent/20 text-accent', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color} ${className}`}>
      {children}
    </span>
  )
}
