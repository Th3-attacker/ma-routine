import type { Lang } from '@/app/device-prefs'
import { keyToUtcNoon } from '@/lib/dates'

export type HijriDate = { d: number; m: number; y: number }

const HIJRI_MONTHS: readonly { fr: string; ar: string }[] = [
  { fr: 'Mouharram', ar: 'محرم' },
  { fr: 'Safar', ar: 'صفر' },
  { fr: 'Rabi‘ al-awwal', ar: 'ربيع الأول' },
  { fr: 'Rabi‘ ath-thani', ar: 'ربيع الآخر' },
  { fr: 'Joumada al-oula', ar: 'جمادى الأولى' },
  { fr: 'Joumada ath-thania', ar: 'جمادى الآخرة' },
  { fr: 'Rajab', ar: 'رجب' },
  { fr: 'Cha‘bane', ar: 'شعبان' },
  { fr: 'Ramadan', ar: 'رمضان' },
  { fr: 'Chawwal', ar: 'شوال' },
  { fr: 'Dhou al-qi‘da', ar: 'ذو القعدة' },
  { fr: 'Dhou al-hijja', ar: 'ذو الحجة' },
]

let formatter: Intl.DateTimeFormat | null | undefined

function hijriFormatter(): Intl.DateTimeFormat | null {
  if (formatter !== undefined) return formatter
  formatter = null
  for (const cal of ['islamic-umalqura', 'islamic-civil', 'islamic']) {
    try {
      const f = new Intl.DateTimeFormat(`en-u-ca-${cal}-nu-latn`, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
      if (f.resolvedOptions().calendar.startsWith('islamic')) {
        formatter = f
        break
      }
    } catch {
      // calendrier absent de ce navigateur : on essaie le suivant
    }
  }
  return formatter
}

/** Date hégirienne (Umm al-Qura) d'un jour 'YYYY-MM-DD', avec le décalage réglable de −2 à +2 jours. */
export function hijriDate(key: string, adj = 0): HijriDate | null {
  const f = hijriFormatter()
  if (!f) return null
  const date = new Date(keyToUtcNoon(key).getTime() + adj * 86_400_000)
  const parts: Record<string, string> = {}
  for (const p of f.formatToParts(date)) parts[p.type] = p.value
  const r = { d: parseInt(parts.day, 10), m: parseInt(parts.month, 10), y: parseInt(parts.year, 10) }
  return Number.isNaN(r.d) || Number.isNaN(r.y) || r.m < 1 || r.m > 12 ? null : r
}

/** « 12 Joumada al-oula 1448 » / « 12 جمادى الأولى 1448 هـ ». */
export function formatHijri(h: HijriDate, lang: Lang): string {
  const month = HIJRI_MONTHS[h.m - 1]
  return lang === 'ar' ? `${h.d} ${month.ar} ${h.y} هـ` : `${h.d} ${month.fr} ${h.y}`
}
