import { CROP_MAP } from '@/constants/crops'
import { FARMER_MAP } from '@/constants/farmers'
import type { FarmState, Plot } from '@/store/types'
import { scaledMs } from '@/utils/mathUtils'

export function getFarmerSpeedMult(farm: FarmState): number {
  return farm.farmers.reduce((mult, f) => {
    const def = FARMER_MAP[f.farmerId]
    return def ? mult * def.speedMult : mult
  }, 1)
}

export function tickPlotGrowth(plot: Plot, speedMult: number, now = Date.now()): Plot {
  if (plot.status !== 'growing' || !plot.cropId || !plot.plantedAt) return plot
  const crop = CROP_MAP[plot.cropId]
  if (!crop) return plot

  const elapsed = now - plot.plantedAt
  const growMs = scaledMs(crop.growthHours * 3600000) / speedMult

  if (elapsed >= growMs) {
    return { ...plot, status: 'ready', progress: 100 }
  }
  return {
    ...plot,
    progress: Math.min(99, (elapsed / growMs) * 100),
  }
}

export function applyGrowthToFarm(farm: FarmState, now = Date.now()): FarmState {
  const speedMult = getFarmerSpeedMult(farm)
  const plots = farm.plots.map((p) => tickPlotGrowth(p, speedMult, now))

  const slots = farm.greenhouse.slots.map((slot) => {
    if (slot.status !== 'growing' || !slot.cropId || !slot.plantedAt) return slot
    const crop = CROP_MAP[slot.cropId]
    if (!crop) return slot
    const elapsed = now - slot.plantedAt
    const growMs = scaledMs(crop.growthHours * 3600000) / speedMult
    if (elapsed >= growMs) return { ...slot, status: 'ready' as const, progress: 100 }
    return { ...slot, progress: Math.min(99, (elapsed / growMs) * 100) }
  })

  return {
    ...farm,
    plots,
    greenhouse: { ...farm.greenhouse, slots },
  }
}
