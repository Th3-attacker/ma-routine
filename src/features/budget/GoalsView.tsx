import { useForm } from '@tanstack/react-form'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { usePreferences } from '@/app/PreferencesProvider'
import { AmountInput } from '@/components/AmountInput'
import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { ColorPicker } from '@/components/ColorPicker'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Field, inputClass, labelClass } from '@/components/Field'
import { Badge, EmptyState, ItemCard, TotalsPair } from '@/components/ItemCard'
import { MovementList } from '@/components/MovementList'
import { cardClass, Section, subClass } from '@/components/Section'
import { ToggleChip } from '@/components/ToggleChip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { SavingsGoal, Settings } from '@/db/types'
import { formatShortDate } from '@/lib/dates'
import { currencyLabel, formatMoney, parseAmount } from '@/lib/money'
import { cn } from '@/lib/utils'
import { useDeadlineText } from '@/lib/useDeadlineText'

import { QuickAmountForm } from './QuickAmountForm'
import {
  addMove,
  deleteGoal,
  GOAL_TEMPLATES,
  goalLeft,
  goalReached,
  goalSaved,
  monthlyToSave,
  removeMove,
  saveGoal,
  useGoals,
} from './savings'

const btn = 'h-11 flex-auto rounded-[14px] font-bold'

/** Budget → Épargne : total, objectifs avec progression et montant mensuel, détail et formulaire. */
export function GoalsView({ today, settings }: { today: string; settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const goals = useGoals()
  const deadline = useDeadlineText()
  const [openId, setOpenId] = useState<string | null>(null)
  const [form, setForm] = useState<{ edit?: SavingsGoal } | null>(null)
  const money = (n: number, sign = false) => formatMoney(n, settings.currency, lang, sign)

  if (!goals) return <Skeleton className="h-40 w-full rounded-xl" />
  const total = goals.reduce((a, g) => a + goalSaved(g), 0)
  const current = goals.find((g) => g.id === openId) ?? null

  return (
    <div className="flex flex-col gap-[22px]">
      <section aria-label={t('budget.views.goals')} className="flex flex-col gap-2.5">
        <TotalsPair
          items={[
            [t('goals.total'), money(total), 'text-ok'],
            [t('goals.count'), String(goals.length)],
          ]}
        />
        <Button className="h-11 rounded-[14px] font-bold" onClick={() => setForm({})}>
          <PlusIcon aria-hidden="true" />
          {t('goals.new')}
        </Button>
      </section>

      {goals.length ? (
        <ul className="flex flex-col gap-2.5">
          {goals.map((g) => {
            const saved = goalSaved(g)
            const reached = goalReached(g)
            const pct = g.target ? Math.max(0, Math.min(100, Math.round((saved / g.target) * 100))) : 0
            const pm = monthlyToSave(g, today)
            return (
              <li key={g.id}>
                <ItemCard
                  color={g.color}
                  title={g.name}
                  badge={reached ? <Badge tone="done">{t('goals.reached')}</Badge> : undefined}
                  progress={pct / 100}
                  meta={[
                    t('goals.progress', { saved: money(saved), target: money(g.target), pct }),
                    pm ? t('goals.perMonth', { amount: money(pm) }) : deadline(g.deadline, today, reached),
                  ]}
                  onOpen={() => setOpenId(g.id)}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState title={t('goals.emptyTitle')}>{t('goals.emptyBody')}</EmptyState>
      )}

      <AppDrawer open={!!current} onOpenChange={(o) => !o && setOpenId(null)} title={current?.name ?? ''}>
        {current && (
          <GoalDetail
            goal={current}
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
        title={form?.edit ? t('goals.editTitle') : t('goals.new')}
      >
        {form && (
          <GoalForm
            editing={form.edit ?? null}
            currency={currencyLabel(settings.currency, lang)}
            onDone={() => setForm(null)}
          />
        )}
      </AppDrawer>
    </div>
  )
}

function GoalDetail({
  goal,
  today,
  money,
  onEdit,
  onDeleted,
}: {
  goal: SavingsGoal
  today: string
  money: (n: number, sign?: boolean) => string
  onEdit: () => void
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const [move, setMove] = useState<'add' | 'take'>('add')
  const saved = goalSaved(goal)
  const left = goalLeft(goal)
  const pct = goal.target ? Math.max(0, Math.min(100, Math.round((saved / goal.target) * 100))) : 0
  const pm = monthlyToSave(goal, today)

  return (
    <>
      <section className={`${cardClass} flex flex-col gap-2.5`}>
        <h3 className={subClass}>{t('goals.saved')}</h3>
        <p className="tabular font-display text-[2.125rem] leading-tight font-semibold">{money(saved)}</p>
        <span className="block h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <i className="block h-full rounded-full" style={{ width: `${pct}%`, background: `var(${goal.color})` }} />
        </span>
        <p className={subClass}>
          {t('goals.ofTarget', {
            pct,
            target: money(goal.target),
            status: left > 0 ? t('goals.rest', { amount: money(left) }) : t('goals.done'),
          })}
        </p>
        {pm > 0 && <p className={subClass}>{t('goals.putAside', { amount: money(pm) })}</p>}
      </section>
      <div className="flex flex-col gap-2.5">
        <ChipGroup
          label={t('goals.moveType')}
          value={move}
          onChange={setMove}
          options={[
            { value: 'add', label: t('goals.deposit') },
            { value: 'take', label: t('goals.withdraw') },
          ]}
        />
        <QuickAmountForm
          label={t('budget.form.amount')}
          onAdd={(n) => addMove(goal.id, move === 'take' ? -n : n, today)}
        />
      </div>
      <Section title={t('goals.history')}>
        <MovementList
          items={goal.moves}
          empty={t('goals.noMoves')}
          render={(m) => ({
            amount: money(m.amount, true),
            date: formatShortDate(m.date, lang),
            tone: m.amount < 0 ? 'neg' : 'pos',
          })}
          removeLabel={(m) => t('goals.removeMove', { amount: money(m.amount) })}
          onRemove={(i) => void removeMove(goal.id, i)}
        />
      </Section>
      <div className="flex flex-wrap gap-2">
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
          title={t('goals.deleteTitle')}
          body={t('goals.deleteBody')}
          confirm={t('debts.delete')}
          cancel={t('budget.form.cancel')}
          onConfirm={() => void deleteGoal(goal.id).then(onDeleted)}
        />
      </div>
    </>
  )
}

function GoalForm({
  editing,
  currency,
  onDone,
}: {
  editing: SavingsGoal | null
  currency: string
  onDone: () => void
}) {
  const { t } = useTranslation()
  const schema = z.object({
    name: z.string().trim().min(1, 'errors.goalName').max(60, 'errors.tooLong?max=60'),
    target: z.string().refine((v) => parseAmount(v) > 0, 'errors.amount'),
    deadline: z.string(),
    color: z.string(),
  })
  const form = useForm({
    defaultValues: {
      name: editing?.name ?? '',
      target: editing ? String(editing.target) : '',
      deadline: editing?.deadline ?? '',
      color: editing?.color ?? '--c7',
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await saveGoal({ ...value, name: value.name.trim(), target: parseAmount(value.target) }, editing?.id)
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
      {!editing && (
        <fieldset className="flex min-w-0 flex-col gap-[7px]">
          <legend className={cn(labelClass, 'mb-[7px]')}>{t('goals.ideas')}</legend>
          <ul className="flex flex-wrap gap-1.5">
            {GOAL_TEMPLATES.map((k) => (
              <li key={k}>
                <ToggleChip pressed={false} onToggle={() => form.setFieldValue('name', t(`goals.templates.${k}`))}>
                  {t(`goals.templates.${k}`)}
                </ToggleChip>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      <form.Field name="name">
        {(field) => (
          <Field label={t('goals.name')} errors={field.state.meta.errors}>
            {(p) => (
              <Input
                {...p}
                className={inputClass}
                maxLength={60}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </Field>
        )}
      </form.Field>
      <form.Field name="target">
        {(field) => (
          <Field label={t('goals.target')} errors={field.state.meta.errors}>
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
      <form.Field name="deadline">
        {(field) => (
          <Field label={t('goals.deadline')}>
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
      <form.Field name="color">
        {(field) => <ColorPicker label={t('goals.color')} value={field.state.value} onChange={field.handleChange} />}
      </form.Field>
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {editing ? t('budget.form.save') : t('goals.create')}
      </Button>
    </form>
  )
}
