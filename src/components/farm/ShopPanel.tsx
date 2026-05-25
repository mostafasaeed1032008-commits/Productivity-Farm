import { motion } from 'framer-motion'
import { SEEDS, TREES } from '@/constants/crops'
import { FARMERS_CATALOG } from '@/constants/farmers'
import { ANIMALS } from '@/constants/animals'
import { useFocusStore } from '@/store/useFocusStore'
import { useSound } from '@/hooks/useSound'
import toast from 'react-hot-toast'

export function ShopPanel() {
  const coins = useFocusStore((s) => s.farm.coins)
  const hireFarmer = useFocusStore((s) => s.hireFarmer)
  const buyAnimal = useFocusStore((s) => s.buyAnimal)
  const { play } = useSound()

  return (
    <div className="space-y-4">
      <section>
        <h4 className="mb-2 font-bold text-green">🌱 بذور (للمزرعة)</h4>
        <p className="text-xs text-white/50 mb-2">اشتري من المتجر وازرع في القطع</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[...SEEDS.slice(0, 8)].map((c) => (
            <div key={c.id} className="glass p-2 text-center text-sm">
              {c.emoji} {c.name} — {c.buyPrice}🪙
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">🌳 أشجار</h4>
        <div className="grid grid-cols-2 gap-2">
          {TREES.map((c) => (
            <div key={c.id} className="glass p-2 text-sm">
              {c.emoji} {c.name} — {c.buyPrice}🪙
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">👨‍🌾 مزارعون</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {FARMERS_CATALOG.map((f) => (
            <motion.button
              key={f.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={coins < f.hireCost}
              onClick={() => {
                if (hireFarmer(f.id)) {
                  play('buy')
                  toast.success(`تم توظيف ${f.name}`)
                } else toast.error('تعذر التوظيف')
              }}
              className="glass flex items-center gap-2 p-3 text-sm disabled:opacity-40"
            >
              <span className="text-2xl">{f.emoji}</span>
              <div className="text-right">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gold">{f.hireCost} 🪙 — سرعة ×{f.speedMult}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">🐄 حيوانات</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ANIMALS.map((a) => (
            <motion.button
              key={a.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={coins < a.buyPrice}
              onClick={() => {
                if (buyAnimal(a.id)) {
                  play('buy')
                  toast.success(`تم شراء ${a.name}`)
                } else toast.error('تعذر الشراء')
              }}
              className="glass p-2 text-sm disabled:opacity-40"
            >
              {a.emoji} {a.name} — {a.buyPrice}🪙 (+{a.coinsPerHour}/س)
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  )
}
