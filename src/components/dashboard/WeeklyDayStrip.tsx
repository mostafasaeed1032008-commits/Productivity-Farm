import { useFocusStore } from '@/store/useFocusStore'
import { getDayKeysForWeek } from '@/utils/weekUtils'
import { todayKey } from '@/utils/dateUtils'

interface Props {
  weekKey: string
}

const DAY_NAMES = ['إث', 'ثلا', 'أرب', 'خم', 'جم', 'سب', 'أحد']

export function WeeklyDayStrip({ weekKey }: Props) {
  const completionHistory = useFocusStore((s) => s.completionHistory)
  const attendance = useFocusStore((s) => s.attendance)
  const days = getDayKeysForWeek(weekKey)
  const today = todayKey()

  return (
    <div className="glass flex justify-between gap-1 p-3">
      {days.map((key, i) => {
        const count = completionHistory[key] ?? 0
        const attended = attendance[key]
        const isFuture = key > today
        const color = isFuture
          ? 'bg-white/20'
          : attended || count > 0
            ? 'bg-success'
            : 'bg-danger/80'
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-white/50">{DAY_NAMES[i]}</span>
            <div className={`h-3 w-3 rounded-full ${color}`} title={`${count} مهام`} />
          </div>
        )
      })}
    </div>
  )
}
