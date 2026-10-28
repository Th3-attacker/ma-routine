import { describe, expect, it } from 'vitest'

import { emptyDay } from '@/db/days'
import { ATHKAR } from '@/features/athkar/data'
import { athkarProgress, defaultAthkarSet } from '@/features/athkar/progress'
import { resolvePlace } from '@/features/prayer/cities'
import { prayerTimesFor } from '@/features/prayer/times'
import { ramadanDay } from '@/features/ramadan/ramadan'

import { verseOfDay } from './verseOfDay'
import { RAMADAN_VERSES, VERSES } from './verses'

describe('verset du jour', () => {
  it('suit le jour de l’année et change chaque jour', () => {
    expect(verseOfDay('2026-10-23', false)).toBe(verseOfDay('2026-10-23', false))
    expect(verseOfDay('2026-10-23', false)).not.toBe(verseOfDay('2026-10-24', false))
    expect(VERSES).toContain(verseOfDay('2026-10-23', false))
  })

  it('pendant Ramadan, un jour sur trois vient de la liste Ramadan', () => {
    const days = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']
    const fromRamadan = days.map((k) => RAMADAN_VERSES.includes(verseOfDay(k, true)))
    expect(fromRamadan).toEqual([true, false, false, true])
  })
})

describe('athkar', () => {
  it('compte les dhikr terminés', () => {
    const day = emptyDay('2026-10-23')
    expect(athkarProgress('matin', day)).toEqual({ done: 0, total: ATHKAR.matin.items.length })
    day.athkar.matin = { 0: ATHKAR.matin.items[0].n, 1: 0 }
    expect(athkarProgress('matin', day).done).toBe(1)
  })

  it('ouvre la série selon l’heure', () => {
    const t = prayerTimesFor('2026-10-23', resolvePlace({ cityId: 'nkc', custom: null }), {
      method: 'mwl',
      asrSchool: 'standard',
      tune: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    })
    const at = (h: string) => new Date(`2026-10-23T${h}:00Z`)
    expect(defaultAthkarSet(at('07:00'), t)).toBe('matin')
    expect(defaultAthkarSet(at('13:00'), t)).toBe('salat')
    expect(defaultAthkarSet(at('17:00'), t)).toBe('soir')
    expect(defaultAthkarSet(at('20:30'), t)).toBe('soir')
    expect(defaultAthkarSet(at('23:00'), t)).toBe('nuit')
  })
})

describe('mode Ramadan', () => {
  it('n’est actif qu’en Ramadan ou en aperçu', () => {
    expect(ramadanDay('2026-10-23', 0, false)).toBeNull()
    expect(ramadanDay('2026-10-23', 0, true)).toEqual({ day: 12, preview: true })
    expect(ramadanDay('2027-02-15', 0, false)?.preview).toBe(false)
  })
})
