import { daysBetween, parseKey } from '@/lib/dates'

import { RAMADAN_VERSES, VERSES, type DailyText } from './verses'

/** Verset ou hadith du jour, choisi selon le jour de l'année. Pendant Ramadan, un jour sur trois vient de la liste Ramadan. */
export function verseOfDay(key: string, ramadan: boolean): DailyText {
  const { y } = parseKey(key)
  const doy = daysBetween(`${y}-01-01`, key)
  if (ramadan && doy % 3 === 0) return RAMADAN_VERSES[(doy / 3) % RAMADAN_VERSES.length]
  return VERSES[(doy + y) % VERSES.length]
}
