import type { TFunction } from 'i18next'

/**
 * Traduit une erreur de validation : le message est une clé i18n, avec ses paramètres en query string
 * (« errors.range?min=1&max=2000 »). Accepte aussi un objet { message } (issue zod).
 */
export function translateError(t: TFunction, error: unknown): string {
  const msg = typeof error === 'string' ? error : (error as { message?: string } | null)?.message
  if (!msg) return ''
  const [key, query] = msg.split('?')
  const params = Object.fromEntries(new URLSearchParams(query ?? ''))
  return String(t(key as never, params as never))
}
