import { useState } from 'react'
import type { Quadrant } from '@/store/types'
import { QUADRANTS } from '@/constants/quadrants'
import { useFocusStore } from '@/store/useFocusStore'
import { useSound } from '@/hooks/useSound'
import toast from 'react-hot-toast'
import { pickRandom, MESSAGES } from '@/constants/messages'

interface Props {
  weekKey: string
}

export function QuickAddForm({ weekKey }: Props) {
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
