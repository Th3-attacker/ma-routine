import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { Settings } from '@/db/types'
import { dayKey } from '@/lib/dates'

import { adhanPlayer, adhanSoundOn, markAdhan, nextAdhan } from './adhan'
import { usePrayerName } from './usePrayerName'
import { useNow, useToday } from './useToday'

/**
 * À l'heure de chaque prière, si l'app est à l'écran : l'adhan se joue (préférence de l'appareil), une fois par
 * prière et par jour. Si le navigateur bloque le son (aucun toucher depuis l'ouverture), un message propose de
 * l'écouter.
 */
function useAdhanAtPrayerTime(settings: Settings): void {
  const { t } = useTranslation()
  const prayerName = usePrayerName()
  const now = useNow()
  const { place, today, tomorrow } = useToday(settings, now)

  useEffect(() => {
    const next = nextAdhan(new Date(), today, tomorrow)
    const wait = next.at.getTime() - Date.now()
    // Au-delà de 6 h, le minuteur est recréé plus tard (useNow rafraîchit toutes les 30 s).
    if (wait > 6 * 3_600_000) return
    const timer = setTimeout(
      () => {
        if (document.visibilityState !== 'visible' || !adhanSoundOn()) return
        if (!markAdhan(dayKey(next.at, place.timezone), next.prayer)) return
        const name = prayerName(next.prayer, dayKey(next.at, place.timezone))
        adhanPlayer.play().then(
          () =>
            toast(t('adhan.now', { name }), { action: { label: t('adhan.stop'), onClick: () => adhanPlayer.stop() } }),
          () =>
            toast(t('adhan.now', { name }), {
              action: { label: t('adhan.listen'), onClick: () => void adhanPlayer.play() },
            }),
        )
      },
      Math.max(0, wait),
    )
    return () => clearTimeout(timer)
  }, [today, tomorrow, place.timezone, prayerName, t])
}

/** Composant sans affichage : branche l'adhan à l'heure de la prière quand les réglages sont chargés. */
export function AdhanAlarm({ settings }: { settings: Settings }): null {
  useAdhanAtPrayerTime(settings)
  return null
}
