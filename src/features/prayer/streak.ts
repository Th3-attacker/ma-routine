import { PRAYERS, type Day } from '@/db/types'
import { addDays } from '@/lib/dates'

/** Journée complète : les 5 prières sont marquées, et aucune n'est « Manquée ». */
export function dayComplete(day: Pick<Day, 'prayers'> | undefined): boolean {
  return !!day && PRAYERS.every((p) => day.prayers[p] && day.prayers[p] !== 'missed')
}

/**
 * Série de jours sans prière manquée, jusqu'à aujourd'hui. Si aujourd'hui n'est pas encore complet,
 * la série part d'hier (la journée est encore en cours).
 */
export function prayerStreak(todayKey: string, getDay: (key: string) => Pick<Day, 'prayers'> | undefined): number {
  let key = dayComplete(getDay(todayKey)) ? todayKey : addDays(todayKey, -1)
  let n = 0
  while (n < 400 && dayComplete(getDay(key))) {
    n++
    key = addDays(key, -1)
  }
  return n
}
