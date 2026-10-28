import { useEffect } from 'react'

import { usePreferences } from '@/app/PreferencesProvider'
import type { Settings } from '@/db/types'

import { updatePush } from './subscribe'

/**
 * Garde l'abonnement aux notifications à jour sur le serveur : langue, lieu, décalage hégirien et choix de
 * notifications (le serveur n'a pas d'autre moyen de les connaître). Une seconde après le dernier changement.
 */
export function usePushBridge(settings: Settings | undefined): void {
  const { lang } = usePreferences()
  const key = settings
    ? JSON.stringify([lang, settings.cityId, settings.custom, settings.notif, settings.hijriAdj])
    : null
  useEffect(() => {
    if (!settings || !key) return
    const timer = setTimeout(() => void updatePush(lang, settings).catch(() => {}), 1000)
    return () => clearTimeout(timer)
    // Seulement quand ce qui part au serveur change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
