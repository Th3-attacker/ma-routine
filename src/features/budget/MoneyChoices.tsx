import { useTranslation } from 'react-i18next'

import { ChipGroup } from '@/components/ChipGroup'
import { ColorDot } from '@/components/ColorDot'
import type { MoneyType } from '@/db/types'

import { CATEGORIES, PAY_METHODS } from './categories'

export function TypeChoice({ value, onChange }: { value: MoneyType; onChange: (v: MoneyType) => void }) {
  const { t } = useTranslation()
  return (
    <ChipGroup
      label={t('budget.form.type')}
      value={value}
      onChange={onChange}
      options={[
        { value: 'out', label: t('budget.addOut') },
        { value: 'in', label: t('budget.addIn') },
      ]}
    />
  )
}

export function CategoryChoice({
  type,
  value,
  onChange,
}: {
  type: MoneyType
  value: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  return (
    <ChipGroup
      label={t('budget.form.category')}
      value={value}
      onChange={onChange}
      options={CATEGORIES[type].map((c) => ({
        value: c.id,
        label: (
          <>
            <ColorDot color={c.color} />
            {t(`categories.${c.id}` as never)}
          </>
        ),
      }))}
    />
  )
}

export function PayMethodChoice({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  return (
    <ChipGroup
      label={t('budget.form.payMethod')}
      value={value}
      onChange={onChange}
      options={PAY_METHODS.map((m) => ({ value: m, label: t(`payMethods.${m}`) }))}
    />
  )
}
