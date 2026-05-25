export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'windy'

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'sunset'
  return 'night'
}

export const SKY_GRADIENTS: Record<TimeOfDay, string> = {
  dawn: 'linear-gradient(180deg, #1a0a2e 0%, #8B4513 50%, #FFA500 100%)',
  morning: 'linear-gradient(180deg, #87CEEB 0%, #c8e6c9 100%)',
  afternoon: 'linear-gradient(180deg, #4169E1 0%, #228B22 100%)',
  sunset: 'linear-gradient(180deg, #FF6347 0%, #8B008B 50%, #1a0a2e 100%)',
  night: 'linear-gradient(180deg, #0a0015 0%, #071a07 100%)',
}

const WEATHER_PATTERNS: Weather[] = [
  'sunny',
  'sunny',
  'cloudy',
  'rainy',
  'sunny',
  'windy',
  'sunny',
  'cloudy',
]

export function getWeather(hour: number): Weather {
  return WEATHER_PATTERNS[hour % WEATHER_PATTERNS.length]
}

export function getCurrentSky(): string {
  return SKY_GRADIENTS[getTimeOfDay(new Date().getHours())]
}

export function getCurrentWeather(): Weather {
  return getWeather(new Date().getHours())
}
