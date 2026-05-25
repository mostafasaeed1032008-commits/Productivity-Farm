import { GREENHOUSE_CROPS, CROP_MAP } from '@/constants/crops'
import { useFocusStore } from '@/store/useFocusStore'
import { GrowthBar } from './GrowthBar'
import { motion } from 'framer-motion'

export function GreenhousePanel() {
  const gh = useFocusStore((s) => s.farm.greenhouse)
  const coins = useFocusStore((s) => s.farm.coins)
  const unlock = useFocusStore((s) => s.unlockGreenhouse)
  const plantGh = useFocusStore((s) => s.plantGreenhouse)
  const harvestGh = useFocusStore((s) => s.harvestGreenhouse)

  if (!gh.unlocked) {
    return (
      <div className="glass p-6 text-center">
        <p className="mb-3">الصوبة مغلقة — افتحها بـ 500 🪙</p>
        <button
          type="button"
          disabled={coins < 500}
          onClick={() => unlock()}
          className="rounded-xl bg-green px-6 py-2 disabled:opacity-40"
        >
          فتح الصوبة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {gh.slots.map((slot, i) => {
          const crop = slot.cropId ? CROP_MAP[slot.cropId] : null
          return (
            <motion.div key={i} className="glass p-3 text-center">
              {slot.status === 'empty' ? (
                <select
                  className="w-full rounded bg-white/10 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) plantGh(i, e.target.value)
                  }}
                >
                  <option value="">زراعة...</option>
                  {GREENHOUSE_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.buyPrice})
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <div className="text-2xl">{crop?.emoji}</div>
                  {slot.status === 'growing' && <GrowthBar progress={slot.progress} />}
                  {slot.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => harvestGh(i)}
                      className="mt-1 text-xs text-success"
                    >
                      حصاد
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
