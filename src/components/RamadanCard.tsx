import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { updateDay } from '@/db/days'
import type { Day, Settings } from '@/db/types'
import { QADR_DUA } from '@/features/daily/quotes'
import type { DayTimes } from '@/features/prayer/times'
import { useCountdown } from '@/features/prayer/useWindowText'
import { daysToRamadan, ramadanCountdown, ramadanDay, ramadanPagesPerDay } from '@/features/ramadan/ramadan'
import { formatTime } from '@/lib/dates'
import { cn } from '@/lib/utils'

const chip =
  'inline-flex min-h-11 items-center rounded-full border border-(--sky-line) px-3.5 text-[0.8125rem] font-bold text-sky-ink aria-pressed:border-sky-accent aria-pressed:bg-sky-accent aria-pressed:text-(--sky-deep)'

/** Carte Ramadan (ou « Ramadan approche » dans les 30 jours qui précèdent). Couleurs identiques dans les deux thèmes. */
export function RamadanCard({
  day,
  settings,
  now,
  today,
  tomorrow,
  timezone,
}: {
  day: Day
  settings: Settings
  now: Date
  today: DayTimes
  tomorrow: DayTimes
  timezone: string
}) {
  const { t, i18n } = useTranslation()
  const countdown = useCountdown()
  const titleId = useId()
  const ar = i18n.language === 'ar'
  const r = ramadanDay(day.id, settings.hijriAdj, settings.ramadanPreview)

  if (!r) {
    const n = daysToRamadan(day.id, settings.hijriAdj)
    if (!n || n > 30) return null
    return (
      <section aria-labelledby={titleId} className="flex flex-col gap-2.5 rounded-xl bg-gold-soft p-4">
        <h2
          id={titleId}
          className="flex flex-wrap items-baseline gap-2 font-display text-[1.0625rem] font-semibold rtl:font-bold"
        >
          {ar ? (
            <span className="font-quran text-xl font-bold text-gold">{t('ramadan.soonTitle')}</span>
          ) : (
            <>
              {t('ramadan.soonTitle')}
              <span lang="ar" className="font-quran text-xl font-bold text-gold">
                رمضان
              </span>
            </>
          )}
        </h2>
        <p className="text-[0.84375rem] text-ink-2">{t('ramadan.soon', { count: n })}</p>
      </section>
    )
  }

  const cd = ramadanCountdown(now, today, tomorrow)
  const cdText =
    cd.kind === 'tomorrowSuhur'
      ? t('ramadan.cd.tomorrowSuhur', { time: formatTime(cd.at, timezone) })
      : t(`ramadan.cd.${cd.kind}`, { in: countdown(cd.leftMs) })
  const suhur = now.getTime() < today.fajr.getTime() ? today.fajr : tomorrow.fajr

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-3xl bg-(image:--sky-night) p-4 text-sky-ink"
    >
      <h2
        id={titleId}
        className="flex flex-wrap items-center gap-2 font-display text-[1.1875rem] font-semibold rtl:font-bold"
      >
        {ar ? (
          <span className="font-quran text-[1.375rem] text-sky-accent">رمضان مبارك</span>
        ) : (
          <>
            {t('ramadan.title')}
            <span lang="ar" className="font-quran text-[1.375rem] text-sky-accent">
              رمضان مبارك
            </span>
          </>
        )}
        {r.preview && (
          <span className="rounded-full bg-(--sky-faint) px-2 py-0.5 text-[0.65625rem] font-extrabold tracking-[0.06em] uppercase rtl:tracking-normal rtl:normal-case">
            {t('ramadan.preview')}
          </span>
        )}
      </h2>
      <p className="text-[0.84375rem] opacity-90">{t('ramadan.day', { n: r.day })}</p>
      <dl className="grid grid-cols-2 gap-2">
        {[
          [t('ramadan.suhurUntil'), suhur],
          [t('ramadan.iftar'), today.maghrib],
        ].map(([label, at]) => (
          <div key={label as string} className="rounded-[14px] bg-(--sky-faint) px-3 py-2.5">
            <dt className="text-xs font-semibold opacity-85">{label as string}</dt>
            <dd className="tabular font-display text-2xl font-semibold">
              <time dateTime={(at as Date).toISOString()}>{formatTime(at as Date, timezone)}</time>
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-[0.84375rem] font-bold text-sky-accent">{cdText}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={day.fasted}
          className={chip}
          onClick={() => void updateDay(day.id, (d) => ({ fasted: !d.fasted }))}
        >
          {t('ramadan.fasting')}
        </button>
        <button
          type="button"
          aria-pressed={day.tarawih}
          className={chip}
          onClick={() => void updateDay(day.id, (d) => ({ tarawih: !d.tarawih }))}
        >
          {t('ramadan.tarawih')}
        </button>
      </div>
      <p className="text-[0.84375rem] opacity-90">
        {t('ramadan.pages', { n: ramadanPagesPerDay(settings.quran, r.day) })}
      </p>
      {r.day >= 21 && (
        <>
          <p className="text-[0.84375rem] opacity-90">{t('ramadan.lastTen')}</p>
          <p lang="ar" dir="rtl" className={cn('text-center font-quran text-xl leading-loose')}>
            {QADR_DUA}
          </p>
        </>
      )}
      {r.day >= 25 && <p className="text-[0.84375rem] opacity-90">{t('ramadan.zakat')}</p>}
    </section>
  )
}
