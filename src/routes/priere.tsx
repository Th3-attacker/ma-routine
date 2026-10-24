import { MinusIcon, PlusIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { useOpenSettings } from '@/app/settings-drawer'
import { PageTitle } from '@/components/PageTitle'
import { PrayerStatusDrawer, type StatusTarget } from '@/components/PrayerStatusDrawer'
import { Bar, cardClass, linkClass, Section, subClass } from '@/components/Section'
import { StatusDot } from '@/components/StatusDot'
import { ToggleChip } from '@/components/ToggleChip'
import { Skeleton } from '@/components/ui/skeleton'
import { updateDay, useDay, useDaysBetween } from '@/db/days'
import { updateSettings, useSettings } from '@/db/settings'
import { PRAYERS, SUNNA_KEYS, type Day, type Prayer, type PrayerStatus, type Settings } from '@/db/types'
import { formatHijri, hijriDate } from '@/features/calendar/hijri'
import { findCity } from '@/features/prayer/cities'
import { monthPrayerStats } from '@/features/prayer/stats'
import { prayerStreak } from '@/features/prayer/streak'
import { prayerTimesFor, TIME_KEYS } from '@/features/prayer/times'
import { PRAYER_AR, usePrayerName } from '@/features/prayer/usePrayerName'
import { useNow, useToday } from '@/features/prayer/useToday'
import { useWindowText } from '@/features/prayer/useWindowText'
import { currentPrayer, prayerWindow } from '@/features/prayer/window'
import { addDays, formatLongDate, formatTime, keyToUtcNoon, lastDays, parseKey, weekday } from '@/lib/dates'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<PrayerStatus, string> = {
  jamaa: 'bg-ok',
  ontime: 'bg-primary',
  late: 'bg-warn',
  missed: 'bg-bad',
}

export function PrayerPage() {
  const settings = useSettings()
  if (!settings) return <Skeleton className="h-40 w-full rounded-xl" />
  return <Prayers settings={settings} />
}

function Prayers({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const openSettings = useOpenSettings()
  const prayerName = usePrayerName()
  const windowText = useWindowText()
  const now = useNow()
  const { key, place, yesterday, today, tomorrow } = useToday(settings, now)
  const day = useDay(key)
  const history = useDaysBetween(addDays(key, -400), key)
  const [target, setTarget] = useState<StatusTarget | null>(null)
  const tz = place.timezone

  const cur = currentPrayer(now, today)
  const win = prayerWindow(now, yesterday, today, tomorrow)
  const hijri = hijriDate(key, settings.hijriAdj)
  const city = findCity(place.cityId)
  const ar = lang === 'ar'

  const open = (dayKey: string, prayer: Prayer, d: Day | undefined, time: Date) =>
    setTarget({ dayKey, prayer, time: formatTime(time, tz), current: d?.prayers[prayer] })

  const monthKey = key.slice(0, 7)
  const monthDays = history ? [...history.values()].filter((d) => d.id.startsWith(monthKey)) : []
  const stats = monthPrayerStats(monthDays)
  const streak = history ? prayerStreak(key, (k) => history.get(k)) : 0

  return (
    <>
      <hgroup className="flex flex-col gap-0.5 pt-0.5">
        <PageTitle>{formatLongDate(keyToUtcNoon(key), lang, 'UTC')}</PageTitle>
        {hijri && <p className={subClass}>{formatHijri(hijri, lang)}</p>}
      </hgroup>

      <Section title={t('prayer.times')}>
        <p
          className={cn(
            'flex items-center gap-3 rounded-lg px-3.5 py-3 text-[0.84375rem] font-semibold',
            'low' in win && win.low ? 'bg-warn-soft' : 'bg-primary-soft',
          )}
        >
          <span className="min-w-0 flex-1">{windowText(win, key)}</span>
          {'frac' in win && (
            <Bar value={win.frac} className="h-1.5 flex-[0_0_72px]" fill={win.low ? 'bg-warn' : 'bg-primary'} />
          )}
        </p>
        <ul className="overflow-hidden rounded-xl bg-card shadow-card">
          {TIME_KEYS.map((k) => {
            const isSunrise = k === 'sunrise'
            const status = !isSunrise ? day?.prayers[k] : undefined
            const nameAr = k === 'dhuhr' && weekday(key) === 5 ? PRAYER_AR.jumua : PRAYER_AR[k]
            return (
              <li
                key={k}
                aria-current={k === cur ? 'time' : undefined}
                className={cn(
                  'grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0',
                  k === cur && 'bg-primary-soft',
                  isSunrise && 'opacity-75',
                )}
              >
                <span className="flex min-w-0 items-baseline gap-2.5">
                  <span
                    lang="ar"
                    className={cn('font-quran leading-snug', ar ? 'text-[1.375rem]' : 'text-[1.3125rem]')}
                  >
                    {nameAr}
                  </span>
                  {!ar && <span className="truncate text-sm font-bold text-ink-2">{prayerName(k, key)}</span>}
                </span>
                <time dateTime={today[k].toISOString()} className="tabular font-display text-xl font-semibold">
                  {formatTime(today[k], tz)}
                </time>
                {isSunrise ? (
                  <span className={cn(subClass, 'min-w-[118px] text-end')}>{t('prayer.sunriseNote')}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => open(key, k, day, today[k])}
                    className="flex min-h-11 min-w-[118px] items-center gap-2 rounded-full bg-surface-2 py-1.5 ps-1.5 pe-2.5 text-xs font-bold text-ink-2"
                    aria-label={t('status.label', {
                      name: prayerName(k, key),
                      status: status ? t(`status.${status}`) : t('prayer.notFilled'),
                    })}
                  >
                    <StatusDot status={status} className="size-6" />
                    {status ? t(`status.${status}`) : t('prayer.mark')}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <p className={cn(subClass, 'flex flex-wrap items-center justify-between gap-x-2.5')}>
          <span>
            {city ? city[lang] : t('settings.myPosition')} · {t(`methods.${settings.method}`)} ·{' '}
            {settings.asrSchool === 'hanafi' ? t('prayer.asrHanafi') : t('prayer.asrStandard')}
          </span>
          <button type="button" className={linkClass} onClick={openSettings}>
            {t('prayer.adjust')}
          </button>
        </p>
      </Section>

      <Section title={t('prayer.sunna')}>
        <ul className="flex flex-wrap gap-1.5">
          {SUNNA_KEYS.map((k) => (
            <li key={k}>
              <ToggleChip
                pressed={!!day?.sunna[k]}
                onToggle={() => void updateDay(key, (d) => ({ sunna: { ...d.sunna, [k]: !d.sunna[k] } }))}
              >
                {t(`sunna.${k}`)}
              </ToggleChip>
            </li>
          ))}
        </ul>
      </Section>

      <WeekGrid
        todayKey={key}
        now={now}
        settings={settings}
        place={place}
        history={history}
        onOpen={(dayKey, p, d, time) => open(dayKey, p, d, time)}
      />

      <Section title={t('prayer.summary')}>
        <ul className="grid grid-cols-3 gap-2">
          {[
            [String(streak), t('prayer.streak', { count: streak })],
            [`${stats.onTimePct}%`, t('prayer.onTimeMonth')],
            [String(stats.jamaa), t('prayer.jamaaMonth')],
          ].map(([value, label]) => (
            <li key={label} className="min-w-0 rounded-lg bg-card p-3 shadow-card">
              <b className="tabular block font-display text-[1.625rem] leading-tight font-semibold" dir="ltr">
                {value}
              </b>
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            </li>
          ))}
        </ul>
        <Qada qada={settings.qada} />
      </Section>

      <PrayerStatusDrawer target={target} onClose={() => setTarget(null)} />
    </>
  )
}

function Qada({ qada }: { qada: number }) {
  const { t } = useTranslation()
  const labelId = useId()
  const step = (n: number) => void updateSettings((s) => ({ qada: Math.max(0, s.qada + n) }))
  const btn = 'grid size-11 place-items-center rounded-[12px] bg-surface-2 disabled:opacity-40'
  return (
    <div className={cn(cardClass, 'flex flex-wrap items-center justify-between gap-3')}>
      <p className="flex flex-col">
        <span id={labelId} className={subClass}>
          {t('prayer.qada')}
        </span>
        <output
          aria-labelledby={labelId}
          aria-live="polite"
          className="tabular font-display text-[1.75rem] font-semibold"
        >
          {qada}
        </output>
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          className={btn}
          aria-label={t('prayer.qadaMinus')}
          disabled={qada <= 0}
          onClick={() => step(-1)}
        >
          <MinusIcon className="size-5" aria-hidden="true" />
        </button>
        <button type="button" className={btn} aria-label={t('prayer.qadaPlus')} onClick={() => step(1)}>
          <PlusIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/** Grille des 7 derniers jours (tableau) : chaque case ouvre le volet de statut. */
function WeekGrid({
  todayKey,
  now,
  settings,
  place,
  history,
  onOpen,
}: {
  todayKey: string
  now: Date
  settings: Settings
  place: ReturnType<typeof useToday>['place']
  history: Map<string, Day> | undefined
  onOpen: (dayKey: string, p: Prayer, d: Day | undefined, time: Date) => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const prayerName = usePrayerName()
  const days = lastDays(todayKey, 7)
  const weekdays = t('weekdays', { returnObjects: true }) as string[]
  const times = Object.fromEntries(days.map((k) => [k, prayerTimesFor(k, place, settings)]))

  return (
    <Section title={t('prayer.last7')} aside={<span className={subClass}>{t('prayer.last7Hint')}</span>}>
      <div className={cn(cardClass, 'overflow-x-auto px-2.5')}>
        <table className="w-full border-separate border-spacing-x-1 border-spacing-y-1.5 text-[0.71875rem]">
          <caption className="sr-only">{t('prayer.last7')}</caption>
          <thead>
            <tr>
              <td />
              {days.map((k) => (
                <th
                  key={k}
                  scope="col"
                  className={cn('text-center font-bold text-muted-foreground', k === todayKey && 'text-primary')}
                >
                  <abbr title={formatLongDate(keyToUtcNoon(k), lang, 'UTC')} className="no-underline">
                    {weekdays[weekday(k)]}
                  </abbr>
                  <br />
                  {parseKey(k).d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRAYERS.map((p) => (
              <tr key={p}>
                <th scope="row" className="pe-1 text-start font-bold text-ink-2">
                  {t(`prayers.${p}`)}
                </th>
                {days.map((k) => {
                  const d = history?.get(k)
                  const s = d?.prayers[p]
                  const future = k === todayKey && times[k][p].getTime() > now.getTime() && !s
                  return (
                    <td key={k} className="text-center">
                      <button
                        type="button"
                        disabled={future}
                        onClick={() => onOpen(k, p, d, times[k][p])}
                        className="inline-grid min-h-11 min-w-7 place-items-center disabled:opacity-35"
                        aria-label={t('prayer.cell', {
                          name: prayerName(p, k),
                          date: formatLongDate(keyToUtcNoon(k), lang, 'UTC'),
                          status: s ? t(`status.${s}`) : t('prayer.notFilled'),
                        })}
                      >
                        <StatusDot status={s} className="size-[22px]" />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-xs text-ink-2" aria-label={t('prayer.legend')}>
        {(['jamaa', 'ontime', 'late', 'missed'] as const).map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <i className={cn('size-2.5 rounded-full', STATUS_COLORS[s])} aria-hidden="true" />
            {t(`status.${s}`)}
          </li>
        ))}
      </ul>
    </Section>
  )
}
