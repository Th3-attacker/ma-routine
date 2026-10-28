import { describe, expect, it } from 'vitest'

import { emptyDay } from '@/db/days'
import { DEFAULT_SETTINGS } from '@/db/settings'
import { ATHKAR } from '@/features/athkar/data'
import { resolvePlace } from '@/features/prayer/cities'
import { prayerTimesFor } from '@/features/prayer/times'
import { daysToRamadan, ramadanCountdown, ramadanPagesPerDay } from '@/features/ramadan/ramadan'

import { eveningRecap, isEvening, recapMessage } from './recap'

describe('bilan du soir', () => {
  it('six tuiles et message bienveillant', () => {
    const day = emptyDay('2026-10-23')
    day.prayers = { fajr: 'jamaa', dhuhr: 'ontime', asr: 'missed', maghrib: 'jamaa' }
    day.athkar = { matin: Object.fromEntries(ATHKAR.matin.items.map((it, i) => [i, it.n])) }
    day.quranPages = 3
    day.habits = { h1: true, h3: true }
    const r = eveningRecap(day, DEFAULT_SETTINGS, 2, 4500)
    expect(r).toMatchObject({
      prayed: 3,
      jamaa: 2,
      missed: 1,
      unmarked: 1,
      athkarSets: 1,
      quranPages: 3,
      quranGoal: 4,
      habitsDone: 2,
      habitsTotal: 5,
      stepsDone: 2,
      spent: 4500,
    })
    expect(recapMessage(r)).toEqual({ key: 'unmarked', count: 1 })
    expect(recapMessage({ unmarked: 0, missed: 2 })).toEqual({ key: 'missed', count: 2 })
    expect(recapMessage({ unmarked: 0, missed: 0 }).key).toBe('allDone')
  })

  it('monte en haut entre Icha et Fajr', () => {
    const t = prayerTimesFor('2026-10-23', resolvePlace({ cityId: 'nkc', custom: null }), DEFAULT_SETTINGS)
    expect(isEvening(new Date('2026-10-23T20:00:00Z'), t)).toBe(true)
    expect(isEvening(new Date('2026-10-23T04:00:00Z'), t)).toBe(true)
    expect(isEvening(new Date('2026-10-23T12:00:00Z'), t)).toBe(false)
  })
})

describe('mode Ramadan', () => {
  it('compte à rebours : suhûr, iftar, suhûr du lendemain', () => {
    const place = resolvePlace({ cityId: 'nkc', custom: null })
    const t = prayerTimesFor('2027-02-15', place, DEFAULT_SETTINGS)
    const tm = prayerTimesFor('2027-02-16', place, DEFAULT_SETTINGS)
    expect(ramadanCountdown(new Date('2027-02-15T04:00:00Z'), t, tm).kind).toBe('suhur')
    expect(ramadanCountdown(new Date('2027-02-15T12:00:00Z'), t, tm)).toMatchObject({ kind: 'iftar', at: t.maghrib })
    expect(ramadanCountdown(new Date('2027-02-15T21:00:00Z'), t, tm)).toEqual({ kind: 'tomorrowSuhur', at: tm.fajr })
  })

  it('pages par jour pour finir avant l’Aïd', () => {
    expect(ramadanPagesPerDay({ page: 1, total: 604 }, 1)).toBe(21) // 604 / 30
    expect(ramadanPagesPerDay({ page: 301, total: 604 }, 21)).toBe(31) // 304 / 10
    expect(ramadanPagesPerDay({ page: 600, total: 604 }, 30)).toBe(5)
  })

  it('jours avant Ramadan 1448', () => {
    const n = daysToRamadan('2026-10-23', 0)
    expect(n).toBeGreaterThan(100)
    expect(daysToRamadan('2027-02-01', 0)).toBeLessThanOrEqual(30)
  })
})
