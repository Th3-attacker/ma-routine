import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'

import { daysBetween, formatShortDate } from './dates'

/** Texte d'échéance : « avant le 12 nov. (19 j) », « en retard de 3 j », « échéance aujourd'hui ». */
export function useDeadlineText(): (due: string, today: string, done?: boolean) => string {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  return useCallback(
    (due, today, done = false) => {
      if (!due) return ''
      const date = formatShortDate(due, lang)
      if (done) return t('deadline.done', { date })
      const n = daysBetween(today, due)
      if (n < 0) return t('deadline.late', { n: -n })
      if (n === 0) return t('deadline.today')
      return t('deadline.before', { date, n })
    },
    [t, lang],
  )
}
