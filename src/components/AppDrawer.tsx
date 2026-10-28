import { XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  tall,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** Sous-titre visible ; sinon une description masquée pour les lecteurs d'écran. */
  description?: ReactNode
  /** Hauteur fixe (85 % de l'écran) : le volet ne change pas de taille quand son contenu change (Réglages). */
  tall?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    // handleOnly : seule la poignée du haut déplace le volet ; faire défiler le contenu ne le fait plus bouger.
    <Drawer open={open} onOpenChange={onOpenChange} handleOnly>
      <DrawerContent className={cn('mx-auto max-w-[560px] overflow-hidden', tall && 'h-[85dvh]')}>
        <DrawerHeader className="flex-row items-center justify-between gap-2.5 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-start">
          <div className="flex min-w-0 flex-col gap-0.5">
            <DrawerTitle className="font-display text-[1.3125rem] font-semibold [overflow-wrap:anywhere] rtl:font-bold">
              {title}
            </DrawerTitle>
            <DrawerDescription className={description ? 'text-[0.8125rem]' : 'sr-only'}>
              {description ?? title}
            </DrawerDescription>
          </div>
          <DrawerClose
            aria-label={t('header.close')}
            className="grid size-11 flex-none place-items-center rounded-[12px] border border-line bg-surface text-ink-2"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>
        {/* Défilement vertical seulement, sans rebond qui entraîne la page derrière. */}
        <div className="flex min-h-0 flex-1 touch-pan-y flex-col gap-6 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-[calc(22px+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
