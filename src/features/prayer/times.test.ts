import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'
import { formatTime } from '@/lib/dates'

import { resolvePlace } from './cities'
import { prayerTimesFor } from './times'

const NKC = resolvePlace({ cityId: 'nkc', custom: null })
const calc = { method: 'mwl', asrSchool: 'standard', tune: DEFAULT_SETTINGS.tune } as const

/** Écart en minutes entre « HH:MM » calculé et attendu. */
function diffMin(actual: string, expected: string): number {
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3))
  return Math.abs(toMin(actual) - toMin(expected))
}

describe('horaires de prière (adhan)', () => {
  it('correspond aux valeurs de référence de Nouakchott le 23 octobre 2026 (±2 min)', () => {
    const t = prayerTimesFor('2026-10-23', NKC, calc)
    const expected = { fajr: '05:47', sunrise: '07:00', dhuhr: '12:48', asr: '16:08', maghrib: '18:36', isha: '19:45' }
    for (const [k, v] of Object.entries(expected)) {
      const got = formatTime(t[k as keyof typeof t], NKC.timezone)
      expect(diffMin(got, v), `${k} : ${got} au lieu de ${v}`).toBeLessThanOrEqual(2)
    }
  })

  it('applique les ajustements en minutes', () => {
    const base = prayerTimesFor('2026-10-23', NKC, calc)
    const tuned = prayerTimesFor('2026-10-23', NKC, { ...calc, tune: { ...calc.tune, maghrib: 3 } })
    expect(tuned.maghrib.getTime() - base.maghrib.getTime()).toBe(3 * 60_000)
    expect(tuned.isha.getTime()).toBe(base.isha.getTime())
  })

  it('retarde l’Asr en école hanafite', () => {
    const std = prayerTimesFor('2026-10-23', NKC, calc)
    const han = prayerTimesFor('2026-10-23', NKC, { ...calc, asrSchool: 'hanafi' })
    expect(han.asr.getTime()).toBeGreaterThan(std.asr.getTime() + 30 * 60_000)
  })

  it('calcule toutes les méthodes, dans l’ordre des prières', () => {
    for (const method of ['mwl', 'uqa', 'egy', 'kar', 'isna', 'uoif'] as const) {
      const t = prayerTimesFor('2026-10-23', NKC, { ...calc, method })
      const order = [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha].map((d) => d.getTime())
      expect([...order].sort((a, b) => a - b)).toEqual(order)
    }
  })

  it('utilise le fuseau de la ville (Paris en heure d’été le 23 octobre)', () => {
    const paris = resolvePlace({ cityId: 'par', custom: null })
    const t = prayerTimesFor('2026-10-23', paris, calc)
    const dhuhr = formatTime(t.dhuhr, paris.timezone)
    expect(dhuhr >= '13:30' && dhuhr <= '13:50').toBe(true)
  })

  it('prend la position personnalisée quand elle est choisie', () => {
    const p = resolvePlace({ cityId: 'custom', custom: { lat: 1, lng: 2, timezone: 'Africa/Lagos' } })
    expect(p).toEqual({ cityId: 'custom', lat: 1, lng: 2, timezone: 'Africa/Lagos' })
    expect(resolvePlace({ cityId: 'custom', custom: null }).cityId).toBe('nkc')
    expect(resolvePlace({ cityId: 'inconnue', custom: null }).cityId).toBe('nkc')
  })
})
