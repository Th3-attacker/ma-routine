import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Le compte est disponible seulement si les clés du projet sont fournies ; sinon l'app reste 100 % locale. */
export const accountsEnabled = !!(url && key)

export const supabase: SupabaseClient | null = accountsEnabled
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'elhadj.auth' },
    })
  : null
