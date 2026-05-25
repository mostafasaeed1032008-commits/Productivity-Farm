import { useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useFocusStore } from '@/store/useFocusStore'
import { todayKey, toLocalDateString } from '@/utils/dateUtils'
import { useSound } from '@/hooks/useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export function AttendancePanel() {
  const attendance = useFocusStore((s) => s.attendance)
  const markAttendance = useFocusStore((s) => s.markAttendance)
  const streak = useFocusStore((s) => s.streak)
  const { play } = useSound()
  const today = todayKey()

  const { days, monthPct } = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const cells: { key: string; state: 'future' | 'present' | 'absent' }[] = []
    let present = 0
    let past = 0
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d)
      const key = toLocalDateString(date)
      if (key > today) cells.push({ key, state: 'future' })
      else {
        past++
        if (attendance[key]) {
          present++
          cells.push({ key, state: 'present' })
        } else cells.push({ key, state: 'absent' })
      }
    }
    void first
    return { days: cells, monthPct: past ? Math.round((present / past) * 100) : 0 }
  }, [attendance, today])

  const checkedToday = !!attendance[today]

  const handleCheckIn = () => {
    if (markAttendance(today)) {
      play('attend')
      toast.success(pickRandom(MESSAGES.attendance))
    }
  }

  return (
    <GlassCard>
      <h3 className="mb-3 font-bold">📅 الحضور</h3>
      <div className="mb-2 flex gap-3 text-sm text-white/70">
        <span>السلسلة: {streak} يوم</span>
        <span>هذا الشهر: {monthPct}%</span>
      </div>
      <div className="mb-3 grid grid-cols-7 gap-1">
        {days.map(({ key, state }) => (
          <div
            key={key}
            className={`aspect-square rounded-sm ${
              state === 'future' ? 'bg-white/10' : state === 'present' ? 'bg-success' : 'bg-danger/70'
            }`}
            title={key}
          />
        ))}
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={checkedToday}
        onClick={handleCheckIn}
        className="w-full rounded-xl bg-success/90 py-2 font-medium text-deep disabled:opacity-50"
      >
        {checkedToday ? '✅ تم تسجيل حضورك اليوم' : 'تسجيل الحضور'}
      </motion.button>
    </GlassCard>
  )
}
