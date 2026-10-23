import { useLiveQuery } from 'dexie-react-hooks'

import { db } from './db'
import type { Day } from './types'

export function emptyDay(id: string): Day {
  return {
    id,
    updatedAt: 0,
    deleted: 0,
    dirty: 0,
    prayers: {},
    sunna: {},
    athkar: {},
    tasbih: 0,
    tasbihBy: {},
    habits: {},
    quranPages: 0,
    friday: {},
    fasted: false,
    tarawih: false,
    journal: { good: '', better: '' },
  }
}

function normalizeDay(id: string, row: Partial<Day> | undefined): Day {
  const d = emptyDay(id)
  return row ? { ...d, ...row, id, journal: { ...d.journal, ...row.journal } } : d
}

export async function getDay(id: string): Promise<Day> {
  return normalizeDay(id, await db.days.get(id))
}

/** Modifie une journée à partir de son état actuel (créée si besoin). */
export async function updateDay(id: string, change: (d: Day) => Partial<Omit<Day, 'id'>>): Promise<Day> {
  return db.transaction('rw', db.days, async () => {
    const current = await getDay(id)
    const next: Day = { ...current, ...change(current), id, updatedAt: Date.now(), dirty: 1, deleted: 0 }
    await db.days.put(next)
    return next
  })
}

/** Plusieurs journées (par exemple les 7 dernières), dans l'ordre demandé ; vides si absentes. */
export async function getDays(ids: readonly string[]): Promise<Day[]> {
  const rows = await db.days.bulkGet([...ids])
  return ids.map((id, i) => normalizeDay(id, rows[i]))
}

export function useDay(id: string): Day | undefined {
  return useLiveQuery(() => getDay(id), [id])
}

export function useDays(ids: readonly string[]): Day[] | undefined {
  // La liste change d'identité à chaque rendu : on dépend de son contenu.
  const key = ids.join(',')
  return useLiveQuery(() => getDays(key ? key.split(',') : []), [key])
}

/** Toutes les journées d'un mois 'YYYY-MM' (pour les bilans). */
export function getMonthDays(month: string): Promise<Day[]> {
  return db.days.where('id').between(`${month}-01`, `${month}-32`).toArray()
}
