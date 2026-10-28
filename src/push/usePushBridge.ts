import { useEffect } from 'react'

import { usePreferences } from '@/app/PreferencesProvider'

import { updatePushLang } from './subscribe'

/** Quand la langue de l'app change, les prochaines notifications suivent. */
export function usePushBridge(): void {
  const { lang } = usePreferences()
  useEffect(() => {
    void updatePushLang(lang).catch(() => {})
  }, [lang])
}
