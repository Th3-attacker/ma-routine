import { useTranslation } from 'react-i18next'

import { Field, inputClass } from '@/components/Field'
import { Input } from '@/components/ui/input'

export function OtpCodeField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (code: string) => void
  error: string | null
}) {
  const { t } = useTranslation()
  return (
    <Field label={t('account.code')} errors={error ? [error] : undefined}>
      {(p) => (
        <Input
          {...p}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          dir="ltr"
          className={`${inputClass} tabular text-center font-display text-2xl tracking-[0.4em]`}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        />
      )}
    </Field>
  )
}
