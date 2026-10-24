import type { ReactNode } from 'react'

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

import { inputClass } from './Field'

/**
 * Liste déroulante native : la roue de sélection d'iOS ou la liste d'Android. Fiable dans les volets du bas
 * (une liste dessinée par l'app ne défile pas dans un volet sur iPhone).
 */
export function AppSelect<T extends string>({
  value,
  onChange,
  options,
  className,
  ...control
}: {
  value: T
  onChange: (v: T) => void
  options: readonly { value: T; label: ReactNode }[]
  className?: string
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  disabled?: boolean
}) {
  return (
    <NativeSelect
      {...control}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn('w-full', className)}
      selectClassName={cn(inputClass, 'h-11 pe-9 dark:bg-surface')}
    >
      {options.map((o) => (
        <NativeSelectOption key={o.value} value={o.value}>
          {o.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
