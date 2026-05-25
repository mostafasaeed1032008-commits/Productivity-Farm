import type { Quadrant, TaskStatus } from '@/store/types'

export type TaskFilter = 'all' | Quadrant | 'completed' | 'missed'

interface Props {
  value: TaskFilter
  onChange: (f: TaskFilter) => void
}

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'do', label: 'افعل' },
  { id: 'schedule', label: 'جدولة' },
  { id: 'delegate', label: 'تفويض' },
  { id: 'eliminate', label: 'إلغاء' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'missed', label: 'فائت' },
]

export function FilterBar({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`rounded-full px-3 py-1 text-xs ${
            value === f.id ? 'bg-accent text-white' : 'bg-white/10'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export function matchesFilter(
  filter: TaskFilter,
  quadrant: Quadrant,
  status: TaskStatus,
): boolean {
  if (filter === 'all') return true
  if (filter === 'completed') return status === 'completed'
  if (filter === 'missed') return status === 'missed'
  return quadrant === filter
}
