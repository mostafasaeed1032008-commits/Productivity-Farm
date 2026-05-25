export const COINS_PER_TASK = 5
export const COINS_PER_HOUR = 20
export const COINS_PER_ATTENDANCE = 50
export const INITIAL_PLOTS = 9

export function expandCost(plotCount: number): number {
  return Math.floor(100 * Math.pow(1.6, (plotCount - INITIAL_PLOTS) / 3))
}

export function getTotalProductivityHours(
  productivity: Record<string, { hours: number }>,
): number {
  return Object.values(productivity).reduce((sum, d) => sum + d.hours, 0)
}

export function getTodayHours(
  productivity: Record<string, { hours: number }>,
  today: string,
): number {
  return productivity[today]?.hours ?? 0
}

export const GAME_SPEED = parseFloat(import.meta.env.VITE_GAME_SPEED_MULTIPLIER || '1')

export function scaledMs(ms: number): number {
  return ms / GAME_SPEED
}

export function scaledHours(elapsedMs: number): number {
  return (elapsedMs / 3600000) * GAME_SPEED
}
