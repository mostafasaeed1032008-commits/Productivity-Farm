import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@/store/types'
import { QUADRANT_MAP } from '@/constants/quadrants'
import { useFocusStore } from '@/store/useFocusStore'

interface Props {
  task: Task
  draggable?: boolean
  onDragStart?: () => void
}

export function TaskCard({ task, draggable, onDragStart }: Props) {
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
