import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Pastille à cocher (bouton avec aria-pressed), style « chip » de la maquette. */
export function ToggleChip({
  pressed,
  onToggle,
  children,
  className,
}: {
  pressed: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[0.8125rem] font-bold text-ink-2',
        'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}
