import { useCallback, useState } from 'react'
import { useFocusStore } from '@/store/useFocusStore'
import { useSound } from './useSound'
import { pickRandom, MESSAGES } from '@/constants/messages'
import toast from 'react-hot-toast'

export function usePlotActions() {
  const plantCrop = useFocusStore((s) => s.plantCrop)
  const harvestPlot = useFocusStore((s) => s.harvestPlot)
  const waterPlot = useFocusStore((s) => s.waterPlot)
  const { play } = useSound()
  const [plantModalPlot, setPlantModalPlot] = useState<number | null>(null)
  const [harvestReward, setHarvestReward] = useState<number | null>(null)

  const openPlant = useCallback((plotId: number) => setPlantModalPlot(plotId), [])
  const closePlant = useCallback(() => setPlantModalPlot(null), [])

  const doPlant = useCallback(
    (cropId: string) => {
      if (plantModalPlot === null) return false
      const ok = plantCrop(plantModalPlot, cropId)
      if (ok) {
        play('plant')
        toast.success(pickRandom(MESSAGES.farmPlant))
        setPlantModalPlot(null)
      } else {
        play('error')
        toast.error('لا توجد عملات كافية أو القطعة غير فارغة')
      }
      return ok
    },
    [plantModalPlot, plantCrop, play],
  )

  const doHarvest = useCallback(
    (plotId: number) => {
      const reward = harvestPlot(plotId)
      if (reward > 0) {
        play('harvest')
        toast.success(pickRandom(MESSAGES.farmHarvest))
        setHarvestReward(reward)
      }
      return reward
    },
    [harvestPlot, play],
  )

  const doWater = useCallback(
    (plotId: number) => {
      waterPlot(plotId)
      play('click')
    },
    [waterPlot, play],
  )

  return {
    plantModalPlot,
    harvestReward,
    setHarvestReward,
    openPlant,
    closePlant,
    doPlant,
    doHarvest,
    doWater,
  }
}
