import { accountsEnabled, getSupabase } from '@/sync/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export type PushSupport = 'ok' | 'ios-not-installed' | 'unsupported' | 'disabled'

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Les notifications marchent-elles ici ? Sur iPhone, seulement une fois l'app ajoutée à l'écran d'accueil. */
export function pushSupport(): PushSupport {
  if (!VAPID_PUBLIC_KEY || !accountsEnabled) return 'disabled'
  if (isIOS() && !isStandalone()) return 'ios-not-installed'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  return 'ok'
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4)
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.getRegistration()
  return (await reg?.pushManager.getSubscription()) ?? null
}

async function save(sub: PushSubscription, lang: 'fr' | 'ar'): Promise<void> {
  const json = sub.toJSON()
  const supabase = await getSupabase()
  if (!supabase) return
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: sub.endpoint,
      p256dh: json.keys!.p256dh,
      auth: json.keys!.auth,
      lang,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw error
}

/**
 * Active les notifications : la permission est demandée ici, au clic, jamais au chargement.
 * Renvoie false si la personne refuse.
 */
export async function enablePush(lang: 'fr' | 'ar'): Promise<boolean> {
  if (pushSupport() !== 'ok') return false
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY!) }))
  await save(sub, lang)
  return true
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) return
  await (await getSupabase())?.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  await sub.unsubscribe()
}

/** La langue de l'app change : les notifications suivent. */
export async function updatePushLang(lang: 'fr' | 'ar'): Promise<void> {
  const sub = await currentSubscription()
  if (sub && accountsEnabled) await save(sub, lang)
}
