import type { Transaction } from '@/db/types'

export type MonthStats = { income: number; spent: number; byCategory: Record<string, number>; count: number }

/** Totaux d'un mois : revenus, dépenses, dépenses par catégorie. */
export function monthStats(items: readonly Pick<Transaction, 'type' | 'amount' | 'category'>[]): MonthStats {
  const byCategory: Record<string, number> = {}
  let income = 0
  let spent = 0
  for (const it of items) {
    if (it.type === 'in') income += it.amount
    else {
      spent += it.amount
      byCategory[it.category] = (byCategory[it.category] ?? 0) + it.amount
    }
  }
  return { income, spent, byCategory, count: items.length }
}

export function budgetTotal(budgets: Record<string, number>): number {
  return Object.values(budgets).reduce((a, b) => a + (b > 0 ? b : 0), 0)
}

/** Niveau d'une barre : orange au-dessus de 85 %, rouge au-dessus de 100 %. */
export function budgetLevel(spent: number, budget: number): 'ok' | 'warn' | 'bad' {
  if (!budget) return 'ok'
  if (spent > budget) return 'bad'
  if (spent > budget * 0.85) return 'warn'
  return 'ok'
}

/** Mouvements groupés par jour, du plus récent au plus ancien (et le plus récent d'abord dans un jour). */
export function groupByDay<T extends Pick<Transaction, 'date' | 'createdAt'>>(items: readonly T[]): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const it of items) groups.set(it.date, [...(groups.get(it.date) ?? []), it])
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([d, list]) => [d, [...list].sort((x, y) => y.createdAt - x.createdAt)])
}

/** 'YYYY-MM' décalé de n mois. */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
