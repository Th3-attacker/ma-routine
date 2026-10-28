import { useForm } from '@tanstack/react-form'
import { Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { AmountInput } from '@/components/AmountInput'
import { AppDrawer } from '@/components/AppDrawer'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { MoneyType, Transaction } from '@/db/types'
import { currencyLabel, parseAmount } from '@/lib/money'

import { CategoryChoice, PayMethodChoice, TypeChoice } from './MoneyChoices'
import { addTransaction, deleteTransaction, editTransaction } from './transactions'

export type TxTarget = { type: MoneyType } | { edit: Transaction }

const btn = 'h-12 w-full rounded-[14px] text-[0.9375rem] font-bold'

export function TransactionDrawer({
  target,
  today,
  currency,
  onClose,
}: {
  target: TxTarget | null
  /** Jour actuel dans le fuseau de la ville : la date ne peut pas être après. */
  today: string
  currency: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const editing = target && 'edit' in target ? target.edit : null
  const type = editing?.type ?? (target && 'type' in target ? target.type : 'out')
  const title = editing ? t('budget.form.edit') : type === 'in' ? t('budget.form.newIn') : t('budget.form.newOut')

  return (
    <AppDrawer open={!!target} onOpenChange={(o) => !o && onClose()} title={title}>
      {target && (
        <TxForm
          key={editing?.id ?? type}
          editing={editing}
          initialType={type}
          today={today}
          currency={currency}
          onDone={onClose}
        />
      )}
    </AppDrawer>
  )
}

function TxForm({
  editing,
  initialType,
  today,
  currency,
  onDone,
}: {
  editing: Transaction | null
  initialType: MoneyType
  today: string
  currency: string
  onDone: () => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()

  const schema = z.object({
    type: z.enum(['out', 'in']),
    amount: z.string().refine((v) => parseAmount(v) > 0, 'errors.amount'),
    category: z.string(),
    payMethod: z.string(),
    note: z.string().max(80, 'errors.tooLong?max=80'),
    date: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && v <= today, 'errors.date'),
  })

  const form = useForm({
    defaultValues: {
      type: initialType,
      amount: editing ? String(editing.amount) : '',
      category: editing?.category ?? (initialType === 'in' ? 'salary' : 'food'),
      payMethod: editing?.payMethod ?? 'cash',
      note: editing?.note ?? '',
      date: editing?.date ?? today,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const input = { ...value, amount: parseAmount(value.amount), note: value.note.trim() }
      if (editing) await editTransaction(editing.id, input)
      else await addTransaction(input)
      toast(
        editing
          ? t('budget.toast.edited')
          : value.type === 'in'
            ? t('budget.toast.addedIn')
            : t('budget.toast.addedOut'),
      )
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
              form.setFieldValue('category', v === 'in' ? 'salary' : 'food')
            }}
          />
        )}
      </form.Field>
      <form.Field name="amount">
        {(field) => (
          <Field label={t('budget.form.amount')} errors={field.state.meta.errors}>
            {(p) => (
              <AmountInput
                {...p}
                autoFocus={!editing}
                currency={currencyLabel(currency, lang)}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </Field>
        )}
      </form.Field>
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
      <div className="grid grid-cols-2 gap-2.5">
        <form.Field name="note">
          {(field) => (
            <Field label={t('budget.form.note')} errors={field.state.meta.errors}>
              {(p) => (
                <form.Subscribe selector={(s) => s.values.type}>
                  {(type) => (
                    <Input
                      {...p}
                      className={inputClass}
                      maxLength={80}
                      placeholder={
                        type === 'in' ? t('budget.form.notePlaceholderIn') : t('budget.form.notePlaceholderOut')
                      }
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </form.Subscribe>
              )}
            </Field>
          )}
        </form.Field>
        <form.Field name="date">
          {(field) => (
            <Field label={t('budget.form.date')} errors={field.state.meta.errors}>
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  dir="ltr"
                  max={today}
                  className={inputClass}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
      </div>
      <Button type="submit" className={btn}>
        {editing ? t('budget.form.save') : t('budget.form.add')}
      </Button>
      {editing && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="destructive" className={btn}>
              <Trash2Icon aria-hidden="true" />
              {t('budget.form.delete')}
            </Button>
          }
          title={t('budget.form.deleteTitle')}
          body={t('budget.form.deleteBody')}
          confirm={t('budget.form.delete')}
          cancel={t('budget.form.cancel')}
          onConfirm={() => {
            void deleteTransaction(editing.id).then(() => {
              toast(t('budget.toast.deleted'))
              onDone()
            })
          }}
        />
      )}
    </form>
  )
}
