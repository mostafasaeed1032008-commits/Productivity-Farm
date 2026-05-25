export type AnimalZone = 'large' | 'poultry' | 'aquatic'

export interface Animal {
  id: string
  name: string
  emoji: string
  zone: AnimalZone
  buyPrice: number
  coinsPerHour: number
  maxPerZone: number
}

export const ANIMALS: Animal[] = [
  { id: 'cow', name: 'بقرة', emoji: '🐄', zone: 'large', buyPrice: 300, coinsPerHour: 18, maxPerZone: 4 },
  { id: 'sheep', name: 'خروف', emoji: '🐑', zone: 'large', buyPrice: 200, coinsPerHour: 12, maxPerZone: 4 },
  { id: 'goat', name: 'عنزة', emoji: '🐐', zone: 'large', buyPrice: 180, coinsPerHour: 10, maxPerZone: 4 },
  { id: 'horse', name: 'حصان', emoji: '🐴', zone: 'large', buyPrice: 500, coinsPerHour: 25, maxPerZone: 2 },
  { id: 'donkey', name: 'حمار', emoji: '🫏', zone: 'large', buyPrice: 150, coinsPerHour: 8, maxPerZone: 4 },
  { id: 'camel', name: 'جمل', emoji: '🐪', zone: 'large', buyPrice: 400, coinsPerHour: 20, maxPerZone: 2 },
  { id: 'chicken', name: 'دجاجة', emoji: '🐔', zone: 'poultry', buyPrice: 80, coinsPerHour: 5, maxPerZone: 8 },
  { id: 'duck', name: 'بطة', emoji: '🦆', zone: 'poultry', buyPrice: 100, coinsPerHour: 6, maxPerZone: 8 },
  { id: 'turkey', name: 'ديك رومي', emoji: '🦃', zone: 'poultry', buyPrice: 120, coinsPerHour: 7, maxPerZone: 8 },
  { id: 'rabbit', name: 'أرنب', emoji: '🐇', zone: 'poultry', buyPrice: 60, coinsPerHour: 4, maxPerZone: 8 },
  { id: 'bee', name: 'نحل', emoji: '🐝', zone: 'poultry', buyPrice: 150, coinsPerHour: 10, maxPerZone: 4 },
  { id: 'fish', name: 'سمك', emoji: '🐟', zone: 'aquatic', buyPrice: 200, coinsPerHour: 12, maxPerZone: 6 },
  { id: 'shrimp', name: 'روبيان', emoji: '🦐', zone: 'aquatic', buyPrice: 180, coinsPerHour: 10, maxPerZone: 6 },
  { id: 'crab', name: 'سرطان', emoji: '🦀', zone: 'aquatic', buyPrice: 220, coinsPerHour: 14, maxPerZone: 4 },
]

export const ANIMAL_MAP = Object.fromEntries(ANIMALS.map((a) => [a.id, a])) as Record<string, Animal>

export const AQUATIC_UNLOCK_COINS = 200
