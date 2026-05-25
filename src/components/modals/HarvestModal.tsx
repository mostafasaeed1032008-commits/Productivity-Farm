import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  reward: number | null
  onClose: () => void
}

export function HarvestModal({ reward, onClose }: Props) {
  return (
    <AnimatePresence>
      {reward !== null && reward > 0 && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-2">🌾</div>
            <h3 className="text-xl font-bold text-success">حصاد ناجح!</h3>
            <p className="mt-2 text-gold font-mono-num text-2xl">+{reward} 🪙</p>
            <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-accent px-6 py-2">
              رائع!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
