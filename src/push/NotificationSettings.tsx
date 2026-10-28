import { ShareIcon, SquarePlusIcon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { usePreferences } from '@/app/PreferencesProvider'
import { ChipGroup } from '@/components/ChipGroup'
import { labelClass, SectionTitle } from '@/components/Field'
import { subClass } from '@/components/Section'
import { ToggleChip } from '@/components/ToggleChip'
import { Switch } from '@/components/ui/switch'
import { updateSettings } from '@/db/settings'
import { PRAYERS, type NotifSettings, type Settings } from '@/db/types'
import { usePrayerName } from '@/features/prayer/usePrayerName'
import { useSession } from '@/sync/auth'
import { cn } from '@/lib/utils'

import { currentSubscription, disablePush, enablePush, pushSupport } from './subscribe'

const BEFORE = ['0', '5', '10', '15'] as const
const REMINDERS = ['fridayKahf', 'athkarMatin', 'athkarSoir', 'suhur', 'iftar'] as const

/** Réglages → Notifications (enregistré tout de suite, synchronisé avec le compte pour le serveur). */
export function NotificationSettings({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const { session } = useSession()
  const prayerName = usePrayerName()
  const switchId = useId()
  const support = pushSupport()
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const n = settings.notif
  const set = (patch: Partial<NotifSettings>) => void updateSettings((s) => ({ notif: { ...s.notif, ...patch } }))

  useEffect(() => {
    void currentSubscription().then((s) => setSubscribed(!!s))
  }, [])

  async function toggle(on: boolean) {
    setBusy(true)
    try {
      if (on) {
        const ok = await enablePush(lang)
        if (!ok) {
          toast(Notification.permission === 'denied' ? t('notif.denied') : t('notif.error'))
          return
        }
        set({ enabled: true })
        setSubscribed(true)
        toast(t('notif.enabled'))
      } else {
        await disablePush()
        set({ enabled: false })
        setSubscribed(false)
      }
    } catch {
      toast(t('notif.error'))
    } finally {
      setBusy(false)
    }
  }

  const active = n.enabled && !!subscribed
  return (
    <section aria-labelledby="settings-notif" className="flex flex-col gap-4">
      <SectionTitle id="settings-notif">{t('notif.title')}</SectionTitle>
      {support === 'disabled' ? (
        <p className={subClass}>{t('notif.disabled')}</p>
      ) : support === 'ios-not-installed' ? (
        <IosInstallGuide />
      ) : support === 'unsupported' ? (
        <p className={subClass}>{t('notif.unsupported')}</p>
      ) : !session ? (
        <p className="rounded-lg bg-warn-soft p-3 text-[0.8125rem] text-ink-2">{t('notif.needAccount')}</p>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
            <label htmlFor={switchId} className="min-w-0 flex-1">
              <span className="block font-bold">{t('notif.enable')}</span>
              <span className="block text-[0.8125rem] text-muted-foreground">{t('notif.enableHint')}</span>
            </label>
            <Switch
              id={switchId}
              checked={active}
              disabled={busy || subscribed === null}
              onCheckedChange={(v) => void toggle(v)}
              className="data-checked:bg-ok"
            />
          </div>
          <fieldset disabled={!active} className={cn('flex min-w-0 flex-col gap-4', !active && 'opacity-60')}>
            <fieldset className="flex min-w-0 flex-col gap-[7px]">
              <legend className={cn(labelClass, 'mb-[7px]')}>{t('notif.prayers')}</legend>
              <ul className="flex flex-wrap gap-1.5">
                {PRAYERS.map((p) => (
                  <li key={p}>
                    <ToggleChip
                      pressed={n.prayers[p]}
                      onToggle={() => set({ prayers: { ...n.prayers, [p]: !n.prayers[p] } })}
                    >
                      {prayerName(p)}
                    </ToggleChip>
                  </li>
                ))}
              </ul>
            </fieldset>
            <ChipGroup
              label={t('notif.before')}
              value={String(n.minutesBefore) as (typeof BEFORE)[number]}
              onChange={(v) => set({ minutesBefore: Number(v) as NotifSettings['minutesBefore'] })}
              options={BEFORE.map((v) => ({
                value: v,
                label: v === '0' ? t('notif.atTime') : t('notif.minutesBefore', { n: v }),
              }))}
            />
            <fieldset className="flex min-w-0 flex-col gap-[7px]">
              <legend className={cn(labelClass, 'mb-[7px]')}>{t('notif.reminders')}</legend>
              <ul className="flex flex-wrap gap-1.5">
                {REMINDERS.map((k) => (
                  <li key={k}>
                    <ToggleChip pressed={n[k]} onToggle={() => set({ [k]: !n[k] })}>
                      {t(`notif.${k}`)}
                    </ToggleChip>
                  </li>
                ))}
              </ul>
            </fieldset>
          </fieldset>
        </>
      )}
    </section>
  )
}

/** iPhone : les notifications ne marchent qu'avec l'app ajoutée à l'écran d'accueil (iOS 16.4+). */
function IosInstallGuide() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-gold-soft p-4">
      <h4 className="font-bold">{t('notif.iosTitle')}</h4>
      <ol className="flex list-decimal flex-col gap-2 ps-5 text-[0.84375rem] text-ink-2">
        <li>{t('notif.ios1')}</li>
        <li>
          <span className="inline-flex items-center gap-1.5">
            {t('notif.ios2')}
            <ShareIcon className="size-5 flex-none text-primary" aria-hidden="true" />
          </span>
        </li>
        <li>
          <span className="inline-flex items-center gap-1.5">
            {t('notif.ios3')}
            <SquarePlusIcon className="size-5 flex-none text-primary" aria-hidden="true" />
          </span>
        </li>
        <li>{t('notif.ios4')}</li>
      </ol>
    </div>
  )
}
