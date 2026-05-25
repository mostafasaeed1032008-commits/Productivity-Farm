import { ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react'
import type { useWeekNav } from '@/hooks/useWeekNav'

type WeekNav = ReturnType<typeof useWeekNav>

interface Props extends WeekNav {}

export function WeekNavigator({
  weekLabel,
  pinned,
  pickerWeek,
  pickerYear,
  setPickerWeek,
  setPickerYear,
  goNext,
  goPrev,
  goToToday,
  togglePin,
  applyPicker,
  isCurrentWeek,
}: Props) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 p-3">
      <button type="button" onClick={goPrev} disabled={pinned} className="rounded-lg bg-white/10 p-2 disabled:opacity-40">
        <ChevronRight size={18} />
      </button>
      <span className="flex-1 text-center text-sm font-medium">{weekLabel}</span>
      <button type="button" onClick={goNext} disabled={pinned} className="rounded-lg bg-white/10 p-2 disabled:opacity-40">
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={togglePin} className="rounded-lg bg-white/10 p-2" title={pinned ? 'إلغاء التثبيت' : 'تثبيت'}>
        {pinned ? <PinOff size={16} /> : <Pin size={16} />}
      </button>
      {!isCurrentWeek && (
        <button type="button" onClick={goToToday} className="text-xs text-accent underline">
          اليوم
        </button>
      )}
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <select
          value={pickerWeek}
          onChange={(e) => setPickerWeek(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm"
        >
          {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              أسبوع {w}
            </option>
          ))}
        </select>
        <select
          value={pickerYear}
          onChange={(e) => setPickerYear(Number(e.target.value))}
          className="rounded-lg bg-white/10 px-2 py-1 text-sm"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button type="button" onClick={applyPicker} className="rounded-lg bg-accent px-3 py-1 text-sm">
          انتقل
        </button>
      </div>
    </div>
  )
}
