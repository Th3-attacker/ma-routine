import { useEffect } from 'react'

import { usePreferences } from '@/app/PreferencesProvider'
import type { Prayer, Settings } from '@/db/types'
import { logCall, readCallLog } from '@/features/call/schedule'
import { chime } from '@/features/call/chime'
import { speak } from '@/features/call/speech'
import { resolvePlace } from '@/features/prayer/cities'
import { dayKey } from '@/lib/dates'

import { updatePushLang } from './subscribe'

/**
 * Lien entre l'app ouverte et les notifications :
 * - le service worker demande de dire l'appel à voix haute (si l'app ne l'a pas déjà dit elle-même) ;
 * - quand la langue de l'app change, les prochaines notifications suivent.
 */
export function usePushBridge(settings: Settings | undefined): void {
  const { lang } = usePreferences()

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !settings) return
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as { type?: string; kind?: string; text?: string; lang?: 'fr' | 'ar' } | null
      if (msg?.type !== 'elhadj-speak' || !msg.kind?.startsWith('call:') || !msg.text) return
      const prayer = msg.kind.slice(5) as Prayer
      const key = dayKey(new Date(), resolvePlace(settings).timezone)
      if (readCallLog(key).prayers.includes(prayer)) return
      logCall(key, prayer)
      if (!speak([{ text: msg.text, lang: msg.lang === 'ar' ? 'ar' : 'fr' }])) chime()
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [settings])

  useEffect(() => {
    void updatePushLang(lang).catch(() => {})
  }, [lang])
}
