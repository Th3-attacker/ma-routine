import { useForm } from '@tanstack/react-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { AmountInput } from '@/components/AmountInput'
import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Field, inputClass } from '@/components/Field'
import { Badge, EmptyState, ItemCard, TotalsPair } from '@/components/ItemCard'
import { MovementList } from '@/components/MovementList'
import { Bar, cardClass, Section, subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Debt, Settings } from '@/db/types'
import { DEBT_VERSE } from '@/features/daily/quotes'
import { daysBetween, formatShortDate } from '@/lib/dates'
import { currencyLabel, formatMoney, parseAmount } from '@/lib/money'
import { useDeadlineText } from '@/lib/useDeadlineText'

import {
  addPayment,
  debtLeft,
  debtPaid,
  debtTotals,
  deleteDebt,
  isSettled,
  removePayment,
  saveDebt,
  setClosed,
  sortDebts,
  useDebts,
} from './debts'
import { QuickAmountForm } from './QuickAmountForm'

type FormTarget = { direction: 'in' | 'out' } | { edit: Debt }
const btn = 'h-11 flex-auto rounded-[14px] font-bold'

/** Budget → Dettes : totaux, verset, cartes en cours et soldées, détail et formulaire. */
export function DebtsView({ today, settings }: { today: string; settings: Settings }) {
  const { t, i18n } = useTranslation()
  const { lang } = usePreferences()
  const debts = useDebts()
  const deadline = useDeadlineText()
  const [openId, setOpenId] = useState<string | null>(null)
  const [form, setForm] = useState<FormTarget | null>(null)
  const money = (n: number) => formatMoney(n, settings.currency, lang)

  if (!debts) return <Skeleton className="h-40 w-full rounded-xl" />
  const { toMe, iOwe } = debtTotals(debts)
  const { open, settled } = sortDebts(debts)
  const current = debts.find((d) => d.id === openId) ?? null

  const card = (d: Debt) => {
    const st = isSettled(d)
    const late = !!d.due && !st && daysBetween(today, d.due) < 0
    return (
      <li key={d.id}>
        <ItemCard
          color={d.direction === 'in' ? '--ok' : '--bad'}
          title={d.person}
          badge={
            <Badge tone={late ? 'late' : st ? 'done' : 'neutral'}>
              {late
                ? t('debts.badgeLate')
                : st
                  ? t('debts.badgeSettled')
                  : d.direction === 'in'
                    ? t('debts.addIn')
                    : t('debts.addOut')}
            </Badge>
          }
          note={d.note || undefined}
          progress={d.amount ? debtPaid(d) / d.amount : 0}
          meta={[t('debts.left', { left: money(debtLeft(d)), total: money(d.amount) }), deadline(d.due, today, st)]}
          onOpen={() => setOpenId(d.id)}
        />
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <section aria-label={t('budget.views.debts')} className="flex flex-col gap-2.5">
        <TotalsPair
          items={[
            [t('debts.toMe'), money(toMe), 'text-ok'],
            [t('debts.iOwe'), money(iOwe), iOwe ? 'text-bad' : ''],
          ]}
        />
        <figure className="flex flex-col gap-1 border-s-[3px] border-gold ps-3 text-[0.8125rem] text-ink-2">
          <blockquote lang="ar" dir="rtl" className="font-quran text-lg leading-loose text-foreground">
            {DEBT_VERSE.ar}
          </blockquote>
          {i18n.language !== 'ar' && <p>{DEBT_VERSE.fr}</p>}
          <figcaption className={subClass}>{i18n.language === 'ar' ? DEBT_VERSE.refAr : DEBT_VERSE.refFr}</figcaption>
        </figure>
        <div className="flex flex-wrap gap-2">
          {(['in', 'out'] as const).map((dir) => (
            <Button
              key={dir}
              variant="secondary"
              className={`${btn} bg-primary-soft text-primary`}
              onClick={() => setForm({ direction: dir })}
            >
              <PlusIcon aria-hidden="true" />
              {dir === 'in' ? t('debts.addIn') : t('debts.addOut')}
            </Button>
          ))}
        </div>
      </section>

      {open.length ? (
        <Section title={t('debts.open')} aside={<span className={subClass}>{open.length}</span>}>
          <ul className="flex flex-col gap-2.5">{open.map(card)}</ul>
        </Section>
      ) : (
        <EmptyState title={t('debts.emptyTitle')}>{t('debts.emptyBody')}</EmptyState>
      )}
      {settled.length > 0 && (
        <Section title={t('debts.settled')} aside={<span className={subClass}>{settled.length}</span>}>
          <ul className="flex flex-col gap-2.5">{settled.map(card)}</ul>
        </Section>
      )}

      <AppDrawer open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current?.person ?? ''}>
        {current && (
          <DebtDetail
            debt={current}
            today={today}
            money={money}
            onEdit={() => {
              setOpenId(null)
              setForm({ edit: current })
            }}
            onDeleted={() => setOpenId(null)}
          />
        )}
      </AppDrawer>
      <AppDrawer
        open={!!form}
        onOpenChange={(o) => !o && setForm(null)}
        title={form && 'edit' in form ? t('debts.editTitle') : t('debts.new')}
      >
        {form && (
          <DebtForm target={form} currency={currencyLabel(settings.currency, lang)} onDone={() => setForm(null)} />
        )}
      </AppDrawer>
    </div>
  )
}

function DebtDetail({
  debt,
  today,
  money,
  onEdit,
  onDeleted,
}: {
  debt: Debt
  today: string
  money: (n: number) => string
  onEdit: () => void
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const deadline = useDeadlineText()
  const st = isSettled(debt)
  const left = debtLeft(debt)

  const titleId = useId()

  return (
    <>
      <section aria-labelledby={titleId} className={`${cardClass} flex flex-col gap-2.5`}>
        <h3 id={titleId} className={subClass}>
          {debt.direction === 'in' ? t('debts.leftToReceive') : t('debts.leftToPay')}
        </h3>
        <p className="tabular font-display text-[2.125rem] leading-tight font-semibold">{money(left)}</p>
        <Bar value={debt.amount ? debtPaid(debt) / debt.amount : 0} fill="bg-ok" />
        <p className={subClass}>
          {money(debtPaid(debt))} / {money(debt.amount)}
          {debt.due && ` · ${deadline(debt.due, today, st)}`}
        </p>
      </section>
      {!st && (
        <QuickAmountForm
          label={debt.direction === 'in' ? t('debts.paymentIn') : t('debts.paymentOut')}
          placeholder={String(left)}
          onAdd={(n) => addPayment(debt.id, n, today)}
        />
      )}
      <Section title={t('debts.payments')}>
        <MovementList
          items={debt.payments}
          empty={t('debts.noPayments')}
          render={(p) => ({ amount: money(p.amount), date: formatShortDate(p.date, lang) })}
          removeLabel={(p) => t('debts.removePayment', { amount: money(p.amount) })}
          onRemove={(i) => void removePayment(debt.id, i)}
        />
      </Section>
      <div className="flex flex-wrap gap-2">
        {!st ? (
          <Button
            variant="secondary"
            className={`${btn} bg-primary-soft text-primary`}
            onClick={() => void setClosed(debt.id, true)}
          >
            {t('debts.close')}
          </Button>
        ) : (
          debt.closed && (
            <Button variant="secondary" className={btn} onClick={() => void setClosed(debt.id, false)}>
              {t('debts.reopen')}
            </Button>
          )
        )}
        <Button variant="secondary" className={btn} onClick={onEdit}>
          {t('debts.edit')}
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" className={btn}>
              <Trash2Icon aria-hidden="true" />
              {t('debts.delete')}
            </Button>
          }
          title={t('debts.deleteTitle')}
          body={t('debts.deleteBody')}
          confirm={t('debts.delete')}
          cancel={t('budget.form.cancel')}
          onConfirm={() => void deleteDebt(debt.id).then(onDeleted)}
        />
      </div>
    </>
  )
}

function DebtForm({ target, currency, onDone }: { target: FormTarget; currency: string; onDone: () => void }) {
  const { t } = useTranslation()
  const editing = 'edit' in target ? target.edit : null
  const schema = z.object({
    direction: z.enum(['in', 'out']),
    person: z.string().trim().min(1, 'errors.person').max(60, 'errors.tooLong?max=60'),
    amount: z.string().refine((v) => parseAmount(v) > 0, 'errors.amount'),
    due: z.string(),
    note: z.string().max(80, 'errors.tooLong?max=80'),
  })
  const form = useForm({
    defaultValues: {
      direction: editing?.direction ?? ('direction' in target ? target.direction : 'out'),
      person: editing?.person ?? '',
      amount: editing ? String(editing.amount) : '',
      due: editing?.due ?? '',
      note: editing?.note ?? '',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await saveDebt(
        { ...value, person: value.person.trim(), note: value.note.trim(), amount: parseAmount(value.amount) },
        editing?.id,
      )
      toast(t('debts.saved'))
      onDone()
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="direction">
        {(field) => (
          <ChipGroup
            label={t('debts.direction')}
            value={field.state.value}
            onChange={field.handleChange}
            options={[
              { value: 'in', label: t('debts.addIn') },
              { value: 'out', label: t('debts.addOut') },
            ]}
          />
        )}
      </form.Field>
      <form.Field name="person">
        {(field) => (
          <Field label={t('debts.person')} errors={field.state.meta.errors}>
            {(p) => (
              <Input
                {...p}
                autoFocus={!editing}
                className={inputClass}
                maxLength={60}
                placeholder={t('debts.personPlaceholder')}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="amount">
        {(field) => (
          <Field label={t('budget.form.amount')} errors={field.state.meta.errors}>
            {(p) => (
              <AmountInput
                {...p}
                currency={currency}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-2.5">
        <form.Field name="due">
          {(field) => (
            <Field label={t('debts.due')}>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  dir="ltr"
                  className={inputClass}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="note">
          {(field) => (
            <Field label={t('budget.form.note')} errors={field.state.meta.errors}>
              {(p) => (
                <Input
                  {...p}
                  className={inputClass}
                  maxLength={80}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
      </div>
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {editing ? t('budget.form.save') : t('budget.form.add')}
      </Button>
    </form>
  )
}
