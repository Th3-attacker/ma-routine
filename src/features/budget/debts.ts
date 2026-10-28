import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { liveRows, newId, saveRow, softDelete, updateRow } from '@/db/rows'
import type { Debt } from '@/db/types'

export const debtPaid = (d: Pick<Debt, 'payments'>) => d.payments.reduce((a, p) => a + p.amount, 0)
export const debtLeft = (d: Pick<Debt, 'payments' | 'amount'>) => Math.max(0, d.amount - debtPaid(d))
export const isSettled = (d: Pick<Debt, 'payments' | 'amount' | 'closed'>) => d.closed || debtLeft(d) <= 0

export function debtTotals(debts: readonly Debt[]): { toMe: number; iOwe: number } {
  let toMe = 0
  let iOwe = 0
  for (const d of debts) {
    if (isSettled(d)) continue
    if (d.direction === 'in') toMe += debtLeft(d)
    else iOwe += debtLeft(d)
  }
  return { toMe, iOwe }
}

/** En cours d'abord, par échéance (sans échéance à la fin) ; puis les soldées. */
export function sortDebts(debts: readonly Debt[]): { open: Debt[]; settled: Debt[] } {
  const open = debts.filter((d) => !isSettled(d)).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
  return { open, settled: debts.filter(isSettled) }
}

export function useDebts(): Debt[] | undefined {
  return useLiveQuery(() => liveRows(db.debts))
}

export type DebtInput = Pick<Debt, 'direction' | 'person' | 'amount' | 'due' | 'note'>

export async function saveDebt(input: DebtInput, id?: string): Promise<Debt> {
  const current = id ? await db.debts.get(id) : undefined
  return saveRow(db.debts, {
    payments: [],
    closed: false,
    createdAt: Date.now(),
    ...current,
    ...input,
    id: id ?? newId(),
  })
}

export const addPayment = (id: string, amount: number, date: string) =>
  updateRow(db.debts, id, (d) => ({ payments: [...d.payments, { amount, date }] }))
export const removePayment = (id: string, index: number) =>
  updateRow(db.debts, id, (d) => ({ payments: d.payments.filter((_, i) => i !== index) }))
export const setClosed = (id: string, closed: boolean) => updateRow(db.debts, id, () => ({ closed }))
export const deleteDebt = (id: string) => softDelete(db.debts, id)
