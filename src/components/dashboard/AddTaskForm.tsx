import { useState } from 'react'
import type { Quadrant } from '@/store/types'
import { useFocusStore } from '@/store/useFocusStore'
import { useSound } from '@/hooks/useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'

interface Props {
  quadrant: Quadrant
  weekKey: string
}

export function AddTaskForm({ quadrant, weekKey }: Props) {
  const addTask = useFocusStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const { play } = useSound()
  const hasDeadline = quadrant === 'do' || quadrant === 'schedule'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask(title.trim(), quadrant, weekKey, hasDeadline && deadline ? deadline : null)
    play('task-add')
    toast.success(pickRandom(MESSAGES.taskAdd))
    setTitle('')
    setDeadline('')
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="مهمة جديدة..."
        className="w-full rounded-lg bg-white/10 px-2 py-1 text-xs"
      />
      {hasDeadline && (
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg bg-white/10 px-2 py-1 text-xs"
        />
      )}
      <button type="submit" className="rounded-lg bg-white/15 py-1 text-xs hover:bg-white/25">
        + إضافة
      </button>
    </form>
  )
}
