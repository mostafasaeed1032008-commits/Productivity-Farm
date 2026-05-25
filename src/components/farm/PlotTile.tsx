import { motion } from 'framer-motion'
import { CROP_MAP } from '@/constants/crops'
import type { Plot } from '@/store/types'
import { GrowthBar } from './GrowthBar'

interface Props {
  plot: Plot
  onClick: () => void
}

export function PlotTile({ plot, onClick }: Props) {
  const crop = plot.cropId ? CROP_MAP[plot.cropId] : null
  const isReady = plot.status === 'ready'
  const isEmpty = plot.status === 'empty'

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`relative flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-lg border-2 md:h-20 md:w-20 ${
        isEmpty
          ? 'border-dashed border-amber-800/60 bg-amber-950/40'
          : isReady
            ? 'plot-ready border-green bg-green/20 animate-pulse'
            : 'border-amber-700/50 bg-amber-900/30'
      }`}
    >
      {isEmpty && <span className="text-2xl opacity-40">🟫</span>}
      {crop && (
        <>
          <span className="text-2xl">{crop.emoji}</span>
          {plot.status === 'growing' && <GrowthBar progress={plot.progress} />}
        </>
      )}
      {isReady && <span className="text-[10px] text-success font-bold">حصاد!</span>}
    </motion.button>
  )
}
