import Dexie, { type EntityTable } from 'dexie'

import type {
  Allocation,
  Day,
  Debt,
  Project,
  Recurring,
  SavingsGoal,
  Security,
  Settings,
  Task,
  Transaction,
} from './types'

class ElhadjDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  days!: EntityTable<Day, 'id'>
  security!: EntityTable<Security, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  projects!: EntityTable<Project, 'id'>
  tasks!: EntityTable<Task, 'id'>
  debts!: EntityTable<Debt, 'id'>
  savingsGoals!: EntityTable<SavingsGoal, 'id'>
  recurring!: EntityTable<Recurring, 'id'>
  allocations!: EntityTable<Allocation, 'id'>

  constructor(name = 'elhadj') {
    super(name)
    this.version(1).stores({
      settings: 'id, dirty',
      days: 'id, dirty, updatedAt',
    })
    // v2 : verrou de l'appareil (jamais synchronisé)
    this.version(2).stores({ security: 'id' })
    // v3 : budget, dettes, épargne, récurrentes, projets
    this.version(3).stores({
      transactions: 'id, date, recurringId, dirty',
      projects: 'id, status, dirty',
      tasks: 'id, projectId, dirty',
      debts: 'id, dirty',
      savingsGoals: 'id, dirty',
      recurring: 'id, dirty',
    })
    // v4 : enveloppes du budget base zéro, une ligne par mois
    this.version(4).stores({ allocations: 'id' })
  }
}

export const db = new ElhadjDB()
