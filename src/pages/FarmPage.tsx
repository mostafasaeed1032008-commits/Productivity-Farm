/**
 * FARM PAGE — المزرعة
 * ملف الصفحة المنفصل — المشروع متكامل (store + router + layout + hooks مشتركة)
 * @route /farm
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useFocusStore } from '@/store/useFocusStore'
import { usePlotActions } from '@/hooks/usePlotActions'
import { useCoins } from '@/hooks/useCoins'
import { useSound } from '@/hooks/useSound'
import { todayKey } from '@/utils/dateUtils'
import { getTodayHours, expandCost } from '@/utils/mathUtils'
import { getCurrentSky, getCurrentWeather } from '@/engine/WeatherEngine'
import { CROP_MAP, SEEDS, TREES, GREENHOUSE_CROPS } from '@/constants/crops'
import { ANIMAL_MAP, ANIMALS } from '@/constants/animals'
import { FARMERS_CATALOG, FARMER_MAP } from '@/constants/farmers'
import { RIVALS } from '@/constants/rivals'
import { getRivalDef } from '@/engine/RivalEngine'
import { pickRandom, MESSAGES } from '@/constants/messages'
import type { Plot } from '@/store/types'

// ═══════════════════════════════════════════════════════════════
// مكوّنات الصفحة
// ═══════════════════════════════════════════════════════════════

// ── GrowthBar ──
interface GrowthBarProps {
  progress: number
}

function GrowthBar({ progress  }: GrowthBarProps) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full bg-green transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// ── PlotTile ──

interface PlotTileProps {
  plot: Plot
  onClick: () => void
}

function PlotTile({ plot, onClick  }: PlotTileProps) {
  const crop = plot.cropId ? CROP_MAP[plot.cropId] : null
  const isReady = plot.status === 'ready'
  const isEmpty = plot.status === 'empty'

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`relative flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center rounded-lg border-2 md:h-20 md:w-20 ${
        isEmpty
          ? 'border-dashed border-amber-800/60 bg-amber-950/40'
          : isReady
            ? 'plot-ready border-green bg-green/20 animate-pulse'
            : 'border-amber-700/50 bg-amber-900/30'
      }`}
    >
      {isEmpty && <span className="text-2xl opacity-40">🟫</span>}
      {crop && (
        <>
          <span className="text-2xl">{crop.emoji}</span>
          {plot.status === 'growing' && <GrowthBar progress={plot.progress} />}
        </>
      )}
      {isReady && <span className="text-[10px] text-success font-bold">حصاد!</span>}
    </motion.button>
  )
}

// ── PlotGrid ──

interface PlotGridProps {
  onPlotClick: (plotId: number, status: Plot['status']) => void
}

function PlotGrid({ onPlotClick  }: PlotGridProps) {
  const plots = useFocusStore((s) => s.farm?.plots ?? [])
  const cols = plots.length <= 12 ? 'grid-cols-4' : plots.length <= 24 ? 'grid-cols-6' : 'grid-cols-9'

  return (
    <div className={`relative z-10 grid ${cols} gap-2 justify-center p-4`}>
      {plots.map((plot) => (
        <PlotTile
          key={plot.id}
          plot={plot}
          onClick={() => onPlotClick(plot.id, plot.status)}
        />
      ))}
    </div>
  )
}

// ── FarmCanvas ──

/** Decorative Pixi background — lazy-loaded; falls back to CSS if WebGL fails */
function FarmCanvas() {
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

// ── WeatherOverlay ──

function WeatherOverlay() {
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

// ── FarmerRow ──

function FarmerRow() {
  const farmers = useFocusStore((s) => s.farm.farmers)
  if (farmers.length === 0) return null

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {farmers.map((f, i) => {
        const def = FARMER_MAP[f.farmerId]
        if (!def) return null
        return (
          <div key={`${f.farmerId}-${i}`} className="glass flex items-center gap-2 px-3 py-2 text-sm">
            <span className="text-xl">{def.emoji}</span>
            <span>{def.name}</span>
            <span className="text-xs text-white/50">×{def.speedMult}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── ExpandButton ──

function ExpandButton() {
  const plots = useFocusStore((s) => s.farm.plots)
  const coins = useFocusStore((s) => s.farm.coins)
  const expandLand = useFocusStore((s) => s.expandLand)
  const { play } = useSound()
  const cost = expandCost(plots.length)

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={coins < cost}
      onClick={() => {
        if (expandLand()) {
          play('expand')
          toast.success(pickRandom(MESSAGES.farmExpand))
        } else {
          play('error')
          toast.error('عملات غير كافية')
        }
      }}
      className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold disabled:opacity-40"
    >
      توسيع الأرض — {cost} 🪙
    </motion.button>
  )
}

// ── ShopPanel ──

function ShopPanel() {
  const coins = useFocusStore((s) => s.farm.coins)
  const hireFarmer = useFocusStore((s) => s.hireFarmer)
  const buyAnimal = useFocusStore((s) => s.buyAnimal)
  const { play } = useSound()

  return (
    <div className="space-y-4">
      <section>
        <h4 className="mb-2 font-bold text-green">🌱 بذور (للمزرعة)</h4>
        <p className="text-xs text-white/50 mb-2">اشتري من المتجر وازرع في القطع</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[...SEEDS.slice(0, 8)].map((c) => (
            <div key={c.id} className="glass p-2 text-center text-sm">
              {c.emoji} {c.name} — {c.buyPrice}🪙
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">🌳 أشجار</h4>
        <div className="grid grid-cols-2 gap-2">
          {TREES.map((c) => (
            <div key={c.id} className="glass p-2 text-sm">
              {c.emoji} {c.name} — {c.buyPrice}🪙
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">👨‍🌾 مزارعون</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {FARMERS_CATALOG.map((f) => (
            <motion.button
              key={f.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={coins < f.hireCost}
              onClick={() => {
                if (hireFarmer(f.id)) {
                  play('buy')
                  toast.success(`تم توظيف ${f.name}`)
                } else toast.error('تعذر التوظيف')
              }}
              className="glass flex items-center gap-2 p-3 text-sm disabled:opacity-40"
            >
              <span className="text-2xl">{f.emoji}</span>
              <div className="text-right">
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gold">{f.hireCost} 🪙 — سرعة ×{f.speedMult}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
      <section>
        <h4 className="mb-2 font-bold">🐄 حيوانات</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ANIMALS.map((a) => (
            <motion.button
              key={a.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={coins < a.buyPrice}
              onClick={() => {
                if (buyAnimal(a.id)) {
                  play('buy')
                  toast.success(`تم شراء ${a.name}`)
                } else toast.error('تعذر الشراء')
              }}
              className="glass p-2 text-sm disabled:opacity-40"
            >
              {a.emoji} {a.name} — {a.buyPrice}🪙 (+{a.coinsPerHour}/س)
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── AnimalZones ──

const ZONES = [
  { key: 'large' as const, label: 'المواشي', emoji: '🐄' },
  { key: 'poultry' as const, label: 'الدواجن', emoji: '🐔' },
  { key: 'aquatic' as const, label: 'المائية', emoji: '🐟' },
]

function AnimalZones() {
  const animals = useFocusStore((s) => s.farm.animals)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ZONES.map((z) => (
        <div key={z.key} className="glass p-4">
          <h4 className="mb-2 font-bold">
            {z.emoji} {z.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {animals[z.key].map((inst, i) => {
              const def = ANIMAL_MAP[inst.animalId]
              return (
                <span key={i} className="rounded-lg bg-white/10 px-2 py-1 text-sm">
                  {def?.emoji} {def?.name}
                </span>
              )
            })}
            {animals[z.key].length === 0 && (
              <span className="text-xs text-white/40">لا حيوانات بعد</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── GreenhousePanel ──

function GreenhousePanel() {
  const gh = useFocusStore((s) => s.farm.greenhouse)
  const coins = useFocusStore((s) => s.farm.coins)
  const unlock = useFocusStore((s) => s.unlockGreenhouse)
  const plantGh = useFocusStore((s) => s.plantGreenhouse)
  const harvestGh = useFocusStore((s) => s.harvestGreenhouse)

  if (!gh.unlocked) {
    return (
      <div className="glass p-6 text-center">
        <p className="mb-3">الصوبة مغلقة — افتحها بـ 500 🪙</p>
        <button
          type="button"
          disabled={coins < 500}
          onClick={() => unlock()}
          className="rounded-xl bg-green px-6 py-2 disabled:opacity-40"
        >
          فتح الصوبة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {gh.slots.map((slot, i) => {
          const crop = slot.cropId ? CROP_MAP[slot.cropId] : null
          return (
            <motion.div key={i} className="glass p-3 text-center">
              {slot.status === 'empty' ? (
                <select
                  className="w-full rounded bg-white/10 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) plantGh(i, e.target.value)
                  }}
                >
                  <option value="">زراعة...</option>
                  {GREENHOUSE_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.buyPrice})
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <div className="text-2xl">{crop?.emoji}</div>
                  {slot.status === 'growing' && <GrowthBar progress={slot.progress} />}
                  {slot.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => harvestGh(i)}
                      className="mt-1 text-xs text-success"
                    >
                      حصاد
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── RivalsPanel ──

function RivalsPanel() {
  const rivals = useFocusStore((s) => s.farm.rivals)
  const playerPlots = useFocusStore((s) => s.farm.plots.length)
  const alerted = useRef<Set<string>>(new Set())

  useEffect(() => {
    rivals.forEach((r) => {
      const def = getRivalDef(r.id)
      if (!def) return
      if (Math.floor(r.plots) > playerPlots && !alerted.current.has(r.id)) {
        alerted.current.add(r.id)
        toast(MESSAGES.rivalAlert(def.name), { icon: '⚠️' })
      }
    })
  }, [rivals, playerPlots])

  const sorted = [...rivals].sort((a, b) => b.plots - a.plots)

  return (
    <div className="space-y-2">
      {sorted.map((r) => {
        const def = RIVALS.find((x) => x.id === r.id)!
        return (
          <div
            key={r.id}
            className="glass flex items-center gap-3 p-3"
            style={{ borderRight: `4px solid ${def.color}` }}
          >
            <span className="text-3xl">{def.emoji}</span>
            <div className="flex-1">
              <div className="font-bold">{def.name}</div>
              <div className="text-xs text-white/60">
                قطع: {r.plots.toFixed(1)} — عملات: {r.coins}
              </div>
            </div>
            {Math.floor(r.plots) > playerPlots && (
              <span className="text-xs text-danger">متقدم!</span>
            )}
          </div>
        )
      })}
      <p className="text-center text-sm text-white/50">
        قطعك: {playerPlots}
      </p>
    </div>
  )
}

// ── PlantModal ──

interface PlantModalProps {
  open: boolean
  onClose: () => void
  onSelect: (cropId: string) => void
}

function PlantModal({ open, onClose, onSelect  }: PlantModalProps) {
  const coins = useFocusStore((s) => s.farm.coins)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass max-h-[80vh] w-full max-w-lg overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold">اختر محصولاً للزراعة</h3>
            <p className="mb-3 text-sm text-gold">🪙 {coins} عملة</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SEEDS.map((crop) => (
                <motion.button
                  key={crop.id}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={coins < crop.buyPrice}
                  onClick={() => onSelect(crop.id)}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-center disabled:opacity-40"
                >
                  <div className="text-2xl">{crop.emoji}</div>
                  <div className="text-sm font-medium">{crop.name}</div>
                  <div className="text-xs text-gold">{crop.buyPrice} 🪙</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── HarvestModal ──

interface HarvestModalProps {
  reward: number | null
  onClose: () => void
}

function HarvestModal({ reward, onClose  }: HarvestModalProps) {
  return (
    <AnimatePresence>
      {reward !== null && reward > 0 && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-2">🌾</div>
            <h3 className="text-xl font-bold text-success">حصاد ناجح!</h3>
            <p className="mt-2 text-gold font-mono-num text-2xl">+{reward} 🪙</p>
            <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-accent px-6 py-2">
              رائع!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { id: 'farm', label: 'المزرعة' },
  { id: 'shop', label: 'المتجر' },
  { id: 'animals', label: 'الحيوانات' },
  { id: 'greenhouse', label: 'الصوبة' },
  { id: 'rivals', label: 'المنافسون' },
] as const

type TabId = (typeof TABS)[number]['id']

export function FarmPage() {
  const [tab, setTab] = useState<TabId>('farm')
  const { coins, dailyRate, totalHours } = useCoins()
  const productivity = useFocusStore((s) => s.productivity)
  const plots = useFocusStore((s) => s.farm?.plots ?? [])
  const {
    plantModalPlot,
    harvestReward,
    setHarvestReward,
    openPlant,
    closePlant,
    doPlant,
    doHarvest,
  } = usePlotActions()

  const handlePlotClick = (plotId: number, status: Plot['status']) => {
    if (status === 'empty') openPlant(plotId)
    else if (status === 'ready') doHarvest(plotId)
  }

  const todayH = getTodayHours(productivity, todayKey())

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 pb-12">
      <header className="glass p-4">
        <h1 className="text-2xl font-bold text-green">🌾 المزرعة</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <span className="text-gold font-mono-num">🪙 {coins}</span>
          <span>معدل يومي: ~{dailyRate}/س</span>
        </div>
      </header>
      <div className="glass grid grid-cols-2 gap-2 p-3 text-sm sm:grid-cols-4">
        <span>إجمالي الساعات: {totalHours.toFixed(1)}</span>
        <span>اليوم: {todayH.toFixed(1)}س</span>
        <span>القطع: {plots.length}</span>
        <span className="text-gold">عملات: {coins}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === t.id ? 'bg-green text-white' : 'bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'farm' && (
        <>
          <FarmerRow />
          <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-green/30 bg-farm-bg">
            <FarmCanvas />
            <WeatherOverlay />
            <div className="relative z-10 flex min-h-[360px] items-center justify-center py-6">
              <PlotGrid onPlotClick={handlePlotClick} />
            </div>
          </div>
          <div className="flex justify-center">
            <ExpandButton />
          </div>
        </>
      )}
      {tab === 'shop' && <ShopPanel />}
      {tab === 'animals' && <AnimalZones />}
      {tab === 'greenhouse' && <GreenhousePanel />}
      {tab === 'rivals' && <RivalsPanel />}
      <PlantModal open={plantModalPlot !== null} onClose={closePlant} onSelect={doPlant} />
      <HarvestModal reward={harvestReward} onClose={() => setHarvestReward(null)} />
    </div>
  )
}
