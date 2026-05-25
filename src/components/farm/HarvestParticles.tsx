import { useEffect, useRef } from 'react'
import Matter from 'matter-js'

interface Props {
  emoji: string
  active: boolean
  onDone: () => void
}

export function HarvestParticles({ emoji, active, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const w = 120
    const h = 120
    canvas.width = w
    canvas.height = h

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } })
    const render = Matter.Render.create({
      canvas,
      engine,
      options: { width: w, height: h, background: 'transparent', wireframes: false },
    })

    const bodies = Array.from({ length: 12 }, (_, i) => {
      const b = Matter.Bodies.circle(20 + (i % 4) * 25, h - 10, 8, {
        restitution: 0.6,
        render: { fillStyle: '#ffd54f' },
      })
      Matter.Body.setVelocity(b, {
        x: (Math.random() - 0.5) * 8,
        y: -8 - Math.random() * 6,
      })
      return b
    })
    Matter.Composite.add(engine.world, bodies)
    Matter.Render.run(render)
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)

    const ctx = canvas.getContext('2d')
    let frame = 0
    const drawEmoji = () => {
      if (!ctx) return
      Matter.Render.world(render)
      bodies.forEach((b, i) => {
        ctx.font = '14px serif'
        ctx.textAlign = 'center'
        ctx.fillText(i % 2 === 0 ? emoji : '🪙', b.position.x, b.position.y)
      })
      frame++
      if (frame < 90) requestAnimationFrame(drawEmoji)
    }
    drawEmoji()

    const t = setTimeout(() => {
      Matter.Render.stop(render)
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
      onDone()
    }, 1500)

    return () => clearTimeout(t)
  }, [active, emoji, onDone])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-20"
      style={{ width: 120, height: 120 }}
    />
  )
}
