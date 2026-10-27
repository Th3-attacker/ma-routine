import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/components/Logo'

/** Écran plein du verrou : logo, nom, devise, contenu centré. Rien d'autre de l'app n'est affiché. */
export function LockLayout({ top, children }: { top?: ReactNode; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pt-[calc(12px+env(safe-area-inset-top,0px))] pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
      {top && <div className="flex justify-end">{top}</div>}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <header className="flex flex-col items-center gap-2">
          <Logo className="size-16 text-[24px] ring-[3px]" />
          <p className="flex items-baseline gap-2">
            <span dir="ltr" className="font-display text-2xl font-bold tracking-[0.01em] text-primary">
              {t('app.name')}
            </span>
            <span lang="ar" className="font-quran text-[22px] text-gold-ink">
              {t('app.nameAr')}
            </span>
          </p>
          <p className="text-center text-sm text-ink-2 italic rtl:not-italic">{t('app.tagline')}</p>
        </header>
        {children}
      </main>
    </div>
  )
}
