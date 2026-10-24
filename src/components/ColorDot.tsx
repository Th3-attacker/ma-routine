import { cn } from '@/lib/utils'

/** Pastille de couleur d'une catégorie ou d'un projet ; `color` est un token comme '--c3'. */
export function ColorDot({ color, className }: { color: string; className?: string }) {
  return (
    <i
      aria-hidden="true"
      className={cn('inline-block size-2.5 flex-none rounded-full', className)}
      style={{ background: `var(${color})` }}
    />
  )
}
