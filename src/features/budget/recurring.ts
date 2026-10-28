import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { liveRows, newId, saveRow, softDelete, updateRow } from '@/db/rows'
import type { Recurring } from '@/db/types'
import { parseKey } from '@/lib/dates'

export type RecurringInput = Pick<Recurring, 'type' | 'name' | 'amount' | 'category' | 'payMethod' | 'day'>

const pad = (n: number) => String(n).padStart(2, '0')

export function recurringTotals(items: readonly Recurring[]): { out: number; in: number } {
  let out = 0
  let inc = 0
  for (const r of items) {
    if (!r.active) continue
    if (r.type === 'in') inc += r.amount
    else out += r.amount
  }
  return { out, in: inc }
}

/**
 * Mois à noter comme « déjà fait » à la création ou à la réactivation : si le jour prévu est déjà passé ce mois-ci,
 * on considère le paiement de ce mois comme déjà fait (on ne l'ajoute pas).
 */
export function initialLastMonth(day: number, today: string, previous = ''): string {
  const { d } = parseKey(today)
  return d >= day ? today.slice(0, 7) : previous
}

export function useRecurring(): Recurring[] | undefined {
  return useLiveQuery(async () => (await liveRows(db.recurring)).sort((a, b) => a.day - b.day))
}

export async function saveRecurring(input: RecurringInput, today: string, id?: string): Promise<Recurring> {
  const current = id ? await db.recurring.get(id) : undefined
  return saveRow(db.recurring, {
    active: true,
    lastMonth: current ? current.lastMonth : initialLastMonth(input.day, today),
    ...current,
    ...input,
    id: id ?? newId(),
  })
}

/** Activer ou désactiver ; en réactivant après le jour prévu, le mois en cours n'est pas ajouté. */
export function setActive(id: string, active: boolean, today: string) {
  return updateRow(db.recurring, id, (r) => ({
    active,
    lastMonth: active ? initialLastMonth(r.day, today, r.lastMonth) : r.lastMonth,
  }))
}

export const deleteRecurring = (id: string) => softDelete(db.recurring, id)

/**
 * Ajout automatique (au démarrage et au changement de jour) : chaque opération active dont le jour est atteint et
 * dont `lastMonth` n'est pas le mois en cours crée une transaction datée de ce jour, sans doublon (recurringId).
 * Renvoie le nombre de transactions ajoutées.
 */
export async function applyRecurring(today: string): Promise<number> {
  const month = today.slice(0, 7)
  const { d } = parseKey(today)
  return db.transaction('rw', db.recurring, db.transactions, async () => {
    let added = 0
    for (const r of await liveRows(db.recurring)) {
      if (!r.active || r.amount <= 0) continue
      const day = Math.min(28, Math.max(1, r.day))
      if (d < day || r.lastMonth === month) continue
      const exists = await db.transactions
        .where('recurringId')
        .equals(r.id)
        .filter((t) => !t.deleted && t.date.startsWith(month))
        .count()
      if (!exists) {
        await saveRow(db.transactions, {
          id: newId(),
          type: r.type,
          amount: r.amount,
          category: r.category,
          payMethod: r.payMethod,
          note: r.name,
          date: `${month}-${pad(day)}`,
          createdAt: Date.now(),
          recurringId: r.id,
        })
        added++
      }
      await saveRow(db.recurring, { ...r, lastMonth: month })
    }
    return added
  })
}
