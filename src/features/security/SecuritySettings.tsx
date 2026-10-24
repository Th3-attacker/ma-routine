import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/AppDrawer'
import { ChipGroup } from '@/components/ChipGroup'
import { SectionTitle } from '@/components/Field'
import { PinPad } from '@/components/PinPad'
import { Button } from '@/components/ui/button'
import type { LockDelay } from '@/db/types'
import { formatWait } from '@/lib/dates'
import { usePreferences } from '@/app/PreferencesProvider'

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
