import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/AppDrawer'
import { AppSelect } from '@/components/AppSelect'
import { ColorDot } from '@/components/ColorDot'
import { Field, inputClass } from '@/components/Field'
import { Section, subClass } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseAmount } from '@/lib/money'
import { cn } from '@/lib/utils'

import { categoryColor, CATEGORIES } from './categories'
import { moveBetween, previousAllocation, setAllocation, setEnvelope, type EnvelopeMonth } from './envelopes'
import { QuickAmountForm } from './QuickAmountForm'

type Money = (n: number, sign?: boolean) => string

/** Carte « À répartir » : revenus du mois (et reste reporté) moins ce qui est mis dans les enveloppes. */
export function ToAssignCard({ state, money, onAssign }: { state: EnvelopeMonth; money: Money; onAssign: () => void }) {
  const { t } = useTranslation()
  const tone = state.toAssign === 0 ? 'ok' : state.toAssign > 0 ? 'warn' : 'bad'
  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-surface-2 p-3.5">
      <p className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold">{t('envelopes.toAssign')}</span>
        <span
          className={cn(
            'tabular font-display text-[1.5rem] font-semibold',
            tone === 'ok' ? 'text-ok' : tone === 'bad' ? 'text-bad' : 'text-warn',
          )}
        >
          {money(state.toAssign)}
        </span>
      </p>
      <p className={subClass} role="status">
        {t(
          tone === 'ok'
            ? 'envelopes.allAssigned'
            : tone === 'bad'
              ? 'envelopes.overAssigned'
              : 'envelopes.leftToAssign',
        )}
      </p>
      <Button
        variant="secondary"
        className="h-11 rounded-[14px] bg-primary-soft font-bold text-primary"
        onClick={onAssign}
      >
        {t('envelopes.assign')}
      </Button>
    </div>
  )
}

/** Liste des enveloppes : disponible en grand, mis et dépensé en petit ; un toucher ouvre l'enveloppe. */
export function EnvelopeList({
  state,
  money,
  onOpen,
}: {
  state: EnvelopeMonth
  money: Money
  onOpen: (id: string) => void
}) {
  const { t } = useTranslation()
  const shown = state.envelopes.filter((e) => e.assigned || e.spent || e.available)
  if (!shown.length) return null
  return (
    <Section title={t('envelopes.title')}>
      <ul className="overflow-hidden rounded-xl bg-card shadow-card">
        {shown.map((e) => {
          const total = e.available + e.spent
          return (
            <li key={e.id} className="border-t border-line first:border-t-0">
              <button
                type="button"
                onClick={() => onOpen(e.id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-1 px-3.5 py-2.5 text-start"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <ColorDot color={categoryColor(e.id)} />
                  <span className="truncate">{t(`categories.${e.id}` as never)}</span>
                </span>
                <span className={cn('tabular text-end text-[0.9375rem] font-extrabold', e.available < 0 && 'text-bad')}>
                  {money(e.available)}
                </span>
                <span className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <i
                    className={cn('block h-full rounded-full', e.available < 0 && 'bg-bad')}
                    style={{
                      width: `${total > 0 ? Math.min(100, (e.spent / total) * 100) : e.spent ? 100 : 0}%`,
                      background: e.available < 0 ? undefined : `var(${categoryColor(e.id)})`,
                    }}
                  />
                </span>
                <span className="col-span-2 text-[0.78125rem] text-muted-foreground">
                  {e.available < 0
                    ? t('envelopes.overspent', { amount: money(-e.available) })
                    : t('envelopes.detail', { assigned: money(e.assigned), spent: money(e.spent) })}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/** Une enveloppe : changer le montant mis ce mois-ci, ou déplacer de l'argent vers une autre. */
export function EnvelopeDrawer({
  month,
  state,
  id,
  money,
  onClose,
}: {
  month: string
  state: EnvelopeMonth
  id: string | null
  money: Money
  onClose: () => void
}) {
  const { t } = useTranslation()
  const e = state.envelopes.find((x) => x.id === id)
  const others = CATEGORIES.out.filter((c) => c.id !== id)
  const [to, setTo] = useState(others[0]?.id ?? '')
  return (
    <AppDrawer
      open={!!e}
      onOpenChange={(o) => !o && onClose()}
      title={e ? t(`categories.${e.id}` as never) : ''}
      description={e ? `${t('envelopes.available')} : ${money(e.available)}` : undefined}
    >
      {e && (
        <>
          <QuickAmountForm
            key={`set-${e.id}`}
            label={t('envelopes.setLabel')}
            placeholder={String(e.assigned || '')}
            submitLabel={t('envelopes.save')}
            onAdd={async (n) => {
              await setEnvelope(month, e.id, n)
              toast(t('envelopes.saved'))
            }}
          />
          <section aria-labelledby="env-move" className="flex flex-col gap-3">
            <h3 id="env-move" className="font-bold">
              {t('envelopes.moveTitle')}
            </h3>
            <Field label={t('envelopes.moveTo')}>
              {(p) => (
                <AppSelect
                  {...p}
                  value={to}
                  onChange={setTo}
                  options={others.map((c) => ({ value: c.id, label: t(`categories.${c.id}` as never) }))}
                />
              )}
            </Field>
            <QuickAmountForm
              key={`move-${e.id}`}
              label={t('envelopes.moveAmount')}
              submitLabel={t('envelopes.move')}
              onAdd={async (n) => {
                await moveBetween(month, e.id, to, n)
                toast(t('envelopes.moved'))
              }}
            />
          </section>
        </>
      )}
    </AppDrawer>
  )
}

/** Répartir les revenus du mois dans toutes les enveloppes, avec le reste à répartir qui se met à jour. */
export function AssignDrawer({
  month,
  state,
  fallback,
  open,
  money,
  onOpenChange,
}: {
  month: string
  state: EnvelopeMonth
  /** Anciens budgets fixes, proposés par « Comme le mois dernier » s'il n'y a rien le mois précédent. */
  fallback: Record<string, number>
  open: boolean
  money: Money
  onOpenChange: (o: boolean) => void
}) {
  const { t } = useTranslation()
  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('envelopes.assign')}
      description={t('envelopes.assignHint')}
      tall
    >
      {open && (
        <AssignForm month={month} state={state} fallback={fallback} money={money} onDone={() => onOpenChange(false)} />
      )}
    </AppDrawer>
  )
}

function AssignForm({
  month,
  state,
  fallback,
  money,
  onDone,
}: {
  month: string
  state: EnvelopeMonth
  fallback: Record<string, number>
  money: Money
  onDone: () => void
}) {
  const { t } = useTranslation()
  const start = Object.fromEntries(state.envelopes.map((e) => [e.id, e.assigned ? String(e.assigned) : '']))
  const [values, setValues] = useState<Record<string, string>>(start)
  const amount = (v: string | undefined) => {
    const n = parseAmount(v ?? '')
    return n > 0 ? n : 0
  }
  const sum = Object.values(values).reduce((a, v) => a + amount(v), 0)
  const remaining = state.toAssign + state.assigned - sum

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(ev) => {
        ev.preventDefault()
        void setAllocation(month, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, amount(v)]))).then(
          () => {
            toast(t('envelopes.saved'))
            onDone()
          },
        )
      }}
    >
      <p
        role="status"
        className={cn(
          'sticky top-0 z-10 rounded-[12px] bg-surface-2 px-3 py-2 text-sm font-bold',
          remaining === 0 ? 'text-ok' : remaining < 0 ? 'text-bad' : 'text-warn',
        )}
      >
        {t('envelopes.remaining', { amount: money(remaining) })}
      </p>
      <Button
        type="button"
        variant="secondary"
        className="h-11 rounded-[14px] font-bold"
        onClick={() =>
          void previousAllocation(month, fallback).then((prev) =>
            setValues(Object.fromEntries(CATEGORIES.out.map((c) => [c.id, prev[c.id] ? String(prev[c.id]) : '']))),
          )
        }
      >
        {t('envelopes.copyLast')}
      </Button>
      {CATEGORIES.out.map((c) => (
        <Field
          key={c.id}
          label={
            <span className="inline-flex items-center gap-2">
              <ColorDot color={c.color} />
              {t(`categories.${c.id}` as never)}
            </span>
          }
        >
          {(p) => (
            <Input
              {...p}
              className={inputClass}
              inputMode="numeric"
              enterKeyHint="next"
              dir="ltr"
              placeholder="0"
              value={values[c.id] ?? ''}
              onChange={(ev) => setValues((v) => ({ ...v, [c.id]: ev.target.value }))}
            />
          )}
        </Field>
      ))}
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {t('envelopes.save')}
      </Button>
    </form>
  )
}
