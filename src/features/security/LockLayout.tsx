import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/components/Logo'

/**
 * Écran plein du verrou et de l'inscription, sur le ciel de nuit de la marque : logo, nom, devise, contenu centré.
 * La classe « dark » donne aux champs et au clavier les couleurs du mode sombre, lisibles sur ce ciel.
 * Rien d'autre de l'app n'est affiché.
 */
// Mêmes classes dans l'écran pré-dessiné (app/shell.ts).
export const NIGHT = 'dark min-h-dvh bg-[image:var(--sky-night)] text-foreground'

export function LockLayout({ top, children }: { top?: ReactNode; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className={NIGHT}>
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col ps-[max(16px,env(safe-area-inset-left,0px))] pe-[max(16px,env(safe-area-inset-right,0px))] pt-[calc(12px+env(safe-area-inset-top,0px))] pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
        {top && <div className="flex justify-end">{top}</div>}
        <main className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
          <header className="flex flex-col items-center gap-2">
            <Logo className="w-[72px]" />
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
    </div>
  )
}
