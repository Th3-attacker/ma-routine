import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/ItemCard'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { ColorDot } from '@/components/ColorDot'
import { Bar, cardClass, linkClass, Section, subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Settings, Transaction } from '@/db/types'
import { formatDayLabel, formatMonth } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

import { BudgetsDrawer } from './BudgetsDrawer'
import { InsightsCard } from './InsightsCard'
import { CATEGORIES, categoryColor } from './categories'
import { addMonths, budgetLevel, budgetTotal, groupByDay, monthStats } from './stats'
import { TransactionDrawer, type TxTarget } from './TransactionDrawer'
import { useMonthTransactions } from './transactions'

const LEVEL_FILL = { ok: '', warn: 'bg-warn', bad: 'bg-bad' } as const
const iconBtn =
  'grid size-11 flex-none place-items-center rounded-[12px] border border-line bg-surface text-ink-2 disabled:opacity-40'

/** Budget → Mois : navigation, résumé, catégories, mouvements par jour. */
export function MonthView({
  month,
  today,
  settings,
  onMonth,
}: {
  month: string
  today: string
  settings: Settings
  onMonth: (m: string) => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const items = useMonthTransactions(month)
  const [tx, setTx] = useState<TxTarget | null>(null)
  const [budgetsOpen, setBudgetsOpen] = useState(false)
  const money = (n: number, sign = false) => formatMoney(n, settings.currency, lang, sign)
  const current = today.slice(0, 7)

  const stats = monthStats(items ?? [])
  const total = budgetTotal(settings.budgets)
  const pct = total ? (stats.spent / total) * 100 : 0
  const level = budgetLevel(stats.spent, total)
  const balance = stats.income - stats.spent

  const cats = CATEGORIES.out
    .filter((c) => (stats.byCategory[c.id] ?? 0) > 0 || (settings.budgets[c.id] ?? 0) > 0)
    .sort((a, b) => (stats.byCategory[b.id] ?? 0) - (stats.byCategory[a.id] ?? 0))
  const maxCat = Math.max(1, ...cats.map((c) => stats.byCategory[c.id] ?? 0))

  return (
    <div className="flex flex-col gap-[22px]">
      <nav aria-label={formatMonth(month, lang)} className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          className={iconBtn}
          aria-label={t('budget.prevMonth')}
          onClick={() => onMonth(addMonths(month, -1))}
        >
          <ChevronLeftIcon className="rtl-flip size-5" aria-hidden="true" />
        </button>
        <h2 className="font-display text-xl font-semibold rtl:font-bold" aria-live="polite">
          {formatMonth(month, lang)}
        </h2>
        <button
          type="button"
          className={iconBtn}
          aria-label={t('budget.nextMonth')}
          disabled={month >= current}
          onClick={() => onMonth(addMonths(month, 1))}
        >
          <ChevronRightIcon className="rtl-flip size-5" aria-hidden="true" />
        </button>
      </nav>

      <section aria-labelledby="month-spent" className={cn(cardClass, 'flex flex-col gap-2.5')}>
        <h3 id="month-spent" className={subClass}>
          {t('budget.spentMonth')}
        </h3>
        <p className="tabular font-display text-[2.125rem] leading-tight font-semibold">{money(stats.spent)}</p>
        {total ? (
          <>
            <Bar value={pct / 100} fill={LEVEL_FILL[level] || 'bg-primary'} />
            <p className={subClass}>
              {t('budget.ofBudget', {
                pct: Math.round(pct),
                budget: money(total),
                status:
                  total - stats.spent >= 0
                    ? t('budget.left', { amount: money(total - stats.spent) })
                    : t('budget.over', { amount: money(stats.spent - total) }),
              })}
            </p>
          </>
        ) : (
          <p className={subClass}>
            {t('budget.noBudget')}{' '}
            <button type="button" className={cn(linkClass, 'min-h-0')} onClick={() => setBudgetsOpen(true)}>
              {t('budget.setBudgets')}
            </button>
          </p>
        )}
        <dl className="grid grid-cols-3 gap-2">
          {[
            [t('budget.income'), money(stats.income), 'text-ok'],
            [t('budget.balance'), money(balance, true), balance < 0 ? 'text-bad' : ''],
            [t('budget.sadaqa'), money(stats.byCategory.sadaqa ?? 0), ''],
          ].map(([label, value, color]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
              <dd className={cn('tabular text-[0.9375rem] font-bold [overflow-wrap:anywhere]', color)}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button className="h-11 flex-auto rounded-[14px] font-bold" onClick={() => setTx({ type: 'out' })}>
            <PlusIcon aria-hidden="true" />
            {t('budget.addOut')}
          </Button>
          <Button
            variant="secondary"
            className="h-11 flex-auto rounded-[14px] bg-primary-soft font-bold text-primary"
            onClick={() => setTx({ type: 'in' })}
          >
            <PlusIcon aria-hidden="true" />
            {t('budget.addIn')}
          </Button>
        </div>
      </section>

      {!items ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <>
          <EmptyState title={t('budget.emptyTitle', { month: formatMonth(month, lang) })}>
            {t('budget.emptyBody')}
          </EmptyState>
          <Button variant="secondary" className="h-11 rounded-[14px] font-bold" onClick={() => setBudgetsOpen(true)}>
            {t('budget.setBudgetsLong')}
          </Button>
        </>
      ) : (
        <>
          {cats.length > 0 && (
            <Section
              title={t('budget.byCategory')}
              aside={
                <button type="button" className={linkClass} onClick={() => setBudgetsOpen(true)}>
                  {t('budget.budgets')}
                </button>
              }
            >
              <ul className="overflow-hidden rounded-xl bg-card shadow-card">
                {cats.map((c) => {
                  const spent = stats.byCategory[c.id] ?? 0
                  const b = settings.budgets[c.id] ?? 0
                  const lvl = budgetLevel(spent, b)
                  return (
                    <li
                      key={c.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-1 border-t border-line px-3.5 py-2.5 first:border-t-0"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                        <ColorDot color={c.color} />
                        <span className="truncate">{t(`categories.${c.id}` as never)}</span>
                      </span>
                      <span className="tabular text-end text-[0.84375rem] font-bold">
                        {money(spent)}
                        {b > 0 && <small className="font-semibold text-muted-foreground"> / {money(b)}</small>}
                      </span>
                      <span
                        className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-surface-2"
                        aria-hidden="true"
                      >
                        <i
                          className={cn('block h-full rounded-full', LEVEL_FILL[lvl])}
                          style={{
                            width: `${Math.min(100, b ? (spent / b) * 100 : (spent / maxCat) * 100)}%`,
                            background: lvl === 'ok' ? `var(${c.color})` : undefined,
                          }}
                        />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Section>
          )}

          <InsightsCard month={month} today={today} settings={settings} />

          <Section title={t('budget.movements')} aside={<span className={subClass}>{items.length}</span>}>
            <div className="overflow-hidden rounded-xl bg-card shadow-card">
              {groupByDay(items).map(([day, list]) => {
                const dayOut = list.filter((i) => i.type === 'out').reduce((a, i) => a + i.amount, 0)
                return (
                  <section
                    key={day}
                    aria-label={formatDayLabel(day, lang)}
                    className="border-t border-line first:border-t-0"
                  >
                    <h4 className="flex justify-between gap-2.5 px-3.5 pt-3 pb-1 text-xs font-extrabold tracking-[0.07em] text-muted-foreground uppercase rtl:text-[0.8125rem] rtl:tracking-normal rtl:normal-case">
                      <time dateTime={day}>{day === today ? t('budget.today') : formatDayLabel(day, lang)}</time>
                      {dayOut > 0 && <span className="tabular">{money(-dayOut)}</span>}
                    </h4>
                    <ul>
                      {list.map((it) => (
                        <li key={it.id}>
                          <TxRow it={it} money={money} onOpen={() => setTx({ edit: it })} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          </Section>
        </>
      )}

      <TransactionDrawer target={tx} today={today} currency={settings.currency} onClose={() => setTx(null)} />
      <BudgetsDrawer open={budgetsOpen} onOpenChange={setBudgetsOpen} budgets={settings.budgets} />
    </div>
  )
}

function TxRow({
  it,
  money,
  onOpen,
}: {
  it: Transaction
  money: (n: number, sign?: boolean) => string
  onOpen: () => void
}) {
  const { t } = useTranslation()
  const cat = t(`categories.${it.category}` as never)
  return (
    <button type="button" onClick={onOpen} className="flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-start">
      <span className="grid size-[34px] flex-none place-items-center rounded-[11px] bg-surface-2">
        <ColorDot color={categoryColor(it.category)} className="size-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.90625rem] font-semibold">{it.note || cat}</span>
        <span className="block truncate text-[0.78125rem] text-muted-foreground">
          {it.note ? `${cat} · ` : ''}
          {t(`payMethods.${it.payMethod}` as never)}
        </span>
      </span>
      <span className={cn('tabular font-extrabold whitespace-nowrap', it.type === 'in' && 'text-ok')} dir="ltr">
        {it.type === 'in' ? money(it.amount, true) : money(-it.amount)}
      </span>
    </button>
  )
}
