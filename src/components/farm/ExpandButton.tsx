import { motion } from 'framer-motion'
import { useFocusStore } from '@/store/useFocusStore'
import { expandCost } from '@/utils/mathUtils'
import { useSound } from '@/hooks/useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'

export function ExpandButton() {
  const plots = useFocusStore((s) => s.farm.plots)
  const coins = useFocusStore((s) => s.farm.coins)
  const expandLand = useFocusStore((s) => s.expandLand)
  const { play } = useSound()
  const cost = expandCost(plots.length)

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={coins < cost}
      onClick={() => {
        if (expandLand()) {
          play('expand')
          toast.success(pickRandom(MESSAGES.farmExpand))
        } else {
          play('error')
          toast.error('عملات غير كافية')
        }
      }}
      className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold disabled:opacity-40"
    >
      توسيع الأرض — {cost} 🪙
    </motion.button>
  )
}
