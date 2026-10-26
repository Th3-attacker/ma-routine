import { cn } from '@/lib/utils'

/**
 * Logo rond à contour doré. Tant qu'il n'y a pas de photo (logo.jpg à la racine),
 * c'est le monogramme « SJ » (Sama Jàmm).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-[36px] flex-none place-items-center overflow-hidden rounded-full bg-primary font-display text-[14px] font-bold tracking-[-0.02em] text-primary-foreground ring-2 ring-gold',
        className,
      )}
    >
      SJ
    </span>
  )
}
