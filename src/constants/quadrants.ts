import type { Quadrant } from '@/store/types'

export interface QuadrantDef {
  id: Quadrant
  title: string
  subtitle: string
  color: string
  bgClass: string
  hasAccountability: boolean
}

export const QUADRANTS: QuadrantDef[] = [
  {
    id: 'do',
    title: 'افعل الآن',
    subtitle: 'عاجل ومهم',
    color: '#e53935',
    bgClass: 'border-q-do/40 bg-q-do/10',
    hasAccountability: true,
  },
  {
    id: 'schedule',
    title: 'جدولة',
    subtitle: 'مهم غير عاجل',
    color: '#1e88e5',
    bgClass: 'border-q-schedule/40 bg-q-schedule/10',
    hasAccountability: true,
  },
  {
    id: 'delegate',
    title: 'تفويض',
    subtitle: 'عاجل غير مهم',
    color: '#fb8c00',
    bgClass: 'border-q-delegate/40 bg-q-delegate/10',
    hasAccountability: false,
  },
  {
    id: 'eliminate',
    title: 'إلغاء',
    subtitle: 'غير عاجل وغير مهم',
    color: '#546e7a',
    bgClass: 'border-q-eliminate/40 bg-q-eliminate/10',
    hasAccountability: false,
  },
]

export const QUADRANT_MAP = Object.fromEntries(QUADRANTS.map((q) => [q.id, q])) as Record<
  Quadrant,
  QuadrantDef
>
