import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { RIVALS } from '@/constants/rivals'
import { applyGrowthToFarm } from '@/engine/GrowthEngine'
import { deductFarmerSalaries, syncProductivityCoins, tickPassiveCoins } from '@/engine/CoinEngine'
import { catchUpRivals } from '@/engine/RivalEngine'
import { getWeekKey, todayKey, toLocalDateTimeString, parseLocalDateTime } from '@/utils/dateUtils'
import {
  COINS_PER_ATTENDANCE,
  COINS_PER_TASK,
  INITIAL_PLOTS,
  expandCost,
} from '@/utils/mathUtils'
import type {
  FocusOSState,
  Plot,
  Quadrant,
  Task,
  TaskStatus,
  GreenhouseSlot,
} from './types'
import { CROP_MAP } from '@/constants/crops'
import { ANIMAL_MAP, AQUATIC_UNLOCK_COINS } from '@/constants/animals'
import { FARMER_MAP } from '@/constants/farmers'

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'focusMatrix_v2'

function createInitialPlots(count: number): Plot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'empty' as const,
    cropId: null,
    plantedAt: null,
    progress: 0,
    wateredAt: null,
  }))
}

function createGreenhouseSlots(): GreenhouseSlot[] {
  return Array.from({ length: 4 }, () => ({
    cropId: null,
    status: 'empty' as const,
    plantedAt: null,
    progress: 0,
  }))
}

export const initialFarmState = (): FocusOSState['farm'] => {
  const now = Date.now()
  return {
    coins: 50,
    plots: createInitialPlots(INITIAL_PLOTS),
    farmers: [],
    animals: { large: [], poultry: [], aquatic: [] },
    greenhouse: { unlocked: false, slots: createGreenhouseSlots() },
    rivals: RIVALS.map((r) => ({
      id: r.id,
      plots: r.startPlots,
      coins: Math.floor(r.startPlots * 80),
      lastUpdated: now,
    })),
    lastCoinCalc: now,
    totalHoursWorked: 0,
  }
}

const initialState: FocusOSState = {
  tasks: [],
  reflections: {},
  accountabilityScore: 50,
  streak: 0,
  lastActiveDate: null,
  completionHistory: {},
  attendance: {},
  productivity: {},
  farm: initialFarmState(),
}

function recalcStreak(attendance: Record<string, boolean>): number {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (attendance[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function recalcAccountability(tasks: Task[]): number {
  const accountable = tasks.filter(
    (t) => (t.quadrant === 'do' || t.quadrant === 'schedule') && t.deadline,
  )
  if (accountable.length === 0) return 50
  const completed = accountable.filter((t) => t.status === 'completed').length
  const missed = accountable.filter((t) => t.status === 'missed').length
  const score = Math.round((completed / accountable.length) * 100 - missed * 5)
  return Math.max(0, Math.min(100, score))
}

function markMissedTasks(tasks: Task[]): Task[] {
  const now = new Date()
  return tasks.map((t) => {
    if (
      (t.quadrant === 'do' || t.quadrant === 'schedule') &&
      t.deadline &&
      t.status !== 'completed' &&
      t.status !== 'missed'
    ) {
      const dl = parseLocalDateTime(t.deadline)
      if (dl < now) return { ...t, status: 'missed' as TaskStatus }
    }
    return t
  })
}

interface FocusActions {
  addTask: (title: string, quadrant: Quadrant, weekKey: string, deadline?: string | null) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, quadrant: Quadrant) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  setReflection: (taskId: string, text: string) => void
  markAttendance: (dateKey: string) => boolean
  addProductivitySession: (hours: number, label: string) => void
  plantCrop: (plotId: number, cropId: string) => boolean
  waterPlot: (plotId: number) => void
  harvestPlot: (plotId: number) => number
  expandLand: () => boolean
  hireFarmer: (farmerId: string) => boolean
  buyAnimal: (animalId: string) => boolean
  unlockGreenhouse: () => boolean
  plantGreenhouse: (slotIndex: number, cropId: string) => boolean
  harvestGreenhouse: (slotIndex: number) => number
  buyGreenhouseCrop: (slotIndex: number, cropId: string) => boolean
  tickGame: () => void
  bootstrapOffline: () => void
  getTasksForWeek: (weekKey: string) => Task[]
}

export type FocusStore = FocusOSState & FocusActions

function mergeFarm(persisted?: Partial<FocusOSState['farm']>): FocusOSState['farm'] {
  const base = initialFarmState()
  if (!persisted) return base
  return {
    ...base,
    ...persisted,
    coins: typeof persisted.coins === 'number' ? persisted.coins : base.coins,
    plots:
      Array.isArray(persisted.plots) && persisted.plots.length > 0
        ? persisted.plots
        : base.plots,
    farmers: Array.isArray(persisted.farmers) ? persisted.farmers : base.farmers,
    animals: {
      large: persisted.animals?.large ?? base.animals.large,
      poultry: persisted.animals?.poultry ?? base.animals.poultry,
      aquatic: persisted.animals?.aquatic ?? base.animals.aquatic,
    },
    greenhouse: {
      unlocked: persisted.greenhouse?.unlocked ?? base.greenhouse.unlocked,
      slots:
        persisted.greenhouse?.slots?.length
          ? persisted.greenhouse.slots
          : base.greenhouse.slots,
    },
    rivals: persisted.rivals?.length ? persisted.rivals : base.rivals,
    lastCoinCalc: persisted.lastCoinCalc ?? base.lastCoinCalc,
    totalHoursWorked: persisted.totalHoursWorked ?? base.totalHoursWorked,
  }
}

export const useFocusStore = create<FocusStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      getTasksForWeek: (weekKey: string) =>
        get().tasks.filter((t) => t.weekKey === weekKey),

      addTask: (title, quadrant, weekKey, deadline = null) => {
        set((s) => {
          const task: Task = {
            id: crypto.randomUUID(),
            title,
            quadrant,
            status: 'not-started',
            deadline,
            weekKey,
            createdAt: new Date().toISOString(),
            completedAt: null,
          }
          s.tasks.push(task)
          s.tasks = markMissedTasks(s.tasks)
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      updateTask: (id, patch) => {
        set((s) => {
          const i = s.tasks.findIndex((t) => t.id === id)
          if (i >= 0) Object.assign(s.tasks[i], patch)
          s.tasks = markMissedTasks(s.tasks)
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      deleteTask: (id) => {
        set((s) => {
          s.tasks = s.tasks.filter((t) => t.id !== id)
          delete s.reflections[id]
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      moveTask: (id, quadrant) => {
        set((s) => {
          const t = s.tasks.find((x) => x.id === id)
          if (t) t.quadrant = quadrant
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      setTaskStatus: (id, status) => {
        set((s) => {
          const t = s.tasks.find((x) => x.id === id)
          if (!t) return
          const wasCompleted = t.status === 'completed'
          t.status = status
          if (status === 'completed') {
            t.completedAt = toLocalDateTimeString(new Date())
            const day = todayKey()
            s.completionHistory[day] = (s.completionHistory[day] ?? 0) + 1
            if (!wasCompleted && (t.quadrant === 'do' || t.quadrant === 'schedule')) {
              s.farm.coins += COINS_PER_TASK
            }
          }
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      setReflection: (taskId, text) => {
        set((s) => {
          s.reflections[taskId] = text
        })
      },

      markAttendance: (dateKey) => {
        const today = todayKey()
        if (dateKey !== today || get().attendance[today]) return false
        set((s) => {
          s.attendance[today] = true
          s.farm.coins += COINS_PER_ATTENDANCE
          s.streak = recalcStreak(s.attendance)
          s.lastActiveDate = today
        })
        return true
      },

      addProductivitySession: (hours, label) => {
        set((s) => {
          const day = todayKey()
          if (!s.productivity[day]) s.productivity[day] = { hours: 0, sessions: [] }
          s.productivity[day].hours += hours
          s.productivity[day].sessions.push({ hours, label, timestamp: Date.now() })
          const coinGain = syncProductivityCoins(s)
          s.farm.coins += coinGain
          s.farm.totalHoursWorked += hours
          s.lastActiveDate = day
        })
      },

      plantCrop: (plotId, cropId) => {
        const crop = CROP_MAP[cropId]
        if (!crop) return false
        const state = get()
        if (state.farm.coins < crop.buyPrice) return false
        const plot = state.farm.plots.find((p) => p.id === plotId)
        if (!plot || plot.status !== 'empty') return false
        set((s) => {
          s.farm.coins -= crop.buyPrice
          const p = s.farm.plots.find((x) => x.id === plotId)!
          p.status = 'growing'
          p.cropId = cropId
          p.plantedAt = Date.now()
          p.progress = 0
        })
        return true
      },

      waterPlot: (plotId) => {
        set((s) => {
          const p = s.farm.plots.find((x) => x.id === plotId)
          if (p && p.status === 'growing') p.wateredAt = Date.now()
        })
      },

      harvestPlot: (plotId) => {
        const state = get()
        const plot = state.farm.plots.find((p) => p.id === plotId)
        if (!plot || plot.status !== 'ready' || !plot.cropId) return 0
        const crop = CROP_MAP[plot.cropId]
        if (!crop) return 0
        set((s) => {
          s.farm.coins += crop.sellPrice
          const p = s.farm.plots.find((x) => x.id === plotId)!
          p.status = 'empty'
          p.cropId = null
          p.plantedAt = null
          p.progress = 0
          p.wateredAt = null
        })
        return crop.sellPrice
      },

      expandLand: () => {
        const state = get()
        const cost = expandCost(state.farm.plots.length)
        if (state.farm.coins < cost) return false
        set((s) => {
          s.farm.coins -= cost
          const newId = s.farm.plots.length
          s.farm.plots.push({
            id: newId,
            status: 'empty',
            cropId: null,
            plantedAt: null,
            progress: 0,
            wateredAt: null,
          })
        })
        return true
      },

      hireFarmer: (farmerId) => {
        const def = FARMER_MAP[farmerId]
        if (!def) return false
        const state = get()
        const count = state.farm.farmers.filter((f) => f.farmerId === farmerId).length
        if (count >= def.maxHire || state.farm.coins < def.hireCost) return false
        set((s) => {
          s.farm.coins -= def.hireCost
          s.farm.farmers.push({ farmerId, hiredAt: Date.now() })
        })
        return true
      },

      buyAnimal: (animalId) => {
        const def = ANIMAL_MAP[animalId]
        if (!def) return false
        const state = get()
        if (def.zone === 'aquatic' && state.farm.coins < AQUATIC_UNLOCK_COINS && state.farm.animals.aquatic.length === 0) {
          if (state.farm.coins < def.buyPrice) return false
        }
        const zoneList = state.farm.animals[def.zone]
        const zoneTotal = zoneList.length
        const sameType = zoneList.filter((a) => a.animalId === animalId).length
        if (zoneTotal >= def.maxPerZone || state.farm.coins < def.buyPrice) return false
        void sameType
        set((s) => {
          s.farm.coins -= def.buyPrice
          s.farm.animals[def.zone].push({ animalId, boughtAt: Date.now() })
        })
        return true
      },

      unlockGreenhouse: () => {
        if (get().farm.greenhouse.unlocked) return false
        const cost = 500
        if (get().farm.coins < cost) return false
        set((s) => {
          s.farm.coins -= cost
          s.farm.greenhouse.unlocked = true
        })
        return true
      },

      plantGreenhouse: (slotIndex, cropId) => {
        const crop = CROP_MAP[cropId]
        if (!crop || crop.category !== 'greenhouse') return false
        const state = get()
        if (!state.farm.greenhouse.unlocked || state.farm.coins < crop.buyPrice) return false
        const slot = state.farm.greenhouse.slots[slotIndex]
        if (!slot || slot.status !== 'empty') return false
        set((s) => {
          s.farm.coins -= crop.buyPrice
          const sl = s.farm.greenhouse.slots[slotIndex]
          sl.status = 'growing'
          sl.cropId = cropId
          sl.plantedAt = Date.now()
          sl.progress = 0
        })
        return true
      },

      buyGreenhouseCrop: (slotIndex, cropId) => {
        const crop = CROP_MAP[cropId]
        if (!crop || crop.category !== 'greenhouse') return false
        const state = get()
        if (!state.farm.greenhouse.unlocked || state.farm.coins < crop.buyPrice) return false
        const slot = state.farm.greenhouse.slots[slotIndex]
        if (!slot || slot.status !== 'empty') return false
        set((s) => {
          s.farm.coins -= crop.buyPrice
          const sl = s.farm.greenhouse.slots[slotIndex]
          sl.status = 'growing'
          sl.cropId = cropId
          sl.plantedAt = Date.now()
          sl.progress = 0
        })
        return true
      },

      harvestGreenhouse: (slotIndex) => {
        const slot = get().farm.greenhouse.slots[slotIndex]
        if (!slot || slot.status !== 'ready' || !slot.cropId) return 0
        const crop = CROP_MAP[slot.cropId]
        if (!crop) return 0
        set((s) => {
          s.farm.coins += crop.sellPrice
          const sl = s.farm.greenhouse.slots[slotIndex]
          sl.status = 'empty'
          sl.cropId = null
          sl.plantedAt = null
          sl.progress = 0
        })
        return crop.sellPrice
      },

      tickGame: () => {
        set((s) => {
          if (!s.farm?.plots?.length) s.farm = initialFarmState()
          s.farm = applyGrowthToFarm(s.farm)
          const passive = tickPassiveCoins(s.farm)
          s.farm.coins = passive.farm.coins
          s.farm.lastCoinCalc = passive.farm.lastCoinCalc
          s.farm.rivals = catchUpRivals(s.farm.rivals)
          s.tasks = markMissedTasks(s.tasks)
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },

      bootstrapOffline: () => {
        set((s) => {
          if (!s.farm?.plots?.length) s.farm = initialFarmState()
          let farm = applyGrowthToFarm(s.farm)
          farm = deductFarmerSalaries(farm)
          const passive = tickPassiveCoins(farm, Date.now())
          farm = passive.farm
          farm.rivals = catchUpRivals(farm.rivals)
          const prodCoins = syncProductivityCoins({ ...s, farm })
          farm.coins += prodCoins
          farm.totalHoursWorked = Object.values(s.productivity).reduce((a, d) => a + d.hours, 0)
          s.farm = farm
          s.streak = recalcStreak(s.attendance)
          s.tasks = markMissedTasks(s.tasks)
          s.accountabilityScore = recalcAccountability(s.tasks)
        })
      },
    })),
    {
      name: STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FocusOSState>
        return {
          ...current,
          tasks: p.tasks ?? current.tasks,
          reflections: p.reflections ?? current.reflections,
          accountabilityScore: p.accountabilityScore ?? current.accountabilityScore,
          streak: p.streak ?? current.streak,
          lastActiveDate: p.lastActiveDate ?? current.lastActiveDate,
          completionHistory: p.completionHistory ?? current.completionHistory,
          attendance: p.attendance ?? current.attendance,
          productivity: p.productivity ?? current.productivity,
          farm: mergeFarm(p.farm),
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.bootstrapOffline()
      },
      partialize: (state): FocusOSState => ({
        tasks: state.tasks,
        reflections: state.reflections,
        accountabilityScore: state.accountabilityScore,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        completionHistory: state.completionHistory,
        attendance: state.attendance,
        productivity: state.productivity,
        farm: state.farm,
      }),
    },
  ),
)

// Default week for new tasks
export function defaultWeekKey(): string {
  return getWeekKey(0)
}
