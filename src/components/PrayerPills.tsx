import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PRAYERS, type Day } from '@/db/types'
import type { DayTimes } from '@/features/prayer/times'
import { usePrayerName } from '@/features/prayer/usePrayerName'
import { formatTime } from '@/lib/dates'

import { PrayerStatusDrawer, type StatusTarget } from './PrayerStatusDrawer'
import { linkClass, Section } from './Section'
import { StatusDot } from './StatusDot'

export function PrayerPills({ day, times, timezone }: { day: Day; times: DayTimes; timezone: string }) {
  const { t } = useTranslation()
  const prayerName = usePrayerName()
  const [target, setTarget] = useState<StatusTarget | null>(null)

  return (
    <Section
      title={t('today.myPrayers')}
      aside={
        <Link to="/priere" className={linkClass}>
          {t('today.fullTracking')}
        </Link>
      }
    >
      <ul className="grid grid-cols-5 gap-1.5">
        {PRAYERS.map((p) => {
          const status = day.prayers[p]
          const name = prayerName(p, day.id)
          return (
            <li key={p} className="min-w-0">
              <button
                type="button"
                aria-label={t('status.label', { name, status: status ? t(`status.${status}`) : t('today.toFill') })}
                onClick={() =>
                  setTarget({ dayKey: day.id, prayer: p, time: formatTime(times[p], timezone), current: status })
                }
                className="flex min-h-[72px] w-full min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface px-0.5 pt-[11px] pb-2.5 text-[0.71875rem] font-bold text-ink-2 rtl:text-[0.8125rem]"
              >
                <StatusDot status={status} />
                <span className="max-w-full truncate">{name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <PrayerStatusDrawer target={target} onClose={() => setTarget(null)} />
    </Section>
  )
}
