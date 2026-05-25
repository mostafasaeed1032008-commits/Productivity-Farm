export type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate'
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'missed'

export interface Task {
  id: string
  title: string
  quadrant: Quadrant
  status: TaskStatus
  deadline: string | null
  weekKey: string
  createdAt: string
  completedAt: string | null
}

export interface SessionRecord {
  hours: number
  label: string
  timestamp: number
}

export interface DayProductivity {
  hours: number
  sessions: SessionRecord[]
}

export interface Plot {
  id: number
  status: 'empty' | 'growing' | 'ready' | 'watered'
  cropId: string | null
  plantedAt: number | null
  progress: number
  wateredAt: number | null
}

export interface HiredFarmer {
  farmerId: string
  hiredAt: number
}

export interface AnimalInstance {
  animalId: string
  boughtAt: number
}

export interface GreenhouseSlot {
  cropId: string | null
  status: 'empty' | 'growing' | 'ready'
  plantedAt: number | null
  progress: number
}

export interface RivalState {
  id: string
  plots: number
  coins: number
  lastUpdated: number
}

export interface FarmState {
  coins: number
  plots: Plot[]
  farmers: HiredFarmer[]
  animals: {
    large: AnimalInstance[]
    poultry: AnimalInstance[]
    aquatic: AnimalInstance[]
  }
  greenhouse: {
    unlocked: boolean
    slots: GreenhouseSlot[]
  }
  rivals: RivalState[]
  lastCoinCalc: number
  totalHoursWorked: number
}

export interface FocusOSState {
  tasks: Task[]
  reflections: Record<string, string>
  accountabilityScore: number
  streak: number
  lastActiveDate: string | null
  completionHistory: Record<string, number>
  attendance: Record<string, boolean>
  productivity: Record<string, DayProductivity>
  farm: FarmState
}

export interface PersistedFocusState {
  state: FocusOSState
  version?: number
}
