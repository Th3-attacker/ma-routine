import { AlertTriangleIcon, InfoIcon, OctagonAlertIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Section } from '@/components/Section'
import type { Settings } from '@/db/types'
import { cn } from '@/lib/utils'

import type { InsightSeverity } from './insights'
import { useInsightText, useMonthInsights } from './useInsights'

const ICON = { bad: OctagonAlertIcon, warn: AlertTriangleIcon, info: InfoIcon } as const
const COLOR: Record<InsightSeverity, string> = { bad: 'text-bad', warn: 'text-warn', info: 'text-primary' }

/** Budget → Mois : « Conseils du mois », calculés sur le téléphone (sans IA). */
export function InsightsCard({ month, today, settings }: { month: string; today: string; settings: Settings }) {
  const { t } = useTranslation()
  const insights = useMonthInsights(month, today, settings)
  const text = useInsightText(settings.currency)
  if (!insights?.length) return null
  return (
    <Section title={t('insights.title')}>
      <ul className="overflow-hidden rounded-xl bg-card shadow-card">
        {insights.map((i, n) => {
          const Icon = ICON[i.severity]
          return (
            <li key={n} className="flex gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
              <Icon className={cn('mt-0.5 size-5 flex-none', COLOR[i.severity])} aria-hidden="true" />
              <p className="min-w-0 text-[0.875rem] [overflow-wrap:anywhere] text-ink-2">{text(i)}</p>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
