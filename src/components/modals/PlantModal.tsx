import { motion, AnimatePresence } from 'framer-motion'
import { SEEDS } from '@/constants/crops'
import { useFocusStore } from '@/store/useFocusStore'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (cropId: string) => void
}

export function PlantModal({ open, onClose, onSelect }: Props) {
  const coins = useFocusStore((s) => s.farm.coins)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass max-h-[80vh] w-full max-w-lg overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold">اختر محصولاً للزراعة</h3>
            <p className="mb-3 text-sm text-gold">🪙 {coins} عملة</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SEEDS.map((crop) => (
                <motion.button
                  key={crop.id}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={coins < crop.buyPrice}
                  onClick={() => onSelect(crop.id)}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center disabled:opacity-40"
                >
                  <div className="text-2xl">{crop.emoji}</div>
                  <div className="text-sm font-medium">{crop.name}</div>
                  <div className="text-xs text-gold">{crop.buyPrice} 🪙</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
