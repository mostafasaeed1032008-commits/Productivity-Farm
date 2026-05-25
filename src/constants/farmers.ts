export interface FarmerDef {
  id: string
  name: string
  emoji: string
  hireCost: number
  salaryPerDay: number
  speedMult: number
  maxHire: number
}

export const FARMERS_CATALOG: FarmerDef[] = [
  { id: 'f1', name: 'مزارع مبتدئ', emoji: '👨‍🌾', hireCost: 100, salaryPerDay: 5, speedMult: 1.1, maxHire: 3 },
  { id: 'f2', name: 'مزارع محترف', emoji: '🧑‍🌾', hireCost: 300, salaryPerDay: 12, speedMult: 1.25, maxHire: 2 },
  { id: 'f3', name: 'مزارع خبير', emoji: '👩‍🌾', hireCost: 600, salaryPerDay: 25, speedMult: 1.5, maxHire: 2 },
  { id: 'f4', name: 'مزارع أسطوري', emoji: '🦸', hireCost: 1200, salaryPerDay: 50, speedMult: 2.0, maxHire: 1 },
]

export const FARMER_MAP = Object.fromEntries(FARMERS_CATALOG.map((f) => [f.id, f])) as Record<
  string,
  FarmerDef
>
