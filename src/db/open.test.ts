import { describe, expect, it } from 'vitest'

import { db } from './db'
import { openDatabase, type OpenResult } from './open'

describe('ouverture de la base', () => {
  it('signale un ancien onglet qui bloque la mise à jour, puis s’ouvre quand il se ferme', async () => {
    db.close()
    await db.delete()
    // Un « ancien onglet » garde la version 1 ouverte et ne réagit pas à la demande de mise à jour.
    const old: IDBDatabase = await new Promise((resolve) => {
      const req = indexedDB.open('elhadj', 1)
      req.onsuccess = () => resolve(req.result)
    })
    const results: OpenResult['status'][] = []
    const stop = openDatabase((r) => results.push(r.status), 60_000)
    await expect.poll(() => results).toContain('blocked')
    old.close()
    await expect.poll(() => results).toContain('ok')
    stop()
  })

  it('s’ouvre normalement', async () => {
    const results: OpenResult['status'][] = []
    openDatabase((r) => results.push(r.status))
    await expect.poll(() => results).toEqual(['ok'])
  })
})
