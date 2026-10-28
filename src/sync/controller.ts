import Dexie from 'dexie'
import { useEffect, useSyncExternalStore } from 'react'

import { syncOnce, type Remote } from './engine'
import { supabaseRemote } from './remote'

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error'
export type SyncState = { status: SyncStatus; lastSyncAt: number | null }

let state: SyncState = { status: 'local', lastSyncAt: null }
const listeners = new Set<() => void>()
const set = (s: Partial<SyncState>) => {
  state = { ...state, ...s }
  for (const l of listeners) l()
}

/** État de la synchro (point de l'en-tête, Réglages → Compte). */
export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

let userId: string | null = null
let running: Promise<void> | null = null
let again = false
const remote: Remote = supabaseRemote

/** Lance une synchro (une seule à la fois ; une demande pendant une synchro en relance une après). */
export function syncNow(): Promise<void> {
  if (!userId || !navigator.onLine) return Promise.resolve()
  if (running) {
    again = true
    return running
  }
  const uid = userId
  set({ status: 'syncing' })
  running = syncOnce(remote, uid)
    .then(() => set({ status: 'synced', lastSyncAt: Date.now() }))
    .catch(() => set({ status: 'error' }))
    .finally(() => {
      running = null
      if (again && userId) {
        again = false
        void syncNow()
      }
    })
  return running
}

let timer: ReturnType<typeof setTimeout> | undefined
/** Après une modification : synchro 2 s plus tard (plusieurs modifications rapprochées n'en font qu'une). */
function scheduleSync(): void {
  if (!userId || running) return
  clearTimeout(timer)
  timer = setTimeout(() => void syncNow(), 2000)
}

/**
 * Branche la synchro sur le compte connecté. Déclencheurs : démarrage, retour du réseau, page de nouveau visible,
 * 2 s après une modification locale, et le bouton « Synchroniser maintenant ».
 * `ready` est faux tant que la question « fusionner ou remplacer » de la première connexion n'a pas de réponse.
 */
export function useSyncController(sessionUserId: string | null, ready: boolean): void {
  useEffect(() => {
    userId = ready ? sessionUserId : null
    if (!userId) {
      set({ status: 'local' })
      return
    }
    void syncNow()
    const onOnline = () => void syncNow()
    const onVisible = () => document.visibilityState === 'visible' && void syncNow()
    // Toute écriture dans la base locale (y compris par la synchro elle-même : elle n'envoie alors rien).
    const onChange = () => scheduleSync()
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVisible)
    Dexie.on('storagemutated', onChange)
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVisible)
      Dexie.on('storagemutated').unsubscribe(onChange)
      clearTimeout(timer)
      userId = null
    }
  }, [sessionUserId, ready])
}
