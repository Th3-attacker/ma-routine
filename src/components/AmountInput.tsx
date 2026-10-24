import { forwardRef, type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/** Montant en grand, avec la devise à côté ; clavier numérique, toujours de gauche à droite. */
export const AmountInput = forwardRef<HTMLInputElement, ComponentProps<'input'> & { currency: string }>(
  function AmountInput({ currency, className, ...props }, ref) {
    return (
      <div
        dir="ltr"
        className={cn(
          'flex items-baseline gap-2 rounded-[14px] border border-line bg-surface px-3.5 py-2 focus-within:border-primary has-aria-invalid:border-bad',
          className,
        )}
      >
        <input
          ref={ref}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          className="tabular w-full min-w-0 bg-transparent font-display text-[2rem] leading-tight font-semibold outline-none"
          {...props}
        />
        <span className="flex-none font-bold text-muted-foreground">{currency}</span>
      </div>
    )
  },
)
