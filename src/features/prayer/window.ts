import { PRAYERS, type Prayer } from '@/db/types'

import type { DayTimes } from './times'

const MIN = 60_000

/** Sous ce seuil, la barre du temps restant devient dorée (orange sur l'écran Prière). */
export const LOW_LEFT_MS = 20 * MIN

export type WindowEnd = 'sunrise' | 'asr' | 'maghrib' | 'isha' | 'third'

export type PrayerWindow =
  | {
      kind: Prayer
      start: Date
      end: Date
      endKind: WindowEnd
      leftMs: number
      /** Part écoulée, de 0 à 1. */
      frac: number
      low: boolean
    }
  /** Entre le lever du soleil et Dhohr. */
  | { kind: 'duha'; leftMs: number }
  /** Après le premier tiers de la nuit, avant le dernier. */
  | { kind: 'night'; leftMs: number }
  /** Dernier tiers de la nuit : moment du qiyâm. */
  | { kind: 'last'; leftMs: number }

/** Premier et dernier tiers d'une nuit, entre Maghrib et le Fajr suivant. */
export function nightThirds(maghrib: Date, nextFajr: Date): { firstThirdEnd: Date; lastThirdStart: Date } {
  const len = nextFajr.getTime() - maghrib.getTime()
  return {
    firstThirdEnd: new Date(maghrib.getTime() + len / 3),
    lastThirdStart: new Date(nextFajr.getTime() - len / 3),
  }
}

function win(kind: Prayer, start: Date, end: Date, endKind: WindowEnd, now: Date): PrayerWindow {
  const leftMs = end.getTime() - now.getTime()
  const frac = Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())))
  return { kind, start, end, endKind, leftMs, frac, low: leftMs < LOW_LEFT_MS }
}

/**
 * Prière en cours et temps restant. Il faut les horaires de la veille, du jour et du lendemain (dans le fuseau
 * de la ville) : Icha se prolonge jusqu'à la fin du premier tiers de la nuit, calculé entre Maghrib et Fajr.
 */
export function prayerWindow(now: Date, yesterday: DayTimes, today: DayTimes, tomorrow: DayTimes): PrayerWindow {
  const t = now.getTime()
  if (t < today.fajr.getTime()) {
    const n = nightThirds(yesterday.maghrib, today.fajr)
    if (t < n.firstThirdEnd.getTime()) return win('isha', yesterday.isha, n.firstThirdEnd, 'third', now)
    const leftMs = today.fajr.getTime() - t
    return { kind: t >= n.lastThirdStart.getTime() ? 'last' : 'night', leftMs }
  }
  if (t < today.sunrise.getTime()) return win('fajr', today.fajr, today.sunrise, 'sunrise', now)
  if (t < today.dhuhr.getTime()) return { kind: 'duha', leftMs: today.dhuhr.getTime() - t }
  if (t < today.asr.getTime()) return win('dhuhr', today.dhuhr, today.asr, 'asr', now)
  if (t < today.maghrib.getTime()) return win('asr', today.asr, today.maghrib, 'maghrib', now)
  if (t < today.isha.getTime()) return win('maghrib', today.maghrib, today.isha, 'isha', now)
  const n = nightThirds(today.maghrib, tomorrow.fajr)
  if (t < n.firstThirdEnd.getTime()) return win('isha', today.isha, n.firstThirdEnd, 'third', now)
  return { kind: t >= n.lastThirdStart.getTime() ? 'last' : 'night', leftMs: tomorrow.fajr.getTime() - t }
}

export type NextPrayer = { prayer: Prayer; at: Date; tomorrow: boolean; leftMs: number }

/** Prochaine des 5 prières (Fajr du lendemain après Icha). */
export function nextPrayer(now: Date, today: DayTimes, tomorrow: DayTimes): NextPrayer {
  for (const p of PRAYERS) {
    if (today[p].getTime() > now.getTime()) {
      return { prayer: p, at: today[p], tomorrow: false, leftMs: today[p].getTime() - now.getTime() }
    }
  }
  return { prayer: 'fajr', at: tomorrow.fajr, tomorrow: true, leftMs: tomorrow.fajr.getTime() - now.getTime() }
}

/** Dernière prière dont l'heure est passée aujourd'hui (null avant Fajr). */
export function currentPrayer(now: Date, today: DayTimes): Prayer | null {
  let cur: Prayer | null = null
  for (const p of PRAYERS) if (today[p].getTime() <= now.getTime()) cur = p
  return cur
}

export type SkyPeriod = 'night' | 'dawn' | 'day' | 'dusk'

/** Couleur du ciel de l'accueil selon l'heure (règles de la maquette). */
export function skyPeriod(now: Date, today: DayTimes): SkyPeriod {
  const t = now.getTime()
  if (t < today.fajr.getTime() || t >= today.isha.getTime() + 45 * MIN) return 'night'
  if (t < today.sunrise.getTime() + 30 * MIN) return 'dawn'
  if (t < today.maghrib.getTime() - 45 * MIN) return 'day'
  return 'dusk'
}
