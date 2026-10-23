import { weekday } from '@/lib/dates'

import { hijriDate } from './hijri'

export type FastReason = 'ramadan' | 'arafa' | 'tasua' | 'ashura' | 'white' | 'mon' | 'thu'

export type FastInfo = { forbidden: boolean; reasons: FastReason[] }

/**
 * Jeûnes du jour : Ramadan, ‘Arafa, Tâsû‘a, ‘Âchoura, jours blancs (13–15), lundi, jeudi.
 * Jeûne interdit le jour de l'Aïd al-Fitr et du 10 au 13 Dhou al-hijja.
 */
export function fastInfo(key: string, hijriAdj = 0): FastInfo {
  const h = hijriDate(key, hijriAdj)
  const reasons: FastReason[] = []
  if (h) {
    if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return { forbidden: true, reasons: [] }
    if (h.m === 9) reasons.push('ramadan')
    if (h.m === 12 && h.d === 9) reasons.push('arafa')
    if (h.m === 1 && h.d === 9) reasons.push('tasua')
    if (h.m === 1 && h.d === 10) reasons.push('ashura')
    if (h.m !== 9 && h.d >= 13 && h.d <= 15) reasons.push('white')
  }
  const w = weekday(key)
  if (w === 1) reasons.push('mon')
  if (w === 4) reasons.push('thu')
  return { forbidden: false, reasons }
}

/** Jours où le jeûne est conseillé (Ramadan exclu : il a sa propre carte). */
export function isSunnaFast(info: FastInfo): boolean {
  return !info.forbidden && info.reasons.length > 0 && !info.reasons.includes('ramadan')
}
