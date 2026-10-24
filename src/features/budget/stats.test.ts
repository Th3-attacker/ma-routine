import { describe, expect, it } from 'vitest'

import { addMonths, budgetLevel, budgetTotal, groupByDay, monthStats } from './stats'

describe('statistiques du budget', () => {
  it('additionne revenus, dépenses et catégories', () => {
    const s = monthStats([
      { type: 'out', amount: 1000, category: 'food' },
      { type: 'out', amount: 500, category: 'food' },
      { type: 'out', amount: 200, category: 'sadaqa' },
      { type: 'in', amount: 30000, category: 'salary' },
    ])
    expect(s).toEqual({ income: 30000, spent: 1700, byCategory: { food: 1500, sadaqa: 200 }, count: 4 })
  })

  it('budget total et niveaux des barres (85 % et 100 %)', () => {
    expect(budgetTotal({ food: 10000, home: 5000, x: 0 })).toBe(15000)
    expect(budgetLevel(800, 1000)).toBe('ok')
    expect(budgetLevel(850, 1000)).toBe('ok')
    expect(budgetLevel(851, 1000)).toBe('warn')
    expect(budgetLevel(1000, 1000)).toBe('warn')
    expect(budgetLevel(1001, 1000)).toBe('bad')
    expect(budgetLevel(5000, 0)).toBe('ok')
  })

  it('groupe par jour, du plus récent au plus ancien', () => {
    const g = groupByDay([
      { date: '2026-10-01', createdAt: 1 },
      { date: '2026-10-23', createdAt: 2 },
      { date: '2026-10-23', createdAt: 3 },
    ])
    expect(g.map(([d, l]) => [d, l.map((x) => x.createdAt)])).toEqual([
      ['2026-10-23', [3, 2]],
      ['2026-10-01', [1]],
    ])
  })

  it('change de mois', () => {
    expect(addMonths('2026-10', 1)).toBe('2026-11')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })
})
