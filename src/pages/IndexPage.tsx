/**
 * INDEX PAGE — لوحة التركيز
 * ملف الصفحة المنفصل — المشروع متكامل (store + router + layout + hooks مشتركة)
 * @route /
 */

import { useEffect, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useFocusStore } from '@/store/useFocusStore'
import { useWeekNav } from '@/hooks/useWeekNav'
import { useSound } from '@/hooks/useSound'
import { QUADRANTS, QUADRANT_MAP } from '@/constants/quadrants'
import type { QuadrantDef } from '@/constants/quadrants'
import { SESSION_OPTIONS } from '@/constants/sessions'
import { pickRandom, MESSAGES } from '@/constants/messages'
import { formatTimeAr, todayKey, toLocalDateString } from '@/utils/dateUtils'
import { getDayKeysForWeek } from '@/utils/weekUtils'
import { getTotalProductivityHours } from '@/utils/mathUtils'
import type { Quadrant, Task } from '@/store/types'

// ═══════════════════════════════════════════════════════════════
// مكوّنات الصفحة
// ═══════════════════════════════════════════════════════════════

// ── StatsBar ──

interface StatsBarProps {
  weekKey: string
}

function StatsBar({ weekKey  }: StatsBarProps) {
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

// ── WeeklyDayStrip ──

interface WeeklyDayStripProps {
  weekKey: string
}

const DAY_NAMES = ['إث', 'ثلا', 'أرب', 'خم', 'جم', 'سب', 'أحد']

function WeeklyDayStrip({ weekKey  }: WeeklyDayStripProps) {
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

// ── QuoteCard ──

const QUOTES = [
  'التركيز قرار تتخذه كل صباح.',
  'لا قوة إلا بالله — ابدأ بمهمة واحدة.',
  'التخطيط نصف العمل، والإنجاز النصف الآخر.',
  'الاستمرارية أهم من الكمال.',
]

function QuoteCard() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])
  return (
    <GlassCard className="h-full">
      <h4 className="mb-2 text-sm text-accent">💬 اقتباس اليوم</h4>
      <p className="text-sm leading-relaxed">{quote}</p>
    </GlassCard>
  )
}

// ── InsightsCard ──

function InsightsCard() {
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

// ── AttendancePanel ──

function AttendancePanel() {
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

// ── ProductivityPanel ──

function ProductivityPanel() {
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

// ── TaskCard ──

interface TaskCardProps {
  task: Task
  draggable?: boolean
  onDragStart?: () => void
}

function TaskCard({ task, draggable, onDragStart  }: TaskCardProps) {
  const setTaskStatus = useFocusStore((s) => s.setTaskStatus)
  const deleteTask = useFocusStore((s) => s.deleteTask)
  const updateTask = useFocusStore((s) => s.updateTask)
  const q = QUADRANT_MAP[task.quadrant]
  const hasAcc = q.hasAccountability

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ scale: task.status === 'completed' ? [1, 1.05, 1] : 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      draggable={draggable}
      onDragStart={(e) => {
        const ev = e as unknown as DragEvent
        ev.dataTransfer.setData('taskId', task.id)
        onDragStart?.()
      }}
      className={`rounded-lg border bg-black/20 p-2 text-sm ${
        task.status === 'completed' ? 'opacity-60 line-through' : ''
      }`}
      style={{ borderColor: q.color + '55' }}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={(e) => {
            e.stopPropagation()
            setTaskStatus(task.id, e.target.checked ? 'completed' : 'not-started')
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <span className="block truncate">{task.title}</span>
          {hasAcc && task.deadline && (
            <span className="text-[10px] text-white/50">{task.deadline.replace('T', ' ')}</span>
          )}
          {hasAcc && (
            <select
              value={task.status}
              onChange={(e) => {
                e.stopPropagation()
                updateTask(task.id, { status: e.target.value as Task['status'] })
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 w-full rounded bg-white/10 text-[10px]"
            >
              <option value="not-started">لم يبدأ</option>
              <option value="in-progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="missed">فائت</option>
            </select>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            deleteTask(task.id)
          }}
          className="text-danger text-xs"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

// ── AddTaskForm ──

interface AddTaskFormProps {
  quadrant: Quadrant
  weekKey: string
}

function AddTaskForm({ quadrant, weekKey  }: AddTaskFormProps) {
  const addTask = useFocusStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const { play } = useSound()
  const hasDeadline = quadrant === 'do' || quadrant === 'schedule'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), quadrant, weekKey, hasDeadline && deadline ? deadline : null)
    play('task-add')
    toast.success(pickRandom(MESSAGES.taskAdd))
    setTitle('')
    setDeadline('')
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="مهمة جديدة..."
        className="w-full rounded-lg bg-white/10 px-2 py-1 text-xs"
      />
      {hasDeadline && (
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-2 py-1 text-xs"
        />
      )}
      <button type="submit" className="rounded-lg bg-white/15 py-1 text-xs hover:bg-white/25">
        + إضافة
      </button>
    </form>
  )
}

// ── QuadrantCard ──

interface QuadrantCardProps {
  def: QuadrantDef
  tasks: Task[]
  weekKey: string
}

function QuadrantCard({ def, tasks, weekKey  }: QuadrantCardProps) {
  const moveTask = useFocusStore((s) => s.moveTask)

  return (
    <div
      className={`flex min-h-[200px] flex-col rounded-xl border-2 p-3 ${def.bgClass}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('taskId')
        if (id) moveTask(id, def.id)
      }}
    >
      <h3 className="font-bold" style={{ color: def.color }}>
        {def.title}
      </h3>
      <p className="mb-2 text-xs text-white/50">{def.subtitle}</p>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto max-h-[320px]">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} draggable />
        ))}
      </div>
      <AddTaskForm quadrant={def.id} weekKey={weekKey} />
    </div>
  )
}

// ── MatrixGrid ──

interface MatrixGridProps {
  weekKey: string
}

function MatrixGrid({ weekKey  }: MatrixGridProps) {
  const tasks = useFocusStore((s) => s.tasks)
  const weekTasks = tasks.filter((t) => t.weekKey === weekKey)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {QUADRANTS.map((def) => (
        <QuadrantCard
          key={def.id}
          def={def}
          weekKey={weekKey}
          tasks={weekTasks.filter((t) => t.quadrant === def.id)}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════════════

type WeekNav = ReturnType<typeof useWeekNav>

interface WeekNavigatorProps extends WeekNav {}

export function WeekNavigator({ weekLabel,
  pinned,
  pickerWeek,
  pickerYear,
  setPickerWeek,
  setPickerYear,
  goNext,
  goPrev,
  goToToday,
  togglePin,
  applyPicker,
  isCurrentWeek,
 }: WeekNavigatorProps) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 p-3">
      <button type="button" onClick={goPrev} disabled={pinned} className="rounded-lg bg-white/10 p-2 disabled:opacity-40">
        <ChevronRight size={18} />
      </button>
      <span className="flex-1 text-center text-sm font-medium">{weekLabel}</span>
      <button type="button" onClick={goNext} disabled={pinned} className="rounded-lg bg-white/10 p-2 disabled:opacity-40">
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={togglePin} className="rounded-lg bg-white/10 p-2" title={pinned ? 'إلغاء التثبيت' : 'تثبيت'}>
        {pinned ? <PinOff size={16} /> : <Pin size={16} />}
      </button>
      {!isCurrentWeek && (
        <button type="button" onClick={goToToday} className="text-xs text-accent underline">
          اليوم
        </button>
      )}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <select
          value={pickerWeek}
          onChange={(e) => setPickerWeek(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm"
        >
          {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              أسبوع {w}
            </option>
          ))}
        </select>
        <select
          value={pickerYear}
          onChange={(e) => setPickerYear(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button type="button" onClick={applyPicker} className="rounded-lg bg-accent px-3 py-1 text-sm">
          انتقل
        </button>
      </div>
    </div>
  )
}

export function IndexPage() {
  const weekNav = useWeekNav()
  const [clock, setClock] = useState(formatTimeAr(new Date()))
  const tickGame = useFocusStore((s) => s.tickGame)

  useEffect(() => {
    const t = setInterval(() => setClock(formatTimeAr(new Date())), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    tickGame()
    const m = setInterval(() => tickGame(), 60000)
    return () => clearInterval(m)
  }, [tickGame])

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-accent">Focus Matrix</h1>
          <p className="text-sm text-white/60">مصفوفة آيزنهاور والإنتاجية</p>
        </div>
        <span className="font-mono-num text-lg text-gold">{clock}</span>
      </header>
      <StatsBar weekKey={weekNav.currentWeek} />
      <WeekNavigator {...weekNav} />
      <WeeklyDayStrip weekKey={weekNav.currentWeek} />
      <div className="grid gap-3 md:grid-cols-2">
        <QuoteCard />
        <InsightsCard />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AttendancePanel />
        <ProductivityPanel />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold">المصفوفة</h2>
        <MatrixGrid weekKey={weekNav.currentWeek} />
      </section>
    </div>
  )
}

export { IndexPage as DashboardPage }
