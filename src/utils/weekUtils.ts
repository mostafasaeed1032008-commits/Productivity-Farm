import { toLocalDateString, parseLocalDate } from './dateUtils'

export function getISOWeekNumber(date: Date): number {
  const d = new Date(date.getTime())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  )
}

export function getISOWeekYear(date: Date): number {
  const d = new Date(date.getTime())
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  return d.getFullYear()
}

export function getMondayFromWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setDate(jan4.getDate() - dayOfWeek)
  const target = new Date(mondayWeek1)
  target.setDate(mondayWeek1.getDate() + (week - 1) * 7)
  target.setHours(0, 0, 0, 0)
  return target
}

export function weekKeyToLabel(weekKey: string): string {
  const monday = parseLocalDate(weekKey)
  const weekNum = getISOWeekNumber(monday)
  const year = getISOWeekYear(monday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })
  return `الأسبوع ${weekNum} — ${year} (${fmt(monday)} – ${fmt(sunday)})`
}

export function getWeekRange(weekKey: string): { start: string; end: string } {
  const monday = parseLocalDate(weekKey)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toLocalDateString(monday), end: toLocalDateString(sunday) }
}

export function getDayKeysForWeek(weekKey: string): string[] {
  const monday = parseLocalDate(weekKey)
  const keys: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    keys.push(toLocalDateString(d))
  }
  return keys
}
