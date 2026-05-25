import type { QuadrantDef } from '@/constants/quadrants'
import type { Task } from '@/store/types'
import { useFocusStore } from '@/store/useFocusStore'
import { TaskCard } from './TaskCard'
import { AddTaskForm } from './AddTaskForm'

interface Props {
  def: QuadrantDef
  tasks: Task[]
  weekKey: string
}

export function QuadrantCard({ def, tasks, weekKey }: Props) {
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
