import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'

import { resolvePlace } from './cities'
import { prayerTimesFor } from './times'
import { currentPrayer, nextPrayer, nightThirds, prayerWindow, skyPeriod } from './window'

const NKC = resolvePlace({ cityId: 'nkc', custom: null })
const calc = { method: 'mwl', asrSchool: 'standard', tune: DEFAULT_SETTINGS.tune } as const
const y = prayerTimesFor('2026-10-22', NKC, calc)
const t = prayerTimesFor('2026-10-23', NKC, calc)
const tm = prayerTimesFor('2026-10-24', NKC, calc)
// Nouakchott est en UTC+0 : l'heure locale est l'heure UTC.
const at = (hhmm: string, day = '2026-10-23') => new Date(`${day}T${hhmm}:00Z`)
const w = (d: Date) => prayerWindow(d, y, t, tm)

describe('fenêtre de la prière en cours', () => {
  it('Fajr se termine au lever du soleil', () => {
    const r = w(at('06:00'))
    expect(r.kind).toBe('fajr')
    if (r.kind !== 'fajr') return
    expect(r.endKind).toBe('sunrise')
    expect(r.end).toEqual(t.sunrise)
    expect(r.frac).toBeGreaterThan(0)
    expect(r.frac).toBeLessThan(1)
  })

  it('affiche le temps du Duha entre le lever du soleil et Dhohr', () => {
    expect(w(at('09:00')).kind).toBe('duha')
  })

  it('Dhohr, Asr et Maghrib se terminent à la prière suivante', () => {
    expect(w(at('13:00'))).toMatchObject({ kind: 'dhuhr', endKind: 'asr' })
    expect(w(at('17:00'))).toMatchObject({ kind: 'asr', endKind: 'maghrib' })
    expect(w(at('19:00'))).toMatchObject({ kind: 'maghrib', endKind: 'isha' })
  })

  it('Icha dure jusqu’à la fin du premier tiers de la nuit (Maghrib → Fajr du lendemain)', () => {
    const r = w(at('20:30'))
    expect(r).toMatchObject({ kind: 'isha', endKind: 'third' })
    const third = nightThirds(t.maghrib, tm.fajr).firstThirdEnd
    if (r.kind === 'isha') expect(r.end).toEqual(third)
  })

  it('après le premier tiers : « Nuit », puis le dernier tiers', () => {
    expect(w(at('23:30')).kind).toBe('night')
    // Le 24 à 3 h 30, la veille est le 23 : on passe les horaires du 23, du 24 et du 25.
    const after = prayerWindow(at('03:30', '2026-10-24'), t, tm, prayerTimesFor('2026-10-25', NKC, calc))
    expect(after.kind).toBe('last')
  })

  it('avant Fajr, Icha de la veille peut encore être en cours', () => {
    // Juste après minuit, le premier tiers de la nuit (≈ 22 h 20) est passé : c'est la nuit.
    expect(w(at('00:30')).kind).toBe('night')
    expect(w(at('04:30')).kind).toBe('last')
  })

  it('devient « low » quand il reste moins de 20 minutes', () => {
    const r = w(new Date(t.sunrise.getTime() - 10 * 60_000))
    expect(r).toMatchObject({ kind: 'fajr', low: true })
    expect(w(at('05:50'))).toMatchObject({ kind: 'fajr', low: false })
  })
})

describe('prochaine prière et ciel', () => {
  it('donne la prochaine prière, et Fajr du lendemain après Icha', () => {
    expect(nextPrayer(at('12:00'), t, tm)).toMatchObject({ prayer: 'dhuhr', tomorrow: false })
    expect(nextPrayer(at('21:00'), t, tm)).toMatchObject({ prayer: 'fajr', tomorrow: true, at: tm.fajr })
  })

  it('donne la prière en cours', () => {
    expect(currentPrayer(at('04:00'), t)).toBeNull()
    expect(currentPrayer(at('17:00'), t)).toBe('asr')
  })

  it('choisit la couleur du ciel', () => {
    expect(skyPeriod(at('04:00'), t)).toBe('night')
    expect(skyPeriod(at('06:30'), t)).toBe('dawn')
    expect(skyPeriod(at('12:00'), t)).toBe('day')
    expect(skyPeriod(at('18:30'), t)).toBe('dusk')
    expect(skyPeriod(at('21:00'), t)).toBe('night')
  })
})
