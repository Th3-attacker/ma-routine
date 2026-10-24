import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { PrayerOrSunrise } from '@/db/types'
import { weekday } from '@/lib/dates'

/** Nom d'une prière dans la langue choisie ; le vendredi, Dhohr devient Joumou‘a. */
export function usePrayerName(): (p: PrayerOrSunrise, dayKey?: string) => string {
  const { t } = useTranslation()
  return useCallback(
    (p, dayKey) => (p === 'dhuhr' && dayKey && weekday(dayKey) === 5 ? t('prayers.jumua') : t(`prayers.${p}`)),
    [t],
  )
}

/** Nom arabe d'une prière, quelle que soit la langue (grand titre du ciel). */
export const PRAYER_AR: Record<PrayerOrSunrise | 'jumua', string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  jumua: 'الجمعة',
}
