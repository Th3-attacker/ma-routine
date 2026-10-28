import type { Debt, Transaction } from '@/db/types'
import { daysBetween, parseKey } from '@/lib/dates'

import { debtLeft, isSettled } from './debts'
import { budgetTotal, monthStats } from './stats'

// Conseils du mois, calculés sur le téléphone, sans IA. Chaque conseil est une clé de traduction et ses valeurs :
// le texte (bienveillant, en français et en arabe) est dans fr.json / ar.json, sous « insights ».

export type InsightSeverity = 'bad' | 'warn' | 'info'

export type Insight =
  | { key: 'catOver'; severity: 'bad'; category: string; pct: number }
  | { key: 'catNear'; severity: 'warn'; category: string; pct: number }
  | { key: 'projection'; severity: 'warn'; projected: number; budget: number }
  | { key: 'lateDebts'; severity: 'warn'; count: number; amount: number }
  | { key: 'catUp' | 'catDown'; severity: 'info'; category: string; pct: number }
  | { key: 'biggest'; severity: 'info'; amount: number; category: string; note: string; date: string }
  | { key: 'topDay'; severity: 'info'; amount: number; date: string }
  | { key: 'fixedShare'; severity: 'info'; pct: number }
  | { key: 'sadaqa'; severity: 'info'; amount: number }

export const MAX_INSIGHTS = 5

const ORDER: Record<InsightSeverity, number> = { bad: 0, warn: 1, info: 2 }

type Tx = Pick<Transaction, 'type' | 'amount' | 'category' | 'note' | 'date' | 'recurringId'>

export type InsightInput = {
  /** 'YYYY-MM' du mois affiché. */
  month: string
  /** Jour actuel 'YYYY-MM-DD' (fuseau de la ville). */
  today: string
  transactions: readonly Tx[]
  previousMonth: readonly Tx[]
  budgets: Record<string, number>
  debts: readonly Pick<Debt, 'amount' | 'payments' | 'closed' | 'due'>[]
}

function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export function monthInsights(input: InsightInput): Insight[] {
  const { month, today, transactions, previousMonth, budgets, debts } = input
  const stats = monthStats(transactions)
  const prev = monthStats(previousMonth)
  const out: Insight[] = []

  // 1. Catégories proches ou au-dessus de leur budget
  for (const [category, budget] of Object.entries(budgets)) {
    if (!(budget > 0)) continue
    const spent = stats.byCategory[category] ?? 0
    const pct = Math.round((spent / budget) * 100)
    if (spent > budget) out.push({ key: 'catOver', severity: 'bad', category, pct })
    else if (spent > budget * 0.85) out.push({ key: 'catNear', severity: 'warn', category, pct })
  }

  // 2. Projection de fin de mois (mois en cours seulement, après quelques jours)
  const total = budgetTotal(budgets)
  if (total > 0 && today.startsWith(month)) {
    const elapsed = parseKey(today).d
    if (elapsed >= 3) {
      const projected = Math.round((stats.spent / elapsed) * daysInMonth(month))
      if (projected > total) out.push({ key: 'projection', severity: 'warn', projected, budget: total })
    }
  }

  // 3. Dettes en retard
  const late = debts.filter((d) => !isSettled(d) && d.due && daysBetween(today, d.due) < 0)
  if (late.length) {
    out.push({
      key: 'lateDebts',
      severity: 'warn',
      count: late.length,
      amount: late.reduce((a, d) => a + debtLeft(d), 0),
    })
  }

  // 4. Le plus grand écart (> 20 %) d'une catégorie avec le mois précédent
  let change: { category: string; ratio: number } | null = null
  for (const [category, before] of Object.entries(prev.byCategory)) {
    if (before < 1000) continue
    const ratio = ((stats.byCategory[category] ?? 0) - before) / before
    if (Math.abs(ratio) > 0.2 && (!change || Math.abs(ratio) > Math.abs(change.ratio))) change = { category, ratio }
  }
  if (change) {
    out.push({
      key: change.ratio > 0 ? 'catUp' : 'catDown',
      severity: 'info',
      category: change.category,
      pct: Math.round(Math.abs(change.ratio) * 100),
    })
  }

  // 5. Plus grosse dépense, et jour où l'on a le plus dépensé
  const expenses = transactions.filter((t) => t.type === 'out')
  if (expenses.length) {
    const biggest = expenses.reduce((a, t) => (t.amount > a.amount ? t : a))
    out.push({
      key: 'biggest',
      severity: 'info',
      amount: biggest.amount,
      category: biggest.category,
      note: biggest.note,
      date: biggest.date,
    })
    const byDay = new Map<string, number>()
    for (const t of expenses) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount)
    const [date, amount] = [...byDay.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))
    if (byDay.size > 1) out.push({ key: 'topDay', severity: 'info', amount, date })
  }

  // 6. Part des dépenses fixes (opérations récurrentes)
  if (stats.spent > 0) {
    const fixed = expenses.filter((t) => t.recurringId).reduce((a, t) => a + t.amount, 0)
    if (fixed > 0) out.push({ key: 'fixedShare', severity: 'info', pct: Math.round((fixed / stats.spent) * 100) })
  }

  // 7. Sadaqa du mois, en information
  const sadaqa = stats.byCategory.sadaqa ?? 0
  if (sadaqa > 0) out.push({ key: 'sadaqa', severity: 'info', amount: sadaqa })

  return out.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]).slice(0, MAX_INSIGHTS)
}

/** L'alerte la plus importante (pour la carte Dépenses d'Aujourd'hui), ou rien. */
export function topAlert(insights: readonly Insight[]): Insight | null {
  return insights.find((i) => i.severity !== 'info') ?? null
}
