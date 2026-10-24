import type { ReactNode } from 'react'

import { Logo } from '@/components/Logo'

/** Écran plein du verrou : logo, ELHADJ / الحاج, contenu centré. Rien d'autre de l'app n'est affiché. */
export function LockLayout({ top, children }: { top?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pt-[calc(12px+env(safe-area-inset-top,0px))] pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
      {top && <div className="flex justify-end">{top}</div>}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <header className="flex flex-col items-center gap-2">
          <Logo className="size-16 text-[30px] ring-[3px]" />
          <p className="flex items-baseline gap-2">
            <span dir="ltr" className="font-display text-2xl font-bold tracking-[0.04em] text-primary">
              ELHADJ
            </span>
            <span lang="ar" className="font-quran text-[22px] text-gold">
              الحاج
            </span>
          </p>
        </header>
        {children}
      </main>
    </div>
  )
}
