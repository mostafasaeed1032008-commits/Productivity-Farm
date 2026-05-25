import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const src = path.join(root, 'src')

function read(rel) {
  return fs.readFileSync(path.join(src, rel), 'utf8')
}

function write(rel, content) {
  fs.writeFileSync(path.join(src, rel), content, 'utf8')
}

function componentNameFromPath(rel) {
  return path.basename(rel, '.tsx')
}

function stripAndRename(code, componentName) {
  const propsName = `${componentName}Props`
  return code
    .split('\n')
    .filter((line) => !/^\s*import\s/.test(line))
    .join('\n')
    .replace(/\binterface Props\b/g, `interface ${propsName}`)
    .replace(/\(\{\s*([^}]+)\s*\}:\s*Props\)/g, `({ $1 }: ${propsName})`)
    .replace(/\bexport function /g, 'function ')
    .replace(/\bexport type /g, 'type ')
    .replace(/\bexport const /g, 'const ')
}

function bundlePage({ outFile, title, route, sharedImports, parts, mainCode, exportName, extraExports = [] }) {
  const body = parts
    .map((p) => {
      const name = componentNameFromPath(p)
      return `// ── ${name} ──\n${stripAndRename(read(p), name)}`
    })
    .join('\n\n')

  const extra = extraExports.length
    ? `\nexport { ${extraExports.join(', ')} }\n`
    : ''

  const content = `/**
 * ${title}
 * ملف الصفحة المنفصل — المشروع متكامل (store + router + layout + hooks مشتركة)
 * @route ${route}
 */

${sharedImports}

// ═══════════════════════════════════════════════════════════════
// مكوّنات الصفحة
// ═══════════════════════════════════════════════════════════════

${body}

// ═══════════════════════════════════════════════════════════════
// الصفحة الرئيسية
// ═══════════════════════════════════════════════════════════════

${mainCode}
${extra}`

  write(`pages/${outFile}`, content.replace(/\n\n\n+/g, '\n\n'))
  console.log('✓', outFile)
}

const indexMain = `export function IndexPage() {
  const weekNav = useWeekNav()
  const [clock, setClock] = useState(formatTimeAr(new Date()))
  const tickGame = useFocusStore((s) => s.tickGame)

  useEffect(() => {
    const t = setInterval(() => setClock(formatTimeAr(new Date())), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    tickGame()
    const m = setInterval(() => tickGame(), 60000)
    return () => clearInterval(m)
  }, [tickGame])

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-accent">Focus Matrix</h1>
          <p className="text-sm text-white/60">مصفوفة آيزنهاور والإنتاجية</p>
        </div>
        <span className="font-mono-num text-lg text-gold">{clock}</span>
      </header>
      <StatsBar weekKey={weekNav.currentWeek} />
      <WeekNavigator {...weekNav} />
      <WeeklyDayStrip weekKey={weekNav.currentWeek} />
      <div className="grid gap-3 md:grid-cols-2">
        <QuoteCard />
        <InsightsCard />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AttendancePanel />
        <ProductivityPanel />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold">المصفوفة</h2>
        <MatrixGrid weekKey={weekNav.currentWeek} />
      </section>
    </div>
  )
}

export { IndexPage as DashboardPage }`

const tasksMain = `export function TasksPage() {
  const weekNav = useWeekNav()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const tasks = useFocusStore((s) => s.tasks).filter((t) => t.weekKey === weekNav.currentWeek)

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 pb-12">
      <h1 className="text-2xl font-bold text-green">مدير المهام</h1>
      <WeekNavigator {...weekNav} />
      <WeekStatsRow weekKey={weekNav.currentWeek} />
      <QuickAddForm weekKey={weekNav.currentWeek} />
      <FilterBar value={filter} onChange={setFilter} />
      <TaskColumns tasks={tasks} filter={filter} />
    </div>
  )
}`

const farmMain = `const TABS = [
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
            className={\`rounded-full px-4 py-2 text-sm \${
              tab === t.id ? 'bg-green text-white' : 'bg-white/10'
            }\`}
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
}`

// Fix WeekNavigator to export in index bundle
let weekNavCode = stripAndRename(read('components/dashboard/WeekNavigator.tsx'), 'WeekNavigator')
weekNavCode = weekNavCode.replace('function WeekNavigator', 'export function WeekNavigator')

bundlePage({
  outFile: 'IndexPage.tsx',
  title: 'INDEX PAGE — لوحة التركيز',
  route: '/',
  sharedImports: `import { useEffect, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useFocusStore } from '@/store/useFocusStore'
import { useWeekNav } from '@/hooks/useWeekNav'
import { useSound } from '@/hooks/useSound'
import { QUADRANTS, QUADRANT_MAP } from '@/constants/quadrants'
import type { QuadrantDef } from '@/constants/quadrants'
import { SESSION_OPTIONS } from '@/constants/sessions'
import { pickRandom, MESSAGES } from '@/constants/messages'
import { formatTimeAr, todayKey, toLocalDateString } from '@/utils/dateUtils'
import { getDayKeysForWeek } from '@/utils/weekUtils'
import { getTotalProductivityHours } from '@/utils/mathUtils'
import type { Quadrant, Task, TaskStatus } from '@/store/types'
import type { useWeekNav as WeekNavHook } from '@/hooks/useWeekNav'`,
  parts: [
    'components/dashboard/StatsBar.tsx',
    'components/dashboard/WeeklyDayStrip.tsx',
    'components/dashboard/QuoteCard.tsx',
    'components/dashboard/InsightsCard.tsx',
    'components/dashboard/AttendancePanel.tsx',
    'components/dashboard/ProductivityPanel.tsx',
    'components/dashboard/TaskCard.tsx',
    'components/dashboard/AddTaskForm.tsx',
    'components/dashboard/QuadrantCard.tsx',
    'components/dashboard/MatrixGrid.tsx',
  ],
  mainCode: weekNavCode + '\n\n' + indexMain,
  exportName: 'IndexPage',
})

// Prepend WeekNavigator to IndexPage - actually it's in mainCode now. Need to fix IndexPage - WeekNavigator is in mainCode but other parts need it. Order: weekNav first in file

let indexContent = read('pages/IndexPage.tsx')
// WeekNavigator is in mainCode at end - move components before weeknav
// Actually structure is: imports, parts (no weeknav), weeknav+main at end. Good.

bundlePage({
  outFile: 'TasksPage.tsx',
  title: 'TASKS PAGE — مدير المهام',
  route: '/tasks',
  sharedImports: `import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useFocusStore } from '@/store/useFocusStore'
import { useWeekNav } from '@/hooks/useWeekNav'
import { useSound } from '@/hooks/useSound'
import { QUADRANTS, QUADRANT_MAP } from '@/constants/quadrants'
import type { QuadrantDef } from '@/constants/quadrants'
import { pickRandom, MESSAGES } from '@/constants/messages'
import type { Quadrant, Task, TaskStatus } from '@/store/types'
import { WeekNavigator } from '@/pages/IndexPage'`,
  parts: [
    'components/tasks/WeekStatsRow.tsx',
    'components/tasks/FilterBar.tsx',
    'components/tasks/QuickAddForm.tsx',
    'components/tasks/TaskItem.tsx',
    'components/tasks/TaskColumn.tsx',
    'components/tasks/TaskColumns.tsx',
  ],
  mainCode: tasksMain,
  exportName: 'TasksPage',
})

bundlePage({
  outFile: 'FarmPage.tsx',
  title: 'FARM PAGE — المزرعة',
  route: '/farm',
  sharedImports: `import { useEffect, useRef, useState } from 'react'
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
import type { Plot } from '@/store/types'`,
  parts: [
    'components/farm/GrowthBar.tsx',
    'components/farm/PlotTile.tsx',
    'components/farm/PlotGrid.tsx',
    'components/farm/FarmCanvas.tsx',
    'components/farm/WeatherOverlay.tsx',
    'components/farm/FarmerRow.tsx',
    'components/farm/ExpandButton.tsx',
    'components/farm/ShopPanel.tsx',
    'components/farm/AnimalZones.tsx',
    'components/farm/GreenhousePanel.tsx',
    'components/farm/RivalsPanel.tsx',
    'components/modals/PlantModal.tsx',
    'components/modals/HarvestModal.tsx',
  ],
  mainCode: farmMain,
  exportName: 'FarmPage',
})

write(
  'pages/DashboardPage.tsx',
  `/** توجيه — الصفحة الرئيسية في IndexPage.tsx */\nexport { IndexPage, IndexPage as DashboardPage, WeekNavigator } from './IndexPage'\n`,
)

// Update router
let router = read('router.tsx')
router = router.replace('DashboardPage', 'IndexPage')
write('router.tsx', router)

console.log('Done')
