import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS, normalizeSettings } from '@/db/settings'
import type { Habit } from '@/db/types'

import { fromFormValues, habitsFromLines, parseNumber, settingsFormSchema, toFormValues } from './form'

const names: Record<string, string> = { sport: 'Sport 20 min', read: 'Lire 10 pages' }
const habitName = (h: Habit) => (h.key ? (names[h.key] ?? h.key) : (h.name ?? ''))
const values = () => toFormValues(DEFAULT_SETTINGS, habitName)
const issues = (v: unknown) => settingsFormSchema.safeParse(v).error?.issues ?? []

describe('formulaire des réglages', () => {
  it('lit les nombres avec une virgule ou des espaces', () => {
    expect(parseNumber('18,0858')).toBe(18.0858)
    expect(parseNumber(' -15.97 ')).toBe(-15.97)
    expect(parseNumber('')).toBeNaN()
  })

  it('accepte les valeurs par défaut', () => {
    expect(issues(values())).toEqual([])
  })

  it('calcul des horaires toujours celui de référence, même avec d’anciens choix', () => {
    const s = normalizeSettings({ method: 'egy', asrSchool: 'hanafi', tune: { ...DEFAULT_SETTINGS.tune, fajr: 5 } })
    expect(s).toMatchObject({ method: 'mwl', asrSchool: 'standard', tune: DEFAULT_SETTINGS.tune })
  })

  it('« Ma position » exige une position trouvée', () => {
    const v = { ...values(), cityId: 'custom' }
    expect(issues(v)[0]).toMatchObject({ path: ['cityId'], message: 'errors.position' })
    expect(issues({ ...v, lat: '95', lng: '2' })[0].message).toBe('errors.coords')
    expect(issues({ ...v, lat: '18,08', lng: '-15,97' })).toEqual([])
  })

  it('refuse une page actuelle après la dernière page', () => {
    expect(issues({ ...values(), page: '700' })[0]).toMatchObject({ path: ['page'], message: 'errors.pageAfterTotal' })
  })

  it('transforme les valeurs en réglages', () => {
    const patch = fromFormValues(
      { ...values(), name: '  Elhadj ', cityId: 'custom', lat: '18,1', lng: '-16', hijriAdj: '-1', currency: ' ' },
      DEFAULT_SETTINGS,
      habitName,
      'Africa/Nouakchott',
    )
    expect(patch).toMatchObject({
      name: 'Elhadj',
      custom: { lat: 18.1, lng: -16, timezone: 'Africa/Nouakchott' },
      hijriAdj: -1,
      currency: 'UM',
      quran: { goal: 4, page: 1, total: 604, khatmas: 0 },
    })
  })

  it('garde les habitudes existantes et ajoute les nouvelles lignes', () => {
    const old: Habit[] = [
      { id: 'h1', key: 'sport' },
      { id: 'h2', key: 'read' },
    ]
    const r = habitsFromLines('Lire 10 pages\n\n  Méditer  \n', old, habitName)
    expect(r[0]).toEqual({ id: 'h2', key: 'read' })
    expect(r[1]).toMatchObject({ name: 'Méditer' })
    expect(r).toHaveLength(2)
  })
})
