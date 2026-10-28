import type { CallLang, Prayer } from '@/db/types'
import { PRAYER_AR } from '@/features/prayer/usePrayerName'
import { weekday } from '@/lib/dates'
import { arabicName } from '@/lib/names'

const PRAYER_FR: Record<Prayer | 'jumua', string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhohr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Icha',
  jumua: 'Joumou‘a',
}

type Names = { name: string; nameAr: string }

/** « Elhadj, la prière » / « الحاج، الصلاة » (prénom arabe, sinon prénom latin). */
export function callPhrase(lang: 'fr' | 'ar', n: Names): string {
  return lang === 'ar' ? `${arabicName(n.name, n.nameAr)}، الصلاة` : `${n.name.trim()}, la prière`
}

/** « Asr à 16:08 » / « العصر 16:08 » ; le vendredi, Dhohr devient Joumou‘a. */
export function prayerAt(lang: 'fr' | 'ar', prayer: Prayer, dayKey: string, time: string): string {
  const p = prayer === 'dhuhr' && weekday(dayKey) === 5 ? 'jumua' : prayer
  return lang === 'ar' ? `${PRAYER_AR[p]} ${time}` : `${PRAYER_FR[p]} à ${time}`
}

/** Texte du bandeau : « Elhadj, la prière · Asr à 16:08 ». */
export function callBanner(lang: 'fr' | 'ar', n: Names, prayer: Prayer, dayKey: string, time: string): string {
  return `${callPhrase(lang, n)} · ${prayerAt(lang, prayer, dayKey, time)}`
}

/** Langues dites à voix haute : celle de l'app, le français, l'arabe, ou les deux (français puis arabe). */
export function callLangs(setting: CallLang, appLang: 'fr' | 'ar'): ('fr' | 'ar')[] {
  if (setting === 'both') return ['fr', 'ar']
  if (setting === 'app') return [appLang]
  return [setting]
}
