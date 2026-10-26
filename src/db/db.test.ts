import { beforeEach, describe, expect, it } from 'vitest'

import {
  db,
  DEFAULT_SETTINGS,
  getDay,
  getDays,
  getMonthDays,
  getSettings,
  normalizeSettings,
  updateDay,
  updateSettings,
} from '.'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('réglages', () => {
  it('renvoie les valeurs par défaut de la maquette sans rien écrire', async () => {
    const s = await getSettings()
    expect(s.cityId).toBe('nkc')
    expect(s.method).toBe('mwl')
    expect(s.quran).toEqual({ goal: 4, page: 1, total: 604, khatmas: 0 })
    expect(s.habits.map((h) => h.key)).toEqual(['sport', 'read', 'water', 'family', 'sleep'])
    expect(await db.settings.count()).toBe(0)
  })

  it('écrit localement et marque la ligne à synchroniser', async () => {
    const before = Date.now()
    await updateSettings({ name: 'Elhadj' })
    const row = await db.settings.get('me')
    expect(row?.name).toBe('Elhadj')
    expect(row?.dirty).toBe(1)
    expect(row?.updatedAt).toBeGreaterThanOrEqual(before)
  })

  it('accepte une modification calculée à partir de l’état actuel', async () => {
    await updateSettings((s) => ({ qada: s.qada + 1 }))
    await updateSettings((s) => ({ qada: s.qada + 1 }))
    expect((await getSettings()).qada).toBe(2)
  })

  it('complète une ligne incomplète avec les valeurs par défaut', () => {
    const s = normalizeSettings({ tune: { fajr: 2 } as never, notif: { enabled: true } as never })
    expect(s.tune).toEqual(DEFAULT_SETTINGS.tune) // plus de décalage réglable
    expect(s.notif.enabled).toBe(true)
    expect(s.notif.prayers.isha).toBe(true)
  })
})

describe('journées', () => {
  it('renvoie une journée vide quand elle n’existe pas', async () => {
    const d = await getDay('2026-10-23')
    expect(d.prayers).toEqual({})
    expect(d.quranPages).toBe(0)
  })

  it('modifie une journée à partir de son état', async () => {
    await updateDay('2026-10-23', (d) => ({ prayers: { ...d.prayers, fajr: 'jamaa' } }))
    await updateDay('2026-10-23', (d) => ({ prayers: { ...d.prayers, dhuhr: 'late' } }))
    const d = await getDay('2026-10-23')
    expect(d.prayers).toEqual({ fajr: 'jamaa', dhuhr: 'late' })
    expect(d.dirty).toBe(1)
  })

  it('lit plusieurs journées dans l’ordre et celles d’un mois', async () => {
    await updateDay('2026-10-01', () => ({ quranPages: 3 }))
    await updateDay('2026-10-31', () => ({ quranPages: 5 }))
    await updateDay('2026-11-01', () => ({ quranPages: 7 }))
    const days = await getDays(['2026-10-31', '2026-10-15', '2026-10-01'])
    expect(days.map((d) => d.quranPages)).toEqual([5, 0, 3])
    expect((await getMonthDays('2026-10')).map((d) => d.id)).toEqual(['2026-10-01', '2026-10-31'])
  })
})
