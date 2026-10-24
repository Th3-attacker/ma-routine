import type { AthkarSet, Day } from '@/db/types'
import type { DayTimes } from '@/features/prayer/times'

import { ATHKAR } from './data'

/** Nombre de dhikr terminés dans une série. */
export function athkarProgress(set: AthkarSet, day: Pick<Day, 'athkar'> | undefined): { done: number; total: number } {
  const items = ATHKAR[set].items
  const counts = day?.athkar[set] ?? {}
  return { done: items.filter((it, i) => (counts[i] ?? 0) >= it.n).length, total: items.length }
}

/** Série ouverte par défaut selon l'heure (règles de la maquette). */
export function defaultAthkarSet(now: Date, t: DayTimes): AthkarSet {
  const ms = now.getTime()
  if (ms >= t.fajr.getTime() && ms < t.dhuhr.getTime()) return 'matin'
  if (ms >= t.dhuhr.getTime() && ms < t.asr.getTime()) return 'salat'
  if (ms >= t.asr.getTime() && ms < t.isha.getTime() + 3_600_000) return 'soir'
  return 'nuit'
}
