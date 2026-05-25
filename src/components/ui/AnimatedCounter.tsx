import { useEffect, useState } from 'react'
import { useSpring, useMotionValueEvent } from 'framer-motion'

interface Props {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className = '' }: Props) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 })
  const [display, setDisplay] = useState(0)

  useMotionValueEvent(spring, 'change', (v) => {
    setDisplay(Math.round(v))
  })

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return (
    <span className={`font-mono-num ${className}`}>{display.toLocaleString('ar-SA')}</span>
  )
}
