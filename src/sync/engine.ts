import type { EntityTable } from 'dexie'

import { db } from '@/db/db'
import type { Day, DayField, Settings, SyncMeta } from '@/db/types'
import { resolvePlace } from '@/features/prayer/cities'
import { readLocal, writeLocal } from '@/lib/storage'

// Synchro « local d'abord » : le téléphone est la source de vérité, le serveur garde une copie par compte.
// 1. on récupère ce qui a changé sur le serveur depuis la dernière synchro et on le fusionne ;
// 2. on envoie les lignes modifiées sur le téléphone (dirty = 1) qui sont toujours les plus récentes.
// Règle : la modification la plus récente gagne (updatedAt). Les journées se fusionnent champ par champ.
// Les suppressions sont douces (deleted) et se propagent comme une modification.

type Row = SyncMeta & { id: string }

export type RemoteRow = {
  id: string
  data: Record<string, unknown>
  updated_at: number
  deleted: boolean
  synced_at: string
}

/** Ce dont le moteur a besoin côté serveur (Supabase en vrai, une fausse version en mémoire dans les tests). */
export interface Remote {
  pull(table: string, since: string | null): Promise<RemoteRow[]>
  push(table: string, rows: Omit<RemoteRow, 'synced_at'>[]): Promise<void>
}

/** Table locale (Dexie) → table du serveur. La table « security » (code à 4 chiffres) n'est jamais synchronisée. */
export const SYNCED_TABLES = {
  settings: 'settings',
  days: 'days',
  transactions: 'transactions',
  projects: 'projects',
  tasks: 'tasks',
  debts: 'debts',
  savingsGoals: 'savings_goals',
  recurring: 'recurring',
} as const

type LocalName = keyof typeof SYNCED_TABLES

const cursorKey = (userId: string, table: string) => `elhadj.sync.${userId}.${table}`

function toRemote(row: Row, name: LocalName): Omit<RemoteRow, 'synced_at'> {
  const { dirty: _dirty, ...rest } = row
  void _dirty
  // Le serveur des notifications a besoin des coordonnées et du fuseau : on les ajoute aux réglages envoyés.
  const data = name === 'settings' ? { ...rest, place: resolvePlace(row as unknown as Settings) } : rest
  return { id: row.id, data, updated_at: row.updatedAt, deleted: row.deleted === 1 }
}

function fromRemote(r: RemoteRow): Row {
  return { ...(r.data as Row), id: r.id, updatedAt: r.updated_at, deleted: r.deleted ? 1 : 0, dirty: 0 }
}

/** Fusion champ par champ de deux versions d'une journée : chaque champ garde sa version la plus récente. */
export function mergeDays(local: Day, remote: Day): { merged: Day; localWins: boolean } {
  const merged: Day = { ...remote, fieldTimes: { ...remote.fieldTimes } }
  let localWins = false
  const fields = new Set([...Object.keys(local), ...Object.keys(remote)]) as Set<keyof Day>
  for (const f of fields) {
    if (f === 'id' || f === 'updatedAt' || f === 'deleted' || f === 'dirty' || f === 'fieldTimes') continue
    const k = f as DayField
    // Un champ jamais modifié sur ce téléphone compte pour 0 ; une ligne sans horodatage par champ
    // (ancienne version, import) utilise l'heure de la ligne.
    const lt = local.fieldTimes ? (local.fieldTimes[k] ?? 0) : local.updatedAt
    const rt = remote.fieldTimes ? (remote.fieldTimes[k] ?? 0) : remote.updatedAt
    if (lt > rt) {
      ;(merged as Record<string, unknown>)[k] = local[k]
      merged.fieldTimes![k] = lt
      localWins = true
    }
  }
  merged.updatedAt = Math.max(local.updatedAt, remote.updatedAt)
  merged.deleted = local.updatedAt > remote.updatedAt ? local.deleted : remote.deleted
  merged.dirty = localWins ? 1 : 0
  return { merged, localWins }
}

async function pullTable(remote: Remote, userId: string, name: LocalName): Promise<number> {
  const table = db[name] as unknown as EntityTable<Row, 'id'>
  const serverName = SYNCED_TABLES[name]
  const rows = await remote.pull(serverName, readLocal(cursorKey(userId, serverName)) || null)
  if (!rows.length) return 0
  await db.transaction('rw', table, async () => {
    for (const r of rows) {
      const incoming = fromRemote(r)
      const local = await table.get(r.id)
      if (!local) {
        await table.put(incoming)
      } else if (name === 'days') {
        await table.put(mergeDays(local as unknown as Day, incoming as unknown as Day).merged as unknown as Row)
      } else if (incoming.updatedAt >= local.updatedAt) {
        // La version du serveur est plus récente (ou identique) : elle remplace la locale.
        await table.put(incoming)
      }
      // Sinon la version locale est plus récente : elle reste « dirty » et sera envoyée.
    }
  })
  writeLocal(
    cursorKey(userId, serverName),
    rows.reduce((m, r) => (r.synced_at > m ? r.synced_at : m), rows[0].synced_at),
  )
  return rows.length
}

async function pushTable(remote: Remote, name: LocalName): Promise<number> {
  const table = db[name] as unknown as EntityTable<Row, 'id'>
  const dirty = await table.where('dirty').equals(1).toArray()
  if (!dirty.length) return 0
  await remote.push(
    SYNCED_TABLES[name],
    dirty.map((r) => toRemote(r, name)),
  )
  // On ne nettoie que les lignes qui n'ont pas été modifiées pendant l'envoi.
  await db.transaction('rw', table, async () => {
    for (const row of dirty) {
      const now = await table.get(row.id)
      if (now && now.updatedAt === row.updatedAt) await table.put({ ...now, dirty: 0 })
    }
  })
  return dirty.length
}

export type SyncResult = { pulled: number; pushed: number }

/** Une synchro complète : récupérer et fusionner, puis envoyer. */
export async function syncOnce(remote: Remote, userId: string): Promise<SyncResult> {
  // Les tables sont indépendantes : une requête par table, toutes en même temps (un aller-retour au lieu de huit).
  const names = Object.keys(SYNCED_TABLES) as LocalName[]
  const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)
  const pulled = sum(await Promise.all(names.map((name) => pullTable(remote, userId, name))))
  const pushed = sum(await Promise.all(names.map((name) => pushTable(remote, name))))
  return { pulled, pushed }
}

/** Y a-t-il des données locales (pour la question « fusionner ou remplacer » à la première connexion) ? */
export async function hasLocalData(): Promise<boolean> {
  for (const name of Object.keys(SYNCED_TABLES) as LocalName[]) {
    if (name === 'settings') continue
    if ((await (db[name] as unknown as EntityTable<Row, 'id'>).count()) > 0) return true
  }
  return false
}

/**
 * « Remplacer » à la première connexion : on vide les données synchronisées de cet appareil avant de récupérer
 * le compte. Les réglages sont gardés mais marqués « les plus anciens » : ceux du compte les remplaceront.
 */
export async function clearLocalData(userId: string): Promise<void> {
  for (const name of Object.keys(SYNCED_TABLES) as LocalName[]) {
    const table = db[name] as unknown as EntityTable<Row, 'id'>
    if (name === 'settings') await table.toCollection().modify({ updatedAt: 0, dirty: 0 } as Partial<Row>)
    else await table.clear()
    writeLocal(cursorKey(userId, SYNCED_TABLES[name]), '')
  }
}

/** « Fusionner » : tout ce qui est sur l'appareil sera envoyé (et fusionné avec le compte). */
export async function markAllDirty(): Promise<void> {
  for (const name of Object.keys(SYNCED_TABLES) as LocalName[]) {
    const table = db[name] as unknown as EntityTable<Row, 'id'>
    await table.toCollection().modify({ dirty: 1 } as Partial<Row>)
  }
}
