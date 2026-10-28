import { cn } from '@/lib/utils'

import { BRAND_MARK_SVG } from './brand-mark'

/** Symbole de la marque (arche, soleil, étoile). Décoratif : le nom de l'app est toujours écrit à côté. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block w-[40px] flex-none', className)}
      dangerouslySetInnerHTML={{ __html: BRAND_MARK_SVG }}
    />
  )
}
