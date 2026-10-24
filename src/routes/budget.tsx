import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import type { BudgetView } from '@/app/router'
import { ComingSoon } from '@/components/ComingSoon'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/db/settings'
import type { Settings } from '@/db/types'
import { DebtsView } from '@/features/budget/DebtsView'
import { GoalsView } from '@/features/budget/GoalsView'
import { MonthView } from '@/features/budget/MonthView'
import { resolvePlace } from '@/features/prayer/cities'
import { useNow } from '@/features/prayer/useToday'
import { dayKey } from '@/lib/dates'

const route = getRouteApi('/budget')
const VIEWS: readonly BudgetView[] = ['month', 'debts', 'goals', 'rec']

export const tabClass =
  'h-11 flex-none rounded-full border border-line bg-surface px-3.5 text-[0.8125rem] font-bold text-ink-2 shadow-none after:hidden data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:text-ink-2 dark:data-active:border-primary dark:data-active:bg-primary dark:data-active:text-primary-foreground'
export const tabListClass =
  'h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0 group-data-horizontal/tabs:h-auto'

export function BudgetPage() {
  const settings = useSettings()
  if (!settings) return <Skeleton className="h-40 w-full rounded-xl" />
  return <Budget settings={settings} />
}

function Budget({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = route.useSearch()
  const now = useNow()
  const today = dayKey(now, resolvePlace(settings).timezone)
  const view = search.view ?? 'month'
  const month = search.month && search.month <= today.slice(0, 7) ? search.month : today.slice(0, 7)

  const go = (s: { view?: BudgetView; month?: string }) =>
    void navigate({ to: '/budget', search: { ...search, ...s }, replace: true })

  return (
    <>
      <h1 className="sr-only">{t('tabs.budget')}</h1>
      <Tabs value={view} onValueChange={(v) => go({ view: v as BudgetView })}>
        <TabsList aria-label={t('budget.viewsLabel')} className={tabListClass}>
          {VIEWS.map((v) => (
            <TabsTrigger key={v} value={v} className={tabClass}>
              {t(`budget.views.${v}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="month" className="mt-[22px] text-base">
          <MonthView month={month} today={today} settings={settings} onMonth={(m) => go({ month: m })} />
        </TabsContent>
        <TabsContent value="debts" className="mt-[22px] text-base">
          <DebtsView today={today} settings={settings} />
        </TabsContent>
        <TabsContent value="goals" className="mt-[22px] text-base">
          <GoalsView today={today} settings={settings} />
        </TabsContent>
        <TabsContent value="rec" className="mt-[22px] text-base">
          <ComingSoon />
        </TabsContent>
      </Tabs>
    </>
  )
}
