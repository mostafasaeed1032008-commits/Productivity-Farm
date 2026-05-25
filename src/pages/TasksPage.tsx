/**
 * TASKS PAGE — مدير المهام
 * ملف الصفحة المنفصل — المشروع متكامل (store + router + layout + hooks مشتركة)
 * @route /tasks
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useFocusStore } from '@/store/useFocusStore'
import { useWeekNav } from '@/hooks/useWeekNav'
import { useSound } from '@/hooks/useSound'
import { QUADRANTS, QUADRANT_MAP } from '@/constants/quadrants'
import type { QuadrantDef } from '@/constants/quadrants'
import { pickRandom, MESSAGES } from '@/constants/messages'
import type { Quadrant, Task, TaskStatus } from '@/store/types'
import { WeekNavigator } from '@/pages/IndexPage'

// ═══════════════════════════════════════════════════════════════
// مكوّنات الصفحة
// ═══════════════════════════════════════════════════════════════

// ── WeekStatsRow ──

interface WeekStatsRowProps {
  weekKey: string
}

function WeekStatsRow({ weekKey  }: WeekStatsRowProps) {
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

// ── FilterBar ──

type TaskFilter = 'all' | Quadrant | 'completed' | 'missed'

interface FilterBarProps {
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

function FilterBar({ value, onChange  }: FilterBarProps) {
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

function matchesFilter(
  filter: TaskFilter,
  quadrant: Quadrant,
  status: TaskStatus,
): boolean {
  if (filter === 'all') return true
  if (filter === 'completed') return status === 'completed'
  if (filter === 'missed') return status === 'missed'
  return quadrant === filter
}

// ── QuickAddForm ──

interface QuickAddFormProps {
  weekKey: string
}

function QuickAddForm({ weekKey  }: QuickAddFormProps) {
  const addTask = useFocusStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [quadrant, setQuadrant] = useState<Quadrant>('do')
  const [deadline, setDeadline] = useState('')
  const { play } = useSound()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const dl =
      (quadrant === 'do' || quadrant === 'schedule') && deadline ? deadline : null
    addTask(title.trim(), quadrant, weekKey, dl)
    play('task-add')
    toast.success(pickRandom(MESSAGES.taskAdd))
    setTitle('')
    setDeadline('')
  }

  return (
    <form onSubmit={submit} className="glass flex flex-wrap gap-2 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان المهمة"
        className="flex-1 min-w-[160px] rounded-lg bg-white/10 px-3 py-2 text-sm"
      />
      <select
        value={quadrant}
        onChange={(e) => setQuadrant(e.target.value as Quadrant)}
        className="rounded-lg bg-white/10 px-2 py-2 text-sm"
      >
        {QUADRANTS.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
      {(quadrant === 'do' || quadrant === 'schedule') && (
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-lg bg-white/10 px-2 py-2 text-sm"
        />
      )}
      <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium">
        إضافة
      </button>
    </form>
  )
}

// ── TaskItem ──

interface TaskItemProps {
  task: Task
}

function TaskItem({ task  }: TaskItemProps) {
  const setTaskStatus = useFocusStore((s) => s.setTaskStatus)
  const deleteTask = useFocusStore((s) => s.deleteTask)
  const moveTask = useFocusStore((s) => s.moveTask)
  const { play } = useSound()
  const q = QUADRANT_MAP[task.quadrant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
    >
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={(e) => {
          const st = e.target.checked ? 'completed' : 'not-started'
          setTaskStatus(task.id, st)
          if (st === 'completed') {
            play('task-done')
            toast.success(pickRandom(MESSAGES.taskDone))
          }
        }}
      />
      <div className="flex-1 min-w-0">
        <div className={task.status === 'completed' ? 'line-through opacity-60' : ''}>{task.title}</div>
        {task.deadline && (
          <span className="text-[10px] text-white/40">{task.deadline.replace('T', ' ')}</span>
        )}
      </div>
      <span className="text-xs" style={{ color: q.color }}>
        {q.title}
      </span>
      <select
        value={task.quadrant}
        onChange={(e) => moveTask(task.id, e.target.value as Task['quadrant'])}
        className="rounded bg-white/10 text-[10px]"
      >
        {QUADRANTS.map((qu) => (
          <option key={qu.id} value={qu.id}>
            {qu.title}
          </option>
        ))}
      </select>
      <button type="button" onClick={() => deleteTask(task.id)} className="text-danger text-sm">
        حذف
      </button>
    </motion.div>
  )
}

// ── TaskColumn ──

interface TaskColumnProps {
  def: QuadrantDef
  tasks: Task[]
}

function TaskColumn({ def, tasks  }: TaskColumnProps) {
  return (
    <div className={`rounded-xl border p-3 ${def.bgClass}`}>
      <h3 className="mb-2 font-bold text-sm" style={{ color: def.color }}>
        {def.title} ({tasks.length})
      </h3>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
        {tasks.length === 0 && <p className="text-xs text-white/40">لا مهام</p>}
      </div>
    </div>
  )
}

// ── TaskColumns ──

interface TaskColumnsProps {
  tasks: Task[]
  filter: TaskFilter
}

function TaskColumns({ tasks, filter  }: TaskColumnsProps) {
  const filtered = tasks.filter((t) => matchesFilter(filter, t.quadrant, t.status))

  if (filter !== 'all' && filter !== 'completed' && filter !== 'missed') {
    const def = QUADRANTS.find((q) => q.id === filter)!
    return (
      <div className="grid grid-cols-1">
        <TaskColumn def={def} tasks={filtered} />
      </div>
    )
  }

  if (filter === 'completed' || filter === 'missed') {
    return (
      <div className="flex flex-col gap-2">
        {filtered.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {QUADRANTS.map((def) => (
        <TaskColumn
          key={def.id}
          def={def}
          tasks={filtered.filter((t) => t.quadrant === def.id)}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════════════

export function TasksPage() {
  const weekNav = useWeekNav()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const tasks = useFocusStore((s) => s.tasks).filter((t) => t.weekKey === weekNav.currentWeek)

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 pb-12">
      <h1 className="text-2xl font-bold text-green">مدير المهام</h1>
      <WeekNavigator {...weekNav} />
      <WeekStatsRow weekKey={weekNav.currentWeek} />
      <QuickAddForm weekKey={weekNav.currentWeek} />
      <FilterBar value={filter} onChange={setFilter} />
      <TaskColumns tasks={tasks} filter={filter} />
    </div>
  )
}
