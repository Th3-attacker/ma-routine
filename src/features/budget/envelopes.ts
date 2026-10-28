// Budget base zéro (méthode des enveloppes, comme Finzee) : chaque ouguiya reçue est mise dans une enveloppe
// (une catégorie de dépense) jusqu'à ce qu'il reste 0 « à répartir ». Le disponible de chaque enveloppe et le
// reste à répartir sont reportés d'un mois sur l'autre.

import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { liveRows, saveRow } from '@/db/rows'
import type { Allocation, Transaction } from '@/db/types'

import { CATEGORIES } from './categories'
import { addMonths } from './stats'

export type Envelope = { id: string; assigned: number; spent: number; available: number }
export type EnvelopeMonth = { toAssign: number; income: number; assigned: number; envelopes: Envelope[] }

/**
 * État des enveloppes à la fin du mois `month`. On part du premier mois où quelque chose a été réparti
 * (ou du mois lui-même) : les revenus d'avant n'entrent pas dans « à répartir ».
 */
export function envelopeMonth(
  month: string,
  allocations: readonly Pick<Allocation, 'id' | 'amounts'>[],
  transactions: readonly Pick<Transaction, 'type' | 'amount' | 'category' | 'date'>[],
): EnvelopeMonth {
  const byMonth = new Map(allocations.map((a) => [a.id, a.amounts]))
  const first =
    allocations
      .map((a) => a.id)
      .filter((m) => m <= month)
      .sort()[0] ?? month
  const ids = CATEGORIES.out.map((c) => c.id)
  const available: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
  let toAssign = 0
  let last = { income: 0, assigned: 0, spent: {} as Record<string, number>, amounts: {} as Record<string, number> }
  for (let m = first; m <= month; m = addMonths(m, 1)) {
    const amounts = byMonth.get(m) ?? {}
    const spent: Record<string, number> = {}
    let income = 0
    for (const t of transactions) {
      if (!t.date.startsWith(m)) continue
      if (t.type === 'in') income += t.amount
      else spent[t.category] = (spent[t.category] ?? 0) + t.amount
    }
    const assigned = Object.values(amounts).reduce((a, b) => a + b, 0)
    toAssign += income - assigned
    for (const id of new Set([...ids, ...Object.keys(spent), ...Object.keys(amounts)]))
      available[id] = (available[id] ?? 0) + (amounts[id] ?? 0) - (spent[id] ?? 0)
    last = { income, assigned, spent, amounts }
  }
  return {
    toAssign,
    income: last.income,
    assigned: last.assigned,
    envelopes: Object.keys(available).map((id) => ({
      id,
      assigned: last.amounts[id] ?? 0,
      spent: last.spent[id] ?? 0,
      available: available[id],
    })),
  }
}

/** Les enveloppes du mois, calculées depuis la base (se met à jour toute seule). */
export function useEnvelopes(month: string): EnvelopeMonth | undefined {
  return useLiveQuery(async () => {
    const allocations = await liveRows(db.allocations)
    const first = allocations.map((a) => a.id).sort()[0] ?? month
    const transactions = (await db.transactions.where('date').aboveOrEqual(`${first}-01`).toArray()).filter(
      (t) => !t.deleted,
    )
    return envelopeMonth(month, allocations, transactions)
  }, [month])
}

/** Répartition du mois (remplace la précédente). Les montants à 0 sont retirés. */
export async function setAllocation(month: string, amounts: Record<string, number>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(amounts).filter(([, v]) => v > 0))
  await saveRow(db.allocations, { id: month, amounts: clean })
}

/** Change une seule enveloppe du mois. */
export async function setEnvelope(month: string, id: string, amount: number): Promise<void> {
  const current = (await db.allocations.get(month))?.amounts ?? {}
  await setAllocation(month, { ...current, [id]: Math.max(0, amount) })
}

/** Déplace de l'argent d'une enveloppe à une autre (ce mois-ci). */
export async function moveBetween(month: string, from: string, to: string, amount: number): Promise<void> {
  const current = (await db.allocations.get(month))?.amounts ?? {}
  await setAllocation(month, {
    ...current,
    [from]: Math.max(0, (current[from] ?? 0) - amount),
    [to]: (current[to] ?? 0) + amount,
  })
}

/** « Comme le mois dernier » : la répartition du mois précédent, sinon les anciens budgets fixes. */
export async function previousAllocation(
  month: string,
  fallback: Record<string, number>,
): Promise<Record<string, number>> {
  const prev = await db.allocations.get(addMonths(month, -1))
  return prev && !prev.deleted && Object.keys(prev.amounts).length ? prev.amounts : fallback
}
