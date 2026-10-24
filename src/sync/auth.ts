import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { supabase } from './supabase'

const SESSION_KEY = ['auth', 'session'] as const

/** Session du compte (null : pas connecté). Mise à jour à chaque connexion / déconnexion. */
export function useSession(): { session: Session | null; loading: boolean } {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: SESSION_KEY,
    queryFn: async () => (supabase ? (await supabase.auth.getSession()).data.session : null),
    staleTime: Infinity,
  })
  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, session) => qc.setQueryData(SESSION_KEY, session))
    return () => data.subscription.unsubscribe()
  }, [qc])
  return { session: q.data ?? null, loading: q.isLoading }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Envoie un code à 6 chiffres par e-mail (pas de lien magique : sur iPhone, il s'ouvrirait hors de l'app). */
export async function sendCode(email: string): Promise<void> {
  if (!supabase) throw new Error('disabled')
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
  if (error) throw error
}

export async function verifyCode(email: string, code: string): Promise<Session> {
  if (!supabase) throw new Error('disabled')
  const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' })
  if (error || !data.session) throw error ?? new Error('no session')
  return data.session
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}

/** Traduit une erreur Supabase en message clair. */
export function authErrorKey(e: unknown): 'errors.network' | 'errors.rateLimit' | 'errors.otpWrong' {
  const err = e as { status?: number; message?: string; name?: string }
  if (!navigator.onLine || err?.name === 'AuthRetryableFetchError') return 'errors.network'
  if (err?.status === 429 || /rate limit/i.test(err?.message ?? '')) return 'errors.rateLimit'
  return 'errors.otpWrong'
}
