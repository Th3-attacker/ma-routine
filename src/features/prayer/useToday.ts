import { useEffect, useMemo, useState } from 'react'

import type { Settings } from '@/db/types'
import { addDays, dayKey } from '@/lib/dates'

import { resolvePlace } from './cities'
import { prayerTimesFor } from './times'

export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, intervalMs)
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return now
}

/** Le jour en cours dans le fuseau de la ville, et les horaires de la veille, du jour et du lendemain. */
export function useToday(settings: Settings, now: Date) {
  const place = useMemo(() => resolvePlace(settings), [settings])
  const key = dayKey(now, place.timezone)
  const { method, asrSchool, tune } = settings
  const times = useMemo(() => {
    const calc = { method, asrSchool, tune }
    return {
      yesterday: prayerTimesFor(addDays(key, -1), place, calc),
      today: prayerTimesFor(key, place, calc),
      tomorrow: prayerTimesFor(addDays(key, 1), place, calc),
    }
  }, [key, place, method, asrSchool, tune])
  return { place, key, ...times }
}
