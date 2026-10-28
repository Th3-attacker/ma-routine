import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getSupabase, hasStoredSession, whenSupabaseLoaded } from './supabase'

const SESSION_KEY = ['auth', 'session'] as const

/** Session du compte (null : pas connecté). Mise à jour à chaque connexion / déconnexion. */
export function useSession(): { session: Session | null; loading: boolean } {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      // Pas de session enregistrée : pas besoin de charger Supabase pour savoir qu'on n'est pas connecté.
      if (!hasStoredSession()) return null
      const supabase = await getSupabase()
      return supabase ? (await supabase.auth.getSession()).data.session : null
    },
    staleTime: Infinity,
  })
  useEffect(() => {
    let unsubscribe = () => {}
    const stop = whenSupabaseLoaded((supabase) => {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => qc.setQueryData(SESSION_KEY, session))
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      stop()
      unsubscribe()
    }
  }, [qc])
  return { session: q.data ?? null, loading: q.isLoading }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Envoie un code à 6 chiffres par e-mail (pas de lien magique : sur iPhone, il s'ouvrirait hors de l'app). */
export async function sendCode(email: string): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('disabled')
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
  if (error) throw error
}

export async function verifyCode(email: string, code: string): Promise<Session> {
  const supabase = await getSupabase()
  if (!supabase) throw new Error('disabled')
  const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
  if (error || !data.session) throw error ?? new Error('no session')
  return data.session
}

export async function signOut(): Promise<void> {
  await (await getSupabase())?.auth.signOut()
}

/** Traduit une erreur Supabase en message clair. */
export function authErrorKey(
  e: unknown,
): 'errors.network' | 'errors.rateLimit' | 'errors.otpWrong' | 'errors.emailSend' {
  const err = e as { status?: number; message?: string; name?: string } | null
  if (!navigator.onLine) return 'errors.network'
  if (err?.status === 429 || /rate limit/i.test(err?.message ?? '')) return 'errors.rateLimit'
  // Le serveur répond, mais n'arrive pas à envoyer l'e-mail (réglages SMTP).
  if ((err?.status ?? 0) >= 500 || /sending .*email/i.test(err?.message ?? '')) return 'errors.emailSend'
  // Pas de réponse du serveur : réseau coupé ou adresse injoignable.
  if (err?.name === 'AuthRetryableFetchError' || err?.status === 0) return 'errors.network'
  return 'errors.otpWrong'
}
