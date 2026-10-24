import type { EntityTable } from 'dexie'

import type { SyncMeta } from './types'

type Row = SyncMeta & { id: string }

/** Identifiant court et unique (horodatage + aléa). */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** Enregistre une ligne (création ou modification), marquée à synchroniser. */
export async function saveRow<T extends Row>(
  table: EntityTable<T, 'id'>,
  row: Omit<T, keyof SyncMeta> & Partial<SyncMeta>,
): Promise<T> {
  const next = { ...row, updatedAt: Date.now(), dirty: 1, deleted: 0 } as T
  await table.put(next)
  return next
}

/** Modifie une ligne existante à partir de son état actuel. */
export async function updateRow<T extends Row>(
  table: EntityTable<T, 'id'>,
  id: string,
  change: (row: T) => Partial<Omit<T, 'id' | keyof SyncMeta>>,
): Promise<T | undefined> {
  const current = await table.get(id as never)
  if (!current || current.deleted) return undefined
  const next = { ...current, ...change(current), id, updatedAt: Date.now(), dirty: 1 } as T
  await table.put(next)
  return next
}

/** Suppression douce : la ligne reste pour que la suppression se synchronise (phase 2). */
export async function softDelete<T extends Row>(table: EntityTable<T, 'id'>, id: string): Promise<void> {
  const current = await table.get(id as never)
  if (current) await table.put({ ...current, deleted: 1, updatedAt: Date.now(), dirty: 1 })
}

/** Lignes non supprimées d'une table. */
export async function liveRows<T extends Row>(table: EntityTable<T, 'id'>): Promise<T[]> {
  return (await table.toArray()).filter((r) => !r.deleted)
}
