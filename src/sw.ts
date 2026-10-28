/// <reference lib="webworker" />
// Service worker de Sama Jàmm : fonctionnement hors connexion (précache Workbox) et notifications d'adhan.
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { createPartialResponse } from 'workbox-range-requests'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL(`${import.meta.env.BASE_URL}index.html`)))

// Enregistrements des athkar : pas dans l'installation (trop lourds), gardés après la première écoute.
// Leur nom change avec leur contenu : un fichier gardé n'a jamais besoin d'être revérifié.
// Le lecteur audio demande des morceaux du fichier (Range) : on télécharge le fichier entier une fois, puis on
// découpe les morceaux depuis le cache.
registerRoute(
  ({ url }) => url.origin === self.location.origin && /\.(mp3|m4a|ogg)$/.test(url.pathname),
  async ({ request }) => {
    const cache = await caches.open('athkar-audio')
    let full = await cache.match(request.url)
    if (!full) {
      const res = await fetch(request.url)
      if (!res.ok) return res
      await cache.put(request.url, res.clone())
      full = res
    }
    return request.headers.has('range') ? createPartialResponse(request, full) : full
  },
)

// « Mettre à jour » dans l'app : la nouvelle version prend la main tout de suite.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})

type PushPayload = { kind: string; title: string; body: string; tag: string; lang?: string }

self.addEventListener('push', (event) => {
  const data = (event.data?.json() ?? {}) as PushPayload
  const lang = data.lang === 'ar' ? 'ar' : 'fr'
  event.waitUntil(
    (async () => {
      // Sur iPhone, une notification doit toujours être affichée (sinon l'abonnement peut être coupé).
      await self.registration.showNotification(data.title, {
        body: data.body,
        tag: data.tag,
        lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
        icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        badge: `${import.meta.env.BASE_URL}pwa-64x64.png`,
        data: { kind: data.kind },
      })
    })(),
  )
})

// Un toucher sur la notification ouvre l'app (ou la remet au premier plan).
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const existing = windows.find((w) => w.url.startsWith(self.registration.scope))
      if (existing) await existing.focus()
      else await self.clients.openWindow(self.registration.scope)
    })(),
  )
})
