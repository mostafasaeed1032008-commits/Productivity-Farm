import { QUADRANTS } from '@/constants/quadrants'
import type { Task } from '@/store/types'
import type { TaskFilter } from './FilterBar'
import { matchesFilter } from './FilterBar'
import { TaskColumn } from './TaskColumn'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  filter: TaskFilter
}

export function TaskColumns({ tasks, filter }: Props) {
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
