import { useFocusStore } from '@/store/useFocusStore'

interface Props {
  weekKey: string
}

export function WeekStatsRow({ weekKey }: Props) {
  const tasks = useFocusStore((s) => s.tasks).filter((t) => t.weekKey === weekKey)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'completed').length
  const missed = tasks.filter((t) => t.status === 'missed').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="glass flex flex-wrap gap-4 p-3 text-sm">
      <span>الإجمالي: {total}</span>
      <span className="text-success">منجز: {done}</span>
      <span className="text-danger">فائت: {missed}</span>
      <span className="text-warning">جاري: {inProgress}</span>
      <span className="text-accent font-bold">{pct}%</span>
    </div>
  )
}
