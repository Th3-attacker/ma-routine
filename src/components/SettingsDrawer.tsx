import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { TEXT_SIZES, THEME_MODES } from '@/app/device-prefs'
import { usePreferences } from '@/app/PreferencesProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { updateSettings, useSettings } from '@/db/settings'
import { AboutSettings, BackupSettings } from '@/features/backup/BackupSettings'
import { CallSettings } from '@/features/call/CallSettings'
import { SecuritySettings } from '@/features/security/SecuritySettings'
import { SettingsForm } from '@/features/settings/SettingsForm'
import { AccountSettings } from '@/sync/AccountSettings'

import { AppDrawer } from './AppDrawer'
import { ChipGroup } from './ChipGroup'
import { labelClass, SectionTitle } from './Field'
import { ThemeIcon } from './ThemeIcon'

export function SettingsDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const { lang, setLang, themeMode, setThemeMode, textSize, setTextSize } = usePreferences()
  const settings = useSettings()
  const ramadanId = useId()

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title={t('settings.title')}>
      <section aria-labelledby="settings-device" className="flex flex-col gap-4">
        <SectionTitle id="settings-device">{t('settings.device')}</SectionTitle>
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
        <div className="flex flex-col gap-[7px]">
          <span className={labelClass}>{t('settings.ramadan')}</span>
          <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
            <label htmlFor={ramadanId} className="min-w-0 flex-1">
              <span className="block font-bold">{t('settings.ramadanPreview')}</span>
              <span className="block text-[0.8125rem] text-muted-foreground">{t('settings.ramadanHint')}</span>
            </label>
            <Switch
              id={ramadanId}
              checked={settings?.ramadanPreview ?? false}
              disabled={!settings}
              onCheckedChange={(v) => void updateSettings({ ramadanPreview: v })}
              className="data-checked:bg-ok"
            />
          </div>
        </div>
      </section>
      {settings ? (
        <SettingsForm settings={settings} onSaved={() => onOpenChange(false)} />
      ) : (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label={t('common.loading')}>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
      {settings && <CallSettings settings={settings} />}
      <AccountSettings />
      <SecuritySettings />
      {settings && <BackupSettings settings={settings} />}
      <AboutSettings />
      <p className="text-[0.8125rem] text-muted-foreground">{t('settings.later')}</p>
    </AppDrawer>
  )
}
