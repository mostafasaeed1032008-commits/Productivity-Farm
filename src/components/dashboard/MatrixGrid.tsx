import { QUADRANTS } from '@/constants/quadrants'
import { useFocusStore } from '@/store/useFocusStore'
import { QuadrantCard } from './QuadrantCard'

interface Props {
  weekKey: string
}

export function MatrixGrid({ weekKey }: Props) {
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
