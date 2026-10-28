import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/db/db'

import { envelopeMonth, moveBetween, previousAllocation, setAllocation, setEnvelope } from './envelopes'

const tx = (date: string, type: 'in' | 'out', amount: number, category = 'food') => ({ date, type, amount, category })
const env = (r: ReturnType<typeof envelopeMonth>, id: string) => r.envelopes.find((e) => e.id === id)!

describe('enveloppes (budget base zéro)', () => {
  it('à répartir = revenus − montants mis ; disponible = mis − dépensé', () => {
    const r = envelopeMonth(
      '2026-10',
      [{ id: '2026-10', amounts: { food: 30000, transport: 10000 } }],
      [
        tx('2026-10-01', 'in', 50000, 'salary'),
        tx('2026-10-03', 'out', 12000),
        tx('2026-10-04', 'out', 2000, 'health'),
      ],
    )
    expect(r.toAssign).toBe(10000)
    expect(env(r, 'food')).toEqual({ id: 'food', assigned: 30000, spent: 12000, available: 18000 })
    // Dépense sans enveloppe : disponible négatif
    expect(env(r, 'health').available).toBe(-2000)
  })

  it('reporte le disponible et le reste à répartir au mois suivant ; ignore les revenus d’avant', () => {
    const allocations = [
      { id: '2026-10', amounts: { food: 30000 } },
      { id: '2026-11', amounts: { food: 20000 } },
    ]
    const txs = [
      tx('2026-09-01', 'in', 99999, 'salary'),
      tx('2026-10-01', 'in', 50000, 'salary'),
      tx('2026-10-05', 'out', 25000),
      tx('2026-11-01', 'in', 40000, 'salary'),
      tx('2026-11-05', 'out', 10000),
    ]
    const r = envelopeMonth('2026-11', allocations, txs)
    expect(env(r, 'food')).toEqual({ id: 'food', assigned: 20000, spent: 10000, available: 5000 + 10000 })
    expect(r.toAssign).toBe(20000 + 20000)
    // Mois sans rien de réparti : le mois lui-même est le départ
    expect(envelopeMonth('2026-08', allocations, txs).toAssign).toBe(0)
  })
})

describe('enregistrement des enveloppes', () => {
  beforeEach(async () => {
    await db.allocations.clear()
  })

  it('changer une enveloppe, déplacer de l’argent, reprendre le mois dernier', async () => {
    await setAllocation('2026-10', { food: 30000, transport: 0 })
    expect((await db.allocations.get('2026-10'))?.amounts).toEqual({ food: 30000 })
    await setEnvelope('2026-10', 'transport', 8000)
    await moveBetween('2026-10', 'food', 'transport', 5000)
    expect((await db.allocations.get('2026-10'))?.amounts).toEqual({ food: 25000, transport: 13000 })
    expect(await previousAllocation('2026-11', {})).toEqual({ food: 25000, transport: 13000 })
    expect(await previousAllocation('2026-10', { food: 1 })).toEqual({ food: 1 })
  })
})
