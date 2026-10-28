import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { Button } from '@/components/ui/button'
import type { Prayer, PrayerStatus } from '@/db/types'
import { setPrayerStatus } from '@/features/prayer/status'
import { usePrayerName } from '@/features/prayer/usePrayerName'
import { formatLongDate, formatShortDate, keyToUtcNoon } from '@/lib/dates'
import { cn } from '@/lib/utils'

import { AppDrawer } from './AppDrawer'
import { StatusDot } from './StatusDot'

const STATUSES: readonly PrayerStatus[] = ['jamaa', 'ontime', 'late', 'missed']

export type StatusTarget = { dayKey: string; prayer: Prayer; time: string; current?: PrayerStatus }

/** Volet « Statut d'une prière » : En jamâ‘a, À l'heure, En retard, Manquée, ou Effacer. */
export function PrayerStatusDrawer({ target, onClose }: { target: StatusTarget | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const prayerName = usePrayerName()

  async function choose(status: PrayerStatus | null) {
    if (!target) return
    await setPrayerStatus(target.dayKey, target.prayer, status)
    onClose()
  }

  return (
    <AppDrawer
      open={!!target}
      onOpenChange={(o) => !o && onClose()}
      title={target ? `${prayerName(target.prayer, target.dayKey)} · ${formatShortDate(target.dayKey, lang)}` : ''}
      description={
        target
          ? `${formatLongDate(keyToUtcNoon(target.dayKey), lang, 'UTC')} · ${target.time}`
          : t('status.description')
      }
    >
      {target && (
        <div className="flex flex-col gap-2" role="group" aria-label={t('status.description')}>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={target.current === s}
              onClick={() => void choose(s)}
              className={cn(
                'flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-start',
                'aria-pressed:border-primary aria-pressed:bg-primary-soft',
              )}
            >
              <StatusDot status={s} />
              <span className="min-w-0">
                <b className="block text-[0.9375rem]">{t(`status.${s}`)}</b>
                <span className="block text-[0.78125rem] text-muted-foreground">{t(`status.${s}Hint`)}</span>
              </span>
            </button>
          ))}
          {target.current && (
            <Button variant="secondary" className="h-11 rounded-[14px] font-bold" onClick={() => void choose(null)}>
              {t('status.clear')}
            </Button>
          )}
        </div>
      )}
    </AppDrawer>
  )
}
