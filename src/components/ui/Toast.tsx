import { Toaster } from 'react-hot-toast'

export function ArabicToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(18,20,28,0.95)',
          color: '#e8eaef',
          fontFamily: 'Tajawal, sans-serif',
          direction: 'rtl',
          border: '1px solid rgba(124,108,246,0.3)',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#00d68f', secondary: '#0a0b0f' } },
        error: { iconTheme: { primary: '#ff4757', secondary: '#0a0b0f' } },
      }}
    />
  )
}
