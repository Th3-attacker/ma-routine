import { useForm } from '@tanstack/react-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { AmountInput } from '@/components/AmountInput'
import { AppSelect } from '@/components/AppSelect'
import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { ColorDot } from '@/components/ColorDot'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Field, inputClass } from '@/components/Field'
import { EmptyState, TotalsPair } from '@/components/ItemCard'
import { subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { Recurring, Settings } from '@/db/types'
import { currencyLabel, formatMoney, parseAmount } from '@/lib/money'
import { cn } from '@/lib/utils'

import { categoryColor } from './categories'
import { CategoryChoice, PayMethodChoice, TypeChoice } from './MoneyChoices'
import { deleteRecurring, isFinished, recurringTotals, saveRecurring, setActive, useRecurring } from './recurring'

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

export function RecurringView({ today, settings }: { today: string; settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const items = useRecurring()
  const [form, setForm] = useState<{ edit?: Recurring } | null>(null)
  const money = (n: number, sign = false) => formatMoney(n, settings.currency, lang, sign)

  if (!items) return <Skeleton className="h-40 w-full rounded-xl" />
  const totals = recurringTotals(items)

  return (
    <div className="flex flex-col gap-[22px]">
      <section aria-label={t('budget.views.rec')} className="flex flex-col gap-2.5">
        <TotalsPair
          items={[
            [t('rec.out'), money(totals.out)],
            [t('rec.in'), money(totals.in), 'text-ok'],
          ]}
        />
        <p className={subClass}>{t('rec.hint')}</p>
        <Button className="h-11 rounded-[14px] font-bold" onClick={() => setForm({})}>
          <PlusIcon aria-hidden="true" />
          {t('rec.new')}
        </Button>
      </section>

      {items.length ? (
        <ul className="overflow-hidden rounded-xl bg-card shadow-card">
          {items.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 first:border-t-0">
              <button type="button" className="min-h-11 min-w-0 flex-1 text-start" onClick={() => setForm({ edit: r })}>
                <span className="flex items-center gap-2 text-[0.90625rem] font-semibold">
                  <ColorDot color={categoryColor(r.category)} />
                  <span className="truncate">{r.name}</span>
                </span>
                <span className="block truncate text-[0.78125rem] text-muted-foreground">
                  {t('rec.every', { day: r.day })} ·{' '}
                  {r.months == null
                    ? t('rec.always')
                    : isFinished(r)
                      ? t('rec.finished')
                      : t('rec.progress', { count: r.count ?? 0, months: r.months })}{' '}
                  · {t(`categories.${r.category}` as never)}
                </span>
              </button>
              <span
                dir="ltr"
                className={cn(
                  'tabular font-extrabold whitespace-nowrap',
                  r.type === 'in' && 'text-ok',
                  !r.active && 'opacity-50',
                )}
              >
                {r.type === 'in' ? money(r.amount, true) : money(-r.amount)}
              </span>
              <Switch
                checked={r.active}
                aria-label={t('rec.toggle', { name: r.name })}
                onCheckedChange={(v) => void setActive(r.id, v, today)}
                className="data-checked:bg-ok"
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t('rec.emptyTitle')}>{t('rec.emptyBody')}</EmptyState>
      )}

      <AppDrawer
        open={!!form}
        onOpenChange={(o) => !o && setForm(null)}
        title={form?.edit ? t('rec.edit') : t('rec.title')}
      >
        {form && (
          <RecurringForm
            editing={form.edit ?? null}
            today={today}
            currency={currencyLabel(settings.currency, lang)}
            onDone={() => setForm(null)}
          />
        )}
      </AppDrawer>
    </div>
  )
}

function RecurringForm({
  editing,
  today,
  currency,
  onDone,
}: {
  editing: Recurring | null
  today: string
  currency: string
  onDone: () => void
}) {
  const { t } = useTranslation()
  // Durée : « toujours », ou un nombre de mois de 1 à 120 (ex. 11 pour un traitement).
  const schema = z
    .object({
      type: z.enum(['out', 'in']),
      name: z.string().trim().min(1, 'errors.recName').max(60, 'errors.tooLong?max=60'),
      amount: z.string().refine((v) => parseAmount(v) > 0, 'errors.amount'),
      day: z.string(),
      duration: z.enum(['always', 'months']),
      months: z.string(),
      category: z.string(),
      payMethod: z.string(),
    })
    .refine(
      (v) => v.duration === 'always' || (Number.isInteger(Number(v.months)) && +v.months >= 1 && +v.months <= 120),
      {
        path: ['months'],
        message: 'errors.range?min=1&max=120',
      },
    )
  const form = useForm({
    defaultValues: {
      type: editing?.type ?? ('out' as 'out' | 'in'),
      name: editing?.name ?? '',
      amount: editing ? String(editing.amount) : '',
      day: String(editing?.day ?? 1),
      duration: (editing?.months != null ? 'months' : 'always') as 'always' | 'months',
      months: editing?.months != null ? String(editing.months) : '',
      category: editing?.category ?? 'home',
      payMethod: editing?.payMethod ?? 'cash',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const { duration, months, ...rest } = value
      await saveRecurring(
        {
          ...rest,
          name: value.name.trim(),
          amount: parseAmount(value.amount),
          day: Number(value.day),
          months: duration === 'months' ? Number(months) : null,
        },
        today,
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
      <form.Field name="type">
        {(field) => (
          <TypeChoice
            value={field.state.value}
            onChange={(v) => {
              field.handleChange(v)
              form.setFieldValue('category', v === 'in' ? 'salary' : 'home')
            }}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(s) => s.values.type}>
        {(type) => (
          <form.Field name="name">
            {(field) => (
              <Field label={t('rec.name')} errors={field.state.meta.errors}>
                {(p) => (
                  <Input
                    {...p}
                    className={inputClass}
                    maxLength={60}
                    placeholder={type === 'in' ? t('rec.namePlaceholderIn') : t('rec.namePlaceholderOut')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </Field>
            )}
          </form.Field>
        )}
      </form.Subscribe>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
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
        <form.Field name="day">
          {(field) => (
            <Field label={t('rec.day')}>
              {(p) => (
                <AppSelect
                  {...p}
                  className="w-24"
                  value={field.state.value}
                  onChange={field.handleChange}
                  options={DAYS.map((d) => ({ value: String(d), label: String(d) }))}
                />
              )}
            </Field>
          )}
        </form.Field>
      </div>
      <form.Field name="duration">
        {(field) => (
          <ChipGroup
            label={t('rec.duration')}
            value={field.state.value}
            onChange={field.handleChange}
            options={[
              { value: 'always', label: t('rec.always') },
              { value: 'months', label: t('rec.forMonths') },
            ]}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(s) => s.values.duration}>
        {(duration) =>
          duration === 'months' && (
            <form.Field name="months">
              {(field) => (
                <Field label={t('rec.monthsField')} errors={field.state.meta.errors}>
                  {(p) => (
                    <Input
                      {...p}
                      className={`${inputClass} w-32`}
                      inputMode="numeric"
                      dir="ltr"
                      placeholder="11"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                    />
                  )}
                </Field>
              )}
            </form.Field>
          )
        }
      </form.Subscribe>
      <form.Subscribe selector={(s) => s.values.type}>
        {(type) => (
          <form.Field name="category">
            {(field) => <CategoryChoice type={type} value={field.state.value} onChange={field.handleChange} />}
          </form.Field>
        )}
      </form.Subscribe>
      <form.Field name="payMethod">
        {(field) => <PayMethodChoice value={field.state.value} onChange={field.handleChange} />}
      </form.Field>
      <p className={subClass}>{t('rec.formHint')}</p>
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {editing ? t('budget.form.save') : t('budget.form.add')}
      </Button>
      {editing && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="destructive" className="h-12 rounded-[14px] font-bold">
              <Trash2Icon aria-hidden="true" />
              {t('debts.delete')}
            </Button>
          }
          title={t('rec.deleteTitle')}
          body={t('rec.deleteBody')}
          confirm={t('debts.delete')}
          cancel={t('budget.form.cancel')}
          onConfirm={() => void deleteRecurring(editing.id).then(onDone)}
        />
      )}
    </form>
  )
}
