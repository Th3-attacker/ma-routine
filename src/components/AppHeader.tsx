import { useTranslation } from 'react-i18next'

import { nextThemeMode } from '@/app/device-prefs'
import { usePreferences } from '@/app/PreferencesProvider'
import { cn } from '@/lib/utils'

import { SlidersIcon } from './icons'
import { Logo } from './Logo'
import { ThemeIcon } from './ThemeIcon'

// L'en-tête est en px (et non en rem) : il ne grossit pas avec la taille du texte et ne déborde jamais.
const iconBtn =
  'grid size-[44px] flex-none place-items-center rounded-[12px] border border-line bg-surface text-ink-2 [&_svg]:size-[19px]'

export function AppHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { t } = useTranslation()
  const { lang, setLang, themeMode, setThemeMode } = usePreferences()
  const isAr = lang === 'ar'

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 flex items-center justify-between gap-1.5 bg-background pt-3 pb-2.5">
      <div className="flex min-w-0 items-center gap-[7px]">
        <Logo />
        {/* Sous 420 px, le nom arabe passe sous le nom latin pour ne pas être coupé. */}
        <p className="flex min-w-0 items-center gap-[7px] max-[419px]:flex-col max-[419px]:items-start max-[419px]:gap-0">
          <span
            dir="ltr"
            className="flex-none font-display text-[20px] leading-tight font-bold tracking-[0.01em] text-primary"
          >
            {t('app.name')}
          </span>
          <span
            lang="ar"
            dir="rtl"
            className="max-w-full min-w-0 truncate font-quran text-[19px] leading-tight text-gold-ink max-[419px]:text-[15px]"
          >
            {t('app.nameAr')}
          </span>
        </p>
      </div>
      <div className="flex flex-none items-center gap-1">
        <button
          type="button"
          className={cn(iconBtn, isAr ? 'text-[13px] font-extrabold' : 'pb-[3px] font-quran text-[19px] font-bold')}
          lang={isAr ? 'fr' : 'ar'}
          aria-label={t('header.switchLang')}
          onClick={() => setLang(isAr ? 'fr' : 'ar')}
        >
          {isAr ? 'FR' : 'ع'}
        </button>
        <button
          type="button"
          className={iconBtn}
          aria-label={t('header.appearance', { mode: t(`theme.${themeMode}`) })}
          onClick={() => setThemeMode(nextThemeMode(themeMode))}
        >
          <ThemeIcon mode={themeMode} />
        </button>
        <button type="button" className={iconBtn} aria-label={t('header.settings')} onClick={onOpenSettings}>
          <SlidersIcon />
        </button>
      </div>
    </header>
  )
}
