import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="glass max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="mb-4 text-sm text-white/70">{message}</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm bg-white/10">
                إلغاء
              </button>
              <button type="button" onClick={onConfirm} className="rounded-lg px-4 py-2 text-sm bg-danger text-white">
                تأكيد
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
