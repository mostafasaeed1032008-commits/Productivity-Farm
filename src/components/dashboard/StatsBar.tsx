import { motion } from 'framer-motion'
import { useFocusStore } from '@/store/useFocusStore'
import { getDayKeysForWeek } from '@/utils/weekUtils'

interface Props {
  weekKey: string
}

export function StatsBar({ weekKey }: Props) {
  const tasks = useFocusStore((s) => s.tasks)
  const streak = useFocusStore((s) => s.streak)
  const accountabilityScore = useFocusStore((s) => s.accountabilityScore)

  const weekTasks = tasks.filter((t) => t.weekKey === weekKey)
  const done = weekTasks.filter((t) => t.status === 'completed').length
  const total = weekTasks.length
  const focusPct = total ? Math.round((done / total) * 100) : 0

  const dayKeys = getDayKeysForWeek(weekKey)
  const weekDoneDays = dayKeys.filter((dayKey) => {
    const completedOnDay = tasks.some(
      (t) => t.weekKey === weekKey && t.status === 'completed' && t.completedAt?.startsWith(dayKey),
    )
    return completedOnDay
  }).length
  const weekPct = Math.round((weekDoneDays / 7) * 100)

  const stats = [
    { label: 'نسبة التركيز', value: `${focusPct}%` },
    { label: 'السلسلة', value: `${streak} يوم` },
    { label: 'المساءلة', value: `${accountabilityScore}%` },
    { label: 'إنجاز الأسبوع', value: `${weekPct}%` },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass p-3 text-center"
        >
          <div className="text-xs text-white/60">{s.label}</div>
          <div className="font-mono-num text-lg font-bold text-accent">{s.value}</div>
        </motion.div>
      ))}
    </div>
  )
}
