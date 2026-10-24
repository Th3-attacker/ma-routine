import { hijriDate } from '@/features/calendar/hijri'
import type { DayTimes } from '@/features/prayer/times'
import { addDays } from '@/lib/dates'

/** Jour de Ramadan (1 à 30), en vrai ou en aperçu ; null en dehors de Ramadan. */
export function ramadanDay(key: string, hijriAdj: number, preview: boolean): { day: number; preview: boolean } | null {
  const h = hijriDate(key, hijriAdj)
  if (h?.m === 9) return { day: h.d, preview: false }
  if (preview) return { day: h ? Math.min(30, Math.max(1, h.d)) : 1, preview: true }
  return null
}

/** Jours avant le 1er Ramadan (Umm al-Qura + décalage), ou null au-delà de 400 jours. */
export function daysToRamadan(key: string, hijriAdj: number): number | null {
  for (let i = 1; i <= 400; i++) {
    const h = hijriDate(addDays(key, i), hijriAdj)
    if (!h) return null
    if (h.m === 9 && h.d === 1) return i
  }
  return null
}

export type RamadanCountdown =
  | { kind: 'suhur'; at: Date; leftMs: number }
  | { kind: 'iftar'; at: Date; leftMs: number }
  | { kind: 'tomorrowSuhur'; at: Date }

/** Avant Fajr : fin du suhûr ; avant Maghrib : iftar ; ensuite : suhûr du lendemain. */
export function ramadanCountdown(now: Date, today: DayTimes, tomorrow: DayTimes): RamadanCountdown {
  const t = now.getTime()
  if (t < today.fajr.getTime()) return { kind: 'suhur', at: today.fajr, leftMs: today.fajr.getTime() - t }
  if (t < today.maghrib.getTime()) return { kind: 'iftar', at: today.maghrib, leftMs: today.maghrib.getTime() - t }
  return { kind: 'tomorrowSuhur', at: tomorrow.fajr }
}

/** Pages par jour pour finir le Coran avant l'Aïd : ceil(pages restantes ÷ (30 − jour + 1)). */
export function ramadanPagesPerDay(q: { page: number; total: number }, ramadanDayNumber: number): number {
  const total = Math.max(1, q.total)
  const left = total - (Math.min(Math.max(1, q.page), total) - 1)
  return Math.ceil(left / Math.max(1, 30 - ramadanDayNumber + 1))
}
