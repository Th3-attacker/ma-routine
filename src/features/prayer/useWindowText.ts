import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { formatDuration } from '@/lib/dates'

import { usePrayerName } from './usePrayerName'
import type { PrayerWindow } from './window'

/** Texte du temps restant : « Asr en cours · encore 1 h 05 avant Maghrib », Duha, Nuit, dernier tiers. */
export function useWindowText(): (w: PrayerWindow, dayKey: string) => string {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const prayerName = usePrayerName()
  return useCallback(
    (w, dayKey) => {
      if (w.kind === 'duha' || w.kind === 'night' || w.kind === 'last') return t(`window.${w.kind}`)
      return t('window.current', {
        name: prayerName(w.kind, dayKey),
        d: formatDuration(w.leftMs, lang),
        end: t(`window.end.${w.endKind}`),
      })
    },
    [t, lang, prayerName],
  )
}

/** « dans 1 h 05 » / « بعد 1 س 05 د », ou « maintenant ». */
export function useCountdown(): (ms: number) => string {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  return useCallback(
    (ms) => (Math.round(ms / 60_000) < 1 ? t('time.now') : t('time.in', { d: formatDuration(ms, lang) })),
    [t, lang],
  )
}
