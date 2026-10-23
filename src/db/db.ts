import Dexie, { type EntityTable } from 'dexie'

import type { Day, Settings } from './types'

export class ElhadjDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  days!: EntityTable<Day, 'id'>

  constructor(name = 'elhadj') {
    super(name)
    // Les tables du budget et des projets arrivent en phase 1B (nouvelle version du schéma).
    this.version(1).stores({
      settings: 'id, dirty',
      days: 'id, dirty, updatedAt',
    })
  }
}

export const db = new ElhadjDB()
