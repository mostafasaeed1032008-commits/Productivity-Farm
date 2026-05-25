import { WeekNavigator } from '@/components/dashboard/WeekNavigator'
import type { useWeekNav } from '@/hooks/useWeekNav'

export function TasksWeekNav(props: ReturnType<typeof useWeekNav>) {
  return <WeekNavigator {...props} />
}
