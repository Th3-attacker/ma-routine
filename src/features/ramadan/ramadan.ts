import { hijriDate } from '@/features/calendar/hijri'

/** Jour de Ramadan (1 à 30), en vrai ou en aperçu ; null en dehors de Ramadan. */
export function ramadanDay(key: string, hijriAdj: number, preview: boolean): { day: number; preview: boolean } | null {
  const h = hijriDate(key, hijriAdj)
  if (h?.m === 9) return { day: h.d, preview: false }
  if (preview) return { day: h ? Math.min(30, Math.max(1, h.d)) : 1, preview: true }
  return null
}
