import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export type SyncState = 'cloud' | 'local' | 'loading'

const dot: Record<SyncState, string> = {
  cloud: 'bg-ok',
  local: 'bg-gold',
  loading: 'bg-ink-3',
}

/** Point de synchro de l'en-tête. Tant que le compte n'existe pas (phase 2), les données restent sur l'appareil. */
export function SyncDot({ state = 'local' }: { state?: SyncState }) {
  const { t } = useTranslation()
  return (
    <span className="flex items-center px-1" role="status">
      <i className={cn('block size-2 rounded-full', dot[state])} aria-hidden="true" />
      <span className="sr-only">{t(`sync.${state}`)}</span>
    </span>
  )
}
