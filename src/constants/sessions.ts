export interface SessionOption {
  label: string
  hours: number
  emoji: string
}

export const SESSION_OPTIONS: SessionOption[] = [
  { label: '5 دقايق', hours: 5 / 60, emoji: '⚡' },
  { label: '15 دقيقة', hours: 15 / 60, emoji: '🔸' },
  { label: '30 دقيقة', hours: 0.5, emoji: '🔶' },
  { label: '1 ساعة', hours: 1, emoji: '⭐' },
  { label: '2 ساعة', hours: 2, emoji: '🌟' },
  { label: '4 ساعات', hours: 4, emoji: '💪' },
  { label: '6 ساعات', hours: 6, emoji: '🔥' },
  { label: '8 ساعات', hours: 8, emoji: '🏆' },
  { label: '12 ساعة', hours: 12, emoji: '👑' },
]
