import { cn } from '@/lib/utils'

/** Anneau de progression (SVG) ; `size` = rayon dans un viewBox carré. */
export function ProgressRing({
  value,
  r,
  stroke,
  className,
  trackClass = 'stroke-surface-2',
  fillClass = 'stroke-primary',
}: {
  value: number
  r: number
  stroke: number
  className?: string
  trackClass?: string
  fillClass?: string
}) {
  const box = (r + stroke) * 2
  const c = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${box} ${box}`} className={cn('-rotate-90', className)} aria-hidden="true">
      <circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
      <circle
        cx={box / 2}
        cy={box / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c.toFixed(2)}
        strokeDashoffset={(c * (1 - Math.min(1, Math.max(0, value)))).toFixed(2)}
        className={cn('transition-[stroke-dashoffset] duration-200', fillClass)}
      />
    </svg>
  )
}
