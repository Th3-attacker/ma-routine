import { useTranslation } from 'react-i18next'

import { TEXT_SIZES, THEME_MODES } from '@/app/device-prefs'
import { usePreferences } from '@/app/PreferencesProvider'
import { XIcon } from 'lucide-react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { ChipGroup } from './ChipGroup'
import { ThemeIcon } from './ThemeIcon'

export function SettingsDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const { lang, setLang, themeMode, setThemeMode, textSize, setTextSize } = usePreferences()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[560px]">
        <DrawerHeader className="flex-row items-center justify-between gap-2.5 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-start">
          <DrawerTitle className="font-display text-[1.3125rem] font-semibold rtl:font-bold">
            {t('settings.title')}
          </DrawerTitle>
          <DrawerClose
            aria-label={t('header.close')}
            className="grid size-11 flex-none place-items-center rounded-[12px] border border-line bg-surface text-ink-2"
          >
            <XIcon className="size-5" aria-hidden="true" />
          </DrawerClose>
          <DrawerDescription className="sr-only">{t('settings.later')}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-[calc(22px+env(safe-area-inset-bottom,0px))]">
          <section aria-labelledby="settings-device" className="flex flex-col gap-4">
            <h3 id="settings-device" className="font-display text-lg font-semibold rtl:font-bold">
              {t('settings.device')}
            </h3>
            <ChipGroup
              label={t('settings.language')}
              value={lang}
              onChange={setLang}
              options={[
                { value: 'fr', label: 'Français', lang: 'fr' },
                { value: 'ar', label: 'العربية', lang: 'ar' },
              ]}
            />
            <ChipGroup
              label={t('settings.appearance')}
              value={themeMode}
              onChange={setThemeMode}
              options={THEME_MODES.map((m) => ({
                value: m,
                label: (
                  <>
                    <ThemeIcon mode={m} />
                    {t(`theme.${m}`)}
                  </>
                ),
              }))}
            />
            <ChipGroup
              label={t('settings.textSize')}
              value={textSize}
              onChange={setTextSize}
              options={TEXT_SIZES.map((s) => ({ value: s, label: t(`size.${s}`) }))}
            />
          </section>
          <p className="text-[0.8125rem] text-muted-foreground">{t('settings.later')}</p>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
