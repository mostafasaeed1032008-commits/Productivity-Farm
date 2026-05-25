import { FARMER_MAP } from '@/constants/farmers'
import { ANIMAL_MAP } from '@/constants/animals'
import type { FarmState, FocusOSState } from '@/store/types'
import { COINS_PER_HOUR, getTotalProductivityHours, scaledHours } from '@/utils/mathUtils'

export function calcAnimalIncome(farm: FarmState, elapsedMs: number): number {
  const hours = scaledHours(elapsedMs)
  let income = 0
  const all = [...farm.animals.large, ...farm.animals.poultry, ...farm.animals.aquatic]
  for (const inst of all) {
    const def = ANIMAL_MAP[inst.animalId]
    if (def) income += def.coinsPerHour * hours
  }
  return Math.floor(income)
}

export function syncProductivityCoins(state: FocusOSState): number {
  const total = getTotalProductivityHours(state.productivity)
  const diff = total - state.farm.totalHoursWorked
  if (diff <= 0) return 0
  return Math.floor(diff * COINS_PER_HOUR)
}

export function tickPassiveCoins(
  farm: FarmState,
  now = Date.now(),
): { farm: FarmState; earned: number } {
  const elapsed = now - farm.lastCoinCalc
  if (elapsed < 1000) return { farm, earned: 0 }
  const earned = calcAnimalIncome(farm, elapsed)
  return {
    earned,
    farm: { ...farm, coins: farm.coins + earned, lastCoinCalc: now },
  }
}

export function deductFarmerSalaries(farm: FarmState, now = Date.now()): FarmState {
  let coins = farm.coins
  const updatedFarmers = farm.farmers.map((hired) => {
    const def = FARMER_MAP[hired.farmerId]
    if (!def) return hired
    const msPerDay = 86400000
    const daysPassed = Math.floor((now - hired.hiredAt) / msPerDay)
    if (daysPassed <= 0) return hired
    coins = Math.max(0, coins - def.salaryPerDay * daysPassed)
    return { ...hired, hiredAt: now }
  })
  return { ...farm, coins, farmers: updatedFarmers }
}
