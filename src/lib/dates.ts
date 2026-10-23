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
