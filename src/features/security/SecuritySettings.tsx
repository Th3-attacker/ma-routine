import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { SectionTitle } from '@/components/Field'
import { PinPad } from '@/components/PinPad'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/db/settings'
import type { LockDelay } from '@/db/types'
import { formatWait } from '@/lib/dates'
import { usePreferences } from '@/app/PreferencesProvider'

import { biometricAvailable, disableBiometric, enableBiometric } from './biometric'
import { CreatePin } from './CreatePin'
import { getSecurity, setLockDelay, verifyPin } from './pin'

const DELAYS: readonly LockDelay[] = [0, 1, 5, 15]

/** Réglages → Sécurité : changer le code, délai de verrouillage, phrase d'information. */
export function SecuritySettings() {
  const { t } = useTranslation()
  const security = useLiveQuery(getSecurity)
  const [changing, setChanging] = useState(false)

  return (
    <section aria-labelledby="settings-security" className="flex flex-col gap-4">
      <SectionTitle id="settings-security">{t('security.title')}</SectionTitle>
      <Button variant="secondary" className="h-11 rounded-[14px] font-bold" onClick={() => setChanging(true)}>
        {t('security.change')}
      </Button>
      {security && (
        <ChipGroup
          label={t('security.delay')}
          value={String(security.lockAfterMin)}
          onChange={(v) => void setLockDelay(Number(v) as LockDelay)}
          options={DELAYS.map((d) => ({ value: String(d), label: t(`security.delay${d}`) }))}
        />
      )}
      {security && <BiometricToggle enabled={!!security.passkey} />}
      <p className="text-[0.8125rem] text-muted-foreground">{t('security.info')}</p>
      <AppDrawer open={changing} onOpenChange={setChanging} title={t('security.change')}>
        <ChangePin
          onDone={() => {
            setChanging(false)
            toast(t('security.changed'))
          }}
        />
      </AppDrawer>
    </section>
  )
}

/** Ancien code, puis le nouveau deux fois. */
function ChangePin({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState<string>()

  if (verified) return <CreatePin onDone={onDone} />
  return (
    <PinPad
      title={t('security.old')}
      message={message}
      error={!!message}
      onComplete={async (pin) => {
        const r = await verifyPin(pin)
        if (r.ok) {
          setVerified(true)
          return true
        }
        setMessage(
          r.lockedUntil ? t('lock.wait', { time: formatWait(r.lockedUntil - Date.now(), lang) }) : t('lock.wrong'),
        )
        return false
      }}
    />
  )
}

/** Empreinte ou visage : seulement si le téléphone en est capable. Le code reste toujours possible. */
function BiometricToggle({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const id = useId()
  const [available, setAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    void biometricAvailable().then(setAvailable)
  }, [])
  if (!available && !enabled) return null

  async function toggle(on: boolean) {
    setBusy(true)
    try {
      if (!on) {
        await disableBiometric()
        toast(t('security.biometricOff'))
      } else if (await enableBiometric(settings?.name ?? '', t('app.name'))) {
        toast(t('security.biometricOn'))
      } else {
        toast(t('security.biometricFailed'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3">
      <label htmlFor={id} className="min-w-0 flex-1">
        <span className="block font-bold">{t('security.biometric')}</span>
        <span className="block text-[0.8125rem] text-muted-foreground">{t('security.biometricHint')}</span>
      </label>
      <Switch
        id={id}
        checked={enabled}
        disabled={busy}
        onCheckedChange={(v) => void toggle(v)}
        className="data-checked:bg-ok"
      />
    </div>
  )
}
