import { useFocusStore } from './useFocusStore'
import type { FarmState } from './types'

export const useFarmState = (): FarmState => useFocusStore((s) => s.farm)

export const useFarmCoins = (): number => useFocusStore((s) => s.farm.coins)

export const useFarmActions = () =>
  useFocusStore((s) => ({
    plantCrop: s.plantCrop,
    waterPlot: s.waterPlot,
    harvestPlot: s.harvestPlot,
    expandLand: s.expandLand,
    hireFarmer: s.hireFarmer,
    buyAnimal: s.buyAnimal,
    unlockGreenhouse: s.unlockGreenhouse,
    plantGreenhouse: s.plantGreenhouse,
    harvestGreenhouse: s.harvestGreenhouse,
    tickGame: s.tickGame,
    bootstrapOffline: s.bootstrapOffline,
  }))
