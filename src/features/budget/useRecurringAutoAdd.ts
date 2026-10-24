import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { Settings } from '@/db/types'
import { resolvePlace } from '@/features/prayer/cities'
import { useNow } from '@/features/prayer/useToday'
import { dayKey } from '@/lib/dates'

import { applyRecurring } from './recurring'

/** Ajoute les opérations récurrentes dues au démarrage, puis à chaque changement de jour (fuseau de la ville). */
export function useRecurringAutoAdd(settings: Settings | undefined): void {
  const { t } = useTranslation()
  const now = useNow(60_000)
  const today = settings ? dayKey(now, resolvePlace(settings).timezone) : null

  useEffect(() => {
    if (!today) return
    void applyRecurring(today).then((n) => {
      if (n > 0) toast(t('rec.added', { count: n }))
    })
  }, [today, t])
}
