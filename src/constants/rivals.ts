export interface RivalDef {
  id: string
  name: string
  emoji: string
  startPlots: number
  growthPerHour: number
  color: string
}

export const RIVALS: RivalDef[] = [
  { id: 'r1', name: 'أبو خالد', emoji: '👴', startPlots: 4, growthPerHour: 0.8, color: '#ef9a9a' },
  { id: 'r2', name: 'أم محمد', emoji: '👵', startPlots: 3, growthPerHour: 1.2, color: '#90caf9' },
  { id: 'r3', name: 'الشيخ ناصر', emoji: '🧓', startPlots: 6, growthPerHour: 1.5, color: '#ffe082' },
  { id: 'r4', name: 'فاطمة الريفية', emoji: '👩‍🌾', startPlots: 5, growthPerHour: 2.0, color: '#ce93d8' },
]
