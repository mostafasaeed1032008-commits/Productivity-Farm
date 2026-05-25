export interface Crop {
  id: string
  name: string
  emoji: string
  category: 'seed' | 'tree' | 'greenhouse'
  buyPrice: number
  sellPrice: number
  growthHours: number
  requiresLevel: number
}

export const SEEDS: Crop[] = [
  { id: 'wheat', name: 'قمح', emoji: '🌾', category: 'seed', buyPrice: 20, sellPrice: 35, growthHours: 2, requiresLevel: 1 },
  { id: 'corn', name: 'ذرة', emoji: '🌽', category: 'seed', buyPrice: 30, sellPrice: 60, growthHours: 4, requiresLevel: 1 },
  { id: 'tomato', name: 'طماطم', emoji: '🍅', category: 'seed', buyPrice: 45, sellPrice: 90, growthHours: 6, requiresLevel: 2 },
  { id: 'carrot', name: 'جزر', emoji: '🥕', category: 'seed', buyPrice: 25, sellPrice: 50, growthHours: 3, requiresLevel: 1 },
  { id: 'pepper', name: 'فلفل', emoji: '🌶️', category: 'seed', buyPrice: 55, sellPrice: 110, growthHours: 8, requiresLevel: 2 },
  { id: 'eggplant', name: 'باذنجان', emoji: '🍆', category: 'seed', buyPrice: 40, sellPrice: 80, growthHours: 5, requiresLevel: 2 },
  { id: 'strawberry', name: 'فراولة', emoji: '🍓', category: 'seed', buyPrice: 70, sellPrice: 150, growthHours: 10, requiresLevel: 3 },
  { id: 'watermelon', name: 'بطيخ', emoji: '🍉', category: 'seed', buyPrice: 80, sellPrice: 170, growthHours: 12, requiresLevel: 3 },
  { id: 'cucumber', name: 'خيار', emoji: '🥒', category: 'seed', buyPrice: 30, sellPrice: 55, growthHours: 3, requiresLevel: 1 },
  { id: 'spinach', name: 'سبانخ', emoji: '🥬', category: 'seed', buyPrice: 20, sellPrice: 40, growthHours: 2, requiresLevel: 1 },
  { id: 'potato', name: 'بطاطس', emoji: '🥔', category: 'seed', buyPrice: 35, sellPrice: 65, growthHours: 5, requiresLevel: 2 },
  { id: 'onion', name: 'بصل', emoji: '🧅', category: 'seed', buyPrice: 25, sellPrice: 45, growthHours: 4, requiresLevel: 1 },
  { id: 'garlic', name: 'ثوم', emoji: '🧄', category: 'seed', buyPrice: 30, sellPrice: 55, growthHours: 4, requiresLevel: 2 },
  { id: 'lettuce', name: 'خس', emoji: '🥗', category: 'seed', buyPrice: 20, sellPrice: 38, growthHours: 2, requiresLevel: 1 },
]

export const TREES: Crop[] = [
  { id: 'apple', name: 'تفاح', emoji: '🍎', category: 'tree', buyPrice: 150, sellPrice: 300, growthHours: 24, requiresLevel: 3 },
  { id: 'orange', name: 'برتقال', emoji: '🍊', category: 'tree', buyPrice: 200, sellPrice: 420, growthHours: 48, requiresLevel: 4 },
  { id: 'lemon', name: 'ليمون', emoji: '🍋', category: 'tree', buyPrice: 180, sellPrice: 370, growthHours: 36, requiresLevel: 4 },
  { id: 'mango', name: 'مانجو', emoji: '🥭', category: 'tree', buyPrice: 250, sellPrice: 520, growthHours: 72, requiresLevel: 5 },
  { id: 'olive', name: 'زيتون', emoji: '🫒', category: 'tree', buyPrice: 300, sellPrice: 650, growthHours: 96, requiresLevel: 6 },
  { id: 'date_palm', name: 'نخيل', emoji: '🌴', category: 'tree', buyPrice: 350, sellPrice: 750, growthHours: 120, requiresLevel: 7 },
  { id: 'fig', name: 'تين', emoji: '🍇', category: 'tree', buyPrice: 220, sellPrice: 460, growthHours: 60, requiresLevel: 5 },
  { id: 'pomegranate', name: 'رمان', emoji: '🍑', category: 'tree', buyPrice: 260, sellPrice: 540, growthHours: 80, requiresLevel: 6 },
]

export const GREENHOUSE_CROPS: Crop[] = [
  { id: 'rose', name: 'ورد', emoji: '🌹', category: 'greenhouse', buyPrice: 100, sellPrice: 200, growthHours: 6, requiresLevel: 3 },
  { id: 'lavender', name: 'خزامى', emoji: '💜', category: 'greenhouse', buyPrice: 120, sellPrice: 240, growthHours: 8, requiresLevel: 4 },
  { id: 'mushroom', name: 'فطر', emoji: '🍄', category: 'greenhouse', buyPrice: 90, sellPrice: 180, growthHours: 4, requiresLevel: 3 },
  { id: 'vanilla', name: 'فانيليا', emoji: '🌿', category: 'greenhouse', buyPrice: 200, sellPrice: 420, growthHours: 16, requiresLevel: 5 },
  { id: 'saffron', name: 'زعفران', emoji: '🌸', category: 'greenhouse', buyPrice: 300, sellPrice: 650, growthHours: 24, requiresLevel: 6 },
  { id: 'aloe', name: 'صبار', emoji: '🌵', category: 'greenhouse', buyPrice: 80, sellPrice: 160, growthHours: 5, requiresLevel: 2 },
]

export const ALL_CROPS: Crop[] = [...SEEDS, ...TREES, ...GREENHOUSE_CROPS]

export const CROP_MAP = Object.fromEntries(ALL_CROPS.map((c) => [c.id, c])) as Record<string, Crop>
