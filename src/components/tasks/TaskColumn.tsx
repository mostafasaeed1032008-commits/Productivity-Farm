import type { QuadrantDef } from '@/constants/quadrants'
import type { Task } from '@/store/types'
import { TaskItem } from './TaskItem'

interface Props {
  def: QuadrantDef
  tasks: Task[]
}

export function TaskColumn({ def, tasks }: Props) {
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
