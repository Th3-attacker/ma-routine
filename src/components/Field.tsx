import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { translateError } from '@/lib/errors'
import { cn } from '@/lib/utils'

/** Classe commune des champs (style « input » de la maquette, 44 px de haut, 16 px pour éviter le zoom iOS). */
export const inputClass =
  'h-11 rounded-[12px] border-line bg-surface px-3 text-base dark:bg-surface md:text-base aria-invalid:border-bad'

export const labelClass =
  'text-[0.71875rem] font-extrabold tracking-[0.07em] text-ink-2 uppercase rtl:text-[0.8125rem] rtl:tracking-normal rtl:normal-case'

type ControlProps = { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** Étiquette + champ + aide + erreur traduite, reliés pour les lecteurs d'écran. */
export function Field({
  label,
  hint,
  errors,
  className,
  children,
}: {
  label: ReactNode
  hint?: ReactNode
  errors?: readonly unknown[]
  className?: string
  children: (props: ControlProps) => ReactNode
}) {
  const { t } = useTranslation()
  const id = useId()
  const error = errors?.length ? translateError(t, errors[0]) : ''
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex min-w-0 flex-col gap-[7px]', className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[0.8125rem] font-semibold text-bad">
          {error}
        </p>
      )}
    </div>
  )
}

/** Titre de section dans un Drawer. */
export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="font-display text-lg font-semibold rtl:font-bold">
      {children}
    </h3>
  )
}
