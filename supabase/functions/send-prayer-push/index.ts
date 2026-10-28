// Fonction Edge (Deno) appelée chaque minute par Supabase Cron.
// Pour chaque abonnement (sans compte : position arrondie, fuseau, langue et choix enregistrés avec lui) :
// horaires du jour (adhan-js, Ligue islamique mondiale, Asr standard), notifications dues pendant la minute,
// journal push_log contre les doublons, suppression des abonnements morts (404 / 410).
// Secrets : VAPID_KEYS (paire JWK), VAPID_SUBJECT, CRON_SECRET. SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis.

import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'npm:adhan@4.4.6'
import * as webpush from 'jsr:@negrel/webpush@0.5.0'

import { dueNotifications, type NotifSettings, type Times } from './logic.ts'

type Sub = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  lang: string
  lat: number
  lng: number
  timezone: string
  notif: NotifSettings
  hijri_adj: number
}

/** Jour 'YYYY-MM-DD' et jour de la semaine dans le fuseau donné. */
function localDay(now: Date, timeZone: string): { key: string; weekday: number } {
  const key = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(
    now,
  )
  const [y, m, d] = key.split('-').map(Number)
  return { key, weekday: new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() }
}

function timesFor(key: string, lat: number, lng: number): Times {
  const p = CalculationMethod.MuslimWorldLeague()
  p.madhab = Madhab.Shafi
  const [y, m, d] = key.split('-').map(Number)
  const pt = new PrayerTimes(new Coordinates(lat, lng), new Date(y, m - 1, d), p)
  return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha }
}

function isRamadan(key: string, adj = 0): boolean {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12) + adj * 86_400_000)
  const month = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    month: 'numeric',
    timeZone: 'UTC',
  }).format(date)
  return Number(month) === 9
}

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
  const vapidKeys = await webpush.importVapidKeys(JSON.parse(Deno.env.get('VAPID_KEYS')!))
  const server = await webpush.ApplicationServer.new({
    contactInformation: Deno.env.get('VAPID_SUBJECT') ?? 'https://th3-attacker.github.io/ma-routine/',
    vapidKeys,
  })

  const { data, error } = await db
    .from('push_subscriptions')
    .select('id,endpoint,p256dh,auth,lang,lat,lng,timezone,notif,hijri_adj')
    .not('lat', 'is', null)
  if (error) return new Response(error.message, { status: 500 })
  const subs = (data ?? []) as Sub[]
  const now = new Date()
  let sent = 0
  let removed = 0

  for (const sub of subs) {
    if (!sub.notif?.enabled) continue
    const { key, weekday } = localDay(now, sub.timezone)
    const lang = sub.lang === 'ar' ? 'ar' : 'fr'
    const due = dueNotifications(now, timesFor(key, sub.lat, sub.lng), {
      timezone: sub.timezone,
      notif: sub.notif,
      weekday,
      ramadan: isRamadan(key, sub.hijri_adj),
      lang,
    })
    for (const n of due) {
      const { data: logged } = await db
        .from('push_log')
        .upsert({ sub_id: sub.id, day: key, kind: n.kind }, { onConflict: 'sub_id,day,kind', ignoreDuplicates: true })
        .select()
      if (!logged?.length) continue // déjà envoyée
      try {
        await server
          .subscribe({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } })
          .pushTextMessage(JSON.stringify({ ...n, lang }), {
            ttl: 600,
            urgency: webpush.Urgency.High,
            topic: n.tag.slice(0, 32),
          })
        sent++
      } catch (e) {
        // 404 ou 410 : l'abonnement n'existe plus (app désinstallée, notifications coupées).
        if (e instanceof webpush.PushMessageError && (e.isGone() || e.response.status === 404)) {
          await db.from('push_subscriptions').delete().eq('id', sub.id)
          removed++
          break
        }
        console.error('push', sub.endpoint.slice(0, 40), e)
      }
    }
  }
  return Response.json({ subscriptions: subs.length, sent, removed })
})
