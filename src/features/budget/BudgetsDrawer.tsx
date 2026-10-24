import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/AppDrawer'
import { ColorDot } from '@/components/ColorDot'
import { Field, inputClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateSettings } from '@/db/settings'
import { parseAmount } from '@/lib/money'

import { CATEGORIES } from './categories'

/** Budgets mensuels par catégorie de dépense (vide = pas suivi). */
export function BudgetsDrawer({
  open,
  onOpenChange,
  budgets,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  budgets: Record<string, number>
}) {
  const { t } = useTranslation()
  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('budget.budgetsTitle')}
      description={t('budget.budgetsHint')}
    >
      {open && <BudgetsForm budgets={budgets} onDone={() => onOpenChange(false)} />}
    </AppDrawer>
  )
}

function BudgetsForm({ budgets, onDone }: { budgets: Record<string, number>; onDone: () => void }) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: Object.fromEntries(CATEGORIES.out.map((c) => [c.id, budgets[c.id] ? String(budgets[c.id]) : ''])),
    onSubmit: async ({ value }) => {
      const next: Record<string, number> = {}
      for (const [k, v] of Object.entries(value)) if (v.trim() && parseAmount(v) > 0) next[k] = parseAmount(v)
      await updateSettings({ budgets: next })
      toast(t('budget.budgetsSaved'))
      onDone()
    },
  })
  const valid = (v: string) => (v.trim() === '' || !Number.isNaN(parseAmount(v)) ? undefined : 'errors.budget')

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      {CATEGORIES.out.map((c) => (
        <form.Field key={c.id} name={c.id} validators={{ onSubmit: ({ value }) => valid(value) }}>
          {(field) => (
            <Field
              label={
                <span className="inline-flex items-center gap-2">
                  <ColorDot color={c.color} />
                  {t(`categories.${c.id}` as never)}
                </span>
              }
              errors={field.state.meta.errors}
            >
              {(p) => (
                <Input
                  {...p}
                  className={inputClass}
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="0"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </Field>
          )}
        </form.Field>
      ))}
      <Button type="submit" className="h-12 rounded-[14px] text-[0.9375rem] font-bold">
        {t('budget.form.save')}
      </Button>
    </form>
  )
}
