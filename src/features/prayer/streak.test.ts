import { describe, expect, it } from 'vitest'

import type { Day } from '@/db/types'

import { dayComplete, prayerStreak } from './streak'

const full: Pick<Day, 'prayers'> = {
  prayers: { fajr: 'jamaa', dhuhr: 'ontime', asr: 'late', maghrib: 'ontime', isha: 'ontime' },
}
const missed: Pick<Day, 'prayers'> = { prayers: { ...full.prayers, asr: 'missed' } }
const partial: Pick<Day, 'prayers'> = { prayers: { fajr: 'ontime' } }

describe('série de prières', () => {
  it('une journée est complète sans prière manquée ni oubliée', () => {
    expect(dayComplete(full)).toBe(true)
    expect(dayComplete(missed)).toBe(false)
    expect(dayComplete(partial)).toBe(false)
    expect(dayComplete(undefined)).toBe(false)
  })

  it('compte les jours consécutifs, en partant d’hier si aujourd’hui est en cours', () => {
    const days: Record<string, Pick<Day, 'prayers'>> = {
      '2026-10-23': partial,
      '2026-10-22': full,
      '2026-10-21': full,
      '2026-10-20': missed,
      '2026-10-19': full,
    }
    expect(prayerStreak('2026-10-23', (k) => days[k])).toBe(2)
    days['2026-10-23'] = full
    expect(prayerStreak('2026-10-23', (k) => days[k])).toBe(3)
    expect(prayerStreak('2026-10-25', (k) => days[k])).toBe(0)
  })
})
