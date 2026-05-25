import { useEffect } from 'react'
import { useFocusStore } from '@/store/useFocusStore'

export function useGameLoop(intervalMs = 10000) {
  const tickGame = useFocusStore((s) => s.tickGame)

  useEffect(() => {
    const id = window.setInterval(() => tickGame(), intervalMs)
    return () => clearInterval(id)
  }, [tickGame, intervalMs])
}
