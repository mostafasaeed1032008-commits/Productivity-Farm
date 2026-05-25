import { ANIMAL_MAP } from '@/constants/animals'
import { useFocusStore } from '@/store/useFocusStore'

const ZONES = [
  { key: 'large' as const, label: 'المواشي', emoji: '🐄' },
  { key: 'poultry' as const, label: 'الدواجن', emoji: '🐔' },
  { key: 'aquatic' as const, label: 'المائية', emoji: '🐟' },
]

export function AnimalZones() {
  const animals = useFocusStore((s) => s.farm.animals)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ZONES.map((z) => (
        <div key={z.key} className="glass p-4">
          <h4 className="mb-2 font-bold">
            {z.emoji} {z.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {animals[z.key].map((inst, i) => {
              const def = ANIMAL_MAP[inst.animalId]
              return (
                <span key={i} className="rounded-lg bg-white/10 px-2 py-1 text-sm">
                  {def?.emoji} {def?.name}
                </span>
              )
            })}
            {animals[z.key].length === 0 && (
              <span className="text-xs text-white/40">لا حيوانات بعد</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
