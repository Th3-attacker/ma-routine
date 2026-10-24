import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { Button } from '@/components/ui/button'
import type { Settings } from '@/db/types'
import { budgetTotal, monthStats } from '@/features/budget/stats'
import { TransactionDrawer, type TxTarget } from '@/features/budget/TransactionDrawer'
import { useMonthTransactions } from '@/features/budget/transactions'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

import { cardClass, linkClass, Section } from './Section'

/** Dépenses du jour et reste du budget, avec « Ajouter une dépense ». */
export function MoneyMini({ today, settings }: { today: string; settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const items = useMonthTransactions(today.slice(0, 7))
  const [tx, setTx] = useState<TxTarget | null>(null)
  const money = (n: number) => formatMoney(n, settings.currency, lang)
  const stats = monthStats(items ?? [])
  const todayOut = (items ?? []).filter((x) => x.type === 'out' && x.date === today).reduce((a, x) => a + x.amount, 0)
  const total = budgetTotal(settings.budgets)
  const big = 'font-display text-[1.375rem] font-semibold tabular [overflow-wrap:anywhere]'

  return (
    <Section
      title={t('money.title')}
      aside={
        <Link to="/budget" className={linkClass}>
          {t('tabs.budget')}
        </Link>
      }
    >
      <div className={`${cardClass} flex flex-col gap-3`}>
        <dl className="grid grid-cols-2 gap-2.5">
          <div className="min-w-0">
            <dt className="text-[0.8125rem] text-muted-foreground">{t('money.today')}</dt>
            <dd className={big}>{money(todayOut)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[0.8125rem] text-muted-foreground">{total ? t('money.left') : t('money.month')}</dt>
            <dd className={cn(big, total && total - stats.spent < 0 && 'text-bad')}>
              {money(total ? total - stats.spent : stats.spent)}
            </dd>
          </div>
        </dl>
        <Button className="h-11 rounded-[14px] font-bold" onClick={() => setTx({ type: 'out' })}>
          <PlusIcon aria-hidden="true" />
          {t('money.add')}
        </Button>
      </div>
      <TransactionDrawer target={tx} today={today} currency={settings.currency} onClose={() => setTx(null)} />
    </Section>
  )
}
