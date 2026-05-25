import { Routes, Route } from 'react-router-dom'
import { IndexPage } from '@/pages/IndexPage'
import { TasksPage } from '@/pages/TasksPage'
import { FarmPage } from '@/pages/FarmPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/farm" element={<FarmPage />} />
    </Routes>
  )
}
