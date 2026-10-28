import {
  ArchiveIcon,
  BellIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
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
import { NotificationSettings } from '@/push/NotificationSettings'
import { AccountSettings } from '@/sync/AccountSettings'

import { AppDrawer } from './AppDrawer'
import { ChipGroup } from './ChipGroup'
import { labelClass, SectionTitle } from './Field'
import { ThemeIcon } from './ThemeIcon'

const PAGES = [
  { id: 'profile', icon: UserRoundIcon },
  { id: 'display', icon: PaletteIcon },
  { id: 'prayer', icon: BellIcon },
  { id: 'daily', icon: BookOpenIcon },
  { id: 'account', icon: ShieldCheckIcon },
  { id: 'backup', icon: ArchiveIcon },
] as const satisfies readonly { id: string; icon: LucideIcon }[]

type PageId = (typeof PAGES)[number]['id']

export function SettingsDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const [page, setPage] = useState<PageId | null>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const lastPage = useRef<PageId | null>(null)

  // Le focus suit la navigation : sur « Retour » en entrant, sur la rubrique quittée en revenant.
  useEffect(() => {
    if (page) backRef.current?.focus()
    else if (lastPage.current) menuRef.current?.querySelector<HTMLElement>(`[data-page="${lastPage.current}"]`)?.focus()
    lastPage.current = page
  }, [page])

  return (
    <AppDrawer
      open={open}
      onOpenChange={(o) => {
        // À la fermeture, on revient à la liste des rubriques.
        if (!o) setPage(null)
        onOpenChange(o)
      }}
      title={page ? t(`settings.sections.${page}`) : t('settings.title')}
    >
      {page ? (
        <>
          <button
            ref={backRef}
            type="button"
            onClick={() => setPage(null)}
            className="-mt-2 flex min-h-11 items-center gap-1.5 self-start rounded-[12px] pe-3 font-bold text-primary"
          >
            <ChevronLeftIcon className="rtl-flip size-5" aria-hidden="true" />
            {t('settings.back')}
          </button>
          <SettingsPage page={page} onDone={() => setPage(null)} />
        </>
      ) : (
        <nav ref={menuRef} aria-label={t('settings.sections.label')}>
          <ul className="flex flex-col gap-2">
            {PAGES.map(({ id, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  data-page={id}
                  onClick={() => setPage(id)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3 text-start"
                >
                  <span className="grid size-10 flex-none place-items-center rounded-[12px] bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t(`settings.sections.${id}`)}</span>
                    <span className="block text-[0.8125rem] text-muted-foreground">
                      {t(`settings.sections.${id}Hint`)}
                    </span>
                  </span>
                  <ChevronRightIcon className="rtl-flip size-5 flex-none text-ink-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </AppDrawer>
  )
}

function SettingsPage({ page, onDone }: { page: PageId; onDone: () => void }) {
  const { t } = useTranslation()
  const settings = useSettings()

  if (page === 'display') return <DisplaySettings />
  if (page === 'account')
    return (
      <>
        <AccountSettings />
        <SecuritySettings />
      </>
    )
  if (!settings) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label={t('common.loading')}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    )
  }
  if (page === 'prayer')
    return (
      <>
        <NotificationSettings settings={settings} />
        <CallSettings settings={settings} />
      </>
    )
  if (page === 'backup')
    return (
      <>
        <BackupSettings settings={settings} />
        <AboutSettings />
      </>
    )
  return <SettingsForm settings={settings} part={page} onSaved={onDone} />
}

/** Préférences de cet appareil (jamais synchronisées), et l'aperçu du mode Ramadan. */
function DisplaySettings() {
  const { t } = useTranslation()
  const { lang, setLang, themeMode, setThemeMode, textSize, setTextSize } = usePreferences()
  const settings = useSettings()
  const ramadanId = useId()

  return (
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
  )
}
