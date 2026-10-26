// Fonction Edge (Deno) appelée chaque minute par Supabase Cron.
// Pour chaque compte abonné : horaires du jour (adhan-js, réglages du compte), notifications dues pendant la minute,
// journal push_log contre les doublons, suppression des abonnements morts (404 / 410).
// Secrets : VAPID_KEYS (paire JWK), VAPID_SUBJECT, CRON_SECRET. SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis.

import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { CalculationMethod, Coordinates, Madhab, PrayerTimes, type CalculationParameters } from 'npm:adhan@4.4.6'
import * as webpush from 'jsr:@negrel/webpush@0.5.0'

import { dueNotifications, type CallSettings, type NotifSettings, type Times, type UserContext } from './logic.ts'

type Settings = {
  name?: string
  nameAr?: string
  method?: string
  asrSchool?: 'standard' | 'hanafi'
  tune?: Record<string, number>
  hijriAdj?: number
  notif?: NotifSettings
  call?: CallSettings
  place?: { lat: number; lng: number; timezone: string }
}
type Sub = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; lang: string }

function methodParams(id = 'mwl'): CalculationParameters {
  switch (id) {
    case 'uqa':
      return CalculationMethod.UmmAlQura()
    case 'egy':
      return CalculationMethod.Egyptian()
    case 'kar':
      return CalculationMethod.Karachi()
    case 'isna':
      return CalculationMethod.NorthAmerica()
    case 'uoif': {
      const p = CalculationMethod.Other()
      p.fajrAngle = 12
      p.ishaAngle = 12
      return p
    }
    default:
      return CalculationMethod.MuslimWorldLeague()
  }
}

/** Jour 'YYYY-MM-DD' et jour de la semaine dans le fuseau donné. */
function localDay(now: Date, timeZone: string): { key: string; weekday: number } {
  const key = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(
    now,
  )
  const [y, m, d] = key.split('-').map(Number)
  return { key, weekday: new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() }
}

function timesFor(key: string, s: Settings): Times {
  const p = methodParams(s.method)
  p.madhab = s.asrSchool === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  p.adjustments = { ...p.adjustments, ...(s.tune ?? {}) }
  const [y, m, d] = key.split('-').map(Number)
  const pt = new PrayerTimes(new Coordinates(s.place!.lat, s.place!.lng), new Date(y, m - 1, d), p)
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

  const { data: subs, error } = await db.from('push_subscriptions').select('id,user_id,endpoint,p256dh,auth,lang')
  if (error) return new Response(error.message, { status: 500 })
  const byUser = new Map<string, Sub[]>()
  for (const s of (subs ?? []) as Sub[]) byUser.set(s.user_id, [...(byUser.get(s.user_id) ?? []), s])
  if (!byUser.size) return Response.json({ users: 0, sent: 0 })

  const { data: rows } = await db
    .from('settings')
    .select('user_id,data')
    .eq('id', 'me')
    .in('user_id', [...byUser.keys()])
  const now = new Date()
  let sent = 0
  let removed = 0

  for (const row of rows ?? []) {
    const s = row.data as Settings
    if (!s.place || !s.notif || !s.call) continue
    const userSubs = byUser.get(row.user_id) ?? []
    const { key, weekday } = localDay(now, s.place.timezone)
    const times = timesFor(key, s)
    const ramadan = isRamadan(key, s.hijriAdj ?? 0)
    // Le journal est commun au compte : une notification part une seule fois, vers tous ses appareils.
    const langs = [...new Set(userSubs.map((u) => (u.lang === 'ar' ? 'ar' : 'fr')))] as ('fr' | 'ar')[]
    const ctx = (lang: 'fr' | 'ar'): UserContext => ({
      name: s.name ?? '',
      nameAr: s.nameAr ?? '',
      timezone: s.place!.timezone,
      notif: s.notif!,
      call: s.call!,
      weekday,
      ramadan,
      lang,
    })
    const due = dueNotifications(now, times, ctx(langs[0] ?? 'fr'))
    for (const n of due) {
      const { data: logged } = await db
        .from('push_log')
        .upsert(
          { user_id: row.user_id, day: key, kind: n.kind },
          { onConflict: 'user_id,day,kind', ignoreDuplicates: true },
        )
        .select()
      if (!logged?.length) continue // déjà envoyée
      for (const sub of userSubs) {
        const local =
          dueNotifications(now, times, ctx(sub.lang === 'ar' ? 'ar' : 'fr')).find((x) => x.kind === n.kind) ?? n
        try {
          await server
            .subscribe({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } })
            .pushTextMessage(JSON.stringify({ ...local, lang: sub.lang }), {
              ttl: 600,
              urgency: webpush.Urgency.High,
              topic: local.tag.slice(0, 32),
            })
          sent++
        } catch (e) {
          // 404 ou 410 : l'abonnement n'existe plus (app désinstallée, notifications coupées).
          if (e instanceof webpush.PushMessageError && (e.isGone() || e.response.status === 404)) {
            await db.from('push_subscriptions').delete().eq('id', sub.id)
            removed++
          } else {
            console.error('push', sub.endpoint.slice(0, 40), e)
          }
        }
      }
    }
  }
  return Response.json({ users: byUser.size, sent, removed })
})
