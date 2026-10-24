import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { AthkarMini } from '@/components/AthkarMini'
import { FastCard, FridayCard } from '@/components/ContextCards'
import { HabitsCard } from '@/components/HabitsCard'
import { MoneyMini } from '@/components/MoneyMini'
import { NextSteps } from '@/components/NextSteps'
import { PageTitle } from '@/components/PageTitle'
import { PrayerPills } from '@/components/PrayerPills'
import { QuranCard } from '@/components/QuranCard'
import { RamadanCard } from '@/components/RamadanCard'
import { RecapCard } from '@/components/RecapCard'
import { SkyHero } from '@/components/SkyHero'
import { VerseCard } from '@/components/VerseCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useDay } from '@/db/days'
import { useSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { formatHijri, hijriDate } from '@/features/calendar/hijri'
import { isEvening } from '@/features/daily/recap'
import { verseOfDay } from '@/features/daily/verseOfDay'
import { useNow, useToday } from '@/features/prayer/useToday'
import { ramadanDay } from '@/features/ramadan/ramadan'
import { formatLongDate, keyToUtcNoon } from '@/lib/dates'
import { displayName } from '@/lib/names'

export function TodayPage() {
  const settings = useSettings()
  if (!settings) return <Skeleton className="h-40 w-full rounded-xl" />
  return <Today settings={settings} />
}

function Today({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const now = useNow()
  const { key, place, yesterday, today, tomorrow } = useToday(settings, now)
  const day = useDay(key)
  const name = displayName(settings, lang)
  const hijri = hijriDate(key, settings.hijriAdj)
  const ramadan = ramadanDay(key, settings.hijriAdj, settings.ramadanPreview)
  const evening = isEvening(now, today)

  return (
    <>
      <hgroup className="flex flex-col gap-0.5 pt-0.5">
        <PageTitle>{name ? t('today.salamName', { name }) : t('today.salam')}</PageTitle>
        <p className="text-[0.84375rem] text-ink-2">
          <time dateTime={key}>{formatLongDate(keyToUtcNoon(key), lang, 'UTC')}</time>
          {hijri && (
            <>
              {' · '}
              <b className="font-bold text-gold">{formatHijri(hijri, lang)}</b>
            </>
          )}
        </p>
      </hgroup>
      {day && (
        <RamadanCard
          day={day}
          settings={settings}
          now={now}
          today={today}
          tomorrow={tomorrow}
          timezone={place.timezone}
        />
      )}
      <SkyHero now={now} dayKey={key} place={place} yesterday={yesterday} today={today} tomorrow={tomorrow} />
      {day ? (
        <>
          <PrayerPills day={day} times={today} timezone={place.timezone} />
          {evening && <RecapCard day={day} settings={settings} />}
          <FridayCard day={day} times={today} timezone={place.timezone} />
          {!ramadan && (
            <FastCard
              day={day}
              now={now}
              times={today}
              tomorrowTimes={tomorrow}
              timezone={place.timezone}
              hijriAdj={settings.hijriAdj}
            />
          )}
          <VerseCard text={verseOfDay(key, !!ramadan)} />
          <AthkarMini day={day} />
          <QuranCard day={day} settings={settings} />
          <HabitsCard day={day} settings={settings} />
          <MoneyMini today={key} settings={settings} />
          <NextSteps today={key} />
          {!evening && <RecapCard day={day} settings={settings} />}
        </>
      ) : (
        <Skeleton className="h-24 w-full rounded-xl" />
      )}
    </>
  )
}
