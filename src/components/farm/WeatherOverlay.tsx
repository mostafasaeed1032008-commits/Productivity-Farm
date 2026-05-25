import { getCurrentWeather } from '@/engine/WeatherEngine'

export function WeatherOverlay() {
  const weather = getCurrentWeather()

  if (weather === 'rainy') {
    return (
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="rain-drop absolute w-0.5 bg-blue-300/60"
            style={{
              left: `${(i * 2.5) % 100}%`,
              height: `${12 + (i % 5) * 4}px`,
              animationDuration: `${0.6 + (i % 10) * 0.1}s`,
              animationDelay: `${(i % 20) * 0.05}s`,
            }}
          />
        ))}
      </div>
    )
  }

  if (weather === 'windy') {
    return (
      <div className="pointer-events-none absolute inset-0 z-[5]">
        {['🍃', '🌿', '🍂'].map((leaf, i) => (
          <span
            key={i}
            className="leaf-float absolute text-2xl opacity-60"
            style={{ left: `${20 + i * 30}%`, top: `${10 + i * 15}%`, animationDelay: `${i}s` }}
          >
            {leaf}
          </span>
        ))}
      </div>
    )
  }

  return null
}
