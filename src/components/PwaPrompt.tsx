import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Annonce que l'app marche hors connexion, et propose la mise à jour quand une nouvelle version est prête. */
export function PwaPrompt() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!offlineReady) return
    toast(t('pwa.offlineReady'))
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady, t])

  useEffect(() => {
    if (!needRefresh) return
    toast(t('pwa.needRefresh'), {
      duration: Infinity,
      action: { label: t('pwa.reload'), onClick: () => void updateServiceWorker(true) },
      onDismiss: () => setNeedRefresh(false),
    })
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t])

  return null
}
