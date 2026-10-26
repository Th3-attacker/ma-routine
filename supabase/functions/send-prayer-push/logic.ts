// Logique pure de la fonction send-prayer-push (aucun import : testée par Vitest, exécutée par Deno).
// Elle décide quelles notifications envoyer pendant la minute en cours, pour un utilisateur.

export type Prayer = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export const PRAYERS: readonly Prayer[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export type Times = Record<Prayer | 'sunrise', Date>

export type NotifSettings = {
  enabled: boolean
  prayers: Record<Prayer, boolean>
  minutesBefore: number
  fridayKahf: boolean
  athkarMatin: boolean
  athkarSoir: boolean
  suhur: boolean
  iftar: boolean
}

export type CallSettings = {
  enabled: boolean
  minutesBefore: number
  prayers: Record<Prayer, boolean>
  lang: 'app' | 'fr' | 'ar' | 'both'
  voice: boolean
}

export type UserContext = {
  name: string
  nameAr: string
  timezone: string
  notif: NotifSettings
  call: CallSettings
  /** Jour de la semaine dans le fuseau de l'utilisateur (5 = vendredi). */
  weekday: number
  ramadan: boolean
  lang: 'fr' | 'ar'
}

export type Kind = `adhan:${Prayer}` | `call:${Prayer}` | 'kahf' | 'athkar:matin' | 'athkar:soir' | 'suhur' | 'iftar'

export type Notification = { kind: Kind; title: string; body: string; tag: string; speak?: string }

const MIN = 60_000

const NAMES: Record<'fr' | 'ar', Record<Prayer | 'jumua', string>> = {
  fr: { fajr: 'Fajr', dhuhr: 'Dhohr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Icha', jumua: 'Joumou‘a' },
  ar: { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء', jumua: 'الجمعة' },
}

export function hhmm(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(d)
}

/** Même minute (heure ramenée à la minute). */
export function sameMinute(a: Date, b: Date): boolean {
  return Math.floor(a.getTime() / MIN) === Math.floor(b.getTime() / MIN)
}

/** Heure locale « HH:MM » d'un instant → instant du même jour à hh:mm, dans le fuseau (pour le rappel de 9 h). */
export function atLocalTime(reference: Date, timeZone: string, hour: number, minute = 0): Date {
  const [h, m] = hhmm(reference, timeZone).split(':').map(Number)
  const diffMin = hour * 60 + minute - (h * 60 + m)
  return new Date(Math.floor(reference.getTime() / MIN) * MIN + diffMin * MIN)
}

function prayerLabel(p: Prayer, ctx: UserContext, lang: 'fr' | 'ar'): string {
  return p === 'dhuhr' && ctx.weekday === 5 ? NAMES[lang].jumua : NAMES[lang][p]
}

const callName = (ctx: UserContext, lang: 'fr' | 'ar') =>
  lang === 'ar' ? ctx.nameAr.trim() || ctx.name.trim() : ctx.name.trim()

/** « Elhadj, la prière » / « الحاج، الصلاة ». */
export function callPhrase(ctx: UserContext, lang: 'fr' | 'ar'): string {
  const n = callName(ctx, lang)
  return lang === 'ar' ? `${n}، الصلاة` : `${n}, la prière`
}

const TEXT = {
  fr: {
    adhanBody: (name: string) => `C’est l’heure de ${name}.`,
    adhanSoon: (name: string, m: number) => `${name} dans ${m} min.`,
    callBody: (name: string, time: string, m: number) => `${name} à ${time} · dans ${m} min`,
    kahf: ['Jour de Joumou‘a', 'Pense à lire la sourate Al-Kahf aujourd’hui.'],
    matin: ['Athkar du matin', 'C’est le moment des athkar du matin.'],
    soir: ['Athkar du soir', 'C’est le moment des athkar du soir.'],
    suhur: (time: string) => ['Suhûr', `Le suhûr se termine à ${time}.`],
    iftar: ['Iftar', 'C’est l’heure de rompre le jeûne. Allahumma laka sumtu…'],
  },
  ar: {
    adhanBody: (name: string) => `حان وقت صلاة ${name}.`,
    adhanSoon: (name: string, m: number) => `${name} بعد ${m} دقيقة.`,
    callBody: (name: string, time: string, m: number) => `${name} ${time} · بعد ${m} دقائق`,
    kahf: ['يوم الجمعة', 'لا تنسَ قراءة سورة الكهف اليوم.'],
    matin: ['أذكار الصباح', 'حان وقت أذكار الصباح.'],
    soir: ['أذكار المساء', 'حان وقت أذكار المساء.'],
    suhur: (time: string) => ['السحور', `ينتهي السحور عند ${time}.`],
    iftar: ['الإفطار', 'حان وقت الإفطار. اللهم لك صمت…'],
  },
} as const

/**
 * Notifications à envoyer pendant la minute `now`. L'appel personnel remplace l'alerte d'adhan de la même prière
 * quand les deux tombent à la même minute (une seule notification).
 */
export function dueNotifications(now: Date, t: Times, ctx: UserContext): Notification[] {
  const lang = ctx.lang
  const tx = TEXT[lang]
  const tz = ctx.timezone
  const out: Notification[] = []

  for (const p of PRAYERS) {
    const name = prayerLabel(p, ctx, lang)
    const time = hhmm(t[p], tz)
    const callAt = new Date(t[p].getTime() - Math.min(15, Math.max(1, ctx.call.minutesBefore)) * MIN)
    const adhanAt = new Date(t[p].getTime() - ctx.notif.minutesBefore * MIN)
    const callDue = ctx.call.enabled && ctx.call.prayers[p] && sameMinute(now, callAt)
    const adhanDue = ctx.notif.enabled && ctx.notif.prayers[p] && sameMinute(now, adhanAt)
    if (callDue) {
      out.push({
        kind: `call:${p}`,
        title: callPhrase(ctx, lang),
        body: tx.callBody(name, time, ctx.call.minutesBefore),
        tag: `call-${p}`,
        speak: ctx.call.voice ? callPhrase(ctx, lang) : undefined,
      })
    } else if (adhanDue) {
      out.push({
        kind: `adhan:${p}`,
        title: `${name} · ${time}`,
        body: ctx.notif.minutesBefore ? tx.adhanSoon(name, ctx.notif.minutesBefore) : tx.adhanBody(name),
        tag: `adhan-${p}`,
      })
    }
  }

  if (!ctx.notif.enabled) return out
  if (ctx.notif.fridayKahf && ctx.weekday === 5 && sameMinute(now, atLocalTime(now, tz, 9))) {
    out.push({ kind: 'kahf', title: tx.kahf[0], body: tx.kahf[1], tag: 'kahf' })
  }
  if (ctx.notif.athkarMatin && sameMinute(now, t.sunrise)) {
    out.push({ kind: 'athkar:matin', title: tx.matin[0], body: tx.matin[1], tag: 'athkar-matin' })
  }
  if (ctx.notif.athkarSoir && sameMinute(now, new Date(t.asr.getTime() + 30 * MIN))) {
    out.push({ kind: 'athkar:soir', title: tx.soir[0], body: tx.soir[1], tag: 'athkar-soir' })
  }
  if (ctx.ramadan && ctx.notif.suhur && sameMinute(now, new Date(t.fajr.getTime() - 45 * MIN))) {
    const [title, body] = tx.suhur(hhmm(t.fajr, tz))
    out.push({ kind: 'suhur', title, body, tag: 'suhur' })
  }
  if (ctx.ramadan && ctx.notif.iftar && sameMinute(now, t.maghrib)) {
    out.push({ kind: 'iftar', title: tx.iftar[0], body: tx.iftar[1], tag: 'iftar' })
  }
  return out
}
