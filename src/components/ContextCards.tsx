import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { updateDay } from '@/db/days'
import type { Day, FridayKey } from '@/db/types'
import { fastInfo, type FastReason } from '@/features/calendar/fasting'
import type { DayTimes } from '@/features/prayer/times'
import { addDays, formatTime, weekday } from '@/lib/dates'

import { ToggleChip } from './ToggleChip'

/** Carte dorée de contexte (vendredi, jeûne), `.ctx` dans la maquette. */
function ContextCard({ title, titleAr, children }: { title: string; titleAr?: string; children: ReactNode }) {
  const { i18n } = useTranslation()
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5 rounded-xl bg-gold-soft p-4">
      <h2
        id={id}
        className="flex flex-wrap items-baseline gap-2 font-display text-[1.0625rem] font-semibold rtl:font-bold"
      >
        {!titleAr ? (
          title
        ) : i18n.language === 'ar' ? (
          <span className="font-quran text-xl font-bold text-gold">{title}</span>
        ) : (
          <>
            {title}
            <span lang="ar" className="font-quran text-xl font-bold text-gold">
              {titleAr}
            </span>
          </>
        )}
      </h2>
      {children}
    </section>
  )
}

const FRIDAY_KEYS: readonly FridayKey[] = ['kahf', 'ghusl', 'salawat', 'early']

/** Le vendredi : heure de l'exaucement (dernière heure avant Maghrib) et cases Al-Kahf, Ghusl, Salawat, Arriver tôt. */
export function FridayCard({ day, times, timezone }: { day: Day; times: DayTimes; timezone: string }) {
  const { t } = useTranslation()
  if (weekday(day.id) !== 5) return null
  const from = formatTime(new Date(times.maghrib.getTime() - 3_600_000), timezone)
  const to = formatTime(times.maghrib, timezone)
  return (
    <ContextCard title={t('friday.title')} titleAr="يوم الجمعة">
      <p className="text-[0.84375rem] text-ink-2">{t('friday.hour', { from, to })}</p>
      <div className="flex flex-wrap gap-1.5">
        {FRIDAY_KEYS.map((k) => (
          <ToggleChip
            key={k}
            pressed={!!day.friday[k]}
            onToggle={() => void updateDay(day.id, (d) => ({ friday: { ...d.friday, [k]: !d.friday[k] } }))}
          >
            {t(`friday.${k}`)}
          </ToggleChip>
        ))}
      </div>
    </ContextCard>
  )
}

/**
 * Jeûne du jour (lundi, jeudi, jours blancs, ‘Arafa, Tâsû‘a, ‘Âchoura), ou celui du lendemain avec la fin du suhûr.
 * Absente pendant Ramadan.
 */
export function FastCard({
  day,
  now,
  times,
  tomorrowTimes,
  timezone,
  hijriAdj,
}: {
  day: Day
  now: Date
  times: DayTimes
  tomorrowTimes: DayTimes
  timezone: string
  hijriAdj: number
}) {
  const { t } = useTranslation()
  const list = (reasons: FastReason[]) => reasons.map((r) => t(`fast.reason.${r}`)).join(t('fast.separator'))
  const today = fastInfo(day.id, hijriAdj)
  const tomorrow = fastInfo(addDays(day.id, 1), hijriAdj)
  const suhur = formatTime(tomorrowTimes.fajr, timezone)

  if (today.reasons.length) {
    return (
      <ContextCard title={t('fast.todayTitle')} titleAr="الصيام">
        <p className="text-[0.84375rem] text-ink-2">{t('fast.today', { list: list(today.reasons) })}</p>
        <div className="flex flex-wrap gap-1.5">
          <ToggleChip pressed={day.fasted} onToggle={() => void updateDay(day.id, (d) => ({ fasted: !d.fasted }))}>
            {t('fast.fasted')}
          </ToggleChip>
        </div>
      </ContextCard>
    )
  }
  if (!tomorrow.reasons.length) return null
  if (now.getTime() >= times.asr.getTime()) {
    return (
      <ContextCard title={t('fast.tomorrowSunnaTitle')} titleAr="الصيام">
        <p className="text-[0.84375rem] text-ink-2">
          {t('fast.tomorrowSunna', { list: list(tomorrow.reasons), suhur })}
        </p>
      </ContextCard>
    )
  }
  return (
    <ContextCard title={t('fast.tomorrowTitle', { list: list(tomorrow.reasons) })}>
      <p className="text-[0.84375rem] text-ink-2">{t('fast.tomorrow', { suhur })}</p>
    </ContextCard>
  )
}
