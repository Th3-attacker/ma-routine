// Le seul échange avec le serveur : enregistrer ou retirer l'abonnement aux notifications d'adhan.
// Un simple appel HTTP aux fonctions SQL de Supabase (pas besoin de la bibliothèque Supabase, ni de compte).

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Serveur configuré pour cette version ; sinon l'app reste 100 % locale, sans notifications app fermée. */
export const serverEnabled = !!(url && key)

export async function callServer(fn: 'save_push_subscription' | 'delete_push_subscription', args: object) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: key!, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`${fn} : ${res.status}`)
}
