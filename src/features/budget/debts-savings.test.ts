import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'
import type { Debt } from '@/db/types'

import { addPayment, debtLeft, debtTotals, isSettled, removePayment, saveDebt, setClosed, sortDebts } from './debts'
import { addMove, goalReached, goalSaved, monthlyToSave, saveGoal } from './savings'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

const debt = (p: Partial<Debt>): Debt =>
  ({
    id: 'x',
    direction: 'in',
    person: 'A',
    amount: 1000,
    due: '',
    note: '',
    payments: [],
    closed: false,
    createdAt: 0,
    updatedAt: 0,
    deleted: 0,
    dirty: 0,
    ...p,
  }) as Debt

describe('dettes', () => {
  it('reste, soldée, totaux', () => {
    const d = debt({ payments: [{ amount: 300, date: '2026-10-01' }] })
    expect(debtLeft(d)).toBe(700)
    expect(isSettled(d)).toBe(false)
    expect(isSettled(debt({ payments: [{ amount: 1000, date: '' }] }))).toBe(true)
    expect(isSettled(debt({ closed: true }))).toBe(true)
    expect(
      debtTotals([d, debt({ direction: 'out', amount: 500 }), debt({ direction: 'out', amount: 900, closed: true })]),
    ).toEqual({ toMe: 700, iOwe: 500 })
  })

  it('trie par échéance, sans échéance à la fin, et sépare les soldées', () => {
    const r = sortDebts([
      debt({ id: 'a', due: '' }),
      debt({ id: 'b', due: '2026-12-01' }),
      debt({ id: 'c', due: '2026-11-01' }),
      debt({ id: 'd', closed: true }),
    ])
    expect(r.open.map((d) => d.id)).toEqual(['c', 'b', 'a'])
    expect(r.settled.map((d) => d.id)).toEqual(['d'])
  })

  it('remboursements, solde et réouverture', async () => {
    const d = await saveDebt({ direction: 'out', person: 'Ahmed', amount: 5000, due: '', note: '' })
    await addPayment(d.id, 2000, '2026-10-23')
    await addPayment(d.id, 1000, '2026-10-24')
    await removePayment(d.id, 0)
    expect(debtLeft((await db.debts.get(d.id))!)).toBe(4000)
    await setClosed(d.id, true)
    expect(isSettled((await db.debts.get(d.id))!)).toBe(true)
    await saveDebt({ direction: 'out', person: 'Ahmed B.', amount: 6000, due: '', note: '' }, d.id)
    const after = (await db.debts.get(d.id))!
    expect(after.payments).toHaveLength(1)
    expect(after.person).toBe('Ahmed B.')
  })
})

describe('épargne', () => {
  it('montant mensuel : ceil(reste ÷ mois restants), mois de 30,44 jours, au moins 1 mois', () => {
    const g = { target: 120000, moves: [{ amount: 20000, date: '' }], deadline: '2027-04-23' }
    // 182 jours ≈ 6 mois → 100 000 / 6 = 16 667
    expect(monthlyToSave(g, '2026-10-23')).toBe(16667)
    // Moins d'un mois : tout le reste ce mois-ci
    expect(monthlyToSave({ ...g, deadline: '2026-10-30' }, '2026-10-23')).toBe(100000)
    expect(monthlyToSave({ ...g, deadline: '2026-01-01' }, '2026-10-23')).toBe(100000)
    expect(monthlyToSave({ ...g, deadline: '' }, '2026-10-23')).toBe(0)
    expect(monthlyToSave({ ...g, moves: [{ amount: 120000, date: '' }] }, '2026-10-23')).toBe(0)
  })

  it('versements et retraits', async () => {
    const g = await saveGoal({ name: 'Omra', target: 1000, deadline: '', color: '--c7' })
    await addMove(g.id, 800, '2026-10-23')
    await addMove(g.id, -100, '2026-10-24')
    const after = (await db.savingsGoals.get(g.id))!
    expect(goalSaved(after)).toBe(700)
    expect(goalReached(after)).toBe(false)
    await addMove(g.id, 300, '2026-10-25')
    expect(goalReached((await db.savingsGoals.get(g.id))!)).toBe(true)
  })
})
