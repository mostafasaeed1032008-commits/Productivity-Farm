import { motion } from 'framer-motion'
import type { Task } from '@/store/types'
import { QUADRANTS, QUADRANT_MAP } from '@/constants/quadrants'
import { useFocusStore } from '@/store/useFocusStore'
import { useSound } from '@/hooks/useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'

interface Props {
  task: Task
}

export function TaskItem({ task }: Props) {
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
