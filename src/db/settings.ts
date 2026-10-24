import { useLiveQuery } from 'dexie-react-hooks'

import { db } from './db'
import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  id: 'me',
  updatedAt: 0,
  deleted: 0,
  dirty: 0,
  onboarded: false,
  name: '',
  nameAr: '',
  cityId: 'nkc',
  custom: null,
  method: 'mwl',
  asrSchool: 'standard',
  tune: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  hijriAdj: 0,
  currency: 'UM',
  quran: { goal: 4, page: 1, total: 604, khatmas: 0 },
  habits: [
    { id: 'h1', key: 'sport' },
    { id: 'h2', key: 'read' },
    { id: 'h3', key: 'water' },
    { id: 'h4', key: 'family' },
    { id: 'h5', key: 'sleep' },
  ],
  budgets: {},
  qada: 0,
  ramadanPreview: false,
  notif: {
    enabled: false,
    prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
    minutesBefore: 0,
    fridayKahf: true,
    athkarMatin: false,
    athkarSoir: false,
    suhur: true,
    iftar: true,
  },
  call: {
    enabled: true,
    minutesBefore: 3,
    prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
    lang: 'app',
    voice: true,
  },
}

/** Complète une ligne lue (ou importée) avec les valeurs par défaut, champ par champ. */
export function normalizeSettings(row: Partial<Settings> | undefined): Settings {
  const d = DEFAULT_SETTINGS
  const r = row ?? {}
  return {
    ...d,
    ...r,
    id: 'me',
    tune: { ...d.tune, ...r.tune },
    quran: { ...d.quran, ...r.quran },
    habits: Array.isArray(r.habits) ? r.habits : d.habits,
    budgets: { ...r.budgets },
    notif: { ...d.notif, ...r.notif, prayers: { ...d.notif.prayers, ...r.notif?.prayers } },
    call: { ...d.call, ...r.call, prayers: { ...d.call.prayers, ...r.call?.prayers } },
  }
}

export async function getSettings(): Promise<Settings> {
  return normalizeSettings(await db.settings.get('me'))
}

/** Modifie les réglages (écriture locale d'abord, marquée à synchroniser). */
export async function updateSettings(
  change: Partial<Omit<Settings, 'id'>> | ((s: Settings) => Partial<Omit<Settings, 'id'>>),
): Promise<Settings> {
  return db.transaction('rw', db.settings, async () => {
    const current = await getSettings()
    const patch = typeof change === 'function' ? change(current) : change
    const next: Settings = { ...current, ...patch, id: 'me', updatedAt: Date.now(), dirty: 1, deleted: 0 }
    await db.settings.put(next)
    return next
  })
}

/** Réglages en direct ; `undefined` pendant le premier chargement. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(async () => normalizeSettings(await db.settings.get('me')))
}
