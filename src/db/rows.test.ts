import { beforeEach, describe, expect, it } from 'vitest'

import { db } from './db'
import { liveRows, newId, saveRow, softDelete, updateRow } from './rows'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('lignes synchronisables', () => {
  it('crée, modifie et supprime en douceur', async () => {
    const id = newId()
    await saveRow(db.transactions, {
      id,
      type: 'out',
      amount: 500,
      category: 'food',
      payMethod: 'cash',
      note: '',
      date: '2026-10-23',
      createdAt: 1,
    })
    expect((await db.transactions.get(id))?.dirty).toBe(1)
    await updateRow(db.transactions, id, (r) => ({ amount: r.amount + 100 }))
    expect((await db.transactions.get(id))?.amount).toBe(600)
    await softDelete(db.transactions, id)
    expect((await db.transactions.get(id))?.deleted).toBe(1)
    expect(await liveRows(db.transactions)).toEqual([])
    expect(await updateRow(db.transactions, id, () => ({ amount: 1 }))).toBeUndefined()
  })

  it('génère des identifiants différents', () => {
    expect(new Set(Array.from({ length: 50 }, newId)).size).toBe(50)
  })
})
