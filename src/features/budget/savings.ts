import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/db/db'
import { liveRows, newId, saveRow, softDelete, updateRow } from '@/db/rows'
import type { SavingsGoal } from '@/db/types'
import { daysBetween } from '@/lib/dates'

export const goalSaved = (g: Pick<SavingsGoal, 'moves'>) => g.moves.reduce((a, m) => a + m.amount, 0)
export const goalLeft = (g: Pick<SavingsGoal, 'moves' | 'target'>) => Math.max(0, g.target - goalSaved(g))
export const goalReached = (g: Pick<SavingsGoal, 'moves' | 'target'>) => goalLeft(g) <= 0

/**
 * Montant à mettre de côté chaque mois : ceil(reste ÷ mois restants), avec des mois de 30,44 jours
 * et au minimum 1 mois. 0 sans date ou si l'objectif est atteint.
 */
export function monthlyToSave(g: Pick<SavingsGoal, 'moves' | 'target' | 'deadline'>, today: string): number {
  const rest = goalLeft(g)
  if (!g.deadline || rest <= 0) return 0
  const months = Math.max(1, Math.round(daysBetween(today, g.deadline) / 30.44))
  return Math.ceil(rest / months)
}

export function useGoals(): SavingsGoal[] | undefined {
  return useLiveQuery(async () => (await liveRows(db.savingsGoals)).sort((a, b) => a.createdAt - b.createdAt))
}

export type GoalInput = Pick<SavingsGoal, 'name' | 'target' | 'deadline' | 'color'>

export async function saveGoal(input: GoalInput, id?: string): Promise<SavingsGoal> {
  const current = id ? await db.savingsGoals.get(id) : undefined
  return saveRow(db.savingsGoals, { moves: [], createdAt: Date.now(), ...current, ...input, id: id ?? newId() })
}

export const addMove = (id: string, amount: number, date: string) =>
  updateRow(db.savingsGoals, id, (g) => ({ moves: [...g.moves, { amount, date }] }))
export const removeMove = (id: string, index: number) =>
  updateRow(db.savingsGoals, id, (g) => ({ moves: g.moves.filter((_, i) => i !== index) }))
export const deleteGoal = (id: string) => softDelete(db.savingsGoals, id)

export const GOAL_TEMPLATES = ['omra', 'hajj', 'sheep', 'wedding', 'emergency'] as const
