import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from '@/db/settings'

import { markAdhan, nextAdhan } from './adhan'
import { resolvePlace } from './cities'
import { prayerTimesFor } from './times'

const place = resolvePlace({ cityId: 'nkc', custom: null })
const day = prayerTimesFor('2026-10-23', place, DEFAULT_SETTINGS)
const next = prayerTimesFor('2026-10-24', place, DEFAULT_SETTINGS)

describe('adhan à l’heure de la prière', () => {
  beforeEach(() => localStorage.clear())

  it('prochaine prière : Chourouq exclu, Fajr du lendemain après Icha', () => {
    expect(nextAdhan(new Date(day.sunrise.getTime() - 60_000), day, next).prayer).toBe('dhuhr')
    expect(nextAdhan(new Date(day.asr.getTime() - 1000), day, next)).toEqual({ prayer: 'asr', at: day.asr })
    expect(nextAdhan(new Date(day.isha.getTime() + 1000), day, next)).toEqual({ prayer: 'fajr', at: next.fajr })
  })

  it('une seule fois par prière et par jour', () => {
    expect(markAdhan('2026-10-23', 'asr')).toBe(true)
    expect(markAdhan('2026-10-23', 'asr')).toBe(false)
    expect(markAdhan('2026-10-23', 'maghrib')).toBe(true)
    expect(markAdhan('2026-10-24', 'asr')).toBe(true)
  })
})
