import { PRAYERS, type Day } from '@/db/types'

/** Bilan d'un mois : prières marquées, à l'heure (ou en jamâ‘a), et en jamâ‘a. */
export function monthPrayerStats(days: readonly Pick<Day, 'prayers'>[]): {
  marked: number
  onTimePct: number
  jamaa: number
} {
  let marked = 0
  let good = 0
  let jamaa = 0
  for (const d of days) {
    for (const p of PRAYERS) {
      const s = d.prayers[p]
      if (!s) continue
      marked++
      if (s === 'ontime' || s === 'jamaa') good++
      if (s === 'jamaa') jamaa++
    }
  }
  return { marked, onTimePct: marked ? Math.round((good / marked) * 100) : 0, jamaa }
}
