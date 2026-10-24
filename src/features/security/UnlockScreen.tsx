import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferences } from '@/app/PreferencesProvider'
import { PinPad } from '@/components/PinPad'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { formatWait } from '@/lib/dates'

import { LockLayout } from './LockLayout'
import { getSecurity, verifyPin, wipeDevice } from './pin'

/** Déverrouillage : salutation, 4 ronds, clavier ; paliers d'attente avec compte à rebours ; « Code oublié ? ». */
export function UnlockScreen({ name, onUnlock }: { name: string; onUnlock: () => void }) {
  const { t } = useTranslation()
  const { lang } = usePreferences()
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [wrong, setWrong] = useState(false)
  const [forgot, setForgot] = useState<0 | 1 | 2>(0)

  // L'attente enregistrée survit au rechargement de la page.
  useEffect(() => {
    void getSecurity().then((s) => setLockedUntil(s.lockedUntil))
  }, [])
  const waiting = lockedUntil > now
  useEffect(() => {
    if (!waiting) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [waiting])

  const waitText = formatWait(lockedUntil - now, lang)

  return (
    <LockLayout>
      <h1 className="text-center font-display text-2xl font-semibold rtl:font-bold">
        {name ? t('today.salamName', { name }) : t('today.salam')}
      </h1>
      <PinPad
        title={t('lock.unlockHint')}
        message={waiting ? t('lock.wait', { time: waitText }) : wrong ? t('lock.wrong') : undefined}
        error={waiting || wrong}
        disabled={waiting}
        onComplete={async (pin) => {
          const r = await verifyPin(pin)
          if (r.ok) {
            onUnlock()
            return true
          }
          setWrong(true)
          setLockedUntil(r.lockedUntil)
          setNow(Date.now())
          return false
        }}
      />
      <Button variant="link" className="h-11 font-bold" onClick={() => setForgot(1)}>
        {t('lock.forgot')}
      </Button>

      <AlertDialog open={forgot > 0} onOpenChange={(o) => !o && setForgot(0)}>
        <AlertDialogContent>
          {forgot === 1 ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('lock.forgotTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('lock.forgotNoAccount')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-11">{t('lock.cancel')}</AlertDialogCancel>
                <Button className="h-11" onClick={() => setForgot(2)}>
                  {t('lock.forgotContinue')}
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('lock.wipeTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('lock.wipeBody')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-11">{t('lock.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    void wipeDevice().then(() => location.reload())
                  }}
                >
                  {t('lock.wipe')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </LockLayout>
  )
}
