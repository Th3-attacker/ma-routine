import { cn } from '@/lib/utils'

/**
 * Logo rond à contour doré. Tant qu'il n'y a pas de photo (logo.jpg à la racine),
 * c'est le monogramme « E » de la maquette.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-[36px] flex-none place-items-center overflow-hidden rounded-full bg-primary font-display text-[17px] font-bold text-primary-foreground ring-2 ring-gold',
        className,
      )}
    >
      E
    </span>
  )
}
