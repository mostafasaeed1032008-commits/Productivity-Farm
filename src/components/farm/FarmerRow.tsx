import { FARMER_MAP } from '@/constants/farmers'
import { useFocusStore } from '@/store/useFocusStore'

export function FarmerRow() {
  const farmers = useFocusStore((s) => s.farm.farmers)
  if (farmers.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {farmers.map((f, i) => {
        const def = FARMER_MAP[f.farmerId]
        if (!def) return null
        return (
          <div key={`${f.farmerId}-${i}`} className="glass flex items-center gap-2 px-3 py-2 text-sm">
            <span className="text-xl">{def.emoji}</span>
            <span>{def.name}</span>
            <span className="text-xs text-white/50">×{def.speedMult}</span>
          </div>
        )
      })}
    </div>
  )
}
