import { RIVALS } from '@/constants/rivals'
import type { RivalState } from '@/store/types'
import { scaledHours } from '@/utils/mathUtils'

export function initRivals(): RivalState[] {
  const now = Date.now()
  return RIVALS.map((r) => ({
    id: r.id,
    plots: r.startPlots,
    coins: Math.floor(r.startPlots * 80),
    lastUpdated: now,
  }))
}

export function tickRival(rival: RivalState, now = Date.now()): RivalState {
  const def = RIVALS.find((r) => r.id === rival.id)
  if (!def) return rival
  const elapsedMs = now - rival.lastUpdated
  const elapsedHours = scaledHours(elapsedMs)
  const plots = rival.plots + elapsedHours * def.growthPerHour
  return {
    ...rival,
    plots,
    coins: Math.floor(plots * 80),
    lastUpdated: now,
  }
}

export function catchUpRivals(rivals: RivalState[], now = Date.now()): RivalState[] {
  return rivals.map((r) => tickRival(r, now))
}

export function getRivalDef(id: string) {
  return RIVALS.find((r) => r.id === id)
}
