import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const STORAGE_KEY = 'elhadj.auth'

/** Le compte est disponible seulement si les clés du projet sont fournies ; sinon l'app reste 100 % locale. */
export const accountsEnabled = !!(url && key)

// La bibliothèque Supabase (~200 Ko) n'est chargée qu'au besoin : à la connexion, ou au démarrage si une
// session est déjà enregistrée sur l'appareil. L'app démarre ainsi plus vite pour tout le monde.
let client: Promise<SupabaseClient | null> | null = null
const onLoad = new Set<(c: SupabaseClient) => void>()

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!accountsEnabled) return Promise.resolve(null)
  client ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const c = createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: STORAGE_KEY },
    })
    for (const cb of onLoad) cb(c)
    return c
  })
  return client
}

/** Une session est-elle enregistrée sur cet appareil ? (sans charger Supabase) */
export function hasStoredSession(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

/** Appelle `cb` quand le client est chargé (tout de suite s'il l'est déjà). Renvoie de quoi se désabonner. */
export function whenSupabaseLoaded(cb: (c: SupabaseClient) => void): () => void {
  onLoad.add(cb)
  void client?.then((c) => c && onLoad.has(cb) && cb(c))
  return () => onLoad.delete(cb)
}
