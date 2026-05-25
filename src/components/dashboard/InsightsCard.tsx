import { useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useFocusStore } from '@/store/useFocusStore'
import { todayKey } from '@/utils/dateUtils'
import { getTotalProductivityHours } from '@/utils/mathUtils'

export function InsightsCard() {
  const tasks = useFocusStore((s) => s.tasks)
  const productivity = useFocusStore((s) => s.productivity)
  const streak = useFocusStore((s) => s.streak)

  const insight = useMemo(() => {
    const today = todayKey()
    const todayTasks = tasks.filter((t) => t.weekKey && t.status !== 'completed')
    const hours = productivity[today]?.hours ?? 0
    const totalH = getTotalProductivityHours(productivity)
    if (hours >= 4) return 'ما شاء الله! يوم منتج جداً — استمر على هذا الإيقاع 🔥'
    if (streak >= 7) return `سلسلة ${streak} أيام! انتظامك يبني عادة قوية 📅`
    if (todayTasks.length > 5) return 'لديك مهام كثيرة — ركّز على ربع "افعل الآن" أولاً 🎯'
    if (totalH < 1) return 'ابدأ بجلسة 15 دقيقة — البداية أهم خطوة ⚡'
    return 'أحسنت! كل خطوة صغيرة تقربك من هدفك 🌟'
  }, [tasks, productivity, streak])

  return (
    <GlassCard className="h-full" delay={0.05}>
      <h4 className="mb-2 text-sm text-success">✨ رؤى شخصية</h4>
      <p className="text-sm leading-relaxed">{insight}</p>
    </GlassCard>
  )
}
