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

/** Volet du bas d'ELHADJ : titre à gauche, bouton Fermer, contenu défilant, safe area respectée. */
export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** Sous-titre visible ; sinon une description masquée pour les lecteurs d'écran. */
  description?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[560px]">
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
        <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-[calc(22px+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
