import { useEffect, useRef, useState } from 'react'
import { getCurrentSky } from '@/engine/WeatherEngine'

/** Decorative Pixi background — lazy-loaded; falls back to CSS if WebGL fails */
export function FarmCanvas() {
  const ref = useRef<HTMLDivElement>(null)
  const [pixiFailed, setPixiFailed] = useState(false)

  useEffect(() => {
    if (!ref.current || pixiFailed) return

    let app: import('pixi.js').Application | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null
    let destroyed = false

    const init = async () => {
      try {
        const PIXI = await import('pixi.js')
        const container = ref.current
        if (!container || destroyed) return

        app = new PIXI.Application()
        await app.init({
          backgroundAlpha: 0,
          width: Math.max(container.clientWidth, 320),
          height: Math.max(container.clientHeight, 280),
          antialias: true,
          preference: 'webgl',
        })

        if (destroyed || !ref.current) {
          app.destroy(true)
          return
        }

        container.appendChild(app.canvas)

        const resize = () => {
          if (!app || !container) return
          const w = Math.max(container.clientWidth, 320)
          const h = Math.max(container.clientHeight, 280)
          app.renderer.resize(w, h)
        }

        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(container)

        const draw = () => {
          if (!app) return
          app.stage.removeChildren()
          const w = app.screen.width
          const h = app.screen.height

          const sky = new PIXI.Graphics()
          sky.rect(0, 0, w, h * 0.55)
          sky.fill({ color: 0x87ceeb })
          app.stage.addChild(sky)

          const ground = new PIXI.Graphics()
          ground.rect(0, h * 0.55, w, h * 0.45)
          ground.fill({ color: 0x2d5a27 })
          app.stage.addChild(ground)

          ;['☁️', '⛅', '🌤️'].forEach((emoji, i) => {
            const t = new PIXI.Text({
              text: emoji,
              style: { fontSize: 36 + i * 8 },
            })
            t.x = w * (0.15 + i * 0.3)
            t.y = h * (0.08 + i * 0.04)
            app!.stage.addChild(t)
          })

          const fence = new PIXI.Graphics()
          fence.rect(0, h * 0.52, w, 4)
          fence.fill({ color: 0x8b4513 })
          app.stage.addChild(fence)

          const bush = new PIXI.Text({ text: '🌳🌿🌳', style: { fontSize: 28 } })
          bush.x = w * 0.05
          bush.y = h * 0.48
          app.stage.addChild(bush)
        }

        draw()
        intervalId = setInterval(draw, 60000)

        return () => {
          ro.disconnect()
          if (intervalId) clearInterval(intervalId)
        }
      } catch (err) {
        console.warn('[FarmCanvas] Pixi init failed, using CSS fallback', err)
        setPixiFailed(true)
      }
    }

    const cleanupPromise = init()

    return () => {
      destroyed = true
      void cleanupPromise.then((cleanup) => cleanup?.())
      if (intervalId) clearInterval(intervalId)
      if (app) {
        try {
          app.destroy(true, { children: true })
        } catch {
          /* ignore */
        }
        app = null
      }
      if (ref.current) ref.current.innerHTML = ''
    }
  }, [pixiFailed])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl"
      style={{ background: getCurrentSky(), minHeight: 280 }}
    />
  )
}
