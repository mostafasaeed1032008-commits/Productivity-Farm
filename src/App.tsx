import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { PageTransition } from '@/components/layout/PageTransition'
import { ArabicToaster } from '@/components/ui/Toast'
import { AppRouter } from '@/router'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useStorageSync } from '@/hooks/useStorageSync'
import { useFocusStore } from '@/store/useFocusStore'

function AppContent() {
  useGameLoop(10000)
  useStorageSync()

  return (
    <>
      <Navbar />
      <main>
        <PageTransition>
          <AppRouter />
        </PageTransition>
      </main>
      <ArabicToaster />
    </>
  )
}

function App() {
  const [hydrated, setHydrated] = useState(
    () => useFocusStore.persist.hasHydrated(),
  )

  useEffect(() => {
    const unsub = useFocusStore.persist.onFinishHydration(() => {
      setHydrated(true)
      useFocusStore.getState().bootstrapOffline()
    })
    void useFocusStore.persist.rehydrate()
    return unsub
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep text-white/60">
        جاري التحميل...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-deep text-white">
        <AppContent />
      </div>
    </BrowserRouter>
  )
}

export default App
