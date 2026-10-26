import { describe, expect, it } from 'vitest'

import { MAX_INSIGHTS, monthInsights, topAlert, type InsightInput } from './insights'

const tx = (
  amount: number,
  category: string,
  date: string,
  extra: Partial<{ note: string; recurringId: string; type: 'in' | 'out' }> = {},
) => ({
  type: 'out' as const,
  amount,
  category,
  note: '',
  date,
  ...extra,
})

const base: InsightInput = {
  month: '2026-10',
  today: '2026-10-10',
  transactions: [],
  previousMonth: [],
  budgets: {},
  debts: [],
}

const keys = (i: InsightInput) => monthInsights(i).map((x) => x.key)

describe('conseils du mois', () => {
  it('rien à dire pour un mois vide', () => {
    expect(monthInsights(base)).toEqual([])
  })

  it('catégorie au-dessus de 100 % (alerte) ou de 85 % (attention)', () => {
    const r = monthInsights({
      ...base,
      budgets: { food: 10000, transport: 5000 },
      transactions: [tx(11000, 'food', '2026-10-02'), tx(4500, 'transport', '2026-10-03')],
    })
    expect(r[0]).toMatchObject({ key: 'catOver', category: 'food', pct: 110 })
    expect(r[1]).toMatchObject({ key: 'catNear', category: 'transport', pct: 90 })
  })

  it('projection de fin de mois au-dessus du budget total', () => {
    // 6 000 en 10 jours → 18 600 sur 31 jours, pour un budget de 15 000
    const r = monthInsights({ ...base, budgets: { food: 15000 }, transactions: [tx(6000, 'food', '2026-10-05')] })
    expect(r.find((x) => x.key === 'projection')).toMatchObject({ projected: 18600, budget: 15000 })
    // Pas de projection pour un mois passé
    expect(
      keys({ ...base, month: '2026-09', budgets: { food: 15000 }, transactions: [tx(6000, 'food', '2026-09-05')] }),
    ).not.toContain('projection')
  })

  it('écart de plus de 20 % avec le mois précédent', () => {
    const r = monthInsights({
      ...base,
      transactions: [tx(15000, 'food', '2026-10-02'), tx(9000, 'transport', '2026-10-02')],
      previousMonth: [tx(10000, 'food', '2026-09-02'), tx(10000, 'transport', '2026-09-02')],
    })
    expect(r.find((x) => x.key === 'catUp')).toMatchObject({ category: 'food', pct: 50 })
  })

  it('plus grosse dépense, jour le plus dépensier, part des fixes, sadaqa', () => {
    const r = monthInsights({
      ...base,
      transactions: [
        tx(40000, 'home', '2026-10-05', { note: 'Loyer', recurringId: 'r1' }),
        tx(3000, 'food', '2026-10-06'),
        tx(2000, 'food', '2026-10-06'),
        tx(5000, 'sadaqa', '2026-10-07'),
        tx(100000, 'salary', '2026-10-01', { type: 'in' }),
      ],
    })
    expect(r.find((x) => x.key === 'biggest')).toMatchObject({ amount: 40000, note: 'Loyer' })
    expect(r.find((x) => x.key === 'topDay')).toMatchObject({ date: '2026-10-05', amount: 40000 })
    expect(r.find((x) => x.key === 'fixedShare')).toMatchObject({ pct: 80 })
    expect(r.find((x) => x.key === 'sadaqa')).toMatchObject({ amount: 5000 })
  })

  it('dettes en retard', () => {
    const r = monthInsights({
      ...base,
      debts: [
        { amount: 5000, payments: [{ amount: 1000, date: '' }], closed: false, due: '2026-10-01' },
        { amount: 9000, payments: [], closed: true, due: '2026-10-01' },
        { amount: 2000, payments: [], closed: false, due: '2026-12-01' },
      ],
    })
    expect(r).toEqual([{ key: 'lateDebts', severity: 'warn', count: 1, amount: 4000 }])
  })

  it('les alertes d’abord, au maximum 5, et l’alerte principale pour Aujourd’hui', () => {
    const input: InsightInput = {
      ...base,
      budgets: { food: 1000 },
      transactions: [
        tx(40000, 'home', '2026-10-05', { recurringId: 'r' }),
        tx(2000, 'food', '2026-10-06'),
        tx(500, 'sadaqa', '2026-10-07'),
      ],
      previousMonth: [tx(10000, 'home', '2026-09-05')],
      debts: [{ amount: 100, payments: [], closed: false, due: '2026-10-01' }],
    }
    const r = monthInsights(input)
    expect(r.length).toBeLessThanOrEqual(MAX_INSIGHTS)
    expect(r[0].severity).toBe('bad')
    expect(topAlert(r)?.key).toBe('catOver')
    expect(topAlert(monthInsights({ ...base, transactions: [tx(10, 'food', '2026-10-01')] }))).toBeNull()
  })
})
