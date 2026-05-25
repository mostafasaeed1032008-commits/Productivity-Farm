export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toLocalDateTimeString(date: Date): string {
  return `${toLocalDateString(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function todayKey(): string {
  return toLocalDateString(new Date())
}

export function getWeekKey(offset: number): string {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day) + offset * 7)
  d.setHours(0, 0, 0, 0)
  return toLocalDateString(d)
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function parseLocalDateTime(dt: string): Date {
  const [datePart, timePart] = dt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

export function formatTimeAr(date: Date): string {
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}
