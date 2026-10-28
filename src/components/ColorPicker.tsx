import { useTranslation } from 'react-i18next'

import { PICK_COLORS } from '@/features/budget/categories'

import { ChipGroup } from './ChipGroup'

export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  return (
    <ChipGroup
      label={label}
      value={value}
      onChange={onChange}
      options={PICK_COLORS.map((c) => ({
        value: c,
        label: (
          <>
            <i aria-hidden="true" className="size-4 rounded-full" style={{ background: `var(${c})` }} />
            <span className="sr-only">{t(`colors.${c.slice(2)}` as never)}</span>
          </>
        ),
      }))}
    />
  )
}
