import { useEffect, useState } from 'react'

import { usePreferences } from '@/app/PreferencesProvider'
import type { Prayer, Settings } from '@/db/types'
import { resolvePlace } from '@/features/prayer/cities'
import { prayerTimesFor } from '@/features/prayer/times'
import { dayKey, formatTime } from '@/lib/dates'

import { callBanner, callLangs, callPhrase } from './phrase'
import { dueCall, logCall, readCallLog } from './schedule'
import { chime, primeAudio } from './chime'
import { speak } from './speech'

export type CallAlert = { prayer: Prayer; text: string; at: number }

/**
 * Vérifie toutes les 15 s si l'appel d'une prière est dû ; si oui, dit la phrase (si la voix est activée)
 * et renvoie le bandeau à afficher. Une seule fois par prière et par jour.
 */
export function useCallAlarm(settings: Settings | undefined): [CallAlert | null, () => void] {
  const { lang } = usePreferences()
  const [alert, setAlert] = useState<CallAlert | null>(null)

  useEffect(() => {
    if (!settings?.call.enabled) return
    const check = () => {
      const now = new Date()
      const place = resolvePlace(settings)
      const key = dayKey(now, place.timezone)
      const times = prayerTimesFor(key, place, settings)
      const prayer = dueCall(now, times, settings.call, readCallLog(key))
      if (!prayer) return
      logCall(key, prayer)
      const time = formatTime(times[prayer], place.timezone)
      setAlert({ prayer, text: callBanner(lang, settings, prayer, key, time), at: now.getTime() })
      if (settings.call.voice) {
        const spoken = speak(
          callLangs(settings.call.lang, lang).map((l) => ({ text: callPhrase(l, settings), lang: l })),
        )
        // Téléphone sans voix : un carillon et une vibration accompagnent le bandeau.
        if (!spoken) chime()
      }
    }
    check()
    const id = setInterval(check, 15_000)
    return () => clearInterval(id)
  }, [settings, lang])

  // Le son n'est permis qu'après un geste : on le prépare au premier toucher.
  useEffect(() => {
    document.addEventListener('pointerdown', primeAudio, { once: true })
    return () => document.removeEventListener('pointerdown', primeAudio)
  }, [])

  useEffect(() => {
    if (!alert) return
    const id = setTimeout(() => setAlert(null), 2 * 60_000)
    return () => clearTimeout(id)
  }, [alert])

  return [alert, () => setAlert(null)]
}
