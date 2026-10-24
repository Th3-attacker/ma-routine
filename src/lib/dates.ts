import type { Lang } from '@/app/device-prefs'

/** Fuseau par défaut tant qu'aucune ville n'est choisie (Réglages, phase 1A). */
export const DEFAULT_TIMEZONE = 'Africa/Nouakchott'

/** Locale des dates : mois mauritaniens en arabe, chiffres latins dans les deux langues. */
export function dateLocale(lang: Lang): string {
  return lang === 'ar' ? 'ar-MR-u-nu-latn' : 'fr-FR'
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1)

/** « Vendredi 23 octobre » / « الجمعة 23 أكتوبر », dans le fuseau donné. */
export function formatLongDate(date: Date, lang: Lang, timeZone: string = DEFAULT_TIMEZONE): string {
  const f = new Intl.DateTimeFormat(dateLocale(lang), { weekday: 'long', day: 'numeric', month: 'long', timeZone })
  return capitalize(f.format(date))
}

/** Clé « YYYY-MM-DD » du jour, dans le fuseau donné. */
export function dayKey(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(date)
}

// ── Clés de jour 'YYYY-MM-DD' (dates civiles, sans fuseau) ──

const pad2 = (n: number) => String(n).padStart(2, '0')

export function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { y, m, d }
}

export function keyOf(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

/** Date UTC à midi pour une clé : sûre pour les calculs de jours et de calendrier. */
export function keyToUtcNoon(key: string): Date {
  const { y, m, d } = parseKey(key)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

export function addDays(key: string, n: number): string {
  const t = keyToUtcNoon(key)
  t.setUTCDate(t.getUTCDate() + n)
  return keyOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** Jour de la semaine : 0 = dimanche … 5 = vendredi. */
export function weekday(key: string): number {
  return keyToUtcNoon(key).getUTCDay()
}

export function daysBetween(from: string, to: string): number {
  return Math.round((keyToUtcNoon(to).getTime() - keyToUtcNoon(from).getTime()) / 86_400_000)
}

/** Les n derniers jours jusqu'à `key` inclus, du plus ancien au plus récent. */
export function lastDays(key: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(key, i - n + 1))
}

/** « 18:36 » dans le fuseau donné. */
export function formatTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(
    date,
  )
}

/** « 24 oct. » / « 24 أكتوبر » pour une clé de jour. */
export function formatShortDate(key: string, lang: Lang): string {
  const opts: Intl.DateTimeFormatOptions =
    lang === 'ar'
      ? { day: 'numeric', month: 'long', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', timeZone: 'UTC' }
  return new Intl.DateTimeFormat(dateLocale(lang), opts).format(keyToUtcNoon(key))
}

/** Une durée en minutes : « 1 h 05 » / « 1 س 05 د », « 12 min » / « 12 دقيقة ». */
export function formatDuration(ms: number, lang: Lang): string {
  const mins = Math.max(0, Math.round(ms / 60_000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (lang === 'ar') return h ? `${h} س ${pad2(m)} د` : `${m} دقيقة`
  return h ? `${h} h ${pad2(m)}` : `${m} min`
}

/** Attente avant de réessayer : « 25 s » / « 25 ث », ou « 4 min » au-delà d'une minute. */
export function formatWait(ms: number, lang: Lang): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (s >= 60) return formatDuration(s * 1000, lang)
  return lang === 'ar' ? `${s} ث` : `${s} s`
}
