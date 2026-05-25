import { useMemo } from 'react'
import { useFocusStore } from '@/store/useFocusStore'
import { ANIMAL_MAP } from '@/constants/animals'
import { getTodayHours, getTotalProductivityHours, COINS_PER_HOUR } from '@/utils/mathUtils'
import { todayKey } from '@/utils/dateUtils'

export function useCoins() {
  const farm = useFocusStore((s) => s.farm)
  const productivity = useFocusStore((s) => s.productivity)

  const dailyRate = useMemo(() => {
    let rate = 0
    const all = [...farm.animals.large, ...farm.animals.poultry, ...farm.animals.aquatic]
    for (const inst of all) {
      const def = ANIMAL_MAP[inst.animalId]
      if (def) rate += def.coinsPerHour
    }
    const todayH = getTodayHours(productivity, todayKey())
    rate += todayH * COINS_PER_HOUR
    return Math.round(rate * 10) / 10
  }, [farm.animals, productivity])

  const totalHours = useMemo(
    () => getTotalProductivityHours(productivity),
    [productivity],
  )

  return { coins: farm.coins, dailyRate, totalHours }
}
