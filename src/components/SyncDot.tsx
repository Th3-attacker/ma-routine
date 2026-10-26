import { useTranslation } from 'react-i18next'

import { useSession } from '@/sync/auth'
import { useSyncState } from '@/sync/controller'
import { cn } from '@/lib/utils'

/** Point de synchro de l'en-tête : vert (synchronisé), doré (sur cet appareil), gris (en cours). */
export function SyncDot() {
  const { t } = useTranslation()
  const { session } = useSession()
  const sync = useSyncState()
  const state = !session
    ? 'local'
    : sync.status === 'syncing'
      ? 'loading'
      : sync.status === 'synced'
        ? 'cloud'
        : sync.status === 'error'
          ? 'error'
          : 'local'
  const color = { cloud: 'bg-ok', local: 'bg-gold', loading: 'bg-ink-3', error: 'bg-bad' }[state]
  return (
    <span className="flex items-center px-1" role="status">
      <i
        className={cn('block size-2 rounded-full', color, state === 'loading' && 'animate-pulse')}
        aria-hidden="true"
      />
      <span className="sr-only">{t(`sync.${state}`)}</span>
    </span>
  )
}
