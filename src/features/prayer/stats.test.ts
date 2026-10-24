import { describe, expect, it } from 'vitest'

import { monthPrayerStats } from './stats'

describe('bilan du mois', () => {
  it('compte les prières à l’heure et en jamâ‘a', () => {
    expect(monthPrayerStats([])).toEqual({ marked: 0, onTimePct: 0, jamaa: 0 })
    const r = monthPrayerStats([
      { prayers: { fajr: 'jamaa', dhuhr: 'ontime', asr: 'late' } },
      { prayers: { fajr: 'missed', isha: 'jamaa' } },
    ])
    expect(r).toEqual({ marked: 5, onTimePct: 60, jamaa: 2 })
  })
})
