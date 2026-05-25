import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useFarmCoins } from '@/store/useFarmStore'

export function CoinBadge() {
  const coins = useFarmCoins()
  return (
    <motion.div
      className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-gold"
      whileHover={{ scale: 1.05 }}
    >
      <span>🪙</span>
      <AnimatedCounter value={coins} className="text-sm font-semibold" />
    </motion.div>
  )
}
