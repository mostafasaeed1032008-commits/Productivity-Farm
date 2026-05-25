import { useState } from 'react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { SESSION_OPTIONS } from '@/constants/sessions'
import { useFocusStore } from '@/store/useFocusStore'
import { todayKey, toLocalDateString } from '@/utils/dateUtils'
import { useSound } from '@/hooks/useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export function ProductivityPanel() {
  const productivity = useFocusStore((s) => s.productivity)
  const addSession = useFocusStore((s) => s.addProductivitySession)
  const [selected, setSelected] = useState(0)
  const { play } = useSound()
  const today = todayKey()
  const todayHours = productivity[today]?.hours ?? 0
  const ringPct = Math.min(100, (todayHours / 8) * 100)

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = toLocalDateString(d)
    return {
      day: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
      hours: productivity[key]?.hours ?? 0,
    }
  })

  const logSession = () => {
    const opt = SESSION_OPTIONS[selected]
    addSession(opt.hours, opt.label)
    play('session-add')
    toast.success(pickRandom(MESSAGES.sessionAdd))
  }

  return (
    <GlassCard>
      <h3 className="mb-3 font-bold">⚡ الإنتاجية</h3>
      <div className="flex flex-wrap gap-4">
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={ringPct} />
          <span className="absolute font-mono-num text-sm">{todayHours.toFixed(1)}س</span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-wrap gap-1 mb-2">
            {SESSION_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelected(i)}
                className={`rounded-lg px-2 py-1 text-xs ${
                  selected === i ? 'bg-accent text-white' : 'bg-white/10'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={logSession}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium"
          >
            أضف
          </motion.button>
        </div>
      </div>
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#12141c', border: 'none', direction: 'rtl' }} />
            <Bar dataKey="hours" fill="#7c6cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
