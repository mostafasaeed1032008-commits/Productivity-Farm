import { useEffect } from 'react'
import { useFocusStore } from '@/store/useFocusStore'
import type { FocusOSState, PersistedFocusState } from '@/store/types'

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'focusMatrix_v2'

export function useStorageSync() {
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        const parsed = JSON.parse(e.newValue) as
          | PersistedFocusState
          | { state: FocusOSState; version?: number }
        const data =
          'state' in parsed && parsed.state && 'tasks' in parsed.state
            ? parsed.state
            : ('tasks' in parsed ? parsed : null)
        if (data && 'tasks' in data) {
          useFocusStore.setState(data as FocusOSState)
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
}
