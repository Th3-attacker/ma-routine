import { beforeEach, describe, expect, it } from 'vitest'

import { db, getDay, getSettings } from '@/db'

import { setPrayerStatus } from './status'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('statut d’une prière et qadâ’', () => {
  it('ajoute 1 au qadâ’ quand une prière passe à « Manquée », et retire 1 quand elle en sort', async () => {
    await setPrayerStatus('2026-10-23', 'asr', 'missed')
    expect((await getDay('2026-10-23')).prayers.asr).toBe('missed')
    expect((await getSettings()).qada).toBe(1)
    await setPrayerStatus('2026-10-23', 'asr', 'missed')
    expect((await getSettings()).qada).toBe(1)
    await setPrayerStatus('2026-10-23', 'asr', 'late')
    expect((await getSettings()).qada).toBe(0)
    await setPrayerStatus('2026-10-23', 'fajr', 'missed')
    await setPrayerStatus('2026-10-23', 'fajr', null)
    expect((await getDay('2026-10-23')).prayers).toEqual({ asr: 'late' })
    expect((await getSettings()).qada).toBe(0)
  })

  it('ne descend jamais sous 0', async () => {
    await db.days.put({ ...(await getDay('2026-10-22')), prayers: { isha: 'missed' } })
    await setPrayerStatus('2026-10-22', 'isha', 'ontime')
    expect((await getSettings()).qada).toBe(0)
  })
})
