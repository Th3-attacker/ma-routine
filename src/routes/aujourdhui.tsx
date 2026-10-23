import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { ComingSoon } from '@/components/ComingSoon'
import { PageTitle } from '@/components/PageTitle'
import { dayKey, formatLongDate } from '@/lib/dates'

export function TodayPage() {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const now = new Date()

  return (
    <>
      <hgroup className="flex flex-col gap-0.5 pt-0.5">
        <PageTitle>{t('today.salam')}</PageTitle>
        <p className="text-[0.84375rem] text-ink-2">
          <time dateTime={dayKey(now)}>{formatLongDate(now, lang)}</time>
        </p>
      </hgroup>
      <ComingSoon />
    </>
  )
}
