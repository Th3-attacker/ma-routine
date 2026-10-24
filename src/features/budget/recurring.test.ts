import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'

import { applyRecurring, initialLastMonth, recurringTotals, saveRecurring, setActive } from './recurring'

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

const rent = { type: 'out' as const, name: 'Loyer', amount: 40000, category: 'home', payMethod: 'cash', day: 5 }
const txs = () => db.transactions.toArray()

describe('opérations récurrentes', () => {
  it('à la création après le jour prévu, le mois en cours est considéré comme payé', async () => {
    expect(initialLastMonth(5, '2026-10-23')).toBe('2026-10')
    expect(initialLastMonth(25, '2026-10-23')).toBe('')
    const r = await saveRecurring(rent, '2026-10-23')
    expect(r.lastMonth).toBe('2026-10')
    expect(await applyRecurring('2026-10-23')).toBe(0)
    expect(await txs()).toHaveLength(0)
  })

  it('ajoute la transaction le jour venu, une seule fois, datée du jour prévu', async () => {
    await saveRecurring(rent, '2026-10-01')
    expect(await applyRecurring('2026-10-04')).toBe(0)
    expect(await applyRecurring('2026-10-05')).toBe(1)
    expect(await applyRecurring('2026-10-06')).toBe(0)
    const [t] = await txs()
    expect(t).toMatchObject({ date: '2026-10-05', amount: 40000, note: 'Loyer', category: 'home' })
    expect(await applyRecurring('2026-11-07')).toBe(1)
    expect((await txs()).map((x) => x.date).sort()).toEqual(['2026-10-05', '2026-11-05'])
  })

  it('pas de doublon si une transaction de cette opération existe déjà dans le mois', async () => {
    const r = await saveRecurring(rent, '2026-10-01')
    await db.transactions.put({
      id: 'manuel',
      type: 'out',
      amount: 40000,
      category: 'home',
      payMethod: 'cash',
      note: 'Loyer',
      date: '2026-10-05',
      createdAt: 1,
      recurringId: r.id,
      updatedAt: 1,
      deleted: 0,
      dirty: 1,
    })
    expect(await applyRecurring('2026-10-10')).toBe(0)
    expect((await db.recurring.get(r.id))?.lastMonth).toBe('2026-10')
  })

  it('désactivée : rien ; réactivée après le jour prévu : le mois en cours n’est pas ajouté', async () => {
    const r = await saveRecurring(rent, '2026-10-01')
    await setActive(r.id, false, '2026-10-01')
    expect(await applyRecurring('2026-10-10')).toBe(0)
    await setActive(r.id, true, '2026-10-10')
    expect(await applyRecurring('2026-10-11')).toBe(0)
    expect(await applyRecurring('2026-11-05')).toBe(1)
  })

  it('totaux mensuels des opérations actives', async () => {
    const a = await saveRecurring(rent, '2026-10-01')
    const b = await saveRecurring({ ...rent, type: 'in', name: 'Salaire', amount: 150000, day: 28 }, '2026-10-01')
    await saveRecurring({ ...rent, name: 'Eau', amount: 3000 }, '2026-10-01')
    await setActive((await db.recurring.toArray()).find((x) => x.name === 'Eau')!.id, false, '2026-10-01')
    expect(
      recurringTotals((await db.recurring.toArray()).filter((x) => [a.id, b.id].includes(x.id) || !x.active)),
    ).toEqual({
      out: 40000,
      in: 150000,
    })
  })
})
