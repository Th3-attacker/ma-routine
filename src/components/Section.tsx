import { useId, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Section titrée (h2) avec une action ou une info à droite, comme `.sec .h` dans la maquette. */
export function Section({
  title,
  aside,
  className,
  children,
}: {
  title: ReactNode
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex items-baseline justify-between gap-2.5">
        <h2 id={id} className="font-display text-lg font-semibold rtl:font-bold">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export const linkClass = 'text-[0.8125rem] font-bold text-primary min-h-11 inline-flex items-center'
export const subClass = 'text-[0.8125rem] text-muted-foreground'
export const cardClass = 'rounded-xl bg-card p-4 shadow-card'

/** Barre de progression fine de la maquette (`.bar`). */
export function Bar({ value, className, fill }: { value: number; className?: string; fill?: string }) {
  return (
    <span className={cn('block h-2 overflow-hidden rounded-full bg-surface-2', className)} aria-hidden="true">
      <i
        className={cn('block h-full rounded-full transition-[width] duration-300', fill ?? 'bg-primary')}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </span>
  )
}
