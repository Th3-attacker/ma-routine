import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { newId, saveRow, softDelete } from '@/db/rows'
import type { Transaction } from '@/db/types'

export type TransactionInput = Pick<Transaction, 'type' | 'amount' | 'category' | 'payMethod' | 'note' | 'date'> & {
  recurringId?: string
}

/** Mouvements d'un mois 'YYYY-MM' (non supprimés). */
export function getMonthTransactions(month: string): Promise<Transaction[]> {
  return db.transactions
    .where('date')
    .between(`${month}-01`, `${month}-32`)
    .filter((t) => !t.deleted)
    .toArray()
}

export function useMonthTransactions(month: string): Transaction[] | undefined {
  return useLiveQuery(() => getMonthTransactions(month), [month])
}

export async function addTransaction(input: TransactionInput): Promise<Transaction> {
  return saveRow(db.transactions, { ...input, id: newId(), createdAt: Date.now() })
}

export async function editTransaction(id: string, input: TransactionInput): Promise<void> {
  const current = await db.transactions.get(id)
  if (current) await saveRow(db.transactions, { ...current, ...input })
}

export function deleteTransaction(id: string) {
  return softDelete(db.transactions, id)
}
