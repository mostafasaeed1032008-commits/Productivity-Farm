import { useCallback } from 'react'
import { playSound, type SoundKey } from '@/engine/SoundEngine'

export function useSound() {
  const play = useCallback((key: SoundKey) => {
    void playSound(key)
  }, [])
  return { play }
}
