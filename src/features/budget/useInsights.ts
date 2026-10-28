import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import type { Settings } from '@/db/types'
import { formatShortDate } from '@/lib/dates'
import { formatMoney } from '@/lib/money'

import { useDebts } from './debts'
import { monthInsights, type Insight } from './insights'
import { addMonths } from './stats'
import { useMonthTransactions } from './transactions'

/** Conseils du mois affiché (undefined pendant le chargement). */
export function useMonthInsights(month: string, today: string, settings: Settings): Insight[] | undefined {
  const transactions = useMonthTransactions(month)
  const previousMonth = useMonthTransactions(addMonths(month, -1))
  const debts = useDebts()
  if (!transactions || !previousMonth || !debts) return undefined
  return monthInsights({ month, today, transactions, previousMonth, budgets: settings.budgets, debts })
}

/** Texte d'un conseil, dans la langue de l'app. */
export function useInsightText(currency: string): (i: Insight) => string {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  return useCallback(
    (i: Insight) => {
      const money = (n: number) => formatMoney(n, currency, lang)
      const cat = (c: string) => t(`categories.${c}` as never)
      switch (i.key) {
        case 'catOver':
        case 'catNear':
        case 'catUp':
        case 'catDown':
          return t(`insights.${i.key}`, { cat: cat(i.category), pct: i.pct })
        case 'projection':
          return t('insights.projection', { projected: money(i.projected), budget: money(i.budget) })
        case 'lateDebts':
          return t('insights.lateDebts', { count: i.count, amount: money(i.amount) })
        case 'biggest':
          return t('insights.biggest', {
            amount: money(i.amount),
            what: i.note || cat(i.category),
            date: formatShortDate(i.date, lang),
          })
        case 'topDay':
          return t('insights.topDay', { amount: money(i.amount), date: formatShortDate(i.date, lang) })
        case 'fixedShare':
          return t('insights.fixedShare', { pct: i.pct })
        case 'sadaqa':
          return t('insights.sadaqa', { amount: money(i.amount) })
      }
    },
    [t, lang, currency],
  )
}
