import type { Settings } from '@/db/types'
import { resolvePlace } from '@/features/prayer/cities'

import { callServer, serverEnabled } from './server'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export type PushSupport = 'ok' | 'ios-not-installed' | 'unsupported' | 'disabled'

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Les notifications marchent-elles ici ? Sur iPhone, seulement une fois l'app ajoutée à l'écran d'accueil. */
export function pushSupport(): PushSupport {
  if (!VAPID_PUBLIC_KEY || !serverEnabled) return 'disabled'
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

/**
 * Ce que le serveur reçoit pour calculer les horaires : position arrondie (~1 km, arrondie aussi côté serveur),
 * fuseau, langue et choix de notifications. Ni nom, ni e-mail, ni autre donnée de l'app.
 */
export function pushPayload(sub: PushSubscriptionJSON & { endpoint: string }, lang: 'fr' | 'ar', settings: Settings) {
  const place = resolvePlace(settings)
  return {
    p_endpoint: sub.endpoint,
    p_p256dh: sub.keys!.p256dh,
    p_auth: sub.keys!.auth,
    p_lang: lang,
    p_lat: Math.round(place.lat * 100) / 100,
    p_lng: Math.round(place.lng * 100) / 100,
    p_timezone: place.timezone,
    p_notif: settings.notif,
    p_hijri_adj: settings.hijriAdj,
  }
}

async function save(sub: PushSubscription, lang: 'fr' | 'ar', settings: Settings): Promise<void> {
  await callServer('save_push_subscription', pushPayload({ ...sub.toJSON(), endpoint: sub.endpoint }, lang, settings))
}

/**
 * Active les notifications : la permission est demandée ici, au clic, jamais au chargement.
 * Renvoie false si la personne refuse.
 */
export async function enablePush(lang: 'fr' | 'ar', settings: Settings): Promise<boolean> {
  if (pushSupport() !== 'ok') return false
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false
  const reg = await navigator.serviceWorker.ready
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY!) }))
  await save(sub, lang, { ...settings, notif: { ...settings.notif, enabled: true } })
  return true
}

export async function disablePush(): Promise<void> {
  const sub = await currentSubscription()
  if (!sub) return
  await callServer('delete_push_subscription', { p_endpoint: sub.endpoint })
  await sub.unsubscribe()
}

/** Lieu, langue ou choix changés : l'abonnement existant est mis à jour sur le serveur. */
export async function updatePush(lang: 'fr' | 'ar', settings: Settings): Promise<void> {
  if (!settings.notif.enabled || pushSupport() !== 'ok') return
  const sub = await currentSubscription()
  if (sub) await save(sub, lang, settings)
}
