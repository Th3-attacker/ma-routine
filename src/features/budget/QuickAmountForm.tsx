import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { inputClass, labelClass } from '@/components/Field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { translateError } from '@/lib/errors'
import { parseAmount } from '@/lib/money'

/** Petit formulaire « montant + Ajouter » (remboursement, versement). */
export function QuickAmountForm({
  label,
  placeholder,
  onAdd,
}: {
  label: string
  placeholder?: string
  onAdd: (amount: number) => Promise<unknown>
}) {
  const { t } = useTranslation()
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  return (
    <form
      noValidate
      className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5"
      onSubmit={(e) => {
        e.preventDefault()
        const n = parseAmount(value)
        if (!(n > 0)) {
          setError(true)
          return
        }
        setError(false)
        void onAdd(n).then(() => setValue(''))
      }}
    >
      <div className="flex min-w-0 flex-col gap-[7px]">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <Input
          id={id}
          className={inputClass}
          inputMode="numeric"
          dir="ltr"
          placeholder={placeholder ?? '0'}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" className="h-11 rounded-[14px] font-bold">
        {t('budget.form.add')}
      </Button>
      {error && (
        <p id={`${id}-err`} className="col-span-2 text-[0.8125rem] font-semibold text-bad">
          {translateError(t, 'errors.amount')}
        </p>
      )}
    </form>
  )
}
