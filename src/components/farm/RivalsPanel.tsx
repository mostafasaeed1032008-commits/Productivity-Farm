import { useEffect, useRef } from 'react'
import { RIVALS } from '@/constants/rivals'
import { getRivalDef } from '@/engine/RivalEngine'
import { useFocusStore } from '@/store/useFocusStore'
import { MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'

export function RivalsPanel() {
  const rivals = useFocusStore((s) => s.farm.rivals)
  const playerPlots = useFocusStore((s) => s.farm.plots.length)
  const alerted = useRef<Set<string>>(new Set())

  useEffect(() => {
    rivals.forEach((r) => {
      const def = getRivalDef(r.id)
      if (!def) return
      if (Math.floor(r.plots) > playerPlots && !alerted.current.has(r.id)) {
        alerted.current.add(r.id)
        toast(MESSAGES.rivalAlert(def.name), { icon: '⚠️' })
      }
    })
  }, [rivals, playerPlots])

  const sorted = [...rivals].sort((a, b) => b.plots - a.plots)

  return (
    <div className="space-y-2">
      {sorted.map((r) => {
        const def = RIVALS.find((x) => x.id === r.id)!
        return (
          <div
            key={r.id}
            className="glass flex items-center gap-3 p-3"
            style={{ borderRight: `4px solid ${def.color}` }}
          >
            <span className="text-3xl">{def.emoji}</span>
            <div className="flex-1">
              <div className="font-bold">{def.name}</div>
              <div className="text-xs text-white/60">
                قطع: {r.plots.toFixed(1)} — عملات: {r.coins}
              </div>
            </div>
            {Math.floor(r.plots) > playerPlots && (
              <span className="text-xs text-danger">متقدم!</span>
            )}
          </div>
        )
      })}
      <p className="text-center text-sm text-white/50">
        قطعك: {playerPlots}
      </p>
    </div>
  )
}
