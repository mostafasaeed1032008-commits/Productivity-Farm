import { useCallback, useMemo, useState } from 'react'
import { getWeekKey } from '@/utils/dateUtils'
import {
  getISOWeekNumber,
  getISOWeekYear,
  getMondayFromWeek,
  weekKeyToLabel,
  getWeekRange,
} from '@/utils/weekUtils'

export function useWeekNav() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [pickerWeek, setPickerWeek] = useState(() => getISOWeekNumber(new Date()))
  const [pickerYear, setPickerYear] = useState(() => getISOWeekYear(new Date()))

  const currentWeek = useMemo(() => getWeekKey(weekOffset), [weekOffset])
  const weekLabel = useMemo(() => weekKeyToLabel(currentWeek), [currentWeek])
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek])

  const goNext = useCallback(() => {
    if (!pinned) setWeekOffset((o) => o + 1)
  }, [pinned])

  const goPrev = useCallback(() => {
    if (!pinned) setWeekOffset((o) => o - 1)
  }, [pinned])

  const goToToday = useCallback(() => setWeekOffset(0), [])

  const goToWeek = useCallback((week: number, year: number) => {
    const monday = getMondayFromWeek(year, week)
    const todayMonday = getWeekKey(0)
    const t = monday.getTime()
    const base = new Date(
      parseInt(todayMonday.slice(0, 4), 10),
      parseInt(todayMonday.slice(5, 7), 10) - 1,
      parseInt(todayMonday.slice(8, 10), 10),
    )
    const diffDays = Math.round((t - base.getTime()) / 86400000)
    setWeekOffset(Math.round(diffDays / 7))
  }, [])

  const togglePin = useCallback(() => setPinned((p) => !p), [])

  const applyPicker = useCallback(() => {
    goToWeek(pickerWeek, pickerYear)
  }, [goToWeek, pickerWeek, pickerYear])

  return {
    weekOffset,
    currentWeek,
    weekLabel,
    weekRange,
    pinned,
    pickerWeek,
    pickerYear,
    setPickerWeek,
    setPickerYear,
    goNext,
    goPrev,
    goToToday,
    goToWeek,
    togglePin,
    applyPicker,
    isCurrentWeek: weekOffset === 0,
  }
}
