import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { PRAYERS } from '@/db/types'
import { findCity, type Place } from '@/features/prayer/cities'
import type { DayTimes } from '@/features/prayer/times'
import { PRAYER_AR, usePrayerName } from '@/features/prayer/usePrayerName'
import { useCountdown, useWindowText } from '@/features/prayer/useWindowText'
import { nextPrayer, prayerWindow, skyPeriod, type SkyPeriod } from '@/features/prayer/window'
import { addDays, formatTime, weekday } from '@/lib/dates'
import { cn } from '@/lib/utils'

import { SunArc } from './SunArc'

const SKY: Record<SkyPeriod, string> = {
  night: 'bg-(image:--sky-night)',
  dawn: 'bg-(image:--sky-dawn)',
  day: 'bg-(image:--sky-day)',
  dusk: 'bg-(image:--sky-dusk)',
}

const eyebrow =
  'text-[0.6875rem] font-bold tracking-[0.09em] uppercase rtl:text-[0.78125rem] rtl:tracking-normal rtl:normal-case'

/** Le ciel de l'accueil : prochaine prière, compte à rebours, arc solaire, horaires et temps restant. */
export function SkyHero({
  now,
  dayKey,
  place,
  yesterday,
  today,
  tomorrow,
}: {
  now: Date
  dayKey: string
  place: Place
  yesterday: DayTimes
  today: DayTimes
  tomorrow: DayTimes
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const titleId = useId()
  const prayerName = usePrayerName()
  const countdown = useCountdown()
  const windowText = useWindowText()

  const next = nextPrayer(now, today, tomorrow)
  const nextDay = next.tomorrow ? addDays(dayKey, 1) : dayKey
  const nextIsJumua = next.prayer === 'dhuhr' && weekday(nextDay) === 5
  const win = prayerWindow(now, yesterday, today, tomorrow)
  const city = findCity(place.cityId)
  const tz = place.timezone

  return (
    <section
      aria-labelledby={titleId}
      className={cn('relative overflow-hidden rounded-3xl px-4 pt-4 pb-3.5 text-sky-ink', SKY[skyPeriod(now, today)])}
    >
      <div className="flex justify-between gap-2.5 opacity-85">
        <h2 id={titleId} className={eyebrow}>
          {t('today.nextPrayer')}
          {next.tomorrow && t('today.tomorrow')}
        </h2>
        <span className={eyebrow}>{city ? city[lang] : t('settings.myPosition')}</span>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p lang="ar" dir="rtl" className="font-quran text-[2.125rem] leading-tight">
            {nextIsJumua ? PRAYER_AR.jumua : PRAYER_AR[next.prayer]}
          </p>
          {lang !== 'ar' && (
            <p className="font-display text-base font-semibold opacity-90">{prayerName(next.prayer, nextDay)}</p>
          )}
        </div>
        <div className="text-end">
          <p className="tabular font-display text-[2.75rem] leading-none font-semibold sm:text-[3.25rem]">
            <time dateTime={next.at.toISOString()}>{formatTime(next.at, tz)}</time>
          </p>
          <p className="mt-1 text-[0.84375rem] font-bold text-sky-accent">{countdown(next.leftMs)}</p>
        </div>
      </div>
      <SunArc now={now} times={today} next={next.prayer} />
      <ul className="mt-1 grid grid-cols-5 gap-1 text-center">
        {PRAYERS.map((p) => (
          <li
            key={p}
            className={cn(
              'min-w-0 truncate text-[0.6875rem] rtl:text-[0.75rem]',
              p === next.prayer ? 'text-sky-accent' : 'opacity-80',
            )}
          >
            {prayerName(p, dayKey)}
            <strong className="tabular block text-[0.90625rem]">{formatTime(today[p], tz)}</strong>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          'mt-2.5 flex flex-col gap-1.5 text-[0.78125rem] font-bold',
          'low' in win && win.low && 'text-sky-accent',
        )}
      >
        <span>{windowText(win, dayKey)}</span>
        {'frac' in win && (
          <span className="block h-[5px] overflow-hidden rounded-full bg-(--sky-faint)" aria-hidden="true">
            <i
              className={cn('block h-full rounded-full', win.low ? 'bg-sky-accent' : 'bg-sky-ink')}
              style={{ width: `${win.frac * 100}%` }}
            />
          </span>
        )}
      </p>
    </section>
  )
}
